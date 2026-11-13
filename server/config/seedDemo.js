import User from '../models/User.js';
import Patient from '../models/Patient.js';
import Appointment from '../models/Appointment.js';
import MedicalRecord from '../models/MedicalRecord.js';
import AuditLog from '../models/AuditLog.js';

export const seedDemoData = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      console.log('ℹ️ Database already contains data. Skipping auto-seed.');
      return;
    }

    console.log('🌱 Populating initial demo healthcare data...');

    // 1. Staff Users
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@medcare.com',
      password: 'Admin@123',
      role: 'admin',
      phone: '555-0100'
    });

    const doc1 = await User.create({
      name: 'Dr. Sarah Johnson',
      email: 'sarah.johnson@medcare.com',
      password: 'Doctor@123',
      role: 'doctor',
      specialization: 'Cardiology',
      phone: '555-0101'
    });

    const doc2 = await User.create({
      name: 'Dr. James Lee',
      email: 'james.lee@medcare.com',
      password: 'Doctor@123',
      role: 'doctor',
      specialization: 'General Medicine',
      phone: '555-0102'
    });

    const receptionist = await User.create({
      name: 'Emma Wilson',
      email: 'emma.wilson@medcare.com',
      password: 'Recept@123',
      role: 'receptionist',
      phone: '555-0201'
    });

    // 2. Patients
    const patientData = [
      {
        firstName: 'John',
        lastName: 'Doe',
        dob: new Date('1985-04-12'),
        gender: 'male',
        bloodGroup: 'O+',
        phone: '555-1001',
        email: 'john.doe@example.com',
        address: { street: '123 Pine St', city: 'Metroville', state: 'CA', zipCode: '90210' },
        emergencyContact: { name: 'Jane Doe', phone: '555-1002', relation: 'Spouse' },
        assignedDoctor: doc1._id
      },
      {
        firstName: 'Alice',
        lastName: 'Smith',
        dob: new Date('1992-09-24'),
        gender: 'female',
        bloodGroup: 'A+',
        phone: '555-1003',
        email: 'alice.smith@example.com',
        address: { street: '456 Oak Ave', city: 'Metroville', state: 'CA', zipCode: '90211' },
        emergencyContact: { name: 'Bob Smith', phone: '555-1004', relation: 'Brother' },
        assignedDoctor: doc2._id
      },
      {
        firstName: 'Robert',
        lastName: 'Brown',
        dob: new Date('1978-11-05'),
        gender: 'male',
        bloodGroup: 'B-',
        phone: '555-1005',
        email: 'robert.brown@example.com',
        address: { street: '789 Elm St', city: 'Metroville', state: 'CA', zipCode: '90212' },
        emergencyContact: { name: 'Mary Brown', phone: '555-1006', relation: 'Wife' },
        assignedDoctor: doc1._id
      },
      {
        firstName: 'Emily',
        lastName: 'Davis',
        dob: new Date('1999-01-18'),
        gender: 'female',
        bloodGroup: 'AB+',
        phone: '555-1007',
        email: 'emily.davis@example.com',
        address: { street: '321 Maple Dr', city: 'Metroville', state: 'CA', zipCode: '90213' },
        emergencyContact: { name: 'David Davis', phone: '555-1008', relation: 'Father' },
        assignedDoctor: doc2._id
      },
      {
        firstName: 'Michael',
        lastName: 'Miller',
        dob: new Date('1965-07-30'),
        gender: 'male',
        bloodGroup: 'O-',
        phone: '555-1009',
        email: 'michael.miller@example.com',
        address: { street: '654 Cedar Ct', city: 'Metroville', state: 'CA', zipCode: '90214' },
        emergencyContact: { name: 'Sarah Miller', phone: '555-1010', relation: 'Daughter' },
        assignedDoctor: doc1._id
      },
      {
        firstName: 'Sophia',
        lastName: 'Wilson',
        dob: new Date('2003-03-14'),
        gender: 'female',
        bloodGroup: 'A-',
        phone: '555-1011',
        email: 'sophia.wilson@example.com',
        address: { street: '987 Birch Ln', city: 'Metroville', state: 'CA', zipCode: '90215' },
        emergencyContact: { name: 'Laura Wilson', phone: '555-1012', relation: 'Mother' },
        assignedDoctor: doc2._id
      },
      {
        firstName: 'David',
        lastName: 'Taylor',
        dob: new Date('1988-12-03'),
        gender: 'male',
        bloodGroup: 'B+',
        phone: '555-1013',
        email: 'david.taylor@example.com',
        address: { street: '147 Walnut Rd', city: 'Metroville', state: 'CA', zipCode: '90216' },
        emergencyContact: { name: 'Rachel Taylor', phone: '555-1014', relation: 'Sister' },
        assignedDoctor: doc1._id
      },
      {
        firstName: 'Olivia',
        lastName: 'Anderson',
        dob: new Date('1995-05-22'),
        gender: 'female',
        bloodGroup: 'O+',
        phone: '555-1015',
        email: 'olivia.anderson@example.com',
        address: { street: '258 Spruce Way', city: 'Metroville', state: 'CA', zipCode: '90217' },
        emergencyContact: { name: 'Thomas Anderson', phone: '555-1016', relation: 'Husband' },
        assignedDoctor: doc2._id
      }
    ];

    const createdPatients = [];
    for (const p of patientData) {
      const patient = await Patient.create(p);
      createdPatients.push(patient);
    }

    // 3. Appointments
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 5);

    const appointmentsData = [
      {
        patient: createdPatients[0]._id,
        doctor: doc1._id,
        date: yesterday,
        timeSlot: '09:00',
        duration: 30,
        status: 'completed',
        reason: 'Routine cardiac checkup',
        notes: 'Patient reported mild chest tightness during morning jogging.'
      },
      {
        patient: createdPatients[1]._id,
        doctor: doc2._id,
        date: yesterday,
        timeSlot: '10:30',
        duration: 30,
        status: 'completed',
        reason: 'Seasonal flu symptoms',
        notes: 'Fever and cough since 3 days.'
      },
      {
        patient: createdPatients[2]._id,
        doctor: doc1._id,
        date: today,
        timeSlot: '11:00',
        duration: 30,
        status: 'confirmed',
        reason: 'Hypertension follow-up',
        notes: 'Check blood pressure regulation.'
      },
      {
        patient: createdPatients[3]._id,
        doctor: doc2._id,
        date: today,
        timeSlot: '14:00',
        duration: 30,
        status: 'scheduled',
        reason: 'Annual physical exam',
        notes: 'Complete blood panel requested.'
      },
      {
        patient: createdPatients[4]._id,
        doctor: doc1._id,
        date: tomorrow,
        timeSlot: '09:30',
        duration: 30,
        status: 'confirmed',
        reason: 'Arrhythmia review',
        notes: 'Review ECG Holter monitor results.'
      },
      {
        patient: createdPatients[5]._id,
        doctor: doc2._id,
        date: tomorrow,
        timeSlot: '11:30',
        duration: 30,
        status: 'scheduled',
        reason: 'Severe migraine consultation',
        notes: 'Episodes increasing with visual aura.'
      },
      {
        patient: createdPatients[6]._id,
        doctor: doc1._id,
        date: nextWeek,
        timeSlot: '15:00',
        duration: 30,
        status: 'scheduled',
        reason: 'Cholesterol check',
        notes: 'Fasting lipid profile review.'
      },
      {
        patient: createdPatients[7]._id,
        doctor: doc2._id,
        date: nextWeek,
        timeSlot: '16:00',
        duration: 30,
        status: 'scheduled',
        reason: 'Allergy test follow-up',
        notes: 'Check skin patch reactions.'
      }
    ];

    await Appointment.insertMany(appointmentsData);

    // 4. Medical Records
    const recordsData = [
      {
        patient: createdPatients[0]._id,
        doctor: doc1._id,
        visitDate: yesterday,
        chiefComplaint: 'Chest tightness and shortness of breath during exertion',
        diagnosis: 'Mild stable angina pectoris and borderline hypertension',
        treatment: 'Prescribed beta-blockers and recommended low-sodium diet with regular aerobic exercise.',
        prescriptions: [
          { medication: 'Metoprolol Succinate', dosage: '25mg', frequency: 'Once daily', duration: '30 days' },
          { medication: 'Aspirin (Enteric Coated)', dosage: '81mg', frequency: 'Once daily', duration: 'Ongoing' }
        ],
        labResults: [
          { testName: 'Total Cholesterol', result: '215', unit: 'mg/dL', normalRange: '< 200' },
          { testName: 'Blood Pressure', result: '138/88', unit: 'mmHg', normalRange: '< 120/80' }
        ],
        notes: 'Follow up in 4 weeks. Instructed to visit ER if chest pain occurs at rest.',
        followUpDate: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000)
      },
      {
        patient: createdPatients[1]._id,
        doctor: doc2._id,
        visitDate: yesterday,
        chiefComplaint: 'Fever (101°F), sore throat, and persistent dry cough',
        diagnosis: 'Acute Viral Upper Respiratory Infection',
        treatment: 'Supportive therapy, antipyretics, hydration, and rest.',
        prescriptions: [
          { medication: 'Paracetamol', dosage: '650mg', frequency: 'Every 6 hours PRN', duration: '5 days' },
          { medication: 'Cetirizine', dosage: '10mg', frequency: 'Once daily at bedtime', duration: '7 days' }
        ],
        labResults: [
          { testName: 'Rapid Strep Test', result: 'Negative', unit: '', normalRange: 'Negative' }
        ],
        notes: 'No signs of bacterial pneumonia. Return if fever persists beyond 5 days.',
        followUpDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      },
      {
        patient: createdPatients[2]._id,
        doctor: doc1._id,
        visitDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        chiefComplaint: 'Occasional morning headaches and fatigue',
        diagnosis: 'Essential Hypertension Stage 1',
        treatment: 'Initiated ACE inhibitor therapy; lifestyle modification counseling provided.',
        prescriptions: [
          { medication: 'Lisinopril', dosage: '10mg', frequency: 'Once daily morning', duration: '60 days' }
        ],
        labResults: [
          { testName: 'Serum Creatinine', result: '0.9', unit: 'mg/dL', normalRange: '0.7 - 1.3' },
          { testName: 'eGFR', result: '98', unit: 'mL/min/1.73m²', normalRange: '> 90' }
        ],
        notes: 'Blood pressure monitored. Patient is keeping a home BP log.',
        followUpDate: today
      }
    ];

    await MedicalRecord.insertMany(recordsData);
    console.log('✓ Demo data population complete!');
  } catch (error) {
    console.error('Error seeding demo data:', error);
  }
};
