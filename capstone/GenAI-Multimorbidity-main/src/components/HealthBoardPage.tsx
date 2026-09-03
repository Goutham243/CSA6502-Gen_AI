import React, { useState } from 'react';
import { HealthProfile, Medication, User, AnalyzedMedication, PatientHealthAnalysis, SuggestedMedication } from '../types';
import { generatePatientGuidance, getMedicationSuggestionsForConditions } from '../data/mockData';
import { downloadHTMLReport } from '../utils/reportExport';
import { 
  Heart, 
  Pill, 
  AlertTriangle, 
  CheckCircle2, 
  AlertCircle, 
  Utensils, 
  ArrowRight,
  ShieldCheck,
  Info,
  Clock,
  Sparkles,
  FileText,
  MessageSquare,
  ChevronRight,
  ShieldAlert,
  HelpCircle,
  Download,
  Plus,
  BookmarkPlus,
  Stethoscope,
  Printer
} from 'lucide-react';

interface HealthBoardPageProps {
  user: User;
  profile: HealthProfile;
  medications: Medication[];
  analysis?: PatientHealthAnalysis | null;
  onNavigateToNutrition: () => void;
  onNavigateToReport: () => void;
  onEditProfile: () => void;
  onOpenChat?: () => void;
  onSaveMedications?: (meds: Medication[]) => void;
}

