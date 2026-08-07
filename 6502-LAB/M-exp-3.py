import pandas as pd

# Student dataset
data = {
    "Name": ["Ram", "Sita", "John", "Priya", "Rahul"],
    "Marks": [85, None, 78, 92, 88]
}

df = pd.DataFrame(data)

print("Original Dataset:")
print(df)

# Fill missing values with the average
df["Marks"] = df["Marks"].fillna(df["Marks"].mean())

print("\nDataset after cleaning:")
print(df)

# Statistical Information
print("\nAverage Marks:", df["Marks"].mean())
print("Highest Marks:", df["Marks"].max())
