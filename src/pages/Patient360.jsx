import React, { useState } from 'react';
import { UserCheck, Search, Activity, Sparkles, BedDouble, TestTube, Receipt } from 'lucide-react';
import { useHospital } from '../context/HospitalContext';

export const Patient360 = () => {
  const { opdPatients, ipdPatients, panchkarmaLogs, labOrders, receipts } = useHospital();
  const [selectedCrNo, setSelectedCrNo] = useState(opdPatients[0]?.crNo || '');

  const patientOpd = opdPatients.find(p => p.crNo === selectedCrNo) || opdPatients[0];
  const patientIpds = ipdPatients.filter(p => p.crNo === selectedCrNo);
  const patientPanchkarma = panchkarmaLogs.filter(p => p.crNo === selectedCrNo);
  const patientLabs = labOrders.filter(p => p.crNo === selectedCrNo);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <UserCheck color="#0F766E" size={26} /> Patient 360° Comprehensive Medical History
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.875rem' }}>
            Unified clinical timeline tracking OPD visits, IPD bed stays, Panchkarma sessions, Lab diagnostics, and Receipts.
          </p>
        </div>
      </div>

      {/* Patient Selector */}
      <div className="card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Search size={18} color="#64748B" />
        <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0F172A' }}>Select Patient CR Number:</span>
        <select 
          className="form-control" 
          value={selectedCrNo}
          onChange={(e) => setSelectedCrNo(e.target.value)}
          style={{ maxWidth: '400px' }}
        >
          {opdPatients.map(p => (
            <option key={p.id} value={p.crNo}>
              CR: {p.crNo} - {p.name} ({p.department})
            </option>
          ))}
        </select>
      </div>

      {patientOpd && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Patient Demographic Card */}
          <div className="card" style={{ borderLeft: '4px solid #0F766E' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A' }}>{patientOpd.name}</h2>
                <div style={{ fontSize: '0.875rem', color: '#64748B', marginTop: '0.25rem' }}>
                  {patientOpd.age} Yrs • {patientOpd.gender} • Address: {patientOpd.address}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <span className="badge badge-teal">CR: {patientOpd.crNo}</span>
                <span className="badge badge-blue">OPD: {patientOpd.opdNo}</span>
                <span className="badge badge-amber">{patientOpd.department}</span>
              </div>
            </div>
          </div>

          {/* Timeline Grid */}
          <div className="grid-cols-2">
            {/* OPD & IPD Clinical History */}
            <div className="card">
              <div className="card-header">
                <div className="card-title">
                  <Activity size={18} color="#0F766E" />
                  <span>OPD & IPD Clinical Log</span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ padding: '0.75rem', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontWeight: 700, color: '#0F172A', fontSize: '0.875rem' }}>Primary OPD Visit</div>
                  <div style={{ fontSize: '0.8125rem', color: '#64748B' }}>Date: {patientOpd.date || 'Active'} • Doctor: {patientOpd.doctor}</div>
                  <div style={{ fontSize: '0.8125rem', color: '#0F766E', fontWeight: 600, marginTop: '0.25rem' }}>
                    Diagnosis: {patientOpd.diagnosis}
                  </div>
                </div>

                {patientIpds.map(ipd => (
                  <div key={ipd.id} style={{ padding: '0.75rem', backgroundColor: '#EFF6FF', borderRadius: '8px', border: '1px solid #BFDBFE' }}>
                    <div style={{ fontWeight: 700, color: '#1E3A8A', fontSize: '0.875rem' }}>IPD Ward Stay (Bed: {ipd.bedCode})</div>
                    <div style={{ fontSize: '0.8125rem', color: '#475569' }}>Admit Date: {ipd.admitDate} • Status: {ipd.status}</div>
                    <div style={{ fontSize: '0.8125rem', color: '#2563EB', fontWeight: 600, marginTop: '0.25rem' }}>
                      IPD Diagnosis: {ipd.diagnosis}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Panchkarma & Lab Diagnostic History */}
            <div className="card">
              <div className="card-header">
                <div className="card-title">
                  <Sparkles size={18} color="#D97706" />
                  <span>Panchkarma & Lab History</span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {patientPanchkarma.length > 0 ? patientPanchkarma.map(pk => (
                  <div key={pk.id} style={{ padding: '0.75rem', backgroundColor: '#FFFBEB', borderRadius: '8px', border: '1px solid #FEF3C7' }}>
                    <div style={{ fontWeight: 700, color: '#78350F', fontSize: '0.875rem' }}>Panchkarma Therapy Session</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Date: {pk.date} • Consultant: {pk.doctor}</div>
                    <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap', marginTop: '0.375rem' }}>
                      {pk.snehan && pk.snehan !== '-' && <span className="badge badge-amber">{pk.snehan}</span>}
                      {pk.swedan && pk.swedan !== '-' && <span className="badge badge-amber">{pk.swedan}</span>}
                      {pk.shirodhara && pk.shirodhara !== '-' && <span className="badge badge-success">{pk.shirodhara}</span>}
                    </div>
                  </div>
                )) : (
                  <div style={{ fontSize: '0.8125rem', color: '#94A3B8' }}>No Panchkarma sessions logged yet.</div>
                )}

                {patientLabs.length > 0 ? patientLabs.map(lab => (
                  <div key={lab.id} style={{ padding: '0.75rem', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontWeight: 700, color: '#2563EB', fontSize: '0.875rem' }}>Lab Order ({lab.refNo})</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Tests: {lab.tests.join(', ')}</div>
                  </div>
                )) : (
                  <div style={{ fontSize: '0.8125rem', color: '#94A3B8' }}>No Lab test orders logged yet.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
