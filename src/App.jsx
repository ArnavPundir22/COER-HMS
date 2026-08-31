import React, { useState } from 'react';
import { HospitalProvider } from './context/HospitalContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginPage } from './pages/LoginPage';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { PatientDetailModal } from './components/PatientDetailModal';
import { Dashboard } from './pages/Dashboard';
import { OpdRegistration } from './pages/OpdRegistration';
import { IpdManagement } from './pages/IpdManagement';
import { Patient360 } from './pages/Patient360';
import { PanchkarmaCenter } from './pages/PanchkarmaCenter';
import { PharmacyDispensary } from './pages/PharmacyDispensary';
import { LabDiagnostics } from './pages/LabDiagnostics';
import { BillingReceipts } from './pages/BillingReceipts';
import { DoctorRoster } from './pages/DoctorRoster';
import { ReportsAnalytics } from './pages/ReportsAnalytics';
import { MasterSettings } from './pages/MasterSettings';
import { PwaInstallModal } from './components/PwaInstallModal';

function MainAppContent() {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [modalState, setModalState] = useState(null);

  const openModal = (modalName) => {
    setModalState(modalName);
  };

  if (!currentUser) {
    return <LoginPage />;
  }

  const isTabAllowed = (tabId) => {
    if (currentUser.role === 'SUPERADMIN') return true;
    if (!currentUser.allowedTabs || currentUser.allowedTabs.length === 0) return false;
    return currentUser.allowedTabs.includes(tabId);
  };

  return (
    <div className="app-layout">
      {/* Sidebar Navigation */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <div className="main-wrapper">
        {/* Header Bar */}
        <Header setActiveTab={setActiveTab} openModal={openModal} />

        {/* View Switcher matching original PHP script routes */}
        <main className="main-content">
          {!isTabAllowed(activeTab) ? (
            <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem', marginTop: '2rem' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🔒</div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#991B1B' }}>
                JWT Authorization Access Denied
              </h2>
              <p style={{ color: '#64748B', maxWidth: '450px', margin: '0.5rem auto 1.25rem auto', fontSize: '0.875rem' }}>
                Your current staff account (<strong>{currentUser.name}</strong>) does not have permission to view the <strong>{activeTab.toUpperCase()}</strong> tab.
              </p>
              <button className="btn btn-primary" onClick={() => setActiveTab('dashboard')}>
                Return to Today's Overview
              </button>
            </div>
          ) : (
            <>
              {activeTab === 'dashboard' && <Dashboard setActiveTab={setActiveTab} />}
              {activeTab === 'opd' && <OpdRegistration modalState={modalState} setModalState={setModalState} />}
              {activeTab === 'ipd' && <IpdManagement modalState={modalState} setModalState={setModalState} />}
              {activeTab === 'discharge' && <IpdManagement modalState={modalState} setModalState={setModalState} initialView="discharge" />}
              {activeTab === 'diet' && <IpdManagement modalState={modalState} setModalState={setModalState} initialView="diet" />}
              {activeTab === 'patient360' && <Patient360 />}
              {activeTab === 'panchkarma' && <PanchkarmaCenter />}
              {activeTab === 'pharmacy' && <PharmacyDispensary />}
              {activeTab === 'lab' && <LabDiagnostics />}
              {activeTab === 'labResults' && <LabDiagnostics initialView="results" />}
              {activeTab === 'billing' && <BillingReceipts />}
              {activeTab === 'doctors' && <DoctorRoster />}
              {activeTab === 'beds' && <IpdManagement modalState={modalState} setModalState={setModalState} initialView="beds" />}
              {activeTab === 'reports' && <ReportsAnalytics />}
              {activeTab === 'yearlyReport' && <ReportsAnalytics initialView="yearly" />}
              {activeTab === 'backup' && <MasterSettings initialView="backup" />}
              {activeTab === 'masters' && <MasterSettings />}
            </>
          )}
        </main>

        {/* Global Patient Detail Search Modal */}
        <PatientDetailModal />
        
        {/* Automatic PWA App Install Modal for New Visitors */}
        <PwaInstallModal />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <HospitalProvider>
        <MainAppContent />
      </HospitalProvider>
    </AuthProvider>
  );
}
