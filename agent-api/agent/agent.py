from langchain_groq import ChatGroq
from langgraph.graph import StateGraph, START, END
from typing import TypedDict, Literal

model = ChatGroq(model="openai/gpt-oss-20b", temperature=0)


class PromptType(TypedDict):
    type: Literal['chat', 'consulta_plano']


class MyState(TypedDict):
    message: str
    classification: PromptType
    summary: str
    answer: str


system_instruction = f"Você é um assistente virtual da provedora de internet PLANETA NET e deve responder APENAS perguntas que possuam relação com o seu serviço. Seja sempre gentil e amigável."


async def summary_to_model(state: MyState):
    if(state.get("summary", "") == ""):
        summary = await model.ainvoke([{"role": "assistant", "content": f"Mensagem do usuário: {state['message']}\nBaseado nessa mensagem, responda apenas com um título breve para a conversa."}])
    else:
        summary = await model.ainvoke([{"role": "assistant", "content": f"Prompt atual: {state['message']}\nResumo da conversa até agora: {state['summary']}.\nBaseado nessa conversa, crie um resumo conciso levando em consideração os dados mais importantes."}])
    return {"summary":summary.content}

async def router(state: MyState):
    classification_prompt = f"Resumo da conversa: {state['summary']} \n Mensagem do usuário: {state['message']} \n Se o usuário informar que deseja consultar seu plano de internet atual, classifique como 'consulta_plano'.\nCaso não seja necessário acessar nenhuma informação no banco de dados, classifique como 'chat'. Seja rígido e aceite apenas o que tiver ligação com serviço de internet.\n"
    model_classifier = model.with_structured_output(PromptType)
    classification = await model_classifier.ainvoke([{"role": "system", "content": classification_prompt}])
    return {"classification": classification}

async def output(state: MyState):
    return {"answer": "None"}


async def answer(state: MyState):
    answer = await model.ainvoke([{"role": "system", "content": system_instruction}, {"role": "assistant", "content": f"Resumo da conversa: {state['summary']}"}, {"role": "user", "content": state['message']}])
    return {"answer": answer.content, "summary":state['summary']}


graph = StateGraph(state_schema=MyState)

graph.add_node("router", router)
graph.add_node("summary", summary_to_model)
graph.add_node("answer", answer)
graph.add_node("output", output)

graph.add_edge(START, "summary")
graph.add_edge("summary", "router")

graph.add_conditional_edges("router", lambda state: state['classification']['type'] if state['classification']['type'] == 'chat' else 'output',{'chat': 'answer', 'output': 'output'})

graph.add_edge("output", END)

graph_compiled = graph.compile()

async def prompt_to_agent(data: dict):
    return await graph_compiled.ainvoke(data)
