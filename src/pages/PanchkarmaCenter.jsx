import React, { useState, useMemo } from 'react';
import { Sparkles, Plus, Search, Calendar, User, Activity, X } from 'lucide-react';
import { useHospital } from '../context/HospitalContext';

const SNEHAN_OPTIONS = [
  '- None -',
  'Til Taila (Oleation 45 mins)',
  'Ksheerbala Taila Abhyanga',
  'Mahanarayana Taila Abhyanga',
  'Dhanwantharam Taila',
  'Brahmi Ghrita (Internal Snehan)',
  'Panchatikta Ghrita',
  'Murivenna Taila'
];

const SWEDAN_OPTIONS = [
  '- None -',
  'Nadi Sweda (Herbal Steam)',
  'Bashpa Sweda (Steam Chamber)',
  'Patra Pinda Sweda (PPS)',
  'Shashtika Shali Pinda Sweda (SSPS)',
  'Kati Vasti (Warm Oil Retention)',
  'Janu Vasti (Knee Joint Vasti)',
  'Greeva Vasti (Cervical Vasti)',
  'Uro Vasti (Cardiac Area)'
];

const SHIRODHARA_OPTIONS = [
  '- None -',
  'Ksheerbala Dhara (45 mins)',
  'Takra Dhara (Buttermilk Dhara 45 mins)',
  'Taila Dhara (Mahanarayana Taila)',
  'Kashaya Dhara (Herbal Decoction Dhara)',
  'Jala Dhara (Cold Water Dhara)',
  'Shirobasti (Oil Cap Retention)'
];

const NASHYA_OPTIONS = [
  '- None -',
  'Anu Taila (2 drops each nostril)',
  'Shadbindu Taila (4 drops each nostril)',
  'Ksheerbala 101 Taila',
  'Karpasasthiyadi Taila',
  'Kumkumadi Taila',
  'Marsha Nashya (4-8 drops)'
];

const BASTI_OPTIONS = [
  '- None -',
  'Matra Basti (Til Taila 60ml)',
  'Kashaya Basti (Niruha Basti 300ml)',
  'Ksheer Basti (Medicated Milk Basti)',
  'Anuvasana Basti (Dhanwantharam 100ml)',
  'Eranda Saptaka Basti'
];

