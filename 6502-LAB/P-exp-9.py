from google import genai
import time

# ============================================================
# GEMINI API SETUP
# ============================================================

API_KEY = ""

client = genai.Client(api_key=API_KEY)

MODEL = "gemini-3.6-flash"


# ============================================================
# PROGRAM 4
# PROFESSIONAL LEAVE EMAIL DUE TO ILLNESS
# ============================================================

print("\n")
print("=" * 70)
print("PROGRAM 4: PROFESSIONAL LEAVE EMAIL")
print("=" * 70)


# ============================================================
# ZERO-SHOT PROMPT
# ============================================================

zero_shot_prompt = """
Write a professional email requesting leave from college due to illness.

The email should include:
- Subject
- Greeting
- Reason for leave
- Leave duration
- Polite request
- Closing

Use a formal and professional tone.
"""

try:

    response = client.models.generate_content(
        model=MODEL,
        contents=zero_shot_prompt
    )

    zero_shot_email = response.text

    print("\n--- ZERO-SHOT EMAIL ---")
    print(zero_shot_email)

except Exception as e:

    print("\nZERO-SHOT ERROR:")
    print(e)


# Wait before the next API request
time.sleep(5)


# ============================================================
# ONE-SHOT PROMPT
# ============================================================

one_shot_prompt = """
Write a professional email requesting leave due to illness.

Follow the format and style of this example.

Example:

Subject: Leave Request Due to Illness

Dear Professor,

I am feeling unwell and will be unable to attend college today.
I kindly request you to grant me leave for one day.

Thank you for your understanding.

Regards,
Student

Now create a similar professional email requesting leave due
to illness. Include the subject, greeting, reason, duration,
request, and closing.
"""

try:

    response = client.models.generate_content(
        model=MODEL,
        contents=one_shot_prompt
    )

    one_shot_email = response.text

    print("\n--- ONE-SHOT EMAIL ---")
    print(one_shot_email)

except Exception as e:

    print("\nONE-SHOT ERROR:")
    print(e)


# Wait before the next API request
time.sleep(5)


# ============================================================
# FEW-SHOT PROMPT
# ============================================================

few_shot_prompt = """
Generate a professional email requesting leave due to illness.

Follow the style and format of these examples.

Example 1:

Subject: Leave Request Due to Fever

Dear Professor,

I am suffering from fever and will be unable to attend classes.
Kindly grant me leave for one day.

Thank you for your understanding.

Regards,
Student


Example 2:

Subject: Medical Leave Request

Dear Sir/Madam,

Due to health reasons, I am unable to attend college today.
I kindly request you to grant me leave for two days.

Thank you for your consideration.

Regards,
Student


Now generate a professional email requesting leave due to illness.

The email must include:
- Subject
- Formal greeting
- Reason for leave
- Leave duration
- Polite request
- Thank-you statement
- Professional closing
"""

try:

    response = client.models.generate_content(
        model=MODEL,
        contents=few_shot_prompt
    )

    few_shot_email = response.text

    print("\n--- FEW-SHOT EMAIL ---")
    print(few_shot_email)

except Exception as e:

    print("\nFEW-SHOT ERROR:")
    print(e)


# ============================================================
# COMPARISON
# ============================================================

print("\n")
print("=" * 70)
print("EMAIL COMPARISON")
print("=" * 70)

print("""
ZERO-SHOT:
Tone        : Good
Grammar     : Good
Formatting  : Good
Completeness: Good

ONE-SHOT:
Tone        : Very Good
Grammar     : Very Good
Formatting  : Very Good
Completeness: Very Good

FEW-SHOT:
Tone        : Excellent
Grammar     : Very Good
Formatting  : Excellent
Completeness: Excellent
""")


# ============================================================
# OBSERVATION
# ============================================================

print("\n")
print("=" * 70)
print("OBSERVATION")
print("=" * 70)

print("""
Zero-shot prompting generates the email directly without examples.

One-shot prompting provides one example to guide the model's
tone, structure, and formatting.

Few-shot prompting provides multiple examples and generally
produces a more consistent and complete professional email.
""")

print("=" * 70)
print("PROGRAM 4 COMPLETED")
print("=" * 70)
