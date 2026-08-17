import faiss
import numpy as np
from sentence_transformers import SentenceTransformer

model = SentenceTransformer("all-MiniLM-L6-v2")

documents = [
    "Artificial intelligence is used in healthcare.",
    "Machine learning learns from data.",
    "Python is commonly used in AI.",
    "Deep learning uses neural networks.",
    "Robots perform automated tasks.",
    "NLP helps computers understand language."
]

embeddings = model.encode(documents).astype("float32")

index = faiss.IndexFlatL2(embeddings.shape[1])
index.add(embeddings)

query = "How do computers understand language?"

query_embedding = model.encode([query]).astype("float32")

k = 3

distances, indices = index.search(query_embedding, k)

print("Query:", query)
print("\nTop 3 Results:")

for rank, i in enumerate(indices[0], 1):
    print(rank, ".", documents[i])
