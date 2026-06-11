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

collection = client.create_collection(name="client_issues", embedding_function=gemini_ef)


async def add_data_to_vector_database(issue: str, solution: str):
    id_hash = hashlib.sha256(issue.encode()).hexdigest()

    collection.add(
        ids=[id_hash],
        documents=[issue],
        metadatas=[{"solution": solution}],
    )

    print("\n\nGuardou!\n\n")
    

async def search_in_documents(user_prompt: str):
    response = gemini_client.models.embed_content(
        model='gemini-embedding-2',
        contents=user_prompt
    )

    result = collection.query(
        query_embeddings=response.embeddings[0].values,
        n_results = 2
    )
    print(result)
    if result['metadatas'][0]:
        return result['metadatas'][0][0]['solution']
    else:
        return "Ainda vazio..."
    
