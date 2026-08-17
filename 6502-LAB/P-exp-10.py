from google import genai
import time

# ============================================================
# GEMINI API SETUP
# ============================================================

API_KEY = ""

client = genai.Client(api_key=API_KEY)

MODEL = "gemini-3.6-flash"


# ============================================================
# PROGRAM 5
# AI WORKSHOP PROMOTIONAL SOCIAL MEDIA POST
# ============================================================

print("\n")
print("=" * 70)
print("PROGRAM 5: AI WORKSHOP PROMOTIONAL SOCIAL MEDIA POST")
print("=" * 70)


# ============================================================
# ZERO-SHOT PROMPT
# ============================================================

zero_shot_prompt = """
Create an attractive promotional social media post for an
Artificial Intelligence Workshop.

The post should:
- Attract college students
- Mention the benefits of the workshop
- Mention hands-on learning
- Encourage students to register
- Include relevant hashtags
- Use an engaging and professional tone
"""

try:

    response = client.models.generate_content(
        model=MODEL,
        contents=zero_shot_prompt
    )

    print("\n--- ZERO-SHOT OUTPUT ---")
    print(response.text)

except Exception as e:

    print("\nZERO-SHOT ERROR:")
    print(e)


time.sleep(5)


# ============================================================
# ONE-SHOT PROMPT
# ============================================================

one_shot_prompt = """
Create a promotional social media post for an AI Workshop.

Follow the style of this example.

Example:

🚀 Python Programming Workshop!

Want to improve your programming skills?

Join our hands-on Python workshop and learn programming concepts,
build simple projects, and improve your problem-solving skills.

Register now and start your coding journey!

#Python #Programming #Workshop #Students

Now create a similar promotional social media post for:

Artificial Intelligence Workshop.

Mention hands-on learning, real-world applications, student benefits,
and registration.
"""

try:

    response = client.models.generate_content(
        model=MODEL,
        contents=one_shot_prompt
    )

    print("\n--- ONE-SHOT OUTPUT ---")
    print(response.text)

except Exception as e:

    print("\nONE-SHOT ERROR:")
    print(e)


time.sleep(5)


# ============================================================
# FEW-SHOT PROMPT
# ============================================================

few_shot_prompt = """
Create an engaging promotional social media post for an
Artificial Intelligence Workshop.

Follow the style and structure of these examples.

Example 1:

🚀 Python Workshop!

Learn Python through hands-on activities and practical projects.
Improve your programming skills and develop real-world solutions.

Register today and start learning!

#Python #Coding #Workshop


Example 2:

🤖 Machine Learning Workshop!

Discover machine learning concepts, algorithms, and real-world
applications. Participate in practical activities and learn how
AI can solve real-world problems.

Join us and begin your AI journey!

#MachineLearning #AI #Workshop


Now create a promotional social media post for:

Artificial Intelligence Workshop.

Include:
- Attractive heading
- Workshop benefits
- Hands-on activities
- Real-world AI applications
- Student participation
- Call to action
- Relevant hashtags

Make the post engaging, concise, and suitable for Instagram,
LinkedIn, or other social media platforms.
"""

try:

    response = client.models.generate_content(
        model=MODEL,
        contents=few_shot_prompt
    )

    print("\n--- FEW-SHOT OUTPUT ---")
    print(response.text)

except Exception as e:

    print("\nFEW-SHOT ERROR:")
    print(e)


# ============================================================
# COMPARISON
# ============================================================

print("\n")
print("=" * 70)
print("COMPARISON OF PROMPTING TECHNIQUES")
print("=" * 70)

print("""
ZERO-SHOT:
The model generates the promotional post without any example.
The result is relevant but has less control over the format.

ONE-SHOT:
One example is provided to guide the model.
The generated post follows the demonstrated style and structure.

FEW-SHOT:
Multiple examples are provided.
The generated post generally has better consistency, structure,
engagement, and formatting.
""")


# ============================================================
# OBSERVATION
# ============================================================

print("\n")
print("=" * 70)
print("OBSERVATION")
print("=" * 70)

print("""
Zero-shot prompting generates content directly from the task.

One-shot prompting uses one example to guide the style and format.

Few-shot prompting uses multiple examples to produce more
consistent and well-structured promotional content.
""")

print("=" * 70)
print("PROGRAM 5 COMPLETED")
print("=" * 70)
