import React, { useState, useMemo } from 'react';
import { Pill, Plus, Search, CheckCircle2, X, Trash2, ArrowRight, Filter, AlertTriangle, Package, TrendingUp, RefreshCw } from 'lucide-react';
import { useHospital } from '../context/HospitalContext';

export const PharmacyDispensary = () => {
  const { medicines, opdPatients, dispensedMedicines, addDispensation, deleteDispensation, updateMedicineStock, addNewMedicineFormulation } = useHospital();
  
  const [activeTab, setActiveTab] = useState('inventory'); // 'inventory', 'prescriptions', 'alerts'
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showRestockModal, setShowRestockModal] = useState(false);
  const [showNewMedModal, setShowNewMedModal] = useState(false);
  const [showArchive, setShowArchive] = useState(false);

  // Selected formulation for restocking
  const [selectedRestockMed, setSelectedRestockMed] = useState(null);
  const [restockQty, setRestockQty] = useState(100);

  // New Formulation Form
  const [newMedForm, setNewMedForm] = useState({
    name: '',
    category: 'Vati / Gulika',
    price: 120,
    stock: 200,
    minLevel: 30
  });

  const [opdSearch, setOpdSearch] = useState('');
  const [showOpdSuggestions, setShowOpdSuggestions] = useState(false);

  // Multi-Medicine Dispense Builder Form State
  const [patientInfo, setPatientInfo] = useState({ crNo: '', patientName: '' });
  const [selectedItems, setSelectedItems] = useState([
    { medicineName: 'Maha Rasnadi Kwath', dosage: '20ml BD', duration: '14 Days', qty: 2, price: 145 },
    { medicineName: 'Yograj Guggulu', dosage: '2 Tab BD', duration: '10 Days', qty: 1, price: 115 }
  ]);

  const [singleItem, setSingleItem] = useState({
    medicineName: '',
    dosage: '1 Tab BD',
    duration: '7 Days',
    qty: 1,
    price: 100
  });

  // Stock Analytics Calculations
  const stockStats = useMemo(() => {
    const totalCount = medicines.length;
    const totalUnits = medicines.reduce((sum, m) => sum + (m.stock || 0), 0);
    const lowStockItems = medicines.filter(m => (m.stock || 0) < (m.minLevel || 30));
    const totalValuation = medicines.reduce((sum, m) => sum + ((m.stock || 0) * (m.price || 0)), 0);

    return { totalCount, totalUnits, lowStockCount: lowStockItems.length, lowStockItems, totalValuation };
  }, [medicines]);

  // Guaranteed Unique Filtering Engine across Master Medicines Inventory
  const filteredMedicines = useMemo(() => {
    if (!searchTerm || !searchTerm.trim()) return medicines;
    const rawTerm = searchTerm.trim().toLowerCase();
    const cleanTerm = rawTerm.replace(/[^a-z0-9]/g, '');

    return medicines.filter(m => {
      const nameRaw = String(m.name || m['NAME OF MED'] || m.NAME || m.medicineName || m.formulation || '').toLowerCase();
      const nameClean = nameRaw.replace(/[^a-z0-9]/g, '');
      const catRaw = String(m.category || m.CATEGORY || '').toLowerCase();

      return (
        nameRaw.includes(rawTerm) ||
        (cleanTerm.length > 0 && nameClean.includes(cleanTerm)) ||
        catRaw.includes(rawTerm)
      );
    });
  }, [medicines, searchTerm]);

  // Search Filter across Dispensed Prescriptions Register
  const visibleDispensations = useMemo(() => {
    let list = showArchive ? dispensedMedicines : dispensedMedicines.filter(d => d.billingStatus !== 'BILLED');
    if (!searchTerm || !searchTerm.trim()) return list;
    const rawTerm = searchTerm.trim().toLowerCase();
    return list.filter(d => 
      (d.patientName && d.patientName.toLowerCase().includes(rawTerm)) ||
      (d.crNo && d.crNo.includes(rawTerm)) ||
      (d.items && d.items.some(item => item.medicineName && item.medicineName.toLowerCase().includes(rawTerm)))
    );
  }, [dispensedMedicines, showArchive, searchTerm]);

  // Search Filter across Low Stock Items
  const filteredLowStockItems = useMemo(() => {
    if (!searchTerm || !searchTerm.trim()) return stockStats.lowStockItems;
    const rawTerm = searchTerm.trim().toLowerCase();
    return stockStats.lowStockItems.filter(m => {
      const medName = String(m.name || m['NAME OF MED'] || m.NAME || '').toLowerCase();
      const medCategory = String(m.category || '').toLowerCase();
      return medName.includes(rawTerm) || medCategory.includes(rawTerm);
    });
  }, [stockStats.lowStockItems, searchTerm]);

  // Autocomplete Patient Suggestions
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
    setPatientInfo({
      crNo: p.crNo,
      patientName: p.name
    });
    setOpdSearch(`CR: ${p.crNo} - ${p.name}`);
    setShowOpdSuggestions(false);
  };

  // Functional State Updater ensures UNLIMITED items can be appended without replacement
  const addItemToPrescription = (medName, medPrice = 100, customDosage, customDuration, customQty) => {
    const newItemName = medName || singleItem.medicineName || 'Ayurvedic Formulation';
    const newItemPrice = Number(medPrice || singleItem.price) || 100;
    const newItemDosage = customDosage || singleItem.dosage || '1 Tab BD';
    const newItemDuration = customDuration || singleItem.duration || '7 Days';
    const newItemQty = Number(customQty || singleItem.qty) || 1;

    setSelectedItems(prev => [
      ...prev,
      {
        medicineName: newItemName,
        dosage: newItemDosage,
        duration: newItemDuration,
        qty: newItemQty,
        price: newItemPrice
      }
    ]);
  };

  const removeItemFromPrescription = (index) => {
    setSelectedItems(prev => prev.filter((_, idx) => idx !== index));
  };

  const totalPrescriptionAmount = useMemo(() => {
    return selectedItems.reduce((sum, item) => sum + (item.price * item.qty), 0);
  }, [selectedItems]);

  const handleDispenseSubmit = (e) => {
    e.preventDefault();
    if (!patientInfo.patientName || selectedItems.length === 0) return;

    addDispensation({
      crNo: patientInfo.crNo,
      patientName: patientInfo.patientName,
      items: selectedItems.map(item => ({
        ...item,
        amount: item.price * item.qty
      })),
      totalAmount: totalPrescriptionAmount
    });

    setShowModal(false);
    setOpdSearch('');
    setShowOpdSuggestions(false);
    setPatientInfo({ crNo: '', patientName: '' });
    setSelectedItems([]);
  };

  const handleRestockSubmit = (e) => {
    e.preventDefault();
    if (!selectedRestockMed || restockQty <= 0) return;

    updateMedicineStock(selectedRestockMed.id || selectedRestockMed.name, Number(restockQty));
    setShowRestockModal(false);
    setSelectedRestockMed(null);
    setRestockQty(100);
  };

  const handleCreateNewMedSubmit = (e) => {
    e.preventDefault();
    if (!newMedForm.name) return;

    addNewMedicineFormulation(newMedForm);
    setShowNewMedModal(false);
    setNewMedForm({ name: '', category: 'Vati / Gulika', price: 120, stock: 200, minLevel: 30 });
  };

  const handleDeleteSummary = (disp) => {
    if (window.confirm(`Are you sure you want to clear/delete prescription summary for ${disp.patientName} (CR: ${disp.crNo})?`)) {
      deleteDispensation(disp.id);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Pill color="#0F766E" size={26} /> Ayurvedic Pharmacy & Stock Management System
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.875rem' }}>
            Central inventory stock control, auto-stock deduction, reorder alerts, and patient prescription dispensations.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-secondary" onClick={() => setShowNewMedModal(true)}>
            <Plus size={16} /> New Formulation
          </button>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={18} /> Dispense Prescription
          </button>
        </div>
      </div>

      {/* STOCK MANAGEMENT ANALYTICS KPI DASHBOARD */}
      <div className="grid-cols-4">
        <div className="card" style={{ padding: '1rem', borderLeft: '4px solid #0F766E' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B' }}>TOTAL FORMULATIONS</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0F172A', marginTop: '0.25rem' }}>
            {stockStats.totalCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#0F766E', marginTop: '0.25rem', fontWeight: 600 }}>
            Classical Ayurvedic Catalogue
          </div>
        </div>

        <div className="card" style={{ padding: '1rem', borderLeft: '4px solid #2563EB' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B' }}>TOTAL STOCK INVENTORY</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#2563EB', marginTop: '0.25rem' }}>
            {stockStats.totalUnits.toLocaleString()} <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Units</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.25rem' }}>
            In Pharmacy Dispensary Store
          </div>
        </div>

        <div className="card" style={{ padding: '1rem', borderLeft: stockStats.lowStockCount > 0 ? '4px solid #DC2626' : '4px solid #16A34A' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B' }}>LOW STOCK ALERTS</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 900, color: stockStats.lowStockCount > 0 ? '#DC2626' : '#16A34A', marginTop: '0.25rem' }}>
            {stockStats.lowStockCount} <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Items</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: stockStats.lowStockCount > 0 ? '#DC2626' : '#16A34A', marginTop: '0.25rem', fontWeight: 600 }}>
            {stockStats.lowStockCount > 0 ? '⚠️ Action Needed: Below Min Level' : '✅ All Formulations Healthy'}
          </div>
        </div>

        <div className="card" style={{ padding: '1rem', borderLeft: '4px solid #D97706' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B' }}>INVENTORY STOCK VALUATION</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#D97706', marginTop: '0.25rem' }}>
            ₹{stockStats.totalValuation.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.25rem' }}>
            Total Asset Value in Stock
          </div>
        </div>
      </div>

      {/* UNIVERSAL SEARCH BAR & SUB-TABS */}
      <div className="card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {/* Universal Search Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#F8FAFC', padding: '0.625rem 1rem', borderRadius: '10px', border: '2px solid #0F766E', boxShadow: '0 2px 4px rgba(15,118,110,0.05)' }}>
          <Search size={22} color="#0F766E" />
          <input
            type="text"
            placeholder="Type to search Formulations (e.g. Guggulu, Kwath, Vati, Taila), Categories, or Patients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ border: 'none', background: 'transparent', width: '100%', fontSize: '0.9375rem', fontWeight: 700, color: '#0F172A', outline: 'none' }}
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#DC2626', fontWeight: 800, padding: '0.25rem' }}
              title="Clear Search Filter"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* NAVIGATION SUB-TABS */}
        <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '2px solid #E2E8F0', paddingBottom: '0.5rem', flexWrap: 'wrap' }}>
          <button 
            className={`btn ${activeTab === 'inventory' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('inventory')}
          >
            <Package size={16} /> Stock Inventory Control ({filteredMedicines.length})
          </button>

          <button 
            className={`btn ${activeTab === 'prescriptions' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('prescriptions')}
          >
            <Pill size={16} /> Active Dispensed Prescriptions ({visibleDispensations.length})
          </button>

          <button 
            className={`btn ${activeTab === 'alerts' ? 'btn-danger' : 'btn-secondary'}`}
            onClick={() => setActiveTab('alerts')}
          >
            <AlertTriangle size={16} /> Low Stock Reorder Register ({filteredLowStockItems.length})
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: STOCK INVENTORY CONTROL CENTER */}
      {activeTab === 'inventory' && (
        <div className="card" style={{ padding: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div className="card-title" style={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Pill size={20} color="#0F766E" />
              <span>Master Formulations Inventory Grid ({filteredMedicines.length} of {medicines.length} Formulations)</span>
            </div>

            {/* In-Card Search Input */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', backgroundColor: '#F1F5F9', padding: '0.375rem 0.75rem', borderRadius: '8px', border: '1px solid #CBD5E1', minWidth: '260px' }}>
              <Search size={16} color="#0F766E" />
              <input 
                type="text"
                placeholder="Search medicines..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ border: 'none', background: 'transparent', width: '100%', fontSize: '0.8125rem', fontWeight: 600, outline: 'none' }}
              />
              {searchTerm && (
                <X size={14} color="#64748B" style={{ cursor: 'pointer' }} onClick={() => setSearchTerm('')} />
              )}
            </div>
          </div>

          {filteredMedicines.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#64748B', fontSize: '0.9375rem', backgroundColor: '#F8FAFC', borderRadius: '10px', border: '1px dashed #CBD5E1' }}>
              🔍 No Ayurvedic formulation matching <strong>"{searchTerm}"</strong> found.
              <div style={{ marginTop: '0.5rem' }}>
                <button className="btn btn-secondary btn-sm" onClick={() => setSearchTerm('')}>
                  Reset Search Filter
                </button>
              </div>
            </div>
          ) : (
            <div className="grid-cols-3">
              {filteredMedicines.map((m, idx) => {
                const medName = m.name || m['NAME OF MED'] || m.NAME || `Formulation #${m.id || idx+1}`;
                const isLow = (m.stock || 0) < (m.minLevel || 30);
                const uniqueKey = `med-card-${m.id || ''}-${medName}-${idx}`;
                return (
                  <div 
                    key={uniqueKey}
                    style={{
                      padding: '1rem',
                      borderRadius: '10px',
                      border: isLow ? '2px solid #FCA5A5' : '1px solid #E2E8F0',
                      backgroundColor: isLow ? '#FEF2F2' : '#FFFFFF',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                      <div style={{ fontWeight: 800, fontSize: '0.9375rem', color: '#0F172A' }}>{medName}</div>
                      <span className="badge badge-teal" style={{ fontSize: '0.7rem', flexShrink: 0 }}>{m.category}</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8125rem', color: '#475569' }}>
                      <div>
                        Stock: <strong style={{ color: isLow ? '#DC2626' : '#0F766E', fontSize: '0.9375rem' }}>{m.stock} Units</strong>
                      </div>
                      <div>Price: <strong>₹{m.price}</strong></div>
                    </div>

                    {isLow && (
                      <div style={{ fontSize: '0.75rem', color: '#DC2626', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <AlertTriangle size={12} /> Low Stock (Min Threshold: {m.minLevel} Units)
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                      <button 
                        className="btn btn-secondary btn-sm"
                        style={{ flex: 1 }}
                        onClick={() => {
                          setSelectedRestockMed(m);
                          setShowRestockModal(true);
                        }}
                      >
                        <RefreshCw size={12} /> Restock (+Units)
                      </button>

                      <button 
                        className="btn btn-primary btn-sm"
                        style={{ flex: 1 }}
                        onClick={() => {
                          addItemToPrescription(medName, m.price);
                          setShowModal(true);
                        }}
                      >
                        + Add to Bill
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 2: ACTIVE DISPENSED PRESCRIPTIONS */}
      {activeTab === 'prescriptions' && (
        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#0F172A' }}>
                Active Dispensed Prescriptions ({visibleDispensations.length})
              </h2>
              <p style={{ fontSize: '0.8125rem', color: '#64748B', marginTop: '2px' }}>
                Pending summaries automatically clear from this view once billed in Financial Receipts.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <button 
                className={`btn ${showArchive ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                onClick={() => setShowArchive(!showArchive)}
              >
                <Filter size={14} /> {showArchive ? 'Showing All (Including Billed)' : 'Show Billed Archive'}
              </button>
            </div>
          </div>

          <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {visibleDispensations.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#64748B', fontSize: '0.875rem' }}>
                🎉 No prescription summaries matching search criteria. All dispensed medicines billed & cleared.
              </div>
            ) : (
              visibleDispensations.map((disp, idx) => {
                const isBilled = disp.billingStatus === 'BILLED';
                const dispKey = `disp-${disp.id || idx}-${idx}`;
                return (
                  <div 
                    key={dispKey}
                    style={{
                      borderRadius: '12px',
                      border: isBilled ? '1px solid #CBD5E1' : '2px solid #6EE7B7',
                      backgroundColor: isBilled ? '#F8FAFC' : '#ECFDF5',
                      padding: '1rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.75rem'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div>
                        <span style={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A' }}>{disp.patientName}</span>
                        <span style={{ fontSize: '0.8125rem', color: '#0F766E', fontWeight: 700, marginLeft: '0.75rem' }}>
                          CR NO: {disp.crNo}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: '#64748B', marginLeft: '0.75rem' }}>
                          Date: {disp.date}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span className="badge badge-teal" style={{ fontSize: '0.875rem', padding: '0.35rem 0.75rem', fontWeight: 800 }}>
                          Pharmacy Total: ₹{disp.totalAmount}
                        </span>
                        <span className={`badge ${isBilled ? 'badge-success' : 'badge-amber'}`}>
                          {isBilled ? 'BILLED & CLEARED' : 'PENDING BILLING'}
                        </span>
                        <button 
                          className="btn btn-danger btn-sm"
                          title="Delete / Clear Balance of Medicines"
                          onClick={() => handleDeleteSummary(disp)}
                        >
                          <Trash2 size={14} /> Clear Summary
                        </button>
                      </div>
                    </div>

                    {/* Formulations List Summary */}
                    <div className="table-container" style={{ backgroundColor: '#FFFFFF', borderRadius: '8px' }}>
                      <table className="custom-table" style={{ fontSize: '0.8125rem' }}>
                        <thead>
                          <tr>
                            <th>FORMULATION NAME</th>
                            <th>DOSAGE SCHEDULE</th>
                            <th>DURATION</th>
                            <th>QTY</th>
                            <th>UNIT PRICE</th>
                            <th>AMOUNT</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(disp.items || []).map((item, itemIdx) => (
                            <tr key={`item-${itemIdx}-${item.medicineName}`}>
                              <td style={{ fontWeight: 700, color: '#2563EB' }}>{item.medicineName}</td>
                              <td>{item.dosage}</td>
                              <td>{item.duration}</td>
                              <td style={{ fontWeight: 700 }}>{item.qty}</td>
                              <td>₹{item.price}</td>
                              <td style={{ fontWeight: 800, color: '#0F766E' }}>₹{item.amount || item.price * item.qty}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB 3: LOW STOCK REORDER REGISTER */}
      {activeTab === 'alerts' && (
        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #E2E8F0' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#DC2626', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertTriangle size={20} /> Low Stock & Purchase Reorder Register ({filteredLowStockItems.length})
            </h2>
            <p style={{ fontSize: '0.8125rem', color: '#64748B', marginTop: '2px' }}>
              Formulations requiring immediate purchase order placement to maintain hospital dispensary stock.
            </p>
          </div>

          <div className="table-container" style={{ border: 'none' }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>FORMULATION NAME</th>
                  <th>CATEGORY</th>
                  <th>CURRENT STOCK</th>
                  <th>MIN THRESHOLD</th>
                  <th>UNIT PRICE</th>
                  <th>DEFICIT UNITS</th>
                  <th>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {filteredLowStockItems.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: '#16A34A', fontWeight: 700 }}>
                      ✅ No low stock items matching search criteria!
                    </td>
                  </tr>
                ) : (
                  filteredLowStockItems.map((m, idx) => (
                    <tr key={`low-row-${m.id || idx}-${idx}`}>
                      <td style={{ fontWeight: 800, color: '#0F172A' }}>{m.name}</td>
                      <td><span className="badge badge-teal">{m.category}</span></td>
                      <td style={{ fontWeight: 800, color: '#DC2626' }}>{m.stock} Units</td>
                      <td>{m.minLevel} Units</td>
                      <td>₹{m.price}</td>
                      <td style={{ fontWeight: 700, color: '#D97706' }}>+{Math.max(0, m.minLevel - m.stock + 100)} Units Required</td>
                      <td>
                        <button 
                          className="btn btn-primary btn-sm"
                          onClick={() => {
                            setSelectedRestockMed(m);
                            setShowRestockModal(true);
                          }}
                        >
                          <RefreshCw size={14} /> Quick Restock
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* RESTOCK STOCK QUANTITY MODAL */}
      {showRestockModal && selectedRestockMed && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '450px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <RefreshCw size={20} color="#0F766E" /> Restock Formulation Inventory
              </h2>
              <button onClick={() => setShowRestockModal(false)} style={{ background: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleRestockSubmit}>
              <div style={{ padding: '0.75rem', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0', marginBottom: '1rem' }}>
                <div style={{ fontWeight: 800, fontSize: '0.9375rem', color: '#0F172A' }}>
                  {selectedRestockMed.name}
                </div>
                <div style={{ fontSize: '0.8125rem', color: '#64748B', marginTop: '0.25rem' }}>
                  Current Stock: <strong style={{ color: '#0F766E' }}>{selectedRestockMed.stock} Units</strong> • Price: ₹{selectedRestockMed.price}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Quantity to Add (+Units) *</label>
                <input 
                  type="number" 
                  className="form-control" 
                  required 
                  min="1"
                  value={restockQty}
                  onChange={(e) => setRestockQty(Number(e.target.value))}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowRestockModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Confirm Restock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE NEW FORMULATION MODAL */}
      {showNewMedModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Plus size={20} color="#0F766E" /> Add New Ayurvedic Formulation
              </h2>
              <button onClick={() => setShowNewMedModal(false)} style={{ background: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateNewMedSubmit}>
              <div className="form-group">
                <label className="form-label">Formulation Name *</label>
                <input 
                  type="text" 
                  className="form-control" 
                  required 
                  placeholder="e.g. Amrutharishtam 450ml"
                  value={newMedForm.name}
                  onChange={(e) => setNewMedForm({ ...newMedForm, name: e.target.value })}
                />
              </div>

              <div className="grid-cols-2">
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select 
                    className="form-control"
                    value={newMedForm.category}
                    onChange={(e) => setNewMedForm({ ...newMedForm, category: e.target.value })}
                  >
                    <option value="Vati / Gulika">Vati / Gulika</option>
                    <option value="Guggulu">Guggulu</option>
                    <option value="Arishta / Asava">Arishta / Asava</option>
                    <option value="Kashayam">Kashayam</option>
                    <option value="Choorna">Choorna</option>
                    <option value="Thailam">Thailam</option>
                    <option value="Bhasma / Ras">Bhasma / Ras</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Unit Selling Price (₹) *</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    required 
                    value={newMedForm.price}
                    onChange={(e) => setNewMedForm({ ...newMedForm, price: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="grid-cols-2">
                <div className="form-group">
                  <label className="form-label">Initial Stock Quantity *</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    required 
                    value={newMedForm.stock}
                    onChange={(e) => setNewMedForm({ ...newMedForm, stock: Number(e.target.value) })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Min Stock Threshold</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    value={newMedForm.minLevel}
                    onChange={(e) => setNewMedForm({ ...newMedForm, minLevel: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowNewMedModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Formulation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dispense Modal with Multi-Medicine Prescription Summary */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '750px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Pill size={22} color="#0F766E" /> Dispense Multi-Medicine Prescription
              </h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleDispenseSubmit}>
              {/* Patient Autocomplete Search */}
              <div className="form-group" style={{ position: 'relative', marginBottom: '1.25rem' }}>
                <label className="form-label">Search Patient (Name, CR No, OPD No - 28,281 Patients) *</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid #CBD5E1', borderRadius: '8px', padding: '0.5rem', backgroundColor: '#F8FAFC' }}>
                  <Search size={16} color="#0F766E" />
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
                        <strong style={{ color: '#0F766E' }}>CR: {p.crNo}</strong> • {p.name} ({p.department})
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
                    value={patientInfo.patientName}
                    onChange={(e) => setPatientInfo({ ...patientInfo, patientName: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">CR Number *</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    required 
                    value={patientInfo.crNo}
                    onChange={(e) => setPatientInfo({ ...patientInfo, crNo: e.target.value })}
                  />
                </div>
              </div>

              {/* Add Medicine Item Sub-Form with Formulations Dropdown */}
              <div style={{ padding: '1rem', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #CBD5E1', margin: '1rem 0' }}>
                <div style={{ fontWeight: 800, fontSize: '0.875rem', color: '#0F766E', marginBottom: '0.75rem' }}>
                  Add Formulation to Prescription Summary (Unlimited Formulations Allowed)
                </div>

                <div className="grid-cols-2">
                  <div className="form-group">
                    <label className="form-label">Select Formulation (or Type Custom Name)</label>
                    <select
                      className="form-control"
                      value={singleItem.medicineName}
                      onChange={(e) => {
                        const selectedMed = medicines.find(m => (m.name || m['NAME OF MED']) === e.target.value);
                        setSingleItem({
                          ...singleItem,
                          medicineName: e.target.value,
                          price: selectedMed ? (selectedMed.price || 100) : singleItem.price
                        });
                      }}
                    >
                      <option value="">-- Choose Formulation from Inventory ({medicines.length}) --</option>
                      {medicines.map((m, idx) => {
                        const mName = m.name || m['NAME OF MED'] || `Formulation #${idx+1}`;
                        return (
                          <option key={`opt-select-${m.id || idx}-${idx}`} value={mName}>
                            {mName} ({m.category}) - ₹{m.price} [Stock: {m.stock}]
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Dosage Schedule</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={singleItem.dosage}
                      onChange={(e) => setSingleItem({ ...singleItem, dosage: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid-cols-3" style={{ marginTop: '0.5rem' }}>
                  <div className="form-group">
                    <label className="form-label">Duration</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={singleItem.duration}
                      onChange={(e) => setSingleItem({ ...singleItem, duration: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Quantity</label>
                    <input 
                      type="number" 
                      className="form-control" 
                      min="1"
                      value={singleItem.qty}
                      onChange={(e) => setSingleItem({ ...singleItem, qty: Number(e.target.value) })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Unit Price (₹)</label>
                    <input 
                      type="number" 
                      className="form-control" 
                      value={singleItem.price}
                      onChange={(e) => setSingleItem({ ...singleItem, price: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <button 
                  type="button" 
                  className="btn btn-secondary btn-sm" 
                  style={{ width: '100%', marginTop: '0.75rem', backgroundColor: '#F0FDF4', color: '#0F766E', fontWeight: 800, border: '1px solid #A7F3D0' }}
                  onClick={() => {
                    if (singleItem.medicineName) {
                      addItemToPrescription(singleItem.medicineName, singleItem.price);
                      setSingleItem({ ...singleItem, medicineName: '' });
                    } else {
                      alert('Please select or type a formulation name.');
                    }
                  }}
                >
                  + Add This Formulation to Summary List
                </button>
              </div>

              {/* Prescription Items Summary Table */}
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <div style={{ fontWeight: 800, fontSize: '0.875rem', color: '#0F172A' }}>
                    Prescribed Items Summary ({selectedItems.length} Formulations)
                  </div>
                  <span className="badge badge-teal" style={{ fontWeight: 800 }}>Unlimited Medicines Supported</span>
                </div>

                <div className="table-container">
                  <table className="custom-table" style={{ fontSize: '0.8125rem' }}>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>FORMULATION</th>
                        <th>DOSAGE</th>
                        <th>QTY</th>
                        <th>PRICE</th>
                        <th>AMOUNT</th>
                        <th>REMOVE</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedItems.map((item, idx) => (
                        <tr key={`presc-item-${idx}-${item.medicineName}`}>
                          <td style={{ fontWeight: 700, color: '#64748B' }}>{idx + 1}</td>
                          <td style={{ fontWeight: 800, color: '#2563EB' }}>{item.medicineName}</td>
                          <td>{item.dosage} ({item.duration})</td>
                          <td style={{ fontWeight: 700 }}>{item.qty}</td>
                          <td>₹{item.price}</td>
                          <td style={{ fontWeight: 800, color: '#0F766E' }}>₹{item.price * item.qty}</td>
                          <td>
                            <button 
                              type="button" 
                              onClick={() => removeItemFromPrescription(idx)} 
                              style={{ border: 'none', background: 'none', color: '#DC2626', cursor: 'pointer', padding: '0.25rem' }}
                              title="Remove Medicine"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem', padding: '0.75rem', backgroundColor: '#F0FDF4', borderRadius: '8px', border: '1px solid #99F6E4' }}>
                  <strong style={{ color: '#0F766E' }}>Grand Total Pharmacy Bill ({selectedItems.length} Items):</strong>
                  <span style={{ fontSize: '1.125rem', fontWeight: 900, color: '#042F2C' }}>₹{totalPrescriptionAmount}</span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={selectedItems.length === 0}>
                  Save & Confirm Dispensing ({selectedItems.length} Medicines)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
