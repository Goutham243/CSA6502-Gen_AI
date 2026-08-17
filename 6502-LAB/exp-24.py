import faiss
from sentence_transformers import SentenceTransformer

documents = [
    "Artificial intelligence is a field of computer science.",
    "Machine learning allows computers to learn from data.",
    "Deep learning uses neural networks.",
    "Natural language processing helps computers understand human language.",
    "AI is used in healthcare, education and transportation."
]

model = SentenceTransformer("all-MiniLM-L6-v2")

embeddings = model.encode(documents).astype("float32")

index = faiss.IndexFlatL2(embeddings.shape[1])
index.add(embeddings)

print("AI Assistant")
print("Type exit to stop.")

while True:

    question = input("\nAsk a question: ")

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

    print("\nAnswer:")
    print(answer)
