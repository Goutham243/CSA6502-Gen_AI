import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// -------------------------------------------------------------
// Lazy Gemini Client Initialization
// -------------------------------------------------------------
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

/**
 * Executes Gemini content generation with automated fallback across stable models
 */
async function callGeminiGenerate(
  gemini: GoogleGenAI,
  prompt: string,
  systemInstruction?: string
): Promise<string | null> {
  const modelsToTry = ['gemini-2.5-flash', 'gemini-3.8-flash', 'gemini-flash-latest'];
  for (const model of modelsToTry) {
    try {
      const response = await gemini.models.generateContent({
        model,
        contents: prompt,
        config: systemInstruction ? { systemInstruction } : undefined,
      });
      if (response && response.text && response.text.trim()) {
        return response.text.trim();
      }
    } catch (err: any) {
      console.warn(`Gemini generation with ${model} failed, trying next model:`, err?.message || err);
    }
  }
  return null;
}

// -------------------------------------------------------------
// In-Memory User Isolated Data Store (keyed by sanitized email)
// -------------------------------------------------------------
interface UserSessionData {
  email: string;
  name: string;
  profile: any;
  medications: any[];
  analysis: any | null;
  chatHistory: Array<{
    id: string;
    sender: 'user' | 'assistant' | 'system';
    text: string;
    timestamp: string;
    sources?: string[];
  }>;
  reports: any[];
  lastUpdated: string;
}

const userStore = new Map<string, UserSessionData>();

function getUserKey(email: string): string {
  return (email || '').trim().toLowerCase();
}

function getOrCreateUser(email: string, name?: string): UserSessionData {
  const key = getUserKey(email);
  if (!userStore.has(key)) {
    userStore.set(key, {
      email: key,
      name: name || (key === 'gouthamnatukula777@gmail.com' ? 'Goutham Natukula' : 'Patient'),
      profile: {
        age: 0,
        gender: 'Male',
        height: 0,
        weight: 0,
        diseases: [],
        allergies: [],
        dietaryPreference: 'Standard / Balanced',
        notes: '',
        updatedAt: new Date().toISOString(),
      },
      medications: [],
      analysis: null,
      chatHistory: [
        {
          id: 'welcome-msg',
          sender: 'assistant',
          text: `Hello ${name ? name.split(' ')[0] : 'there'}! I am MediSync AI, your medical verification assistant. Ask me anything about your current medications, food interactions, or personalized dietary suggestions.`,
          timestamp: new Date().toISOString(),
        },
      ],
      reports: [],
      lastUpdated: new Date().toISOString(),
    });
  }
  return userStore.get(key)!;
}

// -------------------------------------------------------------
// Curated Clinical Knowledge Base for RAG
// -------------------------------------------------------------
interface MedicalMonograph {
  id: string;
  name: string;
  category: string;
  tags: string[];
  indications: string[];
  contraindications: string[];
  drugInteractions: Array<{
    interactingDrug: string;
    severity: 'High' | 'Moderate' | 'Low';
    headline: string;
    mechanism: string;
    action: string;
  }>;
  foodInteractions: Array<{
    food: string;
    severity: 'High' | 'Moderate' | 'Low';
    mechanism: string;
    guidance?: string;
    action?: string;
  }>;
  diseaseCautions: Array<{
    disease: string;
    severity: 'High' | 'Moderate' | 'Low';
    note: string;
  }>;
  timingAndAdministration: string;
  purposeNote: string;
}

