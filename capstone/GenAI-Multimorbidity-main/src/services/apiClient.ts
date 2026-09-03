import { HealthProfile, Medication, PatientHealthAnalysis, ChatMessage, HealthReportData } from '../types';

export function getUserStorageKey(email: string): string {
  const sanitized = (email || 'anonymous').trim().toLowerCase().replace(/[^a-z0-9]/g, '_');
  return `medisync_user_${sanitized}`;
}

export interface UserPersistedState {
  email: string;
  name: string;
  profile: HealthProfile;
  medications: Medication[];
  analysis: PatientHealthAnalysis | null;
  chatHistory: ChatMessage[];
  reports: HealthReportData[];
}

export function getLocalUserData(email: string, defaultName?: string): UserPersistedState {
  const key = getUserStorageKey(email);
  const raw = localStorage.getItem(key);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch (e) {
      console.warn('Failed to parse local user data:', e);
    }
  }

  // Blank initial state for new patient
  return {
    email: email.trim().toLowerCase(),
    name: defaultName || (email.trim().toLowerCase() === 'gouthamnatukula777@gmail.com' ? 'Goutham Natukula' : 'Patient'),
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
        id: 'msg-init',
        sender: 'assistant',
        text: `Hello ${defaultName ? defaultName.split(' ')[0] : 'there'}! I am MediSync AI. How can I assist you with your medications or personalized diet plan today?`,
        timestamp: new Date().toISOString(),
      },
    ],
    reports: [],
  };
}

export function saveLocalUserData(data: UserPersistedState): void {
  if (!data.email) return;
  const key = getUserStorageKey(data.email);
  localStorage.setItem(key, JSON.stringify(data));
}

// Server API Wrappers
export async function apiGetPatientData(email: string): Promise<UserPersistedState | null> {
  try {
    const res = await fetch(`/api/patient/data?email=${encodeURIComponent(email)}`);
    if (res.ok) {
      const data = await res.json();
      return {
        email: data.email,
        name: data.name,
        profile: data.profile,
        medications: data.medications || [],
        analysis: data.analysis || null,
        chatHistory: data.chatHistory || [],
        reports: data.reports || [],
      };
    }
  } catch (err) {
    console.warn('Server get patient data failed, using local cache:', err);
  }
  return null;
}

export async function apiSavePatientData(
  email: string,
  name: string,
  profile: HealthProfile,
  medications: Medication[]
): Promise<void> {
  // Update local partition immediately
  const local = getLocalUserData(email, name);
  local.name = name;
  local.profile = profile;
  local.medications = medications;
  saveLocalUserData(local);

  try {
    await fetch('/api/patient/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name, profile, medications }),
    });
  } catch (err) {
    console.warn('Server save failed, saved locally:', err);
  }
}

export async function apiAnalyzePatientHealth(
  email: string,
  name: string,
  profile: HealthProfile,
  medications: Medication[]
): Promise<{ analysis: PatientHealthAnalysis; agentSteps?: any[]; ragSources?: any[] }> {
  try {
    const res = await fetch('/api/patient/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name, profile, medications }),
    });

    if (res.ok) {
      const result = await res.json();
      // Cache to local partition
      const local = getLocalUserData(email, name);
      local.analysis = result.analysis;
      local.profile = profile;
      local.medications = medications;
      saveLocalUserData(local);

      return {
        analysis: result.analysis,
        agentSteps: result.agentSteps,
        ragSources: result.ragSources,
      };
    }
  } catch (err) {
    console.warn('Backend analyze call failed, executing client-side rule fallback:', err);
  }

  // Fallback to client-side rule calculation if server is temporarily unreachable
  const { generatePatientGuidance } = await import('../data/mockData');
  const fallbackAnalysis = generatePatientGuidance(profile, medications, name);
  
  const local = getLocalUserData(email, name);
  local.analysis = fallbackAnalysis;
  local.profile = profile;
  local.medications = medications;
  saveLocalUserData(local);

  return { analysis: fallbackAnalysis };
}

export async function apiSendChatMessage(
  email: string,
  name: string,
  message: string,
  profile: HealthProfile,
  medications: Medication[]
): Promise<{ reply: string; sources?: string[] }> {
  try {
    const res = await fetch('/api/patient/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name, message, profile, medications }),
    });

    if (res.ok) {
      const result = await res.json();
      return { reply: result.reply, sources: result.sources };
    }
  } catch (err) {
    console.warn('Backend chat call failed, using intelligent client fallback:', err);
  }

  // Client-side fallback reply for offline or connection issues
  const lower = message.toLowerCase();
  const diseaseList = profile.diseases.join(', ') || 'General Health';
  const medList = medications.map(m => m.name).join(', ') || 'None recorded';

  let reply = '';
  if (lower.includes('fever') || lower.includes('temperature') || lower.includes('sick') || lower.includes('chills')) {
    reply = `Regarding your fever: Please stay hydrated with water and clear fluids. Note: Because of your profile (${diseaseList}), avoid over-the-counter NSAIDs (like Ibuprofen/Naproxen) if you have kidney disease or hypertension. Ask your doctor or pharmacist if Acetaminophen is appropriate. Seek urgent medical attention if your fever exceeds 102°F (38.9°C) or lasts over 48 hours.`;
  } else if (lower.includes('snack') || lower.includes('food') || lower.includes('diet') || lower.includes('eat') || lower.includes('fruit')) {
    reply = `For your conditions (${diseaseList}): Prioritize low-glycemic, high-protein snacks such as raw almonds, Greek yogurt with berries, or celery with nut butter. If managing kidney health or hypertension, keep sodium low (<140mg) and avoid potassium-based salt substitutes.`;
  } else if (lower.includes('medication') || lower.includes('pill') || lower.includes('dose') || lower.includes('timing')) {
    reply = `Your active medications are: ${medList}. Take each dose with a full glass of water. If you miss a dose, take it when remembered unless it is close to the next scheduled dose—never take a double dose.`;
  } else {
    reply = `Thank you for your question: "${message.trim()}". For your profile (${diseaseList}) and medications (${medList}), we recommend monitoring your symptoms closely and bringing this up with your physician or pharmacist.`;
  }

  return { reply };
}

export async function apiGenerateReport(
  email: string,
  name: string,
  profile: HealthProfile,
  medications: Medication[]
): Promise<HealthReportData | null> {
  try {
    const res = await fetch('/api/patient/report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name, profile, medications }),
    });

    if (res.ok) {
      const result = await res.json();
      return result.report;
    }
  } catch (err) {
    console.warn('Backend report generation failed:', err);
  }
  return null;
}
