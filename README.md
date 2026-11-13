# MedCare RMS — Patient Record Management System

A full-stack modern Healthcare Management Application built fully on the **MERN** stack (MongoDB, Express, React, Node.js) with Tailwind CSS.

---

## 🌟 Key Features

- **Role-Based Access Control (RBAC)**: Secure access tailored for **Admin**, **Doctor**, and **Receptionist**.
- **Interactive Calendar Appointment Scheduler**: Powered by `react-big-calendar` with real-time doctor availability slot calculation, conflict prevention, and status workflows (`scheduled`, `confirmed`, `completed`, `cancelled`, `no-show`).
- **Comprehensive Patient Records**: Complete demographic data, unique auto-generated Patient IDs (`P-XXXXXX`), emergency contacts, and assigned doctor tracking.
- **Medical Records & Prescriptions**: Full consultation history including chief complaints, clinical diagnoses, structured prescription tables (medication, dosage, frequency, duration), and lab results.
- **Prescription & Document Attachments**: Upload and download patient prescriptions, lab reports, and scans (PDF, PNG, JPG, DOC) via Multer.
- **Analytical Dashboard**: Live KPIs, today's schedule, weekly volume, and quick links to new admissions.
- **Staff Administration**: Admin portal to onboard and manage medical personnel and receptionists.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, React Router DOM v6, Tailwind CSS, TanStack React Query, Lucide Icons, React Big Calendar, Moment.js, React Toastify |
| **Backend** | Node.js (ES Modules), Express.js, Mongoose, Multer, Helmet, Morgan, CORS |
| **Database** | MongoDB |
| **Authentication** | JWT (Access Tokens + Refresh Tokens) with bcrypt password hashing |

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js** v18+ installed
- **MongoDB** running locally on `mongodb://localhost:27017` (or MongoDB Atlas URI)

### 2. Environment Configuration
The backend configuration is located in `server/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/patient_rms
JWT_SECRET=medcare_jwt_secret_2024_secure_key_xyz
JWT_REFRESH_SECRET=medcare_refresh_secret_2024_secure_key_abc
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
UPLOAD_PATH=./uploads
NODE_ENV=development
```

### 3. Seed Demo Data
Populate the database with realistic sample doctors, receptionists, patients, appointments, and medical records:
```bash
npm run seed
```

#### Demo Staff Credentials
| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@medcare.com` | `Admin@123` |
| **Doctor (Cardiology)** | `sarah.johnson@medcare.com` | `Doctor@123` |
| **Doctor (General Medicine)** | `james.lee@medcare.com` | `Doctor@123` |
| **Receptionist** | `emma.wilson@medcare.com` | `Recept@123` |

### 4. Running the Application
Run both backend API (port 5000) and frontend client (port 5173) concurrently:
```bash
npm run dev
```

Or run them individually in separate terminals:
```bash
# Terminal 1 - Backend API
npm run dev:server

# Terminal 2 - Frontend Client
npm run dev:client
```

- **Frontend App**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5000](http://localhost:5000)
- **API Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 📂 Project Architecture

```
d:\PRJ\
├── package.json               # Root scripts (run both client & server)
├── README.md
├── server/
│   ├── config/db.js           # Mongoose database connection
│   ├── models/                # User, Patient, Appointment, MedicalRecord, AuditLog
│   ├── middleware/            # JWT auth, role validation, multer upload, error handler
│   ├── controllers/           # Business logic for all modules
│   ├── routes/                # Express API routes
│   ├── uploads/               # Stored file uploads & prescriptions
│   ├── seed.js                # Database seeder
│   └── server.js              # Server entry point
└── client/
    ├── src/
    │   ├── api/               # Axios services with automatic token refresh
    │   ├── components/
    │   │   ├── layout/        # Sidebar, Header, Protected Layout
    │   │   └── ui/            # Button, Input, Table, Modal, Badge, FileUpload, etc.
    │   ├── context/           # AuthContext (JWT state, permissions)
    │   ├── pages/
    │   │   ├── dashboard/     # Metric cards, today's appointments, recent patients
    │   │   ├── patients/      # List, searchable filters, patient profile & histories
    │   │   ├── appointments/  # Visual React Big Calendar & slot booking form
    │   │   ├── records/       # Clinical consultation forms, Rx tables & file attachments
    │   │   └── users/         # Staff directory and registration
    │   └── App.jsx            # Router and QueryClient setup
```

---

## 🔒 Security Best Practices
- Encrypted password storage using **bcryptjs** (salt factor 12).
- Automatic JWT refresh token rotation with HTTP interceptors.
- Granular Role-Based Access Control enforced at both backend route handlers and frontend navigation guards.
- Sanitized file uploads restricted to medical document and image MIME types.