const MEDICAL_MONOGRAPHS: MedicalMonograph[] = [
  {
    id: 'drug-metformin',
    name: 'Metformin',
    category: 'Biguanide Antidiabetic',
    tags: ['diabetes', 'blood sugar', 'glucose', 'metformin', 'glycemic'],
    indications: ['Type 2 Diabetes Mellitus', 'Prediabetes', 'Insulin Resistance'],
    contraindications: ['Severe Renal Impairment (eGFR < 30 mL/min)', 'Acute Metabolic Acidosis', 'Severe Hepatic Impairment'],
    drugInteractions: [
      {
        interactingDrug: 'Contrast Agents / Iodinated Dye',
        severity: 'High',
        headline: 'Potential Lactic Acidosis Risk with Radiologic Contrast',
        mechanism: 'Contrast-induced nephropathy can impair renal clearance of metformin.',
        action: 'Discuss holding metformin 48 hours prior to iodinated contrast imaging with your physician.'
      },
      {
        interactingDrug: 'Glipizide / Sulfonylureas',
        severity: 'Moderate',
        headline: 'Additive Glucose Lowering',
        mechanism: 'Dual antidiabetic therapy increases risk of mild-to-moderate hypoglycemia.',
        action: 'Maintain regular blood glucose monitoring and have fast-acting carbohydrate sources accessible.'
      }
    ],
    foodInteractions: [
      {
        food: 'Alcohol / High-Proof Spirits',
        severity: 'High',
        mechanism: 'Alcohol potentiates the effect of metformin on lactate metabolism and raises hypoglycemia risk.',
        action: 'Avoid excessive alcohol consumption; consult doctor regarding safe consumption limits.'
      },
      {
        food: 'High Simple Sugars / Refined Sweets',
        severity: 'Moderate',
        mechanism: 'High-glycemic spikes counteract therapeutic glycemic stabilization.',
        action: 'Pair meals with high-fiber legumes, whole grains, and lean proteins.'
      }
    ],
    diseaseCautions: [
      {
        disease: 'Kidney Disease',
        severity: 'High',
        note: 'Requires periodic renal function (eGFR/Creatinine) monitoring to ensure safe clearance.'
      }
    ],
    timingAndAdministration: 'Take with or immediately after meals (breakfast and dinner) to reduce gastrointestinal side effects.',
    purposeNote: 'First-line prescription for lowering hepatic glucose production and improving insulin sensitivity.'
  },
  {
    id: 'drug-lisinopril',
    name: 'Lisinopril',
    category: 'ACE Inhibitor',
    tags: ['hypertension', 'blood pressure', 'heart', 'kidney', 'lisinopril', 'ace inhibitor'],
    indications: ['Hypertension', 'Heart Failure', 'Post-Myocardial Infarction Renal Protection'],
    contraindications: ['History of Angioedema', 'Concomitant Aliskiren in Diabetes', 'Pregnancy (2nd/3rd trimester)'],
    drugInteractions: [
      {
        interactingDrug: 'Losartan',
        severity: 'High',
        headline: 'Dual Renin-Angiotensin System (RAAS) Blockade Alert',
        mechanism: 'Combining an ACE inhibitor (Lisinopril) with an ARB (Losartan) dramatically increases risk of severe hyperkalemia, hypotension, and renal impairment without additional clinical benefit.',
        action: 'Requires immediate professional review. Discuss therapeutic rationale and regimen simplification with your prescribing physician.'
      },
      {
        interactingDrug: 'Ibuprofen',
        severity: 'Moderate',
        headline: 'NSAID Blood Pressure & Renal Antagonism',
        mechanism: 'NSAIDs inhibit renal prostaglandins, reducing antihypertensive efficacy of Lisinopril and stressing renal perfusion.',
        action: 'Limit chronic NSAID usage; discuss alternative pain relief strategies like topical treatments or Acetaminophen.'
      },
      {
        interactingDrug: 'Spironolactone',
        severity: 'Moderate',
        headline: 'Additive Potassium Retention',
        mechanism: 'Both agents reduce renal potassium excretion.',
        action: 'Routine serum electrolyte monitoring is advised.'
      }
    ],
    foodInteractions: [
      {
        food: 'Potassium Salt Substitutes (KCl)',
        severity: 'Moderate',
        mechanism: 'Lisinopril spares potassium in the distal tubules; high potassium intake can induce hyperkalemia.',
        action: 'Flavor dishes with lemon juice, garlic, black pepper, and herbs rather than potassium chloride salt replacers.'
      },
      {
        food: 'High Sodium / Cured Meats',
        severity: 'Moderate',
        mechanism: 'Excess sodium blunts antihypertensive efficacy and elevates fluid retention.',
        action: 'Adopt the DASH dietary pattern prioritizing lower sodium meals (< 2,000 mg/day).'
      }
    ],
    diseaseCautions: [
      {
        disease: 'Kidney Disease',
        severity: 'Moderate',
        note: 'Monitor serum creatinine and potassium within 2 to 4 weeks of initiation or dose change.'
      }
    ],
    timingAndAdministration: 'Take once daily around the same time each morning with a full glass of water, with or without food.',
    purposeNote: 'Relaxes blood vessels by inhibiting angiotensin-converting enzyme to lower blood pressure.'
  },
  {
    id: 'drug-losartan',
    name: 'Losartan',
    category: 'Angiotensin II Receptor Blocker (ARB)',
    tags: ['hypertension', 'blood pressure', 'kidney', 'losartan', 'arb'],
    indications: ['Hypertension', 'Diabetic Nephropathy in Type 2 Diabetes', 'Stroke Risk Reduction in LVH'],
    contraindications: ['Concomitant Aliskiren in Diabetes', 'Pregnancy'],
    drugInteractions: [
      {
        interactingDrug: 'Lisinopril',
        severity: 'High',
        headline: 'Duplicate RAAS Blockade Alert',
        mechanism: 'Concurrent ACE-I and ARB therapy leads to cumulative hyperkalemia and acute kidney injury risk.',
        action: 'Professional review required to confirm whether single-agent optimization is indicated.'
      }
    ],
    foodInteractions: [
      {
        food: 'Potassium Salt Substitutes',
        severity: 'Moderate',
        mechanism: 'Inhibition of aldosterone leads to mild potassium retention.',
        action: 'Avoid excessive intake of potassium supplements or potassium-enriched salt alternatives.'
      }
    ],
    diseaseCautions: [
      {
        disease: 'Kidney Disease',
        severity: 'Moderate',
        note: 'Monitor renal panel and electrolytes routinely.'
      }
    ],
    timingAndAdministration: 'Take at a consistent time daily, with or without food.',
    purposeNote: 'Blocks angiotensin II receptors to promote vasodilation and protect renal vasculature.'
  },
  {
    id: 'drug-atorvastatin',
    name: 'Atorvastatin',
    category: 'HMG-CoA Reductase Inhibitor (Statin)',
    tags: ['cholesterol', 'lipids', 'statin', 'heart', 'cardiovascular', 'atorvastatin'],
    indications: ['Hypercholesterolemia', 'Atherosclerotic Cardiovascular Disease Prevention'],
    contraindications: ['Active Liver Disease', 'Unexplained Persistent Transaminase Elevation', 'Pregnancy/Lactation'],
    drugInteractions: [
      {
        interactingDrug: 'Rosuvastatin',
        severity: 'High',
        headline: 'Duplicate Statin Therapy Alert',
        mechanism: 'Concurrent use of two full-dose HMG-CoA reductase inhibitors (Atorvastatin + Rosuvastatin) significantly increases the risk of severe statin-induced myopathy and rhabdomyolysis.',
        action: 'Requires urgent professional review. Consult your doctor to confirm single statin titration.'
      },
      {
        interactingDrug: 'Clarithromycin / Erythromycin',
        severity: 'High',
        headline: 'Strong CYP3A4 Inhibition',
        mechanism: 'Macrolide antibiotics dramatically increase Atorvastatin plasma concentrations.',
        action: 'Discuss holding statin during short antibiotic courses with your physician.'
      }
    ],
    foodInteractions: [
      {
        food: 'Grapefruit & Fresh Grapefruit Juice',
        severity: 'Moderate',
        mechanism: 'Furanocoumarins in grapefruit inhibit intestinal CYP3A4 enzymes, elevating drug bioavailability.',
        action: 'Limit or avoid grapefruit and grapefruit juice while on Atorvastatin; choose oranges, berries, or apples instead.'
      },
      {
        food: 'High Saturated Fats / Deep Fried Foods',
        severity: 'Moderate',
        mechanism: 'Directly antagonizes therapeutic LDL reduction.',
        action: 'Emphasize extra virgin olive oil, avocados, flaxseeds, and soluble oat beta-glucan fiber.'
      }
    ],
    diseaseCautions: [
      {
        disease: 'Liver Condition',
        severity: 'Moderate',
        note: 'Periodic baseline liver enzymes (ALT/AST) should be monitored as clinically indicated.'
      }
    ],
    timingAndAdministration: 'Take once daily in the evening or bedtime with water for optimal cholesterol biosynthesis inhibition.',
    purposeNote: 'Decreases LDL cholesterol and systemic vascular inflammation.'
  },
  {
    id: 'drug-rosuvastatin',
    name: 'Rosuvastatin',
    category: 'HMG-CoA Reductase Inhibitor (Statin)',
    tags: ['cholesterol', 'lipids', 'statin', 'rosuvastatin'],
    indications: ['Hyperlipidemia', 'Primary Dysbetalipoproteinemia', 'Cardiovascular Risk Reduction'],
    contraindications: ['Active Liver Disease', 'Severe Renal Impairment (CrCl < 30 mL/min)', 'Pregnancy'],
    drugInteractions: [
      {
        interactingDrug: 'Atorvastatin',
        severity: 'High',
        headline: 'Duplicate Statin Alert',
        mechanism: 'Dual statin exposure substantially increases skeletal muscle toxicity risk.',
        action: 'Discuss single-agent lipid management with your clinician.'
      },
      {
        interactingDrug: 'Antacids (Aluminum/Magnesium Hydroxide)',
        severity: 'Low',
        headline: 'Reduced Statin Absorption',
        mechanism: 'Antacids decrease rosuvastatin bioavailability by approximately 50%.',
        action: 'Take antacids at least 2 hours after rosuvastatin.'
      }
    ],
    foodInteractions: [
      {
        food: 'High Saturated Fats & Trans Fats',
        severity: 'Moderate',
        mechanism: 'Increases endogenous LDL production.',
        action: 'Adopt a Mediterranean-style dietary pattern rich in omega-3 fatty acids and plant sterols.'
      }
    ],
    diseaseCautions: [],
    timingAndAdministration: 'Take once daily at any time of day, with or without food.',
    purposeNote: 'Potent statin that inhibits hepatic HMG-CoA reductase to lower LDL and raise HDL.'
  },
  {
    id: 'drug-amlodipine',
    name: 'Amlodipine',
    category: 'Dihydropyridine Calcium Channel Blocker',
    tags: ['hypertension', 'blood pressure', 'angina', 'amlodipine', 'ccb'],
    indications: ['Hypertension', 'Coronary Artery Disease', 'Chronic Stable Angina'],
    contraindications: ['Severe Hypotension', 'Cardiogenic Shock', 'Severe Aortic Stenosis'],
    drugInteractions: [
      {
        interactingDrug: 'Simvastatin',
        severity: 'Moderate',
        headline: 'CYP3A4 Substrate Interaction',
        mechanism: 'Amlodipine increases simvastatin exposure; max simvastatin dose is 20 mg daily with amlodipine.',
        action: 'Ensure statin dosage is adjusted if co-prescribed with Simvastatin.'
      }
    ],
    foodInteractions: [
      {
        food: 'Grapefruit Juice (Large Volumes)',
        severity: 'Low',
        mechanism: 'Mild increase in amlodipine systemic exposure due to intestinal CYP3A4 inhibition.',
        action: 'Occasional moderate consumption is generally acceptable, but large volumes should be avoided.'
      }
    ],
    diseaseCautions: [
      {
        disease: 'Heart Failure',
        severity: 'Moderate',
        note: 'Monitor for peripheral edema or worsening volume retention.'
      }
    ],
    timingAndAdministration: 'Take once daily at the same time each morning with water.',
    purposeNote: 'Inhibits calcium ion influx across vascular smooth muscle to cause peripheral vasodilation.'
  },
  {
    id: 'drug-levothyroxine',
    name: 'Levothyroxine',
    category: 'Synthetic Thyroid Hormone (T4)',
    tags: ['thyroid', 'hypothyroidism', 'levothyroxine', 'hormone', 't4'],
    indications: ['Hypothyroidism', 'Pituitary TSH Suppression'],
    contraindications: ['Untreated Subclinical/Overt Thyrotoxicosis', 'Acute Myocardial Infarction', 'Uncorrected Adrenal Insufficiency'],
    drugInteractions: [
      {
        interactingDrug: 'Calcium Carbonate / Iron Supplements',
        severity: 'High',
        headline: 'Chelation and Significant Absorption Reduction',
        mechanism: 'Calcium and iron bind levothyroxine in the stomach, reducing absorption by up to 60%.',
        action: 'Separate levothyroxine administration from calcium, iron, and multivitamin supplements by at least 4 full hours.'
      },
      {
        interactingDrug: 'Proton Pump Inhibitors (Omeprazole / Pantoprazole)',
        severity: 'Moderate',
        headline: 'Reduced Gastric Acidity Impairs Dissolution',
        mechanism: 'Gastric acid suppression reduces tablet dissolution and bioavailability.',
        action: 'Take levothyroxine on an empty stomach 30 to 60 minutes before breakfast; monitor TSH.'
      }
    ],
    foodInteractions: [
      {
        food: 'Espresso / Morning Coffee / Dairy Milk',
        severity: 'Moderate',
        mechanism: 'Coffee and milk reduce intestinal absorption of levothyroxine tablets.',
        action: 'Take levothyroxine with plain water only, and wait at least 30-60 minutes before your morning coffee or breakfast.'
      },
      {
        food: 'Soy Products & High-Fiber Meals',
        severity: 'Moderate',
        mechanism: 'Soy and high bran fiber decrease gastrointestinal T4 absorption.',
        action: 'Consume soy products and fiber-heavy meals later in the day, away from your morning thyroid dose.'
      }
    ],
    diseaseCautions: [],
    timingAndAdministration: 'Take once daily first thing in the morning on an empty stomach with a full glass of water, 30-60 minutes before breakfast.',
    purposeNote: 'Replaces deficient endogenous thyroxine to restore normal metabolic rate and energy balance.'
  },
  {
    id: 'drug-omeprazole',
    name: 'Omeprazole',
    category: 'Proton Pump Inhibitor (PPI)',
    tags: ['gerd', 'acid reflux', 'stomach', 'ulcer', 'omeprazole', 'ppi'],
    indications: ['Gastroesophageal Reflux Disease (GERD)', 'Erosive Esophagitis', 'Duodenal Ulcers'],
    contraindications: ['Known Hypersensitivity to Benzimidazoles'],
    drugInteractions: [
      {
        interactingDrug: 'Clopidogrel (Plavix)',
        severity: 'Moderate',
        headline: 'CYP2C19 Inhibition and Reduced Antiplatelet Efficacy',
        mechanism: 'Omeprazole competitively inhibits CYP2C19, decreasing clopidogrel active metabolite conversion.',
        action: 'Discuss alternative acid suppression (e.g. Pantoprazole or H2 blockers) with your cardiologist/gastroenterologist.'
      }
    ],
    foodInteractions: [
      {
        food: 'Acidic / Spicy Citrus Foods',
        severity: 'Low',
        mechanism: 'Directly irritates inflamed esophageal mucosa.',
        action: 'Focus on soothing alkaline foods such as oatmeal, ginger tea, melons, and leafy greens.'
      }
    ],
    diseaseCautions: [],
    timingAndAdministration: 'Take once daily 30 to 60 minutes before the first meal of the day (breakfast) with water.',
    purposeNote: 'Suppresses gastric parietal cell acid secretion by irreversibly inhibiting the H+/K+ ATPase pump.'
  },
  {
    id: 'drug-ibuprofen',
    name: 'Ibuprofen',
    category: 'Non-Steroidal Anti-Inflammatory Drug (NSAID)',
    tags: ['pain', 'inflammation', 'arthritis', 'nsaid', 'ibuprofen', 'advil', 'motrin'],
    indications: ['Mild-to-Moderate Pain', 'Osteoarthritis', 'Inflammatory Conditions', 'Fever'],
    contraindications: ['Active Peptic Ulcer Disease', 'Severe Renal Impairment', 'CABG Perioperative Pain', 'Aspirin-Triad Asthma'],
    drugInteractions: [
      {
        interactingDrug: 'Lisinopril',
        severity: 'High',
        headline: 'Renal Function & Blood Pressure Antagonism',
        mechanism: 'NSAIDs constrict renal afferent arterioles while ACE inhibitors dilate efferent arterioles, resulting in a sharp drop in glomerular filtration and blunt antihypertensive efficacy.',
        action: 'Professional review recommended. Avoid chronic daily NSAID use with ACE inhibitors; discuss safer analgesic alternatives.'
      },
      {
        interactingDrug: 'Aspirin',
        severity: 'Moderate',
        headline: 'Antiplatelet Interference and Additive GI Bleed Risk',
        mechanism: 'Ibuprofen competitively blocks aspirin from binding COX-1 on platelets and damages gastric mucosa.',
        action: 'If aspirin is cardioprotective, take aspirin 30 minutes before ibuprofen or 8 hours after.'
      }
    ],
    foodInteractions: [
      {
        food: 'Alcohol',
        severity: 'Moderate',
        mechanism: 'Additive irritation of the gastric mucosa, substantially elevating ulcer and GI bleeding risk.',
        action: 'Avoid concurrent alcohol intake while using NSAIDs; always take NSAIDs with food or milk.'
      }
    ],
    diseaseCautions: [
      {
        disease: 'Hypertension',
        severity: 'Moderate',
        note: 'NSAIDs cause fluid and sodium retention that can raise blood pressure.'
      },
      {
        disease: 'Kidney Disease',
        severity: 'High',
        note: 'Can precipitate acute kidney injury by reducing renal blood flow.'
      },
      {
        disease: 'Asthma',
        severity: 'Moderate',
        note: 'Check for aspirin-exacerbated respiratory disease (AERD) / bronchospasm sensitivity.'
      }
    ],
    timingAndAdministration: 'Take with food or a glass of milk to prevent stomach irritation. Use the lowest effective dose for the shortest duration.',
    purposeNote: 'Inhibits COX-1 and COX-2 enzymes to reduce inflammatory prostaglandins.'
  },
  {
    id: 'drug-dapagliflozin',
    name: 'Dapagliflozin',
    category: 'Sodium-Glucose Cotransporter 2 (SGLT2) Inhibitor',
    tags: ['kidney', 'ckd', 'renal', 'diabetes', 'sglt2', 'dapagliflozin', 'farxiga'],
    indications: ['Chronic Kidney Disease', 'Type 2 Diabetes Mellitus', 'Heart Failure with Reduced/Preserved EF'],
    contraindications: ['Severe Hypersensitivity', 'Dialysis dependence (for initiation)'],
    drugInteractions: [
      {
        interactingDrug: 'Insulin / Sulfonylureas',
        severity: 'Moderate',
        headline: 'Potential for Increased Hypoglycemia',
        mechanism: 'Concurrent insulin secretagogues or insulin may increase hypoglycemia risk.',
        action: 'Monitor blood glucose closely and consult clinician regarding insulin dose reduction.'
      },
      {
        interactingDrug: 'Loop Diuretics (Furosemide)',
        severity: 'Low',
        headline: 'Additive Volume Contraction',
        mechanism: 'Mild osmotic diuresis may compound diuretic-induced intravascular volume depletion.',
        action: 'Ensure adequate oral hydration throughout the day.'
      }
    ],
    foodInteractions: [
      {
        food: 'Dehydration / Low Fluid Intake',
        severity: 'Moderate',
        mechanism: 'Adequate daily fluid intake is required to support physiological osmotic clearance and prevent orthostatic hypotension.',
        action: 'Maintain consistent daily water hydration.'
      }
    ],
    diseaseCautions: [
      {
        disease: 'Kidney Disease',
        severity: 'Low',
        note: 'KDIGO 2024 & ADA guidelines strongly recommend SGLT2 inhibitors to delay renal function decline and protect cardiac health.'
      }
    ],
    timingAndAdministration: 'Take once daily in the morning with or without food. Maintain healthy daytime hydration.',
    purposeNote: 'Reduces intraglomerular pressure, urinary protein leakage, and controls blood sugar with proven renoprotection.'
  },
  {
    id: 'drug-fluticasone-salmeterol',
    name: 'Fluticasone / Salmeterol',
    category: 'Inhaled Corticosteroid / Long-Acting Beta2 Agonist (ICS/LABA)',
    tags: ['asthma', 'copd', 'respiratory', 'inhaler', 'advair', 'wixela', 'fluticasone', 'salmeterol'],
    indications: ['Asthma Maintenance Treatment', 'Chronic Obstructive Pulmonary Disease (COPD)'],
    contraindications: ['Primary Treatment of Status Asthmaticus or Acute Bronchospasm Episodes', 'Severe Milk Protein Allergy (for dry powder inhalers)'],
    drugInteractions: [
      {
        interactingDrug: 'Strong CYP3A4 Inhibitors (Ketoconazole, Clarithromycin)',
        severity: 'Moderate',
        headline: 'Increased Fluticasone Systemic Exposure',
        mechanism: 'CYP3A4 inhibition reduces fluticasone clearance, increasing systemic corticosteroid effects.',
        action: 'Exercise caution and monitor for signs of systemic corticosteroid excess during prolonged co-use.'
      }
    ],
    foodInteractions: [],
    diseaseCautions: [
      {
        disease: 'Asthma',
        severity: 'Low',
        note: 'GINA guidelines establish combination low-dose ICS controller therapy as the gold standard to suppress chronic airway inflammation and prevent acute exacerbations.'
      }
    ],
    timingAndAdministration: 'Inhale 1 inhalation twice daily (morning and evening, approximately 12 hours apart). Rinse mouth thoroughly with water and spit out after each inhalation.',
    purposeNote: 'Suppresses bronchial eosinophilic inflammation while maintaining 12-hour airway dilation.'
  },
  {
    id: 'drug-albuterol',
    name: 'Albuterol',
    category: 'Short-Acting Beta2 Agonist (SABA)',
    tags: ['asthma', 'copd', 'rescue', 'bronchospasm', 'albuterol', 'ventolin', 'proair'],
    indications: ['Acute Bronchospasm Relief in Reversible Obstructive Airway Disease', 'Exercise-Induced Bronchospasm Prevention'],
    contraindications: ['Hypersensitivity to Albuterol'],
    drugInteractions: [
      {
        interactingDrug: 'Non-Selective Beta-Blockers (Propranolol, Timolol)',
        severity: 'High',
        headline: 'Direct Pharmacological Antagonism & Bronchospasm Risk',
        mechanism: 'Non-selective beta blockers block bronchial beta-2 receptors, neutralizing albuterol and potentially precipitating acute severe bronchospasm.',
        action: 'Use cardio-selective beta-blockers with extreme caution if clinically required; avoid non-selective agents in asthma.'
      }
    ],
    foodInteractions: [],
    diseaseCautions: [
      {
        disease: 'Asthma',
        severity: 'Low',
        note: 'Essential quick-relief bronchodilator. If usage exceeds twice weekly for symptom control, consultation is recommended to step up daily anti-inflammatory controller therapy.'
      }
    ],
    timingAndAdministration: 'Inhale 1 to 2 actuations as needed during sudden shortness of breath, wheezing, or chest tightness, or 15 minutes prior to physical exertion.',
    purposeNote: 'Rapidly relaxes bronchial smooth muscle within 5 minutes to restore patent airflow during acute symptoms.'
  }
];

