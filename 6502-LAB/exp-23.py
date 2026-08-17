import faiss
from sentence_transformers import SentenceTransformer

documents = [
    "Python is a programming language.",
    "Machine learning is a branch of artificial intelligence.",
    "Deep learning uses neural networks.",
    "Reinforcement learning uses rewards and penalties.",
    "NLP helps computers understand human language."
]

model = SentenceTransformer("all-MiniLM-L6-v2")

embeddings = model.encode(documents).astype("float32")

index = faiss.IndexFlatL2(embeddings.shape[1])
index.add(embeddings)

history = []

print("Context-Aware Chatbot")
print("Type exit to stop.")

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

    history.append(
        "User: " + question
    )
