import faiss
from sentence_transformers import SentenceTransformer

model = SentenceTransformer("all-MiniLM-L6-v2")

documents = [
    "Artificial intelligence enables machines to perform intelligent tasks.",
    "Machine learning allows computers to learn from data.",
    "Deep learning uses artificial neural networks.",
    "NLP helps computers understand human language."
]

embeddings = model.encode(documents).astype("float32")

index = faiss.IndexFlatL2(embeddings.shape[1])
index.add(embeddings)

question = input("Ask a question: ")

query_embedding = model.encode(
    [question]
).astype("float32")

distances, indices = index.search(
    query_embedding,
    1
)

answer = documents[indices[0][0]]

print("\nRelevant Answer:")
print(answer)