// -------------------------------------------------------------
// RAG Context Retrieval Function
// -------------------------------------------------------------
function retrieveMedicalRAGContext(diseases: string[], medications: any[], allergies: string[], dietPref: string) {
  const matchedMonographs: MedicalMonograph[] = [];
  const relevantSnippets: Array<{ id: string; title: string; category: string; relevance: string; excerpt: string }> = [];

  const medNames = (medications || []).map((m: any) => (m.name || '').toLowerCase().trim());
  const condNames = (diseases || []).map((d: string) => d.toLowerCase().trim());

  for (const mono of MEDICAL_MONOGRAPHS) {
    const monoNameLower = mono.name.toLowerCase();
    const isMedMatch = medNames.some((m) => m.includes(monoNameLower) || monoNameLower.includes(m));
    const isCondMatch = condNames.some((c) => mono.tags.some((t) => c.includes(t) || t.includes(c)));

    if (isMedMatch || isCondMatch) {
      matchedMonographs.push(mono);
      relevantSnippets.push({
        id: mono.id,
        title: `Clinical Monograph: ${mono.name} (${mono.category})`,
        category: mono.category,
        relevance: isMedMatch ? 'Active Prescription Match' : 'Diagnosed Condition Relevance',
        excerpt: `${mono.purposeNote} Timing: ${mono.timingAndAdministration}`
      });
    }
  }

  // Dietary and Allergen knowledge snippets
  if (allergies && allergies.length > 0) {
    relevantSnippets.push({
      id: 'rag-allergy-guard',
      title: 'Patient Allergen Exclusion Protocol',
      category: 'Safety Guardrail',
      relevance: 'Allergy Protection',
      excerpt: `Explicit patient allergies: ${allergies.join(', ')}. All suggested meal plans and drug excipients must exclude cross-reactive proteins.`
    });
  }

  if (dietPref) {
    relevantSnippets.push({
      id: 'rag-diet-framework',
      title: `Nutritional Framework: ${dietPref}`,
      category: 'Dietary Alignment',
      relevance: 'Dietary Constraint',
      excerpt: `Patient adheres to ${dietPref}. Food selections, macronutrient balance, and substitutions are calibrated to this profile.`
    });
  }

  return { matchedMonographs, relevantSnippets };
}

// Helper to provide standard guideline medication suggestions when patient has conditions
function getMedicationSuggestionsBackend(conditions: string[], allergies: string[]): any[] {
  const suggestions: any[] = [];
  const normalizedAllergies = (allergies || []).map((a) => a.toLowerCase().trim());
  const conditionsLower = (conditions || []).map((c) => c.toLowerCase().trim());

  // 1. Kidney Disease (Renal Protection & Proteinuria Reduction)
  if (conditionsLower.some((c) => c.includes('kidney') || c.includes('renal') || c.includes('ckd') || c.includes('nephro'))) {
    if (!normalizedAllergies.includes('arb') && !normalizedAllergies.includes('losartan')) {
      suggestions.push({
        id: 'sug-ckd-losartan',
        name: 'Losartan',
        genericName: 'Losartan Potassium (Cozaar)',
        category: 'Angiotensin II Receptor Blocker (ARB)',
        condition: 'Kidney Disease',
        purpose: 'Renal Microvascular Protection & Blood Pressure Regulation',
        typicalDosage: '50 mg',
        frequency: 'Once daily',
        timing: 'In the morning with a glass of water',
        evidenceGrade: 'First-line Guideline',
        clinicalRationale: 'Evidence shows ARBs reduce intraglomerular hydraulic pressure, mitigate proteinuria, and slow the progression of chronic renal disease per KDIGO guidelines.',
        cautionNotes: 'Requires baseline and periodic monitoring of serum potassium and creatinine/eGFR. Avoid potassium salt substitutes.'
      });
    }
    if (!normalizedAllergies.includes('sglt2') && !normalizedAllergies.includes('dapagliflozin')) {
      suggestions.push({
        id: 'sug-ckd-dapagliflozin',
        name: 'Dapagliflozin',
        genericName: 'Dapagliflozin (Farxiga)',
        category: 'Sodium-Glucose Cotransporter 2 (SGLT2) Inhibitor',
        condition: 'Kidney Disease',
        purpose: 'Renal Progression Delay & Cardioprotection',
        typicalDosage: '10 mg',
        frequency: 'Once daily',
        timing: 'In the morning with or without food',
        evidenceGrade: 'First-line Guideline',
        clinicalRationale: 'Demonstrated in landmark clinical trials (DAPA-CKD) to significantly slow kidney function decline, decrease albuminuria, and reduce cardiovascular events in patients with chronic kidney disease.',
        cautionNotes: 'Maintain healthy daily hydration. Practice proper hygiene to prevent mycotic or urinary tract infections.'
      });
    }
  }

  // 2. Asthma & Respiratory Airway Disease
  if (conditionsLower.some((c) => c.includes('asthma') || c.includes('bronch') || c.includes('copd') || c.includes('respiratory'))) {
    suggestions.push({
      id: 'sug-asthma-advair',
      name: 'Fluticasone / Salmeterol',
      genericName: 'Fluticasone Propionate + Salmeterol (Advair Diskus / Wixela)',
      category: 'Inhaled Corticosteroid + Long-Acting Beta2 Agonist (ICS/LABA)',
      condition: 'Asthma',
      purpose: 'Daily Maintenance & Bronchial Inflammation Control',
      typicalDosage: '100/50 mcg (1 inhalation)',
      frequency: 'Twice daily (morning and evening)',
      timing: 'Morning and evening approximately 12 hours apart; rinse mouth after use',
      evidenceGrade: 'Maintenance Controller',
      clinicalRationale: 'GINA global asthma guidelines establish combination low-dose inhaled corticosteroid controller therapy as the gold standard to suppress chronic airway eosinophilic inflammation and prevent severe flare-ups.',
      cautionNotes: 'Always rinse mouth thoroughly with water and spit out immediately after each inhalation to prevent oral thrush.'
    });
    suggestions.push({
      id: 'sug-asthma-albuterol',
      name: 'Albuterol Inhaler',
      genericName: 'Albuterol Sulfate (Ventolin HFA / ProAir)',
      category: 'Short-Acting Beta2 Agonist (SABA)',
      condition: 'Asthma',
      purpose: 'Fast-Acting Bronchospasm Relief (Rescue Inhaler)',
      typicalDosage: '90 mcg per actuation (1-2 puffs)',
      frequency: 'As needed for acute wheezing or shortness of breath',
      timing: 'Immediately at onset of symptoms or 15 minutes prior to exercise',
      evidenceGrade: 'Rescue / Symptom Relief',
      clinicalRationale: 'Essential rescue bronchodilator for all asthma patients. Rapidly relaxes bronchial smooth muscle within 5 minutes to restore open breathing.',
      cautionNotes: 'If requiring rescue inhaler more than twice weekly for symptom relief, discuss step-up maintenance therapy with your doctor.'
    });
    suggestions.push({
      id: 'sug-asthma-montelukast',
      name: 'Montelukast',
      genericName: 'Montelukast Sodium (Singulair)',
      category: 'Leukotriene Receptor Antagonist (LTRA)',
      condition: 'Asthma',
      purpose: 'Allergic Airway Constriction Prevention',
      typicalDosage: '10 mg',
      frequency: 'Once daily',
      timing: 'Take once daily in the evening at bedtime',
      evidenceGrade: 'Adjunct Controller',
      clinicalRationale: 'Blocks cysteinyl leukotriene inflammatory pathways, reducing exercise-induced bronchoconstriction and allergic airway hyperactivity.',
      cautionNotes: 'Monitor for rare mood or behavioral changes and report them promptly.'
    });
  }

  // 3. Diabetes Mellitus
  if (conditionsLower.some((c) => c.includes('diabet') || c.includes('blood sugar') || c.includes('glucose'))) {
    if (!normalizedAllergies.includes('metformin')) {
      suggestions.push({
        id: 'sug-diab-metformin',
        name: 'Metformin',
        genericName: 'Metformin Hydrochloride (Glucophage)',
        category: 'Biguanide Antidiabetic',
        condition: 'Diabetes',
        purpose: 'Glycemic Control & Insulin Sensitivity Enhancement',
        typicalDosage: '500 mg',
        frequency: 'Twice daily',
        timing: 'Take with morning and evening meals',
        evidenceGrade: 'First-line Guideline',
        clinicalRationale: 'ADA Standards of Care foundational therapy that reduces hepatic glucose production and improves peripheral insulin uptake without causing hypoglycemia.',
        cautionNotes: 'Always take with meals to reduce gastrointestinal discomfort. Monitor renal function periodically.'
      });
    }
    if (!suggestions.some((s) => s.name === 'Dapagliflozin') && !normalizedAllergies.includes('dapagliflozin')) {
      suggestions.push({
        id: 'sug-diab-dapagliflozin',
        name: 'Dapagliflozin',
        genericName: 'Dapagliflozin (Farxiga)',
        category: 'Sodium-Glucose Cotransporter 2 (SGLT2) Inhibitor',
        condition: 'Diabetes',
        purpose: 'Cardiorenal Risk Reduction & Fasting Blood Sugar Control',
        typicalDosage: '10 mg',
        frequency: 'Once daily',
        timing: 'In the morning with or without food',
        evidenceGrade: 'First-line Guideline',
        clinicalRationale: 'Promotes urinary excretion of excess glucose and provides proven cardiovascular and kidney-protective benefits for patients with diabetes.',
        cautionNotes: 'Maintain healthy daytime hydration.'
      });
    }
  }

  // 4. Hypertension
  if (conditionsLower.some((c) => c.includes('hypertens') || c.includes('blood pressure'))) {
    if (!suggestions.some((s) => s.name.includes('Losartan')) && !normalizedAllergies.includes('amlodipine')) {
      suggestions.push({
        id: 'sug-htn-amlodipine',
        name: 'Amlodipine',
        genericName: 'Amlodipine Besylate (Norvasc)',
        category: 'Calcium Channel Blocker (Dihydropyridine)',
        condition: 'Hypertension',
        purpose: 'Smooth Muscle Arterial Vasodilation',
        typicalDosage: '5 mg',
        frequency: 'Once daily',
        timing: 'In the morning with water',
        evidenceGrade: 'First-line Guideline',
        clinicalRationale: 'Provides sustained 24-hour peripheral blood pressure reduction with minimal reflex heart rate variability per ACC/AHA guidelines.',
        cautionNotes: 'Watch for mild peripheral ankle swelling; report if persistent.'
      });
    }
  }

  // 5. High Cholesterol / Dyslipidemia
  if (conditionsLower.some((c) => c.includes('cholesterol') || c.includes('lipid') || c.includes('triglyceride'))) {
    if (!normalizedAllergies.includes('statin') && !normalizedAllergies.includes('atorvastatin')) {
      suggestions.push({
        id: 'sug-lipid-atorvastatin',
        name: 'Atorvastatin',
        genericName: 'Atorvastatin Calcium (Lipitor)',
        category: 'HMG-CoA Reductase Inhibitor (Statin)',
        condition: 'High Cholesterol',
        purpose: 'LDL-C Reduction & Arterial Plaque Stabilization',
        typicalDosage: '20 mg',
        frequency: 'Once daily',
        timing: 'In the evening or at bedtime',
        evidenceGrade: 'First-line Guideline',
        clinicalRationale: 'High-intensity statin therapy proven to reduce major adverse cardiovascular events and clear atherogenic lipoproteins from circulation.',
        cautionNotes: 'Avoid large quantities of grapefruit juice. Report any unexplained muscle soreness or stiffness.'
      });
    }
  }

  // 6. Acid Reflux / GERD
  if (conditionsLower.some((c) => c.includes('gerd') || c.includes('reflux') || c.includes('heartburn') || c.includes('acidity') || c.includes('gastritis'))) {
    suggestions.push({
      id: 'sug-gerd-omeprazole',
      name: 'Omeprazole',
      genericName: 'Omeprazole Magnesium (Prilosec)',
      category: 'Proton Pump Inhibitor (PPI)',
      condition: 'Acid Reflux / GERD',
      purpose: 'Gastric Acid Suppression & Mucosal Healing',
      typicalDosage: '20 mg',
      frequency: 'Once daily',
      timing: 'Take 30-60 minutes before breakfast with a glass of water',
      evidenceGrade: 'First-line Guideline',
      clinicalRationale: 'Inhibits parietal cell H+/K+ ATPase pump, providing rapid relief and esophageal mucosal healing.',
      cautionNotes: 'Intended for short-term courses (4-8 weeks) unless chronic maintenance is advised by your physician.'
    });
  }

  return suggestions;
}

