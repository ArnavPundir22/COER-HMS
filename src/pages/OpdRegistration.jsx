import React, { useState, useMemo } from 'react';
import { UserPlus, Printer, Search, Plus, Filter, X, Eye, Edit2, Trash2, ChevronLeft, ChevronRight, CheckCircle2, RotateCcw, ArrowUpDown, RefreshCw, Calendar } from 'lucide-react';
import { useHospital } from '../context/HospitalContext';

export const OpdRegistration = ({ modalState, setModalState }) => {
  const { opdPatients, addOpdPatient, updateOpdPatient, deleteOpdPatient, resetOpdDataset, doctors } = useHospital();

  // Search, Filter & Sort States
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [genderFilter, setGenderFilter] = useState('');
  const [regTypeFilter, setRegTypeFilter] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [sortBy, setSortBy] = useState('SHEET_ORDER');

  const [selectedPatientForPrint, setSelectedPatientForPrint] = useState(null);
  const [selectedPatientForDetails, setSelectedPatientForDetails] = useState(null);
  const [selectedPatientForEdit, setSelectedPatientForEdit] = useState(null);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  // Returning Patient Lookup (oldcrnosearch)
  const [oldCrSearch, setOldCrSearch] = useState('');

  // Form States
  const [formData, setFormData] = useState({
    crNo: '',
    opdNo: '',
    name: '',
    age: '',
    gender: 'MALE',
    address: '',
    phone: '',
    mobile: '',
    aadhaar: '',
    department: 'KAYACHIKITSA',
    deptCode: 'KC/OPD',
    doctor: 'Dr. Ravi Joshi',
    diagnosis: '',
    charge: 100,
    discount: 0,
    received: 100,
    regType: 'NEW'
  });

  const [editFormData, setEditFormData] = useState({
    id: '',
    crNo: '',
    opdNo: '',
    name: '',
    age: '',
    gender: 'MALE',
    address: '',
    phone: '',
    mobile: '',
    aadhaar: '',
    department: 'KAYACHIKITSA',
    deptOpdNo: 'KC/OPD',
    doctor: 'Dr. Ravi Joshi',
    diagnosis: '',
    regType: 'NEW'
  });

  // Extract distinct departments & department counts dynamically based on date filter
  const dateFilteredPatients = useMemo(() => {
    return opdPatients.filter(p => {
      if (fromDate && p.date && p.date < fromDate) return false;
      if (toDate && p.date && p.date > toDate) return false;
      return true;
    });
  }, [opdPatients, fromDate, toDate]);

  const departmentCounts = useMemo(() => {
    const counts = {};
    dateFilteredPatients.forEach(p => {
      const dept = (p.department || 'OTHER').trim().toUpperCase();
      counts[dept] = (counts[dept] || 0) + 1;
    });
    return counts;
  }, [dateFilteredPatients]);

  const availableDepartments = useMemo(() => {
    return Object.keys(departmentCounts).sort();
  }, [dateFilteredPatients]);

  const handleOldCrSearch = (cr) => {
    setOldCrSearch(cr);
    const existing = opdPatients.find(p => p.crNo === cr || p.opdNo === cr);
    if (existing) {
      setFormData({
        ...formData,
        crNo: existing.crNo,
        opdNo: existing.opdNo,
        name: existing.name,
        age: existing.age,
        gender: existing.gender,
        address: existing.address,
        department: existing.department || 'KAYACHIKITSA',
        diagnosis: existing.diagnosis || '',
        regType: 'OLD'
      });
    }
  };

  const handleDeptChange = (dept, isEdit = false) => {
    let code = 'OPD';
    switch (dept) {
      case 'KAYACHIKITSA': code = 'KC/OPD'; break;
      case 'PANCHAKARMA': code = 'PK/OPD'; break;
      case 'SHALYA TANTRA': code = 'ST/OPD'; break;
      case 'SHALKYA TANTRA ENT': code = 'SKT ENT/OPD'; break;
      case 'SHALKYA TANTRA NETRA': code = 'SKT EYE/OPD'; break;
      case 'STREE & PRASOOTI ROGA': code = 'PTSR/OPD'; break;
      case 'KAUMARBHRITYA': code = 'KB/OPD'; break;
      case 'SWASTHAVRITTA & YOGA': code = 'SW/OPD'; break;
      case 'AATYAYIKA': code = 'EM/OPD'; break;
      case 'AGAD TANTRA': code = 'AG/OPD'; break;
      default: code = 'OPD';
    }
    if (isEdit) {
      setEditFormData({ ...editFormData, department: dept, deptOpdNo: code });
    } else {
      setFormData({ ...formData, department: dept, deptCode: code });
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setDeptFilter('');
    setGenderFilter('');
    setRegTypeFilter('');
    setFromDate('');
    setToDate('');
    setSortBy('SHEET_ORDER');
    setCurrentPage(1);
  };

  const handleNewSubmit = (e) => {
    e.preventDefault();
    const created = addOpdPatient(formData);
    setModalState(null);
    setSelectedPatientForPrint(created);
    setFormData({
      crNo: '',
      opdNo: '',
      name: '',
      age: '',
      gender: 'MALE',
      address: '',
      aadhaar: '',
      department: 'KAYACHIKITSA',
      deptCode: 'KC/OPD',
      doctor: 'Dr. Ravi Joshi',
      diagnosis: '',
      charge: 100,
      discount: 0,
      received: 100,
      regType: 'NEW'
    });
    setOldCrSearch('');
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (selectedPatientForEdit) {
      updateOpdPatient(selectedPatientForEdit.id, editFormData);
      setSelectedPatientForEdit(null);
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 3000);
    }
  };

  const openEditModal = (patient) => {
    setSelectedPatientForEdit(patient);
    setEditFormData({
      id: patient.id,
      crNo: patient.crNo || '',
      opdNo: patient.opdNo || '',
      name: patient.name || '',
      age: patient.age || '',
      gender: patient.gender || 'MALE',
      address: patient.address || '',
      aadhaar: patient.aadhaar || '',
      department: patient.department || 'KAYACHIKITSA',
      deptOpdNo: patient.deptOpdNo || 'KC/OPD',
      doctor: patient.doctor || 'Dr. Ravi Joshi',
      diagnosis: patient.diagnosis || '',
      regType: patient.regType || 'NEW'
    });
  };

  const handleDelete = (patient) => {
    if (window.confirm(`Are you sure you want to delete OPD Patient record for "${patient.name}" (CR: ${patient.crNo})?`)) {
      deleteOpdPatient(patient.id);
    }
  };

  // High Performance Multi-Option Filtering
  const filteredPatients = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const targetDept = deptFilter.trim().toUpperCase();
    const targetGender = genderFilter.trim().toUpperCase();
    const targetRegType = regTypeFilter.trim().toUpperCase();

    return dateFilteredPatients.filter(p => {
      // Search term matching
      if (term) {
        const matchSearch = 
          (p.name && p.name.toLowerCase().includes(term)) || 
          (p.crNo && p.crNo.includes(term)) || 
          (p.opdNo && p.opdNo.includes(term)) ||
          (p.deptOpdNo && p.deptOpdNo.toLowerCase().includes(term)) ||
          (p.address && p.address.toLowerCase().includes(term)) ||
          (p.diagnosis && p.diagnosis.toLowerCase().includes(term));
        if (!matchSearch) return false;
      }

      // Department matching
      if (targetDept) {
        const pDept = (p.department || '').trim().toUpperCase();
        if (pDept !== targetDept) return false;
      }

      // Gender matching
      if (targetGender) {
        const pGender = (p.gender || '').trim().toUpperCase();
        if (targetGender === 'MALE' && !pGender.startsWith('M')) return false;
        if (targetGender === 'FEMALE' && !pGender.startsWith('F')) return false;
        if (targetGender === 'OTHER' && (pGender.startsWith('M') || pGender.startsWith('F'))) return false;
      }

      // Reg Type matching
      if (targetRegType) {
        const pReg = (p.regType || '').trim().toUpperCase();
        if (pReg !== targetRegType) return false;
      }

      return true;
    });
  }, [dateFilteredPatients, searchTerm, deptFilter, genderFilter, regTypeFilter]);

  // Sorting Logic
  const sortedPatients = useMemo(() => {
    if (sortBy === 'SHEET_ORDER') return filteredPatients;
    
    return [...filteredPatients].sort((a, b) => {
      if (sortBy === 'NAME_ASC') return (a.name || '').localeCompare(b.name || '');
      if (sortBy === 'NAME_DESC') return (b.name || '').localeCompare(a.name || '');
      if (sortBy === 'CR_DESC') return (parseInt(b.crNo, 10) || 0) - (parseInt(a.crNo, 10) || 0);
      if (sortBy === 'CR_ASC') return (parseInt(a.crNo, 10) || 0) - (parseInt(b.crNo, 10) || 0);
      return 0;
    });
  }, [filteredPatients, sortBy]);

  // High Performance Pagination
  const totalItems = sortedPatients.length;
  const effectivePerPage = itemsPerPage === 'ALL' ? 500 : Number(itemsPerPage);
  const totalPages = Math.ceil(totalItems / effectivePerPage) || 1;
  const startIndex = (currentPage - 1) * effectivePerPage;
  const endIndex = Math.min(startIndex + effectivePerPage, totalItems);
  const currentRecords = sortedPatients.slice(startIndex, endIndex);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Header & Primary Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }} className="no-print">
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A' }}>
            OPD Patient Registration
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.875rem' }}>
            Showing <strong>{totalItems.toLocaleString('en-IN')} Filtered Patients</strong> in Data Sheet Sequence • Active Archive: <strong>{opdPatients.length.toLocaleString('en-IN')} Patients</strong>
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {updateSuccess && (
            <span className="badge badge-success" style={{ display: 'flex', gap: '0.25rem', alignItems: 'center', padding: '0.5rem 0.75rem' }}>
              <CheckCircle2 size={14} /> Record Updated!
            </span>
          )}
          <button className="btn btn-secondary" onClick={resetOpdDataset}>
            <RotateCcw size={16} /> Sync Master Database
          </button>
          <button className="btn btn-primary" onClick={() => setModalState('newOpd')}>
            <Plus size={18} /> New OPD Entry
          </button>
        </div>
      </div>

      {/* MULTI-OPTION FIND, FILTER & SORT TOOLBAR */}
      <div className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* Row 1: Search & Sort Order */}
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Instant Search Bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: '300px', backgroundColor: '#F8FAFC', padding: '0.5rem 0.875rem', borderRadius: '10px', border: '1px solid #CBD5E1' }}>
            <Search size={18} color="#0F766E" />
            <input
              type="text"
              placeholder="Search Name, CR No, OPD No, Dept Code, Address, Diagnosis..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              style={{ border: 'none', background: 'transparent', width: '100%', fontSize: '0.875rem', color: '#0F172A', fontWeight: 600 }}
            />
          </div>

          {/* Sort By Order Control */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#F0FDF4', padding: '0.4rem 0.875rem', borderRadius: '10px', border: '1px solid #99F6E4' }}>
            <ArrowUpDown size={16} color="#0F766E" />
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#0F766E' }}>Sort Order:</span>
            <select 
              className="form-control"
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setCurrentPage(1);
              }}
              style={{ border: 'none', background: 'transparent', fontWeight: 700, color: '#0F766E', padding: '0.2rem' }}
            >
              <option value="SHEET_ORDER">📄 Data Sheet Sequence</option>
              <option value="NAME_ASC">🔤 Patient Name: A to Z</option>
              <option value="NAME_DESC">🔠 Patient Name: Z to A</option>
              <option value="CR_DESC">🔢 CR Number: High to Low</option>
              <option value="CR_ASC">🔢 CR Number: Low to High</option>
            </select>
          </div>
        </div>

        {/* Row 2: Filter Selectors with Date Range */}
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap', fontSize: '0.8125rem' }}>
          {/* Date Range Pickers */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', backgroundColor: '#F8FAFC', padding: '0.25rem 0.5rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
            <Calendar size={14} color="#0F766E" />
            <span style={{ fontWeight: 700, color: '#475569' }}>From:</span>
            <input 
              type="date" 
              className="form-control"
              value={fromDate}
              onChange={(e) => {
                setFromDate(e.target.value);
                setCurrentPage(1);
              }}
              style={{ width: '130px', padding: '0.25rem', fontSize: '0.75rem' }}
            />
            <span style={{ fontWeight: 700, color: '#475569' }}>To:</span>
            <input 
              type="date" 
              className="form-control"
              value={toDate}
              onChange={(e) => {
                setToDate(e.target.value);
                setCurrentPage(1);
              }}
              style={{ width: '130px', padding: '0.25rem', fontSize: '0.75rem' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <Filter size={14} color="#64748B" />
            <span style={{ fontWeight: 700, color: '#475569' }}>Dept:</span>
            <select 
              className="form-control" 
              value={deptFilter} 
              onChange={(e) => {
                setDeptFilter(e.target.value);
                setCurrentPage(1);
              }}
              style={{ minWidth: '220px', padding: '0.4rem', fontWeight: 600 }}
            >
              <option value="">All Departments ({dateFilteredPatients.length.toLocaleString('en-IN')})</option>
              {availableDepartments.map(dept => (
                <option key={dept} value={dept}>{dept} ({departmentCounts[dept].toLocaleString('en-IN')})</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <span style={{ fontWeight: 700, color: '#475569' }}>Gender:</span>
            <select 
              className="form-control" 
              value={genderFilter} 
              onChange={(e) => {
                setGenderFilter(e.target.value);
                setCurrentPage(1);
              }}
              style={{ width: '120px', padding: '0.4rem', fontWeight: 600 }}
            >
              <option value="">All Genders</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <span style={{ fontWeight: 700, color: '#475569' }}>Reg Type:</span>
            <select 
              className="form-control" 
              value={regTypeFilter} 
              onChange={(e) => {
                setRegTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
              style={{ width: '130px', padding: '0.4rem', fontWeight: 600 }}
            >
              <option value="">All Types</option>
              <option value="NEW">NEW Reg</option>
              <option value="OLD">OLD / Returning</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <span style={{ fontWeight: 700, color: '#475569' }}>Per Page:</span>
            <select 
              className="form-control"
              value={itemsPerPage}
              onChange={(e) => {
                const val = e.target.value === 'ALL' ? 'ALL' : Number(e.target.value);
                setItemsPerPage(val);
                setCurrentPage(1);
              }}
              style={{ width: '90px', padding: '0.4rem', fontWeight: 600 }}
            >
              <option value={15}>15</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={250}>250</option>
              <option value={500}>500</option>
              <option value="ALL">Max 500</option>
            </select>
          </div>

          {(searchTerm || deptFilter || genderFilter || regTypeFilter || fromDate || toDate || sortBy !== 'SHEET_ORDER') && (
            <button className="btn btn-secondary btn-sm" onClick={resetFilters} style={{ marginLeft: 'auto', color: '#DC2626' }}>
              <RefreshCw size={12} /> Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Patient Register Table */}
      <div className="card" style={{ padding: 0 }}>
        <div className="table-container" style={{ border: 'none' }}>
          <table className="custom-table">
            <thead>
              <tr>
                <th>CR NO</th>
                <th>OPD NO</th>
                <th>DEPT CODE</th>
                <th>REG DATE & TIME</th>
                <th>PATIENT NAME</th>
                <th>AGE/GENDER</th>
                <th>ADDRESS</th>
                <th>DEPARTMENT</th>
                <th>DIAGNOSIS</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {currentRecords.map((p) => (
                <tr key={p.id}>
                  <td style={{ fontWeight: 800, color: '#0F766E' }}>{p.crNo}</td>
                  <td style={{ fontWeight: 800, color: '#2563EB' }}>{p.opdNo || p.crNo}</td>
                  <td><span className="badge badge-info">{p.deptOpdNo || 'KC/OPD'}</span></td>
                  <td style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#334155', whiteSpace: 'nowrap' }}>
                    {p.regDate || p.date || '2026-08-26'}
                  </td>
                  <td 
                    onClick={() => setSelectedPatientForDetails(p)}
                    style={{ fontWeight: 700, color: '#0F766E', textDecoration: 'underline', cursor: 'pointer' }}
                    title="Click to view full patient details"
                  >
                    {p.name}
                  </td>
                  <td>{p.age} Yrs / {p.gender}</td>
                  <td style={{ fontSize: '0.8125rem', color: '#475569' }}>{p.address}</td>
                  <td><span className="badge badge-teal">{p.department}</span></td>
                  <td style={{ fontStyle: 'italic', fontWeight: 600 }}>{p.diagnosis || 'Kayachikitsa'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.375rem' }}>
                      <button 
                        className="btn btn-secondary btn-sm"
                        title="View Details"
                        onClick={() => setSelectedPatientForDetails(p)}
                      >
                        <Eye size={14} />
                      </button>
                      <button 
                        className="btn btn-amber btn-sm"
                        title="Edit Record"
                        onClick={() => openEditModal(p)}
                      >
                        <Edit2 size={14} /> Edit
                      </button>
                      <button 
                        className="btn btn-danger btn-sm"
                        title="Delete Record"
                        onClick={() => handleDelete(p)}
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                      <button 
                        className="btn btn-primary btn-sm"
                        title="Print Ticket"
                        onClick={() => setSelectedPatientForPrint(p)}
                      >
                        <Printer size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="pagination-bar">
          <div>
            Showing <strong>{totalItems > 0 ? startIndex + 1 : 0}</strong> to <strong>{endIndex}</strong> of <strong>{totalItems.toLocaleString('en-IN')} OPD Patient Records</strong>
          </div>

          {totalPages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button 
                className="btn btn-secondary btn-sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              >
                <ChevronLeft size={16} /> Prev
              </button>

              <span style={{ fontSize: '0.8125rem', fontWeight: 700, padding: '0 0.5rem' }}>
                Page {currentPage} of {totalPages}
              </span>

              <button 
                className="btn btn-secondary btn-sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* NEW OPD REGISTRATION MODAL */}
      {modalState === 'newOpd' && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '700px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <UserPlus size={22} color="#0F766E" /> OPD Patient Registration
              </h2>
              <button onClick={() => setModalState(null)} style={{ background: 'none', cursor: 'pointer', color: '#64748B' }}>
                <X size={20} />
              </button>
            </div>

            {/* Returning Patient Lookup bar */}
            <div style={{ padding: '0.75rem', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0', marginBottom: '1.25rem' }}>
              <label className="form-label" style={{ color: '#0F766E' }}>Returning Patient Lookup</label>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Enter Existing CR Number or OPD Number to Auto-Fill..."
                  value={oldCrSearch}
                  onChange={(e) => handleOldCrSearch(e.target.value)}
                />
              </div>
            </div>

            <form onSubmit={handleNewSubmit}>
              <div className="grid-cols-2">
                <div className="form-group">
                  <label className="form-label">Patient Name *</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    required 
                    placeholder="Enter full name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Age *</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    required 
                    placeholder="e.g. 35"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Gender *</label>
                  <select 
                    className="form-control" 
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Registration Type</label>
                  <select 
                    className="form-control" 
                    value={formData.regType}
                    onChange={(e) => setFormData({ ...formData, regType: e.target.value })}
                  >
                    <option value="NEW">NEW Registration</option>
                    <option value="OLD">OLD / Returning</option>
                  </select>
                </div>
              </div>

              <div className="grid-cols-2">
                <div className="form-group">
                  <label className="form-label">Mobile / Contact Number</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="e.g. +91 9876543210"
                    value={formData.phone || formData.mobile || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value, mobile: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Residential Address *</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    required 
                    placeholder="Street, City, District"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid-cols-2">
                <div className="form-group">
                  <label className="form-label">Department *</label>
                  <select 
                    className="form-control" 
                    value={formData.department}
                    onChange={(e) => handleDeptChange(e.target.value)}
                  >
                    <option value="KAYACHIKITSA">KAYACHIKITSA (Internal Medicine)</option>
                    <option value="PANCHAKARMA">PANCHAKARMA (Detoxification)</option>
                    <option value="SHALYA TANTRA">SHALYA TANTRA (General Surgery)</option>
                    <option value="SHALKYA TANTRA ENT">SHALKYA TANTRA ENT</option>
                    <option value="SHALKYA TANTRA NETRA">SHALKYA TANTRA NETRA (Eye)</option>
                    <option value="STREE & PRASOOTI ROGA">STREE & PRASOOTI ROGA (Gynae)</option>
                    <option value="KAUMARBHRITYA">KAUMARBHRITYA (Pediatrics)</option>
                    <option value="SWASTHAVRITTA & YOGA">SWASTHAVRITTA & YOGA</option>
                    <option value="AATYAYIKA">AATYAYIKA (Casualty)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Mapped Dept Code</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={formData.deptCode}
                    readOnly
                    style={{ backgroundColor: '#F1F5F9', fontWeight: 700, color: '#0F766E' }}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Attending Doctor</label>
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

              <div className="form-group">
                <label className="form-label">Clinical Diagnosis</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="e.g. Pakshaghat, Sandhigat Vata, Pratishyay"
                  value={formData.diagnosis}
                  onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                />
              </div>

              <div className="grid-cols-2" style={{ marginTop: '0.5rem' }}>
                <div className="form-group">
                  <label className="form-label">Registration Charge (₹)</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    value={formData.charge}
                    onChange={(e) => setFormData({ ...formData, charge: Number(e.target.value) })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Received Amount (₹)</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    value={formData.received}
                    onChange={(e) => setFormData({ ...formData, received: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setModalState(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save & Issue Casesheet Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT PATIENT MODAL */}
      {selectedPatientForEdit && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '650px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid #E2E8F0' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#D97706', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Edit2 size={22} color="#D97706" /> Edit Patient Record
              </h2>
              <button onClick={() => setSelectedPatientForEdit(null)} style={{ background: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit}>
              <div className="grid-cols-2">
                <div className="form-group">
                  <label className="form-label">CR Number *</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    required 
                    value={editFormData.crNo}
                    onChange={(e) => setEditFormData({ ...editFormData, crNo: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">OPD Number *</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    required 
                    value={editFormData.opdNo}
                    onChange={(e) => setEditFormData({ ...editFormData, opdNo: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid-cols-2">
                <div className="form-group">
                  <label className="form-label">Patient Name *</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    required 
                    value={editFormData.name}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Age *</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    required 
                    value={editFormData.age}
                    onChange={(e) => setEditFormData({ ...editFormData, age: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid-cols-2">
                <div className="form-group">
                  <label className="form-label">Gender *</label>
                  <select 
                    className="form-control" 
                    value={editFormData.gender}
                    onChange={(e) => setEditFormData({ ...editFormData, gender: e.target.value })}
                  >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Registration Type</label>
                  <select 
                    className="form-control" 
                    value={editFormData.regType}
                    onChange={(e) => setEditFormData({ ...editFormData, regType: e.target.value })}
                  >
                    <option value="NEW">NEW Registration</option>
                    <option value="OLD">OLD / Returning</option>
                  </select>
                </div>
              </div>

              <div className="grid-cols-2">
                <div className="form-group">
                  <label className="form-label">Mobile / Contact Number</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="e.g. +91 9876543210"
                    value={editFormData.phone || editFormData.mobile || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value, mobile: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Residential Address *</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    required 
                    value={editFormData.address}
                    onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid-cols-2">
                <div className="form-group">
                  <label className="form-label">Department *</label>
                  <select 
                    className="form-control" 
                    value={editFormData.department}
                    onChange={(e) => handleDeptChange(e.target.value, true)}
                  >
                    <option value="KAYACHIKITSA">KAYACHIKITSA</option>
                    <option value="PANCHAKARMA">PANCHAKARMA</option>
                    <option value="SHALYA TANTRA">SHALYA TANTRA</option>
                    <option value="SHALKYA TANTRA ENT">SHALKYA TANTRA ENT</option>
                    <option value="SHALKYA TANTRA NETRA">SHALKYA TANTRA NETRA</option>
                    <option value="STREE & PRASOOTI ROGA">STREE & PRASOOTI ROGA</option>
                    <option value="KAUMARBHRITYA">KAUMARBHRITYA</option>
                    <option value="SWASTHAVRITTA & YOGA">SWASTHAVRITTA & YOGA</option>
                    <option value="AATYAYIKA">AATYAYIKA</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Dept OPD Code</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={editFormData.deptOpdNo}
                    onChange={(e) => setEditFormData({ ...editFormData, deptOpdNo: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Attending Doctor</label>
                <select 
                  className="form-control" 
                  value={editFormData.doctor}
                  onChange={(e) => setEditFormData({ ...editFormData, doctor: e.target.value })}
                >
                  {doctors.map(d => (
                    <option key={d.ID} value={d.NAME}>{d.NAME} ({d.DEPARTMENT})</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Clinical Diagnosis</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={editFormData.diagnosis}
                  onChange={(e) => setEditFormData({ ...editFormData, diagnosis: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setSelectedPatientForEdit(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-amber">
                  Update Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Patient Details Modal */}
      {selectedPatientForDetails && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '600px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid #E2E8F0' }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A' }}>{selectedPatientForDetails.name}</h2>
                <div style={{ fontSize: '0.75rem', color: '#64748B' }}>CR Number: {selectedPatientForDetails.crNo} | OPD Number: {selectedPatientForDetails.opdNo || selectedPatientForDetails.crNo}</div>
              </div>
              <button onClick={() => setSelectedPatientForDetails(null)} style={{ background: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
              <div style={{ padding: '0.75rem', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700 }}>CENTRAL REGISTRATION NO</div>
                <div style={{ fontSize: '1.125rem', fontWeight: 800, color: '#0F766E' }}>{selectedPatientForDetails.crNo}</div>
              </div>

              <div style={{ padding: '0.75rem', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700 }}>ANNUAL OPD NO</div>
                <div style={{ fontSize: '1.125rem', fontWeight: 800, color: '#2563EB' }}>{selectedPatientForDetails.opdNo || selectedPatientForDetails.crNo}</div>
              </div>

              <div><strong>Dept OPD Code:</strong> {selectedPatientForDetails.deptOpdNo || '4779'}</div>
              <div><strong>Registration Type:</strong> <span className="badge badge-teal">{selectedPatientForDetails.regType || 'NEW'}</span></div>
              <div><strong>Age / Gender:</strong> {selectedPatientForDetails.age} Yrs / {selectedPatientForDetails.gender}</div>
              <div style={{ gridColumn: 'span 2' }}><strong>Address:</strong> {selectedPatientForDetails.address}</div>
              <div><strong>Clinical Department:</strong> <span className="badge badge-amber">{selectedPatientForDetails.department}</span></div>
              <div><strong>Attending Doctor:</strong> {selectedPatientForDetails.doctor || 'Dr. Ravi Joshi'}</div>
              <div style={{ gridColumn: 'span 2', padding: '0.75rem', backgroundColor: '#F0FDF4', borderRadius: '8px', border: '1px solid #99F6E4' }}>
                <strong style={{ color: '#0F766E' }}>Ayurvedic Diagnosis / Condition:</strong>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: '#042F2C', marginTop: '0.25rem' }}>
                  {selectedPatientForDetails.diagnosis || 'Kayachikitsa General'}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button 
                className="btn btn-amber"
                onClick={() => {
                  const p = selectedPatientForDetails;
                  setSelectedPatientForDetails(null);
                  openEditModal(p);
                }}
              >
                <Edit2 size={16} /> Edit Patient Record
              </button>
              <button 
                className="btn btn-danger"
                onClick={() => {
                  const p = selectedPatientForDetails;
                  setSelectedPatientForDetails(null);
                  handleDelete(p);
                }}
              >
                <Trash2 size={16} /> Delete Record
              </button>
              <button className="btn btn-secondary" onClick={() => setSelectedPatientForDetails(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Printable OPD Casesheet Ticket Modal */}
      {selectedPatientForPrint && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '750px', maxHeight: '88vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }} className="no-print">
              <h3 style={{ fontSize: '1.125rem', fontWeight: 800 }}>OPD Casesheet & Prescription Ticket</h3>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="btn btn-primary btn-sm" onClick={() => window.print()}>
                  <Printer size={14} /> Print Ticket
                </button>
                <button className="btn btn-secondary btn-sm" onClick={() => setSelectedPatientForPrint(null)}>
                  Close
                </button>
              </div>
            </div>

            <div id="printable-area" style={{ padding: '1.25rem 1.5rem', backgroundColor: '#FFFFFF', border: '2px solid #0F766E', borderRadius: '12px', color: '#0F172A' }}>
              {/* Executive Header Banner */}
              <div style={{ textAlign: 'center', borderBottom: '3px double #0F766E', paddingBottom: '0.625rem', marginBottom: '0.875rem' }}>
                <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#0F766E', letterSpacing: '-0.01em' }}>
                  COER MEDICAL COLLEGE OF AYURVEDA AND HOSPITAL
                </div>
                <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#334155', marginTop: '1px' }}>
                  Vardhman Puram, 7km Roorkee-Haridwar Road, Roorkee, Uttarakhand 247667 • Ph: +91-9027916039
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '1px' }}>
                  Recognized by NCISM & Ministry of AYUSH, Govt. of India • Affiliated to UAU Dehradun
                </div>
                <div style={{ fontSize: '0.875rem', fontWeight: 800, color: '#D97706', marginTop: '0.375rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  OUTPATIENT DEPARTMENT (OPD) CASESHEET & PRESCRIPTION TICKET
                </div>
              </div>

              {/* Patient Demographics Key-Value Table */}
              <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '8px', padding: '0.625rem 0.875rem', marginBottom: '0.875rem' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
                  <tbody>
                    <tr>
                      <td style={{ padding: '0.25rem 0.5rem', width: '18%', fontWeight: 700, color: '#475569' }}>CR Number:</td>
                      <td style={{ padding: '0.25rem 0.5rem', width: '32%', fontWeight: 900, color: '#0F766E' }}>
                        {selectedPatientForPrint.crNo}
                      </td>
                      <td style={{ padding: '0.25rem 0.5rem', width: '18%', fontWeight: 700, color: '#475569' }}>Annual OPD No:</td>
                      <td style={{ padding: '0.25rem 0.5rem', width: '32%', fontWeight: 900, color: '#2563EB' }}>
                        {selectedPatientForPrint.opdNo || selectedPatientForPrint.crNo}
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: '0.25rem 0.5rem', fontWeight: 700, color: '#475569' }}>Patient Name:</td>
                      <td style={{ padding: '0.25rem 0.5rem', fontWeight: 900, color: '#0F172A', textTransform: 'uppercase' }}>
                        {selectedPatientForPrint.name}
                      </td>
                      <td style={{ padding: '0.25rem 0.5rem', fontWeight: 700, color: '#475569' }}>Dept Code:</td>
                      <td style={{ padding: '0.25rem 0.5rem', fontWeight: 800, color: '#D97706' }}>
                        {selectedPatientForPrint.deptOpdNo || 'KC/OPD'}
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: '0.25rem 0.5rem', fontWeight: 700, color: '#475569' }}>Age / Gender:</td>
                      <td style={{ padding: '0.25rem 0.5rem', fontWeight: 700 }}>
                        {selectedPatientForPrint.age} Yrs / {selectedPatientForPrint.gender}
                      </td>
                      <td style={{ padding: '0.25rem 0.5rem', fontWeight: 700, color: '#475569' }}>Department:</td>
                      <td style={{ padding: '0.25rem 0.5rem', fontWeight: 800, color: '#0F766E' }}>
                        {selectedPatientForPrint.department}
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: '0.25rem 0.5rem', fontWeight: 700, color: '#475569' }}>Address:</td>
                      <td style={{ padding: '0.25rem 0.5rem', fontWeight: 600 }}>
                        {selectedPatientForPrint.address || 'Roorkee'}
                      </td>
                      <td style={{ padding: '0.25rem 0.5rem', fontWeight: 700, color: '#475569' }}>Doctor:</td>
                      <td style={{ padding: '0.25rem 0.5rem', fontWeight: 700 }}>
                        {selectedPatientForPrint.doctor || 'Dr. Ravi Joshi'}
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: '0.25rem 0.5rem', fontWeight: 700, color: '#475569' }}>Nidana / Diagnosis:</td>
                      <td colSpan={3} style={{ padding: '0.25rem 0.5rem', fontWeight: 800, color: '#2563EB', fontStyle: 'italic' }}>
                        {selectedPatientForPrint.diagnosis || 'General OPD Examination & Chikitsa'}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Ashtavidha Pariksha & Clinical Examination Summary */}
              <div style={{ border: '1px solid #CBD5E1', borderRadius: '8px', padding: '0.625rem 0.875rem', backgroundColor: '#FFFFFF', marginBottom: '0.875rem', fontSize: '0.8125rem' }}>
                <div style={{ fontWeight: 800, color: '#0F766E', marginBottom: '0.25rem', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  ASHTAVIDHA PARIKSHA (CLINICAL EXAMINATION) & VITALS RECORD
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.375rem', color: '#475569' }}>
                  <div><strong>Nadi (Pulse):</strong> ______ /min</div>
                  <div><strong>BP:</strong> ______ mmHg</div>
                  <div><strong>Mala:</strong> Prakrita / Sama</div>
                  <div><strong>Mootra:</strong> Normal / Samyaka</div>
                  <div><strong>Jihva:</strong> Nirama / Sama</div>
                  <div><strong>Sparsha:</strong> Anushnasheeta</div>
                  <div><strong>Drik:</strong> Clear / Normal</div>
                  <div><strong>Agni:</strong> Sama / Vishama</div>
                </div>
              </div>

              {/* Ayurvedic Chikitsa Sutra Prescription Box */}
              <div style={{ border: '1px solid #CBD5E1', borderRadius: '8px', minHeight: '150px', padding: '0.75rem 0.875rem', backgroundColor: '#FFFFFF', marginBottom: '0.875rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.375rem', marginBottom: '0.5rem' }}>
                  <div style={{ fontWeight: 800, color: '#0F172A', fontSize: '0.8125rem' }}>
                    CHIKITSA SUTRA & AYURVEDIC FORMULATION PRESCRIPTION (Rx)
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#64748B', fontStyle: 'italic' }}>
                    Formulation Name • Dosage (Matra) • Anupana • Duration
                  </div>
                </div>

                {/* Rx Lines Grid */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', fontSize: '0.8125rem', color: '#334155' }}>
                  <div style={{ borderBottom: '1px dashed #CBD5E1', paddingBottom: '0.25rem' }}>
                    <strong>1. Rx:</strong> ____________________________________________________ Matra: __________ Anupana: __________
                  </div>
                  <div style={{ borderBottom: '1px dashed #CBD5E1', paddingBottom: '0.25rem' }}>
                    <strong>2. Rx:</strong> ____________________________________________________ Matra: __________ Anupana: __________
                  </div>
                  <div style={{ borderBottom: '1px dashed #CBD5E1', paddingBottom: '0.25rem' }}>
                    <strong>3. Rx:</strong> ____________________________________________________ Matra: __________ Anupana: __________
                  </div>
                  <div style={{ borderBottom: '1px dashed #CBD5E1', paddingBottom: '0.25rem' }}>
                    <strong>4. Rx:</strong> ____________________________________________________ Matra: __________ Anupana: __________
                  </div>
                </div>

                <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: '#475569' }}>
                  <strong>Pathya (Dietary Advice):</strong> Light Kichadi, Warm Water, Avoid Cold & Fried Foods.
                </div>
              </div>

              {/* Footer Financial & Signature Bar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: '0.75rem', borderTop: '1px solid #CBD5E1', fontSize: '0.8125rem' }}>
                <div>
                  <div style={{ fontWeight: 800, color: '#0F766E' }}>Registration Fee: ₹{selectedPatientForPrint.charge || 100} (PAID)</div>
                  <div style={{ fontSize: '0.7rem', color: '#64748B' }}>Valid for 15 Days from Date of Registration</div>
                </div>

                <div style={{ textAlign: 'center' }}>
                  <div style={{ borderBottom: '1px solid #94A3B8', width: '200px', marginBottom: '0.25rem' }}></div>
                  <div style={{ fontWeight: 800, color: '#0F766E' }}>{selectedPatientForPrint.doctor || 'Dr. Ravi Joshi'}</div>
                  <div style={{ fontSize: '0.7rem', color: '#64748B' }}>Attending Vaidya / Consultant Doctor Stamp</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
