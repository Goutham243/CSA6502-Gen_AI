import { HealthProfile, Medication, User, PatientHealthAnalysis } from '../types';

/**
 * Generates and triggers download of a standalone offline HTML Clinical Report
 * that can be opened in any browser and printed or converted to PDF.
 */
export function downloadHTMLReport(
  user: User,
  profile: HealthProfile,
  medications: Medication[],
  guidance: PatientHealthAnalysis,
  reportId: string,
  dateStr: string
) {
  const patientName = user.name || 'Patient';
  const fileName = `MediSync_Clinical_Report_${patientName.replace(/[^a-zA-Z0-9]/g, '_')}_${reportId}.html`;

  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MediSync Clinical Verification Report - ${patientName}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
    
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    
    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: #0f172a;
      background-color: #f8fafc;
      padding: 24px;
      line-height: 1.5;
      font-size: 13px;
    }

    .report-container {
      max-width: 900px;
      margin: 0 auto;
      background: #ffffff;
      padding: 44px;
      border-radius: 20px;
      border: 1px solid #e2e8f0;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    }

    .action-bar {
      margin-bottom: 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 18px;
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      border-radius: 14px;
    }

    .header {
      border-bottom: 2px solid #0f172a;
      padding-bottom: 24px;
      margin-bottom: 28px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      flex-wrap: wrap;
      gap: 16px;
    }

    .brand {
      color: #1d4ed8;
      font-weight: 800;
      font-size: 20px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .subtitle {
      color: #64748b;
      font-size: 11px;
      font-weight: 500;
      margin-top: 2px;
    }

    .title {
      font-size: 24px;
      font-weight: 800;
      color: #0f172a;
      margin-top: 12px;
      letter-spacing: -0.02em;
    }

    .meta-box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 12px 16px;
      font-size: 11px;
      text-align: right;
    }

    .meta-item {
      margin-bottom: 4px;
    }
    .meta-item:last-child {
      margin-bottom: 0;
    }

    .meta-label {
      color: #94a3b8;
      font-weight: 600;
      text-transform: uppercase;
      font-size: 10px;
    }

    .meta-val {
      font-weight: 700;
      color: #1e293b;
    }

    .section {
      margin-bottom: 26px;
    }

    .section-title {
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #1d4ed8;
      padding-bottom: 6px;
      border-bottom: 1px solid #f1f5f9;
      margin-bottom: 12px;
    }

    .grid-5 {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 10px;
    }

    .grid-2 {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 12px;
    }

    .grid-3 {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 12px;
    }

    .grid-4 {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 10px;
    }

    .card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 12px 14px;
    }

    .card-label {
      font-size: 10px;
      font-weight: 600;
      color: #64748b;
      text-transform: uppercase;
      margin-bottom: 4px;
      display: block;
    }

    .card-val {
      font-size: 13px;
      font-weight: 700;
      color: #0f172a;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      overflow: hidden;
      font-size: 12px;
    }

    th {
      background: #f1f5f9;
      color: #475569;
      font-weight: 700;
      text-transform: uppercase;
      font-size: 10px;
      letter-spacing: 0.05em;
      padding: 10px 12px;
      text-align: left;
      border-bottom: 1px solid #e2e8f0;
    }

    td {
      padding: 10px 12px;
      border-bottom: 1px solid #f1f5f9;
      color: #334155;
    }

    tr:last-child td {
      border-bottom: none;
    }

    .guidance-box {
      border-radius: 12px;
      padding: 14px;
      font-size: 11px;
    }

    .guidance-header {
      font-weight: 800;
      font-size: 12px;
      text-transform: uppercase;
      margin-bottom: 8px;
    }

    .badge-continue {
      background: #ecfdf5;
      border: 1px solid #a7f3d0;
      color: #065f46;
    }

    .badge-caution {
      background: #fffbeb;
      border: 1px solid #fde68a;
      color: #92400e;
    }

    .badge-review {
      background: #fff1f2;
      border: 1px solid #fecdd3;
      color: #9f1239;
    }

    .interaction-item {
      background: #fffbeb;
      border: 1px solid #fde68a;
      border-radius: 10px;
      padding: 12px;
      margin-bottom: 8px;
    }

    .interaction-title {
      font-weight: 700;
      color: #92400e;
      margin-bottom: 4px;
    }

    .disclaimer {
      background: #fffbeb;
      border: 1px solid #fde68a;
      border-radius: 12px;
      padding: 14px;
      color: #78350f;
      font-size: 11px;
      line-height: 1.6;
      margin-top: 24px;
    }

    .btn {
      padding: 8px 16px;
      border-radius: 10px;
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
      border: none;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: #2563eb;
      color: white;
    }

    @media print {
      body {
        background: white;
        padding: 0;
      }
      .report-container {
        border: none;
        box-shadow: none;
        padding: 0;
        max-width: 100%;
      }
      .action-bar {
        display: none !important;
      }
    }
  </style>