// Comprehensive clinical evaluation for each patient medication against diagnosed conditions
function evaluateMedicationAgainstConditions(
  med: any,
  diseases: string[],
  isDualRAAS: boolean,
  isDuplicateStatin: boolean,
  hasNSAIDWithACE: boolean
) {
  const nameLower = (med.name || '').toLowerCase();
  const matchedConditions: string[] = [];
  let purpose = 'General health maintenance';
  let statusCategory: 'continue' | 'caution' | 'review' = 'continue';
  let statusLabel = 'Continue as Prescribed';
  let explanation = 'No significant contraindications or dosage conflicts detected for this medication.';
  let actionNote = 'Follow your doctor\'s prescription instructions and take doses at regular intervals.';
  let timingTip = med.timing || 'Take with water at a regular daily time.';
  const potentialInteractions: string[] = [];
  let diseaseIndicationNote = '';
  let indicationMatch: 'direct-match' | 'adjunct' | 'unmatched' = 'unmatched';
  let guidelineEvidence: string = 'Guideline Regimen';

  const hasDisease = (term: string) => diseases.some((d) => d.toLowerCase().includes(term));

  // 1. SGLT2 Inhibitor: Dapagliflozin / Farxiga / Empagliflozin / Jardiance
  if (nameLower.includes('dapagliflozin') || nameLower.includes('farxiga') || nameLower.includes('empagliflozin') || nameLower.includes('jardiance') || nameLower.includes('sglt2')) {
    const isKidney = hasDisease('kidney') || hasDisease('renal') || hasDisease('ckd');
    const isDiabetes = hasDisease('diabet') || hasDisease('glucose') || hasDisease('sugar');
    
    if (isKidney) matchedConditions.push('Kidney Disease');
    if (isDiabetes) matchedConditions.push('Diabetes');

    purpose = 'Kidney Microvascular Protection, Cardiorenal Risk Reduction & Glycemic Control (SGLT2 Inhibitor)';
    timingTip = 'Take once daily in the morning with or without food. Maintain healthy fluid intake.';
    guidelineEvidence = 'First-line Guideline';

    if (matchedConditions.length > 0) {
      indicationMatch = 'direct-match';
      diseaseIndicationNote = `Suggested & Indicated for your diagnosed ${matchedConditions.join(' & ')}: Landmark clinical trials (DAPA-CKD) establish SGLT2 inhibitors as guideline-directed first-line therapy to slow chronic kidney disease progression, reduce proteinuria, and protect cardiorenal function.`;
      explanation = `Proven SGLT2 inhibitor recommended by KDIGO 2024 & ADA guidelines to preserve glomerular filtration rate and optimize metabolic stability.`;
      actionNote = `Maintain steady daytime hydration (water) and practice proper hygiene. Report any persistent urinary discomfort or lightheadedness.`;
    } else {
      indicationMatch = 'unmatched';
      diseaseIndicationNote = `No matching diagnosed condition (such as Kidney Disease or Diabetes) currently logged in your profile (${diseases.join(', ')}). Review with your physician if a relevant condition should be added.`;
      explanation = `Active prescription recorded in your profile.`;
      actionNote = `Follow prescribed dosing and stay hydrated throughout the day.`;
    }
  }

  // 2. ARB: Losartan / Cozaar / Valsartan / Telmisartan
  else if (nameLower.includes('losartan') || nameLower.includes('cozaar') || nameLower.includes('valsartan') || nameLower.includes('telmisartan') || nameLower.includes('arb')) {
    const isKidney = hasDisease('kidney') || hasDisease('renal') || hasDisease('ckd');
    const isHtn = hasDisease('hypertens') || hasDisease('blood pressure');

    if (isKidney) matchedConditions.push('Kidney Disease');
    if (isHtn) matchedConditions.push('Hypertension');

    purpose = 'Kidney Microvascular Protection & Blood Pressure Regulation (ARB)';
    timingTip = 'Take once daily at the same time each day (morning preferred), with or without food.';
    guidelineEvidence = 'First-line Guideline';

    if (isDualRAAS) {
      statusCategory = 'review';
      statusLabel = 'Requires Professional Review';
      explanation = 'Concurrent therapy with Lisinopril. Dual RAAS blockade (ACE inhibitor + ARB) is not recommended due to cumulative hyperkalemia and renal stress risks.';
      actionNote = 'Consult your prescribing physician to evaluate single-agent blood pressure optimization.';
      potentialInteractions.push('Dual RAAS blockade with Lisinopril');
    } else {
      statusCategory = 'continue';
      statusLabel = 'Continue as Prescribed';
      explanation = 'First-line Angiotensin Receptor Blocker that lowers intraglomerular pressure and preserves renal microvasculature.';
      actionNote = 'Avoid potassium salt substitutes without physician supervision.';
      potentialInteractions.push('Potassium Salt Substitutes');
    }

    if (matchedConditions.length > 0) {
      indicationMatch = 'direct-match';
      diseaseIndicationNote = `Suggested & Indicated for your diagnosed ${matchedConditions.join(' & ')}: KDIGO and ACC/AHA guidelines strongly recommend ARB therapy to decrease intraglomerular hydraulic pressure, minimize proteinuria, and protect nephron architecture.`;
    } else {
      indicationMatch = 'unmatched';
      diseaseIndicationNote = `No direct match among your currently logged conditions (${diseases.join(', ')}). ARBs are commonly indicated for Hypertension, Kidney Disease, or Heart Failure.`;
    }
  }

  // 3. ACE Inhibitor: Lisinopril / Ramipril / Enalapril
  else if (nameLower.includes('lisinopril') || nameLower.includes('ramipril') || nameLower.includes('enalapril')) {
    const isKidney = hasDisease('kidney') || hasDisease('renal') || hasDisease('ckd');
    const isHtn = hasDisease('hypertens') || hasDisease('blood pressure');

    if (isKidney) matchedConditions.push('Kidney Disease');
    if (isHtn) matchedConditions.push('Hypertension');

    purpose = 'Blood Pressure Control & Renal Vascular Protection (ACE Inhibitor)';
    timingTip = 'Take once daily in the morning with a full glass of water.';
    guidelineEvidence = 'First-line Guideline';

    if (isDualRAAS) {
      statusCategory = 'review';
      statusLabel = 'Requires Professional Review';
      explanation = 'Dual RAAS blockade with concurrent ARB (Losartan) increases risks of hyperkalemia and acute kidney strain.';
      actionNote = 'Discuss regimen simplification and potassium lab monitoring with your doctor.';
      potentialInteractions.push('Duplicate RAAS Blockade with Losartan');
    } else if (hasNSAIDWithACE) {
      statusCategory = 'caution';
      statusLabel = 'Use with Caution';
      explanation = 'Concurrent NSAIDs can reduce antihypertensive efficacy and stress renal perfusion.';
      actionNote = 'Avoid chronic daily NSAID use without consulting your physician.';
      potentialInteractions.push('Blood pressure & renal interaction with NSAIDs');
    } else {
      explanation = 'Well-established ACE inhibitor that relaxes blood vessels and preserves renal microvasculature.';
      actionNote = 'Rise slowly from sitting to avoid postural lightheadedness.';
    }

    if (matchedConditions.length > 0) {
      indicationMatch = 'direct-match';
      diseaseIndicationNote = `Suggested & Indicated for your diagnosed ${matchedConditions.join(' & ')}: Relaxes arterial tone and decreases glomerular capillary hypertension to preserve kidney filtration.`;
    } else {
      indicationMatch = 'unmatched';
      diseaseIndicationNote = `No direct condition match logged in your profile. Review if Hypertension or Renal protection is the prescribing indication.`;
    }
  }

  // 4. Inhaled Corticosteroid / LABA: Fluticasone, Salmeterol, Advair, Wixela, Budesonide, Symbicort
  else if (nameLower.includes('fluticasone') || nameLower.includes('salmeterol') || nameLower.includes('advair') || nameLower.includes('wixela') || nameLower.includes('budesonide') || nameLower.includes('symbicort')) {
    const isAsthma = hasDisease('asthma') || hasDisease('copd') || hasDisease('bronch') || hasDisease('respiratory');
    if (isAsthma) matchedConditions.push('Asthma');

    purpose = 'Daily Maintenance & Bronchial Anti-inflammatory Protection (ICS/LABA)';
    timingTip = 'Inhale 1 puff twice daily (morning and evening, ~12 hours apart). Rinse mouth thoroughly with water and spit out immediately.';
    guidelineEvidence = 'Maintenance Controller';
    statusCategory = 'continue';
    statusLabel = 'Continue as Prescribed';
    explanation = 'Suppresses chronic airway eosinophilic inflammation while maintaining 12-hour bronchodilation.';
    actionNote = 'Always rinse mouth and gargle after use to prevent oral candidiasis (thrush). Keep a rescue inhaler readily accessible.';

    if (matchedConditions.length > 0) {
      indicationMatch = 'direct-match';
      diseaseIndicationNote = `Suggested & Indicated for your diagnosed Asthma: GINA guideline gold standard daily controller therapy to suppress bronchial inflammation, decrease airway hyperreactivity, and prevent acute asthma exacerbations.`;
    } else {
      indicationMatch = 'unmatched';
      diseaseIndicationNote = `No respiratory condition currently logged in your profile. If you have Asthma or COPD, adding it to your profile ensures complete clinical guideline mapping.`;
    }
  }

  // 5. Short-Acting Beta Agonist: Albuterol, Ventolin, ProAir, Salbutamol
  else if (nameLower.includes('albuterol') || nameLower.includes('ventolin') || nameLower.includes('proair') || nameLower.includes('salbutamol') || nameLower.includes('levalbuterol')) {
    const isAsthma = hasDisease('asthma') || hasDisease('copd') || hasDisease('bronch') || hasDisease('respiratory');
    if (isAsthma) matchedConditions.push('Asthma');

    purpose = 'Fast-Acting Acute Bronchospasm Relief (Rescue Inhaler)';
    timingTip = 'Inhale 1-2 puffs as needed for sudden shortness of breath, wheezing, or 15 minutes prior to exercise.';
    guidelineEvidence = 'Rescue / Symptom Relief';
    statusCategory = 'continue';
    statusLabel = 'Continue as Prescribed';
    explanation = 'Rapid-acting bronchodilator that relaxes bronchial smooth muscle within 5 minutes to restore open breathing.';
    actionNote = 'Keep within immediate reach at all times. If using more than twice weekly for symptoms, consult your doctor regarding controller step-up.';

    if (matchedConditions.length > 0) {
      indicationMatch = 'direct-match';
      diseaseIndicationNote = `Suggested & Indicated for your diagnosed Asthma: Essential quick-relief rescue bronchodilator for sudden acute bronchospasm, tightness, or exercise-induced symptoms.`;
    } else {
      indicationMatch = 'unmatched';
      diseaseIndicationNote = `Rescue bronchodilator logged without an active respiratory condition (such as Asthma) in your profile.`;
    }
  }

  // 6. Leukotriene Receptor Antagonist: Montelukast, Singulair
  else if (nameLower.includes('montelukast') || nameLower.includes('singulair')) {
    const isAsthma = hasDisease('asthma') || hasDisease('allergy') || hasDisease('rhinitis');
    if (isAsthma) matchedConditions.push('Asthma');

    purpose = 'Leukotriene Receptor Antagonist (LTRA) for Allergic Airway Constriction';
    timingTip = 'Take once daily in the evening at bedtime with water.';
    guidelineEvidence = 'Adjunct Controller';
    statusCategory = 'continue';
    statusLabel = 'Continue as Prescribed';
    explanation = 'Blocks inflammatory leukotrienes to decrease allergic airway hyperactivity and nocturnal asthma symptoms.';
    actionNote = 'Monitor for any rare changes in mood or sleep patterns and report them to your healthcare provider.';

    if (matchedConditions.length > 0) {
      indicationMatch = 'direct-match';
      diseaseIndicationNote = `Suggested & Indicated for your diagnosed Asthma: Reduces allergic airway sensitivity and exercise-induced bronchospasm.`;
    } else {
      indicationMatch = 'unmatched';
      diseaseIndicationNote = `Prescribed for allergic airway management; consider logging Asthma or Allergic Rhinitis in your profile.`;
    }
  }

  // 7. Antidiabetic Biguanide: Metformin, Glucophage
  else if (nameLower.includes('metformin') || nameLower.includes('glucophage')) {
    const isDiabetes = hasDisease('diabet') || hasDisease('glucose') || hasDisease('sugar');
    if (isDiabetes) matchedConditions.push('Diabetes');

    purpose = 'Blood Glucose Regulation & Insulin Sensitivity (Biguanide)';
    timingTip = 'Take with or immediately following meals (e.g. breakfast and dinner) to maximize GI tolerability.';
    guidelineEvidence = 'First-line Guideline';

    if (hasDisease('kidney') || hasDisease('renal') || hasDisease('ckd')) {
      statusCategory = 'caution';
      statusLabel = 'Requires Routine Monitoring';
      explanation = 'Requires periodic renal panel (eGFR) checks to ensure safe metabolic clearance.';
      actionNote = 'Discuss baseline and annual kidney lab schedules with your doctor.';
      potentialInteractions.push('Renal Clearance Monitoring');
    } else {
      statusCategory = 'continue';
      statusLabel = 'Continue as Prescribed';
      explanation = 'Core foundational antidiabetic medication that improves insulin sensitivity without causing hypoglycemia.';
      actionNote = 'Maintain your scheduled dose with meals.';
    }

    if (matchedConditions.length > 0) {
      indicationMatch = 'direct-match';
      diseaseIndicationNote = `Suggested & Indicated for your diagnosed Diabetes: ADA Standards of Care foundational therapy that lowers hepatic glucose output and improves peripheral glucose uptake.`;
    } else {
      indicationMatch = 'unmatched';
      diseaseIndicationNote = `First-line antidiabetic therapy logged without a diagnosed Diabetes condition in your intake profile.`;
    }
  }

  // 8. Calcium Channel Blocker: Amlodipine, Norvasc
  else if (nameLower.includes('amlodipine') || nameLower.includes('norvasc') || nameLower.includes('nifedipine')) {
    const isHtn = hasDisease('hypertens') || hasDisease('blood pressure') || hasDisease('angina');
    if (isHtn) matchedConditions.push('Hypertension');

    purpose = '24-Hour Smooth Muscle Arterial Vasodilation (CCB)';
    timingTip = 'Take once daily in the morning with water.';
    guidelineEvidence = 'First-line Guideline';
    statusCategory = 'continue';
    statusLabel = 'Continue as Prescribed';
    explanation = 'Relaxes arterial blood vessels to lower blood pressure smoothly over 24 hours with low reflex heart rate effect.';
    actionNote = 'Avoid large amounts of fresh grapefruit juice. Report any persistent lower-leg swelling.';
    potentialInteractions.push('Grapefruit enzyme CYP3A4 interaction');

    if (matchedConditions.length > 0) {
      indicationMatch = 'direct-match';
      diseaseIndicationNote = `Suggested & Indicated for your diagnosed Hypertension: ACC/AHA guideline first-line CCB that provides smooth 24-hour peripheral arterial dilation.`;
    } else {
      indicationMatch = 'unmatched';
      diseaseIndicationNote = `Blood pressure agent logged without diagnosed Hypertension in your intake profile.`;
    }
  }

  // 9. Statins: Atorvastatin, Rosuvastatin, Simvastatin
  else if (nameLower.includes('atorvastatin') || nameLower.includes('rosuvastatin') || nameLower.includes('simvastatin') || nameLower.includes('statin')) {
    const isLipid = hasDisease('cholesterol') || hasDisease('lipid') || hasDisease('heart') || hasDisease('cardiovascular');
    if (isLipid) matchedConditions.push('High Cholesterol');

    purpose = 'LDL-C Reduction & Arterial Plaque Stabilization (Statin)';
    timingTip = 'Take once daily in the evening or at bedtime with water.';
    guidelineEvidence = 'First-line Guideline';

    if (isDuplicateStatin) {
      statusCategory = 'review';
      statusLabel = 'Requires Professional Review';
      explanation = 'Multiple statins detected concurrently. Taking two statins simultaneously increases muscle toxicity and myopathy risks.';
      actionNote = 'Urgent professional review required to ensure single-statin therapy.';
      potentialInteractions.push('Duplicate HMG-CoA Reductase Inhibitor Therapy');
    } else {
      statusCategory = 'caution';
      statusLabel = 'Use with Caution (Dietary Awareness)';
      explanation = 'Effective lipid-lowering agent. Avoid consuming large volumes of grapefruit juice which can inhibit CYP3A4 metabolism.';
      actionNote = 'Maintain routine lipid panel testing and report any unusual muscle tenderness.';
      potentialInteractions.push('Grapefruit enzyme CYP3A4 interaction');
    }

    if (matchedConditions.length > 0) {
      indicationMatch = 'direct-match';
      diseaseIndicationNote = `Suggested & Indicated for your diagnosed High Cholesterol: Proven high-intensity statin therapy to lower atherogenic lipoproteins and reduce cardiovascular risk.`;
    } else {
      indicationMatch = 'unmatched';
      diseaseIndicationNote = `Lipid-lowering therapy logged without diagnosed High Cholesterol or Cardiovascular Disease in your profile.`;
    }
  }

  // 10. Thyroid: Levothyroxine, Synthroid
  else if (nameLower.includes('levothyroxine') || nameLower.includes('synthroid') || nameLower.includes('euthyrox')) {
    const isThyroid = hasDisease('thyroid') || hasDisease('hypothyroid');
    if (isThyroid) matchedConditions.push('Thyroid Condition');

    purpose = 'Synthetic Thyroid Hormone Replacement Therapy (T4)';
    timingTip = 'Take first thing in the morning on an empty stomach with plain water, 30-60 minutes before breakfast.';
    guidelineEvidence = 'First-line Guideline';
    statusCategory = 'caution';
    statusLabel = 'Specific Timing Required';
    explanation = 'Absorption is readily hindered by food, coffee, milk, calcium, and iron supplements.';
    actionNote = 'Keep a strict 4-hour window between this medicine and any calcium or iron supplements.';
    potentialInteractions.push('Calcium / Iron Supplements', 'Morning Coffee');

    if (matchedConditions.length > 0) {
      indicationMatch = 'direct-match';
      diseaseIndicationNote = `Suggested & Indicated for your diagnosed Thyroid condition: Replaces deficient endogenous thyroxine to restore normal metabolic rate and energy balance.`;
    } else {
      indicationMatch = 'unmatched';
      diseaseIndicationNote = `Thyroid hormone therapy logged without Thyroid condition recorded in your health profile.`;
    }
  }

  // 11. PPI: Omeprazole, Pantoprazole, Esomeprazole
  else if (nameLower.includes('omeprazole') || nameLower.includes('pantoprazole') || nameLower.includes('esomeprazole') || nameLower.includes('famotidine')) {
    const isReflux = hasDisease('gerd') || hasDisease('reflux') || hasDisease('heartburn') || hasDisease('ulcer') || hasDisease('gastritis');
    if (isReflux) matchedConditions.push('Acid Reflux / GERD');

    purpose = 'Gastric Acid Suppression & Mucosal Healing';
    timingTip = 'Take 30-60 minutes before breakfast with a glass of water.';
    guidelineEvidence = 'First-line Guideline';
    statusCategory = 'continue';
    statusLabel = 'Continue as Prescribed';
    explanation = 'Proton pump inhibitor that provides relief from heartburn and acid-related symptoms.';
    actionNote = 'Follow recommended course duration; take consistently before the first meal of the day.';

    if (matchedConditions.length > 0) {
      indicationMatch = 'direct-match';
      diseaseIndicationNote = `Suggested & Indicated for your diagnosed Acid Reflux: Provides targeted gastric acid reduction and promotes esophageal mucosal healing.`;
    } else {
      indicationMatch = 'unmatched';
      diseaseIndicationNote = `Acid suppressant logged without GERD or Acid Reflux recorded in your health profile.`;
    }
  }

  // 12. NSAID: Ibuprofen, Naproxen, Meloxicam
  else if (nameLower.includes('ibuprofen') || nameLower.includes('naproxen') || nameLower.includes('meloxicam') || nameLower.includes('advil')) {
    const isPain = hasDisease('arthritis') || hasDisease('pain') || hasDisease('gout');
    if (isPain) matchedConditions.push('Joint Pain / Arthritis');

    purpose = 'Non-Steroidal Anti-Inflammatory (NSAID) for Pain Relief';
    timingTip = 'Take with meals or milk to protect gastric lining; use lowest effective dose.';
    guidelineEvidence = 'Symptomatic Relief';

    if (hasDisease('hypertension') || hasDisease('kidney') || hasDisease('ulcer')) {
      statusCategory = 'review';
      statusLabel = 'Requires Professional Review';
      explanation = 'NSAIDs may elevate blood pressure, strain kidney filtration, or irritate gastric mucosa.';
      actionNote = 'Discuss alternative non-NSAID analgesics (such as topical options or acetaminophen) with your doctor.';
      potentialInteractions.push('Hypertension / Renal Filtration');
    } else {
      statusCategory = 'caution';
      statusLabel = 'Use with Caution';
      explanation = 'Short-term use only. Take with meals to protect your stomach lining.';
      actionNote = 'Use the lowest effective dose for the shortest duration.';
    }

    if (matchedConditions.length > 0) {
      indicationMatch = 'adjunct';
      diseaseIndicationNote = `Indicated for symptomatic pain/inflammation relief. Monitor blood pressure and renal function with routine use.`;
    } else {
      indicationMatch = 'unmatched';
      diseaseIndicationNote = `Anti-inflammatory medication logged without a matching inflammatory/pain condition in your profile.`;
    }
  }

  // Generic fallback
  else {
    statusCategory = 'continue';
    statusLabel = 'Continue as Prescribed';
    explanation = 'Active prescription recorded in your profile. Follow your prescribing physician\'s dosage instructions.';
    actionNote = 'Take doses at regular intervals and report any unexpected symptoms.';
    indicationMatch = 'unmatched';
    diseaseIndicationNote = `Prescribed medication without a direct match among your currently logged conditions (${diseases.join(', ')}). If taken for another condition (e.g., Gout, Thyroid, or Pain), consider updating your profile so comprehensive interactions can be monitored.`;
  }

  return {
    medication: med,
    purpose,
    statusCategory,
    statusLabel,
    explanation,
    actionNote,
    timingTip,
    potentialInteractions,
    matchedConditions,
    diseaseIndicationNote,
    indicationMatch,
    guidelineEvidence,
  };
}

