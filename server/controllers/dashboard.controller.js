import Patient from '../models/Patient.js';
import User from '../models/User.js';
import Appointment from '../models/Appointment.js';

// GET /api/dashboard
export const getStats = async (req, res, next) => {
  try {
    const now = new Date();

    // Today's range
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date(now);
    endOfToday.setHours(23, 59, 59, 999);

    // This week's range (Monday to Sunday)
    const dayOfWeek = now.getDay(); // 0=Sun
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() + diffToMonday);
    startOfWeek.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const [
      totalPatients,
      totalDoctors,
      appointmentsToday,
      appointmentsThisWeek,
      recentPatients,
      upcomingAppointments
    ] = await Promise.all([
      Patient.countDocuments({ status: 'active' }),
      User.countDocuments({ role: 'doctor', isActive: true }),
      Appointment.countDocuments({ date: { $gte: startOfToday, $lte: endOfToday } }),
      Appointment.countDocuments({ date: { $gte: startOfWeek, $lte: endOfWeek } }),
      Patient.find({ status: 'active' })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('assignedDoctor', 'name'),
      Appointment.find({
        date: { $gte: now },
        status: { $in: ['scheduled', 'confirmed'] }
      })
        .sort({ date: 1, timeSlot: 1 })
        .limit(5)
        .populate('patient', 'firstName lastName patientId')
        .populate('doctor', 'name')
    ]);

    return res.status(200).json({
      success: true,
      stats: {
        totalPatients,
        totalDoctors,
        appointmentsToday,
        appointmentsThisWeek,
        recentPatients,
        upcomingAppointments
      }
    });
  } catch (error) {
    next(error);
  }
};
