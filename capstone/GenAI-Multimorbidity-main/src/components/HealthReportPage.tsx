import React, { useRef, useState } from 'react';
import { HealthProfile, Medication, User, PatientHealthAnalysis } from '../types';
import { generatePatientGuidance } from '../data/mockData';
import { downloadHTMLReport, downloadJSONReport } from '../utils/reportExport';
import { 
  Printer, 
  Download, 
  FileText, 
  ShieldCheck, 
  Heart, 
  Pill, 
  AlertTriangle, 
  Utensils, 
  CheckCircle2, 
  Clock, 
  Droplet,
  Sparkles,
  ArrowLeft,
  Info,
  Check
} from 'lucide-react';

interface HealthReportPageProps {
  user: User;
  profile: HealthProfile;
  medications: Medication[];
  analysis?: PatientHealthAnalysis | null;
  onBackToBoard: () => void;
}

export const HealthReportPage: React.FC<HealthReportPageProps> = ({
  user,
  profile,
  medications,
  analysis,
  onBackToBoard,
}) => {
  const guidance: PatientHealthAnalysis = analysis || generatePatientGuidance(profile, medications, user.name);
  const reportRef = useRef<HTMLDivElement>(null);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  const reportId = `MEDISYNC-${Math.abs(user.email.split('').reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0)).toString().slice(0, 6)}`;
  const dateStr = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadHTML = () => {
    downloadHTMLReport(user, profile, medications, guidance, reportId, dateStr);
    setDownloadSuccess('Report file downloaded successfully!');
    setTimeout(() => setDownloadSuccess(null), 4000);
  };

  const handleDownloadJSON = () => {
    downloadJSONReport(user, profile, medications, guidance, reportId, dateStr);
    setDownloadSuccess('Clinical JSON data downloaded successfully!');
    setTimeout(() => setDownloadSuccess(null), 4000);
  };

  return (
    <div id="health-report-view" className="space-y-6 max-w-4xl mx-auto pb-20">
      
      {/* Top Action Bar (hidden when printing) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:hidden">
        <button
          type="button"
          onClick={onBackToBoard}
          className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer self-start"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Health Board</span>
        </button>

        <div className="flex flex-wrap items-center gap-2">
          {/* Download Full Standalone HTML Report */}
          <button
            id="download-html-report-btn"
            type="button"
            onClick={handleDownloadHTML}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-bold text-xs transition-all cursor-pointer shadow-xs"
            title="Download full offline HTML clinical report"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Report (.html)</span>
          </button>

          {/* Download JSON Data Export */}
          <button
            id="download-json-report-btn"
            type="button"
            onClick={handleDownloadJSON}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-98 text-slate-700 font-bold text-xs transition-all cursor-pointer"
            title="Export raw structured health JSON record"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Export Data (.json)</span>
          </button>

          {/* Print / Save as PDF */}
          <button
            id="print-health-report-btn"
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/80 font-bold text-xs transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / PDF</span>
          </button>
        </div>
      </div>

      {/* Success Notification Toast */}
      {downloadSuccess && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center space-x-2 animate-in fade-in print:hidden">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{downloadSuccess}</span>
        </div>
      )}

      {/* Printable Report Document Sheet */}
      <div 
        ref={reportRef}
        className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/90 shadow-sm space-y-8 print:border-none print:shadow-none print:p-0"
      >
        {/* Document Header */}
        <div className="border-b-2 border-slate-900 pb-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-blue-700 font-extrabold text-lg tracking-tight">
              <ShieldCheck className="w-6 h-6 text-blue-600" />
              <span>MediSync AI Health Platform</span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Multi-Agent Medication Conflict & Nutritional Decision-Support System
            </p>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-3">
              Comprehensive Clinical Verification Report
            </h1>
          </div>

          <div className="text-left sm:text-right text-xs space-y-1 bg-slate-50 p-3.5 rounded-xl border border-slate-200/60 print:bg-transparent">
            <div><span className="font-semibold text-slate-400 uppercase text-[10px]">Report ID:</span> <span className="font-mono font-bold text-slate-800">{reportId}</span></div>
            <div><span className="font-semibold text-slate-400 uppercase text-[10px]">Generated:</span> <span className="font-medium text-slate-700">{dateStr}</span></div>
            <div><span className="font-semibold text-slate-400 uppercase text-[10px]">Patient Status:</span> <span className="font-bold text-emerald-700">Verified Profile</span></div>
          </div>
        </div>

        {/* Section 1 & 2: Patient Demographics & Vitals */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-blue-700 pb-1 border-b border-slate-100 flex items-center space-x-1.5">
            <Heart className="w-3.5 h-3.5" />
            <span>1. Patient Demographics & Vitals</span>
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-400 uppercase text-[10px] block font-semibold">Full Name</span>
              <span className="font-bold text-slate-900 text-sm mt-0.5 block">{user.name || 'Patient'}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-400 uppercase text-[10px] block font-semibold">Age & Gender</span>
              <span className="font-bold text-slate-900 text-sm mt-0.5 block">{profile.age > 0 ? `${profile.age} yrs` : 'N/A'} • {profile.gender}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-400 uppercase text-[10px] block font-semibold">Height & Weight</span>
              <span className="font-bold text-slate-900 text-sm mt-0.5 block">{profile.height > 0 ? `${profile.height} cm` : '--'} • {profile.weight > 0 ? `${profile.weight} kg` : '--'}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-400 uppercase text-[10px] block font-semibold">Calculated BMI</span>
              <span className="font-bold text-slate-900 text-sm mt-0.5 block">{guidance.bmi.value > 0 ? `${guidance.bmi.value} (${guidance.bmi.category})` : 'N/A'}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-400 uppercase text-[10px] block font-semibold">Dietary Pattern</span>
              <span className="font-bold text-slate-900 text-sm mt-0.5 block truncate">{profile.dietaryPreference || 'Standard'}</span>
            </div>
          </div>
        </div>

        {/* Section 3 & 4: Diagnosed Conditions & Allergies */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <span className="font-bold uppercase tracking-wider text-slate-500 text-[10px] block">
              2. Diagnosed Conditions ({profile.diseases.length})
            </span>
            <p className="font-bold text-slate-900 text-sm">
              {profile.diseases.length > 0 ? profile.diseases.join(', ') : 'None registered'}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <span className="font-bold uppercase tracking-wider text-amber-700 text-[10px] block">
              3. Confirmed Medical Allergens ({profile.allergies.length})
            </span>
            <p className="font-bold text-amber-900 text-sm">
              {profile.allergies.length > 0 ? profile.allergies.join(', ') : 'No known allergies reported'}
            </p>
          </div>
        </div>

        {/* Section 5: Active Prescriptions Table */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-blue-700 pb-1 border-b border-slate-100 flex items-center space-x-1.5">
            <Pill className="w-3.5 h-3.5" />
            <span>4. Active Prescription & Medication Roster ({medications.length})</span>
          </h2>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
              <thead className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="p-3">Medication Name</th>
                  <th className="p-3">Dosage</th>
                  <th className="p-3">Frequency</th>
                  <th className="p-3">Timing / Administration</th>
                  <th className="p-3">Indication</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {medications.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-4 text-center text-slate-400">
                      No prescriptions active in this profile.
                    </td>
                  </tr>
                ) : (
                  medications.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-slate-900">{m.name}</td>
                      <td className="p-3 font-medium text-slate-700">{m.dosage}</td>
                      <td className="p-3 text-slate-600">{m.frequency}</td>
                      <td className="p-3 text-slate-600">{m.timing || 'Standard timing'}</td>
                      <td className="p-3 text-slate-500">{m.prescribedFor || 'General health'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 6: Categorized Medication Guidance (3 Categories) */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-blue-700 pb-1 border-b border-slate-100">
            5. Medication Classification & Clinical Guidance
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            {/* Continue */}
            <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/30 space-y-2">
              <div className="font-bold text-emerald-900 text-xs uppercase flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>To Continue ({guidance.medicationsToContinue.length})</span>
              </div>
              <ul className="space-y-1 text-[11px] text-slate-700">
                {guidance.medicationsToContinue.map((m) => (
                  <li key={m.medication.id} className="font-medium">• {m.medication.name} ({m.medication.dosage})</li>
                ))}
                {guidance.medicationsToContinue.length === 0 && <li className="text-slate-400">None</li>}
              </ul>
            </div>

            {/* Caution */}
            <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/30 space-y-2">
              <div className="font-bold text-amber-900 text-xs uppercase flex items-center space-x-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Use With Caution ({guidance.medicationsToCaution.length})</span>
              </div>
              <ul className="space-y-1 text-[11px] text-slate-700">
                {guidance.medicationsToCaution.map((m) => (
                  <li key={m.medication.id} className="font-medium">• {m.medication.name}: {m.actionNote}</li>
                ))}
                {guidance.medicationsToCaution.length === 0 && <li className="text-slate-400">None</li>}
              </ul>
            </div>

            {/* Review */}
            <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/30 space-y-2">
              <div className="font-bold text-rose-900 text-xs uppercase flex items-center space-x-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>Requires Review ({guidance.medicationsRequiringReview.length})</span>
              </div>
              <ul className="space-y-1 text-[11px] text-slate-700">
                {guidance.medicationsRequiringReview.map((m) => (
                  <li key={m.medication.id} className="font-medium">• {m.medication.name}: {m.actionNote}</li>
                ))}
                {guidance.medicationsRequiringReview.length === 0 && <li className="text-slate-400">None detected</li>}
              </ul>
            </div>
          </div>
        </div>

        {/* Section 7: Conflict and Food Interactions */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-blue-700 pb-1 border-b border-slate-100">
            6. Drug Interactions & Food Contraindications
          </h2>

          {guidance.interactions.length === 0 && guidance.medicationFoodInteractions.length === 0 ? (
            <p className="text-xs text-slate-600 p-3 bg-slate-50 rounded-xl border border-slate-100">
              No significant drug-drug conflicts or severe food contraindications detected.
            </p>
          ) : (
            <div className="space-y-2 text-xs">
              {guidance.interactions.map((inter) => (
                <div key={inter.id} className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/40 space-y-1">
                  <span className="font-bold text-amber-900 block">{inter.headline} ({inter.severity} Priority)</span>
                  <p className="text-slate-700">{inter.simpleExplanation}</p>
                  <p className="text-amber-800 font-semibold mt-0.5">Recommendation: {inter.recommendation}</p>
                </div>
              ))}

              {guidance.medicationFoodInteractions.map((f) => (
                <div key={f.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
                  <span className="font-bold text-slate-900 block">{f.medicationName} + {f.foodName} ({f.status})</span>
                  <p className="text-slate-600">{f.explanation} {f.recommendation}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 8: Daily Meal Plan (4 Slots) */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-blue-700 pb-1 border-b border-slate-100 flex items-center space-x-1.5">
            <Utensils className="w-3.5 h-3.5" />
            <span>7. Personalized 4-Slot Daily Meal Schedule</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="font-bold text-blue-900 block text-[11px] uppercase mb-1">Breakfast</span>
              <span className="font-semibold text-slate-800 block mb-1">{guidance.mealStructure.breakfast.title}</span>
              <p className="text-[11px] text-slate-500">{guidance.mealStructure.breakfast.guidance}</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="font-bold text-amber-900 block text-[11px] uppercase mb-1">Lunch</span>
              <span className="font-semibold text-slate-800 block mb-1">{guidance.mealStructure.lunch.title}</span>
              <p className="text-[11px] text-slate-500">{guidance.mealStructure.lunch.guidance}</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="font-bold text-emerald-900 block text-[11px] uppercase mb-1">Evening Snack</span>
              <span className="font-semibold text-slate-800 block mb-1">{guidance.mealStructure.eveningSnack.title}</span>
              <p className="text-[11px] text-slate-500">{guidance.mealStructure.eveningSnack.guidance}</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="font-bold text-indigo-900 block text-[11px] uppercase mb-1">Dinner</span>
              <span className="font-semibold text-slate-800 block mb-1">{guidance.mealStructure.dinner.title}</span>
              <p className="text-[11px] text-slate-500">{guidance.mealStructure.dinner.guidance}</p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-blue-50/50 border border-blue-100 text-xs text-blue-900">
            <span className="font-bold">Hydration Guidance:</span> {guidance.mealStructure.hydrationTip}
          </div>
        </div>

        {/* Section 9: AI Synthesis & Mandatory Medical Disclaimer */}
        <div className="pt-4 border-t border-slate-200 space-y-3">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
            <span className="font-bold uppercase tracking-wider text-slate-500 text-[10px] block">
              AI Clinical Decision Support Note
            </span>
            <p className="text-slate-700 leading-relaxed italic">
              "{guidance.healthSummary}"
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 text-[11px] text-amber-900 space-y-1 leading-relaxed">
            <span className="font-bold uppercase tracking-wider block">Important Clinical Notice & Legal Disclaimer:</span>
            <p>
              This report is generated by MediSync AI for personal decision-support and educational verification purposes only. It does not constitute formal medical diagnosis, treatment prescriptions, or pharmacy dispensation orders. Always present this report to your board-certified physician or licensed pharmacist for medical guidance and prior to modifying any dosage.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
};
