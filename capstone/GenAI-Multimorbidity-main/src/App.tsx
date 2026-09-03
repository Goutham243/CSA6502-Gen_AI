/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { User, NavigationTab, HealthProfile, Medication, PatientHealthAnalysis } from './types';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { LoginPage } from './components/LoginPage';
import { Dashboard } from './components/Dashboard';
import { HealthBoardPage } from './components/HealthBoardPage';
import { NutritionDietPage } from './components/NutritionDietPage';
import { HealthReportPage } from './components/HealthReportPage';
import { ProfilePage } from './components/ProfilePage';
import { AdminDashboard } from './components/AdminDashboard';
import { ChatbotWidget } from './components/ChatbotWidget';
import { 
  apiGetPatientData, 
  apiSavePatientData, 
  apiAnalyzePatientHealth,
  getLocalUserData,
  saveLocalUserData
} from './services/apiClient';
import { Sparkles, CheckCircle2, ShieldCheck, Activity, Brain } from 'lucide-react';

export default function App() {
  // Authentication State
  const [user, setUser] = useState<User | null>(() => {
    try {
      const savedUser = localStorage.getItem('medisync_active_session');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  // Current Active Navigation Tab
  const [currentTab, setCurrentTab] = useState<NavigationTab>(() => {
    try {
      const savedUser = localStorage.getItem('medisync_active_session');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        if (parsed.email?.toLowerCase() === 'gouthamnatukula777@gmail.com') {
          return 'admin';
        }
      }
    } catch {
      // fallback
    }
    return 'dashboard';
  });

  // Mobile Drawer State
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Chatbot Open/Close State
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Isolated User Data State
  const [profile, setProfile] = useState<HealthProfile>(() => {
    if (user?.email) {
      const local = getLocalUserData(user.email, user.name);
      return local.profile;
    }
    return {
      age: 0,
      gender: 'Male',
      height: 0,
      weight: 0,
      diseases: [],
      allergies: [],
      dietaryPreference: 'Standard / Balanced',
      updatedAt: new Date().toISOString(),
    };
  });

  const [medications, setMedications] = useState<Medication[]>(() => {
    if (user?.email) {
      const local = getLocalUserData(user.email, user.name);
      return local.medications;
    }
    return [];
  });

  const [analysis, setAnalysis] = useState<PatientHealthAnalysis | null>(() => {
    if (user?.email) {
      const local = getLocalUserData(user.email, user.name);
      return local.analysis;
    }
    return null;
  });

  // Multi-Agent Analysis State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [agentStepIndex, setAgentStepIndex] = useState(0);

  const agentSteps = [
    { title: 'Profile & Biometric Agent', desc: 'Validating age, BMI, and metabolic parameters...' },
    { title: 'Medication Roster Agent', desc: 'Cross-referencing active drugs and dosages...' },
    { title: 'Conflict & Interaction Agent', desc: 'Querying clinical RAG interaction monographs...' },
    { title: 'Clinical Nutrition Agent', desc: 'Assembling diet contraindications and 4-slot daily meal plan...' },
    { title: 'Gemini 3.7 Medical Synthesizer', desc: 'Generating tailored decision-support synthesis...' },
  ];

  // Load user data when switching active account
  const loadUserDataForEmail = useCallback(async (email: string, name?: string) => {
    const local = getLocalUserData(email, name);
    setProfile(local.profile);
    setMedications(local.medications);
    setAnalysis(local.analysis);

    // Also fetch from server to sync latest
    const remote = await apiGetPatientData(email);
    if (remote) {
      setProfile(remote.profile);
      setMedications(remote.medications);
      if (remote.analysis) {
        setAnalysis(remote.analysis);
      }
    }
  }, []);

  // Handle Login
  const handleLogin = (authenticatedUser: User) => {
    setUser(authenticatedUser);
    try {
      localStorage.setItem('medisync_active_session', JSON.stringify(authenticatedUser));
    } catch (e) {
      console.error('Failed to save session', e);
    }

    loadUserDataForEmail(authenticatedUser.email, authenticatedUser.name);

    if (authenticatedUser.email.toLowerCase() === 'gouthamnatukula777@gmail.com') {
      setCurrentTab('admin');
    } else {
      setCurrentTab('dashboard');
    }
  };

  // Handle Logout
  const handleLogout = () => {
    try {
      localStorage.removeItem('medisync_active_session');
    } catch (e) {
      console.error('Failed to clear session', e);
    }
    setUser(null);
    setProfile({
      age: 0,
      gender: 'Male',
      height: 0,
      weight: 0,
      diseases: [],
      allergies: [],
      dietaryPreference: 'Standard / Balanced',
    });
    setMedications([]);
    setAnalysis(null);
    setCurrentTab('dashboard');
    setIsChatOpen(false);
  };

  // Save Profile Handler
  const handleSaveProfile = (updatedProfile: HealthProfile) => {
    setProfile(updatedProfile);
    if (user?.email) {
      apiSavePatientData(user.email, user.name || 'Patient', updatedProfile, medications);
    }
  };

  // Save Medications Handler
  const handleSaveMedications = (updatedMeds: Medication[]) => {
    setMedications(updatedMeds);
    if (user?.email) {
      apiSavePatientData(user.email, user.name || 'Patient', profile, updatedMeds);
    }
  };

  // Run Multi-Agent Analysis
  const handleRunAnalysis = async () => {
    if (!user) return;
    setIsAnalyzing(true);
    setAgentStepIndex(0);

    // Visual step sequence
    const interval = setInterval(() => {
      setAgentStepIndex((prev) => (prev < 4 ? prev + 1 : prev));
    }, 450);

    try {
      const result = await apiAnalyzePatientHealth(
        user.email,
        user.name || 'Patient',
        profile,
        medications
      );
      setAnalysis(result.analysis);
    } catch (err) {
      console.error('Analysis error:', err);
    } finally {
      clearInterval(interval);
      setTimeout(() => {
        setIsAnalyzing(false);
        setCurrentTab('health-board');
      }, 500);
    }
  };

  // Update user name in state & localStorage
  const handleUpdateUserName = (newName: string) => {
    if (!user) return;
    const updatedUser: User = { ...user, name: newName };
    setUser(updatedUser);
    try {
      localStorage.setItem('medisync_active_session', JSON.stringify(updatedUser));
      apiSavePatientData(user.email, newName, profile, medications);
    } catch (e) {
      console.error('Failed to update user name', e);
    }
  };

  // If not authenticated, render Login Page
  if (!user) {
    return <LoginPage onLoginSuccess={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col md:flex-row antialiased font-sans">
      {/* Fixed Left Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onLogout={handleLogout}
        user={user}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <Header
          currentTab={currentTab}
          user={user}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onSelectTab={setCurrentTab}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {/* Multi-Agent Analysis Progress Overlay Modal */}
          {isAnalyzing && (
            <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 space-y-6 animate-in fade-in zoom-in-95">
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-xs">
                    <Activity className="w-6 h-6 animate-pulse" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Executing Multi-Agent Analysis
                  </h3>
                  <p className="text-xs text-slate-500">
                    Verifying {medications.length} prescription(s) against {profile.diseases.length} condition(s)
                  </p>
                </div>

                <div className="space-y-3">
                  {agentSteps.map((step, idx) => {
                    const isDone = idx < agentStepIndex;
                    const isCurrent = idx === agentStepIndex;
                    return (
                      <div
                        key={idx}
                        className={`p-3 rounded-xl border flex items-center space-x-3 transition-all ${
                          isCurrent
                            ? 'bg-blue-50/80 border-blue-200 text-blue-900 shadow-xs'
                            : isDone
                            ? 'bg-emerald-50/50 border-emerald-100 text-emerald-900'
                            : 'bg-slate-50 border-slate-100 text-slate-400'
                        }`}
                      >
                        <div className="shrink-0">
                          {isDone ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          ) : isCurrent ? (
                            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <div className="w-4 h-4 rounded-full border border-slate-300" />
                          )}
                        </div>
                        <div className="text-xs overflow-hidden">
                          <span className="font-bold block truncate">{step.title}</span>
                          <span className="text-[11px] opacity-80 block truncate">{step.desc}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Active View Router */}
          {currentTab === 'dashboard' && (
            <Dashboard
              user={user}
              profile={profile}
              medications={medications}
              onSaveProfile={handleSaveProfile}
              onSaveMedications={handleSaveMedications}
              onRunAnalysis={handleRunAnalysis}
              isAnalyzing={isAnalyzing}
            />
          )}

          {currentTab === 'health-board' && (
            <HealthBoardPage
              user={user}
              profile={profile}
              medications={medications}
              analysis={analysis}
              onNavigateToNutrition={() => setCurrentTab('nutrition')}
              onNavigateToReport={() => setCurrentTab('report')}
              onEditProfile={() => setCurrentTab('dashboard')}
              onOpenChat={() => setIsChatOpen(true)}
              onSaveMedications={handleSaveMedications}
            />
          )}

          {currentTab === 'nutrition' && (
            <NutritionDietPage
              user={user}
              profile={profile}
              medications={medications}
              analysis={analysis}
            />
          )}

          {currentTab === 'report' && (
            <HealthReportPage
              user={user}
              profile={profile}
              medications={medications}
              analysis={analysis}
              onBackToBoard={() => setCurrentTab('health-board')}
            />
          )}

          {currentTab === 'profile' && (
            <ProfilePage
              user={user}
              profile={profile}
              onSaveProfile={handleSaveProfile}
              onUpdateUserName={handleUpdateUserName}
            />
          )}

          {currentTab === 'admin' && (
            <AdminDashboard 
              user={user} 
              profile={profile} 
              medications={medications}
              onSwitchToPatientView={() => setCurrentTab('dashboard')}
            />
          )}
        </main>
      </div>

      {/* Floating AI Chatbot Widget */}
      <ChatbotWidget
        user={user}
        profile={profile}
        medications={medications}
        isOpen={isChatOpen}
        onToggle={() => setIsChatOpen(!isChatOpen)}
      />
    </div>
  );
}
