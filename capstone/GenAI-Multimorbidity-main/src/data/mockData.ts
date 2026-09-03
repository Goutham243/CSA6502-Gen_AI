import { 
  HealthProfile, 
  Medication, 
  PatientHealthAnalysis, 
  DietSections, 
  DailyMealStructure,
  AnalyzedMedication,
  DetectedInteraction,
  MedicationFoodInteraction,
  DietRecommendationItem,
  SuggestedMedication
} from '../types';

export const INITIAL_HEALTH_PROFILE: HealthProfile = {
  age: 48,
  gender: 'Male',
  height: 175,
  weight: 74,
  diseases: ['Diabetes', 'Hypertension'],
  allergies: ['Penicillin'],
  dietaryPreference: 'Vegetarian',
  notes: 'Focus on balanced blood glucose management and steady blood pressure control.',
  updatedAt: new Date().toISOString(),
};

export const INITIAL_MEDICATIONS: Medication[] = [
  {
    id: 'med-1',
    name: 'Metformin',
    dosage: '500 mg',
    frequency: 'Twice daily',
    timing: 'With breakfast & dinner',
    category: 'Antidiabetic',
    prescribedFor: 'Blood Sugar Regulation',
  },
  {
    id: 'med-2',
    name: 'Amlodipine',
    dosage: '5 mg',
    frequency: 'Once daily',
    timing: 'Morning with water',
    category: 'Calcium Channel Blocker',
    prescribedFor: 'Blood Pressure Control',
  },
];

export interface PresetScenario {
  id: string;
  label: string;
  description: string;
  profile: Partial<HealthProfile>;
  medications: Medication[];
}

export const PRESET_SCENARIOS: PresetScenario[] = [
  {
    id: 'test-case-1',
    label: 'Test Case 1: Diabetes + Metformin (Vegetarian)',
    description: 'Single condition diabetes management with vegetarian nutritional constraints.',
    profile: {
      age: 45,
      gender: 'Female',
      height: 165,
      weight: 64,
      diseases: ['Diabetes'],
      allergies: [],
      dietaryPreference: 'Vegetarian',
    },
    medications: [
      {
        id: 'tc1-med1',
        name: 'Metformin',
        dosage: '500 mg',
        frequency: 'Twice daily',
        timing: 'With breakfast and dinner',
        category: 'Antidiabetic',
        prescribedFor: 'Type 2 Diabetes',
      },
    ],
  },
  {
    id: 'test-case-2',
    label: 'Test Case 2: Hypertension + Amlodipine',
    description: 'Hypertension profile prioritizing DASH lower-sodium nutrition and calcium channel blocker guidance.',
    profile: {
      age: 52,
      gender: 'Male',
      height: 178,
      weight: 80,
      diseases: ['Hypertension'],
      allergies: [],
      dietaryPreference: 'Low Sodium (Heart Healthy)',
    },
    medications: [
      {
        id: 'tc2-med1',
        name: 'Amlodipine',
        dosage: '5 mg',
        frequency: 'Once daily',
        timing: 'Morning with a full glass of water',
        category: 'Calcium Channel Blocker',
        prescribedFor: 'Hypertension',
      },
    ],
  },
  {
    id: 'test-case-3',
    label: 'Test Case 3: Diabetes + Hypertension + Kidney Disease',
    description: 'Complex multi-disease with Metformin + Amlodipine + Losartan triggering combined conflict review.',
    profile: {
      age: 63,
      gender: 'Male',
      height: 172,
      weight: 78,
      diseases: ['Diabetes', 'Hypertension', 'Kidney Disease'],
      allergies: [],
      dietaryPreference: 'Renal / Kidney-Friendly',
    },
    medications: [
      {
        id: 'tc3-med1',
        name: 'Metformin',
        dosage: '850 mg',
        frequency: 'Twice daily',
        timing: 'With meals',
        category: 'Antidiabetic',
        prescribedFor: 'Blood Sugar Regulation',
      },
      {
        id: 'tc3-med2',
        name: 'Amlodipine',
        dosage: '10 mg',
        frequency: 'Once daily',
        timing: 'Morning',
        category: 'Calcium Channel Blocker',
        prescribedFor: 'Blood Pressure',
      },
      {
        id: 'tc3-med3',
        name: 'Losartan',
        dosage: '50 mg',
        frequency: 'Once daily',
        timing: 'Morning',
        category: 'Angiotensin Receptor Blocker (ARB)',
        prescribedFor: 'Renal Protection & Blood Pressure',
      },
    ],
  },
  {
    id: 'test-case-4',
    label: 'Test Case 4: Asthma + Allergies (Peanuts & Dairy)',
    description: 'Respiratory profile with active food allergies ensuring strict allergen elimination in diet.',
    profile: {
      age: 29,
      gender: 'Female',
      height: 160,
      weight: 56,
      diseases: ['Asthma'],
      allergies: ['Peanuts', 'Dairy'],
      dietaryPreference: 'Standard / Balanced',
    },
    medications: [
      {
        id: 'tc4-med1',
        name: 'Albuterol Inhaler',
        dosage: '90 mcg (2 puffs)',
        frequency: 'As needed (PRN)',
        timing: 'Prior to exercise or onset of wheezing',
        category: 'Bronchodilator',
        prescribedFor: 'Asthma Symptom Relief',
      },
    ],
  },
  {
    id: 'test-case-5',
    label: 'Test Case 5: High Cholesterol + Atorvastatin',
    description: 'Lipid management showcasing drug-food grapefruit interaction and cardiovascular lipid nutrition.',
    profile: {
      age: 56,
      gender: 'Male',
      height: 180,
      weight: 85,
      diseases: ['High Cholesterol', 'Hypertension'],
      allergies: [],
      dietaryPreference: 'Mediterranean Diet',
    },
    medications: [
      {
        id: 'tc5-med1',
        name: 'Atorvastatin',
        dosage: '20 mg',
        frequency: 'Once daily',
        timing: 'Bedtime',
        category: 'HMG-CoA Reductase Inhibitor (Statin)',
        prescribedFor: 'Dyslipidemia',
      },
      {
        id: 'tc5-med2',
        name: 'Lisinopril',
        dosage: '10 mg',
        frequency: 'Once daily',
        timing: 'Morning',
        category: 'ACE Inhibitor',
        prescribedFor: 'Hypertension',
      },
    ],
  },
];

/**
 * Clean helper function for personalized greeting based on current time
 */
export function getTimeGreeting(name: string): string {
  const hour = new Date().getHours();
  let greetingPrefix = 'Good Morning';
  if (hour >= 12 && hour < 18) {
    greetingPrefix = 'Good Afternoon';
  } else if (hour >= 18 || hour < 4) {
    greetingPrefix = 'Good Evening';
  }
  const cleanName = name?.trim() || 'Patient';
  return `${greetingPrefix}, ${cleanName} 👋`;
}

/**
 * Helper to compute Body Mass Index
 */
export function calculateBMI(heightCm: number, weightKg: number): { value: number; category: string } {
  if (!heightCm || !weightKg || heightCm <= 0) return { value: 22.5, category: 'Normal weight' };
  const heightM = heightCm / 100;
  const bmiVal = Number((weightKg / (heightM * heightM)).toFixed(1));
  let category = 'Normal weight';
  if (bmiVal < 18.5) category = 'Underweight';
  else if (bmiVal >= 25 && bmiVal < 30) category = 'Overweight';
  else if (bmiVal >= 30) category = 'Obesity range';
  return { value: bmiVal, category };
}

/**
 * Normalizes strings for robust matching
 */
function normalize(str: string): string {
  return (str || '').toLowerCase().trim();
}

/**
 * Clinical Decision Support: Guideline-Recommended Medication Suggestions for Diagnosed Conditions
 */
