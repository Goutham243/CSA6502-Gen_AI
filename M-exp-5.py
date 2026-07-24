from sklearn.metrics.pairwise import cosine_similarity

# Two vectors
vector1 = [[1, 2, 3, 4]]
vector2 = [[2, 3, 4, 5]]

similarity = cosine_similarity(vector1, vector2)

print("Cosine Similarity:")
print(similarity)
