from fastapi import FastAPI
import sys
sys.path.append("/usr/local/app/agent")
from agent import prompt_to_agent
app = FastAPI()

@app.post("/prompt-agent")
async def agent_endpoint(data: dict):
    response = await prompt_to_agent(data)
    print(response)
    return response
