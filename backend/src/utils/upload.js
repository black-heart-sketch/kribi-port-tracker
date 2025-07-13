import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import ErrorResponse from './errorResponse.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Set storage engine
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../public/uploads');
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(
      null,
      `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

// Check file type
const checkFileType = (file, cb) => {
  // Allowed extensions
  const filetypes = /jpeg|jpg|png|gif|pdf/;
  // Check extension
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime type
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only images and PDFs are allowed'));
  }
};

// Initialize upload
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
}).single('file');

// Middleware to handle file upload
const uploadFile = (req, res, next) => {
  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading
      return next(
        new ErrorResponse(
          `File upload error: ${err.message}`,
          err.code === 'LIMIT_FILE_SIZE' ? 400 : 500
        )
      );
    } else if (err) {
      // An unknown error occurred
      return next(new ErrorResponse(err.message, 400));
    }
    
    // If no file was uploaded
    if (!req.file) {
      return next(new ErrorResponse('Please upload a file', 400));
    }
    
    // Add file path to request object
    req.file.path = req.file.path.replace(/\\/g, '/'); // Convert Windows paths to forward slashes
    
    next();
  });
};

// Middleware to handle multiple file uploads
const uploadFiles = (req, res, next) => {
  const uploadMultiple = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit per file
    fileFilter: function (req, file, cb) {
      checkFileType(file, cb);
    },
  }).array('files', 5); // Max 5 files

  uploadMultiple(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading
      return next(
        new ErrorResponse(
          `File upload error: ${err.message}`,
          err.code === 'LIMIT_FILE_SIZE' ? 400 : 500
        )
      );
    } else if (err) {
      // An unknown error occurred
      return next(new ErrorResponse(err.message, 400));
    }
    
    // If no files were uploaded
    if (!req.files || req.files.length === 0) {
      return next(new ErrorResponse('Please upload at least one file', 400));
    }
    
    // Convert Windows paths to forward slashes
    req.files = req.files.map((file) => ({
      ...file,
      path: file.path.replace(/\\/g, '/'),
    }));
    
    next();
  });
};

export { uploadFile, uploadFiles };

// Example usage in a route:
// router.post('/upload', uploadFile, (req, res, next) => {
//   res.status(200).json({
//     success: true,
//     data: `/uploads/${req.file.filename}`,
//   });
// });