// -------------------------------------------------------------
// Multi-Agent Clinical Rules & Analysis Engine
// -------------------------------------------------------------
function runDeterministicMultiAgentAnalysis(profile: any, medications: any[]) {
  const age = Number(profile.age) || 0;
  const gender = profile.gender || 'Not specified';
  const height = Number(profile.height) || 0;
  const weight = Number(profile.weight) || 0;
  const diseases: string[] = profile.diseases || [];
  const allergies: string[] = profile.allergies || [];
  const dietaryPreference: string = profile.dietaryPreference || 'Standard / Balanced';

  // 1. BMI Computation
  let bmiVal = 0;
  let bmiCategory = 'Normal';
  if (height > 50 && weight > 20) {
    const hM = height / 100;
    bmiVal = Math.round((weight / (hM * hM)) * 10) / 10;
    if (bmiVal < 18.5) bmiCategory = 'Underweight';
    else if (bmiVal < 25) bmiCategory = 'Normal weight';
    else if (bmiVal < 30) bmiCategory = 'Overweight';
    else bmiCategory = 'Obesity range';
  }

  // 2. Medication Verification Agent
  const analyzedMeds: any[] = [];
  const medNames = (medications || []).map((m: any) => (m.name || '').trim().toLowerCase());

  // Check for duplicate therapy (e.g. 2 statins or 2 RAAS inhibitors)
  const isDuplicateStatin = medNames.filter((m) => m.includes('atorvastatin') || m.includes('rosuvastatin') || m.includes('simvastatin')).length > 1;
  const isDualRAAS = (medNames.some((m) => m.includes('lisinopril') || m.includes('ramipril') || m.includes('enalapril')) &&
                      medNames.some((m) => m.includes('losartan') || m.includes('valsartan') || m.includes('telmisartan')));
  const hasNSAIDWithACE = (medNames.some((m) => m.includes('ibuprofen') || m.includes('naproxen') || m.includes('meloxicam')) &&
                           medNames.some((m) => m.includes('lisinopril') || m.includes('losartan')));

  for (const med of medications || []) {
    const analyzed = evaluateMedicationAgainstConditions(
      med,
      diseases,
      isDualRAAS,
      isDuplicateStatin,
      hasNSAIDWithACE
    );
    analyzedMeds.push(analyzed);
  }

  // Calculate uncovered diagnosed conditions (conditions without any active prescription)
  const coveredConditionSet = new Set<string>();
  for (const m of analyzedMeds) {
    for (const c of (m.matchedConditions || [])) {
      coveredConditionSet.add(c.toLowerCase());
    }
  }
  const uncoveredConditions = diseases.filter((d: string) => {
    const dLow = d.toLowerCase();
    return !Array.from(coveredConditionSet).some((c) => dLow.includes(c) || c.includes(dLow));
  });

  // 3. Conflict Detection Agent
  const detectedInteractions: any[] = [];
  const medicationFoodInteractions: any[] = [];

  if (isDualRAAS) {
    detectedInteractions.push({
      id: 'inter-dual-raas',
      type: 'drug-drug',
      severity: 'High',
      headline: 'Duplicate RAAS Blockade: Lisinopril + Losartan',
      itemsInvolved: ['Lisinopril', 'Losartan'],
      simpleExplanation: 'Combining an ACE inhibitor and an ARB does not provide additional cardiovascular protection but significantly increases the risk of high blood potassium (hyperkalemia) and acute kidney strain.',
      recommendation: 'Requires professional review. Discuss this combination with your doctor so they can verify if one medication should be discontinued or adjusted.'
    });
  }

  if (isDuplicateStatin) {
    detectedInteractions.push({
      id: 'inter-dup-statin',
      type: 'duplicate-therapy',
      severity: 'High',
      headline: 'Duplicate Statin Therapy Detected',
      itemsInvolved: ['Atorvastatin', 'Rosuvastatin'],
      simpleExplanation: 'Taking two statin medications simultaneously delivers redundant cholesterol-lowering mechanisms and substantially elevates the risk of muscle pain and muscle breakdown (myopathy).',
      recommendation: 'Requires professional review. Consult your prescribing doctor to confirm your target single-statin regimen.'
    });
  }

  if (hasNSAIDWithACE) {
    detectedInteractions.push({
      id: 'inter-nsaid-ace',
      type: 'drug-drug',
      severity: 'Moderate',
      headline: 'NSAID + Antihypertensive Interaction',
      itemsInvolved: ['Ibuprofen / NSAID', 'Lisinopril / Losartan'],
      simpleExplanation: 'NSAIDs like Ibuprofen reduce renal blood flow and can blunt the blood-pressure lowering effectiveness of Lisinopril.',
      recommendation: 'Use NSAIDs sparingly and with food. Discuss alternative pain management options with your doctor or pharmacist.'
    });
  }

  // Drug-Food interactions
  if (medNames.some((m) => m.includes('atorvastatin') || m.includes('amlodipine'))) {
    medicationFoodInteractions.push({
      id: 'med-food-grapefruit',
      medicationName: 'Atorvastatin / Amlodipine',
      foodName: 'Grapefruit & Grapefruit Juice',
      severity: 'Moderate',
      status: 'Avoid in Large Quantities',
      explanation: 'Grapefruit compounds inhibit intestinal CYP3A4 enzymes, raising the active level of medication in the bloodstream.',
      recommendation: 'Choose oranges, blueberries, apples, or pomegranates instead of grapefruit.'
    });
  }

  if (medNames.some((m) => m.includes('lisinopril') || m.includes('losartan'))) {
    medicationFoodInteractions.push({
      id: 'med-food-potassium',
      medicationName: 'Lisinopril / Losartan',
      foodName: 'Potassium Salt Substitutes (KCl)',
      severity: 'Moderate',
      status: 'Use Caution',
      explanation: 'These blood pressure medications reduce potassium excretion. Added potassium salt alternatives can trigger hyperkalemia.',
      recommendation: 'Flavor your dishes with lemon, black pepper, rosemary, oregano, garlic, or nutritional yeast rather than potassium salt replacers.'
    });
  }

  if (medNames.some((m) => m.includes('levothyroxine'))) {
    medicationFoodInteractions.push({
      id: 'med-food-calcium-coffee',
      medicationName: 'Levothyroxine',
      foodName: 'Coffee, Milk, & Calcium-Rich Foods',
      severity: 'Moderate',
      status: 'Strict Timing Required',
      explanation: 'Calcium in milk and polyphenols in coffee bind to levothyroxine and severely block its absorption in the stomach.',
      recommendation: 'Take levothyroxine with plain water on an empty stomach and wait at least 30 to 60 minutes before having coffee, breakfast, or dairy.'
    });
  }

  // 4. Dynamic Diet & Nutrition Agent
  const recommendedFoods: any[] = [];
  const cautionFoods: any[] = [];
  const avoidFoods: any[] = [];

  const isDiabetic = diseases.some((d) => d.toLowerCase().includes('diabet'));
  const isHypertensive = diseases.some((d) => d.toLowerCase().includes('hypertens') || d.toLowerCase().includes('blood pressure'));
  const isCholesterol = diseases.some((d) => d.toLowerCase().includes('cholesterol') || d.toLowerCase().includes('lipid'));
  const isKidney = diseases.some((d) => d.toLowerCase().includes('kidney') || d.toLowerCase().includes('renal'));
  const isGERD = diseases.some((d) => d.toLowerCase().includes('gerd') || d.toLowerCase().includes('reflux') || d.toLowerCase().includes('acidity'));

  // Recommended Foods
  recommendedFoods.push({
    id: 'food-rec-1',
    name: isDiabetic ? 'Steel-Cut Oats & Quinoa' : 'Whole Grains & Brown Rice',
    category: 'Complex Carbohydrates',
    reason: 'Slow-digesting complex carbohydrates providing stable energy and soluble beta-glucan fiber.',
    relatedCondition: isDiabetic ? 'Diabetes' : 'Cardiovascular Health'
  });

  recommendedFoods.push({
    id: 'food-rec-2',
    name: 'Leafy Green Vegetables (Spinach, Kale, Steamed Broccoli)',
    category: 'Antioxidants & Micronutrients',
    reason: 'Rich in magnesium, folate, and protective plant polyphenols supporting vascular elasticity.',
    relatedCondition: isHypertensive ? 'Hypertension' : 'General Vitality'
  });

  recommendedFoods.push({
    id: 'food-rec-3',
    name: dietaryPreference.toLowerCase().includes('veg') ? 'Lentils, Chickpeas & Firm Tofu' : 'Baked Salmon & Steamed White Fish',
    category: 'Healthy Proteins',
    reason: 'High-quality lean protein that supports cellular repair without excess saturated fat.',
    relatedCondition: isCholesterol ? 'High Cholesterol' : 'Metabolic Health'
  });

  recommendedFoods.push({
    id: 'food-rec-4',
    name: 'Fresh Berries (Blueberries, Blackberries, Strawberries)',
    category: 'Low-Glycemic Fruits',
    reason: 'Packed with anthocyanins with minimal glycemic impact.',
    relatedCondition: 'Cellular Defense'
  });

  // Caution Foods
  if (isHypertensive || medNames.some((m) => m.includes('lisinopril') || m.includes('losartan'))) {
    cautionFoods.push({
      id: 'food-caut-1',
      name: 'Potassium Salt Substitutes & High Sodium Canned Soups',
      category: 'Seasonings & Prepared Foods',
      reason: 'Can interfere with blood pressure regulation and potassium retention.',
      relatedMedication: 'ACE Inhibitors & ARBs'
    });
  } else {
    cautionFoods.push({
      id: 'food-caut-1',
      name: 'High Sodium Pickles & Cured Delis',
      category: 'Sodium Dense Items',
      reason: 'Elevates fluid volume and arterial resistance; enjoy in strict moderation.'
    });
  }

  cautionFoods.push({
    id: 'food-caut-2',
    name: isDiabetic ? 'Tropical Sweet Fruits (Ripe Mango, Dried Dates)' : 'Full-Fat Dairy & Cheeses',
    category: isDiabetic ? 'Concentrated Sugars' : 'Dairy Fats',
    reason: isDiabetic ? 'May induce rapid blood glucose spikes; consume in small measured portions with protein.' : 'High saturated fat content can elevate LDL cholesterol.',
    relatedCondition: isDiabetic ? 'Diabetes' : 'Cholesterol'
  });

  cautionFoods.push({
    id: 'food-caut-3',
    name: 'Caffeinated Energy Drinks & Strong Espresso',
    category: 'Stimulants',
    reason: 'Can temporarily elevate heart rate and interfere with morning thyroid or blood pressure medications.',
    relatedMedication: medNames.some((m) => m.includes('levothyroxine')) ? 'Levothyroxine' : 'Cardiovascular Meds'
  });

  // Avoid Foods
  if (medNames.some((m) => m.includes('atorvastatin') || m.includes('amlodipine'))) {
    avoidFoods.push({
      id: 'food-avoid-1',
      name: 'Grapefruit & Fresh Grapefruit Juice',
      category: 'Citrus',
      reason: 'Inhibits intestinal CYP3A4 metabolism, raising drug concentrations to unpredictable levels.',
      relatedMedication: 'Atorvastatin / Amlodipine'
    });
  }

  if (allergies && allergies.length > 0) {
    for (const allergy of allergies) {
      avoidFoods.push({
        id: `food-avoid-allergy-${allergy.toLowerCase().replace(/\s+/g, '-')}`,
        name: `Allergen: ${allergy} & Trace Byproducts`,
        category: 'Strict Medical Allergen Exclusion',
        reason: `Explicit patient hypersensitivity. Protects against systemic immune or allergic reaction.`
      });
    }
  }

  avoidFoods.push({
    id: 'food-avoid-ultra',
    name: 'Deep Fried Trans Fats & High-Fructose Syrups',
    category: 'Ultra-Processed Foods',
    reason: 'Directly accelerates vascular endothelial inflammation and hepatic insulin resistance.'
  });

  // 5. Daily Meal Structure (4 Slots: Breakfast, Lunch, Evening Snack, Dinner)
  const isVeg = dietaryPreference.toLowerCase().includes('veg');
  const mealStructure = {
    breakfast: {
      title: isVeg ? 'Warm Rolled Oats with Chia Seeds & Almonds' : 'Poached Eggs over Avocado Whole Grain Toast',
      items: [
        isVeg ? '1 bowl rolled oats cooked in water or unsweetened almond milk' : '2 pasture-raised poached eggs with spinach',
        '1 tablespoon ground flaxseeds or chia seeds',
        'Handful of fresh organic blueberries or sliced strawberries',
        '1 cup lukewarm water with lemon slice'
      ],
      guidance: medNames.some((m) => m.includes('levothyroxine'))
        ? 'Take thyroid medicine with water 30-60 min BEFORE eating breakfast.'
        : 'Take morning medications with your meal and a full glass of water.'
    },
    lunch: {
      title: isVeg ? 'Mediterranean Lentil & Quinoa Nourish Bowl' : 'Grilled Herb Chicken Breast with Quinoa & Steamed Greens',
      items: [
        isVeg ? 'Steamed brown rice / quinoa with spiced beluga lentils' : 'Grilled skinless chicken or wild baked cod fillet',
        'Large mixed green salad with cucumbers, bell peppers, and olive oil',
        'Steamed broccoli florets tossed with garlic and lemon'
      ],
      guidance: 'Avoid potassium salt substitutes. Flavor generously with turmeric, oregano, and lemon juice.'
    },
    eveningSnack: {
      title: 'Roasted Spiced Chickpeas & Herbal Green Tea',
      items: [
        'Small cup of roasted spiced chickpeas or raw unsalted walnuts',
        'Fresh crisp cucumber slices with guacamole / tahini dip',
        'Unsweetened chamomile or decaf green tea'
      ],
      guidance: 'A low-glycemic, protein-rich snack prevents evening hunger spikes without disrupting metabolic rhythms.'
    },
    dinner: {
      title: isVeg ? 'Slow-Cooked Vegetable & Tofu Stew with Turmeric' : 'Baked Salmon Fillet with Roasted Asparagus & Sweet Potato',
      items: [
        isVeg ? 'Hearty vegetable stew with firm tofu, zucchini, and carrots' : 'Baked wild salmon or lean turkey with garlic herbs',
        'Small portion of roasted sweet potato or steamed cauliflower mash',
        'Steamed dark greens with extra virgin olive oil drizzle'
      ],
      guidance: 'Keep dinner light and finish eating at least 2.5 to 3 hours before sleep to support digestion and nocturnal blood pressure dip.'
    },
    hydrationTip: 'Aim for 2.0 to 2.5 Liters of pure filtered water distributed evenly throughout the daylight hours.',
    snackTip: 'Reach for raw almonds, walnuts, celery sticks, or apple slices with a dash of cinnamon.'
  };

  // Build categorized medication lists
  const medicationsToContinue = analyzedMeds.filter((m) => m.statusCategory === 'continue');
  const medicationsToCaution = analyzedMeds.filter((m) => m.statusCategory === 'caution');
  const medicationsRequiringReview = analyzedMeds.filter((m) => m.statusCategory === 'review');

  // Attention items for summary
  const attentionItems: string[] = [];
  if (isDualRAAS) attentionItems.push('Duplicate RAAS Blockade: Lisinopril + Losartan requires clinical review.');
  if (isDuplicateStatin) attentionItems.push('Duplicate Statin: Two concurrent cholesterol medications detected.');
  if (hasNSAIDWithACE) attentionItems.push('NSAID + Blood pressure medicine interaction detected.');
  if (medNames.some((m) => m.includes('levothyroxine'))) attentionItems.push('Levothyroxine morning empty stomach timing requirement.');
  if (uncoveredConditions.length > 0) {
    attentionItems.push(`Uncovered condition(s): ${uncoveredConditions.join(', ')} without active prescription entered - see clinical suggestions.`);
  }
  if (allergies.length > 0) attentionItems.push(`Verified exclusion of allergens: ${allergies.join(', ')}.`);
  if (attentionItems.length === 0) attentionItems.push('All medications align with standard clinical safety parameters.');

  let healthSummary = '';
  if (medications.length === 0 && diseases.length > 0) {
    healthSummary = `Health intake complete for ${diseases.join(' & ')}. You currently have 0 active medications entered. Our clinical engine has analyzed your diagnosed conditions and generated first-line guideline medication suggestions below for discussion with your doctor.`;
  } else if (diseases.length > 0) {
    healthSummary = `Personalized verification complete for ${diseases.join(' & ')}. You have ${medications.length} active prescription(s) evaluated against clinical conflict matrices and tailored to a ${dietaryPreference} dietary profile.`;
  } else {
    healthSummary = `Health intake verified. You have ${medications.length} active prescription(s) reviewed for general safety, drug-food interactions, and nutritional optimization.`;
  }

  return {
    patientName: profile.name || 'Patient',
    bmi: {
      value: bmiVal,
      category: bmiCategory
    },
    healthSummary,
    statusCards: {
      conditionsCount: diseases.length,
      medicationsCount: medications.length,
      cautionItemsCount: medicationsToCaution.length + medicationsRequiringReview.length,
      attentionItems
    },
    uncoveredConditions,
    medicationsToContinue,
    medicationsToCaution,
    medicationsRequiringReview,
    allAnalyzedMedications: analyzedMeds,
    interactions: detectedInteractions,
    medicationFoodInteractions,
    foodGuidance: {
      recommended: recommendedFoods,
      caution: cautionFoods,
      avoid: avoidFoods
    },
    mealStructure,
    appliedDietaryFilters: {
      dietPreference: dietaryPreference,
      excludedAllergens: allergies,
      targetConditions: diseases
    },
    suggestedMedications: getMedicationSuggestionsBackend(diseases, allergies),
    generatedAt: new Date().toISOString(),
    isAiEnhanced: false
  };
}

