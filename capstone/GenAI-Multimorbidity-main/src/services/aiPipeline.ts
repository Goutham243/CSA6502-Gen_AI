/**
 * MediSync AI - AI Backend Pipeline Preparation
 * 
 * Future Backend Architecture Workflow:
 * 
 * Patient Details
 *       ↓
 * Patient Profile Agent
 *       ↓
 * Medication Verification Agent
 *       ↓
 * Conflict Detection Agent
 *       ↓
 * Diet & Nutrition Agent
 *       ↓
 * RAG retrieves relevant medical information
 *       ↓
 * Gemini generates understandable recommendations
 *       ↓
 * Patient Health Board and Nutrition Guidance
 */

import { HealthProfile, Medication, PatientHealthAnalysis } from '../types';
import { generatePatientGuidance } from '../data/mockData';

export interface BackendAgentDescriptor {
  id: string;
  name: string;
  stage: number;
  description: string;
  executionStatus: 'ready' | 'idle' | 'running' | 'complete';
}

export const BACKEND_AGENTS_PIPELINE: BackendAgentDescriptor[] = [
  {
    id: 'agent-profile',
    name: 'Patient Profile Agent',
    stage: 1,
    description: 'Parses biometric measurements, diagnosed conditions, and allergies.',
    executionStatus: 'ready',
  },
  {
    id: 'agent-med-verify',
    name: 'Medication Verification Agent',
    stage: 2,
    description: 'Normalizes and validates active drug names, dosages, and dosing frequencies.',
    executionStatus: 'ready',
  },
  {
    id: 'agent-conflict',
    name: 'Conflict Detection Agent',
    stage: 3,
    description: 'Cross-checks multi-drug interactions and flags timing conflicts.',
    executionStatus: 'ready',
  },
  {
    id: 'agent-diet',
    name: 'Diet & Nutrition Agent',
    stage: 4,
    description: 'Evaluates food-drug interactions and formulates personalized meal categories.',
    executionStatus: 'ready',
  },
  {
    id: 'agent-gemini-synth',
    name: 'Recommendation Synthesizer (Gemini AI + RAG)',
    stage: 5,
    description: 'Synthesizes clear, supportive, and non-technical patient guidance.',
    executionStatus: 'ready',
  },
];

/**
 * Dispatches patient data through the pipeline stages (currently client-side mock logic,
 * ready to be swapped with FastAPI/Gemini endpoints).
 */
export async function executePatientAnalysisPipeline(
  profile: HealthProfile,
  medications: Medication[]
): Promise<PatientHealthAnalysis> {
  // In development, compute synchronously via clinical rule mock engine
  return generatePatientGuidance(profile, medications);
}
