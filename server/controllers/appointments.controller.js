import Appointment from '../models/Appointment.js';

// GET /api/appointments
export const listAppointments = async (req, res, next) => {
  try {
    const { doctor, status, dateFrom, dateTo, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (doctor) filter.doctor = doctor;
    if (status) filter.status = status;
    if (dateFrom || dateTo) {
      filter.date = {};
      if (dateFrom) filter.date.$gte = new Date(dateFrom);
      if (dateTo) filter.date.$lte = new Date(dateTo);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [appointments, total] = await Promise.all([
      Appointment.find(filter)
        .populate('patient', 'firstName lastName patientId')
        .populate('doctor', 'name')
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ date: 1, timeSlot: 1 }),
      Appointment.countDocuments(filter)
    ]);

    return res.status(200).json({ success: true, total, page: parseInt(page), appointments });
  } catch (error) {
    next(error);
  }
};

// POST /api/appointments
export const createAppointment = async (req, res, next) => {
  try {
    const { patient, doctor, date, timeSlot, duration, reason, notes } = req.body;

    // Check for overlap: same doctor, same date (day), same timeSlot
    const appointmentDate = new Date(date);
    const startOfDay = new Date(appointmentDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(appointmentDate);
    endOfDay.setHours(23, 59, 59, 999);

    const conflict = await Appointment.findOne({
      doctor,
      date: { $gte: startOfDay, $lte: endOfDay },
      timeSlot,
      status: { $nin: ['cancelled', 'no-show'] }
    });

    if (conflict) {
      return res.status(409).json({
        success: false,
        message: 'Doctor already has an appointment at that time slot.'
      });
    }

    const appointment = await Appointment.create({
      patient, doctor, date, timeSlot, duration, reason, notes,
      createdBy: req.user.id
    });

    const populated = await appointment.populate([
      { path: 'patient', select: 'firstName lastName patientId' },
      { path: 'doctor', select: 'name' }
    ]);

    return res.status(201).json({ success: true, appointment: populated });
  } catch (error) {
    next(error);
  }
};

// PUT /api/appointments/:id
export const updateAppointment = async (req, res, next) => {
  try {
    const { status, notes, reason } = req.body;
    const updateData = {};
    if (status) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;
    if (reason !== undefined) updateData.reason = reason;

    const appointment = await Appointment.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    })
      .populate('patient', 'firstName lastName patientId')
      .populate('doctor', 'name');

    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found.' });
    return res.status(200).json({ success: true, appointment });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/appointments/:id — cancel
export const cancelAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status: 'cancelled' },
      { new: true }
    )
      .populate('patient', 'firstName lastName patientId')
      .populate('doctor', 'name');

    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found.' });
    return res.status(200).json({ success: true, message: 'Appointment cancelled.', appointment });
  } catch (error) {
    next(error);
  }
};

// GET /api/appointments/slots?doctorId=X&date=YYYY-MM-DD
export const getSlots = async (req, res, next) => {
  try {
    const { doctorId, date } = req.query;
    if (!doctorId || !date) {
      return res.status(400).json({ success: false, message: 'doctorId and date are required.' });
    }

    // Generate all 30-min slots 09:00 - 17:00
    const allSlots = [];
    for (let hour = 9; hour < 17; hour++) {
      allSlots.push(`${String(hour).padStart(2, '0')}:00`);
      allSlots.push(`${String(hour).padStart(2, '0')}:30`);
    }

    const appointmentDate = new Date(date);
    const startOfDay = new Date(appointmentDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(appointmentDate);
    endOfDay.setHours(23, 59, 59, 999);

    const booked = await Appointment.find({
      doctor: doctorId,
      date: { $gte: startOfDay, $lte: endOfDay },
      status: { $nin: ['cancelled', 'no-show'] }
    }).select('timeSlot');

    const bookedSlots = booked.map((a) => a.timeSlot);
    const availableSlots = allSlots.filter((s) => !bookedSlots.includes(s));

    return res.status(200).json({ success: true, allSlots, bookedSlots, availableSlots });
  } catch (error) {
    next(error);
  }
};
