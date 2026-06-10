import chromadb
import chromadb.utils.embedding_functions as embedding_functions
import hashlib
from google import genai

client = chromadb.PersistentClient(path='/database')

gemini_client = genai.Client()

gemini_ef = embedding_functions.GoogleGeminiEmbeddingFunction(
    model_name='gemini-embedding-2',
    task_type='RETRIEVE_DOCUMENT'
)

collection = client.create_collection(name="client_issues", embedding_function=gemini_ef)


async def add_data_to_vector_database(issue: str, solution: str):
    id_hash = hashlib.sha256(issue.encode()).hexdigest()

    collection.add(
        ids=[id_hash],
        documents=[issue],
        metadatas=[{"solution": solution}],
    )
    

async def search_in_documents(user_prompt: str):
    prompt_embeddings = gemini_client.models.embed_content(
        model='gemini-embedding-2',
        contents=user_prompt
    )

    result = collection.query(
        query_embeddings=prompt_embeddings,
        n_results = 3
    )
    print(result)
    
