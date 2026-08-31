import React from 'react';
import { X, User, Activity, Sparkles, TestTube, Receipt, Pill, Printer, Phone, MapPin } from 'lucide-react';
import { useHospital } from '../context/HospitalContext';

export const PatientDetailModal = () => {
  const { activePatientModal, setActivePatientModal, ipdPatients, panchkarmaLogs, labOrders, dispensedMedicines, receipts } = useHospital();

  if (!activePatientModal) return null;

  const p = activePatientModal;
  const patientCrNo = p.crNo;

  // Correlated Records
  const ipdRecord = ipdPatients.find(i => i.crNo === patientCrNo);
  const pkarmaRecords = panchkarmaLogs.filter(pk => pk.crNo === patientCrNo);
  const labRecords = labOrders.filter(lo => lo.crNo === patientCrNo);
  const pharmacyRecords = dispensedMedicines.filter(dm => dm.crNo === patientCrNo);
  const billingRecords = receipts.filter(r => r.crNo === patientCrNo);

  return (
    <div className="modal-overlay" style={{ zIndex: 9999 }}>
      <div className="modal-content" style={{ maxWidth: '800px', maxHeight: '92vh', overflowY: 'auto', padding: '1.75rem' }}>
        {/* OFFICIAL PRINT-ONLY LETTERHEAD BANNER */}
        <div className="print-only-letterhead">
          <h1 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0F766E', marginBottom: '2px' }}>
            COER MEDICAL COLLEGE OF AYURVEDA AND HOSPITAL
          </h1>
          <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#334155' }}>
            Vardhman Puram, 7km Roorkee-Haridwar Road, Roorkee, Uttarakhand 247667
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '2px' }}>
            Recognized by NCISM & Ministry of AYUSH, Govt. of India • Affiliated to UAU Dehradun
          </div>
          <div style={{ fontSize: '0.875rem', fontWeight: 800, color: '#0F766E', marginTop: '0.5rem', textTransform: 'uppercase' }}>
            Official Comprehensive Clinical Patient Medical Record
          </div>
        </div>

        {/* Modal Header Banner with Patient Name */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #E2E8F0', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '50%', backgroundColor: '#0F766E', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', fontWeight: 900, flexShrink: 0 }}>
                {p.name ? p.name.charAt(0).toUpperCase() : 'P'}
              </div>
              <div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0F172A', lineHeight: 1.1, textTransform: 'uppercase' }}>
                  {p.name || 'PATIENT RECORD'}
                </h2>
                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#334155', marginTop: '0.25rem' }}>
                  Age: <strong>{p.age || 'N/A'} Yrs</strong> • Gender: <strong>{p.gender || 'N/A'}</strong> • Guardian / Father: <strong>{p.guardianName || p.guardian || p.fatherName || 'N/A'}</strong>
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }} className="no-print">
            <button className="btn btn-secondary btn-sm" onClick={() => window.print()}>
              <Printer size={14} /> Print Patient Record
            </button>
            <button onClick={() => setActivePatientModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}>
              <X size={22} />
            </button>
          </div>
        </div>

        {/* Patient Key Identification Badges */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.625rem', marginBottom: '1.25rem', padding: '0.75rem 1rem', backgroundColor: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
          <span className="badge badge-teal" style={{ fontSize: '0.8125rem', padding: '0.35rem 0.75rem', fontWeight: 800 }}>
            CR NO: {p.crNo}
          </span>
          <span className="badge badge-info" style={{ fontSize: '0.8125rem', padding: '0.35rem 0.75rem', fontWeight: 800 }}>
            OPD NO: {p.opdNo}
          </span>
          <span className="badge badge-amber" style={{ fontSize: '0.8125rem', padding: '0.35rem 0.75rem', fontWeight: 800 }}>
            DEPT: {p.department}
          </span>
          <span className="badge badge-success" style={{ fontSize: '0.8125rem', padding: '0.35rem 0.75rem', fontWeight: 800 }}>
            DEPT CODE: {p.deptOpdNo || 'KC/OPD'}
          </span>
        </div>

        {/* Demographics & Clinical Information Grid */}
        <div className="grid-cols-2" style={{ marginBottom: '1.25rem' }}>
          <div style={{ padding: '1rem', borderRadius: '10px', backgroundColor: '#F0FDF4', border: '1px solid #A7F3D0' }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 800, color: '#0F766E', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <Activity size={16} /> Clinical & OPD Information
            </h3>
            <div style={{ fontSize: '0.8125rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', color: '#334155' }}>
              <div><strong>Primary Diagnosis:</strong> <span style={{ color: '#0F766E', fontWeight: 700 }}>{p.diagnosis || 'Kayachikitsa General'}</span></div>
              <div><strong>Attending Doctor:</strong> {p.doctor || 'Dr. Ravi Joshi'}</div>
              <div><strong>Registration Type:</strong> {p.regType || 'NEW REGISTRATION'}</div>
              <div><strong>Reg Date:</strong> {p.regDate || '2026-08-26'}</div>
            </div>
          </div>

          <div style={{ padding: '1rem', borderRadius: '10px', backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE' }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 800, color: '#1E40AF', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <MapPin size={16} /> Contact & Residential Address
            </h3>
            <div style={{ fontSize: '0.8125rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', color: '#334155' }}>
              <div><strong>Mobile Number:</strong> <span style={{ color: '#2563EB', fontWeight: 700 }}>{p.phone || p.mobile || p.contact || 'Not Recorded'}</span></div>
              <div><strong>Address:</strong> {p.address || 'Roorkee, Haridwar, Uttarakhand'}</div>
              <div><strong>IPD Admission:</strong> {ipdRecord ? `Admitted in Bed ${ipdRecord.bedCode} (${ipdRecord.status})` : 'Outpatient (OPD)'}</div>
            </div>
          </div>
        </div>

        {/* TABULAR MEDICAL HISTORY & RECORDED DATA */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Panchkarma Procedures History */}
          <div>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <Sparkles size={16} color="#0F766E" /> Panchkarma Specialty Therapy History ({pkarmaRecords.length})
            </h4>
            {pkarmaRecords.length === 0 ? (
              <div style={{ fontSize: '0.8125rem', color: '#64748B', fontStyle: 'italic', padding: '0.5rem 0' }}>
                No Panchkarma procedures recorded for this patient yet.
              </div>
            ) : (
              <div className="table-container">
                <table className="custom-table" style={{ fontSize: '0.8125rem' }}>
                  <thead>
                    <tr>
                      <th>DATE</th>
                      <th>SNEHAN</th>
                      <th>SWEDAN</th>
                      <th>SHIRODHARA</th>
                      <th>NASHYA</th>
                      <th>BASTI</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pkarmaRecords.map((pk, idx) => (
                      <tr key={idx}>
                        <td>{pk.date}</td>
                        <td style={{ fontWeight: 600 }}>{pk.snehan}</td>
                        <td style={{ fontWeight: 600 }}>{pk.swedan}</td>
                        <td style={{ fontWeight: 600 }}>{pk.shirodhara}</td>
                        <td style={{ fontWeight: 600 }}>{pk.nashya}</td>
                        <td style={{ fontWeight: 600 }}>{pk.basti}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Pharmacy Dispensations Summary */}
          <div>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <Pill size={16} color="#0F766E" /> Pharmacy Dispensed Medicines ({pharmacyRecords.length})
            </h4>
            {pharmacyRecords.length === 0 ? (
              <div style={{ fontSize: '0.8125rem', color: '#64748B', fontStyle: 'italic', padding: '0.5rem 0' }}>
                No pharmacy medicine dispensations on record.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {pharmacyRecords.map((dm, idx) => (
                  <div key={idx} style={{ padding: '0.625rem 0.875rem', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '0.8125rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: '#0F766E' }}>
                      <span>Prescription Date: {dm.date}</span>
                      <span>Total Pharmacy Bill: ₹{dm.totalAmount}</span>
                    </div>
                    <div style={{ color: '#475569', marginTop: '0.25rem' }}>
                      {(dm.items || []).map(i => `${i.medicineName} (${i.dosage}, Qty: ${i.qty})`).join(', ')}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Laboratory Diagnostic Orders */}
          <div>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <TestTube size={16} color="#2563EB" /> Pathology Diagnostic Orders ({labRecords.length})
            </h4>
            {labRecords.length === 0 ? (
              <div style={{ fontSize: '0.8125rem', color: '#64748B', fontStyle: 'italic', padding: '0.5rem 0' }}>
                No diagnostic test orders booked for this patient yet.
              </div>
            ) : (
              <div className="table-container">
                <table className="custom-table" style={{ fontSize: '0.8125rem' }}>
                  <thead>
                    <tr>
                      <th>REF NO</th>
                      <th>DATE</th>
                      <th>TESTS ORDERED</th>
                      <th>STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {labRecords.map((lo, idx) => (
                      <tr key={idx}>
                        <td style={{ fontWeight: 800, color: '#2563EB' }}>{lo.refNo}</td>
                        <td>{lo.date}</td>
                        <td>{lo.tests.join(', ')}</td>
                        <td>
                          <span className={`badge ${lo.status === 'COMPLETED' ? 'badge-success' : 'badge-amber'}`}>
                            {lo.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Financial Receipts */}
          <div>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <Receipt size={16} color="#D97706" /> Financial Billing Receipts ({billingRecords.length})
            </h4>
            {billingRecords.length === 0 ? (
              <div style={{ fontSize: '0.8125rem', color: '#64748B', fontStyle: 'italic', padding: '0.5rem 0' }}>
                No financial receipts generated for this patient yet.
              </div>
            ) : (
              <div className="table-container">
                <table className="custom-table" style={{ fontSize: '0.8125rem' }}>
                  <thead>
                    <tr>
                      <th>RECEIPT NO</th>
                      <th>REMARKS / PARTICULARS</th>
                      <th>CHARGE</th>
                      <th>RECEIVED</th>
                      <th>DUE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {billingRecords.map((r, idx) => (
                      <tr key={idx}>
                        <td style={{ fontWeight: 800, color: '#0F766E' }}>{r.receiptNo}</td>
                        <td>{r.remarks}</td>
                        <td>₹{r.total || r.charge}</td>
                        <td style={{ fontWeight: 700, color: '#16A34A' }}>₹{r.received}</td>
                        <td style={{ fontWeight: 700, color: r.due > 0 ? '#DC2626' : '#64748B' }}>₹{r.due}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #E2E8F0' }} className="no-print">
          <button className="btn btn-secondary" onClick={() => setActivePatientModal(null)}>
            Close Patient Window
          </button>
        </div>
      </div>
    </div>
  );
};
