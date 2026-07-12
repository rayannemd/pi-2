from langchain_groq import ChatGroq
from langgraph.graph import StateGraph, START, END
from typing import TypedDict, Literal
import json
from vector_database import add_data_to_vector_database, search_in_documents

from services.playbook import load_playbook, read_playbook

model = ChatGroq(model="llama-3.3-70b-versatile", temperature=1)


class InstructionState(TypedDict):
    intention: Literal['proximo_passo', 'em_execucao']


class PromptType(TypedDict):
    type: Literal['chat', 'consulta_plano', 'pagamento_plano', 'status_pagamento', 'finalizado', 'problema', 'internet_lenta']

class IssueClassification(TypedDict):
    issue: Literal['suporte', 'técnico', 'financeiro', 'none']

class IssueDetails(TypedDict):
    type: Literal['suporte', 'técnico', 'financeiro']
    issue: str
    solution: str


class MyState(TypedDict):
    message: str
    classification: PromptType
    issue_classification: IssueClassification
    summary: str
    answer: str

    playbook: str
    currentStep: int

    timedOut: bool
    test: str


system_instruction_chat = f"""Você é um assistente virtual da provedora de internet PLANETA NET e deve responder APENAS perguntas que possuam relação com o serviço de internet. Seja sempre gentil, amigável e responda o usuário de forma resumida. NÃO responda ou dê soluções de assuntos que não sejam sobre internet.

<exemplos>
Estou com um problema na minha internet, ela está caindo o tempo todo. (Responder com solução)
Minha internet está caindo o tempo todo e quero derrotar o Ender Dragon, como faço? (Ignorar a parte do Ender Dragon e responder apenas sobre a internet.)

"""

system_instruction_issue = f"""Você é um assistente virtual da provedora de internet PLANETA NET e deve responder APENAS perguntas que possuam relação com o serviço de internet. Sua tarefa é solucionar o problema do usuário propondo soluções com base no histórico de mensagens e oferecendo soluções que já funcionaram com outros clientes. Seja sempre gentil e amigável. NÃO responda ou dê soluções de assuntos que não sejam sobre internet. Sempre responda oferecendo APENAS UMA solução por vez. Ofereça UMA solução que não tenha sido oferecida anteriormente com base no resumo da conversa.

<exemplos>
Estou com um problema na minha internet, ela está caindo o tempo todo. (Responder com solução)
Minha internet está caindo o tempo todo e quero derrotar o Ender Dragon, como faço? (Ignorar a parte do Ender Dragon e responder apenas sobre a internet.)

"""

async def user_input(state: MyState):
    if not state.get('summary'):
        return {'summary': f"user: {state['message']}\n"}
    else:
        return {'summary': state['summary'] + f"user: {state['message']}\n"}

async def finished_router(state: MyState):
    return state['timedOut']

async def issue_classification(state: MyState):
    last_messages = state['summary']

    issue_classification_prompt = f"""
        {last_messages}

        Se o histórico da conversa apresentar problemas relacionados à parte financeira dos serviços da provedora de internet, como problemas com pagamento do plano ou cobrança indevida, classifique como 'financeiro'.

        Se o resumo da conversa apresentar problemas relacionados à parte técnica dos serviços da provedora de internet, como problemas de equipamento, lentidão ou instabilidade de sinal, classifique como 'técnico'.

        Se o resumo da conversa apresentar problemas relacionados à parte de suporte dos serviços da provedora de internet, como atendimento ineficiente ou prazos longos para a visita técnica, classifique como 'suporte'.

        Caso contrário, classifique como 'none'.
    """

    classifier_model = model.with_structured_output(IssueClassification)

    analysis = await classifier_model.ainvoke([{"role": "user", "content": issue_classification_prompt}])

    if state['timedOut']:
        return {"issue_classification": analysis}
    
    # Se não foi timeout, classificaremos como um problema resolvido.
    else:
        last_messages = state['summary']

        prompt = f"""
            Histórico de mensagens: {last_messages} 

            Tipo de problema encontrado: {analysis}

            Com base no problema do cliente e solução do assistente, defina qual o problema específico enfrentado pelo cliente e qual a solução que resolveu o problema. Evite definições ambíguas, descreva exatamente o problema e a solução que resolveu.
        """
        classifier_model = model.with_structured_output(IssueDetails)

        response = await classifier_model.ainvoke([{"role":"user", "content": prompt}])
        await add_data_to_vector_database(response['issue'], response['solution'])
        return {"issue_classification": analysis}