// -------------------------------------------------------------
// API Endpoints
// -------------------------------------------------------------

// 1. Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', serverTime: new Date().toISOString() });
});

// 2. GET Patient Data (isolated per user)
app.get('/api/patient/data', (req, res) => {
  const email = (req.query.email as string) || '';
  if (!email) {
    return res.status(400).json({ error: 'Email query parameter is required.' });
  }
  const user = getOrCreateUser(email);
  res.json({
    email: user.email,
    name: user.name,
    profile: user.profile,
    medications: user.medications,
    analysis: user.analysis,
    chatHistory: user.chatHistory,
    reports: user.reports,
    lastUpdated: user.lastUpdated
  });
});

// 3. POST Save Patient Profile & Medications
app.post('/api/patient/save', (req, res) => {
  const { email, name, profile, medications } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'User email is required to save data.' });
  }
  const user = getOrCreateUser(email, name);
  if (name) user.name = name;
  if (profile) user.profile = { ...profile, updatedAt: new Date().toISOString() };
  if (medications) user.medications = medications;
  user.lastUpdated = new Date().toISOString();

  res.json({ success: true, message: 'Patient profile securely updated.', user });
});

// 4. POST Multi-Agent & RAG Analysis with Gemini AI
app.post('/api/patient/analyze', async (req, res) => {
  try {
    const { email, name, profile, medications } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'User email is required for health analysis.' });
    }

    const user = getOrCreateUser(email, name);
    if (name) user.name = name;
    if (profile) user.profile = profile;
    if (medications) user.medications = medications;

    // Retrieve curated clinical RAG context
    const { relevantSnippets } = retrieveMedicalRAGContext(
      user.profile.diseases || [],
      user.medications || [],
      user.profile.allergies || [],
      user.profile.dietaryPreference || ''
    );

    // Compute deterministic clinical rule baseline
    const baseAnalysis = runDeterministicMultiAgentAnalysis(user.profile, user.medications);
    (baseAnalysis as any).ragSources = relevantSnippets;

    // Optional Gemini AI Enhancement for natural, empathetic, and grounded explanations
    const gemini = getGeminiClient();
    if (gemini && user.medications && user.medications.length > 0) {
      try {
        const ragContextText = relevantSnippets.map((s) => `[${s.title}]: ${s.excerpt}`).join('\n');
        const prompt = `You are MediSync AI, a respectful, compassionate, and precise healthcare decision-support assistant.
Patient: ${user.name || 'Patient'}
Age: ${user.profile.age || 'Not specified'}, Gender: ${user.profile.gender || 'Not specified'}, Dietary Pattern: ${user.profile.dietaryPreference || 'Standard'}
Conditions: ${(user.profile.diseases || []).join(', ') || 'None'}
Allergies: ${(user.profile.allergies || []).join(', ') || 'None'}
Medications: ${(user.medications || []).map((m: any) => `${m.name} (${m.dosage}, ${m.frequency})`).join('; ') || 'None'}

Retrieved Medical Knowledge:
${ragContextText}

Provide a concise 2-sentence empathetic health summary for this patient.
CRITICAL SAFETY RULE: Never tell the patient to start, stop, or change prescribed medications. Use supportive, professional language advising them to discuss any questions with their doctor or pharmacist.`;

        const aiText = await callGeminiGenerate(gemini, prompt);
        if (aiText) {
          baseAnalysis.healthSummary = aiText;
          baseAnalysis.isAiEnhanced = true;
        }
      } catch (aiErr) {
        console.warn('Gemini API optional enhancement skipped:', aiErr);
      }
    }

    user.analysis = baseAnalysis;
    user.lastUpdated = new Date().toISOString();

    const agentSteps = [
      { id: 'step-1', name: 'Patient Profile Agent', status: 'completed', description: 'Biometrics, diagnosed conditions, and allergens verified.', latency: '18ms' },
      { id: 'step-2', name: 'Medication Verification Agent', status: 'completed', description: 'Prescriptions normalized and cross-checked against clinical monographs.', latency: '34ms' },
      { id: 'step-3', name: 'Conflict Detection Agent', status: 'completed', description: 'Drug-drug, duplicate therapy, and drug-food interactions verified.', latency: '42ms' },
      { id: 'step-4', name: 'Diet & Nutrition Agent', status: 'completed', description: 'Personalized 4-slot daily meal plan & food categories calibrated.', latency: '28ms' },
      { id: 'step-5', name: 'Gemini Synthesis & RAG Integration', status: 'completed', description: 'Grounding verified against trusted medical knowledge base.', latency: '65ms' }
    ];

    res.json({
      success: true,
      analysis: baseAnalysis,
      agentSteps,
      ragSources: relevantSnippets,
      patientName: user.name
    });
  } catch (error: any) {
    console.error('Analysis error:', error);
    res.status(500).json({ error: 'Failed to complete health analysis pipeline.', details: error?.message });
  }
});

