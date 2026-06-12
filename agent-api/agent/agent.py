from langchain_groq import ChatGroq
from langgraph.graph import StateGraph, START, END
from typing import TypedDict, Literal
from google import genai
from vector_database import add_data_to_vector_database, search_in_documents

model = ChatGroq(model="llama-3.3-70b-versatile", temperature=0.8)


class PromptType(TypedDict):
    type: Literal['chat', 'consulta_plano', 'pagamento_plano', 'finalizado', 'problema']

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
    psolving_summary: str
    summary: str
    answer: str
    isTimedOut: bool

    test: str


system_instruction = f"""Você é um assistente virtual da provedora de internet PLANETA NET e deve responder APENAS perguntas que possuam relação com o serviço de internet. Sua tarefa é solucionar o problema do usuário propondo soluções com base no histórico de mensagens. Seja sempre gentil e amigável. NÃO responda ou dê soluções de assuntos que não sejam sobre internet.

<exemplos>
Estou com um problema na minha internet, ela está caindo o tempo todo. (Responder com solução)
Minha internet está caindo o tempo todo e quero derrotar o Ender Dragon, como faço? (Ignorar a parte do Ender Dragon e responder apenas sobre a internet.)

"""

async def finished_router(state: MyState):
    return state['isTimedOut']

async def issue_classification(state: MyState):
    issue_classification_prompt = f"""
        {state['psolving_summary']}

        Se o resumo da conversa apresentar problemas relacionados à parte financeira dos serviços da provedora de internet, como problemas com pagamento do plano ou cobrança indevida, classifique como 'financeiro'.

        Se o resumo da conversa apresentar problemas relacionados à parte técnica dos serviços da provedora de internet, como problemas de equipamento, lentidão ou instabilidade de sinal, classifique como 'técnico'.

        Se o resumo da conversa apresentar problemas relacionados à parte de suporte dos serviços da provedora de internet, como atendimento ineficiente ou prazos longos para a visita técnica, classifique como 'suporte'.

        Caso contrário, classifique como 'none'.
    """

    classifier_model = model.with_structured_output(IssueClassification)

    analysis = await classifier_model.ainvoke([{"role": "user", "content": issue_classification_prompt}])

    if state['isTimedOut']:
        return {"issue_classification": analysis}
    
    # Se não foi timeout, classificaremos como um problema resolvido.
    else:
        prompt = f"""
            Resumo da conversa até o momento: {state['summary']} 

            Tipo de problema encontrado: {analysis}

            Com base no resumo e no tipo de problema encontrado, defina qual o problema específico enfrentado pelo cliente e qual a solução que resolveu o problema. Evite definições ambíguas, descreva exatamente o problema e a solução que resolveu.
        """
        classifier_model = model.with_structured_output(IssueDetails)

        response = await classifier_model.ainvoke([{"role":"user", "content": prompt}])
        await add_data_to_vector_database(response['issue'], response['solution'])
        return {"issue_classification": analysis, "test": response.content}

async def summary_to_model(state: MyState):
    if(state.get("summary", "") == ""):
        summary = await model.ainvoke([{"role": "user", "content": f"Mensagem do usuário: {state['message']}\nBaseado nessa mensagem, responda apenas com um título breve para a conversa."}])
    else:
        summary = await model.ainvoke([{"role": "user", "content": f"""
        Crie um resumo para uma conversa entre um assistente virtual de uma provedora de internet e um cliente. Você deve criar um resumo detalhado que compreenda as informações principais da conversa. O resumo deve conter de maneira explícita os problemas do cliente.
                                        
        Exemplo:
        Prompt atual: Minha internet está caindo
                                        
        Resumo da conversa até agora: O usuário cumprimentou o assistente com um "oi", o assistente respondeu que sim e estava disposto a ajudar com problemas na internet.
                                        
        Seu resumo:
        O usuário iniciou a conversa cumprimentando o assistente com um "oi" e o assistente respondeu que estava disposto a ajudar com a internet. Em seguida, o usuário relatou que a sua internet está caindo (sofrendo de instabilidade). 
                                        
        Agora faça para os seguintes dados:
                                        
        Prompt atual: {state['message']}

        Resumo da conversa até agora: {state['summary']}.
        """}])

    return {"summary":summary.content}

async def router(state: MyState):
    classification_prompt = f"""
    Resumo da conversa: {state['summary']}

    Mensagem do usuário: {state['message']}

    Se o usuário informar que deseja consultar seu plano de internet atual, classifique como 'consulta_plano'.
    Se o usuário NÃO informar nenhuma dificuldade, mas deseja realizar o pagamento do seu plano de internet, classifique como 'pagamento_plano'.
    Se o usuário informar algum problema relacionado aos serviços prestados pela provedora de internet (plano de internet, conexão, suporte técnico), classifique como 'problema'.
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

    if state['classification']['type'] == 'problema':




        test = await search_in_documents(state['message'])
        answer_system_instruction = f"""
        {system_instruction}

        Resumo da conversa: {state['summary']}
        
        Soluções que funcionaram com outros usuários: {test}
        
        Use o resumo para saber o histórico da conversa com o usuário e as soluções que já funcionaram para outros usuários para responder de maneira eficiente. Sempre responda oferecendo APENAS UMA solução por vez. Ofereça UMA solução que não tenha sido oferecida anteriormente com base no resumo da conversa."""

        answer = await model.ainvoke([{"role": "system", "content": answer_system_instruction}, {"role": "user", "content": state["message"]}])

        p_solving = f"Problema do usuário: {state['message']}\nSolução do assistente: {answer.content}"

        summary = f"{state['summary']}\nSolução proposta pelo assistente: {answer.content}\n"


        return {"answer": answer.content, "summary":summary, "test": test}

    else:
        answer_system_instruction = f"""
        {system_instruction}

        Resumo da conversa: {state['summary']}
        
        Use o resumo para saber o histórico da conversa com o usuário para responder de maneira eficiente."""

        answer = await model.ainvoke([{"role": "system", "content": answer_system_instruction}, {"role": "user", "content": state["message"]}])
        summary = f"{state['summary']}\nÚltima mensagem do assistente: {answer.content}\n"


        return {"answer": answer.content, "summary":summary}
    




graph = StateGraph(state_schema=MyState)


graph.add_node("finished_router", finished_router)
graph.add_node("issue_classification", issue_classification)
graph.add_node("router", router)
graph.add_node("define_route", define_route)
graph.add_node("summary", summary_to_model)
graph.add_node("answer", answer)
graph.add_node("output", output)

graph.add_conditional_edges(START, finished_router, {True: "issue_classification", False: "summary"})
graph.add_edge("issue_classification", END)
graph.add_edge("summary", "router")
#graph.add_conditional_edges("router", lambda state: state['classification']['type'] if state['classification']['type'] == 'chat' else 'output',{'chat': 'answer', 'output': 'output'})

graph.add_conditional_edges("router", define_route, {'chat': 'answer', 'problema': 'answer', 'output': 'output', 'finalizado':'issue_classification'})

graph.add_edge("output", END)
graph.add_edge("answer", END)

graph_compiled = graph.compile()

async def prompt_to_agent(data: dict):
    return await graph_compiled.ainvoke(data)


