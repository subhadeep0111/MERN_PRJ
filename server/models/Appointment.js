import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: [true, 'Patient is required']
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Doctor is required']
    },
    date: { type: Date, required: [true, 'Date is required'] },
    timeSlot: { type: String, required: [true, 'Time slot is required'] },
    duration: { type: Number, default: 30 },
    status: {
      type: String,
      enum: ['scheduled', 'confirmed', 'completed', 'cancelled', 'no-show'],
      default: 'scheduled'
    },
    reason: { type: String },
    notes: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

const Appointment = mongoose.model('Appointment', appointmentSchema);
export default Appointment;
