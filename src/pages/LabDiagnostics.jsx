import React, { useState, useMemo } from 'react';
import { TestTube, Plus, Printer, CheckCircle, X, Search, Receipt, DollarSign, CreditCard } from 'lucide-react';
import { useHospital } from '../context/HospitalContext';

export const LabDiagnostics = () => {
  const { labOrders, createLabOrder, updateLabResult, opdPatients, labTests, addReceipt } = useHospital();
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedOrderForResults, setSelectedOrderForResults] = useState(null);
  const [selectedOrderForPrint, setSelectedOrderForPrint] = useState(null);

  const [opdSearch, setOpdSearch] = useState('');
  const [showOpdSuggestions, setShowOpdSuggestions] = useState(false);

  // Modal Order & Billing Form State
  const [orderForm, setOrderForm] = useState({
    crNo: '',
    patientName: '',
    age: '30',
    gender: 'MALE',
    referredBy: 'Dr. Ravi Joshi',
    tests: ['CBC (Complete Blood Count)'],
    discount: 0,
    paymentMethod: 'CASH',
    autoGenerateReceipt: true
  });

  const [resultForm, setResultForm] = useState({});

  // Dynamic Live Calculation of Pathology Test Fee Total
  const totalLabFee = useMemo(() => {
    return orderForm.tests.reduce((sum, testName) => {
      const testObj = labTests.find(t => {
        const name = t['NAME OF TEST'] || t.NAME || t.test_name;
        return name === testName;
      });
      return sum + (testObj ? (Number(testObj.price) || 250) : 250);
    }, 0);
  }, [orderForm.tests, labTests]);

  const netLabFee = useMemo(() => {
    return Math.max(0, totalLabFee - Number(orderForm.discount || 0));
  }, [totalLabFee, orderForm.discount]);

  // High Performance Patient Autocomplete Suggestions (Max 100 items matching search)
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
    setOrderForm({
      ...orderForm,
      crNo: p.crNo,
      patientName: p.name,
      age: p.age,
      gender: p.gender,
      referredBy: p.doctor || 'Dr. Ravi Joshi'
    });
    setOpdSearch(`CR: ${p.crNo} - ${p.name}`);
    setShowOpdSuggestions(false);
  };

  const handleOrderSubmit = (e) => {
    e.preventDefault();
    if (orderForm.tests.length === 0) {
      alert('Please select at least one laboratory test head.');
      return;
    }

    const newLabOrder = createLabOrder({
      ...orderForm,
      totalFee: totalLabFee,
      discount: Number(orderForm.discount || 0),
      netFee: netLabFee,
      paidAmount: netLabFee,
      billingStatus: 'PAID'
    });

    // Auto-Generate Financial Billing Receipt if option is enabled
    if (orderForm.autoGenerateReceipt) {
      addReceipt({
        crNo: orderForm.crNo,
        name: orderForm.patientName,
        charge: totalLabFee,
        discount: Number(orderForm.discount || 0),
        total: netLabFee,
        received: netLabFee,
        due: 0,
        remarks: `Pathology Diagnostic Fee - ${orderForm.tests.join(', ')} (${newLabOrder.refNo})`
      });
    }

    setShowOrderModal(false);
    setOpdSearch('');
    setShowOpdSuggestions(false);
    setOrderForm({
      crNo: '',
      patientName: '',
      age: '30',
      gender: 'MALE',
      referredBy: 'Dr. Ravi Joshi',
      tests: ['CBC (Complete Blood Count)'],
      discount: 0,
      paymentMethod: 'CASH',
      autoGenerateReceipt: true
    });
  };

  const handleResultSubmit = (e) => {
    e.preventDefault();
    if (selectedOrderForResults) {
      updateLabResult(selectedOrderForResults.id, resultForm);
      setSelectedOrderForResults(null);
      setResultForm({});
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TestTube color="#2563EB" size={26} /> Pathology & Diagnostics Laboratory
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.875rem' }}>
            Book clinical lab test orders, calculate test fees with integrated billing, enter parameter values, and print diagnostic reports.
          </p>
        </div>

        <button className="btn btn-primary" onClick={() => setShowOrderModal(true)}>
          <Plus size={18} /> Book New Lab Order & Collect Fee
        </button>
      </div>

      {/* Test Catalogue Tariffs Banner */}
      <div className="grid-cols-4">
        {labTests.slice(0, 4).map(t => {
          const name = t['NAME OF TEST'] || t.NAME || t.test_name;
          const cleanName = (name && name !== '&nbsp;') ? name : `Pathology Head #${t.head_id}`;
          return (
            <div key={t.head_id || t['SR.NO.']} className="card" style={{ padding: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B' }}>TEST HEAD #{t.head_id || t['SR.NO.']}</span>
                <span className="badge badge-teal" style={{ fontWeight: 800 }}>₹{t.price || 250}</span>
              </div>
              <div style={{ fontSize: '0.875rem', fontWeight: 800, color: '#0F172A' }}>{cleanName}</div>
              <div style={{ fontSize: '0.75rem', color: '#2563EB', fontWeight: 600 }}>Ref: {t.refRange || 'Standard Limit'}</div>
            </div>
          );
        })}
      </div>

      {/* Lab Orders Table */}
      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#0F172A' }}>
            Diagnostic Order Tracker & Integrated Receipts ({labOrders.length})
          </h2>
        </div>

        <div className="table-container" style={{ border: 'none' }}>
          <table className="custom-table">
            <thead>
              <tr>
                <th>REF NO</th>
                <th>DATE</th>
                <th>CR NO</th>
                <th>PATIENT NAME</th>
                <th>ORDERED TESTS</th>
                <th>TEST FEE</th>
                <th>BILLING STATUS</th>
                <th>RESULT STATUS</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {labOrders.map(order => {
                const fee = order.totalFee || order.netFee || (order.tests.length * 250);
                const isPaid = order.billingStatus !== 'UNBILLED';
                return (
                  <tr key={order.id}>
                    <td style={{ fontWeight: 800, color: '#2563EB' }}>{order.refNo}</td>
                    <td style={{ fontSize: '0.8125rem' }}>{order.date}</td>
                    <td style={{ fontWeight: 700, color: '#0F766E' }}>{order.crNo}</td>
                    <td style={{ fontWeight: 700, color: '#0F172A' }}>{order.patientName} ({order.age}/{order.gender})</td>
                    <td style={{ fontSize: '0.8125rem', fontWeight: 600 }}>{order.tests.join(', ')}</td>
                    <td style={{ fontWeight: 800, color: '#0F766E' }}>₹{fee}</td>
                    <td>
                      <span className={`badge ${isPaid ? 'badge-success' : 'badge-amber'}`}>
                        {isPaid ? 'PAID & BILLED' : 'UNBILLED'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${order.status === 'COMPLETED' ? 'badge-teal' : 'badge-amber'}`}>
                        {order.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.375rem' }}>
                        <button 
                          className="btn btn-secondary btn-sm"
                          onClick={() => {
                            setSelectedOrderForResults(order);
                            setResultForm(order.results || {});
                          }}
                        >
                          Enter Values
                        </button>
                        <button 
                          className="btn btn-primary btn-sm"
                          onClick={() => setSelectedOrderForPrint(order)}
                        >
                          <Printer size={14} /> Report
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Book Order Modal WITH INTEGRATED BILLING & RECEIPT GENERATION */}
      {showOrderModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '650px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <TestTube size={22} color="#2563EB" /> Book Diagnostic Pathology Order & Collect Fee
              </h2>
              <button onClick={() => setShowOrderModal(false)} style={{ background: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleOrderSubmit}>
              {/* High-Performance Patient Search & Auto-Fill */}
              <div className="form-group" style={{ position: 'relative', marginBottom: '1.25rem' }}>
                <label className="form-label">Search Registered Patient (Name, CR No, OPD No - 28,281 Patients) *</label>
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
                  <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.15)', zIndex: 100, maxHeight: '220px', overflowY: 'auto', marginTop: '0.25rem' }}>
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
                    value={orderForm.patientName}
                    onChange={(e) => setOrderForm({ ...orderForm, patientName: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">CR Number *</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    required 
                    value={orderForm.crNo}
                    onChange={(e) => setOrderForm({ ...orderForm, crNo: e.target.value })}
                  />
                </div>
              </div>

              {/* Checkboxes for Laboratory Tests */}
              <div className="form-group" style={{ marginTop: '0.75rem' }}>
                <label className="form-label" style={{ fontWeight: 800, color: '#0F172A' }}>Select Laboratory Tests *</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.625rem', maxHeight: '200px', overflowY: 'auto', padding: '0.75rem', border: '1px solid #CBD5E1', borderRadius: '8px', backgroundColor: '#F8FAFC' }}>
                  {labTests.map(t => {
                    const rawName = t['NAME OF TEST'] || t.NAME || t.test_name;
                    const testName = (rawName && rawName !== '&nbsp;') ? rawName : `Pathology Head #${t.head_id}`;
                    const price = t.price || 250;
                    const checked = orderForm.tests.includes(testName);
                    return (
                      <label key={t.head_id || t['SR.NO.']} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8125rem', cursor: 'pointer', fontWeight: 600, color: '#0F172A', padding: '0.25rem 0.5rem', backgroundColor: checked ? '#EFF6FF' : 'transparent', borderRadius: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <input 
                            type="checkbox"
                            checked={checked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setOrderForm({ ...orderForm, tests: [...orderForm.tests, testName] });
                              } else {
                                setOrderForm({ ...orderForm, tests: orderForm.tests.filter(name => name !== testName) });
                              }
                            }}
                          />
                          <span>{testName}</span>
                        </div>
                        <span style={{ fontSize: '0.75rem', color: '#2563EB', fontWeight: 800 }}>₹{price}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* INTEGRATED BILLING & RECEIPT SUB-FORM */}
              <div style={{ padding: '1rem', backgroundColor: '#ECFDF5', borderRadius: '10px', border: '1px solid #6EE7B7', marginTop: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <div style={{ fontWeight: 800, color: '#065F46', fontSize: '0.9375rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Receipt size={18} color="#059669" />
                    <span>Pathology Fee Billing & Instant Payment</span>
                  </div>

                  <span style={{ fontSize: '0.8125rem', color: '#047857', fontWeight: 700 }}>
                    Selected Tests: {orderForm.tests.length}
                  </span>
                </div>

                <div className="grid-cols-3">
                  <div className="form-group">
                    <label className="form-label" style={{ color: '#047857' }}>Subtotal Fee (₹)</label>
                    <input 
                      type="number" 
                      className="form-control" 
                      readOnly 
                      value={totalLabFee}
                      style={{ backgroundColor: '#FFFFFF', fontWeight: 800, color: '#065F46' }}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" style={{ color: '#047857' }}>Discount (₹)</label>
                    <input 
                      type="number" 
                      className="form-control" 
                      value={orderForm.discount}
                      onChange={(e) => setOrderForm({ ...orderForm, discount: Number(e.target.value) })}
                      style={{ backgroundColor: '#FFFFFF' }}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" style={{ color: '#047857' }}>Net Bill Payable (₹)</label>
                    <input 
                      type="number" 
                      className="form-control" 
                      readOnly 
                      value={netLabFee}
                      style={{ backgroundColor: '#FFFFFF', fontWeight: 900, color: '#042F2C', fontSize: '1rem' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px dashed #A7F3D0' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', cursor: 'pointer', fontWeight: 700, color: '#065F46' }}>
                    <input 
                      type="checkbox"
                      checked={orderForm.autoGenerateReceipt}
                      onChange={(e) => setOrderForm({ ...orderForm, autoGenerateReceipt: e.target.checked })}
                    />
                    <span>Generate & Print Official Billing Receipt Immediately</span>
                  </label>

                  <div style={{ fontSize: '0.875rem', fontWeight: 900, color: '#065F46' }}>
                    Total Fee: ₹{netLabFee}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowOrderModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ backgroundColor: '#0F766E' }}>
                  Book Order & Collect ₹{netLabFee}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Enter Result Values Modal */}
      {selectedOrderForResults && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A' }}>
                Enter Result Values: {selectedOrderForResults.refNo} ({selectedOrderForResults.patientName})
              </h2>
              <button onClick={() => setSelectedOrderForResults(null)} style={{ background: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleResultSubmit}>
              {selectedOrderForResults.tests.map(tName => (
                <div key={tName} className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="form-label" style={{ fontWeight: 700, color: '#2563EB' }}>{tName} Result Output</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="e.g. Hb: 13.5 gm%, WBC: 7800/mm³..."
                    value={resultForm[tName] || ''}
                    onChange={(e) => setResultForm({ ...resultForm, [tName]: e.target.value })}
                  />
                </div>
              ))}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setSelectedOrderForResults(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save & Complete Pathology Test
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Diagnostic Report Modal */}
      {selectedOrderForPrint && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '750px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }} className="no-print">
              <h3 style={{ fontSize: '1.125rem', fontWeight: 800 }}>Pathology Diagnostic Examination Report</h3>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="btn btn-primary btn-sm" onClick={() => window.print()}>
                  <Printer size={14} /> Print Report
                </button>
                <button className="btn btn-secondary btn-sm" onClick={() => setSelectedOrderForPrint(null)}>
                  Close
                </button>
              </div>
            </div>

            <div id="printable-area" style={{ padding: '1.75rem', backgroundColor: '#FFFFFF', border: '2px solid #0F766E', borderRadius: '12px', color: '#0F172A' }}>
              {/* Executive Header Banner */}
              <div style={{ textAlign: 'center', borderBottom: '3px double #0F766E', paddingBottom: '0.875rem', marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0F766E', letterSpacing: '-0.01em' }}>
                  COER MEDICAL COLLEGE OF AYURVEDA AND HOSPITAL
                </div>
                <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#334155', marginTop: '2px' }}>
                  Vardhman Puram, 7km Roorkee-Haridwar Road, Roorkee, Uttarakhand 247667
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '2px' }}>
                  Recognized by NCISM & Ministry of AYUSH, Govt. of India • Affiliated to UAU Dehradun
                </div>
                <div style={{ fontSize: '0.9375rem', fontWeight: 800, color: '#2563EB', marginTop: '0.5rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  Central Diagnostic Pathology Laboratory Report
                </div>
              </div>

              {/* Patient & Lab Info Grid Table */}
              <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '8px', padding: '0.875rem', marginBottom: '1.25rem' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84375rem' }}>
                  <tbody>
                    <tr>
                      <td style={{ padding: '0.35rem 0.5rem', width: '20%', fontWeight: 700, color: '#475569' }}>Patient Name:</td>
                      <td style={{ padding: '0.35rem 0.5rem', width: '30%', fontWeight: 900, color: '#0F172A', textTransform: 'uppercase' }}>
                        {selectedOrderForPrint.patientName}
                      </td>
                      <td style={{ padding: '0.35rem 0.5rem', width: '20%', fontWeight: 700, color: '#475569' }}>Lab Ref No:</td>
                      <td style={{ padding: '0.35rem 0.5rem', width: '30%', fontWeight: 900, color: '#2563EB' }}>
                        {selectedOrderForPrint.refNo}
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: '0.35rem 0.5rem', fontWeight: 700, color: '#475569' }}>Age / Gender:</td>
                      <td style={{ padding: '0.35rem 0.5rem', fontWeight: 700 }}>
                        {selectedOrderForPrint.age} Yrs / {selectedOrderForPrint.gender}
                      </td>
                      <td style={{ padding: '0.35rem 0.5rem', fontWeight: 700, color: '#475569' }}>CR Number:</td>
                      <td style={{ padding: '0.35rem 0.5rem', fontWeight: 900, color: '#0F766E' }}>
                        {selectedOrderForPrint.crNo}
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: '0.35rem 0.5rem', fontWeight: 700, color: '#475569' }}>Referred By:</td>
                      <td style={{ padding: '0.35rem 0.5rem', fontWeight: 700 }}>
                        {selectedOrderForPrint.referredBy}
                      </td>
                      <td style={{ padding: '0.35rem 0.5rem', fontWeight: 700, color: '#475569' }}>Report Date:</td>
                      <td style={{ padding: '0.35rem 0.5rem', fontWeight: 700 }}>
                        {selectedOrderForPrint.date}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Pathology Results Table */}
              <div style={{ marginBottom: '2rem' }}>
                <h4 style={{ fontSize: '0.84375rem', fontWeight: 800, color: '#0F766E', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  LABORATORY DIAGNOSTIC PARAMETER EXAMINATION
                </h4>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84375rem', border: '1px solid #CBD5E1' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#F1F5F9', borderBottom: '2px solid #CBD5E1' }}>
                      <th style={{ padding: '0.625rem 0.875rem', textAlign: 'left', fontWeight: 800, color: '#334155', fontSize: '0.75rem' }}>TEST PARAMETER HEAD</th>
                      <th style={{ padding: '0.625rem 0.875rem', textAlign: 'left', fontWeight: 800, color: '#334155', fontSize: '0.75rem' }}>OBSERVED RESULT VALUE</th>
                      <th style={{ padding: '0.625rem 0.875rem', textAlign: 'left', fontWeight: 800, color: '#334155', fontSize: '0.75rem' }}>BIOLOGICAL REFERENCE RANGE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrderForPrint.tests.map((tName, idx) => {
                      const val = selectedOrderForPrint.results?.[tName] || 'Pending Parameter Value';
                      return (
                        <tr key={tName} style={{ borderBottom: '1px solid #E2E8F0', backgroundColor: idx % 2 === 0 ? '#FFFFFF' : '#F8FAFC' }}>
                          <td style={{ padding: '0.625rem 0.875rem', fontWeight: 800, color: '#2563EB' }}>{tName}</td>
                          <td style={{ padding: '0.625rem 0.875rem', fontWeight: 900, color: '#0F172A' }}>{val}</td>
                          <td style={{ padding: '0.625rem 0.875rem', color: '#64748B', fontStyle: 'italic' }}>Standard Reference Limit</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Signatures */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '2.5rem', paddingTop: '1.25rem', borderTop: '1px solid #CBD5E1', fontSize: '0.8125rem' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ borderBottom: '1px solid #94A3B8', width: '170px', marginBottom: '0.35rem' }}></div>
                  <div style={{ fontWeight: 700, color: '#475569' }}>Lab Technician</div>
                  <div style={{ fontSize: '0.7rem', color: '#94A3B8' }}>DMLT Staff</div>
                </div>

                <div style={{ textAlign: 'center' }}>
                  <div style={{ borderBottom: '1px solid #94A3B8', width: '220px', marginBottom: '0.35rem' }}></div>
                  <div style={{ fontWeight: 800, color: '#0F766E' }}>Dr. Vikas Saluja (MD Pathology)</div>
                  <div style={{ fontSize: '0.7rem', color: '#64748B' }}>Head of Department • Clinical Pathology</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