export const PanchkarmaCenter = () => {
  const { panchkarmaLogs, addPanchkarmaLog, doctors, opdPatients } = useHospital();
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [opdSearch, setOpdSearch] = useState('');
  const [showOpdSuggestions, setShowOpdSuggestions] = useState(false);

  const [formData, setFormData] = useState({
    crNo: '',
    patientName: '',
    doctor: doctors[0]?.NAME || 'Dr. Prachi Choudhary',
    snehan: 'Til Taila (Oleation 45 mins)',
    swedan: 'Nadi Sweda (Herbal Steam)',
    shirodhara: 'Ksheerbala Dhara (45 mins)',
    nashya: 'Anu Taila (2 drops each nostril)',
    basti: 'Matra Basti (Til Taila 60ml)',
    vaman: '-',
    virechan: '-',
    raktmokshan: '-'
  });

  // Autocomplete Patient Suggestions (Up to 100 matching items across 28,281 patients)
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

  const handleSelectOpd = (p) => {
    setFormData({
      ...formData,
      crNo: p.crNo,
      patientName: p.name
    });
    setOpdSearch(`CR: ${p.crNo} - ${p.name}`);
    setShowOpdSuggestions(false);
  };

  const filteredLogs = useMemo(() => {
    if (!searchTerm.trim()) return panchkarmaLogs;
    const term = searchTerm.trim().toLowerCase();
    return panchkarmaLogs.filter(l => 
      (l.patientName && l.patientName.toLowerCase().includes(term)) ||
      (l.crNo && l.crNo.includes(term)) ||
      (l.doctor && l.doctor.toLowerCase().includes(term))
    );
  }, [panchkarmaLogs, searchTerm]);

  const handleSubmit = (e) => {
    e.preventDefault();
    addPanchkarmaLog({
      date: new Date().toISOString().split('T')[0],
      ...formData
    });
    setShowModal(false);
    setOpdSearch('');
    setShowOpdSuggestions(false);
    setFormData({
      crNo: '',
      patientName: '',
      doctor: doctors[0]?.NAME || 'Dr. Prachi Choudhary',
      snehan: 'Til Taila (Oleation 45 mins)',
      swedan: 'Nadi Sweda (Herbal Steam)',
      shirodhara: 'Ksheerbala Dhara (45 mins)',
      nashya: 'Anu Taila (2 drops each nostril)',
      basti: 'Matra Basti (Til Taila 60ml)',
      vaman: '-',
      virechan: '-',
      raktmokshan: '-'
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles color="#D97706" size={26} /> Panchkarma Specialty Therapy Register
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.875rem' }}>
            Log and manage Purvakarma & Pradhanakarma procedures (Snehan, Swedan, Shirodhara, Basti, Nashya, Vaman, Virechan, Raktmokshan).
          </p>
        </div>

        <button className="btn btn-amber" onClick={() => setShowModal(true)}>
          <Plus size={18} /> Log Panchkarma Therapy Procedure
        </button>
      </div>

      {/* Therapy Register Card */}
      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#0F172A' }}>
            Therapy Procedures Log ({filteredLogs.length})
          </h2>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#F8FAFC', padding: '0.4rem 0.75rem', borderRadius: '8px', border: '1px solid #CBD5E1', width: '280px' }}>
            <Search size={16} color="#64748B" />
            <input
              type="text"
              placeholder="Search Patient / CR No..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ border: 'none', background: 'transparent', width: '100%', fontSize: '0.8125rem' }}
            />
          </div>
        </div>

        <div className="table-container" style={{ border: 'none' }}>
          <table className="custom-table">
            <thead>
              <tr>
                <th>DATE</th>
                <th>CR NO</th>
                <th>PATIENT NAME</th>
                <th>ATTENDING DOCTOR</th>
                <th>SNEHAN (OLEATION)</th>
                <th>SWEDAN (SUDATION)</th>
                <th>SHIRODHARA</th>
                <th>BASTI / NASHYA</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map(log => (
                <tr key={log.id}>
                  <td>{log.date}</td>
                  <td style={{ fontWeight: 700, color: '#2563EB' }}>{log.crNo}</td>
                  <td style={{ fontWeight: 800, color: '#0F172A' }}>{log.patientName}</td>
                  <td style={{ fontSize: '0.8125rem', color: '#475569' }}>{log.doctor}</td>
                  <td><span className="badge badge-teal" style={{ fontSize: '0.75rem' }}>{log.snehan || '-'}</span></td>
                  <td><span className="badge badge-amber" style={{ fontSize: '0.75rem' }}>{log.swedan || '-'}</span></td>
                  <td><span className="badge badge-purple" style={{ fontSize: '0.75rem' }}>{log.shirodhara || '-'}</span></td>
                  <td style={{ fontSize: '0.8125rem' }}>
                    {log.basti !== '-' && <div style={{ color: '#0F766E', fontWeight: 600 }}>Basti: {log.basti}</div>}
                    {log.nashya !== '-' && <div style={{ color: '#7C3AED', fontWeight: 600 }}>Nashya: {log.nashya}</div>}
                    {log.basti === '-' && log.nashya === '-' && '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Therapy Modal with Dropdown Options */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '650px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Sparkles size={22} color="#D97706" /> Log Panchkarma Therapy Procedure
              </h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              {/* High-Performance Patient Search */}
              <div className="form-group" style={{ position: 'relative', marginBottom: '1.25rem' }}>
                <label className="form-label">Search Registered Patient (Name, CR No, OPD No - 28,281 Patients) *</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid #CBD5E1', borderRadius: '8px', padding: '0.5rem', backgroundColor: '#F8FAFC' }}>
                  <Search size={16} color="#D97706" />
                  <input 
                    type="text"
                    className="form-control"
                    placeholder="Type Name or CR Number to search..."
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
                        onClick={() => handleSelectOpd(p)}
                        style={{ padding: '0.625rem 0.875rem', cursor: 'pointer', borderBottom: '1px solid #F1F5F9', fontSize: '0.8125rem' }}
                        onMouseDown={(e) => e.preventDefault()}
                      >
                        <strong style={{ color: '#D97706' }}>CR: {p.crNo}</strong> • {p.name} ({p.department})
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
                    value={formData.patientName}
                    onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
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

              <div className="form-group">
                <label className="form-label">Attending Panchkarma Physician</label>
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

              {/* PANCHKARMA PROCEDURE DROPDOWN OPTIONS */}
              <div className="grid-cols-2">
                <div className="form-group">
                  <label className="form-label">Snehan (Oleation Therapy)</label>
                  <select 
                    className="form-control"
                    value={formData.snehan}
                    onChange={(e) => setFormData({ ...formData, snehan: e.target.value })}
                  >
                    {SNEHAN_OPTIONS.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Swedan (Sudation Therapy)</label>
                  <select 
                    className="form-control"
                    value={formData.swedan}
                    onChange={(e) => setFormData({ ...formData, swedan: e.target.value })}
                  >
                    {SWEDAN_OPTIONS.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid-cols-2">
                <div className="form-group">
                  <label className="form-label">Shirodhara Stream</label>
                  <select 
                    className="form-control"
                    value={formData.shirodhara}
                    onChange={(e) => setFormData({ ...formData, shirodhara: e.target.value })}
                  >
                    {SHIRODHARA_OPTIONS.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Nashya Karma</label>
                  <select 
                    className="form-control"
                    value={formData.nashya}
                    onChange={(e) => setFormData({ ...formData, nashya: e.target.value })}
                  >
                    {NASHYA_OPTIONS.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Basti Karma (Enema Therapy)</label>
                <select 
                  className="form-control"
                  value={formData.basti}
                  onChange={(e) => setFormData({ ...formData, basti: e.target.value })}
                >
                  {BASTI_OPTIONS.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-amber">
                  Save Therapy Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
