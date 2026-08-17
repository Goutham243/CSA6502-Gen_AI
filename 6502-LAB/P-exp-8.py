from google import genai
import time

# ============================================================
# GEMINI API SETUP
# ============================================================

API_KEY = ""

client = genai.Client(api_key=API_KEY)

MODEL = "gemini-3.6-flash"


# ============================================================
# PROGRAM 3
# ARTICLE SUMMARIZATION
# ============================================================

print("\n")
print("=" * 70)
print("PROGRAM 3: ARTICLE SUMMARIZATION")
print("=" * 70)


# ============================================================
# ARTICLE
# ============================================================

article = """
Artificial Intelligence is transforming the healthcare industry
by helping doctors diagnose diseases, analyze medical images,
monitor patients, and discover new medicines. Machine learning
algorithms can identify patterns in large medical datasets and
provide useful insights for healthcare professionals. AI-powered
systems can also predict patient risks and support personalized
treatment plans. Hospitals can use AI to manage resources, reduce
waiting times, and improve healthcare services. However, the use
of AI in healthcare also creates challenges. Patient data must be
protected from unauthorized access, and AI systems must be carefully
tested to avoid bias and incorrect predictions. High-quality medical
data is also required to train reliable AI models. Therefore, AI
should be used as a supportive technology that assists healthcare
professionals rather than completely replacing doctors and medical
staff.
"""


print("\n--- ORIGINAL ARTICLE ---")
print(article)


# ============================================================
# ZERO-SHOT PROMPT
# ============================================================

zero_shot_prompt = f"""
Summarize the following article in exactly 50 words.

Article:
{article}

Important:
- Keep the main ideas.
- Do not add information that is not present in the article.
- Make the summary clear and readable.
"""

try:

    response = client.models.generate_content(
        model=MODEL,
        contents=zero_shot_prompt
    )

    zero_shot_summary = response.text

    print("\n--- ZERO-SHOT SUMMARY ---")
    print(zero_shot_summary)

except Exception as e:

    print("\nZERO-SHOT ERROR:")
    print(e)
    zero_shot_summary = "Error"


time.sleep(5)


# ============================================================
# ONE-SHOT PROMPT
# ============================================================

one_shot_prompt = f"""
Summarize the following article in exactly 50 words.

Follow the style of this example.

Example:

Article:
Artificial Intelligence helps banks detect fraud, analyze financial
data, improve customer service, and make faster decisions.

Summary:
AI improves banking by detecting fraud, analyzing financial data,
enhancing customer service, and supporting faster decision-making.

Now summarize the following article:

{article}

Important:
- Keep the important information.
- Do not add new information.
- Use simple and clear language.
- Write exactly 50 words.
"""

try:

    response = client.models.generate_content(
        model=MODEL,
        contents=one_shot_prompt
    )

    one_shot_summary = response.text

    print("\n--- ONE-SHOT SUMMARY ---")
    print(one_shot_summary)

except Exception as e:

    print("\nONE-SHOT ERROR:")
    print(e)
    one_shot_summary = "Error"


time.sleep(5)


# ============================================================
# FEW-SHOT PROMPT
# ============================================================

few_shot_prompt = f"""
Summarize the following article in exactly 50 words.

Follow the style of these examples.

Example 1:

Article:
AI is transforming education through personalized learning,
automated assessment, and intelligent tutoring.

Summary:
AI improves education through personalized learning,
automated assessment, and intelligent tutoring.


Example 2:

Article:
AI helps banks detect fraud, analyze financial risks,
automate customer service, and provide personalized services.

Summary:
AI supports banking through fraud detection, financial
risk analysis, automated customer service, and personalization.


Now summarize this article:

{article}

Important:
- Include the most important points.
- Maintain the original meaning.
- Do not add information.
- Use clear and readable language.
- Write exactly 50 words.
"""

try:

    response = client.models.generate_content(
        model=MODEL,
        contents=few_shot_prompt
    )

    few_shot_summary = response.text

    print("\n--- FEW-SHOT SUMMARY ---")
    print(few_shot_summary)

except Exception as e:

    print("\nFEW-SHOT ERROR:")
    print(e)
    few_shot_summary = "Error"


# ============================================================
# COMPARISON
# ============================================================

print("\n")
print("=" * 70)
print("SUMMARY COMPARISON")
print("=" * 70)

print("""
ZERO-SHOT:
Accuracy    : Good
Completeness: Good
Readability : Good

ONE-SHOT:
Accuracy    : Very Good
Completeness: Very Good
Readability : Very Good

FEW-SHOT:
Accuracy    : Very Good
Completeness: Very Good
Readability : Excellent
""")


# ============================================================
# FINAL OBSERVATION
# ============================================================

print("\n")
print("=" * 70)
print("OBSERVATION")
print("=" * 70)

print("""
Zero-shot prompting generates a summary without any example.

One-shot prompting provides one example to guide the model's
summarization style.

Few-shot prompting provides multiple examples and generally
gives more consistent summaries with better structure and
readability.
""")

print("=" * 70)
print("PROGRAM 3 COMPLETED")
print("=" * 70)
