import chromadb
import chromadb.utils.embedding_functions as embedding_functions
import hashlib
from google import genai



client = chromadb.PersistentClient(path='/usr/local/app/chroma_db')

gemini_client = genai.Client()

gemini_ef = embedding_functions.GoogleGeminiEmbeddingFunction(
    model_name='gemini-embedding-2',
    task_type='RETRIEVAL_DOCUMENT'
)

print(f"COLECOES:{client.list_collections()}\n\n----------------><---------------\n")
collection = client.get_or_create_collection(name="client_issues", embedding_function=gemini_ef)


async def add_data_to_vector_database(issue: str, solution: str):
    id_hash = hashlib.sha256(issue.encode()).hexdigest()

    collection.add(
        ids=[id_hash],
        documents=[issue],
        metadatas=[{"solution": solution}],
    )

    print(f"\n\nGuardou!\n\nIssue: {issue}\nSolution: {solution}\n\n\n")
    

async def search_in_documents(user_prompt: str):
    print("\n\n\nALOOOOOOOOO FAMOSO!!!!\n\n")

    response = gemini_client.models.embed_content(
        model='gemini-embedding-2',
        contents=user_prompt
    )

    result = collection.query(
        query_embeddings=response.embeddings[0].values,
        n_results = 2
    )

    print(f"RESULTADOS DA BUSCA NO BD VETORIAL:\n{result}")

    if result['metadatas'][0] and result['distances'][0][0] < 0.35:
        docs = "\n".join(m['solution'] for m in result['metadatas'][0])
        return docs
    else:
        return "None"
    
