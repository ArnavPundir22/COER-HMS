import React, { useState, useMemo } from 'react';
import { BedDouble, Plus, UserCheck, Utensils, CheckCircle, X, Search, Edit2, Calendar } from 'lucide-react';
import { useHospital } from '../context/HospitalContext';

export const IpdManagement = ({ modalState, setModalState }) => {
  const { beds, ipdPatients, admitIpdPatient, dischargeIpdPatient, doctors, opdPatients } = useHospital();

  const [activeSubTab, setActiveSubTab] = useState('beds'); // 'beds' or 'diet'
  const [selectedPatientForDischarge, setSelectedPatientForDischarge] = useState(null);
  const [selectedPatientForDiet, setSelectedPatientForDiet] = useState(null);
  const [dischargeNotes, setDischargeNotes] = useState('');

  const [opdSearch, setOpdSearch] = useState('');
  const [showOpdSuggestions, setShowOpdSuggestions] = useState(false);

  const [dietForm, setDietForm] = useState({
    morning: 'D-1 Herbal Tea / Milk',
    noon: 'D-2 Pathya Ahaar (Kichadi with Ghee)',
    evening: 'D-3 Light Soup / Mudga Yusha'
  });

  const [formData, setFormData] = useState({
    crNo: '',
    name: '',
    age: '',
    gender: 'MALE',
    department: 'KAYACHIKITSA',
    diagnosis: '',
    bedCode: 'KC-1',
    doctor: 'Dr. Ravi Joshi',
    charge: 5000,
    paid: 2000
  });

  // Autocomplete Patient Suggestions (Up to 100 matching items across all 28,281 patients)
  const patientSuggestions = useMemo(() => {
    if (!opdSearch.trim()) return opdPatients.slice(0, 50);
    const term = opdSearch.trim().toLowerCase();
    return opdPatients.filter(p => 
      (p.crNo && p.crNo.includes(term)) || 
      (p.opdNo && p.opdNo.includes(term)) ||
      (p.name && p.name.toLowerCase().includes(term)) ||
      (p.department && p.department.toLowerCase().includes(term))
    ).slice(0, 100);
  }, [opdPatients, opdSearch]);

  const activeAdmissions = ipdPatients.filter(p => p.status === 'ADMITTED');

  const handleSelectOpdPatient = (p) => {
    setFormData({
      ...formData,
      crNo: p.crNo,
      name: p.name,
      age: p.age,
      gender: p.gender,
      department: p.department || 'KAYACHIKITSA',
      diagnosis: p.diagnosis || 'IPD Care Required'
    });
    setOpdSearch(`CR: ${p.crNo} - ${p.name}`);
    setShowOpdSuggestions(false);
  };

  const handleAdmitSubmit = (e) => {
    e.preventDefault();
    admitIpdPatient({
      ...formData,
      due: Number(formData.charge) - Number(formData.paid)
    });
    setModalState(null);
    setOpdSearch('');
    setShowOpdSuggestions(false);
    setFormData({
      crNo: '',
      name: '',
      age: '',
      gender: 'MALE',
      department: 'KAYACHIKITSA',
      diagnosis: '',
      bedCode: 'KC-1',
      doctor: 'Dr. Ravi Joshi',
      charge: 5000,
      paid: 2000
    });
  };

  const handleDischargeSubmit = (e) => {
    e.preventDefault();
    if (selectedPatientForDischarge) {
      dischargeIpdPatient(
        selectedPatientForDischarge.id,
        new Date().toISOString().split('T')[0],
        dischargeNotes
      );
      setSelectedPatientForDischarge(null);
      setDischargeNotes('');
    }
  };

  const handleDietSubmit = (e) => {
    e.preventDefault();
    if (selectedPatientForDiet) {
      selectedPatientForDiet.diet = { ...dietForm };
      setSelectedPatientForDiet(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BedDouble color="#2563EB" size={26} /> Inpatient (IPD) Ward & Diet Management
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.875rem' }}>
            Manage bed allocations across clinical departments, 3-shift diet schedules, and patient discharges.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-primary" onClick={() => setModalState('newIpd')}>
            <Plus size={18} /> New IPD Admission
          </button>
        </div>
      </div>

      {/* Sub Navigation Tabs for Wards & Diet */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '2px solid #E2E8F0', paddingBottom: '0.5rem' }}>
        <button 
          onClick={() => setActiveSubTab('beds')}
          style={{
            padding: '0.625rem 1.25rem',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: activeSubTab === 'beds' ? '#2563EB' : '#F1F5F9',
            color: activeSubTab === 'beds' ? '#FFFFFF' : '#475569',
            fontWeight: 800,
            fontSize: '0.875rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <BedDouble size={18} /> Ward Bed Allocation Matrix ({beds.length})
        </button>

        <button 
          onClick={() => setActiveSubTab('diet')}
          style={{
            padding: '0.625rem 1.25rem',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: activeSubTab === 'diet' ? '#D97706' : '#F1F5F9',
            color: activeSubTab === 'diet' ? '#FFFFFF' : '#475569',
            fontWeight: 800,
            fontSize: '0.875rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <Utensils size={18} /> IPD 3-Shift Diet Register & Scheduler ({activeAdmissions.length})
        </button>
      </div>

      {/* VIEW 1: BED MATRIX & ADMISSIONS */}
      {activeSubTab === 'beds' && (
        <>
          {/* Bed Matrix Grid */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <BedDouble size={20} color="#2563EB" />
                <span>Ward Bed Allocation Matrix ({beds.length} Total Wards Beds)</span>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.75rem', fontWeight: 700 }}>
                <span className="badge badge-success">VACANT ({beds.length - activeAdmissions.length})</span>
                <span className="badge badge-blue">OCCUPIED ({activeAdmissions.length})</span>
              </div>
            </div>

            <div className="grid-cols-4">
              {beds.map((bed) => {
                const occupied = activeAdmissions.find(p => p.bedCode === bed['BED CODE']);
                return (
                  <div 
                    key={bed['SR.NO.']} 
                    style={{
                      padding: '1rem',
                      borderRadius: '12px',
                      border: occupied ? '2px solid #BFDBFE' : '1px solid #E2E8F0',
                      backgroundColor: occupied ? '#EFF6FF' : '#FFFFFF',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 800, fontSize: '1rem', color: occupied ? '#1E3A8A' : '#0F172A' }}>
                        {bed['BED CODE']}
                      </span>
                      <span className={`badge ${occupied ? 'badge-blue' : 'badge-success'}`}>
                        {occupied ? 'OCCUPIED' : 'VACANT'}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>
                      Dept: {bed['DEPARTMENT']}
                    </div>

                    {occupied ? (
                      <div style={{ marginTop: '0.25rem', paddingTop: '0.5rem', borderTop: '1px solid #BFDBFE' }}>
                        <div style={{ fontSize: '0.875rem', fontWeight: 800, color: '#1E3A8A' }}>{occupied.name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#475569' }}>CR: {occupied.crNo} • IPD: {occupied.ipdNo}</div>
                        <div style={{ fontSize: '0.75rem', fontStyle: 'italic', color: '#2563EB', marginTop: '2px' }}>
                          {occupied.diagnosis}
                        </div>

                        <button 
                          className="btn btn-secondary btn-sm" 
                          style={{ marginTop: '0.75rem', width: '100%' }}
                          onClick={() => setSelectedPatientForDischarge(occupied)}
                        >
                          <UserCheck size={14} /> Process Discharge
                        </button>
                      </div>
                    ) : (
                      <button 
                        className="btn btn-secondary btn-sm" 
                        style={{ marginTop: '0.5rem' }}
                        onClick={() => {
                          setFormData({ ...formData, bedCode: bed['BED CODE'], department: bed['DEPARTMENT'] });
                          setModalState('newIpd');
                        }}
                      >
                        Assign Bed
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Admissions Table */}
          <div className="card" style={{ padding: 0 }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #E2E8F0' }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#0F172A' }}>
                Active Admitted Patients Register ({activeAdmissions.length})
              </h2>
            </div>

            <div className="table-container" style={{ border: 'none' }}>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>BED</th>
                    <th>IPD NO</th>
                    <th>CR NO</th>
                    <th>PATIENT NAME</th>
                    <th>DEPARTMENT</th>
                    <th>DIAGNOSIS</th>
                    <th>ATTENDING DOCTOR</th>
                    <th>ADMIT DATE</th>
                    <th>DIET SCHEDULE</th>
                    <th>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {activeAdmissions.map((p) => (
                    <tr key={p.id}>
                      <td style={{ fontWeight: 800, color: '#2563EB' }}>{p.bedCode}</td>
                      <td style={{ fontWeight: 700 }}>{p.ipdNo}</td>
                      <td style={{ fontWeight: 700, color: '#0F766E' }}>{p.crNo}</td>
                      <td style={{ fontWeight: 700, color: '#0F172A' }}>{p.name} ({p.age}/{p.gender})</td>
                      <td><span className="badge badge-teal">{p.department}</span></td>
                      <td style={{ fontStyle: 'italic' }}>{p.diagnosis}</td>
                      <td>{p.doctor}</td>
                      <td style={{ fontSize: '0.8125rem' }}>{p.admitDate}</td>
                      <td>
                        <div style={{ fontSize: '0.75rem', color: '#475569' }}>
                          🥣 {p.diet?.noon || 'D-2 Pathya Ahaar'}
                        </div>
                      </td>
                      <td>
                        <button 
                          className="btn btn-secondary btn-sm"
                          onClick={() => setSelectedPatientForDischarge(p)}
                        >
                          Discharge
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* VIEW 2: IPD 3-SHIFT DIET REGISTER & SCHEDULER */}
      {activeSubTab === 'diet' && (
        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#78350F', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Utensils size={20} color="#D97706" /> Inpatient 3-Shift Diet Register & Scheduling
              </h2>
              <p style={{ fontSize: '0.8125rem', color: '#64748B', marginTop: '2px' }}>
                Track Morning (07:30 AM), Noon (12:30 PM), and Evening (06:30 PM) Ayurvedic Pathya Ahaar for admitted patients.
              </p>
            </div>
          </div>

          <div className="table-container" style={{ border: 'none' }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>BED CODE</th>
                  <th>IPD NO / CR NO</th>
                  <th>PATIENT NAME</th>
                  <th>DEPARTMENT</th>
                  <th>🌅 MORNING SHIFT (7:30 AM)</th>
                  <th>☀️ NOON SHIFT (12:30 PM)</th>
                  <th>🌙 EVENING SHIFT (6:30 PM)</th>
                  <th>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {activeAdmissions.map((p) => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 800, color: '#D97706' }}>{p.bedCode}</td>
                    <td style={{ fontSize: '0.8125rem', fontWeight: 700 }}>IPD: {p.ipdNo} | CR: {p.crNo}</td>
                    <td style={{ fontWeight: 700, color: '#0F172A' }}>{p.name} ({p.age}/{p.gender})</td>
                    <td><span className="badge badge-amber">{p.department}</span></td>
                    <td>
                      <span className="badge badge-teal" style={{ fontSize: '0.75rem' }}>
                        {p.diet?.morning || 'D-1 Herbal Tea / Milk'}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-blue" style={{ fontSize: '0.75rem' }}>
                        {p.diet?.noon || 'D-2 Pathya Kichadi with Ghee'}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-amber" style={{ fontSize: '0.75rem' }}>
                        {p.diet?.evening || 'D-3 Light Soup / Mudga Yusha'}
                      </span>
                    </td>
                    <td>
                      <button 
                        className="btn btn-amber btn-sm"
                        onClick={() => {
                          setSelectedPatientForDiet(p);
                          setDietForm(p.diet || {
                            morning: 'D-1 Herbal Tea / Milk',
                            noon: 'D-2 Pathya Kichadi with Ghee',
                            evening: 'D-3 Light Soup / Mudga Yusha'
                          });
                        }}
                      >
                        <Edit2 size={14} /> Update Plan
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Diet Plan Modal */}
      {selectedPatientForDiet && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '550px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#78350F', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Utensils size={22} color="#D97706" /> Schedule 3-Shift Diet for {selectedPatientForDiet.name}
              </h2>
              <button onClick={() => setSelectedPatientForDiet(null)} style={{ background: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleDietSubmit}>
              <div className="form-group">
                <label className="form-label">🌅 Morning Diet Shift (07:30 AM)</label>
                <input 
                  type="text" 
                  className="form-control" 
                  required 
                  value={dietForm.morning}
                  onChange={(e) => setDietForm({ ...dietForm, morning: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">☀️ Noon Lunch Diet Shift (12:30 PM)</label>
                <input 
                  type="text" 
                  className="form-control" 
                  required 
                  value={dietForm.noon}
                  onChange={(e) => setDietForm({ ...dietForm, noon: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">🌙 Evening Dinner Diet Shift (06:30 PM)</label>
                <input 
                  type="text" 
                  className="form-control" 
                  required 
                  value={dietForm.evening}
                  onChange={(e) => setDietForm({ ...dietForm, evening: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setSelectedPatientForDiet(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-amber">
                  Save Diet Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New IPD Admission Modal */}
      {modalState === 'newIpd' && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '650px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <BedDouble size={22} color="#2563EB" /> Inpatient (IPD) Bed Admission
              </h2>
              <button onClick={() => setModalState(null)} style={{ background: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAdmitSubmit}>
              {/* High-Performance Patient Search */}
              <div className="form-group" style={{ position: 'relative', marginBottom: '1.25rem' }}>
                <label className="form-label">Search Registered Patient (Name, CR No, OPD No - 28,281 Patients) *</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid #CBD5E1', borderRadius: '8px', padding: '0.5rem', backgroundColor: '#F8FAFC' }}>
                  <Search size={16} color="#2563EB" />
                  <input 
                    type="text"
                    className="form-control"
                    placeholder="Type Name, CR No or OPD No to search..."
                    value={opdSearch}
                    onFocus={() => setShowOpdSuggestions(true)}
                    onChange={(e) => {
                      setOpdSearch(e.target.value);
                      setShowOpdSuggestions(true);
                    }}
                    style={{ border: 'none', background: 'transparent' }}
                  />
                </div>

                {showOpdSuggestions && patientSuggestions.length > 0 && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.15)', zIndex: 100, maxHeight: '200px', overflowY: 'auto', marginTop: '0.25rem' }}>
                    {patientSuggestions.map(p => (
                      <div 
                        key={p.id}
                        onClick={() => handleSelectOpdPatient(p)}
                        style={{ padding: '0.625rem 0.875rem', cursor: 'pointer', borderBottom: '1px solid #F1F5F9', fontSize: '0.8125rem' }}
                        onMouseDown={(e) => e.preventDefault()}
                      >
                        <strong style={{ color: '#2563EB' }}>CR: {p.crNo}</strong> • {p.name} ({p.department})
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid-cols-2">
                <div className="form-group">
                  <label className="form-label">Patient Name *</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    required 
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">CR Number *</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    required 
                    value={formData.crNo}
                    onChange={(e) => setFormData({ ...formData, crNo: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid-cols-2">
                <div className="form-group">
                  <label className="form-label">Assign Bed Code *</label>
                  <select 
                    className="form-control"
                    value={formData.bedCode}
                    onChange={(e) => setFormData({ ...formData, bedCode: e.target.value })}
                  >
                    {beds.map(b => (
                      <option key={b['SR.NO.']} value={b['BED CODE']}>
                        {b['BED CODE']} - {b['DEPARTMENT']}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Attending Doctor *</label>
                  <select 
                    className="form-control"
                    value={formData.doctor}
                    onChange={(e) => setFormData({ ...formData, doctor: e.target.value })}
                  >
                    {doctors.map(d => (
                      <option key={d.ID} value={d.NAME}>{d.NAME} ({d.DEPARTMENT})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">IPD Clinical Diagnosis *</label>
                <input 
                  type="text" 
                  className="form-control" 
                  required 
                  placeholder="e.g. Pakshaghat, Sandhigat Vata, Dusta Vrana"
                  value={formData.diagnosis}
                  onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                />
              </div>

              <div className="grid-cols-2">
                <div className="form-group">
                  <label className="form-label">Estimated IPD Charge (₹)</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    value={formData.charge}
                    onChange={(e) => setFormData({ ...formData, charge: Number(e.target.value) })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Advance Paid Amount (₹)</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    value={formData.paid}
                    onChange={(e) => setFormData({ ...formData, paid: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setModalState(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Admit Patient to Ward Bed
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Discharge Modal */}
      {selectedPatientForDischarge && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#0F172A', marginBottom: '1rem' }}>
              Process Patient Discharge Summary
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#475569', marginBottom: '1rem' }}>
              Patient: <strong>{selectedPatientForDischarge.name}</strong> (CR: {selectedPatientForDischarge.crNo} | Bed: {selectedPatientForDischarge.bedCode})
            </p>

            <form onSubmit={handleDischargeSubmit}>
              <div className="form-group">
                <label className="form-label">Discharge Clinical Summary / Discharge Notes</label>
                <textarea 
                  className="form-control" 
                  rows={4}
                  required
                  placeholder="Enter condition at discharge, advice on discharge, chikitsa sutra..."
                  value={dischargeNotes}
                  onChange={(e) => setDischargeNotes(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setSelectedPatientForDischarge(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-danger">
                  Confirm Discharge & Vacate Bed
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
