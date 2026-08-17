import faiss
from sentence_transformers import SentenceTransformer

text = """
Artificial intelligence is a field of computer science.
Machine learning is a subset of artificial intelligence.
Deep learning uses neural networks.
Natural language processing helps computers understand human language.
AI is used in healthcare, education and transportation.
"""

chunks = [
    text[i:i + 200]
    for i in range(0, len(text), 200)
]

model = SentenceTransformer("all-MiniLM-L6-v2")

embeddings = model.encode(chunks).astype("float32")

index = faiss.IndexFlatL2(embeddings.shape[1])
index.add(embeddings)

question = input("Ask a question: ")

query_embedding = model.encode(
    [question]
).astype("float32")

distances, indices = index.search(
    query_embedding, 1
)

answer = chunks[indices[0][0]]

print("\nRetrieved Context:")
print(answer)

print("\nFinal Answer:")
print(answer)