export const HealthBoardPage: React.FC<HealthBoardPageProps> = ({
  user,
  profile,
  medications,
  analysis,
  onNavigateToNutrition,
  onNavigateToReport,
  onEditProfile,
  onOpenChat,
  onSaveMedications,
}) => {
  const guidance: PatientHealthAnalysis = analysis || generatePatientGuidance(profile, medications, user.name);
  const patientFirstName = user.name ? user.name.split(' ')[0] : 'Patient';

  const [medFilter, setMedFilter] = useState<'all' | 'continue' | 'caution' | 'review'>('all');
  const [addedMedsNotice, setAddedMedsNotice] = useState<string | null>(null);

  // Suggested medications fallback or supplement
  const suggestedMedications: SuggestedMedication[] = 
    guidance.suggestedMedications && guidance.suggestedMedications.length > 0
      ? guidance.suggestedMedications
      : getMedicationSuggestionsForConditions(profile.diseases, profile.allergies);

  const handleAddSuggestedMed = (sug: SuggestedMedication) => {
    if (!onSaveMedications) {
      onEditProfile();
      return;
    }
    if (medications.some((m) => m.name.toLowerCase().trim() === sug.name.toLowerCase().trim())) return;

    const newMed: Medication = {
      id: `med-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: sug.name,
      dosage: sug.typicalDosage,
      frequency: sug.frequency,
      timing: sug.timing,
      prescribedFor: sug.condition,
    };
    const updated = [...medications, newMed];
    onSaveMedications(updated);
    setAddedMedsNotice(`Added ${sug.name} to your active prescriptions roster!`);
    setTimeout(() => setAddedMedsNotice(null), 3500);
  };

  const handleAddAllSuggestions = () => {
    if (!onSaveMedications) {
      onEditProfile();
      return;
    }
    const unadded = suggestedMedications.filter(
      (sug) => !medications.some((m) => m.name.toLowerCase().trim() === sug.name.toLowerCase().trim())
    );
    if (unadded.length === 0) return;

    const newMeds: Medication[] = unadded.map((sug, idx) => ({
      id: `med-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 4)}`,
      name: sug.name,
      dosage: sug.typicalDosage,
      frequency: sug.frequency,
      timing: sug.timing,
      prescribedFor: sug.condition,
    }));

    const updated = [...medications, ...newMeds];
    onSaveMedications(updated);
    setAddedMedsNotice(`Added ${newMeds.length} guideline medications to your active prescriptions roster!`);
    setTimeout(() => setAddedMedsNotice(null), 3500);
  };

  const filteredMeds = guidance.allAnalyzedMedications.filter((med) => {
    if (medFilter === 'all') return true;
    return med.statusCategory === medFilter;
  });

  return (
    <div id="patient-health-board" className="space-y-8 max-w-5xl mx-auto pb-20">
      
      {/* Header: [Patient Name]'s Health Overview */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-blue-600 text-xs font-bold uppercase tracking-wider mb-1">
              <Heart className="w-4 h-4" />
              <span>Verified Health Board</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              {patientFirstName}'s Health Board
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Multi-Agent AI verified against clinical interaction matrices, food contraindications, and dietary guidelines.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            <button
              id="header-download-direct-btn"
              type="button"
              onClick={() => {
                const reportId = `MEDISYNC-${Math.abs(user.email.split('').reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0)).toString().slice(0, 6)}`;
                const dateStr = new Date().toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                });
                downloadHTMLReport(user, profile, medications, guidance, reportId, dateStr);
              }}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-xs transition-colors cursor-pointer"
              title="Download Full Clinical Health Report (.html)"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Report</span>
            </button>

            <button
              id="header-download-report-btn"
              type="button"
              onClick={onNavigateToReport}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200/60 transition-colors cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>View & Print</span>
            </button>

            <button
              id="edit-health-details-btn"
              type="button"
              onClick={onEditProfile}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <span>Edit Details</span>
            </button>
          </div>
        </div>

        {/* Basic Health Info Row */}
        <div className="mt-5 pt-5 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
            <span className="text-slate-400 font-semibold block uppercase tracking-wider text-[10px]">Patient & Age</span>
            <span className="text-sm font-bold text-slate-900 mt-0.5 block">
              {profile.age > 0 ? `${profile.age} yrs • ${profile.gender}` : `${profile.gender}`}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
            <span className="text-slate-400 font-semibold block uppercase tracking-wider text-[10px]">Conditions</span>
            <span className="text-sm font-bold text-blue-700 mt-0.5 block truncate" title={profile.diseases.join(', ') || 'None Recorded'}>
              {profile.diseases.length > 0 ? profile.diseases.join(', ') : 'None Recorded'}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
            <span className="text-slate-400 font-semibold block uppercase tracking-wider text-[10px]">Allergies</span>
            <span className="text-sm font-bold text-amber-700 mt-0.5 block truncate" title={profile.allergies.join(', ') || 'None'}>
              {profile.allergies.length > 0 ? profile.allergies.join(', ') : 'None Known'}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
            <span className="text-slate-400 font-semibold block uppercase tracking-wider text-[10px]">Dietary Pattern</span>
            <span className="text-sm font-bold text-slate-900 mt-0.5 block truncate">
              {profile.dietaryPreference || 'Standard'}
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================
          1. HEALTH STATUS & SUMMARY
      ======================================================== */}
      <section className="space-y-4">
        <div className="flex items-center space-x-2">
          <div className="w-2.5 h-2.5 rounded-full bg-blue-600"></div>
          <h2 className="text-lg font-bold text-slate-900">1. Health Status & Clinical Summary</h2>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-5">
          <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100 flex items-start space-x-3">
            <Sparkles className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-xs text-blue-900 uppercase tracking-wider">AI Clinical Synthesis</h3>
              <p className="text-xs sm:text-sm text-slate-700 mt-1 leading-relaxed">
                {guidance.healthSummary}
              </p>
            </div>
          </div>

          {/* Simple Status Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            {/* Card A: Health Conditions */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
              <div className="flex items-center space-x-2 text-slate-700 mb-1.5">
                <Heart className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold text-xs uppercase tracking-wider">Diagnosed Conditions</h3>
              </div>
              <div className="text-2xl font-bold text-slate-900">
                {guidance.statusCards.conditionsCount}
              </div>
              <p className="text-slate-500 mt-1 truncate">
                {profile.diseases.length > 0 ? profile.diseases.join(', ') : 'No active conditions'}
              </p>
            </div>

            {/* Card B: Current Medications */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
              <div className="flex items-center space-x-2 text-slate-700 mb-1.5">
                <Pill className="w-4 h-4 text-emerald-600" />
                <h3 className="font-bold text-xs uppercase tracking-wider">Active Medications</h3>
              </div>
              <div className="text-2xl font-bold text-slate-900">
                {guidance.statusCards.medicationsCount}
              </div>
              <p className="text-slate-500 mt-1">
                {guidance.medicationsToContinue.length} to continue • {guidance.medicationsToCaution.length} caution
              </p>
            </div>

            {/* Card C: Attention Items */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
              <div className="flex items-center space-x-2 text-slate-700 mb-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <h3 className="font-bold text-xs uppercase tracking-wider">Attention Flags</h3>
              </div>
              <div className="text-2xl font-bold text-slate-900">
                {guidance.statusCards.cautionItemsCount}
              </div>
              <p className="text-slate-500 mt-1">
                {guidance.interactions.length} interaction(s) evaluated
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          2. MEDICATION GUIDANCE (3 CATEGORIES)
      ======================================================== */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-600"></div>
            <h2 className="text-lg font-bold text-slate-900">2. Medication Guidance & Action Categories</h2>
          </div>

          {/* Filter Pills */}
          <div className="inline-flex rounded-xl bg-slate-100 p-1 text-xs">
            <button
              type="button"
              onClick={() => setMedFilter('all')}
              className={`px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                medFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({guidance.allAnalyzedMedications.length})
            </button>
            <button
              type="button"
              onClick={() => setMedFilter('continue')}
              className={`px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                medFilter === 'continue' ? 'bg-emerald-600 text-white shadow-xs' : 'text-emerald-700 hover:text-emerald-900'
              }`}
            >
              Continue ({guidance.medicationsToContinue.length})
            </button>
            <button
              type="button"
              onClick={() => setMedFilter('caution')}
              className={`px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                medFilter === 'caution' ? 'bg-amber-600 text-white shadow-xs' : 'text-amber-700 hover:text-amber-900'
              }`}
            >
              Caution ({guidance.medicationsToCaution.length})
            </button>
            <button
              type="button"
              onClick={() => setMedFilter('review')}
              className={`px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                medFilter === 'review' ? 'bg-rose-600 text-white shadow-xs' : 'text-rose-700 hover:text-rose-900'
              }`}
            >
              Review ({guidance.medicationsRequiringReview.length})
            </button>
          </div>
        </div>

        {/* Notification Toast when a suggested medication is added */}
        {addedMedsNotice && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center justify-between animate-in fade-in">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{addedMedsNotice}</span>
            </div>
            <button
              type="button"
              onClick={onEditProfile}
              className="text-emerald-700 underline font-bold hover:text-emerald-900 cursor-pointer"
            >
              View in Dashboard
            </button>
          </div>
        )}

        {/* Uncovered Diagnosed Conditions Alert */}
        {guidance.uncoveredConditions && guidance.uncoveredConditions.length > 0 && (
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 text-xs space-y-2">
            <div className="flex items-center space-x-2 text-amber-900 font-bold">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                Unmanaged Diagnosed Condition{guidance.uncoveredConditions.length > 1 ? 's' : ''}:{' '}
                <span className="text-amber-950 font-extrabold">{guidance.uncoveredConditions.join(', ')}</span>
              </span>
            </div>
            <p className="text-amber-800 leading-relaxed">
              You have <span className="font-semibold">{guidance.uncoveredConditions.join(', ')}</span> recorded in your health profile, but no active prescription was entered in your intake. Our clinical engine has formulated standard guideline-directed medication recommendations below to discuss with your healthcare provider.
            </p>
          </div>
        )}

        {/* Medication Cards List */}
        <div className="space-y-4">
          {guidance.allAnalyzedMedications.length === 0 ? (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-blue-50 via-indigo-50/70 to-emerald-50/50 rounded-2xl p-6 border border-blue-200/80 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shrink-0 shadow-xs">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-base font-bold text-slate-900">
                          AI Clinical Medication Suggestions for Diagnosed Conditions
                        </h3>
                        <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold">
                          {suggestedMedications.length} Recommendations
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed max-w-2xl">
                        {profile.diseases.length > 0 ? (
                          <>
                            No active prescriptions were recorded in your intake. Based on your diagnosed conditions (
                            <span className="font-bold text-blue-900">{profile.diseases.join(', ')}</span>
                            ), MediSync AI has prepared clinical decision-support therapies below to discuss with your doctor.
                          </>
                        ) : (
                          'No active prescriptions or diagnosed conditions registered. You can add conditions or medications in your dashboard.'
                        )}
                      </p>
                    </div>
                  </div>

                  {suggestedMedications.length > 0 && onSaveMedications && (
                    <button
                      type="button"
                      onClick={handleAddAllSuggestions}
                      className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs shrink-0 cursor-pointer self-start sm:self-auto"
                    >
                      <BookmarkPlus className="w-4 h-4" />
                      <span>Add All Suggestions ({suggestedMedications.length})</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Suggestions Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {suggestedMedications.map((sug) => {
                  const isFirstLine = sug.evidenceGrade === 'First-line Guideline';
                  const isRescue = sug.evidenceGrade === 'Rescue / Symptom Relief';
                  const badgeClass = isFirstLine
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : isRescue
                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                    : 'bg-blue-50 text-blue-800 border-blue-200';

                  const isAlreadyAdded = medications.some(
                    (m) => m.name.toLowerCase().trim() === sug.name.toLowerCase().trim()
                  );

                  return (
                    <div
                      key={sug.id}
                      className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-blue-300 hover:shadow-sm transition-all space-y-3 flex flex-col justify-between"
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold">
                              Condition: {sug.condition}
                            </span>
                            {sug.evidenceGrade && (
                              <span className={`px-2 py-0.5 rounded-md border text-[10px] font-bold ${badgeClass}`}>
                                {sug.evidenceGrade}
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            Suggested
                          </span>
                        </div>

                        <div>
                          <div className="flex items-baseline space-x-2">
                            <h4 className="text-base font-bold text-slate-900">{sug.name}</h4>
                            <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-xs font-bold">
                              {sug.typicalDosage}
                            </span>
                          </div>
                          {sug.genericName && sug.genericName !== sug.name && (
                            <p className="text-xs text-slate-500 font-medium">{sug.genericName}</p>
                          )}
                          <p className="text-xs text-indigo-700 font-semibold">{sug.category}</p>
                        </div>

                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700 space-y-1">
                          <p className="font-bold text-slate-800 flex items-center space-x-1.5">
                            <Stethoscope className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                            <span>{sug.purpose}</span>
                          </p>
                          <p className="text-slate-600 leading-relaxed text-[11px]">{sug.clinicalRationale}</p>
                        </div>

                        <div className="space-y-1 text-xs text-slate-500">
                          <div className="flex items-center space-x-1 text-slate-700">
                            <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{sug.frequency} • {sug.timing}</span>
                          </div>
                          {sug.cautionNotes && (
                            <p className="text-[11px] text-amber-800/90 leading-tight">
                              ⚠️ <span className="font-semibold">Clinical Note:</span> {sug.cautionNotes}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[11px] text-slate-400">Clinical Decision Support</span>
                        {isAlreadyAdded ? (
                          <span className="inline-flex items-center space-x-1 text-emerald-700 font-bold text-xs bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>In Prescriptions</span>
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleAddSuggestedMed(sug)}
                            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>+ Add to Prescriptions</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : filteredMeds.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 border border-slate-200/80 text-center text-xs text-slate-500">
              No medications in this category.
            </div>
          ) : (
            filteredMeds.map((analyzed) => {
              const med = analyzed.medication;
              const isContinue = analyzed.statusCategory === 'continue';
              const isCaution = analyzed.statusCategory === 'caution';
              const isReview = analyzed.statusCategory === 'review';

              const cardBorder = isReview ? 'border-rose-200' : isCaution ? 'border-amber-200' : 'border-emerald-200';
              const badgeBg = isReview ? 'bg-rose-50 text-rose-700 border-rose-200' : isCaution ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200';
              const iconColor = isReview ? 'text-rose-600' : isCaution ? 'text-amber-600' : 'text-emerald-600';

              return (
                <div
                  key={med.id}
                  className={`bg-white rounded-2xl p-6 border ${cardBorder} shadow-xs space-y-4 transition-all hover:shadow-sm`}
                >
                  {/* Top Bar: Name + Status Badge */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                    <div className="flex items-center space-x-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold ${
                        isReview ? 'bg-rose-100 text-rose-700' : isCaution ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        <Pill className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="text-base font-bold text-slate-900">{med.name}</h3>
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                            {med.dosage}
                          </span>
                          {analyzed.matchedConditions && analyzed.matchedConditions.length > 0 && (
                            <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 text-[10px] font-bold border border-blue-200">
                              Indicated: {analyzed.matchedConditions.join(', ')}
                            </span>
                          )}
                          {analyzed.guidelineEvidence && (
                            <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                              {analyzed.guidelineEvidence}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {med.frequency} • {med.timing || 'Regular timing'}
                        </p>
                      </div>
                    </div>

                    <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold border ${badgeBg} self-start sm:self-auto`}>
                      {isReview ? <ShieldAlert className="w-3.5 h-3.5" /> : isCaution ? <AlertTriangle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                      <span>{analyzed.statusLabel}</span>
                    </span>
                  </div>

                  {/* Disease Indication & Clinical Rationale Callout */}
                  {analyzed.diseaseIndicationNote && (
                    <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200/80 text-xs">
                      <div className="flex items-center space-x-1.5 font-bold text-blue-950 mb-1">
                        <Stethoscope className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span>Clinical Indication Analysis</span>
                      </div>
                      <p className="text-slate-700 leading-relaxed text-[11px] sm:text-xs">
                        {analyzed.diseaseIndicationNote}
                      </p>
                    </div>
                  )}

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-slate-400 font-semibold uppercase text-[10px] block mb-1">Clinical Purpose</span>
                      <p className="text-slate-800 font-medium leading-relaxed">{analyzed.purpose}</p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-slate-400 font-semibold uppercase text-[10px] block mb-1">Verification Note</span>
                      <p className="text-slate-800 leading-relaxed">{analyzed.explanation}</p>
                    </div>

                    <div className="p-3 rounded-xl bg-blue-50/50 border border-blue-100">
                      <span className="text-blue-600 font-semibold uppercase text-[10px] block mb-1">Timing & Action</span>
                      <p className="text-slate-800 font-medium leading-relaxed">{analyzed.timingTip || analyzed.actionNote}</p>
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {/* If there are additional condition suggestions when medications are active */}
          {guidance.allAnalyzedMedications.length > 0 && suggestedMedications.filter((sug) => !medications.some((m) => m.name.toLowerCase().trim() === sug.name.toLowerCase().trim())).length > 0 && (
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Additional Standard Therapies for Diagnosed Conditions ({
                    suggestedMedications.filter((sug) => !medications.some((m) => m.name.toLowerCase().trim() === sug.name.toLowerCase().trim())).length
                  } Available)
                </h4>
              </div>
              <p className="text-xs text-slate-600">
                These guideline medications are standard options for your diagnosed conditions that are not currently in your active prescription roster:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {suggestedMedications
                  .filter((sug) => !medications.some((m) => m.name.toLowerCase().trim() === sug.name.toLowerCase().trim()))
                  .map((sug) => (
                    <div key={sug.id} className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-slate-900">{sug.name} <span className="text-slate-500 font-normal">({sug.typicalDosage})</span></div>
                        <div className="text-[11px] text-blue-700 font-medium">For {sug.condition} • {sug.purpose}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleAddSuggestedMed(sug)}
                        className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white font-bold text-xs transition-colors shrink-0 cursor-pointer ml-2"
                      >
                        + Add
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ========================================================
          3. CONFLICT & INTERACTION ANALYSIS
      ======================================================== */}
      <section className="space-y-4">
        <div className="flex items-center space-x-2">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
          <h2 className="text-lg font-bold text-slate-900">3. Conflict & Interaction Analysis</h2>
        </div>

        {guidance.interactions.length === 0 && guidance.medicationFoodInteractions.length === 0 ? (
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex items-center space-x-3 text-emerald-800 bg-emerald-50/30">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
            <div className="text-xs">
              <h3 className="font-bold text-sm text-slate-900">No Critical Conflicts Detected</h3>
              <p className="text-slate-600 mt-0.5">
                Your current medications and condition combination show no high-risk drug-drug or duplicate therapy conflicts.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Drug-Drug and Duplicate Therapy Conflicts */}
            {guidance.interactions.map((interaction) => (
              <div
                key={interaction.id}
                className="bg-white rounded-2xl p-6 border border-amber-200/90 shadow-xs space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="flex items-center space-x-2.5">
                    <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
                    <h3 className="font-bold text-sm text-slate-900">{interaction.headline}</h3>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 self-start sm:self-auto">
                    {interaction.severity} Priority
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <p className="text-slate-700 leading-relaxed">
                    <span className="font-bold text-slate-900">Items Involved:</span> {interaction.itemsInvolved.join(', ')}
                  </p>
                  <p className="text-slate-700 leading-relaxed">
                    <span className="font-bold text-slate-900">Why this matters:</span> {interaction.simpleExplanation}
                  </p>
                  <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200/60 text-amber-900">
                    <span className="font-bold block text-[11px] uppercase tracking-wider mb-0.5">Recommendation:</span>
                    <p className="leading-relaxed">{interaction.recommendation}</p>
                  </div>
                </div>
              </div>
            ))}

            {/* Food-Medication Interactions */}
            {guidance.medicationFoodInteractions.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="flex items-center space-x-2.5">
                    <Utensils className="w-5 h-5 text-blue-600 shrink-0" />
                    <h3 className="font-bold text-sm text-slate-900">
                      Food Interaction: {item.medicationName} + {item.foodName}
                    </h3>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200 self-start sm:self-auto">
                    {item.status}
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <p className="text-slate-700 leading-relaxed">
                    <span className="font-bold text-slate-900">Mechanism:</span> {item.explanation}
                  </p>
                  <p className="text-slate-700 leading-relaxed">
                    <span className="font-bold text-slate-900">Guidance:</span> {item.recommendation}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ========================================================
          4. PERSONALIZED NUTRITION TEASER
      ======================================================== */}
      <section className="bg-gradient-to-r from-emerald-800 to-teal-900 rounded-3xl p-6 sm:p-8 text-white shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/15 text-emerald-100 text-xs font-semibold">
            <Utensils className="w-3.5 h-3.5" />
            <span>Dynamic Meal Plan Ready</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Personalized Nutrition & Daily Meal Schedule
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
            We have assembled recommended foods, caution ingredients, and a full 4-slot daily meal plan tailored specifically for your {profile.dietaryPreference || 'Standard'} pattern and active health conditions.
          </p>
        </div>

        <button
          id="board-view-nutrition-btn"
          type="button"
          onClick={onNavigateToNutrition}
          className="inline-flex items-center space-x-2 px-6 py-3 rounded-2xl bg-white text-emerald-900 hover:bg-emerald-50 font-bold text-xs transition-colors cursor-pointer shadow-md shrink-0 self-start md:self-auto"
        >
          <span>Open Nutrition & Meal Plan</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </section>

      {/* Professional Medical Disclaimer Box */}
      <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200 text-slate-600 text-xs flex items-start space-x-3">
        <Info className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <span className="font-bold text-slate-700">Important Medical Notice:</span> MediSync AI provides decision-support information grounded in clinical monographs. It does not replace qualified physicians or licensed pharmacists. Always consult your healthcare provider before adjusting or discontinuing any prescribed medications.
        </p>
      </div>

    </div>
  );
};
