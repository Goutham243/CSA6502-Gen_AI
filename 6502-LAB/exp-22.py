import faiss
from sentence_transformers import SentenceTransformer

documents = [
    "Artificial intelligence enables machines to perform intelligent tasks.",
    "Machine learning allows computers to learn from data.",
    "Deep learning uses neural networks.",
    "Supervised learning uses labeled data.",
    "Unsupervised learning finds patterns in data.",
    "Reinforcement learning learns using rewards and penalties."
]

model = SentenceTransformer("all-MiniLM-L6-v2")

embeddings = model.encode(documents).astype("float32")

index = faiss.IndexFlatL2(embeddings.shape[1])
index.add(embeddings)

print("AI and Machine Learning Chatbot")
print("Type 'exit' to stop.")

while True:

    question = input("\nYou: ")

    if question.lower() == "exit":
        break

    query_embedding = model.encode(
        [question]
    ).astype("float32")

    distances, indices = index.search(
        query_embedding,
        1
    )

    answer = documents[indices[0][0]]

    print("Bot:", answer)
