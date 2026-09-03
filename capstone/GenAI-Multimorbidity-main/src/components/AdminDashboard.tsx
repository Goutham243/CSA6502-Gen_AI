import React, { useState } from 'react';
import { User, HealthProfile, Medication } from '../types';
import { 
  ShieldCheck, 
  Users, 
  Activity, 
  BookOpen, 
  CheckCircle2, 
  Eye, 
  Cpu, 
  Database,
  ArrowRight,
  Server,
  RefreshCw
} from 'lucide-react';

interface AdminDashboardProps {
  user: User;
  profile?: HealthProfile;
  medications?: Medication[];
  onSwitchToPatientView?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  user,
  profile = { age: 0, gender: 'Male', height: 0, weight: 0, diseases: [], allergies: [], dietaryPreference: 'Standard' },
  medications = [],
  onSwitchToPatientView,
}) => {
  const [isSimulating, setIsSimulating] = useState(false);

  const agents = [
    {
      name: 'Patient Profile Agent',
      role: 'Parses biometrics, diagnoses, and allergies from incoming patient form',
      status: 'Active / Operational',
      latency: '24ms',
    },
    {
      name: 'Medication Verification Agent',
      role: 'Cross-checks drug names, dosages, and administration frequencies',
      status: 'Active / Operational',
      latency: '38ms',
    },
    {
      name: 'Conflict Detection Agent',
      role: 'Queries drug-drug and drug-nutrient interaction matrices',
      status: 'Active / Operational',
      latency: '52ms',
    },
    {
      name: 'Diet & Nutrition Agent',
      role: 'Computes safe meal items and flags contraindicated ingredients',
      status: 'Active / Operational',
      latency: '41ms',
    },
    {
      name: 'Recommendation Synthesizer',
      role: 'Generates non-technical, patient-friendly guidance and alerts',
      status: 'Active / Operational',
      latency: '65ms',
    },
  ];

  const knowledgeMonographs = [
    { drug: 'Metformin HCl', category: 'Antidiabetic', interactions: 'Alcohol, High-Sugar Spikes, Extended Fasting', status: 'Verified' },
    { drug: 'Lisinopril', category: 'ACE Inhibitor', interactions: 'Potassium Salt Substitutes, NSAIDs, Lithium', status: 'Verified' },
    { drug: 'Atorvastatin', category: 'Statin', interactions: 'Grapefruit Juice (CYP3A4), Macrolides', status: 'Verified' },
    { drug: 'Levothyroxine', category: 'Thyroid Hormone', interactions: 'Calcium/Iron Supplements, Soy, Espresso', status: 'Verified' },
    { drug: 'Amlodipine', category: 'Calcium Channel Blocker', interactions: 'Grapefruit, High Sodium', status: 'Verified' },
  ];

  return (
    <div id="admin-dashboard-view" className="space-y-8 max-w-5xl mx-auto pb-16">
      
      {/* Admin Welcome & Header */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2 text-blue-600 text-xs font-bold uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Administrator Control Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            System Overview & Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Logged in as <span className="font-semibold text-slate-700">{user.email}</span> (Admin Privileges)
          </p>
        </div>

        <button
          id="admin-switch-patient-view-btn"
          type="button"
          onClick={onSwitchToPatientView}
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors cursor-pointer shadow-xs self-start md:self-auto"
        >
          <Eye className="w-4 h-4" />
          <span>Switch to Patient View</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Backend AI Agent Preparation & System Status */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <Cpu className="w-4 h-4 text-blue-600" />
            <h2 className="font-bold text-sm text-slate-900 uppercase tracking-wider">
              Backend AI Agent Orchestration Pipeline
            </h2>
          </div>
          <span className="text-[11px] px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200/60">
            ● 5/5 Agents Online
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {agents.map((agent, i) => (
            <div key={i} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between font-bold text-slate-900">
                  <span>{agent.name}</span>
                  <span className="text-[10px] text-slate-400 font-mono">{agent.latency}</span>
                </div>
                <p className="text-slate-500 text-[11px] mt-1 leading-snug">{agent.role}</p>
              </div>
              <div className="pt-2 border-t border-slate-200/60 flex items-center space-x-1.5 text-emerald-600 font-semibold text-[10px]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{agent.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active Patient Record Preview */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-blue-600" />
            <h2 className="font-bold text-sm text-slate-900 uppercase tracking-wider">
              Current Patient Profile Registry
            </h2>
          </div>
          <span className="text-xs text-slate-400">Local Stored Session</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Patient Name</span>
            <span className="font-bold text-slate-800 text-sm mt-0.5 block">{user.name || 'Goutham'}</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Conditions</span>
            <span className="font-bold text-slate-800 text-sm mt-0.5 block">
              {profile.diseases.length > 0 ? profile.diseases.join(', ') : 'None'}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Medications</span>
            <span className="font-bold text-slate-800 text-sm mt-0.5 block">{medications.length} Prescriptions</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Diet Preference</span>
            <span className="font-bold text-slate-800 text-sm mt-0.5 block">{profile.dietaryPreference || 'Standard'}</span>
          </div>
        </div>
      </div>

      {/* RAG Clinical Knowledge Monographs */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-4 h-4 text-blue-600" />
            <h2 className="font-bold text-sm text-slate-900 uppercase tracking-wider">
              Clinical Interaction Knowledge Base (RAG Ready)
            </h2>
          </div>
          <span className="text-xs text-slate-400">Indexed Monographs</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="pb-2 font-bold">Medication</th>
                <th className="pb-2 font-bold">Category</th>
                <th className="pb-2 font-bold">Known Food / Drug Interactivity</th>
                <th className="pb-2 font-bold text-right">Knowledge Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {knowledgeMonographs.map((m, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50">
                  <td className="py-2.5 font-bold text-slate-800">{m.drug}</td>
                  <td className="py-2.5 text-slate-600">{m.category}</td>
                  <td className="py-2.5 text-slate-600">{m.interactions}</td>
                  <td className="py-2.5 text-right font-semibold text-emerald-600">{m.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
