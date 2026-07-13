from langchain_groq import ChatGroq
from langgraph.graph import StateGraph, START, END
from typing import TypedDict, Literal
import json
from vector_database import add_data_to_vector_database, search_in_documents

from services.playbook import load_playbook, read_playbook

model = ChatGroq(model="llama-3.3-70b-versatile", temperature=1)


class InstructionState(TypedDict):
    intention: Literal['primeiro_passo', 'proximo_passo', 'em_execucao']


class PromptType(TypedDict):
    type: Literal['chat', 'consulta_plano', 'pagamento_plano', 'status_pagamento', 'finalizado', 'problema', 'internet_lenta', 'internet_queda', 'cancelamento', 'problema']

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
    lastMessage: str
    answer: str


    playbook: str
    currentStep: int

    timedOut: bool
    test: str


system_instruction_chat = f"""
Você é o assistente virtual da PLANETA NET.
Contato: 0800 085 7777.
Responda somente assuntos relacionados à internet.
Seja gentil, claro e breve.
Não responda assuntos fora do serviço de internet.
"""

system_instruction_issue = """
Você é o suporte técnico da PLANETA NET.
Contato: 0800 085 7777.
Resolva problemas de internet com respostas simples e amigáveis.
Use soluções já conhecidas quando existirem.
Não trate assuntos fora de internet.
Não peça configurações avançadas e não ofereça técnico.
Dê apenas uma solução por vez.
"""

async def user_input(state: MyState):
    if not state.get('summary'):
        return {'summary': f"Usuário: {state['message']}\n"}
    else:
        return {'summary': state['summary'] + f"Usuário: {state['message']}\n"}

async def finished_router(state: MyState):
    return state['timedOut']

async def issue_classification(state: MyState):
    last_messages = state['summary']

    issue_classification_prompt = f"""
        {last_messages}

        Classifique em apenas um desses tipos:
        - técnico
        - suporte
        - financeiro
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

    Playbook atual: {state.get('playbook')}

    Classifique em:
    consulta_plano
    pagamento_plano
    status_pagamento
    internet_lenta
    internet_queda
    cancelamento
    problema
    chat
    finalizado

    Use finalizado quando o usuário confirmar que resolveu ou agradecer após uma solução.

    Se existir playbook e a mensagem continuar o atendimento, mantenha o tipo atual.
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

        Histórico da conversa: {last_messages}
        
        Use o histórico da conversa com o usuário para responder de maneira eficiente."""

        answer = await model.ainvoke([{"role": "system", "content": answer_system_instruction}, {"role": "user", "content": state["message"]}])

        return {"answer": answer.content, "summary":state['summary'] + f"Assistente: {answer.content}\n"}
    

    # Caso o playbook de fato exista e o cliente esteja enfrentando um problema que pode ser classificado.
    else:
        print("------------- last message -------------")
        print(f"{state.get('lastMessage')}")
        print("------------- last message -------------")


        instruction_userstate = f"""
            Última resposta:
            {state.get('lastMessage')}

            Playbook:
            {state.get('playbook')}

            Usuário:
            {state.get('message')}

            Classifique:

            primeiro_passo:
            - playbook é None

            em_execucao:
            - usuário pede explicação
            - não entendeu
            - não sabe responder
            - resposta vaga

            proximo_passo:
            - concluiu instrução
            - respondeu pergunta do assistente
            - pediu próximo passo

        Escolha apenas uma opção.
        """

        model_classifier = model.with_structured_output(InstructionState)
        classification = await model_classifier.ainvoke([{"role": "user", "content": instruction_userstate}])

        print(f"\n\nATÉ O MOMENTO: Classificacao: {state['classification']['type']}\n\nIntention: {classification}")

        #Sempre começa da primeira instrução, por padrão.
        nextStep = 1


        if state.get('playbook') and state.get('playbook') == state['classification']['type']:
            print("ENTROU AQUI PAIZAO DA CROACIA!!")
            if classification['intention'] == 'proximo_passo':
                print("ENTROU AQUI PAIZAO DA CROACIA!! FAMOSO!!!!")
                nextStep = state['currentStep'] + 1

        print(f"VALOR DE NEXTSTEP: {nextStep}")

        if (classification['intention'] == 'primeiro_passo' or classification['intention'] == 'proximo_passo'):
            instruction = read_playbook(nextStep, playbook)
            if instruction != '\n\nPROXIMO PASSO DO FLUXO GERAL\n\n':
                return {"answer": instruction, "summary":state['summary'] + f"Assistente: {instruction}\n", "playbook": playbook_to_load['type'], "currentStep": nextStep}
            
            # SE FOR IGUAL ENTÃO É AQUI ----------------- <><><><><><><><><>>><>><

        #if instruction != '\n\nPROXIMO PASSO DO FLUXO GERAL\n\n':
        #    return {"answer": instruction, "summary":state['summary'] + f"assistant: {instruction}\n", "playbook": playbook_to_load['type'], "currentStep": nextStep}


        test = await search_in_documents(state['message'])

        answer_system_instruction = f"""
        {system_instruction_issue}
        """

        if test != "None":
            prompt = f"""
                Soluções que funcionaram com outros usuários: {test}

                Com base nisso, proponha uma solução para o problema do usuário.
            """
        else:
            print(f'CAIU AQUI E O HISTÓRICO DE MENSAGENS É: \n\n{last_messages}\n\n\n')


            prompt = f"""
                Histórico de mensagens:
                {last_messages}

                Mensagem do usuário:
                {state['message']}

                Apenas ajude o cliente a concluir a instrução anterior. NÃO forneça nenhuma solução nova.
            """

        answer = await model.ainvoke([{"role": "system", "content": answer_system_instruction}, {"role": "user", "content": prompt}])

        #summary = f"{state['summary']}\nSolução proposta pelo assistente: {answer.content}\n"

        return {"answer": answer.content, "summary":state['summary'] + f"Assistente: {answer.content}\n", "test": test}



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

graph.add_conditional_edges("router", define_route, {'chat': 'answer', 'internet_lenta': 'answer', 'cancelamento': 'answer', 'internet_queda': 'answer', 'problema':'answer', 'pagamento_plano': 'output', 'consulta_plano': 'output', 'status_pagamento': 'output', 'finalizado':'issue_classification'})

graph.add_edge("output", END)
graph.add_edge("answer", END)

graph_compiled = graph.compile()

async def prompt_to_agent(data: dict):
    return await graph_compiled.ainvoke(data)