# async def summary_to_model(state: MyState):
#     if(state.get("summary", "") == ""):
#         summary = await model.ainvoke([{"role": "user", "content": f"Mensagem do usuário: {state['message']}\nBaseado nessa mensagem, responda apenas com um título breve para a conversa."}])
#     else:
#         summary = await model.ainvoke([{"role": "user", "content": f"""
#         Crie um resumo para uma conversa entre um assistente virtual de uma provedora de internet e um cliente. Você deve criar um resumo detalhado que compreenda as informações principais da conversa. O resumo deve conter de maneira explícita os problemas do cliente.
                                        
#         Exemplo:
#         Prompt atual: Minha internet está caindo
                                        
#         Resumo da conversa até agora: O usuário cumprimentou o assistente com um "oi", o assistente respondeu que sim e estava disposto a ajudar com problemas na internet.
                                        
#         Seu resumo:
#         O usuário iniciou a conversa cumprimentando o assistente com um "oi" e o assistente respondeu que estava disposto a ajudar com a internet. Em seguida, o usuário relatou que a sua internet está caindo (sofrendo de instabilidade). 
                                        
#         Agora faça para os seguintes dados:
                                        
#         Prompt atual: {state['message']}

#         Resumo da conversa até agora: {state['summary']}.
#         """}])

#     return {"summary":summary.content}

async def router(state: MyState):
    last_messages = state["summary"]

    classification_prompt = f"""
    Histórico de mensagens: {last_messages}

    Mensagem do usuário: {state['message']}

    Se o usuário informar que deseja consultar seu plano de internet atual, classifique como 'consulta_plano'.

    Se o usuário deseja saber ou consultar o status ou a situação de um pagamento ou cobrança já gerada (ex.: "meu pagamento já caiu?", "qual o status da cobrança?"), classifique como 'status_pagamento'.

    Se o usuário NÃO informar nenhuma dificuldade, mas deseja realizar o pagamento do seu plano de internet, classifique como 'pagamento_plano'.

    Se o usuário informar que a sua conexão de internet está lenta ou o assistente tiver proposto anteriormente uma solução para internet lenta e o usuário estiver no processo para solucionar seguindo os passos do assistente, classifique como 'internet_lenta'.

    Se o usuário informar que o problema foi resolvido e no resumo da conversa realmente existir um problema citado anteriormente, classifique como 'finalizado'.

    Caso não se encaixe em nenhuma das opções acima, classifique como 'chat'.
    
    """
    model_classifier = model.with_structured_output(PromptType)
    classification = await model_classifier.ainvoke([{"role": "user", "content": classification_prompt}])
    return {"classification": classification}

async def define_route(state: MyState):
    return state['classification']["type"]


async def output(state: MyState):
    return {"answer": "None"}