export function getMedicationSuggestionsForConditions(
  diseases: string[],
  allergies: string[] = []
): SuggestedMedication[] {
  const suggestions: SuggestedMedication[] = [];
  const normalizedDiseases = (diseases || []).map((d) => normalize(d));
  const normalizedAllergies = (allergies || []).map((a) => normalize(a));

  const hasDisease = (regex: RegExp) => normalizedDiseases.some((d) => regex.test(d));
  const hasAllergy = (regex: RegExp) => normalizedAllergies.some((a) => regex.test(a));

  // 1. Kidney Disease (Renal Protection & Proteinuria)
  if (hasDisease(/kidney|renal|nephro|ckd/i)) {
    suggestions.push(
      {
        id: 'sug-ckd-losartan',
        name: 'Losartan',
        genericName: 'Losartan Potassium (Cozaar)',
        condition: 'Kidney Disease',
        category: 'Angiotensin II Receptor Blocker (ARB)',
        typicalDosage: '50 mg',
        frequency: 'Once daily',
        timing: 'Morning with a glass of water',
        purpose: 'Kidney Protection & Proteinuria Reduction',
        clinicalRationale: 'KDIGO & ADA clinical guidelines recommend ARBs as foundational first-line therapy to decrease intraglomerular pressure, reduce urinary protein leakage, and preserve long-term kidney function.',
        cautionNotes: 'Requires routine monitoring of serum potassium and creatinine. Avoid salt substitutes containing potassium chloride.',
        evidenceGrade: 'First-line Guideline',
      },
      {
        id: 'sug-ckd-dapa',
        name: 'Dapagliflozin',
        genericName: 'Dapagliflozin (Farxiga)',
        condition: 'Kidney Disease',
        category: 'SGLT2 Inhibitor',
        typicalDosage: '10 mg',
        frequency: 'Once daily',
        timing: 'Morning with or without food',
        purpose: 'Renal Progression Delay & Cardioprotection',
        clinicalRationale: 'Proven in clinical trials (DAPA-CKD) to significantly slow the decline of kidney function and reduce cardiovascular events in patients with chronic kidney disease.',
        cautionNotes: 'Maintain healthy hydration throughout the day. Practice good hygiene to prevent urinary tract infections.',
        evidenceGrade: 'First-line Guideline',
      }
    );
  }

  // 2. Asthma & Respiratory Conditions
  if (hasDisease(/asthma|copd|bronch|respiratory/i)) {
    suggestions.push(
      {
        id: 'sug-asthma-advair',
        name: 'Fluticasone / Salmeterol',
        genericName: 'Fluticasone Propionate & Salmeterol Inhalation Powder (Advair / Wixela)',
        condition: 'Asthma',
        category: 'Inhaled Corticosteroid / LABA Controller',
        typicalDosage: '100/50 mcg (1 inhalation)',
        frequency: 'Twice daily (every 12 hours)',
        timing: 'Morning and evening',
        purpose: 'Daily Maintenance & Airway Anti-inflammatory',
        clinicalRationale: 'GINA guidelines establish low-dose inhaled corticosteroid controller therapy as the gold standard to prevent bronchial inflammation and avoid severe asthma flare-ups.',
        cautionNotes: 'Always rinse mouth and gargle with water (spit out) immediately after each inhalation to prevent oral thrush and throat irritation.',
        evidenceGrade: 'Maintenance',
      },
      {
        id: 'sug-asthma-albuterol',
        name: 'Albuterol Inhaler',
        genericName: 'Albuterol Sulfate HFA (Ventolin / ProAir)',
        condition: 'Asthma',
        category: 'Short-Acting Beta-2 Agonist (SABA) Rescue Inhaler',
        typicalDosage: '90 mcg (1-2 puffs)',
        frequency: 'As needed (PRN)',
        timing: 'During acute shortness of breath or 15 min before physical exercise',
        purpose: 'Fast-Acting Acute Bronchospasm Relief',
        clinicalRationale: 'Rapidly relaxes smooth muscle surrounding the bronchial airways within minutes during sudden wheezing, coughing, or acute tightness.',
        cautionNotes: 'Keep within reach at all times. If you need rescue inhaler more than twice per week, consult your doctor to optimize your daily controller plan.',
        evidenceGrade: 'Rescue / Symptom Relief',
      },
      {
        id: 'sug-asthma-montelukast',
        name: 'Montelukast',
        genericName: 'Montelukast Sodium (Singulair)',
        condition: 'Asthma',
        category: 'Leukotriene Receptor Antagonist (LTRA)',
        typicalDosage: '10 mg',
        frequency: 'Once daily',
        timing: 'In the evening at bedtime',
        purpose: 'Allergic Airway Constriction Prevention',
        clinicalRationale: 'Suppresses inflammatory leukotrienes to decrease exercise-induced bronchoconstriction and allergic airway hyperactivity.',
        cautionNotes: 'Report any changes in mood, sleep disturbances, or unusual dreams to your physician.',
        evidenceGrade: 'Adjunct',
      }
    );
  }

  // 3. Diabetes (Type 2 Diabetes / Glycemic Management)
  if (hasDisease(/diabet|glycem|blood sugar/i)) {
    suggestions.push(
      {
        id: 'sug-diab-metformin',
        name: 'Metformin',
        genericName: 'Metformin Hydrochloride (Glucophage)',
        condition: 'Diabetes',
        category: 'Biguanide Antidiabetic',
        typicalDosage: '500 mg - 850 mg',
        frequency: 'Twice daily',
        timing: 'With meals (Breakfast & Dinner)',
        purpose: 'Fasting Blood Glucose Regulation & Insulin Sensitivity',
        clinicalRationale: 'ADA Standards of Care foundational first-line oral medication for Type 2 Diabetes; lowers hepatic glucose production without causing hypoglycemia or weight gain.',
        cautionNotes: 'Always take with food to minimize gastrointestinal discomfort. Kidney filtration (eGFR) should be checked periodically.',
        evidenceGrade: 'First-line Guideline',
      },
      {
        id: 'sug-diab-empagliflozin',
        name: 'Empagliflozin',
        genericName: 'Empagliflozin (Jardiance)',
        condition: 'Diabetes',
        category: 'SGLT2 Inhibitor',
        typicalDosage: '10 mg',
        frequency: 'Once daily',
        timing: 'Morning with or without food',
        purpose: 'Cardiovascular & Renal Risk Reduction',
        clinicalRationale: 'Facilitates urinary glucose excretion with clinically proven cardiovascular protection and blood pressure reduction.',
        cautionNotes: 'Drink plenty of fluids throughout the day. Report any unusual fatigue, nausea, or urinary symptoms.',
        evidenceGrade: 'First-line Guideline',
      }
    );
  }

  // 4. Hypertension (High Blood Pressure)
  if (hasDisease(/hypertens|blood pressure/i)) {
    suggestions.push(
      {
        id: 'sug-htn-amlodipine',
        name: 'Amlodipine',
        genericName: 'Amlodipine Besylate (Norvasc)',
        condition: 'Hypertension',
        category: 'Calcium Channel Blocker (Dihydropyridine)',
        typicalDosage: '5 mg',
        frequency: 'Once daily',
        timing: 'Morning with water',
        purpose: '24-Hour Arterial Pressure Relaxation',
        clinicalRationale: 'ACC/AHA guideline-recommended first-line antihypertensive that relaxes peripheral vascular smooth muscle to smooth blood flow.',
        cautionNotes: 'Do not consume whole grapefruit or large amounts of grapefruit juice. Monitor for mild peripheral ankle swelling.',
        evidenceGrade: 'First-line Guideline',
      },
      {
        id: 'sug-htn-telmisartan',
        name: 'Telmisartan',
        genericName: 'Telmisartan (Micardis)',
        condition: 'Hypertension',
        category: 'Angiotensin II Receptor Blocker (ARB)',
        typicalDosage: '40 mg',
        frequency: 'Once daily',
        timing: 'Morning with or without food',
        purpose: 'Cardioprotective Blood Pressure Control',
        clinicalRationale: 'Longest half-life among ARBs (24 hours) providing smooth around-the-clock blood pressure control with high patient tolerability.',
        cautionNotes: 'Avoid excessive potassium salt substitutes. Stand up gradually to prevent mild lightheadedness.',
        evidenceGrade: 'First-line Guideline',
      }
    );
  }

  // 5. High Cholesterol / Hyperlipidemia
  if (hasDisease(/cholesterol|lipid|hyperlipid/i)) {
    suggestions.push(
      {
        id: 'sug-chol-atorvastatin',
        name: 'Atorvastatin',
        genericName: 'Atorvastatin Calcium (Lipitor)',
        condition: 'High Cholesterol',
        category: 'HMG-CoA Reductase Inhibitor (Statin)',
        typicalDosage: '20 mg',
        frequency: 'Once daily',
        timing: 'Evening / At bedtime',
        purpose: 'LDL Cholesterol Reduction & Arterial Plaque Stabilization',
        clinicalRationale: 'ACC/AHA cornerstone therapy for secondary and primary atherosclerotic cardiovascular disease prevention.',
        cautionNotes: 'Strictly avoid whole grapefruit and grapefruit juice. Notify your doctor if experiencing unexplained muscle tenderness.',
        evidenceGrade: 'First-line Guideline',
      },
      {
        id: 'sug-chol-ezetimibe',
        name: 'Ezetimibe',
        genericName: 'Ezetimibe (Zetia)',
        condition: 'High Cholesterol',
        category: 'Cholesterol Absorption Inhibitor',
        typicalDosage: '10 mg',
        frequency: 'Once daily',
        timing: 'Once daily with or without food',
        purpose: 'Intestinal Dietary Cholesterol Blockade',
        clinicalRationale: 'Selectively inhibits cholesterol uptake in the small intestine; ideal adjunct for enhanced LDL lowering.',
        cautionNotes: 'Can be taken together with or independent of statin medications.',
        evidenceGrade: 'Adjunct',
      }
    );
  }

  // 6. Acid Reflux (GERD)
  if (hasDisease(/reflux|gerd|acid|heartburn/i)) {
    suggestions.push(
      {
        id: 'sug-gerd-omeprazole',
        name: 'Omeprazole',
        genericName: 'Omeprazole Delayed-Release (Prilosec)',
        condition: 'Acid Reflux (GERD)',
        category: 'Proton Pump Inhibitor (PPI)',
        typicalDosage: '20 mg',
        frequency: 'Once daily',
        timing: '30-60 minutes before breakfast on an empty stomach',
        purpose: 'Gastric Acid Suppression & Esophageal Healing',
        clinicalRationale: 'ACG clinical guidelines establish PPIs as the most effective therapy for esophageal mucosal healing and rapid symptom relief.',
        cautionNotes: 'Take consistently before your first meal for maximum acid suppression.',
        evidenceGrade: 'First-line Guideline',
      },
      {
        id: 'sug-gerd-famotidine',
        name: 'Famotidine',
        genericName: 'Famotidine (Pepcid AC)',
        condition: 'Acid Reflux (GERD)',
        category: 'H2 Receptor Antagonist',
        typicalDosage: '20 mg',
        frequency: 'Once or twice daily as needed',
        timing: 'Before meals or before bedtime',
        purpose: 'Situational & Nocturnal Acid Management',
        clinicalRationale: 'Fast-acting histamine-2 blocker providing prompt relief from acute or nighttime acid reflux symptoms.',
        cautionNotes: 'Suitable for on-demand use before trigger meals.',
        evidenceGrade: 'Rescue / Symptom Relief',
      }
    );
  }

  // 7. Thyroid Condition (Hypothyroidism)
  if (hasDisease(/thyroid|hypothyroid/i)) {
    suggestions.push({
      id: 'sug-thyroid-levo',
      name: 'Levothyroxine',
      genericName: 'Levothyroxine Sodium (Synthroid / Euthyrox)',
      condition: 'Thyroid Condition',
      category: 'Synthetic Thyroid Hormone (T4)',
      typicalDosage: '50 mcg - 100 mcg',
      frequency: 'Once daily',
      timing: 'First thing in morning with plain water, 30-60 min before breakfast',
      purpose: 'Endocrine Metabolic Balance & Energy Restoration',
      clinicalRationale: 'ATA guideline standard-of-care primary hormone replacement therapy to normalize thyroid stimulating hormone (TSH).',
      cautionNotes: 'Never take with calcium or iron supplements, antacids, or morning coffee (separate by at least 4 hours).',
      evidenceGrade: 'First-line Guideline',
    });
  }

  // 8. Gout
  if (hasDisease(/gout|uric/i)) {
    suggestions.push({
      id: 'sug-gout-allopurinol',
      name: 'Allopurinol',
      genericName: 'Allopurinol (Zyloprim)',
      condition: 'Gout',
      category: 'Xanthine Oxidase Inhibitor',
      typicalDosage: '100 mg - 300 mg',
      frequency: 'Once daily',
      timing: 'After meals with a full glass of water',
      purpose: 'Uric Acid Lowering & Flare Prophylaxis',
      clinicalRationale: 'ACR guidelines recommend allopurinol as preferred first-line urate-lowering therapy to dissolve crystals and prevent joint erosion.',
      cautionNotes: 'Maintain generous daily hydration. Do not stop abruptly during an acute attack without physician advice.',
      evidenceGrade: 'First-line Guideline',
    });
  }

  // 9. Arthritis / Joint Pain
  if (hasDisease(/arthrit|joint/i)) {
    suggestions.push({
      id: 'sug-arth-voltaren',
      name: 'Diclofenac Sodium Topical Gel',
      genericName: 'Voltaren Arthritis Pain Gel 1%',
      condition: 'Arthritis',
      category: 'Topical Non-Steroidal Anti-Inflammatory (NSAID)',
      typicalDosage: '2g - 4g to affected joint',
      frequency: 'Up to 4 times daily',
      timing: 'Apply onto clean, dry skin over painful joint',
      purpose: 'Localized Joint Anti-Inflammatory Relief',
      clinicalRationale: 'OARSI and ACR guidelines recommend topical NSAIDs as first-line over oral NSAIDs to minimize systemic stomach and kidney side effects.',
      cautionNotes: 'Wash hands after application (unless hands are the treated joint). Do not apply to open skin wounds.',
      evidenceGrade: 'First-line Guideline',
    });
  }

  // 10. Heart Failure
  if (hasDisease(/heart failure|chf|cardiac failure/i)) {
    suggestions.push({
      id: 'sug-hf-entresto',
      name: 'Sacubitril / Valsartan',
      genericName: 'Sacubitril/Valsartan (Entresto)',
      condition: 'Heart Failure',
      category: 'Angiotensin Receptor-Neprilysin Inhibitor (ARNI)',
      typicalDosage: '24/26 mg or 49/51 mg',
      frequency: 'Twice daily',
      timing: 'Morning and evening with water',
      purpose: 'Myocardial Strain Reduction & Survival Benefit',
      clinicalRationale: 'AHA/ACC GDMT (Guideline-Directed Medical Therapy) foundational class shown to significantly reduce cardiovascular death and hospitalizations.',
      cautionNotes: 'Requires physician titration and 36-hour washout period if transitioning from an ACE inhibitor.',
      evidenceGrade: 'First-line Guideline',
    });
  }

  // Fallback general cardioprotective & metabolic health suggestions if no specific matches
  if (suggestions.length === 0) {
    suggestions.push(
      {
        id: 'sug-gen-omega3',
        name: 'Omega-3 EPA / DHA',
        genericName: 'Purified Marine Omega-3 Fatty Acids',
        condition: 'General Cardiovascular Wellness',
        category: 'Essential Fatty Acids',
        typicalDosage: '1000 mg',
        frequency: 'Once daily',
        timing: 'With a main meal',
        purpose: 'Vascular Health & Triglyceride Balance',
        clinicalRationale: 'Supports healthy arterial flexibility, reduces systemic inflammation, and promotes favorable lipid balance.',
        cautionNotes: 'Take with a meal containing healthy fats for optimal gastrointestinal absorption.',
        evidenceGrade: 'Maintenance',
      },
      {
        id: 'sug-gen-vitamind',
        name: 'Vitamin D3 (Cholecalciferol)',
        genericName: 'Cholecalciferol',
        condition: 'Immune & Bone Health',
        category: 'Essential Micronutrient',
        typicalDosage: '1000 - 2000 IU',
        frequency: 'Once daily',
        timing: 'Morning with breakfast',
        purpose: 'Bone Mineralization & Immune Resilience',
        clinicalRationale: 'Critical cofactor for calcium absorption, bone strength, neuromuscular function, and immune defense.',
        cautionNotes: 'Fat-soluble vitamin; best absorbed when taken with breakfast containing healthy fats.',
        evidenceGrade: 'Maintenance',
      }
    );
  }

  return suggestions;
}

