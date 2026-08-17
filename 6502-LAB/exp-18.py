import faiss
import numpy as np
from sentence_transformers import SentenceTransformer

model = SentenceTransformer("all-MiniLM-L6-v2")

documents = [
    "Artificial intelligence is used in healthcare.",
    "Machine learning learns patterns from data.",
    "Deep learning uses neural networks.",
    "Python is useful for AI development.",
    "Robots can perform automated tasks."
]

embeddings = model.encode(documents)
embeddings = np.array(embeddings).astype("float32")

dimension = embeddings.shape[1]

index = faiss.IndexFlatL2(dimension)
index.add(embeddings)

query = "How is AI used in medicine?"

query_embedding = model.encode(
    [query]
).astype("float32")

distances, indices = index.search(
    query_embedding,
    2
)

print("Query:", query)
print("\nRetrieved Documents:\n")

for i in indices[0]:
    print(documents[i])
