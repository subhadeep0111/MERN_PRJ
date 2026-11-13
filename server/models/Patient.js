import mongoose from 'mongoose';

const patientSchema = new mongoose.Schema(
  {
    patientId: { type: String, unique: true },
    firstName: { type: String, required: [true, 'First name is required'] },
    lastName: { type: String, required: [true, 'Last name is required'] },
    dob: { type: Date, required: [true, 'Date of birth is required'] },
    gender: { type: String, enum: ['male', 'female', 'other'] },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']
    },
    phone: { type: String, required: [true, 'Phone number is required'] },
    email: { type: String, lowercase: true, trim: true },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String
    },
    emergencyContact: {
      name: String,
      phone: String,
      relation: String
    },
    assignedDoctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' }
  },
  { timestamps: true }
);

// Auto-generate patientId: "P-" + 6 random uppercase alphanumeric
patientSchema.pre('save', async function (next) {
  if (!this.patientId) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let id = 'P-';
    for (let i = 0; i < 6; i++) {
      id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    this.patientId = id;
  }
  next();
});

const Patient = mongoose.model('Patient', patientSchema);
export default Patient;
