from google import genai
import time

# ============================================================
# GEMINI API SETUP
# ============================================================

API_KEY = ""

client = genai.Client(api_key=API_KEY)

MODEL = "gemini-3.6-flash"


# ============================================================
# PROGRAM 2
# Zero-shot, One-shot and Few-shot
# 200-word Blog on AI in Healthcare
# ============================================================

print("\n")
print("=" * 70)
print("PROGRAM 2: APPLICATIONS OF AI IN HEALTHCARE")
print("=" * 70)


# ============================================================
# ZERO-SHOT PROMPT
# ============================================================

zero_shot_prompt = """
Write a blog of exactly 200 words on the topic:

"Applications of Artificial Intelligence in Healthcare"

Discuss the following:
- Disease diagnosis
- Medical imaging
- Drug discovery
- Patient monitoring
- Personalized treatment
- Benefits of AI
- Challenges of AI

Use a professional and informative writing style.
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


# Wait before next API request
time.sleep(5)


# ============================================================
# ONE-SHOT PROMPT
# ============================================================

one_shot_prompt = """
Write a blog of exactly 200 words on the topic:

"Applications of Artificial Intelligence in Healthcare"

Follow the style of this example.

Example:

Topic: Artificial Intelligence in Education

Blog:
Artificial Intelligence is transforming education by providing
personalized learning, automated assessment, intelligent tutoring,
and improved access to educational resources. AI systems can analyze
student performance and identify areas where learners need additional
support. These technologies help teachers make better decisions and
provide students with effective learning experiences.

Now write a similar 200-word blog about:

"Applications of Artificial Intelligence in Healthcare"

Include disease diagnosis, medical imaging, drug discovery,
patient monitoring, personalized treatment, benefits, and challenges.
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


# Wait before next API request
time.sleep(5)


# ============================================================
# FEW-SHOT PROMPT
# ============================================================

few_shot_prompt = """
Write a blog of exactly 200 words on:

"Applications of Artificial Intelligence in Healthcare"

Follow the style and structure of these examples.

Example 1:

Topic: AI in Education

Blog:
Artificial Intelligence is transforming education through personalized
learning, automated assessment, intelligent tutoring, and improved
access to educational resources. It helps teachers analyze student
performance and provides learners with suitable educational support.


Example 2:

Topic: AI in Banking

Blog:
Artificial Intelligence is transforming banking through fraud
detection, risk analysis, customer support, personalized services,
and financial forecasting. AI systems can analyze large amounts of
financial data and help organizations make faster and more informed
decisions.


Now write a 200-word blog about:

"Applications of Artificial Intelligence in Healthcare"

Include:
- Disease diagnosis
- Medical imaging
- Drug discovery
- Patient monitoring
- Personalized treatment
- Benefits
- Challenges

Use a professional, informative, and easy-to-understand style.
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
Zero-shot:
The model receives only the task without examples.
It can generate a relevant blog but may have less control
over structure and writing style.

One-shot:
The model receives one example along with the task.
The generated blog generally follows the demonstrated style.

Few-shot:
The model receives multiple examples.
It usually provides better consistency, structure, completeness,
and readability.
""")

print("=" * 70)
print("PROGRAM 2 COMPLETED")
print("=" * 70)