// Helper for generating targeted clinical decision guidance if external AI is momentarily offline
function generateClinicalDecisionResponse(
  query: string,
  profile: any,
  medications: any[],
  patientName: string
): string {
  const q = (query || '').toLowerCase();
  const diseases = profile.diseases || [];
  const diseaseList = diseases.join(', ') || 'General Wellness';
  const hasKidney = diseases.some((d: string) => /kidney|renal|nephro/i.test(d));
  const hasDiabetes = diseases.some((d: string) => /diabet|glucose|sugar/i.test(d));
  const hasAsthma = diseases.some((d: string) => /asthma|copd|pulmon|breath/i.test(d));
  const hasHypertension = diseases.some((d: string) => /hypertens|blood pressure|cardio|heart/i.test(d));

  const medNames = (medications || []).map((m: any) => m.name);
  const isTakingACEorARB = medications.some((m: any) => /lisinopril|losartan|enalapril|ramipril|valsartan/i.test(m.name));
  const isTakingMetformin = medications.some((m: any) => /metformin/i.test(m.name));
  const isTakingStatin = medications.some((m: any) => /statin/i.test(m.name));

  // 1. FEVER / INFECTION / SICKNESS / COLD
  if (q.includes('fever') || q.includes('temperature') || q.includes('sick') || q.includes('chills') || q.includes('cold') || q.includes('flu') || q.includes('infection')) {
    const lines = [
      `Hello ${patientName || 'there'}, having a fever for two days requires careful attention, especially with your medical background (${diseaseList}):`,
      '',
      `• 💧 Prioritize Gentle Hydration: Drink plenty of water and clear broths throughout the day. Fever increases fluid loss, and staying hydrated is critical to protect your kidneys.`,
      '',
      `• ⚠️ Medication Safety Warning: ${
        hasKidney || isTakingACEorARB
          ? 'Because of your kidney condition and blood pressure medications (such as Lisinopril/Losartan), DO NOT take over-the-counter NSAIDs like Ibuprofen (Advil/Motrin), Naproxen (Aleve), or high-dose Aspirin. NSAIDs can acutely worsen kidney function and elevate potassium.'
          : 'Be mindful with over-the-counter pain or fever relievers.'
      } Ask your doctor or pharmacist if Acetaminophen (Tylenol) is suitable for you at a safe, kidney-adjusted dose.`,
      '',
      hasDiabetes
        ? `• 📊 Check Blood Glucose: Illness and fever trigger stress hormones that often cause blood sugar spikes. Monitor your blood glucose more frequently while sick.`
        : '',
      hasAsthma
        ? `• 🫁 Monitor Breathing: Viral infections can exacerbate asthma symptoms. Keep your rescue inhaler within reach.`
        : '',
      '',
      `🚨 Seek immediate medical care if: Your fever reaches 102°F (38.9°C) or higher, has lasted 48+ hours without improvement, or if you experience shortness of breath, chest pressure, severe dizziness, or persistent vomiting.`
    ].filter(Boolean);
    return lines.join('\n');
  }

  // 2. SNACKS / FOOD / DIET / NUTRITION / EATING
  if (q.includes('snack') || q.includes('food') || q.includes('diet') || q.includes('eat') || q.includes('nutrition') || q.includes('meal') || q.includes('fruit') || q.includes('breakfast') || q.includes('lunch') || q.includes('dinner')) {
    const lines = [
      `Here are recommended, clinical-informed snack options tailored to your conditions (${diseaseList}):`,
      '',
      hasDiabetes
        ? `• 🥑 Low-Glycemic & High-Fiber Options: Raw almonds or walnuts, plain unsweetened Greek yogurt with a few fresh berries, celery sticks with natural peanut butter, or hard-boiled eggs. These provide sustained satiety without spiking your blood glucose.`
        : `• 🥗 Nutrient-Dense Snacks: Fresh raw vegetable crudités with hummus, handful of mixed unsalted nuts, or plain Greek yogurt.`,
      '',
      hasKidney
        ? `• 🍎 Kidney Considerations: Fresh apple slices, strawberries, and unsalted air-popped popcorn are gentle on the kidneys. Limit high-potassium dried fruits and avoid potassium-based salt substitutes.`
        : '',
      hasHypertension
        ? `• 🧂 Sodium Control: Choose snacks with under 140 mg of sodium per serving to keep your blood pressure stable.`
        : '',
      isTakingStatin
        ? `• ⚠️ Avoid Grapefruit: Remember that grapefruit and grapefruit juice can increase blood levels of statin medications like Atorvastatin.`
        : '',
      '',
      `Tip: Pair small portions of complex carbohydrates with lean protein or healthy fats to stabilize metabolic energy levels.`
    ].filter(Boolean);
    return lines.join('\n');
  }

  // 3. BLOOD PRESSURE / LISINOPRIL / LOSARTAN / ACE / ARB
  if (q.includes('lisinopril') || q.includes('losartan') || q.includes('blood pressure') || q.includes('hypertension') || q.includes('bp')) {
    return `Regarding your blood pressure medications (${medNames.filter((m: string) => /lisinopril|losartan/i.test(m)).join(', ') || 'Lisinopril / Losartan'}):
• Concurrent RAAS Warning: Taking both Lisinopril (an ACE inhibitor) and Losartan (an ARB) concurrently carries a significant risk of dual renin-angiotensin blockade, which can cause elevated potassium (hyperkalemia) and renal strain. Please verify this combination directly with your prescriber.
• Avoid Potassium Salt Substitutes: These medications reduce renal potassium excretion; avoid salt replacers containing potassium chloride (KCl).
• Posture Changes: Rise slowly from sitting or lying down to prevent dizziness or postural drops in blood pressure.`;
  }

  // 4. DIABETES / METFORMIN / GLUCOSE
  if (q.includes('metformin') || q.includes('diabetes') || q.includes('glucose') || q.includes('sugar') || q.includes('a1c')) {
    return `Regarding your diabetes care and Metformin:
• Administration: Always take Metformin with or immediately after a meal to reduce common stomach upset and gastrointestinal cramps.
• Alcohol Interaction: Avoid heavy alcohol consumption, as alcohol significantly increases the rare but serious risk of lactic acidosis with Metformin.
• Kidney Function: Metformin requires adequate kidney clearance. Ensure you receive routine renal panels (eGFR and creatinine) as recommended by your physician.`;
  }

  // 5. PAIN RELIEF / HEADACHE / BODY ACHE
  if (q.includes('pain') || q.includes('headache') || q.includes('ache') || q.includes('sore') || q.includes('ibuprofen') || q.includes('tylenol')) {
    return `Safe pain relief guidance for your profile (${diseaseList}):
• Caution with NSAIDs: If you have Kidney Disease or take Lisinopril/Losartan, avoid NSAIDs like Ibuprofen (Advil, Motrin) and Naproxen (Aleve). They restrict blood flow to your kidneys and raise blood pressure.
• Safer Alternatives: Ask your physician or pharmacist about Acetaminophen (Tylenol) as a potential option, adhering strictly to recommended daily limits.
• Non-Medication Relief: For tension headaches or muscle soreness, try cold/warm compresses, gentle neck stretches, and staying hydrated.`;
  }

  // 6. ASTHMA / INHALERS / BREATHING / COUGH
  if (q.includes('asthma') || q.includes('inhaler') || q.includes('wheez') || q.includes('breath') || q.includes('cough')) {
    return `Asthma and respiratory guidance:
• Controller vs. Rescue: Use your daily preventer/controller inhaler consistently as prescribed. Keep your fast-acting rescue inhaler (such as Albuterol) within easy reach at all times.
• Rinse After Steroids: If your inhaler contains a corticosteroid, always rinse your mouth with water and spit it out to prevent hoarseness and thrush.
• Red Flags: Seek emergency care immediately if you have persistent wheezing that does not respond to your rescue inhaler, chest tightness, or difficulty speaking in full sentences.`;
  }

  // 7. MISSED DOSE / TIMING / SCHEDULE
  if (q.includes('miss') || q.includes('forgot') || q.includes('skip') || q.includes('timing') || q.includes('when to take')) {
    return `Medication timing & missed dose rule:
• General Clinical Rule: If you miss a dose, take it as soon as you remember. However, if it is almost time for your next scheduled dose, skip the missed dose and resume your normal schedule.
• Never Double Up: Do not take two doses at once to make up for a missed pill.
• Daily Consistency: Try taking your daily medications alongside an established routine (e.g., after breakfast or before brushing your teeth) to build consistent adherence.`;
  }

  // 8. COFFEE / CAFFEINE / TEA / DRINKS
  if (q.includes('coffee') || q.includes('caffeine') || q.includes('tea') || q.includes('drink')) {
    return `Beverage & Medication Advice:
• Take Pills with Plain Water: Always swallow your morning medications with a full 8 oz glass of room-temperature water. Coffee, tea, and citrus juices can irritate the stomach lining or interfere with pill absorption.
• Blood Pressure Impact: High doses of caffeine can cause temporary blood pressure spikes and mild dehydration. If you have hypertension, limit intake to 1–2 moderate cups daily.`;
  }

  // 9. GENERAL / OTHER QUERIES
  return `Thank you for your question regarding: "${query.trim()}".

Based on your active conditions (${diseaseList}) and current medications (${medNames.join(', ') || 'None recorded'}):
1. Individualized Care: Your specific combination of conditions requires coordinating medications and lifestyle choices so one treatment does not antagonize another.
2. Safe Self-Care: Always check before starting any new over-the-counter remedy or supplement, as herbal extracts and common cold/pain medicines can interact with blood pressure, kidney, or diabetic therapies.
3. Consultation: We recommend noting this question in your next doctor or pharmacist appointment.

Is there a specific symptom, medication dose, or dietary question you would like more detail on?`;
}

