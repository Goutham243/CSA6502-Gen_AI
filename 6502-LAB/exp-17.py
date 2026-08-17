from sentence_transformers import SentenceTransformer
import numpy as np

model = SentenceTransformer("all-MiniLM-L6-v2")

documents = [
    "The sun is a star.",
    "Python is used for programming.",
    "Artificial intelligence allows machines to learn.",
    "Football is a popular sport.",
    "Machine learning learns patterns from data."
]

query = "How do machines learn?"

document_embeddings = model.encode(documents)
query_embedding = model.encode(query)

similarities = np.dot(
    document_embeddings,
    query_embedding
) / (
    np.linalg.norm(document_embeddings, axis=1)
    * np.linalg.norm(query_embedding)
)

ranking = np.argsort(similarities)[::-1]

print("Query:", query)
print("\nSemantic Search Results:\n")

for i in ranking:
    print(documents[i])
    print("Cosine Similarity:", round(similarities[i], 4))
    print()
