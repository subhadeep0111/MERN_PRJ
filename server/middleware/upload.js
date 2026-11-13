import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, process.env.UPLOAD_PATH || './uploads');
  },
  filename: (req, file, cb) => {
    const sanitizedName = file.originalname.replace(/\s+/g, '_');
    cb(null, `${Date.now()}-${sanitizedName}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /pdf|jpg|jpeg|png|doc|docx/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  if (extname || mimetype) {
    cb(null, true);
  } else {
    cb(new Error('File type not allowed. Allowed: pdf, jpg, jpeg, png, doc, docx'), false);
  }
};

const multerConfig = {
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
};

export const upload = multer(multerConfig).single('file');
export const uploadMultiple = multer(multerConfig).array('files', 10);
