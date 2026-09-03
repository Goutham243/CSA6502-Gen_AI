import React, { useState } from 'react';
import { HealthProfile, Medication, User, PatientHealthAnalysis } from '../types';
import { generatePatientGuidance } from '../data/mockData';
import { 
  Utensils, 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle, 
  Sun, 
  Sunset, 
  Moon, 
  Droplet, 
  Apple, 
  ShieldCheck,
  Heart,
  Coffee,
  Sparkles,
  Info,
  ChevronDown
} from 'lucide-react';

interface NutritionDietPageProps {
  user: User;
  profile: HealthProfile;
  medications: Medication[];
  analysis?: PatientHealthAnalysis | null;
}

export const NutritionDietPage: React.FC<NutritionDietPageProps> = ({
  user,
  profile,
  medications,
  analysis,
}) => {
  const guidance = analysis || generatePatientGuidance(profile, medications, user.name);
  const patientFirstName = user.name ? user.name.split(' ')[0] : 'Patient';

  const [activeCategoryFilter, setActiveCategoryFilter] = useState<'all' | 'rec' | 'caut' | 'avoid'>('all');

  return (
    <div id="nutrition-diet-page" className="space-y-8 max-w-4xl mx-auto pb-16">
      
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
        <div className="flex items-center space-x-2 text-blue-600 text-xs font-bold uppercase tracking-wider mb-1">
          <Utensils className="w-4 h-4" />
          <span>Personalized Food & Nutrition</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          Nutrition & Diet Guidance for {patientFirstName}
        </h1>
        <p className="text-slate-600 mt-2 text-xs sm:text-sm leading-relaxed">
          Customized dietary recommendations aligned dynamically with your conditions ({profile.diseases.join(', ') || 'General Health'}), active prescriptions, and dietary preferences.
        </p>

        {/* Dynamic Personalization summary badges */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap gap-2 text-xs">
          <span className="px-3 py-1 rounded-lg bg-blue-50 text-blue-700 font-semibold border border-blue-100">
            Diet: {profile.dietaryPreference || 'Standard / Balanced'}
          </span>
          {profile.allergies.length > 0 && (
            <span className="px-3 py-1 rounded-lg bg-amber-50 text-amber-800 font-semibold border border-amber-200">
              Allergens Excluded: {profile.allergies.join(', ')}
            </span>
          )}
          {profile.diseases.map((d) => (
            <span key={d} className="px-3 py-1 rounded-lg bg-slate-100 text-slate-700 font-medium">
              Care for: {d}
            </span>
          ))}
        </div>
      </div>

      {/* 3 Categories: Recommended, Caution, Avoid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
            <span>Personalized Food Categories</span>
          </h2>
          <span className="text-xs text-slate-500">Filtered for your profile</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          {/* 1. Recommended Foods (Green) */}
          <div className="bg-white rounded-2xl p-5 border border-emerald-200/80 shadow-xs space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-2 pb-3 border-b border-emerald-100">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-xs text-emerald-950 uppercase tracking-wider">
                    ✓ Recommended Foods
                  </h3>
                  <span className="text-[10px] text-emerald-700">Beneficial for your conditions</span>
                </div>
              </div>

              <div className="space-y-3 pt-3">
                {guidance.foodGuidance.recommended.map((item) => (
                  <div key={item.id} className="p-3 rounded-xl bg-emerald-50/40 border border-emerald-100/80 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{item.name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-white text-emerald-800 font-medium">
                        {item.category}
                      </span>
                    </div>
                    <p className="text-slate-600 text-[11px] leading-snug">{item.reason}</p>
                    {item.relatedCondition && (
                      <span className="inline-block text-[10px] text-emerald-700 font-semibold mt-1">
                        🎯 Supports {item.relatedCondition}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="text-[11px] text-emerald-800 pt-3 border-t border-emerald-100/60 font-medium">
              💡 Rich in protective antioxidants and fiber.
            </div>
          </div>

          {/* 2. Foods to Use With Caution (Amber) */}
          <div className="bg-white rounded-2xl p-5 border border-amber-200/80 shadow-xs space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-2 pb-3 border-b border-amber-100">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-xs text-amber-950 uppercase tracking-wider">
                    ⚠ Use With Caution
                  </h3>
                  <span className="text-[10px] text-amber-700">Moderate portions & check timing</span>
                </div>
              </div>

              <div className="space-y-3 pt-3">
                {guidance.foodGuidance.caution.map((item) => (
                  <div key={item.id} className="p-3 rounded-xl bg-amber-50/40 border border-amber-100/80 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{item.name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-white text-amber-800 font-medium">
                        {item.category}
                      </span>
                    </div>
                    <p className="text-slate-600 text-[11px] leading-snug">{item.reason}</p>
                    {item.relatedMedication && (
                      <span className="inline-block text-[10px] text-amber-800 font-semibold mt-1">
                        💊 Caution with {item.relatedMedication}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="text-[11px] text-amber-800 pt-3 border-t border-amber-100/60 font-medium">
              💡 Monitor your daily intake and balance with meals.
            </div>
          </div>

          {/* 3. Foods to Avoid or Discuss (Rose/Red) */}
          <div className="bg-white rounded-2xl p-5 border border-rose-200/80 shadow-xs space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-2 pb-3 border-b border-rose-100">
                <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
                  <AlertCircle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-xs text-rose-950 uppercase tracking-wider">
                    ✕ Avoid or Discuss
                  </h3>
                  <span className="text-[10px] text-rose-700">Conflicts, allergens & high risks</span>
                </div>
              </div>

              <div className="space-y-3 pt-3">
                {guidance.foodGuidance.avoid.map((item) => (
                  <div key={item.id} className="p-3 rounded-xl bg-rose-50/40 border border-rose-100/80 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{item.name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-white text-rose-800 font-medium">
                        {item.category}
                      </span>
                    </div>
                    <p className="text-slate-600 text-[11px] leading-snug">{item.reason}</p>
                    {item.relatedMedication && (
                      <span className="inline-block text-[10px] text-rose-800 font-semibold mt-1">
                        ⚠ Interaction with {item.relatedMedication}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="text-[11px] text-rose-800 pt-3 border-t border-rose-100/60 font-medium">
              💡 Excluded to protect your health & medication safety.
            </div>
          </div>

        </div>
      </div>

      {/* Personalized Daily Meal Structure (4 Slots: Breakfast, Lunch, Evening Snack, Dinner) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h2 className="text-base font-bold text-slate-900">Personalized Daily Meal Plan</h2>
          </div>
          <span className="text-xs text-slate-400">Structured daily timeline</span>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Breakfast */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center space-x-2 pb-2 border-b border-slate-200/60">
                  <div className="p-1.5 rounded-lg bg-blue-100 text-blue-700">
                    <Sun className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-sm text-slate-900">Breakfast</h3>
                </div>

                <div className="mt-3 space-y-2">
                  <span className="font-semibold text-xs text-blue-700 block">
                    {guidance.mealStructure.breakfast.title}
                  </span>
                  <ul className="space-y-1.5 text-xs text-slate-700">
                    {guidance.mealStructure.breakfast.items.map((it, idx) => (
                      <li key={idx} className="flex items-start space-x-1.5">
                        <span className="text-blue-500 font-bold">•</span>
                        <span>{it}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200/60 text-[11px] text-slate-500">
                💡 <span className="font-medium text-slate-700">Timing note:</span> {guidance.mealStructure.breakfast.guidance}
              </div>
            </div>

            {/* Lunch */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center space-x-2 pb-2 border-b border-slate-200/60">
                  <div className="p-1.5 rounded-lg bg-amber-100 text-amber-700">
                    <Sunset className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-sm text-slate-900">Lunch</h3>
                </div>

                <div className="mt-3 space-y-2">
                  <span className="font-semibold text-xs text-blue-700 block">
                    {guidance.mealStructure.lunch.title}
                  </span>
                  <ul className="space-y-1.5 text-xs text-slate-700">
                    {guidance.mealStructure.lunch.items.map((it, idx) => (
                      <li key={idx} className="flex items-start space-x-1.5">
                        <span className="text-blue-500 font-bold">•</span>
                        <span>{it}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200/60 text-[11px] text-slate-500">
                💡 <span className="font-medium text-slate-700">Flavor tip:</span> {guidance.mealStructure.lunch.guidance}
              </div>
            </div>

            {/* Evening Snack (Explicitly Requested!) */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center space-x-2 pb-2 border-b border-slate-200/60">
                  <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
                    <Coffee className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-sm text-slate-900">Evening Snack</h3>
                </div>

                <div className="mt-3 space-y-2">
                  <span className="font-semibold text-xs text-blue-700 block">
                    {guidance.mealStructure.eveningSnack.title}
                  </span>
                  <ul className="space-y-1.5 text-xs text-slate-700">
                    {guidance.mealStructure.eveningSnack.items.map((it, idx) => (
                      <li key={idx} className="flex items-start space-x-1.5">
                        <span className="text-emerald-500 font-bold">•</span>
                        <span>{it}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200/60 text-[11px] text-slate-500">
                💡 <span className="font-medium text-slate-700">Metabolic tip:</span> {guidance.mealStructure.eveningSnack.guidance}
              </div>
            </div>

            {/* Dinner */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center space-x-2 pb-2 border-b border-slate-200/60">
                  <div className="p-1.5 rounded-lg bg-indigo-100 text-indigo-700">
                    <Moon className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-sm text-slate-900">Dinner</h3>
                </div>

                <div className="mt-3 space-y-2">
                  <span className="font-semibold text-xs text-blue-700 block">
                    {guidance.mealStructure.dinner.title}
                  </span>
                  <ul className="space-y-1.5 text-xs text-slate-700">
                    {guidance.mealStructure.dinner.items.map((it, idx) => (
                      <li key={idx} className="flex items-start space-x-1.5">
                        <span className="text-blue-500 font-bold">•</span>
                        <span>{it}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200/60 text-[11px] text-slate-500">
                💡 <span className="font-medium text-slate-700">Digestion tip:</span> {guidance.mealStructure.dinner.guidance}
              </div>
            </div>

          </div>

          {/* Hydration & Healthy Snacks Row */}
          <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-blue-50/50 border border-blue-100 flex items-start space-x-3">
              <Droplet className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-blue-900 mb-0.5">Hydration Guidelines</h4>
                <p className="text-blue-800/80 leading-snug">{guidance.mealStructure.hydrationTip}</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start space-x-3">
              <Apple className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-slate-900 mb-0.5">Smart Snacks</h4>
                <p className="text-slate-600 leading-snug">{guidance.mealStructure.snackTip}</p>
              </div>
            </div>
          </div>

          {/* Professional Medical Consultation Footer */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center space-x-3">
            <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0" />
            <p>
              These meal guidelines are supportive recommendations designed to work with your health profile. Please always follow the specific medical and nutritional orders given by your primary physician or registered dietitian.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};
