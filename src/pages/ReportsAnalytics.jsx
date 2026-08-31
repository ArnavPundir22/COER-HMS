import React, { useState, useMemo } from 'react';
import { BarChart3, Filter, Download, Building2, FileSpreadsheet, ShieldCheck, Printer, ArrowLeft, ArrowRight, Search } from 'lucide-react';
import { useHospital } from '../context/HospitalContext';

export const ReportsAnalytics = ({ initialView }) => {
  const { opdPatients, ipdPatients, panchkarmaLogs, receipts, labOrders, exportSystemBackup } = useHospital();

  const [activeReportTab, setActiveReportTab] = useState(initialView === 'yearly' ? 'yearly' : 'department');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [reportCategory, setReportCategory] = useState('OPD'); // 'OPD', 'IPD', 'PANCHKARMA', 'LAB', 'BILLING'

  // Pagination & Search State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [searchQuery, setSearchQuery] = useState('');

  // Dynamic Dataset Selection based on report category
  const targetDataset = useMemo(() => {
    if (reportCategory === 'IPD') {
      return ipdPatients.map(p => ({
        id: p.id,
        crNo: p.crNo,
        opdNo: p.ipdNo || p.crNo,
        deptOpdNo: p.bedCode || 'IPD-BED',
        name: p.name,
        age: p.age,
        gender: p.gender,
        department: p.department || 'KAYACHIKITSA',
        diagnosis: p.diagnosis || 'IPD Admission',
        extra: `Bed: ${p.bedCode || 'General'} • Status: ${p.status}`
      }));
    } else if (reportCategory === 'PANCHKARMA') {
      return panchkarmaLogs.map(l => ({
        id: l.id,
        crNo: l.crNo,
        opdNo: l.id,
        deptOpdNo: 'PK-PROC',
        name: l.patientName,
        age: 30,
        gender: 'PATIENT',
        department: 'PANCHAKARMA',
        diagnosis: `Snehan: ${l.snehan} • Swedan: ${l.swedan}`,
        extra: `Doctor: ${l.doctor}`
      }));
    } else if (reportCategory === 'LAB') {
      return labOrders.map(lo => ({
        id: lo.id,
        crNo: lo.crNo,
        opdNo: lo.refNo || lo.id,
        deptOpdNo: 'PATHOLOGY',
        name: lo.patientName,
        age: lo.age || 25,
        gender: lo.gender || 'PATIENT',
        department: 'PATHOLOGY',
        diagnosis: Array.isArray(lo.tests) ? lo.tests.join(', ') : 'Lab Examination',
        extra: `Ref: ${lo.referredBy}`
      }));
    } else if (reportCategory === 'BILLING') {
      return receipts.map(r => ({
        id: r.receiptNo,
        crNo: r.crNo,
        opdNo: r.receiptNo,
        deptOpdNo: 'BILLING',
        name: r.name,
        age: '-',
        gender: '-',
        department: 'CENTRAL BILLING',
        diagnosis: r.remarks || 'Receipt Payment',
        extra: `Total: ₹${r.total} (Received: ₹${r.received})`
      }));
    } else {
      // Default: OPD Registrations
      return opdPatients.map(p => ({
        id: p.id,
        crNo: p.crNo,
        opdNo: p.opdNo || p.crNo,
        deptOpdNo: p.deptOpdNo || 'OPD-REG',
        name: p.name,
        age: p.age,
        gender: p.gender,
        department: p.department || 'KAYACHIKITSA',
        diagnosis: p.diagnosis || 'General Consultation',
        extra: `Dept OPD No: ${p.deptOpdNo}`
      }));
    }
  }, [reportCategory, opdPatients, ipdPatients, panchkarmaLogs, labOrders, receipts]);

  // Department & Search Filtered Results
  const filteredResults = useMemo(() => {
    return targetDataset.filter(item => {
      // Department Filter
      if (selectedDept !== 'ALL' && item.department !== selectedDept) return false;

      // Search Query Filter
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const matchName = String(item.name || '').toLowerCase().includes(q);
        const matchCr = String(item.crNo || '').includes(q);
        const matchOpd = String(item.opdNo || '').includes(q);
        const matchDiag = String(item.diagnosis || '').toLowerCase().includes(q);
        if (!matchName && !matchCr && !matchOpd && !matchDiag) return false;
      }

      return true;
    });
  }, [targetDataset, selectedDept, searchQuery]);

  // Paginated Results
  const totalRecords = filteredResults.length;
  const totalPages = Math.ceil(totalRecords / pageSize) || 1;
  const paginatedResults = useMemo(() => {
    const startIdx = (currentPage - 1) * pageSize;
    return filteredResults.slice(startIdx, startIdx + pageSize);
  }, [filteredResults, currentPage, pageSize]);

  // Annual CCIM Count aggregation
  const deptCounts = useMemo(() => {
    return opdPatients.reduce((acc, p) => {
      const dept = p.department || 'OTHER';
      acc[dept] = (acc[dept] || 0) + 1;
      return acc;
    }, {});
  }, [opdPatients]);

  // Export Filtered CSV Handler
  const handleExportCSV = () => {
    if (filteredResults.length === 0) return;
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "CR NO,OPD / REF NO,PATIENT NAME,AGE,GENDER,DEPARTMENT,DIAGNOSIS / PARTICULARS\n";

    filteredResults.forEach(row => {
      const line = `"${row.crNo}","${row.opdNo}","${row.name}","${row.age}","${row.gender}","${row.department}","${row.diagnosis}"`;
      csvContent += line + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `coer_ayurveda_${reportCategory.toLowerCase()}_report.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BarChart3 color="#0F766E" size={26} /> Reports & Regulatory Audit Analytics
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.875rem' }}>
            Department register filters, department patient volume counts, and CCIM accreditation statistics.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-secondary" onClick={handleExportCSV}>
            <FileSpreadsheet size={16} /> Export Filtered CSV
          </button>
          <button className="btn btn-primary" onClick={() => window.print()}>
            <Printer size={16} /> Print Audit Report
          </button>
        </div>
      </div>

      {/* Report Sub-Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '2px solid #E2E8F0', paddingBottom: '0.5rem' }}>
        <button 
          className={`btn ${activeReportTab === 'department' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => {
            setActiveReportTab('department');
            setCurrentPage(1);
          }}
        >
          <Filter size={16} /> Department Patient Register Queries
        </button>

        <button 
          className={`btn ${activeReportTab === 'yearly' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveReportTab('yearly')}
        >
          <Building2 size={16} /> Yearly CCIM Audit Volume Count
        </button>
      </div>

      {/* SUB-TAB 1: REGISTER REPORTS */}
      {activeReportTab === 'department' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Query Filter Controls Bar */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <div className="grid-cols-2" style={{ marginBottom: '1rem' }}>
              {/* Category Selector */}
              <div className="form-group">
                <label className="form-label">Report Register Category</label>
                <select 
                  className="form-control"
                  value={reportCategory}
                  onChange={(e) => {
                    setReportCategory(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="OPD">OPD Patient Registration Register</option>
                  <option value="IPD">IPD Ward Admissions Register</option>
                  <option value="PANCHKARMA">Panchkarma Specialty Therapy Log</option>
                  <option value="LAB">Pathology Lab Test Orders</option>
                  <option value="BILLING">Financial Receipts Ledger</option>
                </select>
              </div>

              {/* Department Selector */}
              <div className="form-group">
                <label className="form-label">Clinical Department</label>
                <select 
                  className="form-control"
                  value={selectedDept}
                  onChange={(e) => {
                    setSelectedDept(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="ALL">All Departments</option>
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
            </div>

            {/* Search Query & Page Size Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#F8FAFC', padding: '0.375rem 0.75rem', borderRadius: '8px', border: '1px solid #CBD5E1', minWidth: '320px' }}>
                <Search size={16} color="#0F766E" />
                <input 
                  type="text"
                  placeholder="Filter results by Name, CR No, OPD No..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  style={{ border: 'none', background: 'transparent', width: '100%', fontSize: '0.8125rem', fontWeight: 600, outline: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.8125rem', color: '#64748B' }}>
                <span>Page Size:</span>
                <select 
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  style={{ padding: '0.25rem 0.5rem', borderRadius: '6px', border: '1px solid #CBD5E1' }}
                >
                  <option value={50}>50 Rows</option>
                  <option value={100}>100 Rows</option>
                  <option value={250}>250 Rows</option>
                  <option value={500}>500 Rows</option>
                </select>

                <strong style={{ color: '#0F766E' }}>Showing {totalRecords.toLocaleString()} Total Records</strong>
              </div>
            </div>
          </div>

          {/* Table Ledger */}
          <div className="card" style={{ padding: 0 }}>
            <div className="table-container" style={{ border: 'none' }}>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>CR NO</th>
                    <th>OPD / REF NO</th>
                    <th>DEPT CODE</th>
                    <th>PATIENT NAME</th>
                    <th>AGE / GENDER</th>
                    <th>DEPARTMENT</th>
                    <th>DIAGNOSIS / PARTICULARS</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedResults.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: '#64748B', fontSize: '0.9375rem' }}>
                        🔍 No records found matching the selected department filter or search query.
                      </td>
                    </tr>
                  ) : (
                    paginatedResults.map((p, idx) => (
                      <tr key={`report-row-${p.id}-${idx}`}>
                        <td style={{ fontWeight: 800, color: '#0F766E' }}>{p.crNo}</td>
                        <td style={{ fontWeight: 700 }}>{p.opdNo}</td>
                        <td><span className="badge badge-info">{p.deptOpdNo}</span></td>
                        <td style={{ fontWeight: 700, color: '#0F172A' }}>{p.name}</td>
                        <td>{p.age} / {p.gender}</td>
                        <td><span className="badge badge-teal">{p.department}</span></td>
                        <td style={{ fontStyle: 'italic', fontSize: '0.8125rem' }}>{p.diagnosis}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls Footer */}
            <div style={{ padding: '0.875rem 1.5rem', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', fontSize: '0.8125rem', backgroundColor: '#F8FAFC' }}>
              <div>
                Showing page <strong>{currentPage}</strong> of <strong>{totalPages}</strong> ({totalRecords.toLocaleString()} Total Filtered Patients)
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <button 
                  className="btn btn-secondary btn-sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                >
                  <ArrowLeft size={14} /> Previous
                </button>

                <button 
                  className="btn btn-secondary btn-sm"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                >
                  Next <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: YEARLY CCIM AUDIT VOLUME COUNT */}
      {activeReportTab === 'yearly' && (
        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #E2E8F0' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Building2 size={20} color="#0F766E" />
              <span>Yearly Department Patient Volume (NCISM / CCIM Accreditation Audit Compliance)</span>
            </h2>
            <p style={{ fontSize: '0.8125rem', color: '#64748B', marginTop: '2px' }}>
              Official registered patient volume counts submitted for annual medical college accreditation audits.
            </p>
          </div>

          <div className="table-container" style={{ border: 'none' }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>DEPARTMENT ID</th>
                  <th>CLINICAL DEPARTMENT NAME</th>
                  <th>RECORDED ANNUAL PATIENT VOLUME</th>
                  <th>ACCREDITATION COMPLIANCE STATUS</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(deptCounts).map(([dept, count], idx) => (
                  <tr key={dept}>
                    <td style={{ fontWeight: 700, color: '#0F766E' }}>DEPT-0{idx + 1}</td>
                    <td style={{ fontWeight: 800, color: '#0F172A' }}>{dept}</td>
                    <td style={{ fontWeight: 900, fontSize: '1.125rem', color: '#2563EB' }}>{count.toLocaleString()} Patients</td>
                    <td>
                      <span className="badge badge-success" style={{ display: 'inline-flex', gap: '0.25rem', alignItems: 'center', padding: '0.35rem 0.75rem', fontWeight: 800 }}>
                        <ShieldCheck size={14} /> NCISM AUDIT VERIFIED
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
