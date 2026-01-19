from fastapi import FastAPI
from agent.agent import prompt_to_agent
app = FastAPI()

@app.post("/prompt-agent")
async def agent_endpoint(data: dict):
    return await prompt_to_agent(data)