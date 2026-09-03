export type NavigationTab = 'dashboard' | 'health-board' | 'nutrition' | 'report' | 'profile' | 'admin';

export interface User {
  email: string;
  name: string;
  role: 'patient' | 'admin';
}

export interface HealthProfile {
  age: number;
  gender: 'Male' | 'Female' | 'Other' | 'Prefer not to say';
  height: number; // in cm
  weight: number; // in kg
  diseases: string[];
  allergies: string[];
  dietaryPreference: string;
  notes?: string;
  updatedAt: string;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  timing?: string;
  category?: string;
  prescribedFor?: string;
  notes?: string;
}

export type MedicationStatusCategory = 
  | 'continue' // MEDICATIONS TO CONTINUE
  | 'caution'  // MEDICATIONS TO USE WITH CAUTION
  | 'review';  // MEDICATIONS REQUIRING PROFESSIONAL REVIEW

export interface AnalyzedMedication {
  medication: Medication;
  purpose: string;
  statusCategory: MedicationStatusCategory;
  statusLabel: string;
  explanation: string;
  actionNote: string;
  timingTip: string;
  potentialInteractions: string[];
  matchedConditions?: string[];
  diseaseIndicationNote?: string;
  indicationMatch?: 'direct-match' | 'adjunct' | 'unmatched';
  guidelineEvidence?: string;
}

export type InteractionType = 'drug-drug' | 'drug-disease' | 'drug-food' | 'duplicate-therapy' | 'disease-disease';
export type RiskSeverity = 'High' | 'Moderate' | 'Low' | 'Info';

export interface DetectedInteraction {
  id: string;
  type: InteractionType;
  severity: RiskSeverity;
  headline: string;
  itemsInvolved: string[];
  simpleExplanation: string;
  clinicalMechanism?: string;
  recommendation: string;
}

export interface MedicationFoodInteraction {
  id: string;
  medicationName: string;
  foodName: string;
  severity: RiskSeverity;
  status: string;
  explanation: string;
  recommendation: string;
}

export interface DietRecommendationItem {
  id: string;
  name: string;
  category: string;
  reason: string;
  relatedCondition?: string;
  relatedMedication?: string;
  tags?: string[];
}

export interface DietSections {
  recommended: DietRecommendationItem[];
  caution: DietRecommendationItem[];
  avoid: DietRecommendationItem[];
}

export interface MealItem {
  title: string;
  items: string[];
  guidance: string;
}

export interface DailyMealStructure {
  breakfast: MealItem;
  lunch: MealItem;
  eveningSnack: MealItem;
  dinner: MealItem;
  hydrationTip: string;
  snackTip: string;
}

export interface RAGSourceDoc {
  id: string;
  title: string;
  category: string;
  relevance: string;
  excerpt: string;
}

export interface SuggestedMedication {
  id: string;
  name: string;
  genericName?: string;
  condition: string;
  category: string;
  typicalDosage: string;
  frequency: string;
  timing: string;
  purpose: string;
  clinicalRationale: string;
  cautionNotes: string;
  evidenceGrade?: 'First-line Guideline' | 'Maintenance' | 'Rescue / Symptom Relief' | 'Adjunct';
}

export interface PatientHealthAnalysis {
  patientName: string;
  bmi: {
    value: number;
    category: string;
  };
  healthSummary: string;
  statusCards: {
    conditionsCount: number;
    medicationsCount: number;
    cautionItemsCount: number;
    attentionItems: string[];
  };
  // 3 categories of medication guidance
  medicationsToContinue: AnalyzedMedication[];
  medicationsToCaution: AnalyzedMedication[];
  medicationsRequiringReview: AnalyzedMedication[];
  allAnalyzedMedications: AnalyzedMedication[];
  
  // Suggested Medications when active list is empty or for diagnosed conditions
  suggestedMedications?: SuggestedMedication[];
  uncoveredConditions?: string[];
  
  // Conflict and Interaction Analysis
  interactions: DetectedInteraction[];
  medicationFoodInteractions: MedicationFoodInteraction[];
  
  // Dynamic Nutrition
  foodGuidance: DietSections;
  mealStructure: DailyMealStructure;
  appliedDietaryFilters: {
    dietPreference: string;
    excludedAllergens: string[];
    targetConditions: string[];
  };

  // RAG & Generation metadata
  ragSources?: RAGSourceDoc[];
  generatedAt?: string;
  isAiEnhanced?: boolean;
}

export interface AgentProgressStep {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  description: string;
  latency?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: string;
  sources?: string[];
  isDisclaimer?: boolean;
}

export interface HealthReportData {
  reportId: string;
  generatedAt: string;
  patientName: string;
  patientEmail: string;
  age: number;
  gender: string;
  height: number;
  weight: number;
  bmi: { value: number; category: string };
  conditions: string[];
  allergies: string[];
  dietaryPattern: string;
  medications: Medication[];
  medicationGuidance: {
    continueList: AnalyzedMedication[];
    cautionList: AnalyzedMedication[];
    reviewList: AnalyzedMedication[];
  };
  interactions: DetectedInteraction[];
  medicationFoodInteractions: MedicationFoodInteraction[];
  foodGuidance: DietSections;
  mealPlan: DailyMealStructure;
  aiSummary: string;
  disclaimer: string;
}