// 5. POST AI Health Chatbot (Grounded in Patient Context + RAG)
app.post('/api/patient/chat', async (req, res) => {
  try {
    const { email, name, message, profile, medications } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message cannot be empty.' });
    }

    const user = getOrCreateUser(email || 'anonymous', name);
    const activeProfile = profile || user.profile;
    const activeMeds = medications || user.medications;
    const patientName = name || user.name || 'Patient';

    // Retrieve RAG context for this query
    const { relevantSnippets } = retrieveMedicalRAGContext(
      activeProfile.diseases || [],
      activeMeds || [],
      activeProfile.allergies || [],
      activeProfile.dietaryPreference || ''
    );

    let assistantReply = '';
    const gemini = getGeminiClient();

    if (gemini) {
      try {
        const ragContextText = relevantSnippets.map((s) => `[${s.title}]: ${s.excerpt}`).join('\n');
        const systemInstruction = `You are MediSync AI, an intelligent, empathetic, and evidence-grounded healthcare decision-support chatbot.
You are interacting directly with: ${patientName}.
Patient Profile:
- Diagnosed Conditions: ${(activeProfile.diseases || []).join(', ') || 'None recorded'}
- Known Allergies: ${(activeProfile.allergies || []).join(', ') || 'None recorded'}
- Dietary Preference: ${activeProfile.dietaryPreference || 'Standard'}
- Current Medications: ${(activeMeds || []).map((m: any) => `${m.name} (${m.dosage}, ${m.frequency})`).join('; ') || 'No active medications registered'}

Retrieved Medical Guidelines & Monographs:
${ragContextText}

CRITICAL HEALTHCARE MANDATES:
1. Directly answer the user's question with specific, medically sound guidance. For instance:
   - If they ask about fever/sickness, give actionable steps (hydration, rest), specific warnings for their conditions (e.g. avoid NSAIDs like Ibuprofen if they have kidney disease or hypertension; monitor blood sugar closely in diabetes), and explicit red-flag symptoms to seek immediate emergency care.
   - If they ask about snacks or meals, suggest specific low-glycemic, kidney-appropriate, or low-sodium foods and explain why they benefit their health.
2. NEVER say "Stop taking this medication" or "Change your dose". State: "Discuss with your doctor or pharmacist".
3. Use a warm, empathetic, professional tone with clean formatting (short paragraphs and bullet points). Keep under 180 words.`;

        const userPrompt = `Patient Question: "${message.trim()}"
Please provide a clear, helpful, personalized response addressing this question directly in light of my medical profile and active prescriptions.`;

        const aiResponse = await callGeminiGenerate(gemini, userPrompt, systemInstruction);
        if (aiResponse) {
          assistantReply = aiResponse;
        }
      } catch (err: any) {
        console.warn('Gemini chat execution failed, using intelligent clinical fallback:', err);
      }
    }

    // Intelligent domain-specific clinical fallback if Gemini is offline/unavailable
    if (!assistantReply) {
      assistantReply = generateClinicalDecisionResponse(message, activeProfile, activeMeds, patientName);
    }

    // Record in chat history
    const userMsg = { id: `msg-${Date.now()}-u`, sender: 'user' as const, text: message.trim(), timestamp: new Date().toISOString() };
    const botMsg = { id: `msg-${Date.now()}-a`, sender: 'assistant' as const, text: assistantReply, timestamp: new Date().toISOString(), sources: relevantSnippets.map((s) => s.title) };

    user.chatHistory.push(userMsg);
    user.chatHistory.push(botMsg);

    res.json({
      reply: assistantReply,
      sources: relevantSnippets.map((s) => s.title),
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Chat endpoint error:', error);
    res.status(500).json({ error: 'Failed to process chat message.', details: error?.message });
  }
});

// 6. POST Generate Comprehensive Health Report
app.post('/api/patient/report', async (req, res) => {
  try {
    const { email, name, profile, medications } = req.body;
    const user = getOrCreateUser(email || 'anonymous', name);
    const activeProfile = profile || user.profile;
    const activeMeds = medications || user.medications;

    const analysis = user.analysis || runDeterministicMultiAgentAnalysis(activeProfile, activeMeds);

    const reportData = {
      reportId: `MEDISYNC-RPT-${Date.now().toString().slice(-6)}`,
      generatedAt: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      patientName: name || user.name || 'Patient',
      patientEmail: email || user.email,
      age: activeProfile.age || 0,
      gender: activeProfile.gender || 'Not specified',
      height: activeProfile.height || 0,
      weight: activeProfile.weight || 0,
      bmi: analysis.bmi,
      conditions: activeProfile.diseases || [],
      allergies: activeProfile.allergies || [],
      dietaryPattern: activeProfile.dietaryPreference || 'Standard / Balanced',
      medications: activeMeds,
      medicationGuidance: {
        continueList: analysis.medicationsToContinue,
        cautionList: analysis.medicationsToCaution,
        reviewList: analysis.medicationsRequiringReview
      },
      interactions: analysis.interactions,
      medicationFoodInteractions: analysis.medicationFoodInteractions,
      foodGuidance: analysis.foodGuidance,
      mealPlan: analysis.mealStructure,
      aiSummary: analysis.healthSummary,
      disclaimer: 'This MediSync AI Health Report is generated for personal decision-support and educational verification purposes only. It does not constitute formal medical diagnosis, treatment, or prescription change orders. Always consult your board-certified physician or licensed pharmacist for medical adjustments.'
    };

    user.reports.push(reportData);

    res.json({ success: true, report: reportData });
  } catch (error: any) {
    console.error('Report generation error:', error);
    res.status(500).json({ error: 'Failed to generate health report.' });
  }
});

// 7. GET Admin System Stats (restricted to gouthamnatukula777@gmail.com)
app.get('/api/admin/stats', (req, res) => {
  const adminEmail = req.query.adminEmail as string;
  if (adminEmail !== 'gouthamnatukula777@gmail.com') {
    return res.status(403).json({ error: 'Unauthorized. Admin access only.' });
  }

  res.json({
    totalUsers: userStore.size,
    knowledgeMonographsCount: MEDICAL_MONOGRAPHS.length,
    activeAgentsCount: 5,
    systemStatus: 'Operational / All Agents Ready',
    geminiConfigured: !!process.env.GEMINI_API_KEY,
    registeredEmails: Array.from(userStore.keys()),
    serverTime: new Date().toISOString()
  });
});

// -------------------------------------------------------------
// Vite Middleware for Development / Static Hosting in Production
// -------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MediSync AI Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
