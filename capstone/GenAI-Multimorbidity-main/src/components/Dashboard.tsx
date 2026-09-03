import React, { useState, useEffect } from 'react';
import { HealthProfile, Medication, User, SuggestedMedication } from '../types';
import { getTimeGreeting, calculateBMI, getMedicationSuggestionsForConditions } from '../data/mockData';
import { 
  Heart, 
  Pill, 
  Plus, 
  Trash2, 
  Check, 
  Sparkles, 
  AlertCircle, 
  X, 
  Scale, 
  Activity, 
  ShieldCheck, 
  Utensils, 
  AlertTriangle, 
  Clock,
  CheckCircle2,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  BookmarkPlus
} from 'lucide-react';

interface DashboardProps {
  user: User;
  profile: HealthProfile;
  medications: Medication[];
  onSaveProfile: (profile: HealthProfile) => void;
  onSaveMedications: (meds: Medication[]) => void;
  onRunAnalysis: () => void;
  isAnalyzing?: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({
  user,
  profile,
  medications,
  onSaveProfile,
  onSaveMedications,
  onRunAnalysis,
  isAnalyzing = false,
}) => {
  // Biometric state (empty defaults for new users)
  const [age, setAge] = useState<number | ''>(profile.age > 0 ? profile.age : '');
  const [gender, setGender] = useState<HealthProfile['gender']>(profile.gender || 'Male');
  const [height, setHeight] = useState<number | ''>(profile.height > 0 ? profile.height : '');
  const [weight, setWeight] = useState<number | ''>(profile.weight > 0 ? profile.weight : '');

  // Health Conditions
  const [diseases, setDiseases] = useState<string[]>(profile.diseases || []);
  const [newDiseaseInput, setNewDiseaseInput] = useState('');
  const [showCustomDiseaseInput, setShowCustomDiseaseInput] = useState(false);

  // Allergies
  const [allergies, setAllergies] = useState<string[]>(profile.allergies || []);
  const [newAllergyInput, setNewAllergyInput] = useState('');
  const [showCustomAllergyInput, setShowCustomAllergyInput] = useState(false);

  // Dietary Preference
  const [dietaryPreference, setDietaryPreference] = useState<string>(
    profile.dietaryPreference || 'Standard / Balanced'
  );

  // Medications
  const [medsList, setMedsList] = useState<Medication[]>(medications || []);
  const [newMedName, setNewMedName] = useState('');
  const [newMedDosage, setNewMedDosage] = useState('');
  const [newMedFrequency, setNewMedFrequency] = useState('Once daily');
  const [newMedTiming, setNewMedTiming] = useState('With breakfast');
  const [newMedPurpose, setNewMedPurpose] = useState('');
  const [showAddMedForm, setShowAddMedForm] = useState(false);

  const [savedFeedback, setSavedFeedback] = useState(false);

  // Sync state if profile/medications prop changes externally
  useEffect(() => {
    setAge(profile.age > 0 ? profile.age : '');
    setGender(profile.gender || 'Male');
    setHeight(profile.height > 0 ? profile.height : '');
    setWeight(profile.weight > 0 ? profile.weight : '');
    setDiseases(profile.diseases || []);
    setAllergies(profile.allergies || []);
    setDietaryPreference(profile.dietaryPreference || 'Standard / Balanced');
    setMedsList(medications || []);
  }, [profile, medications]);

  const numHeight = typeof height === 'number' ? height : 0;
  const numWeight = typeof weight === 'number' ? weight : 0;
  const liveBmi = calculateBMI(numHeight, numWeight);

  const popularConditions = [
    'Diabetes',
    'Hypertension',
    'High Cholesterol',
    'Kidney Disease',
    'Asthma',
    'Thyroid Condition',
    'Acid Reflux (GERD)',
    'Arthritis',
    'Heart Failure',
    'Gout',
  ];

  const popularAllergies = [
    'Penicillin',
    'Sulfa Drugs',
    'Aspirin / NSAIDs',
    'Peanuts',
    'Tree Nuts',
    'Dairy / Lactose',
    'Shellfish',
    'Gluten / Wheat',
    'Soy',
    'Eggs',
  ];

  const popularDietPreferences = [
    'Standard / Balanced',
    'Vegetarian',
    'Diabetic-Friendly',
    'Low Sodium (Heart Healthy)',
    'Renal / Kidney-Friendly',
    'Mediterranean Diet',
    'Vegan',
    'Gluten-Free',
  ];

  const frequencyOptions = [
    'Once daily',
    'Twice daily',
    'Three times daily',
    'Every 12 hours',
    'At bedtime',
    'As needed (PRN)',
    'Weekly',
  ];

  const timingOptions = [
    'With breakfast',
    'With breakfast & dinner',
    'Morning on empty stomach (30-60m before food)',
    'Evening / At bedtime',
    'With meals',
    'Between meals',
    'Morning with water',
  ];

  // Helper to persist current form state
  const persistChanges = (
    overrideDiseases?: string[],
    overrideAllergies?: string[],
    overrideDiet?: string,
    overrideMeds?: Medication[]
  ) => {
    const updatedProf: HealthProfile = {
      ...profile,
      age: typeof age === 'number' ? age : 0,
      gender,
      height: typeof height === 'number' ? height : 0,
      weight: typeof weight === 'number' ? weight : 0,
      diseases: overrideDiseases || diseases,
      allergies: overrideAllergies || allergies,
      dietaryPreference: overrideDiet || dietaryPreference,
      updatedAt: new Date().toISOString(),
    };
    onSaveProfile(updatedProf);
    if (overrideMeds) {
      onSaveMedications(overrideMeds);
    } else {
      onSaveMedications(medsList);
    }
  };

  const handleToggleCondition = (condition: string) => {
    let next: string[];
    if (diseases.includes(condition)) {
      next = diseases.filter((d) => d !== condition);
    } else {
      next = [...diseases, condition];
    }
    setDiseases(next);
    persistChanges(next);
  };

  const handleAddCustomCondition = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newDiseaseInput.trim();
    if (trimmed && !diseases.includes(trimmed)) {
      const next = [...diseases, trimmed];
      setDiseases(next);
      setNewDiseaseInput('');
      setShowCustomDiseaseInput(false);
      persistChanges(next);
    }
  };