/**
 * Comprehensive Dynamic Personalization Engine
 * Analyzes Diseases + Medications + Allergies + Dietary Preferences + Biometrics
 */
export function generatePatientGuidance(
  profile: HealthProfile,
  medications: Medication[],
  patientNameInput?: string
): PatientHealthAnalysis {
  const diseases = profile.diseases || [];
  const allergies = profile.allergies || [];
  const dietPref = profile.dietaryPreference || 'Standard / Balanced';
  const age = profile.age || 35;
  const patientName = patientNameInput || 'Patient';
  const bmi = calculateBMI(profile.height, profile.weight);

  // Disease flags
  const hasDiabetes = diseases.some((d) => /diabet/i.test(d));
  const hasHypertension = diseases.some((d) => /hypertens|blood pressure/i.test(d));
  const hasKidneyDisease = diseases.some((d) => /kidney|renal|nephro/i.test(d));
  const hasCholesterol = diseases.some((d) => /cholesterol|lipid|hyperlipid/i.test(d));
  const hasAsthma = diseases.some((d) => /asthma|copd|respiratory/i.test(d));
  const hasThyroid = diseases.some((d) => /thyroid|hypothyroid/i.test(d));
  const hasReflux = diseases.some((d) => /reflux|gerd|acid/i.test(d));
  const hasGout = diseases.some((d) => /gout|uric/i.test(d));
  const hasHeartFailure = diseases.some((d) => /heart failure|cardiac failure|chf/i.test(d));
  const hasArthritis = diseases.some((d) => /arthrit|joint/i.test(d));

  // Medication parsing
  const medNorms = medications.map((m) => ({
    raw: m,
    name: normalize(m.name),
    dose: normalize(m.dosage),
    freq: normalize(m.frequency),
  }));

  const hasMetformin = medNorms.some((m) => m.name.includes('metformin'));
  const hasAmlodipine = medNorms.some((m) => m.name.includes('amlodipine') || m.name.includes('norvasc'));
  const hasLosartan = medNorms.some((m) => m.name.includes('losartan') || m.name.includes('cozaar'));
  const hasLisinopril = medNorms.some((m) => m.name.includes('lisinopril') || m.name.includes('zestril') || m.name.includes('prinivil') || m.name.includes('ramipril') || m.name.includes('enalapril'));
  const hasStatin = medNorms.some((m) => m.name.includes('atorvastatin') || m.name.includes('simvastatin') || m.name.includes('rosuvastatin') || m.name.includes('lipitor') || m.name.includes('crestor'));
  const hasNSAID = medNorms.some((m) => m.name.includes('ibuprofen') || m.name.includes('naproxen') || m.name.includes('advil') || m.name.includes('motrin') || m.name.includes('diclofenac') || m.name.includes('meloxicam'));
  const hasAspirin = medNorms.some((m) => m.name.includes('aspirin') || m.name.includes('ecotrin'));
  const hasBetaBlocker = medNorms.some((m) => m.name.includes('propranolol') || m.name.includes('metoprolol') || m.name.includes('atenolol') || m.name.includes('carvedilol'));
  const hasLevothyroxine = medNorms.some((m) => m.name.includes('levothyroxine') || m.name.includes('synthroid') || m.name.includes('euthyrox'));
  const hasPPI = medNorms.some((m) => m.name.includes('omeprazole') || m.name.includes('pantoprazole') || m.name.includes('esomeprazole') || m.name.includes('prilosec'));
  const hasBloodThinner = medNorms.some((m) => m.name.includes('warfarin') || m.name.includes('coumadin') || m.name.includes('apixaban') || m.name.includes('eliquis') || m.name.includes('rivaroxaban') || m.name.includes('xarelto'));
  const hasDiuretic = medNorms.some((m) => m.name.includes('hydrochlorothiazide') || m.name.includes('hctz') || m.name.includes('furosemide') || m.name.includes('lasix') || m.name.includes('spironolactone'));

  // =========================================================================
  // 1. CONFLICT & INTERACTION ANALYSIS (Disease-Disease, Disease-Drug, Drug-Drug, Drug-Food)
  // =========================================================================
  const interactions: DetectedInteraction[] = [];
  const medFoodInteractions: MedicationFoodInteraction[] = [];

  // Interaction: Metformin + Kidney Disease (Disease + Drug)
  if (hasMetformin && hasKidneyDisease) {
    interactions.push({
      id: 'inter-metformin-ckd',
      type: 'drug-disease',
      severity: 'Moderate',
      headline: 'Metformin & Renal Function Review',
      itemsInvolved: ['Metformin', 'Kidney Disease'],
      simpleExplanation: 'Metformin is filtered primarily through the kidneys. In patients with kidney conditions, renal filtration (eGFR) must be periodically evaluated by a clinician to ensure appropriate dosage and avoid excess buildup.',
      clinicalMechanism: 'Reduced renal clearance of biguanides requires renal dosing adjustments to prevent metabolic stress.',
      recommendation: 'Requires professional review. Discuss your latest kidney function lab tests (eGFR) with your prescribing doctor to confirm your optimal Metformin dosage.',
    });
  }

  // Interaction: Lisinopril (ACE-I) + Losartan (ARB) (Drug + Drug - Dual RAAS blockade)
  if ((hasLisinopril && hasLosartan) || (medNorms.filter((m) => m.name.includes('pril') || m.name.includes('sartan')).length >= 2)) {
    interactions.push({
      id: 'inter-dual-raas',
      type: 'drug-drug',
      severity: 'High',
      headline: 'Dual RAAS Blockade Identified (ACE-I + ARB)',
      itemsInvolved: ['Lisinopril / ACE Inhibitor', 'Losartan / ARB'],
      simpleExplanation: 'Taking both an ACE inhibitor and an Angiotensin Receptor Blocker concurrently increases the risk of elevated potassium levels (hyperkalemia) and low blood pressure without additional clinical benefit.',
      clinicalMechanism: 'Concurrent inhibition of angiotensin converting enzyme and AT1 receptor produces additive renal hemodynamic effects.',
      recommendation: 'Requires professional review. Discuss this combination with your doctor or pharmacist to determine if dual therapy is intentional or requires regimen adjustment.',
    });
  }

  // Interaction: NSAID + Kidney Disease / Hypertension (Drug + Disease)
  if (hasNSAID && (hasKidneyDisease || hasHypertension)) {
    interactions.push({
      id: 'inter-nsaid-renal-htn',
      type: 'drug-disease',
      severity: 'Moderate',
      headline: 'NSAIDs with Blood Pressure & Renal Profile',
      itemsInvolved: ['NSAID (e.g. Ibuprofen/Naproxen)', hasKidneyDisease ? 'Kidney Disease' : 'Hypertension'],
      simpleExplanation: 'Non-steroidal anti-inflammatory drugs (NSAIDs) can reduce renal blood flow, increase fluid retention, and counteract the effectiveness of blood pressure and kidney medications.',
      clinicalMechanism: 'Inhibition of renal prostaglandins results in vasoconstriction of afferent arterioles and sodium retention.',
      recommendation: 'Use with caution. Discuss with your doctor or pharmacist before using regular NSAID pain relievers; consider alternative options approved by your physician.',
    });
  }

  // Interaction: Blood Thinner + NSAID / Aspirin (Drug + Drug)
  if (hasBloodThinner && (hasNSAID || hasAspirin)) {
    interactions.push({
      id: 'inter-anticoag-antiplatelet',
      type: 'drug-drug',
      severity: 'High',
      headline: 'Combined Anticoagulant & Anti-inflammatory Therapy',
      itemsInvolved: ['Blood Thinner (Anticoagulant)', 'NSAID / Aspirin'],
      simpleExplanation: 'Combining blood thinners with anti-inflammatory medications significantly increases the risk of stomach irritation and gastrointestinal bleeding.',
      clinicalMechanism: 'Additive antiplatelet and antithrombotic effects on hemostatic mechanisms.',
      recommendation: 'Requires professional review. Do not combine these medicines without explicit instruction and monitoring from your doctor.',
    });
  }

  // Interaction: Beta Blocker + Asthma (Drug + Disease)
  if (hasBetaBlocker && hasAsthma) {
    interactions.push({
      id: 'inter-betablocker-asthma',
      type: 'drug-disease',
      severity: 'Moderate',
      headline: 'Beta-Blocker & Respiratory Sensitivity',
      itemsInvolved: ['Beta-Blocker', 'Asthma'],
      simpleExplanation: 'Certain beta-blockers may cause airway constriction or reduce the responsiveness of asthma inhalers.',
      clinicalMechanism: 'Inhibition of beta-2 adrenergic receptors in bronchial smooth muscle.',
      recommendation: 'Requires professional review. Confirm with your physician that your beta-blocker is cardio-selective and safe for your respiratory history.',
    });
  }

  // Interaction: Diabetes + Hypertension + Kidney Disease (Disease + Disease multi-triad)
  if (hasDiabetes && hasHypertension && hasKidneyDisease) {
    interactions.push({
      id: 'inter-triad-diab-htn-ckd',
      type: 'disease-disease',
      severity: 'Moderate',
      headline: 'Combined Cardio-Renal-Metabolic Profile',
      itemsInvolved: ['Diabetes', 'Hypertension', 'Kidney Disease'],
      simpleExplanation: 'The combination of blood sugar, blood pressure, and renal management requires coordinated care: stabilizing blood glucose while maintaining target blood pressure protects renal filtration.',
      clinicalMechanism: 'Microvascular endothelial stress and glomerular hyperfiltration.',
      recommendation: 'Follow the prescribed dosage and care plan coordinated by your primary care physician, nephrologist, or endocrinologist.',
    });
  }

  // Medication-Food: Statin or Amlodipine + Grapefruit
  if (hasStatin || hasAmlodipine) {
    const medTarget = hasStatin ? 'Atorvastatin / Statin' : 'Amlodipine';
    medFoodInteractions.push({
      id: 'mf-grapefruit-statin',
      medicationName: medTarget,
      foodName: 'Grapefruit & Grapefruit Juice',
      severity: 'Moderate',
      status: '⚠ Potential Interaction',
      explanation: 'Grapefruit contains compounds (furanocoumarins) that block intestinal CYP3A4 enzymes, allowing significantly higher concentrations of the medication to enter your bloodstream.',
      recommendation: 'Discuss this combination with a qualified healthcare professional. It is generally advised to avoid grapefruit while taking this medication.',
    });
  }

  // Medication-Food: ACE Inhibitors / ARBs (Lisinopril / Losartan) + Potassium Salt Substitutes
  if (hasLisinopril || hasLosartan) {
    const medTarget = hasLosartan ? 'Losartan' : 'Lisinopril';
    medFoodInteractions.push({
      id: 'mf-potassium-raas',
      medicationName: medTarget,
      foodName: 'Potassium-Based Salt Substitutes',
      severity: 'Moderate',
      status: '⚠ Potential Interaction',
      explanation: 'Blood pressure medications like ACE inhibitors and ARBs reduce the amount of potassium excreted by the kidneys. Using potassium-enriched salt substitutes can lead to dangerously elevated blood potassium levels (hyperkalemia).',
      recommendation: 'Discuss this combination with a qualified healthcare professional. Avoid potassium salt substitutes unless specifically directed by your doctor.',
    });
  }

  // Medication-Food: Levothyroxine + Calcium / Iron / Espresso / Soy
  if (hasLevothyroxine) {
    medFoodInteractions.push({
      id: 'mf-levo-calcium-soy',
      medicationName: 'Levothyroxine',
      foodName: 'Calcium/Iron Supplements, Soy, & Morning Coffee',
      severity: 'Moderate',
      status: '⚠ Potential Interaction',
      explanation: 'Calcium, iron, high-fiber foods, and morning espresso bind to thyroid hormone in the digestive tract, significantly reducing the amount absorbed by your body.',
      recommendation: 'Take Levothyroxine on an empty stomach with a full glass of water, and wait at least 30 to 60 minutes before having breakfast, coffee, or calcium supplements.',
    });
  }

  // Medication-Food: Metformin + Heavy Alcohol
  if (hasMetformin) {
    medFoodInteractions.push({
      id: 'mf-metformin-alcohol',
      medicationName: 'Metformin',
      foodName: 'Excessive Alcohol Intake',
      severity: 'Moderate',
      status: '⚠ Potential Interaction',
      explanation: 'Consuming high amounts of alcohol while taking Metformin increases the risk of sudden low blood sugar (hypoglycemia) and elevates lactic acid buildup.',
      recommendation: 'Discuss this combination with a qualified healthcare professional. Avoid excessive or binge drinking, and never consume alcohol on an empty stomach.',
    });
  }

  // Medication-Food: Warfarin + High Vitamin K Foods
  if (hasBloodThinner) {
    medFoodInteractions.push({
      id: 'mf-warfarin-vitk',
      medicationName: 'Warfarin / Blood Thinner',
      foodName: 'High Vitamin K Greens (Spinach, Kale, Collards)',
      severity: 'Moderate',
      status: '⚠ Potential Interaction',
      explanation: 'Vitamin K is directly involved in blood clotting. Sudden large increases or decreases in green leafy vegetables can alter the blood-thinning effectiveness of Warfarin.',
      recommendation: 'Discuss this combination with your doctor or anticoagulation clinic. Maintain a consistent, steady daily intake of green vegetables rather than sudden changes.',
    });
  }

  // =========================================================================
  // 2. DYNAMIC MEDICATION GUIDANCE (3 CATEGORIES)
  // =========================================================================
  const allAnalyzedMedications: AnalyzedMedication[] = medications.map((med) => {
    const lower = normalize(med.name);
    let purpose = 'Prescribed by your physician to support your ongoing health management.';
    let statusCategory: AnalyzedMedication['statusCategory'] = 'continue';
    let statusLabel = 'Continue as prescribed';
    let explanation = 'No critical conflicts identified for this medication in your current profile.';
    let actionNote = 'Follow your prescribed schedule and dosage unless your doctor advises otherwise.';
    let timingTip = med.timing || 'Take at consistent daily times as directed by your physician.';
    const potentialInteractions: string[] = [];

    // Metformin logic
    if (lower.includes('metformin')) {
      purpose = 'Blood glucose regulation and improving insulin sensitivity.';
      timingTip = 'Take with or immediately after meals (e.g. breakfast & dinner).';
      if (hasKidneyDisease) {
        statusCategory = 'review';
        statusLabel = 'Requires Professional Review';
        explanation = 'Kidney function (eGFR) requires clinical monitoring to confirm appropriate dosing for renal clearance.';
        actionNote = 'Discuss your latest kidney lab values with your doctor or pharmacist.';
        potentialInteractions.push('Kidney Disease / Renal Clearance', 'Excess Alcohol');
      } else {
        statusCategory = 'continue';
        statusLabel = 'Continue as prescribed';
        explanation = 'Standard first-line metabolic support. Taking with food helps reduce mild stomach sensitivity.';
        actionNote = 'Maintain your scheduled dose with meals.';
      }
    }
    // Amlodipine logic
    else if (lower.includes('amlodipine') || lower.includes('norvasc')) {
      purpose = 'Relaxes and widens peripheral blood vessels to manage blood pressure.';
      timingTip = 'Once daily, morning or evening with water.';
      statusCategory = 'continue';
      statusLabel = 'Continue as prescribed';
      explanation = 'Consistent daily timing supports stable 24-hour blood pressure control.';
      actionNote = 'Follow your prescribed schedule. Avoid whole grapefruit or grapefruit juice.';
      potentialInteractions.push('Grapefruit / Grapefruit Juice');
    }
    // Losartan / ARB logic
    else if (lower.includes('losartan') || lower.includes('cozaar') || lower.includes('valsartan')) {
      purpose = 'Angiotensin receptor blocker that eases vascular tension and supports cardiovascular & renal protection.';
      timingTip = 'Once daily at the same time each day.';
      if (hasLisinopril || medNorms.filter((m) => m.name.includes('pril')).length > 0) {
        statusCategory = 'review';
        statusLabel = 'Requires Professional Review';
        explanation = 'Potential interaction identified: Concurrent use with an ACE inhibitor (dual RAAS) requires clinical evaluation.';
        actionNote = 'Discuss this combination with your doctor or pharmacist.';
        potentialInteractions.push('ACE Inhibitor (Dual RAAS blockade)', 'Potassium Salt Substitutes');
      } else {
        statusCategory = 'continue';
        statusLabel = 'Continue as prescribed';
        explanation = 'Supports blood pressure and cardiovascular protection.';
        actionNote = 'Avoid potassium salt substitutes without doctor guidance.';
        potentialInteractions.push('Potassium Salt Substitutes');
      }
    }
    // Lisinopril / ACE Inhibitor logic
    else if (lower.includes('lisinopril') || lower.includes('ramipril') || lower.includes('enalapril')) {
      purpose = 'ACE inhibitor that lowers vascular resistance and protects cardiac and renal function.';
      timingTip = 'Once daily in the morning.';
      if (hasLosartan) {
        statusCategory = 'review';
        statusLabel = 'Requires Professional Review';
        explanation = 'Potential combination with an ARB identified. Dual RAAS blockade requires physician review.';
        actionNote = 'Consult your prescribing clinician.';
        potentialInteractions.push('Losartan / ARB', 'Potassium Salt Substitutes');
      } else {
        statusCategory = 'continue';
        statusLabel = 'Continue as prescribed';
        explanation = 'Effective blood pressure management agent.';
        actionNote = 'Rise slowly when standing up from sitting. Avoid potassium-enriched salt substitutes.';
        potentialInteractions.push('Potassium Salt Substitutes');
      }
    }
    // Statin logic
    else if (lower.includes('atorvastatin') || lower.includes('simvastatin') || lower.includes('rosuvastatin') || lower.includes('statin')) {
      purpose = 'Lowers LDL ("bad") cholesterol and supports cardiovascular plaque stability.';
      timingTip = 'Usually taken once daily in the evening or at bedtime.';
      statusCategory = 'continue';
      statusLabel = 'Continue as prescribed';
      explanation = 'Lipid-lowering therapy works best when paired with cardiovascular-friendly nutrition.';
      actionNote = 'Do not consume grapefruit or grapefruit juice. Report unexplained muscle soreness.';
      potentialInteractions.push('Grapefruit Juice');
    }
    // Levothyroxine logic
    else if (lower.includes('levothyroxine') || lower.includes('synthroid')) {
      purpose = 'Provides synthetic thyroid hormone to maintain steady metabolic activity.';
      timingTip = 'First thing in the morning with plain water, 30–60 minutes before breakfast.';
      statusCategory = 'continue';
      statusLabel = 'Continue as prescribed';
      explanation = 'Strict empty-stomach timing ensures maximum gastrointestinal absorption.';
      actionNote = 'Separate calcium or iron supplements by at least 4 hours.';
      potentialInteractions.push('Calcium / Iron Supplements', 'Soy Products', 'Morning Coffee');
    }
    // NSAID logic
    else if (lower.includes('ibuprofen') || lower.includes('naproxen') || lower.includes('advil') || lower.includes('meloxicam')) {
      purpose = 'Non-steroidal anti-inflammatory for pain and inflammation relief.';
      timingTip = 'Take with food or a glass of milk.';
      if (hasKidneyDisease || hasHypertension || hasBloodThinner) {
        statusCategory = 'review';
        statusLabel = 'Requires Professional Review';
        explanation = 'NSAIDs may elevate blood pressure, strain kidney filtration, or increase bleeding risk with blood thinners.';
        actionNote = 'Discuss safer alternative pain management options with your physician.';
        potentialInteractions.push('Hypertension / Blood Pressure', 'Kidney Disease', 'Blood Thinners');
      } else {
        statusCategory = 'caution';
        statusLabel = 'Use With Caution';
        explanation = 'Short-term use only. Take with meals to protect your stomach lining.';
        actionNote = 'Use the lowest effective dose for the shortest duration.';
      }
    }
    // Aspirin logic
    else if (lower.includes('aspirin')) {
      purpose = 'Antiplatelet therapy for cardiovascular protection.';
      timingTip = 'Take once daily with a meal.';
      if (hasBloodThinner) {
        statusCategory = 'review';
        statusLabel = 'Requires Professional Review';
        explanation = 'Combining aspirin with an anticoagulant increases bleeding risk.';
        actionNote = 'Review with your doctor.';
        potentialInteractions.push('Anticoagulant Blood Thinners');
      } else {
        statusCategory = 'continue';
        statusLabel = 'Continue as prescribed';
        explanation = 'Supports arterial blood flow and clot prevention.';
        actionNote = 'Always take with food to protect stomach lining.';
      }
    }
    // Albuterol / Respiratory logic
    else if (lower.includes('albuterol') || lower.includes('inhaler') || lower.includes('budesonide')) {
      purpose = 'Rapid bronchodilation to relieve airway bronchospasms and ease breathing.';
      timingTip = 'Inhale as directed prior to exercise or during symptom onset.';
      statusCategory = 'continue';
      statusLabel = 'Continue as prescribed';
      explanation = 'Keep quick-relief inhaler readily accessible.';
      actionNote = 'Rinse mouth with water after steroid inhaler use if applicable.';
    }
    // Omeprazole / PPI logic
    else if (lower.includes('omeprazole') || lower.includes('pantoprazole') || lower.includes('esomeprazole')) {
      purpose = 'Proton pump inhibitor that reduces gastric acid production.';
      timingTip = '30 minutes before your first meal of the day.';
      statusCategory = 'continue';
      statusLabel = 'Continue as prescribed';
      explanation = 'Optimal acid suppression requires dosing prior to eating.';
      actionNote = 'Take with plain water in the morning.';
    }
    // Generic fallback
    else {
      statusCategory = 'continue';
      statusLabel = 'Continue as prescribed';
      explanation = 'Active prescription recorded in your profile.';
      actionNote = 'Follow your prescribed schedule unless your doctor advises otherwise.';
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
    };
  });

  const medicationsToContinue = allAnalyzedMedications.filter((m) => m.statusCategory === 'continue');
  const medicationsToCaution = allAnalyzedMedications.filter((m) => m.statusCategory === 'caution');
  const medicationsRequiringReview = allAnalyzedMedications.filter((m) => m.statusCategory === 'review');

  // Attention Items for Health Status
  const attentionItems: string[] = [];
  if (medicationsRequiringReview.length > 0) {
    attentionItems.push(`${medicationsRequiringReview.length} medication${medicationsRequiringReview.length > 1 ? 's require' : ' requires'} professional review with your healthcare provider.`);
  }
  if (interactions.length > 0) {
    attentionItems.push(`${interactions.length} clinical interaction or condition consideration${interactions.length > 1 ? 's' : ''} detected.`);
  }
  if (medFoodInteractions.length > 0) {
    attentionItems.push(`Medication-food interaction identified (${medFoodInteractions.map(m => m.foodName.split(' ')[0]).join(', ')}).`);
  }
  if (hasDiabetes) {
    attentionItems.push('Monitor blood glucose levels regularly and balance carbohydrate intake with scheduled meals.');
  }
  if (hasHypertension) {
    attentionItems.push('Maintain lower-sodium food choices (aim < 2,000 mg/day) and monitor blood pressure at home.');
  }
  if (hasKidneyDisease) {
    attentionItems.push('Protect renal function with balanced hydration and avoid non-prescribed NSAID pain medications.');
  }
  if (allergies.length > 0) {
    attentionItems.push(`Allergen protection active: Excluded ${allergies.join(', ')} from all nutritional recommendations.`);
  }
  if (attentionItems.length === 0) {
    attentionItems.push('Keep an updated log of your medication times and schedule routine wellness checkups.');
    attentionItems.push('Stay hydrated and maintain consistent daily physical activity.');
  }

  // =========================================================================
  // 3. DYNAMIC NUTRITION & FOOD GUIDANCE (Condition + Allergy + Preference Filtered)
  // =========================================================================
  
  // Helper to check if item is excluded by allergy
  const isAllergen = (itemName: string): boolean => {
    const lowerItem = normalize(itemName);
    return allergies.some((a) => {
      const lowerAllergy = normalize(a);
      if (!lowerAllergy) return false;
      if (lowerAllergy.includes('peanut') && (lowerItem.includes('peanut') || lowerItem.includes('nuts'))) return true;
      if (lowerAllergy.includes('dairy') || lowerAllergy.includes('milk') || lowerAllergy.includes('lactose')) {
        if (lowerItem.includes('dairy') || lowerItem.includes('milk') || lowerItem.includes('cheese') || lowerItem.includes('yogurt') || lowerItem.includes('whey')) return true;
      }
      if (lowerAllergy.includes('shellfish') || lowerAllergy.includes('seafood') || lowerAllergy.includes('shrimp')) {
        if (lowerItem.includes('shellfish') || lowerItem.includes('shrimp') || lowerItem.includes('crab') || lowerItem.includes('lobster') || lowerItem.includes('seafood')) return true;
      }
      if (lowerAllergy.includes('gluten') || lowerAllergy.includes('wheat') || lowerAllergy.includes('celiac')) {
        if (lowerItem.includes('wheat') || lowerItem.includes('bread') || lowerItem.includes('gluten') || lowerItem.includes('barley') || lowerItem.includes('pasta')) return true;
      }
      if (lowerAllergy.includes('egg') && lowerItem.includes('egg')) return true;
      if (lowerAllergy.includes('soy') && (lowerItem.includes('soy') || lowerItem.includes('tofu') || lowerItem.includes('edamame'))) return true;
      return lowerItem.includes(lowerAllergy);
    });
  };

  // Helper to check if item matches dietary preference
  const matchesDietPreference = (itemName: string): boolean => {
    const lowerItem = normalize(itemName);
    const isVeg = dietPref.toLowerCase().includes('vegetarian');
    const isVegan = dietPref.toLowerCase().includes('vegan');

    if (isVeg || isVegan) {
      if (lowerItem.includes('chicken') || lowerItem.includes('turkey') || lowerItem.includes('beef') || lowerItem.includes('pork') || lowerItem.includes('fish') || lowerItem.includes('salmon') || lowerItem.includes('tuna') || lowerItem.includes('meat')) {
        return false;
      }
    }
    if (isVegan) {
      if (lowerItem.includes('egg') || lowerItem.includes('yogurt') || lowerItem.includes('cheese') || lowerItem.includes('milk') || lowerItem.includes('dairy')) {
        return false;
      }
    }
    return true;
  };

  // Recommended Foods Pool (Condition-Aware)
  const rawRecommended: DietRecommendationItem[] = [];

  // Diabetes-specific recommended foods
  if (hasDiabetes) {
    rawRecommended.push(
      {
        id: 'rec-diab-1',
        name: 'Whole Rolled Oats & Steel-Cut Oats',
        category: 'Complex Carbohydrates',
        reason: 'High in beta-glucan soluble fiber, helping smooth post-meal glucose absorption and support insulin sensitivity.',
        relatedCondition: 'Diabetes',
      },
      {
        id: 'rec-diab-2',
        name: 'Non-Starchy Leafy Greens (Spinach, Kale, Swiss Chard)',
        category: 'Vegetables',
        reason: 'Rich in magnesium and polyphenols with minimal impact on blood glucose levels.',
        relatedCondition: 'Diabetes',
      },
      {
        id: 'rec-diab-3',
        name: 'Lentils, Chickpeas & Black Beans',
        category: 'Plant Proteins & Fiber',
        reason: 'Low glycemic index carbohydrates combined with resistant starch to promote steady glucose regulation.',
        relatedCondition: 'Diabetes',
      },
      {
        id: 'rec-diab-4',
        name: 'Fresh Berries (Blueberries, Blackberries, Strawberries)',
        category: 'Low-Glycemic Fruits',
        reason: 'Packed with anthocyanins and fiber, satisfying sweet cravings without spiking blood glucose.',
        relatedCondition: 'Diabetes',
      },
      {
        id: 'rec-diab-5',
        name: 'Chia Seeds & Ground Flaxseeds',
        category: 'Healthy Fats & Fiber',
        reason: 'High omega-3 ALA and mucilage fiber delay carbohydrate digestion and support metabolic balance.',
        relatedCondition: 'Diabetes',
      }
    );
  }

  // Hypertension-specific recommended foods
  if (hasHypertension) {
    rawRecommended.push(
      {
        id: 'rec-htn-1',
        name: 'Steamed Beets & Beetroot Salad',
        category: 'Vascular Health',
        reason: 'Natural dietary nitrates stimulate nitric oxide production, relaxing vascular walls and supporting lower blood pressure.',
        relatedCondition: 'Hypertension',
      },
      {
        id: 'rec-htn-2',
        name: 'Garlic & Herb Infused Seasonings',
        category: 'Flavor & Vascular Support',
        reason: 'Contains allicin which supports vascular elasticity; provides rich meal flavor without adding table salt.',
        relatedCondition: 'Hypertension',
      },
      {
        id: 'rec-htn-3',
        name: 'Steamed Broccoli & Asparagus',
        category: 'Vegetables',
        reason: 'Naturally low in sodium, packed with potassium and calcium to support healthy arterial tone.',
        relatedCondition: 'Hypertension',
      },
      {
        id: 'rec-htn-4',
        name: 'Raw Unsalted Almonds & Walnuts',
        category: 'Nuts & Healthy Fats',
        reason: 'Supplies essential magnesium and healthy monounsaturated fats that nourish the cardiovascular system.',
        relatedCondition: 'Hypertension',
      }
    );
  }

  // Kidney Disease specific recommended foods
  if (hasKidneyDisease) {
    rawRecommended.push(
      {
        id: 'rec-ckd-1',
        name: 'Steamed Cauliflower & Red Bell Peppers',
        category: 'Low-Potassium Produce',
        reason: 'Nutrient-dense vegetables that provide vitamin C and fiber while remaining gentle on renal filtration.',
        relatedCondition: 'Kidney Disease',
      },
      {
        id: 'rec-ckd-2',
        name: 'Extra Virgin Olive Oil',
        category: 'Anti-inflammatory Fats',
        reason: 'High in oleic acid and polyphenols, providing calorie density without adding sodium or phosphorus strain.',
        relatedCondition: 'Kidney Disease',
      },
      {
        id: 'rec-ckd-3',
        name: 'Shredded Cabbage & Cucumbers',
        category: 'Kidney-Friendly Vegetables',
        reason: 'Low in potassium and phosphorus, supporting hydration and bowel regularity.',
        relatedCondition: 'Kidney Disease',
      }
    );
  }

  // High Cholesterol recommended foods
  if (hasCholesterol) {
    rawRecommended.push(
      {
        id: 'rec-chol-1',
        name: 'Barley & Whole Grain Farro',
        category: 'Soluble Fiber Grains',
        reason: 'Binds with bile acids in the digestive tract, actively assisting the body in reducing circulating LDL cholesterol.',
        relatedCondition: 'High Cholesterol',
      },
      {
        id: 'rec-chol-2',
        name: 'Avocado & Raw Pumpkin Seeds',
        category: 'Plant Sterols & Fats',
        reason: 'Contains phytosterols and monounsaturated oleic acid that support a favorable HDL to LDL ratio.',
        relatedCondition: 'High Cholesterol',
      }
    );
  }

  // Asthma / Respiratory recommended foods
  if (hasAsthma) {
    rawRecommended.push(
      {
        id: 'rec-asthma-1',
        name: 'Citrus Fruits & Colorful Bell Peppers',
        category: 'Vitamin C & Antioxidants',
        reason: 'High vitamin C helps combat airway oxidative stress and supports immune resilience.',
        relatedCondition: 'Asthma',
      },
      {
        id: 'rec-asthma-2',
        name: 'Ginger & Turmeric Herbal Infusions',
        category: 'Natural Anti-inflammatories',
        reason: 'Natural gingerols and curcumin provide systemic soothing benefits for respiratory tissues.',
        relatedCondition: 'Asthma',
      }
    );
  }

  // General healthy fallback if conditions are empty
  if (rawRecommended.length === 0) {
    rawRecommended.push(
      {
        id: 'rec-gen-1',
        name: 'Mixed Garden Green Salad with Olive Oil',
        category: 'Fresh Produce',
        reason: 'Provides essential micronutrients, vitamins, and antioxidants for overall cellular vitality.',
      },
      {
        id: 'rec-gen-2',
        name: 'Whole Grain Brown Rice & Quinoa',
        category: 'Whole Grains',
        reason: 'Delivers steady, sustained energy and dietary fiber for digestive well-being.',
      },
      {
        id: 'rec-gen-3',
        name: 'Fresh Crisp Apples & Pears',
        category: 'Fruits',
        reason: 'Rich in pectin fiber and natural hydration to support daily metabolic balance.',
      },
      {
        id: 'rec-gen-4',
        name: 'Steamed Zucchini & Green Beans',
        category: 'Vegetables',
        reason: 'Light, nutrient-dense, and easy on digestion.',
      }
    );
  }

  // Protein additions based on diet preference (if not vegetarian/vegan)
  if (!dietPref.toLowerCase().includes('vegetarian') && !dietPref.toLowerCase().includes('vegan')) {
    if (!hasKidneyDisease) {
      rawRecommended.push({
        id: 'rec-protein-nonveg',
        name: 'Skinless Baked Chicken Breast or Wild Salmon',
        category: 'Lean Protein & Omega-3s',
        reason: 'Supplies high-biological-value protein with minimal saturated fat, supporting cardiovascular muscle tissue.',
      });
    } else {
      rawRecommended.push({
        id: 'rec-protein-ckd',
        name: 'Egg Whites & Baked White Fish (Cod/Halibut)',
        category: 'Renal-Friendly Protein',
        reason: 'Provides high quality protein with lower phosphorus burden on kidney filtration.',
        relatedCondition: 'Kidney Disease',
      });
    }
  } else {
    rawRecommended.push({
      id: 'rec-protein-veg',
      name: 'Organic Firm Tofu & Edamame',
      category: 'Plant-Based Protein',
      reason: 'Complete amino acid profile without cholesterol, supporting steady lean muscle maintenance.',
    });
  }

  // Filter Recommended Foods by Allergies and Dietary Preference
  const finalRecommended = rawRecommended
    .filter((item) => !isAllergen(item.name))
    .filter((item) => matchesDietPreference(item.name));

  // =========================================================================
  // Caution Foods Pool (Condition & Medication-Specific)
  // =========================================================================
  const rawCaution: DietRecommendationItem[] = [];

  // Caution: Potassium salt substitutes (if on Lisinopril/Losartan/Kidney Disease)
  if (hasLisinopril || hasLosartan || hasKidneyDisease) {
    rawCaution.push({
      id: 'caut-k-salt',
      name: 'Potassium Salt Substitutes & Lite Salt',
      category: 'Seasonings',
      reason: 'Your blood pressure medications retain potassium in the body. Extra potassium from salt substitutes can lead to excess blood potassium (hyperkalemia).',
      relatedMedication: hasLosartan ? 'Losartan' : 'Lisinopril',
    });
  }

  // Caution: High-glycemic dried fruits & fruit juices (if Diabetes)
  if (hasDiabetes) {
    rawCaution.push({
      id: 'caut-diab-juices',
      name: '100% Fruit Juices & Dried Fruits (Raisins, Dates)',
      category: 'Concentrated Carbohydrates',
      reason: 'Lack of pulp/fiber causes rapid absorption into the bloodstream, leading to sharper blood glucose spikes than whole fruits.',
      relatedCondition: 'Diabetes',
    });
    rawCaution.push({
      id: 'caut-diab-white-rice',
      name: 'Polished White Rice & Standard White Bread',
      category: 'Refined Grains',
      reason: 'High glycemic index quickly converts into blood sugar; moderate portion size and pair with healthy fiber.',
      relatedCondition: 'Diabetes',
    });
  }

  // Caution: High-sodium sauces & canned condiments (if Hypertension)
  if (hasHypertension) {
    rawCaution.push({
      id: 'caut-htn-sauces',
      name: 'Commercial Soy Sauce, BBQ Sauces & Salad Dressings',
      category: 'Condiments',
      reason: 'Contains hidden sodium (often > 800 mg per serving) which causes fluid retention and elevates arterial pressure.',
      relatedCondition: 'Hypertension',
    });
    rawCaution.push({
      id: 'caut-htn-caffeine',
      name: 'High-Caffeine Energy Drinks & Concentrated Espresso',
      category: 'Beverages',
      reason: 'Excess caffeine can temporarily constrict blood vessels and produce transient blood pressure elevations.',
      relatedCondition: 'Hypertension',
    });
  }

  // Caution: High potassium fruits (if Kidney Disease)
  if (hasKidneyDisease) {
    rawCaution.push({
      id: 'caut-ckd-potassium',
      name: 'Bananas, Oranges, & Baked Potatoes',
      category: 'High-Potassium Produce',
      reason: 'Contain high potassium concentrations. When kidney clearance is reduced, dietary potassium requires mindful moderation.',
      relatedCondition: 'Kidney Disease',
    });
  }

  // Caution: Dairy / Full-fat cheeses (if High Cholesterol)
  if (hasCholesterol) {
    rawCaution.push({
      id: 'caut-chol-dairy',
      name: 'Full-Fat Cheeses, Heavy Cream & Butter',
      category: 'Saturated Dairy Fats',
      reason: 'High saturated fatty acid content stimulates hepatic production of LDL cholesterol.',
      relatedCondition: 'High Cholesterol',
    });
  }

  // General fallback for caution
  if (rawCaution.length === 0) {
    rawCaution.push(
      {
        id: 'caut-gen-1',
        name: 'Canned Soups & Packaged Broths',
        category: 'Convenience Foods',
        reason: 'Often contain elevated preservative sodium levels; look for low-sodium or unsalted versions.',
      },
      {
        id: 'caut-gen-2',
        name: 'Sweetened Breakfast Cereals',
        category: 'Processed Grains',
        reason: 'May contain unexpected added sugars that disrupt steady daytime energy.',
      }
    );
  }

  const finalCaution = rawCaution
    .filter((item) => !isAllergen(item.name))
    .filter((item) => matchesDietPreference(item.name));

  // =========================================================================
  // Avoid or Discuss Foods Pool (Conflicts, Allergens, Serious Interactions)
  // =========================================================================
  const rawAvoid: DietRecommendationItem[] = [];

  // Avoid: Known patient allergens
  allergies.forEach((allergy, idx) => {
    rawAvoid.push({
      id: `avoid-allergy-${idx}`,
      name: `${allergy} & ${allergy}-Containing Ingredients`,
      category: 'Confirmed Patient Allergen',
      reason: `Recorded in your health profile as an active allergy. Strictly avoid to prevent allergic reactions.`,
    });
  });

  // Avoid: Grapefruit (if on Statin / Amlodipine)
  if (hasStatin || hasAmlodipine) {
    rawAvoid.push({
      id: 'avoid-grapefruit',
      name: 'Whole Grapefruit & Fresh Grapefruit Juice',
      category: 'Citrus / Drug Interaction',
      reason: 'Inhibits intestinal CYP3A4 enzymes, causing higher drug concentrations of statin or calcium channel blocker in the blood.',
      relatedMedication: hasStatin ? 'Atorvastatin / Statin' : 'Amlodipine',
    });
  }

  // Avoid: Sugar-sweetened sodas & bakery sweets (if Diabetes)
  if (hasDiabetes) {
    rawAvoid.push({
      id: 'avoid-diab-soda',
      name: 'Sugary Carbonated Sodas & Energy Drinks',
      category: 'Liquid Sugars',
      reason: 'Delivers rapid doses of free fructose and sucrose directly into the bloodstream, triggering severe glucose spikes.',
      relatedCondition: 'Diabetes',
    });
  }

  // Avoid: Cured deli meats & ultra-processed meats (if Hypertension / High Cholesterol)
  if (hasHypertension || hasCholesterol) {
    rawAvoid.push({
      id: 'avoid-htn-deli-meats',
      name: 'Cured Deli Meats, Bacon, Hot Dogs & Sausages',
      category: 'Processed Meats',
      reason: 'Extremely high in sodium, nitrates, and saturated fat, promoting arterial stiffness and cardiovascular inflammation.',
      relatedCondition: hasHypertension ? 'Hypertension' : 'High Cholesterol',
    });
  }

  // Avoid: Dark Colas with inorganic phosphate (if Kidney Disease)
  if (hasKidneyDisease) {
    rawAvoid.push({
      id: 'avoid-ckd-phosphates',
      name: 'Dark Colas & Foods with Phosphate Additives',
      category: 'Inorganic Phosphates',
      reason: 'Inorganic phosphate additives are 100% absorbed by the digestive tract, straining compromised kidneys and weakening bones.',
      relatedCondition: 'Kidney Disease',
    });
  }

  // Avoid: High alcohol intake (if on Metformin / Blood Pressure meds)
  if (hasMetformin || hasHypertension) {
    rawAvoid.push({
      id: 'avoid-heavy-alcohol',
      name: 'Excessive / Binge Alcohol Consumption',
      category: 'Beverages',
      reason: 'Interferes with liver glucose metabolism, elevates lactic acid risk with Metformin, and impairs blood pressure regulation.',
    });
  }

  // Fallback avoid
  if (rawAvoid.length === 0) {
    rawAvoid.push(
      {
        id: 'avoid-gen-transfats',
        name: 'Deep Fried Foods & Partially Hydrogenated Trans-Fats',
        category: 'Processed Fats',
        reason: 'Increases systemic inflammation and promotes vascular endothelial dysfunction.',
      },
      {
        id: 'avoid-gen-refinedsugars',
        name: 'Ultra-Processed Pastries & High-Fructose Confections',
        category: 'Refined Sugars',
        reason: 'Adds empty calories and increases metabolic strain without providing essential vitamins.',
      }
    );
  }

  const finalAvoid = rawAvoid.filter((item) => matchesDietPreference(item.name));

  // =========================================================================
  // 4. DYNAMIC PERSONALIZED DAILY MEAL STRUCTURE
  // =========================================================================
  const isVegetarian = dietPref.toLowerCase().includes('vegetarian');
  const isVegan = dietPref.toLowerCase().includes('vegan');

  // Dynamic Breakfast
  let bTitle = 'Balanced Morning Starter';
  let bItems = ['Steel-cut oatmeal with sliced strawberries & chia seeds', 'Cup of herbal tea or warm water with lemon'];
  let bGuidance = 'Take morning medications with a full glass of water as scheduled with breakfast.';

  if (hasDiabetes && isVegetarian) {
    bTitle = 'Low-Glycemic Vegetarian Breakfast';
    bItems = [
      'Steel-cut oatmeal topped with crushed walnuts and cinnamon (no added sugar)',
      '1 cup of unsweetened almond or soy milk',
      'Small handful of fresh blueberries (low GI fruit)',
    ];
    bGuidance = 'Take Metformin with food to protect your stomach and stabilize post-breakfast glucose.';
  } else if (hasHypertension && isVegetarian) {
    bTitle = 'DASH Heart-Healthy Breakfast';
    bItems = [
      'Whole grain sourdough toast with mashed avocado, black pepper & hemp seeds',
      'Sliced cucumber and cherry tomatoes seasoned with oregano (no salt)',
      'Warm green tea or hibiscus infusion',
    ];
    bGuidance = 'Take blood pressure medicine at the same time each morning; rise slowly from bed.';
  } else if (hasKidneyDisease) {
    bTitle = 'Renal-Conscious Light Breakfast';
    bItems = [
      'Warm cream of rice or low-potassium oatmeal with a dash of honey',
      'Small cup of fresh blackberries',
      'Egg white omelet with diced red bell peppers (if non-vegan)',
    ];
    bGuidance = 'Sip water in moderation according to your physician\'s daily fluid guidance.';
  } else if (!isVegetarian && !isVegan) {
    bTitle = 'Cardio-Protective Protein Breakfast';
    bItems = [
      'Two poached eggs or egg whites with sautéed spinach and olive oil',
      '1 slice of 100% sprouted whole grain toast',
      'Small bowl of mixed berries',
    ];
    bGuidance = 'Pair with a glass of water and your scheduled morning prescription.';
  }

  // Filter breakfast items for allergens
  bItems = bItems.filter((it) => !isAllergen(it));

  // Dynamic Lunch
  let lTitle = 'Nutrient-Dense Midday Meal';
  let lItems = isVegetarian
    ? ['Warm lentil and vegetable stew with steamed quinoa', 'Baby spinach salad dressed with extra virgin olive oil & lemon juice', 'Roasted zucchini slices with garlic & rosemary']
    : ['Grilled skinless chicken breast or baked salmon fillet', 'Brown rice and steamed asparagus portion', 'Mixed green salad with avocado vinaigrette'];
  let lGuidance = 'Season meals with natural herbs, garlic, and cracked pepper instead of table salt.';

  if (hasDiabetes && hasHypertension) {
    lTitle = 'Low-Sodium Metabolic Lunch';
    lItems = isVegetarian
      ? [
          'Organic tofu and chickpea bowl with steamed cauliflower rice and broccoli',
          'Fresh green salad with diced cucumbers, avocado, and flaxseed oil dressing',
          'Sprinkle of nutritional yeast and turmeric for savory flavor without salt',
        ]
      : [
          'Baked cod or herb-marinated chicken breast over brown rice and steamed greens',
          'Cucumber and radish salad dressed with lemon and cold-pressed olive oil',
          'Steamed green beans with toasted sesame seeds',
        ];
    lGuidance = 'Keeps sodium under 400 mg per meal while providing 8+ grams of slow-digesting fiber.';
  } else if (hasKidneyDisease) {
    lTitle = 'Renal-Balanced Midday Plate';
    lItems = [
      'Steamed white rice bowl with sautéed shredded cabbage, carrots, and firm tofu',
      'Fresh cucumber slices dressed with apple cider vinegar and olive oil',
      'Steamed cauliflower florets seasoned with black pepper and thyme',
    ];
    lGuidance = 'Low in phosphorus and controlled in potassium to ease renal filtration.';
  }

  lItems = lItems.filter((it) => !isAllergen(it));

  // Dynamic Evening Snack
  let sTitle = 'Afternoon Re-energizer';
  let sItems = ['Small handful of raw almonds or walnuts', 'Sliced crisp apple with cinnamon', 'Chamomile herbal infusion without sugar'];
  let sGuidance = 'Provides healthy fats and fiber to prevent energy dips between lunch and dinner.';

  if (allergies.some((a) => normalize(a).includes('nut') || normalize(a).includes('peanut'))) {
    sItems = ['Roasted pumpkin seeds or sunflower seeds', 'Cucumber sticks with olive oil and hummus', 'Sliced fresh pear'];
  }
  if (hasDiabetes) {
    sTitle = 'Glucose-Stabilizing Evening Snack';
    sItems = ['Celery sticks with sunflower seed butter', 'Small handful of roasted pumpkin seeds', 'Unsweetened iced peppermint tea'];
    sGuidance = 'Prevents late-afternoon hypoglycemia without triggering glycemic rebound.';
  }

  sItems = sItems.filter((it) => !isAllergen(it));

  // Dynamic Dinner
  let dTitle = 'Light & Restorative Dinner';
  let dItems = isVegetarian
    ? ['Steamed edamame & vegetable stir-fry with quinoa', 'Bowl of clear vegetable broth seasoned with ginger', 'Steamed broccoli and carrots with toasted sesame oil']
    : ['Steamed wild white fish or grilled turkey breast', 'Roasted cauliflower and half baked sweet potato', 'Tossed mixed greens with balsamic vinegar'];
  let dGuidance = 'Aim to finish dinner at least 2 to 3 hours before sleep to support restful digestion and healthy nighttime glucose.';

  if (hasDiabetes && hasHypertension && isVegetarian) {
    dTitle = 'Restorative Cardio-Metabolic Dinner';
    dItems = [
      'Hearty warm lentil, spinach, and tomato soup with turmeric and crushed cumin',
      'Half-cup of cooked whole quinoa with steamed zucchini and roasted red pepper',
      'Small side salad with mixed greens and lemon-olive oil dressing',
    ];
    dGuidance = 'Low-sodium, high-fiber dinner promotes steady overnight glucose levels and peaceful rest.';
  }

  dItems = dItems.filter((it) => !isAllergen(it));

  // Hydration guidance
  let hydrationTip = 'Aim for 6 to 8 glasses of pure water throughout the day. Keep a water bottle nearby.';
  if (hasKidneyDisease) {
    hydrationTip = 'Follow your physician\'s exact daily fluid allowance. Sip water steadily throughout the day rather than drinking large amounts at once.';
  } else if (hasHypertension) {
    hydrationTip = 'Drink 7–9 glasses of pure water. Proper hydration helps kidneys excrete excess sodium naturally.';
  }

  const snackTip = 'Choose raw pumpkin seeds, carrot sticks with unsalted hummus, or fresh berries to satisfy afternoon cravings.';

  const mealStructure: DailyMealStructure = {
    breakfast: {
      title: bTitle,
      items: bItems,
      guidance: bGuidance,
    },
    lunch: {
      title: lTitle,
      items: lItems,
      guidance: lGuidance,
    },
    eveningSnack: {
      title: sTitle,
      items: sItems,
      guidance: sGuidance,
    },
    dinner: {
      title: dTitle,
      items: dItems,
      guidance: dGuidance,
    },
    hydrationTip,
    snackTip,
  };

  // Health summary text
  const conditionListText = diseases.length > 0 ? diseases.join(' and ') : 'general wellness';
  const medCountText = `${medications.length} active medication${medications.length === 1 ? '' : 's'}`;
  const dietPrefText = dietPref ? `${dietPref} dietary pattern` : 'balanced nutrition';
  
  const suggestedMedications = getMedicationSuggestionsForConditions(diseases, allergies);

  let healthSummary = `Personalized analysis generated for ${conditionListText} with ${medCountText}, customized for your ${dietPrefText}${allergies.length > 0 ? ` and excluding allergens (${allergies.join(', ')})` : ''}.`;
  
  if (medications.length === 0 && diseases.length > 0) {
    healthSummary = `Personalized analysis generated for ${conditionListText}. No active prescriptions currently recorded — clinical decision-support suggestions for standard of care have been prepared for review with your healthcare provider.`;
  }

  return {
    patientName,
    bmi,
    healthSummary,
    statusCards: {
      conditionsCount: diseases.length,
      medicationsCount: medications.length,
      cautionItemsCount: attentionItems.length,
      attentionItems,
    },
    medicationsToContinue,
    medicationsToCaution,
    medicationsRequiringReview,
    allAnalyzedMedications,
    suggestedMedications,
    interactions,
    medicationFoodInteractions: medFoodInteractions,
    foodGuidance: {
      recommended: finalRecommended,
      caution: finalCaution,
      avoid: finalAvoid,
    },
    mealStructure,
    appliedDietaryFilters: {
      dietPreference: dietPref,
      excludedAllergens: allergies,
      targetConditions: diseases,
    },
  };
}