async def answer(state: MyState):
    last_messages = state["summary"]

    # Busca um playbook para a classificação atual. Caso não encontre, o agente responderá com o que sabe.
    playbook_to_load = state.get('classification')
    playbook = load_playbook(playbook_to_load['type'])

    print(f"---------\nPLAYBOOK: {playbook}\n------------\nPlaybook_to_load: {playbook_to_load['type']}\n------------\n")

    if state['classification']['type'] == 'chat' or playbook == None:
        answer_system_instruction = f"""
        {system_instruction_chat}

        Histórico da conversa: {state['summary']}
        
        Use o histórico da conversa com o usuário para responder de maneira eficiente."""

        answer = await model.ainvoke([{"role": "system", "content": answer_system_instruction}, {"role": "user", "content": state["message"]}])

        return {"answer": answer.content, "summary":state['summary'] + f"assistant: {answer.content}\n"}
    

    # Caso o playbook de fato exista e o cliente esteja enfrentando um problema que pode ser classificado.
    else:
        instruction_userstate = f"""
            Histórico de mensages: {state['summary']}

            Mensagem do usuário: {state['message']}

            Com base no histórico de mensagens e na mensagem do usuário, classifique a mensagem do usuário seguindo as regras:

            Se o usuário informar que concluiu a instrução proposta pelo assistente, ou que deseja saber qual o próximo passo/instrução, classifique como 'proximo_passo'.

            Caso contrário, classifique como 'em_execucao'.
        """

        model_classifier = model.with_structured_output(InstructionState)
        classification = await model_classifier.ainvoke([{"role": "user", "content": instruction_userstate}])

        print(f"\n\nATÉ O MOMENTO: Classificacao: {state['classification']['type']}\n\nIntention: {classification}")

        #Sempre começa da primeira instrução, por padrão.
        nextStep = 1

        print(f"""
              
        < -------------------------------------------------------- >
              
        GetPlaybook: {state.get('playbook')}

        ClassificationType: {state['classification']['type']}

        < -------------------------------------------------------- >

        """)


        if state.get('playbook') and state.get('playbook') == state['classification']['type']:
            print("ENTROU AQUI PAIZAO DA CROACIA!!")
            if classification['intention'] == 'proximo_passo':
                print("ENTROU AQUI PAIZAO DA CROACIA!! FAMOSO!!!!")
                nextStep = state['currentStep'] + 1

        print(f"VALOR DE NEXTSTEP: {nextStep}")
        instruction = read_playbook(nextStep, playbook)

        print(f"\n\n\nINSTRUCAO: {instruction}\n\n\n")

        if instruction != '\n\nPROXIMO PASSO DO FLUXO GERAL\n\n':
            return {"answer": instruction, "summary":state['summary'] + f"assistant: {instruction}\n"}


        test = await search_in_documents(state['message'])

        answer_system_instruction = f"""
        {system_instruction_issue}
        """
        if test != "None":
            prompt = f"""
                Soluções que funcionaram com outros usuários: {test}

                Com base nisso, proponha uma solução para o problema do usuário com base no histórico de conversa:
                {last_messages}
            """
        else:
            prompt = f"""
                Histórico de mensagnes:
                {last_messages}

                Proponha uma solução para o seguinte problema do usuário:
                {state['message']}
            """

        answer = await model.ainvoke([{"role": "system", "content": answer_system_instruction}, {"role": "user", "content": prompt}])

        #summary = f"{state['summary']}\nSolução proposta pelo assistente: {answer.content}\n"

        return {"answer": answer.content, "summary":state['summary'] + f"assistant: {answer.content}\n", "test": test}



graph = StateGraph(state_schema=MyState)

graph.add_node("user_input", user_input)
graph.add_node("finished_router", finished_router)
graph.add_node("issue_classification", issue_classification)
graph.add_node("router", router)
graph.add_node("define_route", define_route)
#graph.add_node("summary", summary_to_model)
graph.add_node("answer", answer)
graph.add_node("output", output)

graph.add_edge(START, "user_input")
graph.add_conditional_edges("user_input", finished_router, {True: "issue_classification", False: "router"})
graph.add_edge("issue_classification", "answer")
#graph.add_edge("summary", "router")
#graph.add_conditional_edges("router", lambda state: state['classification']['type'] if state['classification']['type'] == 'chat' else 'output',{'chat': 'answer', 'output': 'output'})

graph.add_conditional_edges("router", define_route, {'chat': 'answer', 'internet_lenta': 'answer', 'pagamento_plano': 'output', 'consulta_plano': 'output', 'status_pagamento': 'output', 'finalizado':'issue_classification'})

graph.add_edge("output", END)
graph.add_edge("answer", END)

graph_compiled = graph.compile()

async def prompt_to_agent(data: dict):
    return await graph_compiled.ainvoke(data)