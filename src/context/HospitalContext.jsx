import React, { createContext, useContext, useState, useEffect } from 'react';
import seedData from '../data/seedData.json';

const HospitalContext = createContext();

export const getFormattedDateTime = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  let hours = now.getHours();
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  const formattedHours = String(hours).padStart(2, '0');
  return `${year}-${month}-${day} ${formattedHours}:${minutes}:${seconds} ${ampm}`;
};

export const HospitalProvider = ({ children }) => {
  // 1. Doctors & Beds
  const [doctors, setDoctors] = useState(() => {
    try {
      const saved = localStorage.getItem('hms_doctors');
      return saved ? JSON.parse(saved) : seedData.doctors;
    } catch (e) {
      return seedData.doctors;
    }
  });

  const [beds, setBeds] = useState(() => {
    try {
      const saved = localStorage.getItem('hms_beds');
      return saved ? JSON.parse(saved) : seedData.beds;
    } catch (e) {
      return seedData.beds;
    }
  });

  // 2. Medicines with Stock Quantities
  const [medicines, setMedicines] = useState(() => {
    try {
      const saved = localStorage.getItem('hms_medicines');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0 && (parsed[0].name || parsed[0]['NAME OF MED'])) {
          return parsed;
        }
      }
    } catch (e) {}
    localStorage.removeItem('hms_medicines');
    return seedData.medicines.map((m, idx) => ({
      ...m,
      id: m.id || `MED-${idx+1}`,
      name: m.name || m['NAME OF MED'] || `Formulation #${m.id || idx+1}`,
      stock: 150 + (idx * 7) % 300,
      minLevel: 30,
      price: 100 + (idx * 15) % 400,
      category: idx % 6 === 0 ? 'Vati / Gulika' : idx % 6 === 1 ? 'Guggulu' : idx % 6 === 2 ? 'Arishta / Asava' : idx % 6 === 3 ? 'Kashayam' : idx % 6 === 4 ? 'Choorna' : 'Thailam'
    }));
  });

  // 3. Lab Test Catalogue (Always load authentic tests from seedData)
  const [labTests, setLabTests] = useState(() => {
    try {
      const saved = localStorage.getItem('hms_lab_tests');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const hasNbsp = parsed.some(t => (t['NAME OF TEST'] || t.NAME || t.test_name) === '&nbsp;');
          if (!hasNbsp) return parsed;
        }
      }
    } catch (e) {}
    localStorage.removeItem('hms_lab_tests');
    return seedData.lab_tests;
  });

  // 4. Charge Master Tariffs
  const [chargeTariffs, setChargeTariffs] = useState(() => {
    try {
      const saved = localStorage.getItem('hms_charge_tariffs');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      { id: 'T-1', name: 'OPD General Registration Charge', category: 'OPD', amount: 100 },
      { id: 'T-2', name: 'IPD Daily Bed Charge (General Ward)', category: 'IPD', amount: 500 },
      { id: 'T-3', name: 'Panchkarma Shirodhara Therapy Fee', category: 'Panchkarma', amount: 800 },
      { id: 'T-4', name: 'Panchkarma Basti Therapy Fee', category: 'Panchkarma', amount: 600 },
      { id: 'T-5', name: 'CBC Pathology Examination Fee', category: 'Pathology', amount: 250 },
      { id: 'T-6', name: 'X-Ray Chest PA View', category: 'Radiology', amount: 350 },
    ];
  });

  // 5. Disease Catalogue
  const [diseaseCatalog] = useState([
    { code: 'NID-01', ayurvedicName: 'Pakshaghat', modernEquiv: 'Hemiplegia / Cerebrovascular Accident', dept: 'KAYACHIKITSA' },
    { code: 'NID-02', ayurvedicName: 'Sandhigat Vata', modernEquiv: 'Osteoarthritis', dept: 'KAYACHIKITSA' },
    { code: 'NID-03', ayurvedicName: 'Katishoola', modernEquiv: 'Lumbar Spondylosis / Low Back Pain', dept: 'PANCHAKARMA' },
    { code: 'NID-04', ayurvedicName: 'Dusta Vrana', modernEquiv: 'Chronic Venous / Diabetic Ulcer', dept: 'SHALYA TANTRA' },
    { code: 'NID-05', ayurvedicName: 'Pratishyay', modernEquiv: 'Chronic Rhinitis / Sinusitis', dept: 'SHALKYA TANTRA ENT' },
    { code: 'NID-06', ayurvedicName: 'Timira / Arman', modernEquiv: 'Cataract / Pterygium', dept: 'SHALKYA TANTRA NETRA' },
    { code: 'NID-07', ayurvedicName: 'Asrigdara', modernEquiv: 'Menorrhagia / Abnormal Uterine Bleeding', dept: 'STREE & PRASOOTI ROGA' },
    { code: 'NID-08', ayurvedicName: 'Kasa / Shwasa', modernEquiv: 'Pediatric Bronchitis / Asthma', dept: 'KAUMARBHRITYA' },
  ]);

  // 6. OPD Patients - Loaded from saved modified list OR seedData
  const [opdPatients, setOpdPatients] = useState(() => {
    try {
      const saved = localStorage.getItem('hms_all_opd_patients');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to load hms_all_opd_patients from localStorage:', e);
    }
    
    // Auto-fill missing CR NO or OPD NO with sequential numbers
    let currentMaxCr = 28281;
    let currentMaxOpd = 20171;
    return seedData.opd_patients.map(p => {
      const cr = (p.crNo && String(p.crNo).trim()) ? String(p.crNo).trim() : String(++currentMaxCr);
      const opd = (p.opdNo && String(p.opdNo).trim()) ? String(p.opdNo).trim() : String(++currentMaxOpd);
      return {
        ...p,
        crNo: cr,
        opdNo: opd
      };
    });
  });

  // 7. IPD Patients
  const [ipdPatients, setIpdPatients] = useState(() => {
    try {
      const saved = localStorage.getItem('hms_ipd_patients');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      {
        id: 'IPD-501',
        ipdNo: '5501',
        crNo: '20171',
        name: 'Akansksha Saini',
        age: 24,
        gender: 'FEMALE',
        department: 'PANCHAKARMA',
        diagnosis: 'Pakshaghat (Hemiplegia Post Stroke)',
        bedCode: 'PK-1',
        doctor: 'Dr. Ravi Joshi',
        admitDate: '2026-08-20',
        status: 'ADMITTED',
        charge: 8500,
        paid: 5000,
        due: 3500,
        diet: { morning: 'D-1 Herbal Tea / Milk', noon: 'D-2 Pathya Kichadi with Ghee', evening: 'D-3 Light Soup / Mudga Yusha' }
      },
      {
        id: 'IPD-502',
        ipdNo: '5502',
        crNo: '21627',
        name: 'Neeraj',
        age: 45,
        gender: 'MALE',
        department: 'KAYACHIKITSA',
        diagnosis: 'Sandhigat Vata (Severe Osteoarthritis)',
        bedCode: 'KC-1',
        doctor: 'Dr. Vikas Saluja',
        admitDate: '2026-08-22',
        status: 'ADMITTED',
        charge: 6000,
        paid: 6000,
        due: 0,
        diet: { morning: 'Warm Milk with Ashwagandha', noon: 'Rice & Cooked Vegetables', evening: 'Light Soup' }
      }
    ];
  });

  // 8. Panchkarma Logs
  const [panchkarmaLogs, setPanchkarmaLogs] = useState(() => {
    try {
      const saved = localStorage.getItem('hms_panchkarma');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      {
        id: 'PK-901',
        date: '2026-08-26',
        crNo: '20171',
        patientName: 'Akansksha Saini',
        doctor: 'Dr. Prachi Choudhary',
        snehan: 'Til Taila 45 mins',
        swedan: 'Nadi Sweda (Eucalyptus)',
        shirodhara: 'Ksheerbala Oil Dhara (35 mins)',
        basti: 'Matra Basti (Til Taila 60ml)',
        nashya: 'Anu Taila 2 drops',
        vaman: '-',
        virechan: '-',
        raktmokshan: '-'
      }
    ];
  });

  // 9. Pathology Lab Orders
  const [labOrders, setLabOrders] = useState(() => {
    try {
      const saved = localStorage.getItem('hms_lab');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      {
        id: 'LAB-701',
        refNo: 'LR-3401',
        date: '2026-08-26',
        crNo: '20171',
        patientName: 'Akansksha Saini',
        age: 24,
        gender: 'FEMALE',
        referredBy: 'Dr. Ravi Joshi',
        tests: ['CBC (Complete Blood Count)', 'ESR (Erythrocyte Sedimentation Rate)'],
        status: 'COMPLETED',
        results: { 'CBC (Complete Blood Count)': 'Hb: 13.2 gm%, WBC: 7400/mm³', 'ESR (Erythrocyte Sedimentation Rate)': '12 mm/1st hr' }
      }
    ];
  });

  // 10. Billing Receipts
  const [receipts, setReceipts] = useState(() => {
    try {
      const saved = localStorage.getItem('hms_receipts');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      {
        receiptNo: 'REC-8801',
        crNo: '20171',
        name: 'Akansksha Saini',
        charge: 500,
        discount: 0,
        total: 500,
        received: 500,
        due: 0,
        remarks: 'OPD & Panchkarma Registration'
      }
    ];
  });

  // 11. Pharmacy Dispensed Prescriptions
  const [dispensedMedicines, setDispensedMedicines] = useState(() => {
    try {
      const saved = localStorage.getItem('hms_pharmacy_dispensed');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      {
        id: 'DISP-101',
        date: '2026-08-26',
        crNo: '20171',
        patientName: 'Akansksha Saini',
        items: [
          { medicineName: 'Maha Rasnadi Kwath', dosage: '20ml BD', duration: '14 Days', qty: 2, price: 145, amount: 290 },
          { medicineName: 'Yograj Guggulu', dosage: '2 Tab BD', duration: '10 Days', qty: 1, price: 115, amount: 115 }
        ],
        totalAmount: 405,
        status: 'DISPENSED',
        billingStatus: 'PENDING'
      },
      {
        id: 'DISP-102',
        date: '2026-08-26',
        crNo: '21627',
        patientName: 'Neeraj',
        items: [
          { medicineName: 'Yograj Guggulu', dosage: '2 Tab BD', duration: '10 Days', qty: 1, price: 115, amount: 115 },
          { medicineName: 'Ksheerbala Thailam', dosage: 'External Use', duration: '15 Days', qty: 1, price: 175, amount: 175 }
        ],
        totalAmount: 290,
        status: 'DISPENSED',
        billingStatus: 'PENDING'
      }
    ];
  });

  // 12. Active Patient Detail Modal Window
  const [activePatientModal, setActivePatientModal] = useState(null);

  // LocalStorage Persistence for ALL datasets (including edits and removals)
  useEffect(() => { try { localStorage.setItem('hms_doctors', JSON.stringify(doctors)); } catch (e) {} }, [doctors]);
  useEffect(() => { try { localStorage.setItem('hms_beds', JSON.stringify(beds)); } catch (e) {} }, [beds]);
  useEffect(() => { try { localStorage.setItem('hms_medicines', JSON.stringify(medicines)); } catch (e) {} }, [medicines]);
  useEffect(() => { try { localStorage.setItem('hms_lab_tests', JSON.stringify(labTests)); } catch (e) {} }, [labTests]);
  useEffect(() => { try { localStorage.setItem('hms_charge_tariffs', JSON.stringify(chargeTariffs)); } catch (e) {} }, [chargeTariffs]);
  useEffect(() => { try { localStorage.setItem('hms_all_opd_patients', JSON.stringify(opdPatients)); } catch (e) {} }, [opdPatients]);
  useEffect(() => { try { localStorage.setItem('hms_ipd_patients', JSON.stringify(ipdPatients)); } catch (e) {} }, [ipdPatients]);
  useEffect(() => { try { localStorage.setItem('hms_panchkarma', JSON.stringify(panchkarmaLogs)); } catch (e) {} }, [panchkarmaLogs]);
  useEffect(() => { try { localStorage.setItem('hms_lab', JSON.stringify(labOrders)); } catch (e) {} }, [labOrders]);
  useEffect(() => { try { localStorage.setItem('hms_receipts', JSON.stringify(receipts)); } catch (e) {} }, [receipts]);
  useEffect(() => { try { localStorage.setItem('hms_pharmacy_dispensed', JSON.stringify(dispensedMedicines)); } catch (e) {} }, [dispensedMedicines]);

  // Methods
  const resetOpdDataset = () => {
    try {
      localStorage.removeItem('hms_all_opd_patients');
      localStorage.removeItem('hms_user_opd_patients');
      localStorage.removeItem('hms_opd_patients');
      localStorage.removeItem('hms_lab_tests');
      localStorage.removeItem('hms_medicines');
      localStorage.removeItem('hms_pharmacy_dispensed');
    } catch (e) {}
    setOpdPatients(seedData.opd_patients);
    setLabTests(seedData.lab_tests);
    setMedicines(seedData.medicines.map((m, idx) => ({
      ...m,
      id: m.id || `MED-${idx+1}`,
      name: m.name || m['NAME OF MED'] || `Formulation #${m.id || idx+1}`,
      stock: 150 + (idx * 7) % 300,
      minLevel: 30,
      price: 100 + (idx * 15) % 400,
      category: idx % 6 === 0 ? 'Vati / Gulika' : idx % 6 === 1 ? 'Guggulu' : idx % 6 === 2 ? 'Arishta / Asava' : idx % 6 === 3 ? 'Kashayam' : idx % 6 === 4 ? 'Choorna' : 'Thailam'
    })));
  };

  const updateMedicineStock = (medIdOrName, qtyChange) => {
    setMedicines(prev => prev.map(m => {
      const match = m.id === medIdOrName || m.name === medIdOrName || m['NAME OF MED'] === medIdOrName;
      if (match) {
        const updatedStock = Math.max(0, (m.stock || 0) + qtyChange);
        return { ...m, stock: updatedStock };
      }
      return m;
    }));
  };



  const addNewMedicineFormulation = (medData) => {
    const newMed = {
      id: `MED-${Date.now().toString().slice(-4)}`,
      stock: Number(medData.stock) || 100,
      minLevel: Number(medData.minLevel) || 30,
      price: Number(medData.price) || 150,
      category: medData.category || 'Vati / Gulika',
      createdAt: getFormattedDateTime(),
      ...medData
    };
    setMedicines([newMed, ...medicines]);
    return newMed;
  };

  const addDispensation = (dispenseData) => {
    const currentDT = getFormattedDateTime();
    const newDisp = {
      id: `DISP-${Date.now().toString().slice(-4)}`,
      date: dispenseData.date && dispenseData.date.includes(':') ? dispenseData.date : currentDT,
      status: 'DISPENSED',
      billingStatus: 'PENDING',
      ...dispenseData
    };
    setDispensedMedicines([newDisp, ...dispensedMedicines]);

    // Auto-deduct stock for dispensed items
    if (Array.isArray(dispenseData.items)) {
      dispenseData.items.forEach(item => {
        updateMedicineStock(item.medicineName, -Math.abs(Number(item.qty) || 1));
      });
    }
    return newDisp;
  };

  const markDispensationBilled = (dispenseId) => {
    setDispensedMedicines(prev => prev.map(d => 
      d.id === dispenseId ? { ...d, billingStatus: 'BILLED' } : d
    ));
  };

  const deleteDispensation = (dispenseId) => {
    setDispensedMedicines(prev => prev.filter(d => d.id !== dispenseId));
  };

  const deleteReceipt = (receiptNo) => {
    setReceipts(prev => prev.filter(r => r.receiptNo !== receiptNo));
  };

  const addOpdPatient = (patientData) => {
    const maxCr = opdPatients.reduce((max, p) => Math.max(max, parseInt(String(p.crNo).replace(/\D/g, '')) || 0), 28281);
    const nextCrNo = String(maxCr + 1);

    const maxOpd = opdPatients.reduce((max, p) => Math.max(max, parseInt(String(p.opdNo).replace(/\D/g, '')) || 0), 20171);
    const nextOpdNo = String(maxOpd + 1);

    const finalCrNo = (patientData.crNo && String(patientData.crNo).trim()) ? String(patientData.crNo).trim() : nextCrNo;
    const finalOpdNo = (patientData.opdNo && String(patientData.opdNo).trim()) ? String(patientData.opdNo).trim() : nextOpdNo;

    const currentDT = getFormattedDateTime();
    const newRecord = {
      ...patientData,
      id: `CR-NEW-${Date.now().toString().slice(-5)}`,
      crNo: finalCrNo,
      opdNo: finalOpdNo,
      deptOpdNo: (patientData.deptOpdNo && String(patientData.deptOpdNo).trim()) ? String(patientData.deptOpdNo).trim() : `${Math.floor(4000 + Math.random() * 5000)}`,
      regType: patientData.regType || 'NEW',
      date: (patientData.date && patientData.date.includes(':')) ? patientData.date : currentDT,
      regDate: currentDT
    };

    setOpdPatients(prev => [newRecord, ...prev]);

    const newReceipt = {
      receiptNo: `REC-${Math.floor(8000 + Math.random() * 9000)}`,
      crNo: newRecord.crNo,
      name: newRecord.name,
      date: currentDT,
      charge: Number(newRecord.charge) || 100,
      discount: Number(newRecord.discount) || 0,
      total: (Number(newRecord.charge) || 100) - (Number(newRecord.discount) || 0),
      received: Number(newRecord.received) || 100,
      due: (Number(newRecord.charge) || 100) - (Number(newRecord.discount) || 0) - (Number(newRecord.received) || 100),
      remarks: `OPD Ticket Fee - ${newRecord.department}`
    };
    setReceipts(prev => [newReceipt, ...prev]);
    return newRecord;
  };

  const updateOpdPatient = (idOrCrNo, updatedFields) => {
    setOpdPatients(opdPatients.map(p => 
      (p.id === idOrCrNo || p.crNo === idOrCrNo) ? { ...p, ...updatedFields } : p
    ));
  };

  const deleteOpdPatient = (idOrCrNo) => {
    setOpdPatients(prev => prev.filter(p => p.id !== idOrCrNo && p.crNo !== idOrCrNo));
  };

  const admitIpdPatient = (ipdData) => {
    const maxIpd = ipdPatients.reduce((max, p) => Math.max(max, parseInt(String(p.ipdNo).replace(/\D/g, '')) || 0), 8839);
    const nextIpdNo = `IPD-${maxIpd + 1}`;

    const maxCr = opdPatients.reduce((max, p) => Math.max(max, parseInt(String(p.crNo).replace(/\D/g, '')) || 0), 28281);
    const nextCrNo = String(maxCr + 1);

    const finalCrNo = (ipdData.crNo && String(ipdData.crNo).trim()) ? String(ipdData.crNo).trim() : nextCrNo;
    const finalIpdNo = (ipdData.ipdNo && String(ipdData.ipdNo).trim()) ? String(ipdData.ipdNo).trim() : nextIpdNo;

    const currentDT = getFormattedDateTime();
    const newIpd = {
      ...ipdData,
      id: `IPD-${Date.now().toString().slice(-4)}`,
      crNo: finalCrNo,
      ipdNo: finalIpdNo,
      status: 'ADMITTED',
      diet: { morning: 'D-1 Herbal Tea / Milk', noon: 'D-2 Pathya Kichadi with Ghee', evening: 'D-3 Light Soup / Mudga Yusha' },
      date: (ipdData.date && ipdData.date.includes(':')) ? ipdData.date : currentDT,
      admitDate: currentDT
    };
    setIpdPatients(prev => [newIpd, ...prev]);
    return newIpd;
  };

  const dischargeIpdPatient = (ipdId, disDate, notes) => {
    const currentDT = getFormattedDateTime();
    setIpdPatients(ipdPatients.map(p => 
      p.id === ipdId ? { ...p, status: 'DISCHARGED', disDate: disDate && disDate.includes(':') ? disDate : currentDT, dischargeNotes: notes } : p
    ));
  };

  const addPanchkarmaLog = (logData) => {
    const currentDT = getFormattedDateTime();
    const newLog = {
      id: `PK-LOG-${Date.now().toString().slice(-4)}`,
      date: logData.date && logData.date.includes(':') ? logData.date : currentDT,
      ...logData
    };
    setPanchkarmaLogs([newLog, ...panchkarmaLogs]);
    return newLog;
  };

  const createLabOrder = (orderData) => {
    const currentDT = getFormattedDateTime();
    const newOrder = {
      id: `LAB-${Date.now().toString().slice(-4)}`,
      refNo: `LR-${Math.floor(1000 + Math.random() * 9000)}`,
      date: orderData.date && orderData.date.includes(':') ? orderData.date : currentDT,
      status: 'PENDING',
      results: {},
      ...orderData
    };
    setLabOrders([newOrder, ...labOrders]);
    return newOrder;
  };

  const updateLabResult = (labId, results) => {
    const currentDT = getFormattedDateTime();
    setLabOrders(labOrders.map(order => 
      order.id === labId ? { ...order, results, status: 'COMPLETED', completedAt: currentDT } : order
    ));
  };

  const addReceipt = (recData) => {
    const currentDT = getFormattedDateTime();
    const newRec = {
      receiptNo: `REC-${Math.floor(8000 + Math.random() * 9000)}`,
      date: recData.date && recData.date.includes(':') ? recData.date : currentDT,
      ...recData
    };
    setReceipts([newRec, ...receipts]);
    return newRec;
  };

  const settleReceiptDue = (receiptNo, amountPaid) => {
    const currentDT = getFormattedDateTime();
    setReceipts(receipts.map(rec => {
      if (rec.receiptNo === receiptNo) {
        const newReceived = Number(rec.received || 0) + Number(amountPaid);
        const newDue = Math.max(0, Number(rec.total || 0) - newReceived);
        return { ...rec, received: newReceived, due: newDue, lastPaymentTime: currentDT };
      }
      return rec;
    }));
  };

  const addDoctor = (docData) => {
    const currentDT = getFormattedDateTime();
    const newDoc = { ID: `${doctors.length + 1}`, createdAt: currentDT, ...docData };
    setDoctors([...doctors, newDoc]);
  };

  const addChargeTariff = (tariffData) => {
    const currentDT = getFormattedDateTime();
    const newTariff = { id: `T-${chargeTariffs.length + 1}`, createdAt: currentDT, ...tariffData };
    setChargeTariffs([...chargeTariffs, newTariff]);
  };

  const exportSystemBackup = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
      doctors,
      beds,
      opdPatients,
      ipdPatients,
      panchkarmaLogs,
      labOrders,
      receipts,
      chargeTariffs,
      dispensedMedicines,
      exportDate: new Date().toISOString()
    }));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `coer_ayurveda_hms_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <HospitalContext.Provider value={{
      doctors,
      beds,
      medicines,
      labTests,
      chargeTariffs,
      diseaseCatalog,
      opdPatients,
      ipdPatients,
      panchkarmaLogs,
      labOrders,
      receipts,
      dispensedMedicines,
      activePatientModal,
      setActivePatientModal,
      resetOpdDataset,
      updateMedicineStock,
      addNewMedicineFormulation,
      addDispensation,
      markDispensationBilled,
      deleteDispensation,
      deleteReceipt,
      addOpdPatient,
      updateOpdPatient,
      deleteOpdPatient,
      admitIpdPatient,
      dischargeIpdPatient,
      addPanchkarmaLog,
      createLabOrder,
      updateLabResult,
      addReceipt,
      settleReceiptDue,
      addDoctor,
      addChargeTariff,
      exportSystemBackup
    }}>
      {children}
    </HospitalContext.Provider>
  );
};

export const useHospital = () => useContext(HospitalContext);