  const handleToggleAllergy = (allergy: string) => {
    let next: string[];
    if (allergies.includes(allergy)) {
      next = allergies.filter((a) => a !== allergy);
    } else {
      next = [...allergies, allergy];
    }
    setAllergies(next);
    persistChanges(undefined, next);
  };

  const handleAddCustomAllergy = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newAllergyInput.trim();
    if (trimmed && !allergies.includes(trimmed)) {
      const next = [...allergies, trimmed];
      setAllergies(next);
      setNewAllergyInput('');
      setShowCustomAllergyInput(false);
      persistChanges(undefined, next);
    }
  };

  const handleDietChange = (diet: string) => {
    setDietaryPreference(diet);
    persistChanges(undefined, undefined, diet);
  };

  const handleAddMedication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMedName.trim()) return;

    const newMed: Medication = {
      id: `med-${Date.now()}`,
      name: newMedName.trim(),
      dosage: newMedDosage.trim() || 'Standard dose',
      frequency: newMedFrequency,
      timing: newMedTiming,
      prescribedFor: newMedPurpose.trim() || 'Health condition',
    };

    const nextMeds = [...medsList, newMed];
    setMedsList(nextMeds);
    setNewMedName('');
    setNewMedDosage('');
    setNewMedPurpose('');
    setShowAddMedForm(false);
    persistChanges(undefined, undefined, undefined, nextMeds);
  };

  const [showExtraSuggestions, setShowExtraSuggestions] = useState(false);

  // Compute live medication suggestions based on selected diseases & allergies
  const liveSuggestedMeds = getMedicationSuggestionsForConditions(diseases, allergies);

  const handleApplySuggestedMedication = (sug: SuggestedMedication) => {
    // Check if already in medsList
    if (medsList.some((m) => m.name.toLowerCase().trim() === sug.name.toLowerCase().trim())) return;
    
    const newMed: Medication = {
      id: `med-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: sug.name,
      dosage: sug.typicalDosage,
      frequency: sug.frequency,
      timing: sug.timing,
      prescribedFor: sug.condition,
    };

    const nextMeds = [...medsList, newMed];
    setMedsList(nextMeds);
    persistChanges(undefined, undefined, undefined, nextMeds);
  };

  const handleApplyAllSuggestions = () => {
    const unadded = liveSuggestedMeds.filter(
      (sug) => !medsList.some((m) => m.name.toLowerCase().trim() === sug.name.toLowerCase().trim())
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

    const nextMeds = [...medsList, ...newMeds];
    setMedsList(nextMeds);
    persistChanges(undefined, undefined, undefined, nextMeds);
  };

  const handleRemoveMedication = (id: string) => {
    const nextMeds = medsList.filter((m) => m.id !== id);
    setMedsList(nextMeds);
    persistChanges(undefined, undefined, undefined, nextMeds);
  };

  const handleManualSave = () => {
    persistChanges();
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 2500);
  };

  const handleStartAnalysis = () => {
    persistChanges();
    onRunAnalysis();
  };

  const greeting = getTimeGreeting(user.name || 'Patient');

  return (
    <div id="patient-dashboard-container" className="space-y-6 max-w-5xl mx-auto pb-24">
      
      {/* Top Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 rounded-3xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 space-y-2 max-w-2xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/15 text-blue-100 text-xs font-semibold backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5 text-blue-200" />
            <span>AI-Assisted Medication & Diet Decision Support</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            {greeting}
          </h1>
          <p className="text-sm text-blue-100/90 leading-relaxed">
            Fill in your health details and active prescriptions below. Our Multi-Agent AI system will cross-check drug-drug interactions, food conflicts, and craft your tailored daily nutrition plan.
          </p>
        </div>

        {/* Decorative background glow */}
        <div className="absolute right-0 top-0 -mt-10 -mr-10 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Grid: Biometrics + Health Conditions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Section 1: Biometrics & Body Vitals */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <Scale className="w-5 h-5 text-blue-600" />
              <h2 className="font-bold text-sm text-slate-900 uppercase tracking-wider">
                1. Biometrics & Profile
              </h2>
            </div>
            {liveBmi.value > 0 && (
              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                liveBmi.category === 'Normal weight' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                liveBmi.category === 'Underweight' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                'bg-blue-50 text-blue-700 border border-blue-200'
              }`}>
                BMI {liveBmi.value} ({liveBmi.category})
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <label htmlFor="patient-age-input" className="block font-semibold text-slate-700 mb-1">
                Age (years)
              </label>
              <input
                id="patient-age-input"
                type="number"
                min="1"
                max="120"
                placeholder="e.g. 45"
                value={age}
                onChange={(e) => {
                  const val = e.target.value === '' ? '' : parseInt(e.target.value, 10);
                  setAge(val);
                }}
                onBlur={() => persistChanges()}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 bg-slate-50/50 text-slate-800 text-sm"
              />
            </div>

            <div>
              <label htmlFor="patient-gender-select" className="block font-semibold text-slate-700 mb-1">
                Biological Gender
              </label>
              <select
                id="patient-gender-select"
                value={gender}
                onChange={(e) => {
                  const g = e.target.value as HealthProfile['gender'];
                  setGender(g);
                  persistChanges();
                }}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 bg-slate-50/50 text-slate-800 text-sm"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>

            <div>
              <label htmlFor="patient-height-input" className="block font-semibold text-slate-700 mb-1">
                Height (cm)
              </label>
              <input
                id="patient-height-input"
                type="number"
                min="50"
                max="250"
                placeholder="e.g. 175"
                value={height}
                onChange={(e) => {
                  const val = e.target.value === '' ? '' : parseInt(e.target.value, 10);
                  setHeight(val);
                }}
                onBlur={() => persistChanges()}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 bg-slate-50/50 text-slate-800 text-sm"
              />
            </div>

            <div>
              <label htmlFor="patient-weight-input" className="block font-semibold text-slate-700 mb-1">
                Weight (kg)
              </label>
              <input
                id="patient-weight-input"
                type="number"
                min="20"
                max="300"
                placeholder="e.g. 74"
                value={weight}
                onChange={(e) => {
                  const val = e.target.value === '' ? '' : parseInt(e.target.value, 10);
                  setWeight(val);
                }}
                onBlur={() => persistChanges()}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 bg-slate-50/50 text-slate-800 text-sm"
              />
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-start space-x-2 text-[11px] text-slate-500 leading-relaxed">
            <Activity className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
            <span>Biometrics allow our Nutrition Agent to calibrate basal metabolic demands and identify weight-sensitive drug dosing flags.</span>
          </div>
        </div>

        {/* Section 2: Diagnosed Health Conditions */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <Heart className="w-5 h-5 text-rose-600" />
              <h2 className="font-bold text-sm text-slate-900 uppercase tracking-wider">
                2. Diagnosed Conditions ({diseases.length})
              </h2>
            </div>
            <span className="text-[11px] text-slate-400">Click chips to toggle</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {popularConditions.map((cond) => {
              const selected = diseases.includes(cond);
              return (
                <button
                  key={cond}
                  type="button"
                  onClick={() => handleToggleCondition(cond)}
                  className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    selected
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200/60'
                  }`}
                >
                  {selected ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5 opacity-60" />}
                  <span>{cond}</span>
                </button>
              );
            })}

            {/* Custom conditions added by user */}
            {diseases
              .filter((d) => !popularConditions.includes(d))
              .map((custom) => (
                <span
                  key={custom}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-600 text-white"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{custom}</span>
                  <button
                    type="button"
                    onClick={() => handleToggleCondition(custom)}
                    className="hover:opacity-80 ml-1 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}

            {/* Add custom condition button */}
            {!showCustomDiseaseInput ? (
              <button
                type="button"
                onClick={() => setShowCustomDiseaseInput(true)}
                className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200/60 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Other Condition</span>
              </button>
            ) : (
              <form onSubmit={handleAddCustomCondition} className="inline-flex items-center space-x-1">
                <input
                  type="text"
                  placeholder="Enter condition name..."
                  value={newDiseaseInput}
                  onChange={(e) => setNewDiseaseInput(e.target.value)}
                  className="px-2.5 py-1 text-xs rounded-lg border border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                  autoFocus
                />
                <button
                  type="submit"
                  className="px-2 py-1 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 cursor-pointer"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => setShowCustomDiseaseInput(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </form>
            )}
          </div>
        </div>

      </div>

      {/* Grid: Allergies & Dietary Pattern */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Section 3: Known Allergies */}
        <div className="lg:col-span-6 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <h2 className="font-bold text-sm text-slate-900 uppercase tracking-wider">
                3. Known Allergies & Sensitivities ({allergies.length})
              </h2>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {popularAllergies.map((all) => {
              const selected = allergies.includes(all);
              return (
                <button
                  key={all}
                  type="button"
                  onClick={() => handleToggleAllergy(all)}
                  className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    selected
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200/60'
                  }`}
                >
                  {selected ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5 opacity-60" />}
                  <span>{all}</span>
                </button>
              );
            })}

            {allergies
              .filter((a) => !popularAllergies.includes(a))
              .map((custom) => (
                <span
                  key={custom}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-600 text-white"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{custom}</span>
                  <button
                    type="button"
                    onClick={() => handleToggleAllergy(custom)}
                    className="hover:opacity-80 ml-1 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}

            {!showCustomAllergyInput ? (
              <button
                type="button"
                onClick={() => setShowCustomAllergyInput(true)}
                className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200/60 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Other Allergy</span>
              </button>
            ) : (
              <form onSubmit={handleAddCustomAllergy} className="inline-flex items-center space-x-1">
                <input
                  type="text"
                  placeholder="Enter allergy..."
                  value={newAllergyInput}
                  onChange={(e) => setNewAllergyInput(e.target.value)}
                  className="px-2.5 py-1 text-xs rounded-lg border border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-500 bg-white"
                  autoFocus
                />
                <button
                  type="submit"
                  className="px-2 py-1 bg-amber-600 text-white text-xs font-semibold rounded-lg hover:bg-amber-700 cursor-pointer"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => setShowCustomAllergyInput(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Section 4: Dietary Preference */}
        <div className="lg:col-span-6 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <Utensils className="w-5 h-5 text-emerald-600" />
              <h2 className="font-bold text-sm text-slate-900 uppercase tracking-wider">
                4. Dietary Framework
              </h2>
            </div>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md">
              {dietaryPreference}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            {popularDietPreferences.map((diet) => {
              const selected = dietaryPreference === diet;
              return (
                <button
                  key={diet}
                  type="button"
                  onClick={() => handleDietChange(diet)}
                  className={`p-2.5 rounded-xl text-left font-semibold transition-all border cursor-pointer ${
                    selected
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-900 shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="truncate">{diet}</span>
                    {selected && <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 ml-1" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

      </div>

      {/* Section 5: Current Prescriptions & Medications */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center space-x-2">
              <Pill className="w-5 h-5 text-blue-600" />
              <h2 className="font-bold text-base text-slate-900 uppercase tracking-wider">
                5. Current Prescriptions & Medications ({medsList.length})
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Add all prescription drugs, over-the-counter medications, or daily supplements you currently take.
            </p>
          </div>

          <button
            id="add-new-medication-btn"
            type="button"
            onClick={() => setShowAddMedForm(!showAddMedForm)}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold text-xs transition-colors cursor-pointer self-start sm:self-auto border border-blue-200/60"
          >
            <Plus className="w-4 h-4" />
            <span>{showAddMedForm ? 'Cancel Adding' : 'Add Medication'}</span>
          </button>
        </div>

        {/* Inline Add Medication Form */}
        {showAddMedForm && (
          <form onSubmit={handleAddMedication} className="p-5 rounded-2xl bg-blue-50/50 border border-blue-200 space-y-4 text-xs">
            <h3 className="font-bold text-slate-800 text-sm">Register New Medication</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Medication Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Metformin, Lisinopril"
                  value={newMedName}
                  onChange={(e) => setNewMedName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-200 text-xs"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Dosage</label>
                <input
                  type="text"
                  placeholder="e.g. 500 mg, 10 mg"
                  value={newMedDosage}
                  onChange={(e) => setNewMedDosage(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-200 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Frequency</label>
                <select
                  value={newMedFrequency}
                  onChange={(e) => setNewMedFrequency(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-200 text-xs"
                >
                  {frequencyOptions.map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Timing / Administration</label>
                <select
                  value={newMedTiming}
                  onChange={(e) => setNewMedTiming(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-200 text-xs"
                >
                  {timingOptions.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Prescribed For / Indication (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Blood Sugar, Hypertension, Pain Relief"
                value={newMedPurpose}
                onChange={(e) => setNewMedPurpose(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-200 text-xs"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddMedForm(false)}
                className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold cursor-pointer shadow-xs"
              >
                Save Prescription
              </button>
            </div>
          </form>
        )}

        {/* Medications List or AI Clinical Suggestions */}
        {medsList.length === 0 ? (
          <div className="space-y-4">
            {/* Header banner explaining AI Medication Suggestions */}
            <div className="bg-gradient-to-r from-blue-50 via-indigo-50/70 to-emerald-50/50 rounded-2xl p-5 border border-blue-200/80">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shrink-0 shadow-xs">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="text-sm font-bold text-slate-900">
                        AI Medication Suggestions for Diagnosed Conditions
                      </h4>
                      <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold">
                        {liveSuggestedMeds.length} Clinical Option{liveSuggestedMeds.length === 1 ? '' : 's'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed max-w-2xl">
                      {diseases.length > 0 ? (
                        <>
                          You haven't entered medications yet. Based on your profile (
                          <span className="font-semibold text-blue-900">{diseases.join(', ')}</span>
                          ), our clinical guideline engine recommends the standard therapies below for discussion with your clinician.
                        </>
                      ) : (
                        'No medications or conditions recorded yet. Select your diagnosed conditions above to generate guideline-recommended medication suggestions.'
                      )}
                    </p>
                  </div>
                </div>

                {liveSuggestedMeds.length > 0 && (
                  <button
                    id="add-all-suggested-medications-btn"
                    type="button"
                    onClick={handleApplyAllSuggestions}
                    className="inline-flex items-center justify-center space-x-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-98 text-white text-xs font-bold transition-all shadow-xs shrink-0 cursor-pointer self-start sm:self-auto"
                  >
                    <BookmarkPlus className="w-3.5 h-3.5" />
                    <span>Add All Suggested ({liveSuggestedMeds.length})</span>
                  </button>
                )}
              </div>
            </div>

            {/* Quick condition selector pills if no conditions are selected */}
            {diseases.length === 0 && (
              <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3">
                <div className="flex items-center space-x-2 text-xs font-bold text-slate-700">
                  <Activity className="w-4 h-4 text-blue-600" />
                  <span>Select Diagnosed Conditions to Generate Tailored Medication Suggestions:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {popularConditions.map((condition) => (
                    <button
                      key={condition}
                      type="button"
                      onClick={() => handleToggleCondition(condition)}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/60 text-slate-700 text-xs font-semibold transition-colors inline-flex items-center space-x-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3 text-slate-400" />
                      <span>{condition}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Suggested Medication Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {liveSuggestedMeds.map((sug) => {
                const isFirstLine = sug.evidenceGrade === 'First-line Guideline';
                const isRescue = sug.evidenceGrade === 'Rescue / Symptom Relief';
                const badgeClass = isFirstLine
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : isRescue
                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                  : 'bg-blue-50 text-blue-800 border-blue-200';

                return (
                  <div
                    key={sug.id}
                    className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-blue-300 hover:shadow-sm transition-all space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      {/* Card Top: Badges & Indication */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold">
                            For: {sug.condition}
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

                      {/* Name & Class */}
                      <div>
                        <div className="flex items-baseline space-x-2">
                          <h5 className="font-bold text-sm text-slate-900">{sug.name}</h5>
                          <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[10px] font-bold">
                            {sug.typicalDosage}
                          </span>
                        </div>
                        {sug.genericName && sug.genericName !== sug.name && (
                          <p className="text-[11px] text-slate-500 font-medium">{sug.genericName}</p>
                        )}
                        <p className="text-[11px] text-indigo-700 font-semibold">{sug.category}</p>
                      </div>

                      {/* Purpose & Rationale */}
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-600 space-y-1">
                        <p className="font-semibold text-slate-800 flex items-center space-x-1">
                          <Activity className="w-3 h-3 text-blue-600 shrink-0" />
                          <span>{sug.purpose}</span>
                        </p>
                        <p className="text-slate-500 leading-relaxed">{sug.clinicalRationale}</p>
                      </div>

                      {/* Administration & Caution Notes */}
                      <div className="space-y-1 text-[11px] text-slate-500">
                        <div className="flex items-center space-x-1 text-slate-600">
                          <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{sug.frequency} • {sug.timing}</span>
                        </div>
                        {sug.cautionNotes && (
                          <p className="text-[10px] text-amber-700/90 leading-tight">
                            ⚠️ <span className="font-medium">Note:</span> {sug.cautionNotes}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Add to Prescriptions 1-Click Action */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400">1-Click Intake</span>
                      <button
                        type="button"
                        onClick={() => handleApplySuggestedMedication(sug)}
                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white text-xs font-bold transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add to My Prescriptions</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Active Prescriptions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {medsList.map((med) => (
                <div
                  key={med.id}
                  className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/90 flex items-start justify-between hover:bg-slate-50 transition-colors"
                >
                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-sm text-slate-900">{med.name}</span>
                      <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 text-[10px] font-semibold">
                        {med.dosage}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-slate-500 text-[11px]">
                      <span className="inline-flex items-center space-x-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{med.frequency}</span>
                      </span>
                      <span>•</span>
                      <span className="text-slate-600 font-medium">{med.timing || 'Standard timing'}</span>
                    </div>
                    {med.prescribedFor && (
                      <p className="text-[11px] text-slate-400">
                        Prescribed for: <span className="text-slate-600 font-medium">{med.prescribedFor}</span>
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveMedication(med.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                    title="Remove medication"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Expandable Additional Medication Suggestions */}
            {liveSuggestedMeds.filter((sug) => !medsList.some((m) => m.name.toLowerCase().trim() === sug.name.toLowerCase().trim())).length > 0 && (
              <div className="rounded-2xl border border-slate-200 bg-slate-50/60 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowExtraSuggestions(!showExtraSuggestions)}
                  className="w-full p-4 text-left flex items-center justify-between text-xs font-bold text-slate-700 hover:bg-slate-100/70 transition-colors cursor-pointer"
                >
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    <span>
                      Additional Clinical Therapies for Your Diagnosed Conditions ({
                        liveSuggestedMeds.filter((sug) => !medsList.some((m) => m.name.toLowerCase().trim() === sug.name.toLowerCase().trim())).length
                      } available)
                    </span>
                  </div>
                  {showExtraSuggestions ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </button>

                {showExtraSuggestions && (
                  <div className="p-4 pt-0 border-t border-slate-200/80 bg-white grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                    {liveSuggestedMeds
                      .filter((sug) => !medsList.some((m) => m.name.toLowerCase().trim() === sug.name.toLowerCase().trim()))
                      .map((sug) => (
                        <div
                          key={sug.id}
                          className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2 flex flex-col justify-between text-xs"
                        >
                          <div>
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-900">{sug.name} ({sug.typicalDosage})</span>
                              <span className="text-[10px] text-blue-700 font-bold bg-blue-50 px-1.5 py-0.5 rounded">
                                {sug.condition}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 mt-1">{sug.purpose}</p>
                          </div>
                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                            <span className="text-[10px] text-slate-400">{sug.frequency}</span>
                            <button
                              type="button"
                              onClick={() => handleApplySuggestedMedication(sug)}
                              className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold inline-flex items-center space-x-1 cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Add</span>
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Primary Action Footer */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 sticky bottom-4 z-20 backdrop-blur-md bg-white/95">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900">Ready for Verification</h3>
            <p className="text-[11px] text-slate-500">
              {diseases.length} condition(s) • {medsList.length} medication(s) • {dietaryPreference}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <button
            id="manual-save-profile-btn"
            type="button"
            onClick={handleManualSave}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
          >
            {savedFeedback ? (
              <span className="inline-flex items-center space-x-1 text-emerald-600">
                <Check className="w-3.5 h-3.5" />
                <span>Saved!</span>
              </span>
            ) : (
              'Save Details'
            )}
          </button>

          <button
            id="analyze-my-medications-btn"
            type="button"
            onClick={handleStartAnalysis}
            disabled={isAnalyzing}
            className="flex-1 sm:flex-none inline-flex items-center justify-center space-x-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-bold text-xs transition-all shadow-sm shadow-blue-500/20 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isAnalyzing ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Running Multi-Agent AI...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Analyze My Medications</span>
              </>
            )}
          </button>
        </div>
      </div>

    </div>
  );
};
