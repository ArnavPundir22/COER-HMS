import React, { useState } from 'react';
import { Download, Plus, IndianRupee, BookOpen, Layers, Database, TestTube, FolderPlus, FileSpreadsheet, X, ShieldCheck, Users, UserPlus, Edit2, Trash2, Key, Check } from 'lucide-react';
import { useHospital } from '../context/HospitalContext';
import { useAuth, ALL_SYSTEM_TABS } from '../context/AuthContext';

export const MasterSettings = ({ initialView }) => {
  const { chargeTariffs, diseaseCatalog, addChargeTariff, exportSystemBackup, labTests } = useHospital();
  const { users, createUser, updateUser, deleteUser } = useAuth();
  
  const [activeSubTab, setActiveSubTab] = useState(initialView === 'backup' ? 'backup' : 'users');
  const [showTariffModal, setShowTariffModal] = useState(false);
  const [showHeadModal, setShowHeadModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUserForEdit, setSelectedUserForEdit] = useState(null);

  // Primary Accounting Revenue Heads
  const [heads, setHeads] = useState([
    { id: 'H-101', name: 'OPD Registration Income' },
    { id: 'H-102', name: 'IPD Ward & Nursing Charges' },
    { id: 'H-103', name: 'Panchkarma Specialty Therapy Fee' },
    { id: 'H-104', name: 'Pathology & Diagnostic Laboratory' },
    { id: 'H-105', name: 'Pharmacy Medicine Sales' }
  ]);

  // Sub Heads
  const [subheads] = useState([
    { id: 'SH-201', headId: 'H-101', name: 'New General Registration' },
    { id: 'SH-202', headId: 'H-101', name: 'Returning Old Patient Renewal' },
    { id: 'SH-203', headId: 'H-103', name: 'Shirodhara Oil Therapy' },
    { id: 'SH-204', headId: 'H-103', name: 'Basti Karma Procedure' },
    { id: 'SH-205', headId: 'H-104', name: 'Complete Blood Count (CBC)' }
  ]);

  const [newHeadName, setNewHeadName] = useState('');

  const [tariffForm, setTariffForm] = useState({
    name: '',
    category: 'Panchkarma',
    amount: 500
  });

  // User & JWT Permission Form State
  const [userForm, setUserForm] = useState({
    username: '',
    password: '',
    name: '',
    roleLabel: 'Staff Vaidya',
    department: 'KAYACHIKITSA',
    allowedTabs: ['dashboard', 'opd', 'ipd', 'panchkarma']
  });

  const handleOpenNewUser = () => {
    setSelectedUserForEdit(null);
    setUserForm({
      username: '',
      password: '',
      name: '',
      roleLabel: 'Staff Vaidya / Consultant',
      department: 'KAYACHIKITSA',
      allowedTabs: ['dashboard', 'opd', 'ipd', 'panchkarma']
    });
    setShowUserModal(true);
  };

  const handleOpenEditUser = (user) => {
    setSelectedUserForEdit(user);
    setUserForm({
      username: user.username,
      password: user.password,
      name: user.name,
      roleLabel: user.roleLabel || 'Staff',
      department: user.department || 'General',
      allowedTabs: user.allowedTabs || []
    });
    setShowUserModal(true);
  };

  const handleTabCheckboxToggle = (tabId) => {
    setUserForm(prev => {
      const exists = prev.allowedTabs.includes(tabId);
      if (exists) {
        return { ...prev, allowedTabs: prev.allowedTabs.filter(id => id !== tabId) };
      } else {
        return { ...prev, allowedTabs: [...prev.allowedTabs, tabId] };
      }
    });
  };

  const handleSelectAllTabs = () => {
    setUserForm(prev => ({
      ...prev,
      allowedTabs: ALL_SYSTEM_TABS.map(t => t.id)
    }));
  };

  const handleClearAllTabs = () => {
    setUserForm(prev => ({
      ...prev,
      allowedTabs: ['dashboard']
    }));
  };

  const handleUserSubmit = (e) => {
    e.preventDefault();
    if (!userForm.username || !userForm.password || !userForm.name) {
      alert('Please fill username, password, and full name.');
      return;
    }

    if (selectedUserForEdit) {
      updateUser(selectedUserForEdit.id, userForm);
    } else {
      createUser(userForm);
    }

    setShowUserModal(false);
  };

  const handleTariffSubmit = (e) => {
    e.preventDefault();
    addChargeTariff(tariffForm);
    setShowTariffModal(false);
    setTariffForm({ name: '', category: 'Panchkarma', amount: 500 });
  };

  const handleHeadSubmit = (e) => {
    e.preventDefault();
    if (newHeadName) {
      setHeads([...heads, { id: `H-${100 + heads.length + 1}`, name: newHeadName }]);
      setNewHeadName('');
      setShowHeadModal(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Layers color="#0F766E" size={26} /> System Master & JWT Security Configurations
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.875rem' }}>
            Create system users, configure JWT tab access permissions, tariffs, accounting heads, and backup.
          </p>
        </div>

        <button className="btn btn-primary" onClick={exportSystemBackup}>
          <Download size={18} /> Database Backup
        </button>
      </div>

      {/* Navigation Sub-Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.5rem', flexWrap: 'wrap' }}>
        <button 
          className={`btn ${activeSubTab === 'users' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          onClick={() => setActiveSubTab('users')}
        >
          <Users size={16} /> User Management & JWT Permissions
        </button>

        <button 
          className={`btn ${activeSubTab === 'tariffs' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          onClick={() => setActiveSubTab('tariffs')}
        >
          <IndianRupee size={16} /> Rate List / Tariffs
        </button>

        <button 
          className={`btn ${activeSubTab === 'heads' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          onClick={() => setActiveSubTab('heads')}
        >
          <FolderPlus size={16} /> Accounting Heads
        </button>

        <button 
          className={`btn ${activeSubTab === 'tests' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          onClick={() => setActiveSubTab('tests')}
        >
          <TestTube size={16} /> Test Catalog
        </button>

        <button 
          className={`btn ${activeSubTab === 'backup' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          onClick={() => setActiveSubTab('backup')}
        >
          <Database size={16} /> Database Backup
        </button>
      </div>

      {/* SubTab 0: USER MANAGEMENT & JWT TAB PERMISSIONS */}
      {activeSubTab === 'users' && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <ShieldCheck size={22} color="#0F766E" />
              <span>User Accounts & Custom JWT Tab Access Control</span>
            </div>

            <button className="btn btn-primary btn-sm" onClick={handleOpenNewUser}>
              <UserPlus size={16} /> Create New System User
            </button>
          </div>

          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>USER DETAILS</th>
                  <th>ROLE & DEPT</th>
                  <th>JWT ACCESSIBLE TABS</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                        <div style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          backgroundColor: u.badgeColor || '#0F766E',
                          color: '#FFFFFF',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: '0.8125rem'
                        }}>
                          {u.avatarInitials || 'US'}
                        </div>
                        <div>
                          <div style={{ fontWeight: 800, color: '#0F172A' }}>{u.name}</div>
                          <div style={{ fontSize: '0.75rem', color: '#0F766E', fontWeight: 700 }}>
                            User: <code>{u.username}</code>
                          </div>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className="badge badge-teal" style={{ marginBottom: '0.2rem' }}>{u.roleLabel}</span>
                      <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{u.department}</div>
                    </td>

                    <td>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', maxWidth: '420px' }}>
                        {u.role === 'SUPERADMIN' ? (
                          <span className="badge badge-success">ALL SYSTEM TABS (SUPERADMIN)</span>
                        ) : (
                          u.allowedTabs && u.allowedTabs.map(tId => {
                            const tabDef = ALL_SYSTEM_TABS.find(st => st.id === tId);
                            return (
                              <span key={tId} className="badge badge-info" style={{ fontSize: '0.7rem' }}>
                                {tabDef ? tabDef.label : tId}
                              </span>
                            );
                          })
                        )}
                      </div>
                    </td>

                    <td>
                      <div style={{ display: 'flex', gap: '0.375rem' }}>
                        <button 
                          className="btn btn-amber btn-sm"
                          title="Configure Allowed Tabs & Credentials"
                          onClick={() => handleOpenEditUser(u)}
                        >
                          <Edit2 size={14} /> Edit Access
                        </button>

                        {u.role !== 'SUPERADMIN' && (
                          <button 
                            className="btn btn-danger btn-sm"
                            title="Delete User"
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete user ${u.name}?`)) {
                                deleteUser(u.id);
                              }
                            }}
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SubTab 1: Charge Tariffs */}
      {activeSubTab === 'tariffs' && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <IndianRupee size={20} color="#0F766E" />
              <span>Charge Master Rate List Tariffs</span>
            </div>

            <button className="btn btn-secondary btn-sm" onClick={() => setShowTariffModal(true)}>
              <Plus size={14} /> Add Service Tariff
            </button>
          </div>

          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>TARIFF ID</th>
                  <th>SERVICE NAME</th>
                  <th>CATEGORY</th>
                  <th>STANDARD RATE (₹)</th>
                  <th>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {chargeTariffs.map(t => (
                  <tr key={t.id}>
                    <td style={{ fontWeight: 700, color: '#0F766E' }}>{t.id}</td>
                    <td style={{ fontWeight: 700 }}>{t.name}</td>
                    <td><span className="badge badge-info">{t.category}</span></td>
                    <td style={{ fontWeight: 800, color: '#15803D' }}>₹{t.amount}</td>
                    <td><span className="badge badge-success">ACTIVE</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SubTab 2: Accounting Heads */}
      {activeSubTab === 'heads' && (
        <div className="grid-cols-2">
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <FolderPlus size={20} color="#0F766E" />
                <span>Primary Accounting Revenue Heads</span>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowHeadModal(true)}>
                <Plus size={14} /> Add Head
              </button>
            </div>

            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>HEAD CODE</th>
                    <th>REVENUE HEAD NAME</th>
                  </tr>
                </thead>
                <tbody>
                  {heads.map(h => (
                    <tr key={h.id}>
                      <td style={{ fontWeight: 700, color: '#0F766E' }}>{h.id}</td>
                      <td style={{ fontWeight: 700 }}>{h.name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <FileSpreadsheet size={20} color="#2563EB" />
                <span>Mapped Ledger Sub-Heads</span>
              </div>
            </div>

            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>SUBHEAD CODE</th>
                    <th>SUBHEAD NAME</th>
                  </tr>
                </thead>
                <tbody>
                  {subheads.map(sh => (
                    <tr key={sh.id}>
                      <td style={{ fontWeight: 700, color: '#2563EB' }}>{sh.id}</td>
                      <td>{sh.name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SubTab 3: Test Names Catalogue */}
      {activeSubTab === 'tests' && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <TestTube size={20} color="#0F766E" />
              <span>Laboratory Diagnostic Test Catalog & Ranges</span>
            </div>
          </div>

          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>TEST CODE</th>
                  <th>TEST NAME</th>
                  <th>DEPARTMENT</th>
                  <th>CHARGE (₹)</th>
                  <th>REFERENCE RANGE</th>
                </tr>
              </thead>
              <tbody>
                {labTests.map((t, idx) => {
                  const code = t.id || t.code || `LT-${t['head_id'] || t['SR.NO.'] || (idx + 1)}`;
                  const testName = t['NAME OF TEST'] || t.name || t.test_name || 'Laboratory Test';
                  const category = t.category || t.department || 'PATHOLOGY & BIOCHEMISTRY';
                  const price = t.price || t.amount || t.charge || 0;
                  const refRange = t.refRange || t.referenceRange || t.range || 'Standard Biological Reference';

                  return (
                    <tr key={idx}>
                      <td style={{ fontWeight: 800, color: '#0F766E' }}>{code}</td>
                      <td style={{ fontWeight: 800, color: '#0F172A' }}>{testName}</td>
                      <td><span className="badge badge-info">{category}</span></td>
                      <td style={{ fontWeight: 800, color: '#15803D' }}>₹{price}</td>
                      <td style={{ fontSize: '0.8125rem', color: '#475569', fontWeight: 600 }}>{refRange}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SubTab 4: Database Backup */}
      {activeSubTab === 'backup' && (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
          <Database size={48} color="#0F766E" style={{ margin: '0 auto 1rem auto' }} />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A' }}>
            System Database Backup & Restore Master
          </h2>
          <p style={{ color: '#64748B', maxWidth: '500px', margin: '0.5rem auto 1.5rem auto', fontSize: '0.875rem' }}>
            Download a full JSON database snapshot containing all OPD patient records, IPD admissions, diagnostic reports, and pharmacy ledger entries.
          </p>

          <button className="btn btn-primary" onClick={exportSystemBackup} style={{ margin: '0 auto' }}>
            <Download size={18} /> Export Full System Database Snapshot (.JSON)
          </button>
        </div>
      )}

      {/* CREATE / EDIT USER MODAL WITH TAB AUTHORIZATION MATRIX */}
      {showUserModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '680px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid #E2E8F0' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F766E', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldCheck size={22} color="#0F766E" /> 
                {selectedUserForEdit ? `Configure Access: ${selectedUserForEdit.name}` : 'Create New System User & Tab Permissions'}
              </h2>
              <button onClick={() => setShowUserModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUserSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="grid-cols-2">
                <div className="form-group">
                  <label className="form-label">Full Staff Name *</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    required 
                    placeholder="e.g. Dr. A.K. Verma"
                    value={userForm.name}
                    onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Role Title / Designation *</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    required 
                    placeholder="e.g. Senior Vaidya, Pharmacist, Lab Tech"
                    value={userForm.roleLabel}
                    onChange={(e) => setUserForm({ ...userForm, roleLabel: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid-cols-2">
                <div className="form-group">
                  <label className="form-label">Username (Login ID) *</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    required 
                    placeholder="e.g. dr.verma"
                    value={userForm.username}
                    onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Password *</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    required 
                    placeholder="Set confidential password..."
                    value={userForm.password}
                    onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                  />
                </div>
              </div>

              {/* TAB AUTHORIZATION CHECKBOX MATRIX */}
              <div style={{ backgroundColor: '#F8FAFC', padding: '1rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 800, color: '#0F766E' }}>
                      🔑 Authorized Sidebar Navigation Tabs
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                      Check the tabs this user is permitted to view and access in the system.
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.375rem' }}>
                    <button type="button" className="btn btn-secondary btn-sm" onClick={handleSelectAllTabs}>
                      Select All
                    </button>
                    <button type="button" className="btn btn-secondary btn-sm" onClick={handleClearAllTabs}>
                      Clear All
                    </button>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.625rem' }}>
                  {ALL_SYSTEM_TABS.map(tab => {
                    const isChecked = userForm.allowedTabs.includes(tab.id);
                    return (
                      <label 
                        key={tab.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.625rem',
                          padding: '0.5rem 0.75rem',
                          backgroundColor: isChecked ? '#F0FDF4' : '#FFFFFF',
                          border: isChecked ? '1px solid #A7F3D0' : '1px solid #CBD5E1',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontSize: '0.8125rem',
                          fontWeight: isChecked ? 700 : 500,
                          color: isChecked ? '#0F766E' : '#334155',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <input 
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleTabCheckboxToggle(tab.id)}
                          style={{ width: '16px', height: '16px', accentColor: '#0F766E' }}
                        />
                        <span>{tab.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowUserModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <Check size={16} /> {selectedUserForEdit ? 'Save Permissions & Issue JWT' : 'Create User & Issue JWT'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SERVICE TARIFF MODAL */}
      {showTariffModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '450px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 800 }}>Add Service Rate Tariff</h3>
              <button onClick={() => setShowTariffModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleTariffSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Service / Procedure Name *</label>
                <input 
                  type="text" 
                  className="form-control" 
                  required 
                  placeholder="e.g. Abhyanga Oil Massage"
                  value={tariffForm.name}
                  onChange={(e) => setTariffForm({ ...tariffForm, name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Category</label>
                <select 
                  className="form-control" 
                  value={tariffForm.category}
                  onChange={(e) => setTariffForm({ ...tariffForm, category: e.target.value })}
                >
                  <option value="Panchkarma">Panchkarma Therapy</option>
                  <option value="Pathology">Pathology Laboratory</option>
                  <option value="OPD">OPD Consultation</option>
                  <option value="IPD">IPD Bed & Nursing</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Standard Charge Rate (₹) *</label>
                <input 
                  type="number" 
                  className="form-control" 
                  required 
                  value={tariffForm.amount}
                  onChange={(e) => setTariffForm({ ...tariffForm, amount: Number(e.target.value) })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowTariffModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Tariff
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD ACCOUNTING HEAD MODAL */}
      {showHeadModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '450px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 800 }}>Add Revenue Accounting Head</h3>
              <button onClick={() => setShowHeadModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleHeadSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Revenue Head Name *</label>
                <input 
                  type="text" 
                  className="form-control" 
                  required 
                  placeholder="e.g. Panchkarma Therapy Income"
                  value={newHeadName}
                  onChange={(e) => setNewHeadName(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowHeadModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Accounting Head
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
