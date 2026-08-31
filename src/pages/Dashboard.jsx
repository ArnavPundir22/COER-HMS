import React, { useState } from 'react';
import { 
  Users, 
  BedDouble, 
  Sparkles, 
  IndianRupee, 
  Activity, 
  Calendar, 
  Stethoscope,
  ArrowUpRight,
  TrendingUp,
  X,
  Phone
} from 'lucide-react';
import { useHospital } from '../context/HospitalContext';

export const Dashboard = ({ setActiveTab }) => {
  const { opdPatients, ipdPatients, panchkarmaLogs, doctors, beds, receipts, admitIpdPatient } = useHospital();

  // Active Interactive Modal States for Dashboard Actions
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedBed, setSelectedBed] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [assignBedPatientName, setAssignBedPatientName] = useState('');

  const totalOpdToday = opdPatients.length;
  const activeIpd = ipdPatients.filter(p => p.status === 'ADMITTED').length;
  const panchkarmaToday = panchkarmaLogs.length;
  const totalRevenue = receipts.reduce((sum, r) => sum + (Number(r.received) || 0), 0);

  const availableBeds = beds.length - activeIpd;

  // Recent OPD Patients in exact data sheet order
  const recentOpdPatients = opdPatients.slice(0, 8);

  const handleAssignBed = (e) => {
    e.preventDefault();
    if (selectedBed && assignBedPatientName) {
      admitIpdPatient({
        crNo: `${Math.floor(20000 + Math.random() * 90000)}`,
        name: assignBedPatientName,
        age: '35',
        gender: 'MALE',
        department: selectedBed.DEPARTMENT || 'KAYACHIKITSA',
        diagnosis: 'IPD Ward Admission',
        bedCode: selectedBed['BED CODE'],
        doctor: 'Dr. Ravi Joshi',
        admitDate: new Date().toISOString().split('T')[0],
        charge: 500,
        paid: 500,
        due: 0
      });
      setSelectedBed(null);
      setAssignBedPatientName('');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Page Title & Context Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }} className="no-print">
        <div>
          <h1 style={{ fontSize: '1.625rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.025em' }}>
            Clinical & Operational Overview
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.875rem' }}>
            COER Medical College of Ayurveda and Hospital • Roorkee, UK
          </p>
        </div>
      </div>

      {/* Main Column Grid */}
      <div className="grid-cols-3" style={{ gridTemplateColumns: '2fr 1fr' }}>
        {/* Left: Live OPD Register */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <Activity size={20} color="#0F766E" />
              <span>Live OPD Patient Register (Click Any Patient to Inspect)</span>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('opd')}>
              Open Register <ArrowUpRight size={14} />
            </button>
          </div>

          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>CR / OPD NO</th>
                  <th>PATIENT NAME (CLICK TO OPEN)</th>
                  <th>AGE/GENDER</th>
                  <th>DEPARTMENT</th>
                  <th>DIAGNOSIS</th>
                </tr>
              </thead>
              <tbody>
                {recentOpdPatients.map((p) => (
                  <tr 
                    key={p.id}
                    onClick={() => setSelectedPatient(p)}
                    style={{ cursor: 'pointer' }}
                    className="clickable-row"
                  >
                    <td>
                      <div style={{ fontWeight: 800, color: '#0F766E' }}>{p.crNo}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748B' }}>OPD: {p.opdNo}</div>
                    </td>
                    <td style={{ fontWeight: 700, color: '#0F766E', textDecoration: 'underline' }}>
                      {p.name}
                    </td>
                    <td>{p.age} Yrs / {p.gender}</td>
                    <td><span className="badge badge-teal">{p.department}</span></td>
                    <td style={{ fontStyle: 'italic', color: '#475569' }}>{p.diagnosis || 'Kayachikitsa General'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Actionable Widgets Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* IPD Bed Capacity */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <BedDouble size={18} color="#2563EB" />
                <span>IPD Bed Capacity</span>
              </div>
              <span className="badge badge-blue" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('beds')}>{availableBeds} Free ↗</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', fontWeight: 700 }}>
                <span style={{ color: '#475569' }}>Occupancy Meter</span>
                <span style={{ color: '#2563EB' }}>{Math.round((activeIpd / beds.length) * 100)}%</span>
              </div>
              
              <div style={{ width: '100%', height: '8px', backgroundColor: '#E2E8F0', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${(activeIpd / beds.length) * 100}%`, height: '100%', backgroundColor: '#2563EB' }}></div>
              </div>

              {/* ACTIONABLE BED CARDS GRID */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.25rem' }}>
                {beds.slice(0, 4).map(b => {
                  const isOccupied = ipdPatients.some(ip => ip.status === 'ADMITTED' && ip.bedCode === b['BED CODE']);
                  return (
                    <div 
                      key={b['SR.NO.']} 
                      onClick={() => setSelectedBed(b)}
                      style={{
                        padding: '0.625rem 0.75rem',
                        backgroundColor: isOccupied ? '#FEF2F2' : '#F8FAFC',
                        borderRadius: '8px',
                        border: isOccupied ? '1px solid #FCA5A5' : '1px solid #E2E8F0',
                        fontSize: '0.75rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                      title={`Click to view/assign bed ${b['BED CODE']}`}
                    >
                      <div>
                        <div style={{ fontWeight: 800, color: '#0F172A' }}>{b['BED CODE']}</div>
                        <div style={{ color: '#64748B', fontSize: '0.6875rem' }}>{b['DEPARTMENT']}</div>
                      </div>
                      <span className={`badge ${isOccupied ? 'badge-rose' : 'badge-success'}`} style={{ fontSize: '0.625rem' }}>
                        {isOccupied ? 'OCCUPIED' : 'VACANT'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Duty Roster Highlights */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <Stethoscope size={18} color="#0F766E" />
                <span>Duty Roster Highlights</span>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('doctors')}>
                Roster
              </button>
            </div>

            {/* ACTIONABLE DOCTOR CARDS LIST */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {doctors.slice(0, 4).map(doc => (
                <div 
                  key={doc.ID} 
                  onClick={() => setSelectedDoctor(doc)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.5rem 0.75rem',
                    borderRadius: '8px',
                    backgroundColor: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    cursor: 'pointer',
                    transition: 'background-color 0.15s ease'
                  }}
                  title={`Click to inspect ${doc.NAME}'s schedule and assigned patients`}
                >
                  <div style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '50%',
                    backgroundColor: '#F0FDF4',
                    border: '1px solid #99F6E4',
                    color: '#0F766E',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '0.75rem'
                  }}>
                    {doc.NAME.replace('Dr.', '').replace('DR:', '').trim().slice(0, 2).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{doc.NAME}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{doc.DEPARTMENT}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 1. ACTIONABLE PATIENT DETAILS MODAL */}
      {selectedPatient && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '600px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid #E2E8F0' }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A' }}>{selectedPatient.name}</h2>
                <div style={{ fontSize: '0.75rem', color: '#64748B' }}>CR Number: {selectedPatient.crNo} | OPD Number: {selectedPatient.opdNo}</div>
              </div>
              <button onClick={() => setSelectedPatient(null)} style={{ background: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
              <div style={{ padding: '0.75rem', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700 }}>CENTRAL REGISTRATION NO</div>
                <div style={{ fontSize: '1.125rem', fontWeight: 800, color: '#0F766E' }}>{selectedPatient.crNo}</div>
              </div>

              <div style={{ padding: '0.75rem', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700 }}>ANNUAL OPD NO</div>
                <div style={{ fontSize: '1.125rem', fontWeight: 800, color: '#2563EB' }}>{selectedPatient.opdNo}</div>
              </div>

              <div><strong>Dept OPD Code:</strong> {selectedPatient.deptOpdNo || '4779'}</div>
              <div><strong>Registration Type:</strong> <span className="badge badge-teal">{selectedPatient.regType || 'NEW'}</span></div>
              <div><strong>Age / Gender:</strong> {selectedPatient.age} Yrs / {selectedPatient.gender}</div>
              <div style={{ gridColumn: 'span 2' }}><strong>Address:</strong> {selectedPatient.address}</div>
              <div><strong>Clinical Department:</strong> <span className="badge badge-amber">{selectedPatient.department}</span></div>
              <div><strong>Attending Doctor:</strong> {selectedPatient.doctor || 'Dr. Ravi Joshi'}</div>
              <div style={{ gridColumn: 'span 2', padding: '0.75rem', backgroundColor: '#F0FDF4', borderRadius: '8px', border: '1px solid #99F6E4' }}>
                <strong style={{ color: '#0F766E' }}>Ayurvedic Diagnosis / Condition:</strong>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: '#042F2C', marginTop: '0.25rem' }}>
                  {selectedPatient.diagnosis || 'Kayachikitsa General'}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button className="btn btn-secondary" onClick={() => setSelectedPatient(null)}>
                Close
              </button>
              <button 
                className="btn btn-primary"
                onClick={() => {
                  setSelectedPatient(null);
                  setActiveTab('opd');
                }}
              >
                Open Full OPD Register
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. ACTIONABLE BED CARD MODAL */}
      {selectedBed && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid #E2E8F0' }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A' }}>Ward Bed Details</h2>
                <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Bed Code: {selectedBed['BED CODE']}</div>
              </div>
              <button onClick={() => setSelectedBed(null)} style={{ background: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ padding: '0.875rem', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700 }}>CLINICAL WARD / DEPT</div>
                  <div style={{ fontSize: '1.125rem', fontWeight: 800, color: '#2563EB' }}>{selectedBed['DEPARTMENT']}</div>
                </div>
                <span className="badge badge-success" style={{ fontSize: '0.8125rem', padding: '0.4rem 0.75rem' }}>VACANT BED</span>
              </div>

              <form onSubmit={handleAssignBed} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Assign Patient to Bed {selectedBed['BED CODE']} *</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    required 
                    placeholder="Enter Patient Full Name to Admit..."
                    value={assignBedPatientName}
                    onChange={(e) => setAssignBedPatientName(e.target.value)}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setSelectedBed(null)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Confirm Ward Admission</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 3. ACTIONABLE DOCTOR ROSTER MODAL */}
      {selectedDoctor && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '550px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid #E2E8F0' }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A' }}>{selectedDoctor.NAME}</h2>
                <div style={{ fontSize: '0.75rem', color: '#0F766E', fontWeight: 700 }}>{selectedDoctor.DEPARTMENT}</div>
              </div>
              <button onClick={() => setSelectedDoctor(null)} style={{ background: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div style={{ padding: '0.75rem', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700 }}>DESIGNATION / ROLE</div>
                  <div style={{ fontWeight: 800, color: '#0F172A' }}>{selectedDoctor.DESIGNATION || 'Consultant Physician'}</div>
                </div>

                <div style={{ padding: '0.75rem', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700 }}>GENDER</div>
                  <div style={{ fontWeight: 800, color: '#0F172A' }}>{selectedDoctor.SEX || 'Female'}</div>
                </div>
              </div>

              <div style={{ padding: '0.75rem', backgroundColor: '#F0FDF4', borderRadius: '8px', border: '1px solid #99F6E4' }}>
                <div style={{ fontSize: '0.75rem', color: '#0F766E', fontWeight: 700 }}>WEEKLY DUTY SCHEDULE</div>
                <div style={{ fontSize: '0.875rem', fontWeight: 800, color: '#042F2C', marginTop: '0.25rem' }}>
                  {selectedDoctor.DAYS || 'MON, TUE, WED, THU, FRI, SAT'}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#475569' }}>
                <Phone size={16} color="#0F766E" />
                <span>Contact Mobile: <strong>+91 9027916039</strong></span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button className="btn btn-secondary" onClick={() => setSelectedDoctor(null)}>Close</button>
              <button 
                className="btn btn-primary"
                onClick={() => {
                  setSelectedDoctor(null);
                  setActiveTab('doctors');
                }}
              >
                Open Full Doctor Roster
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
