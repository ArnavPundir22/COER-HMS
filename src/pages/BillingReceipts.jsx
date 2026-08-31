import React, { useState, useMemo } from 'react';
import { Receipt, Plus, Search, CheckCircle2, X, Trash2, Printer, Filter, DollarSign } from 'lucide-react';
import { useHospital } from '../context/HospitalContext';

export const BillingReceipts = () => {
  const { receipts, opdPatients, addReceipt, settleReceiptDue, deleteReceipt, dispensedMedicines, markDispensationBilled } = useHospital();
  
  const [showModal, setShowModal] = useState(false);
  const [selectedReceiptForPrint, setSelectedReceiptForPrint] = useState(null);
  const [opdSearch, setOpdSearch] = useState('');
  const [showOpdSuggestions, setShowOpdSuggestions] = useState(false);

  const [receiptForm, setReceiptForm] = useState({
    crNo: '',
    name: '',
    charge: 100,
    discount: 0,
    received: 100,
    remarks: 'OPD Ticket Fee - General Consultation'
  });

  // Selected patient's unbilled pharmacy dispensation lookup
  const pendingPharmacyDispensation = useMemo(() => {
    if (!receiptForm.crNo) return null;
    return dispensedMedicines.find(d => d.crNo === receiptForm.crNo && d.billingStatus !== 'BILLED');
  }, [receiptForm.crNo, dispensedMedicines]);

  // Total calculated fee automatically summing OPD charge + pending pharmacy prescriptions
  const calculatedGrossCharge = useMemo(() => {
    const base = Number(receiptForm.charge) || 0;
    const pharm = pendingPharmacyDispensation ? Number(pendingPharmacyDispensation.totalAmount || 0) : 0;
    return base + pharm;
  }, [receiptForm.charge, pendingPharmacyDispensation]);

  const calculatedNetTotal = useMemo(() => {
    return Math.max(0, calculatedGrossCharge - (Number(receiptForm.discount) || 0));
  }, [calculatedGrossCharge, receiptForm.discount]);

  const calculatedDue = useMemo(() => {
    return Math.max(0, calculatedNetTotal - (Number(receiptForm.received) || 0));
  }, [calculatedNetTotal, receiptForm.received]);

  // Autocomplete suggestions (Max 100 matching)
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
    // Check if this patient has an unbilled pharmacy summary
    const pendingDisp = dispensedMedicines.find(d => d.crNo === p.crNo && d.billingStatus !== 'BILLED');
    let autoRemarks = `OPD Registration & Fee - ${p.department}`;
    let baseOpdCharge = 100;

    if (pendingDisp) {
      const medListNames = (pendingDisp.items || []).map(i => i.medicineName).join(', ');
      autoRemarks = `Integrated Fee: OPD Consultation (${p.department}) + Pharmacy Medicines (${medListNames})`;
    }

    const totalGross = baseOpdCharge + (pendingDisp ? Number(pendingDisp.totalAmount || 0) : 0);

    setReceiptForm({
      crNo: p.crNo,
      name: p.name,
      charge: baseOpdCharge,
      discount: 0,
      received: totalGross,
      remarks: autoRemarks
    });
    setOpdSearch(`CR: ${p.crNo} - ${p.name}`);
    setShowOpdSuggestions(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!receiptForm.name) return;

    addReceipt({
      crNo: receiptForm.crNo,
      name: receiptForm.name,
      charge: calculatedGrossCharge,
      discount: Number(receiptForm.discount) || 0,
      total: calculatedNetTotal,
      received: Number(receiptForm.received) || 0,
      due: calculatedDue,
      remarks: receiptForm.remarks
    });

    // Automatically mark the pharmacy dispensation as BILLED & CLEARED
    if (pendingPharmacyDispensation) {
      markDispensationBilled(pendingPharmacyDispensation.id);
    }

    setShowModal(false);
    setOpdSearch('');
    setShowOpdSuggestions(false);
    setReceiptForm({ crNo: '', name: '', charge: 100, discount: 0, received: 100, remarks: 'OPD Ticket Fee' });
  };

  const handleDeleteReceiptEntry = (rec) => {
    if (window.confirm(`Are you sure you want to delete financial receipt ${rec.receiptNo} for ${rec.name}?`)) {
      deleteReceipt(rec.receiptNo);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Receipt color="#0F766E" size={26} /> Financial Billing & Integrated Fee Receipts
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.875rem' }}>
            Issue fee payment receipts with auto-integrated Pharmacy medicine summaries, IPD charges, and Lab tests.
          </p>
        </div>

        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={18} /> Generate New Fee Receipt
        </button>
      </div>

      {/* Financial Receipts Ledger Table */}
      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #E2E8F0' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#0F172A' }}>
            Financial Receipts Ledger ({receipts.length})
          </h2>
        </div>

        <div className="table-container" style={{ border: 'none' }}>
          <table className="custom-table">
            <thead>
              <tr>
                <th>RECEIPT NO</th>
                <th>RECEIPT DATE & TIME</th>
                <th>CR NO</th>
                <th>PATIENT NAME</th>
                <th>PARTICULARS / REMARKS</th>
                <th>CHARGE</th>
                <th>DISCOUNT</th>
                <th>TOTAL</th>
                <th>RECEIVED</th>
                <th>DUE AMOUNT</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {receipts.map(rec => (
                <tr key={rec.receiptNo}>
                  <td style={{ fontWeight: 800, color: '#0F766E' }}>{rec.receiptNo}</td>
                  <td style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#334155', whiteSpace: 'nowrap' }}>
                    {rec.date || '2026-08-26'}
                  </td>
                  <td style={{ fontWeight: 700, color: '#2563EB' }}>{rec.crNo}</td>
                  <td style={{ fontWeight: 700, color: '#0F172A' }}>{rec.name}</td>
                  <td style={{ fontSize: '0.8125rem', color: '#475569' }}>{rec.remarks}</td>
                  <td>₹{rec.charge}</td>
                  <td>₹{rec.discount || 0}</td>
                  <td style={{ fontWeight: 700 }}>₹{rec.total}</td>
                  <td style={{ fontWeight: 800, color: '#0F766E' }}>₹{rec.received}</td>
                  <td>
                    {rec.due > 0 ? (
                      <span className="badge badge-amber" style={{ fontWeight: 800 }}>₹{rec.due} DUE</span>
                    ) : (
                      <span className="badge badge-success">PAID</span>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.375rem' }}>
                      {rec.due > 0 && (
                        <button 
                          className="btn btn-secondary btn-sm"
                          onClick={() => {
                            const pay = prompt(`Enter Payment Amount to settle Due (Remaining Due: ₹${rec.due}):`, rec.due);
                            if (pay && !isNaN(pay)) {
                              settleReceiptDue(rec.receiptNo, Number(pay));
                            }
                          }}
                        >
                          Settle
                        </button>
                      )}
                      <button 
                        className="btn btn-primary btn-sm"
                        title="Print Receipt"
                        onClick={() => setSelectedReceiptForPrint(rec)}
                      >
                        <Printer size={14} />
                      </button>
                      <button 
                        className="btn btn-danger btn-sm"
                        title="Delete Receipt Entry"
                        onClick={() => handleDeleteReceiptEntry(rec)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Receipt Modal with Auto Pharmacy Dispensed Summary */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '650px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Receipt size={22} color="#0F766E" /> Generate Fee Payment Receipt
              </h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              {/* High-Performance Patient Search */}
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
                    value={receiptForm.name}
                    onChange={(e) => setReceiptForm({ ...receiptForm, name: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">CR Number *</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    required 
                    value={receiptForm.crNo}
                    onChange={(e) => setReceiptForm({ ...receiptForm, crNo: e.target.value })}
                  />
                </div>
              </div>

              {/* UNBILLED PHARMACY PRESCRIPTION ALERT BANNER */}
              {pendingPharmacyDispensation && (
                <div style={{ padding: '0.875rem', backgroundColor: '#ECFDF5', borderRadius: '8px', border: '1px solid #6EE7B7', margin: '1rem 0' }}>
                  <div style={{ fontWeight: 800, color: '#0F766E', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                    <CheckCircle2 size={16} /> Unbilled Pharmacy Prescription Detected!
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: '#047857', marginTop: '0.25rem' }}>
                    Formulations: <strong>{(pendingPharmacyDispensation.items || []).map(i => i.medicineName).join(', ')}</strong>
                  </div>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 800, color: '#042F2C', marginTop: '0.25rem' }}>
                    Pharmacy Prescribed Amount: ₹{pendingPharmacyDispensation.totalAmount} (Auto-Integrated)
                  </div>
                </div>
              )}

              <div className="form-group" style={{ marginTop: '0.75rem' }}>
                <label className="form-label">Particulars / Fee Description *</label>
                <input 
                  type="text" 
                  className="form-control" 
                  required 
                  value={receiptForm.remarks}
                  onChange={(e) => setReceiptForm({ ...receiptForm, remarks: e.target.value })}
                />
              </div>

              <div className="grid-cols-2" style={{ marginTop: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label">OPD Base Ticket Charge (₹) *</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    required 
                    value={receiptForm.charge}
                    onChange={(e) => setReceiptForm({ ...receiptForm, charge: Number(e.target.value) })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Discount (₹)</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    value={receiptForm.discount}
                    onChange={(e) => setReceiptForm({ ...receiptForm, discount: Number(e.target.value) })}
                  />
                </div>
              </div>

              {/* Calculated Summary Bar */}
              <div style={{ padding: '0.875rem', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0', margin: '1rem 0', fontSize: '0.875rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                  <span>Gross Combined Charge (OPD + Pharmacy):</span>
                  <strong>₹{calculatedGrossCharge}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, color: '#0F766E', fontSize: '1rem', borderTop: '1px dashed #CBD5E1', paddingTop: '0.5rem', marginTop: '0.25rem' }}>
                  <span>Net Payable Total:</span>
                  <span>₹{calculatedNetTotal}</span>
                </div>
              </div>

              <div className="grid-cols-2">
                <div className="form-group">
                  <label className="form-label">Amount Received (₹) *</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    required 
                    value={receiptForm.received}
                    onChange={(e) => setReceiptForm({ ...receiptForm, received: Number(e.target.value) })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Calculated Remaining Due (₹)</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    readOnly 
                    value={calculatedDue}
                    style={{ fontWeight: 800, color: calculatedDue > 0 ? '#DC2626' : '#16A34A', backgroundColor: '#F1F5F9' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Receipt & Clear Pharmacy Balance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Receipt Modal */}
      {selectedReceiptForPrint && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '650px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }} className="no-print">
              <h3 style={{ fontSize: '1.125rem', fontWeight: 800 }}>Official Fee Payment Receipt</h3>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="btn btn-primary btn-sm" onClick={() => window.print()}>
                  <Printer size={14} /> Print Receipt
                </button>
                <button className="btn btn-secondary btn-sm" onClick={() => setSelectedReceiptForPrint(null)}>
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
                <div style={{ fontSize: '0.9375rem', fontWeight: 800, color: '#D97706', marginTop: '0.5rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  OFFICIAL FINANCIAL FEE PAYMENT RECEIPT
                </div>
              </div>

              {/* Patient & Receipt Key Info Table */}
              <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '8px', padding: '0.875rem', marginBottom: '1.25rem' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84375rem' }}>
                  <tbody>
                    <tr>
                      <td style={{ padding: '0.35rem 0.5rem', width: '20%', fontWeight: 700, color: '#475569' }}>Receipt Number:</td>
                      <td style={{ padding: '0.35rem 0.5rem', width: '30%', fontWeight: 900, color: '#0F766E' }}>
                        {selectedReceiptForPrint.receiptNo}
                      </td>
                      <td style={{ padding: '0.35rem 0.5rem', width: '20%', fontWeight: 700, color: '#475569' }}>CR Number:</td>
                      <td style={{ padding: '0.35rem 0.5rem', width: '30%', fontWeight: 900, color: '#2563EB' }}>
                        {selectedReceiptForPrint.crNo}
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: '0.35rem 0.5rem', fontWeight: 700, color: '#475569' }}>Patient Name:</td>
                      <td colSpan={3} style={{ padding: '0.35rem 0.5rem', fontWeight: 900, color: '#0F172A', textTransform: 'uppercase' }}>
                        {selectedReceiptForPrint.name}
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: '0.35rem 0.5rem', fontWeight: 700, color: '#475569' }}>Particulars / Remarks:</td>
                      <td colSpan={3} style={{ padding: '0.35rem 0.5rem', fontWeight: 700, color: '#334155' }}>
                        {selectedReceiptForPrint.remarks}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Financial Amount Ledger Box */}
              <div style={{ border: '1px solid #CBD5E1', borderRadius: '8px', padding: '1rem', backgroundColor: '#FFFFFF', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem', fontSize: '0.875rem' }}>
                  <span style={{ fontWeight: 700, color: '#475569' }}>Gross Charge Amount:</span>
                  <span style={{ fontWeight: 800 }}>₹{selectedReceiptForPrint.charge}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                  <span style={{ fontWeight: 700, color: '#475569' }}>Discount Allowed:</span>
                  <span style={{ fontWeight: 700, color: '#DC2626' }}>- ₹{selectedReceiptForPrint.discount || 0}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: '2px dashed #CBD5E1', backgroundColor: '#F0FDF4', padding: '0.625rem 0.875rem', borderRadius: '6px' }}>
                  <span style={{ fontSize: '0.9375rem', fontWeight: 900, color: '#0F766E' }}>NET AMOUNT RECEIVED:</span>
                  <span style={{ fontSize: '1.125rem', fontWeight: 900, color: '#042F2C' }}>₹{selectedReceiptForPrint.received}</span>
                </div>

                {selectedReceiptForPrint.due > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.84375rem', color: '#DC2626', fontWeight: 800 }}>
                    <span>Remaining Due Balance:</span>
                    <span>₹{selectedReceiptForPrint.due}</span>
                  </div>
                )}
              </div>

              {/* Signatures */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '2.5rem', paddingTop: '1.25rem', borderTop: '1px solid #CBD5E1', fontSize: '0.8125rem' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ borderBottom: '1px solid #94A3B8', width: '170px', marginBottom: '0.35rem' }}></div>
                  <div style={{ fontWeight: 700, color: '#475569' }}>Cashier Signature</div>
                  <div style={{ fontSize: '0.7rem', color: '#94A3B8' }}>Central Billing Desk</div>
                </div>

                <div style={{ textAlign: 'center' }}>
                  <div style={{ borderBottom: '1px solid #94A3B8', width: '180px', marginBottom: '0.35rem' }}></div>
                  <div style={{ fontWeight: 700, color: '#475569' }}>Hospital Stamp / Seal</div>
                  <div style={{ fontSize: '0.7rem', color: '#94A3B8' }}>Accounts & Finance</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
