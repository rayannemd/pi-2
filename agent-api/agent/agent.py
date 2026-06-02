from langchain_groq import ChatGroq
from langgraph.graph import StateGraph, START, END
from typing import TypedDict, Literal

model = ChatGroq(model="llama-3.3-70b-versatile", temperature=0.8)


class PromptType(TypedDict):
    type: Literal['chat', 'consulta_plano', 'pagamento_plano']


class MyState(TypedDict):
    message: str
    classification: PromptType
    summary: str
    answer: str


system_instruction = f"Você é um assistente virtual da provedora de internet PLANETA NET e deve responder APENAS perguntas que possuam relação com o seu serviço. Seja sempre gentil e amigável."


async def summary_to_model(state: MyState):
    if(state.get("summary", "") == ""):
        summary = await model.ainvoke([{"role": "user", "content": f"Mensagem do usuário: {state['message']}\nBaseado nessa mensagem, responda apenas com um título breve para a conversa."}])
    else:
        summary = await model.ainvoke([{"role": "user", "content": f"""
        Crie um resumo para uma conversa entre um assistente virtual de uma provedora de internet e um cliente. Você deve criar um resumo conciso que compreenda as informações principais da conversa.
                                        
        Exemplo:
        Prompt atual: Tudo bem?
                                        
        Resumo da conversa até agora: O usuário cumprimentou o assistente com um "oi", o assistente respondeu que sim e estava disposto a ajudar com problemas na internet.
                                        
        Seu resumo:
        O usuário iniciou a conversa cumprimentando o assistente com um "oi" e o assistente respondeu que estava disposto a ajudar com a internet. Em seguida, o usuário perguntou se o assistente estava bem. 
                                        
        Agora faça para os seguintes dados:
                                        
        Prompt atual: {state['message']}

        Resumo da conversa até agora: {state['summary']}.
        """}])
    return {"summary":summary.content}

async def router(state: MyState):
<<<<<<< HEAD
    classification_prompt = f"Resumo da conversa: {state['summary']} \n Mensagem do usuário: {state['message']} \n Se o usuário informar que deseja consultar seu plano de internet atual, classifique como 'consulta_plano'. Se o usuário pedir para pagar, gerar uma cobrança, emitir um Pix, quitar a fatura ou variantes, classifique como 'pagamento_plano'.\nCaso não seja necessário acessar nenhuma informação no banco de dados, classifique como 'chat'. Seja rígido e aceite apenas o que tiver ligação com serviço de internet.\n"
=======
    classification_prompt = f"""
    Resumo da conversa: {state['summary']}

    Mensagem do usuário: {state['message']}

    Se o usuário informar que deseja consultar seu plano de internet atual, classifique como 'consulta_plano'.
    Se o usuário NÃO informar nenhuma dificuldade, mas deseja realizar o pagamento do seu plano de internet, classifique como 'pagamento_plano'. 
    Caso não se encaixe em nenhuma das opções acima, classifique como 'chat'.
    
    """
>>>>>>> 72b6e5a74a6723d4bc56b66d7668416bb37b23a1
    model_classifier = model.with_structured_output(PromptType)
    classification = await model_classifier.ainvoke([{"role": "system", "content": classification_prompt}])
    return {"classification": classification}

async def output(state: MyState):
    return {"answer": "None"}


async def answer(state: MyState):
    global system_instruction
    system_instruction += f'\nResumo da conversa: {state['summary']}. Use o resumo para saber o histórico da conversa com o usuário.'


    answer = await model.ainvoke([{"role": "system", "content": system_instruction}, {"role": "user", "content": state["message"]}])
    return {"answer": answer.content, "summary":state['summary']}


graph = StateGraph(state_schema=MyState)

graph.add_node("router", router)
graph.add_node("summary", summary_to_model)
graph.add_node("answer", answer)
graph.add_node("output", output)

graph.add_edge(START, "summary")
graph.add_edge("summary", "router")

graph.add_conditional_edges("router", lambda state: 'chat' if state['classification']['type'] == 'chat' else 'output',{'chat': 'answer', 'output': 'output'})

graph.add_edge("output", END)

graph_compiled = graph.compile()

async def prompt_to_agent(data: dict):
    return await graph_compiled.ainvoke(data)
