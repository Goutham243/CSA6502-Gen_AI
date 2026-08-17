from google import genai

# ============================================================
# GEMINI API SETUP
# ============================================================

API_KEY = ""

client = genai.Client(api_key=API_KEY)

MODEL = "gemini-3.6-flash"


# ============================================================
# PROGRAM 1
# Zero-shot, One-shot and Few-shot
# Smart Fitness Watch Product Description
# ============================================================

print("\n")
print("=" * 70)
print("PROGRAM 1: SMART FITNESS WATCH PRODUCT DESCRIPTION")
print("=" * 70)


# ---------------- ZERO-SHOT ----------------

zero_shot_prompt = """
Generate a professional product description for a Smart Fitness Watch.

Include:
- Major features
- Fitness tracking
- Heart-rate monitoring
- Sleep tracking
- Battery life
- Design
- Benefits to users
"""

response = client.models.generate_content(
    model=MODEL,
    contents=zero_shot_prompt
)

print("\n--- ZERO-SHOT PROMPT OUTPUT ---")
print(response.text)


# ---------------- ONE-SHOT ----------------

one_shot_prompt = """
Generate a professional product description for a Smart Fitness Watch.

Follow the style of this example:

Example:
Product: Smart Wireless Earbuds

Description:
Experience high-quality sound with these compact wireless earbuds.
They provide excellent audio quality, long battery life, comfortable
fitting, and easy Bluetooth connectivity. They are ideal for music,
calls, and everyday use.

Now create a similar product description for:

Smart Fitness Watch
"""

response = client.models.generate_content(
    model=MODEL,
    contents=one_shot_prompt
)

print("\n--- ONE-SHOT PROMPT OUTPUT ---")
print(response.text)


# ---------------- FEW-SHOT ----------------

few_shot_prompt = """
Generate a professional product description for a Smart Fitness Watch.

Follow the style of these examples.

Example 1:
Product: Smart Wireless Earbuds

Description:
Compact wireless earbuds with powerful sound, noise cancellation,
comfortable fitting, and long battery life. They provide a convenient
audio experience for everyday users.

Example 2:
Product: Smart Backpack

Description:
A modern and durable backpack with multiple compartments, USB charging,
water-resistant material, and an ergonomic design. It is suitable for
students and professionals.

Now create a product description for:

Smart Fitness Watch

Include fitness tracking, heart-rate monitoring, sleep tracking,
battery life, display, connectivity, and user benefits.
"""

response = client.models.generate_content(
    model=MODEL,
    contents=few_shot_prompt
)

print("\n--- FEW-SHOT PROMPT OUTPUT ---")
print(response.text)

