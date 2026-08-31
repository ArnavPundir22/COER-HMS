import React from 'react';
import { 
  LayoutDashboard, 
  UserPlus, 
  BedDouble, 
  Sparkles, 
  Pill, 
  TestTube, 
  Receipt, 
  Stethoscope, 
  BarChart3, 
  Database,
  Layers,
  Hospital
} from 'lucide-react';
import { useHospital } from '../context/HospitalContext';
import { useAuth } from '../context/AuthContext';

export const Sidebar = ({ activeTab, setActiveTab }) => {
  const { opdPatients, ipdPatients, doctors } = useHospital();
  const { currentUser } = useAuth();

  const menuSections = [
    {
      title: 'REGISTRATIONS',
      items: [
        { id: 'dashboard', label: "Today's Overview", icon: LayoutDashboard },
        { id: 'opd', label: 'OPD Registration', icon: UserPlus, badge: opdPatients.length },
        { id: 'ipd', label: 'IPD Admission & Wards', icon: BedDouble, badge: ipdPatients.filter(p => p.status === 'ADMITTED').length },
      ]
    },
    {
      title: 'PANCHKARMA',
      items: [
        { id: 'panchkarma', label: 'Panchkarma Specialty', icon: Sparkles },
      ]
    },
    {
      title: 'INVESTIGATIONS',
      items: [
        { id: 'lab', label: 'Laboratory & Pathology', icon: TestTube },
      ]
    },
    {
      title: 'MEDICINE',
      items: [
        { id: 'pharmacy', label: 'Pharmacy Dispensary', icon: Pill },
      ]
    },
    {
      title: 'FINANCIAL RECEIPTS',
      items: [
        { id: 'billing', label: 'Billing & Fee Receipts', icon: Receipt },
      ]
    },
    {
      title: 'REPORTS & ANALYTICS',
      items: [
        { id: 'reports', label: 'Datewise & CCIM Reports', icon: BarChart3 },
        { id: 'backup', label: 'Database Backup & Sync', icon: Database },
      ]
    },
    {
      title: 'MASTERS & CONFIG',
      items: [
        { id: 'doctors', label: 'Doctor Roster', icon: Stethoscope, badge: doctors.length },
        { id: 'masters', label: 'Tariffs & Master Settings', icon: Layers },
      ]
    }
  ];

  // Filter navigation items by JWT allowedTabs
  const visibleSections = menuSections.map(sec => {
    const items = sec.items.filter(item => {
      if (!currentUser || currentUser.role === 'SUPERADMIN') return true;
      if (!currentUser.allowedTabs || currentUser.allowedTabs.length === 0) return false;
      return currentUser.allowedTabs.includes(item.id);
    });
    return { ...sec, items };
  }).filter(sec => sec.items.length > 0);

  return (
    <aside style={{
      width: '270px',
      backgroundColor: '#FFFFFF',
      borderRight: '1px solid #E2E8F0',
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      position: 'sticky',
      top: 0,
      zIndex: 10
    }}>
      {/* System Name Header */}
      <div style={{
        padding: '1rem 1.25rem',
        borderBottom: '1px solid #E2E8F0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: '12px',
        margin: '0.75rem',
        boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
      }}>
        <img 
          src="/coer-logo.png" 
          alt="COER University Logo" 
          style={{ height: '48px', objectFit: 'contain', maxWidth: '100%' }}
        />
        <div style={{ fontWeight: 900, fontSize: '0.8125rem', color: '#0F766E', marginTop: '0.5rem', letterSpacing: '-0.01em' }}>
          AYURVEDA MEDICAL HMS
        </div>
        <div style={{ fontSize: '0.6875rem', color: '#64748B', fontWeight: 700 }}>
          College & Hospital • Roorkee
        </div>
      </div>

      {/* Navigation Sections */}
      <div style={{
        padding: '1rem 0.875rem',
        overflowY: 'auto',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem'
      }}>
        {visibleSections.map((section, idx) => (
          <div key={idx}>
            <div style={{
              fontSize: '0.6875rem',
              fontWeight: 800,
              color: '#94A3B8',
              letterSpacing: '0.08em',
              padding: '0 0.625rem 0.5rem 0.625rem'
            }}>
              {section.title}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.625rem 0.75rem',
                      borderRadius: '10px',
                      border: 'none',
                      backgroundColor: isActive ? '#F0FDF4' : 'transparent',
                      color: isActive ? '#0F766E' : '#475569',
                      fontWeight: isActive ? 800 : 600,
                      fontSize: '0.84375rem',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      borderLeft: isActive ? '3px solid #0F766E' : '3px solid transparent'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <Icon size={18} color={isActive ? '#0F766E' : '#64748B'} />
                      <span>{item.label}</span>
                    </div>

                    {item.badge !== undefined && (
                      <span style={{
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        padding: '0.15rem 0.5rem',
                        borderRadius: '9999px',
                        backgroundColor: isActive ? '#CCFBF1' : '#F1F5F9',
                        color: isActive ? '#0F766E' : '#64748B'
                      }}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Profile summary */}
      <div style={{
        padding: '1rem 1.25rem',
        borderTop: '1px solid #E2E8F0',
        backgroundColor: '#F8FAFC',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem'
      }}>
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          backgroundColor: '#0F766E',
          color: '#FFFFFF',
          fontWeight: 800,
          fontSize: '0.75rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          AD
        </div>
        <div>
          <div style={{ fontSize: '0.8125rem', fontWeight: 800, color: '#0F172A' }}>System Administrator</div>
          <div style={{ fontSize: '0.6875rem', color: '#64748B', fontWeight: 600 }}>Super Admin Access</div>
        </div>
      </div>
    </aside>
  );
};
