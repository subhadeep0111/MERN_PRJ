import MedicalRecord from '../models/MedicalRecord.js';
import AuditLog from '../models/AuditLog.js';

// GET /api/records
export const listRecords = async (req, res, next) => {
  try {
    const { patientId } = req.query;
    const filter = {};
    if (patientId) filter.patient = patientId;

    const records = await MedicalRecord.find(filter)
      .populate('doctor', 'name specialization')
      .populate('patient', 'firstName lastName patientId')
      .sort({ visitDate: -1 });

    return res.status(200).json({ success: true, records });
  } catch (error) {
    next(error);
  }
};

// GET /api/records/patient/:patientId
export const getByPatient = async (req, res, next) => {
  try {
    const records = await MedicalRecord.find({ patient: req.params.patientId })
      .populate('doctor', 'name specialization')
      .sort({ visitDate: -1 });
    return res.status(200).json({ success: true, records });
  } catch (error) {
    next(error);
  }
};

// GET /api/records/:id
export const getById = async (req, res, next) => {
  try {
    const record = await MedicalRecord.findById(req.params.id)
      .populate('doctor', 'name specialization')
      .populate('patient', 'firstName lastName patientId');
    if (!record) return res.status(404).json({ success: false, message: 'Medical record not found.' });
    return res.status(200).json({ success: true, record });
  } catch (error) {
    next(error);
  }
};

// POST /api/records
export const createRecord = async (req, res, next) => {
  try {
    const record = await MedicalRecord.create(req.body);

    await AuditLog.create({
      user: req.user.id,
      action: 'CREATE',
      entity: 'MedicalRecord',
      entityId: record._id,
      metadata: { patient: record.patient, visitDate: record.visitDate }
    });

    return res.status(201).json({ success: true, record });
  } catch (error) {
    next(error);
  }
};

// PUT /api/records/:id
export const updateRecord = async (req, res, next) => {
  try {
    const record = await MedicalRecord.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    })
      .populate('doctor', 'name specialization')
      .populate('patient', 'firstName lastName patientId');

    if (!record) return res.status(404).json({ success: false, message: 'Medical record not found.' });
    return res.status(200).json({ success: true, record });
  } catch (error) {
    next(error);
  }
};

// POST /api/records/:id/attachments
export const addAttachment = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }

    const attachment = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path,
      uploadedAt: new Date()
    };

    const record = await MedicalRecord.findByIdAndUpdate(
      req.params.id,
      { $push: { attachments: attachment } },
      { new: true }
    );

    if (!record) return res.status(404).json({ success: false, message: 'Medical record not found.' });
    return res.status(200).json({ success: true, attachment, record });
  } catch (error) {
    next(error);
  }
};
