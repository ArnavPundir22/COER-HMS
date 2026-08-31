import React, { useState } from 'react';
import { Search, Bell, Plus, Building2, User, ChevronDown, LogOut } from 'lucide-react';
import { useHospital } from '../context/HospitalContext';
import { useAuth } from '../context/AuthContext';

export const Header = ({ setActiveTab, openModal }) => {
  const { opdPatients, setActivePatientModal } = useHospital();
  const { currentUser, logout } = useAuth();
  const [globalSearch, setGlobalSearch] = useState('');

  const searchResults = globalSearch.trim() ? opdPatients.filter(p => 
    (p.name && p.name.toLowerCase().includes(globalSearch.toLowerCase())) || 
    (p.crNo && p.crNo.includes(globalSearch)) ||
    (p.opdNo && p.opdNo.includes(globalSearch))
  ).slice(0, 8) : [];

  return (
    <header style={{
      backgroundColor: '#FFFFFF',
      borderBottom: '1px solid #E2E8F0',
      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)',
      padding: '0.875rem 2rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 9
    }}>
      {/* Global Live Patient Search Bar */}
      <div style={{ position: 'relative', width: '380px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.625rem',
          backgroundColor: '#F8FAFC',
          border: '1px solid #E2E8F0',
          borderRadius: '10px',
          padding: '0.45rem 0.875rem',
          boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.03)'
        }}>
          <Search size={16} color="#0F766E" />
          <input
            type="text"
            placeholder="Search Patient Name, CR No, OPD No..."
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            style={{
              border: 'none',
              background: 'transparent',
              outline: 'none',
              width: '100%',
              fontSize: '0.84375rem',
              color: '#0F172A',
              fontWeight: 500
            }}
          />
        </div>

        {/* Dynamic Global Search Overlay Result Dropdown */}
        {searchResults.length > 0 && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            backgroundColor: '#FFFFFF',
            borderRadius: '10px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
            marginTop: '0.375rem',
            overflow: 'hidden',
            zIndex: 100
          }}>
            {searchResults.map(p => (
              <div 
                key={p.id}
                onClick={() => {
                  setActivePatientModal(p);
                  setGlobalSearch('');
                }}
                style={{
                  padding: '0.625rem 0.875rem',
                  borderBottom: '1px solid #F1F5F9',
                  cursor: 'pointer',
                  fontSize: '0.8125rem'
                }}
              >
                <div style={{ fontWeight: 800, color: '#0F766E' }}>{p.name} (CR: {p.crNo})</div>
                <div style={{ fontSize: '0.75rem', color: '#64748B' }}>OPD No: {p.opdNo} • {p.department}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Center Web Application Name Banner */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9375rem', fontWeight: 900, color: '#0F766E', letterSpacing: '-0.01em' }}>
        <img src="/coer-logo.png" alt="COER University Logo" style={{ height: '36px', objectFit: 'contain' }} />
        <span>COER MEDICAL COLLEGE OF AYURVEDA AND HOSPITAL</span>
      </div>

      {/* Right Quick Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button 
          className="btn btn-primary"
          onClick={() => {
            setActiveTab('opd');
            openModal('newOpd');
          }}
          style={{ padding: '0.45rem 0.875rem', borderRadius: '8px' }}
        >
          <Plus size={16} /> New OPD Registration
        </button>

        {/* User Session Profile & Logout Button */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.625rem',
          padding: '0.35rem 0.75rem',
          borderRadius: '10px',
          backgroundColor: '#F8FAFC',
          border: '1px solid #E2E8F0'
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: currentUser?.badgeColor || '#0F766E',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '0.75rem'
          }}>
            {currentUser?.avatarInitials || 'SA'}
          </div>
          <div>
            <div style={{ fontSize: '0.8125rem', fontWeight: 800, color: '#0F172A', lineHeight: 1.1 }}>
              {currentUser?.name || 'coeradmin'}
            </div>
            <div style={{ fontSize: '0.6875rem', color: '#64748B', fontWeight: 600 }}>
              {currentUser?.roleLabel || 'Administrator'}
            </div>
          </div>
        </div>

        <button
          className="btn btn-secondary btn-sm"
          onClick={logout}
          title="Sign Out & Return to Login Screen"
          style={{ color: '#DC2626', borderColor: '#FCA5A5', backgroundColor: '#FEF2F2' }}
        >
          <LogOut size={15} /> Logout
        </button>
      </div>
    </header>
  );
};
