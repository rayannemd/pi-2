import json

def load_playbook(playbook_name: str):
    try:
        with open(f"playbooks/{playbook_name}.json", "r", encoding="utf-8") as instructions:
            playbook = json.load(instructions)
        return playbook
    except Exception as e:
        print(e)
        return None
    
def read_playbook(step: int, playbook: dict):
    try:
        for current_instruction in playbook['steps']:
            if current_instruction['id'] == step:
                return current_instruction['instruction']
        # Caso não tenha encontrado um id para o step especificado.
        return '\n\nPROXIMO PASSO DO FLUXO GERAL\n\n' 
    except Exception as e:
        print(e)
        return 'Erro ao ler o playbook.'