</head>
<body>
  <div class="report-container">
    <div class="action-bar">
      <span style="font-size: 12px; font-weight: 600; color: #1e40af;">
        📄 MediSync Clinical Summary Export
      </span>
      <button class="btn" onclick="window.print()">
        🖨️ Print / Save as PDF
      </button>
    </div>

    <!-- Header -->
    <div class="header">
      <div>
        <div class="brand">
          <span>🛡️</span> MediSync AI Health Platform
        </div>
        <div class="subtitle">Multi-Agent Medication Conflict & Nutritional Decision-Support System</div>
        <h1 class="title">Comprehensive Clinical Verification Report</h1>
      </div>
      <div class="meta-box">
        <div class="meta-item"><span class="meta-label">Report ID:</span> <span class="meta-val">${reportId}</span></div>
        <div class="meta-item"><span class="meta-label">Generated:</span> <span class="meta-val">${dateStr}</span></div>
        <div class="meta-item"><span class="meta-label">Status:</span> <span class="meta-val" style="color: #059669;">Verified Profile</span></div>
      </div>
    </div>

    <!-- 1. Patient Demographics & Vitals -->
    <div class="section">
      <div class="section-title">1. Patient Demographics & Vitals</div>
      <div class="grid-5">
        <div class="card">
          <span class="card-label">Full Name</span>
          <div class="card-val">${patientName}</div>
        </div>
        <div class="card">
          <span class="card-label">Age & Gender</span>
          <div class="card-val">${profile.age > 0 ? `${profile.age} yrs` : 'N/A'} • ${profile.gender}</div>
        </div>
        <div class="card">
          <span class="card-label">Height & Weight</span>
          <div class="card-val">${profile.height > 0 ? `${profile.height} cm` : '--'} • ${profile.weight > 0 ? `${profile.weight} kg` : '--'}</div>
        </div>
        <div class="card">
          <span class="card-label">Calculated BMI</span>
          <div class="card-val">${guidance.bmi.value > 0 ? `${guidance.bmi.value} (${guidance.bmi.category})` : 'N/A'}</div>
        </div>
        <div class="card">
          <span class="card-label">Dietary Pattern</span>
          <div class="card-val">${profile.dietaryPreference || 'Standard'}</div>
        </div>
      </div>
    </div>

    <!-- 2 & 3. Diagnosed Conditions & Confirmed Allergens -->
    <div class="section">
      <div class="grid-2">
        <div class="card">
          <span class="card-label">2. Diagnosed Health Conditions (${profile.diseases.length})</span>
          <div class="card-val">${profile.diseases.length > 0 ? profile.diseases.join(', ') : 'None registered'}</div>
        </div>
        <div class="card" style="border-color: #fde68a; background: #fffbeb;">
          <span class="card-label" style="color: #b45309;">3. Confirmed Medical Allergens (${profile.allergies.length})</span>
          <div class="card-val" style="color: #78350f;">${profile.allergies.length > 0 ? profile.allergies.join(', ') : 'No known allergies reported'}</div>
        </div>
      </div>
    </div>

    <!-- 4. Active Prescriptions -->
    <div class="section">
      <div class="section-title">4. Active Prescription & Medication Roster (${medications.length})</div>
      <table>
        <thead>
          <tr>
            <th>Medication Name</th>
            <th>Dosage</th>
            <th>Frequency</th>
            <th>Timing / Administration</th>
            <th>Indication</th>
          </tr>
        </thead>
        <tbody>
          ${medications.length === 0 ? `
            <tr>
              <td colspan="5" style="text-align: center; color: #94a3b8; padding: 16px;">
                No prescriptions recorded in this patient profile.
              </td>
            </tr>
          ` : medications.map(m => `
            <tr>
              <td><strong>${m.name}</strong></td>
              <td>${m.dosage}</td>
              <td>${m.frequency}</td>
              <td>${m.timing || 'Standard timing'}</td>
              <td>${m.prescribedFor || 'General health'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <!-- 5. Medication Classification & Clinical Guidance -->
    <div class="section">
      <div class="section-title">5. Medication Classification & Clinical Guidance</div>
      <div class="grid-3">
        <div class="guidance-box badge-continue">
          <div class="guidance-header" style="color: #065f46;">✓ To Continue (${guidance.medicationsToContinue.length})</div>
          ${guidance.medicationsToContinue.length === 0 ? '<p style="color: #94a3b8;">None</p>' : `
            <ul style="padding-left: 14px;">
              ${guidance.medicationsToContinue.map(m => `<li><strong>${m.medication.name}</strong> (${m.medication.dosage})</li>`).join('')}
            </ul>
          `}
        </div>

        <div class="guidance-box badge-caution">
          <div class="guidance-header" style="color: #92400e;">⚠️ Use With Caution (${guidance.medicationsToCaution.length})</div>
          ${guidance.medicationsToCaution.length === 0 ? '<p style="color: #94a3b8;">None</p>' : `
            <ul style="padding-left: 14px;">
              ${guidance.medicationsToCaution.map(m => `<li><strong>${m.medication.name}</strong>: ${m.actionNote}</li>`).join('')}
            </ul>
          `}
        </div>

        <div class="guidance-box badge-review">
          <div class="guidance-header" style="color: #9f1239;">🚫 Requires Review (${guidance.medicationsRequiringReview.length})</div>
          ${guidance.medicationsRequiringReview.length === 0 ? '<p style="color: #94a3b8;">None detected</p>' : `
            <ul style="padding-left: 14px;">
              ${guidance.medicationsRequiringReview.map(m => `<li><strong>${m.medication.name}</strong>: ${m.actionNote}</li>`).join('')}
            </ul>
          `}
        </div>
      </div>
    </div>

    <!-- 6. Drug Interactions & Food Contraindications -->
    <div class="section">
      <div class="section-title">6. Drug Interactions & Food Contraindications</div>
      ${guidance.interactions.length === 0 && guidance.medicationFoodInteractions.length === 0 ? `
        <div class="card" style="color: #64748b; font-size: 12px;">No significant drug-drug conflicts or severe food contraindications detected.</div>
      ` : `
        ${guidance.interactions.map(inter => `
          <div class="interaction-item">
            <div class="interaction-title">${inter.headline} (${inter.severity} Priority)</div>
            <p style="color: #334155; margin-bottom: 4px;">${inter.simpleExplanation}</p>
            <p style="color: #92400e; font-weight: 600;">Recommendation: ${inter.recommendation}</p>
          </div>
        `).join('')}

        ${guidance.medicationFoodInteractions.map(f => `
          <div class="card" style="margin-bottom: 6px;">
            <strong>${f.medicationName} + ${f.foodName} (${f.status})</strong>
            <p style="color: #64748b; margin-top: 2px;">${f.explanation} ${f.recommendation}</p>
          </div>
        `).join('')}
      `}
    </div>

    <!-- 7. Personalized 4-Slot Meal Schedule -->
    <div class="section">
      <div class="section-title">7. Personalized 4-Slot Daily Meal Schedule</div>
      <div class="grid-4">
        <div class="card">
          <span class="card-label" style="color: #1d4ed8;">Breakfast</span>
          <strong>${guidance.mealStructure.breakfast.title}</strong>
          <p style="font-size: 11px; color: #64748b; margin-top: 4px;">${guidance.mealStructure.breakfast.guidance}</p>
        </div>
        <div class="card">
          <span class="card-label" style="color: #b45309;">Lunch</span>
          <strong>${guidance.mealStructure.lunch.title}</strong>
          <p style="font-size: 11px; color: #64748b; margin-top: 4px;">${guidance.mealStructure.lunch.guidance}</p>
        </div>
        <div class="card">
          <span class="card-label" style="color: #047857;">Evening Snack</span>
          <strong>${guidance.mealStructure.eveningSnack.title}</strong>
          <p style="font-size: 11px; color: #64748b; margin-top: 4px;">${guidance.mealStructure.eveningSnack.guidance}</p>
        </div>
        <div class="card">
          <span class="card-label" style="color: #4338ca;">Dinner</span>
          <strong>${guidance.mealStructure.dinner.title}</strong>
          <p style="font-size: 11px; color: #64748b; margin-top: 4px;">${guidance.mealStructure.dinner.guidance}</p>
        </div>
      </div>
      <div class="card" style="margin-top: 10px; background: #eff6ff; border-color: #bfdbfe; color: #1e40af;">
        <strong>Hydration Strategy:</strong> ${guidance.mealStructure.hydrationTip}
      </div>
    </div>

    <!-- AI Summary & Legal Disclaimer -->
    <div class="section">
      <div class="card" style="background: #f8fafc; font-style: italic; line-height: 1.6; color: #334155; margin-bottom: 12px;">
        <strong style="display: block; font-style: normal; font-size: 10px; color: #94a3b8; text-transform: uppercase; margin-bottom: 4px;">AI Clinical Decision Support Note</strong>
        "${guidance.healthSummary}"
      </div>

      <div class="disclaimer">
        <strong>IMPORTANT CLINICAL NOTICE & LEGAL DISCLAIMER:</strong><br>
        This report is generated by MediSync AI for personal decision-support and educational verification purposes only. It does not constitute formal medical diagnosis, treatment prescriptions, or pharmacy dispensation orders. Always present this report to your board-certified physician or licensed pharmacist for medical guidance and prior to modifying any dosage.
      </div>
    </div>

  </div>
</body>
</html>`;

  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Generates and triggers download of a structured JSON data record
 */
export function downloadJSONReport(
  user: User,
  profile: HealthProfile,
  medications: Medication[],
  guidance: PatientHealthAnalysis,
  reportId: string,
  dateStr: string
) {
  const patientName = user.name || 'Patient';
  const fileName = `MediSync_Clinical_Data_${patientName.replace(/[^a-zA-Z0-9]/g, '_')}_${reportId}.json`;

  const data = {
    reportMetadata: {
      reportId,
      generatedAt: dateStr,
      system: 'MediSync AI Health Platform',
      version: '2.0.0',
    },
    patient: {
      name: patientName,
      email: user.email,
      age: profile.age,
      gender: profile.gender,
      heightCm: profile.height,
      weightKg: profile.weight,
      bmi: guidance.bmi,
      dietaryPreference: profile.dietaryPreference,
      conditions: profile.diseases,
      allergies: profile.allergies,
    },
    activePrescriptions: medications,
    classificationGuidance: {
      toContinue: guidance.medicationsToContinue,
      useWithCaution: guidance.medicationsToCaution,
      requiresReview: guidance.medicationsRequiringReview,
    },
    interactions: guidance.interactions,
    foodInteractions: guidance.medicationFoodInteractions,
    mealPlan: guidance.mealStructure,
    clinicalSummary: guidance.healthSummary,
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
