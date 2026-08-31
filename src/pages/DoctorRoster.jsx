import React, { useState } from 'react';
import { Stethoscope, Search, Plus, Calendar, CheckCircle2, X } from 'lucide-react';
import { useHospital } from '../context/HospitalContext';

export const DoctorRoster = () => {
  const { doctors, addDoctor } = useHospital();
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    NAME: '',
    DESIGNATION: 'Assistant Professor',
    DEPARTMENT: 'KAYACHIKITSA',
    DAYS: 'Mon, Wed, Fri'
  });

  const filteredDoctors = doctors.filter(d => 
    (d.NAME || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (d.DEPARTMENT || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    addDoctor(formData);
    setShowModal(false);
    setFormData({ NAME: '', DESIGNATION: 'Assistant Professor', DEPARTMENT: 'KAYACHIKITSA', DAYS: 'Mon, Wed, Fri' });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Stethoscope color="#0F766E" size={26} /> Medical Faculty & Duty Roster ({doctors.length})
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.875rem' }}>
            Directory of 36 clinical consultants, professors, and duty schedules across all AYUSH specialties.
          </p>
        </div>

        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={18} /> Add New Doctor
        </button>
      </div>

      {/* Search Bar */}
      <div className="card" style={{ padding: '0.875rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <Search size={16} color="#64748B" />
        <input 
          type="text" 
          placeholder="Search 36 Medical Faculty by Doctor Name or Clinical Department..."
          className="form-control"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Doctor Profile Cards Grid */}
      <div className="grid-cols-3">
        {filteredDoctors.map((doc) => (
          <div key={doc.ID} className="card" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: '#F0FDF4',
              border: '2px solid #99F6E4',
              color: '#0F766E',
              fontWeight: 800,
              fontSize: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 6px rgba(15,118,110,0.15)'
            }}>
              {doc.NAME.replace('Dr.', '').replace('DR:', '').trim().slice(0, 2).toUpperCase()}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 800, fontSize: '0.9375rem', color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {doc.NAME}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>{doc.DESIGNATION || 'Clinical Consultant'}</div>
              <div style={{ marginTop: '0.375rem' }}>
                <span className="badge badge-teal" style={{ fontSize: '0.6875rem' }}>{doc.DEPARTMENT}</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#0F766E', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.375rem', marginTop: '0.5rem' }}>
                <Calendar size={12} /> Duty: {doc.DAYS || 'All OPD Days'}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 800 }}>Add Faculty Doctor</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Doctor Name *</label>
                <input 
                  type="text" 
                  className="form-control" 
                  required 
                  placeholder="e.g. Dr. Anand Sharma"
                  value={formData.NAME}
                  onChange={(e) => setFormData({ ...formData, NAME: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Designation *</label>
                <input 
                  type="text" 
                  className="form-control" 
                  required 
                  value={formData.DESIGNATION}
                  onChange={(e) => setFormData({ ...formData, DESIGNATION: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Department *</label>
                <select 
                  className="form-control" 
                  value={formData.DEPARTMENT}
                  onChange={(e) => setFormData({ ...formData, DEPARTMENT: e.target.value })}
                >
                  <option value="KAYACHIKITSA">KAYACHIKITSA</option>
                  <option value="PANCHAKARMA">PANCHAKARMA</option>
                  <option value="SHALYA TANTRA">SHALYA TANTRA</option>
                  <option value="SHALKYA TANTRA ENT">SHALKYA TANTRA ENT</option>
                  <option value="SHALKYA TANTRA NETRA">SHALKYA TANTRA NETRA</option>
                  <option value="STREE & PRASOOTI ROGA">STREE & PRASOOTI ROGA</option>
                  <option value="KAUMARBHRITYA">KAUMARBHRITYA</option>
                  <option value="SWASTHAVRITTA & YOGA">SWASTHAVRITTA & YOGA</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Doctor Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
