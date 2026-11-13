import Patient from '../models/Patient.js';
import AuditLog from '../models/AuditLog.js';

// GET /api/patients
export const listPatients = async (req, res, next) => {
  try {
    const { search, status, assignedDoctor, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (assignedDoctor) filter.assignedDoctor = assignedDoctor;

    if (search) {
      const regex = new RegExp(search, 'i');
      filter.$or = [
        { firstName: regex },
        { lastName: regex },
        { phone: regex },
        { patientId: regex }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [patients, total] = await Promise.all([
      Patient.find(filter)
        .populate('assignedDoctor', 'name specialization')
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 }),
      Patient.countDocuments(filter)
    ]);

    return res.status(200).json({ success: true, total, page: parseInt(page), patients });
  } catch (error) {
    next(error);
  }
};

// POST /api/patients
export const createPatient = async (req, res, next) => {
  try {
    const patient = await Patient.create(req.body);

    await AuditLog.create({
      user: req.user.id,
      action: 'CREATE',
      entity: 'Patient',
      entityId: patient._id,
      metadata: { patientId: patient.patientId, name: `${patient.firstName} ${patient.lastName}` }
    });

    return res.status(201).json({ success: true, patient });
  } catch (error) {
    next(error);
  }
};

// GET /api/patients/:id
export const getPatientById = async (req, res, next) => {
  try {
    const patient = await Patient.findById(req.params.id).populate('assignedDoctor', 'name specialization email phone');
    if (!patient) return res.status(404).json({ success: false, message: 'Patient not found.' });
    return res.status(200).json({ success: true, patient });
  } catch (error) {
    next(error);
  }
};

// PUT /api/patients/:id
export const updatePatient = async (req, res, next) => {
  try {
    const patient = await Patient.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('assignedDoctor', 'name specialization');

    if (!patient) return res.status(404).json({ success: false, message: 'Patient not found.' });

    await AuditLog.create({
      user: req.user.id,
      action: 'UPDATE',
      entity: 'Patient',
      entityId: patient._id,
      metadata: { updatedFields: Object.keys(req.body) }
    });

    return res.status(200).json({ success: true, patient });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/patients/:id — deactivate
export const deactivatePatient = async (req, res, next) => {
  try {
    const patient = await Patient.findByIdAndUpdate(
      req.params.id,
      { status: 'inactive' },
      { new: true }
    );
    if (!patient) return res.status(404).json({ success: false, message: 'Patient not found.' });

    await AuditLog.create({
      user: req.user.id,
      action: 'DEACTIVATE',
      entity: 'Patient',
      entityId: patient._id,
      metadata: { patientId: patient.patientId }
    });

    return res.status(200).json({ success: true, message: 'Patient deactivated.', patient });
  } catch (error) {
    next(error);
  }
};
