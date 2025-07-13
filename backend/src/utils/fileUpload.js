import path from 'path';
import ErrorResponse from './errorResponse.js';

// Set storage engine
const uploadPath = process.env.FILE_UPLOAD_PATH || 'public/uploads';

// Check file type
const checkFileType = (file, cb, filetypes) => {
  // Allowed ext
  const allowedFileTypes = filetypes || ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
  
  // Check mime type
  const isMimeTypeAllowed = allowedFileTypes.includes(file.mimetype);
  
  // Check extension
  const extname = allowedFileTypes.includes(path.extname(file.originalname).toLowerCase());
  
  if (isMimeTypeAllowed && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images and PDFs are allowed.'));
  }
};

// File upload middleware
const fileUpload = (options = {}) => {
  const { 
    fieldName = 'file', 
    maxSize = 5 * 1024 * 1024, // 5MB default
    fileTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'],
    isMultiple = false
  } = options;

  return (req, res, next) => {
    if (!req.files) {
      return next(new ErrorResponse(`Please upload a file`, 400));
    }

    const files = isMultiple ? req.files[fieldName] : [req.files[fieldName]];
    
    // Check if files exist
    if (!files || (Array.isArray(files) && files.length === 0)) {
      return next(new ErrorResponse(`Please upload a file`, 400));
    }

    // Process each file
    const uploadPromises = files.map(file => {
      return new Promise((resolve, reject) => {
        // Check file size
        if (file.size > maxSize) {
          return reject(new ErrorResponse(
            `File ${file.name} is too large. Max size is ${maxSize / (1024 * 1024)}MB`,
            400
          ));
        }

        // Check file type
        checkFileType(file, (err) => {
          if (err) return reject(new ErrorResponse(err.message, 400));
          
          // Create custom filename
          const fileExt = path.extname(file.name).toLowerCase();
          const fileName = `file_${Date.now()}${fileExt}`;
          const filePath = path.join(uploadPath, fileName);
          
          // Move file to uploads directory
          file.mv(filePath, err => {
            if (err) {
              console.error('File upload error:', err);
              return reject(new ErrorResponse('Problem with file upload', 500));
            }
            
            resolve({
              fileName,
              filePath,
              fileType: file.mimetype,
              fileSize: file.size,
              originalName: file.name
            });
          });
        }, fileTypes);
      });
    });

    // Wait for all files to be processed
    Promise.all(uploadPromises)
      .then(fileData => {
        if (isMultiple) {
          req.uploadedFiles = fileData;
        } else {
          req.uploadedFile = fileData[0];
        }
        next();
      })
      .catch(err => {
        next(err);
      });
  };
};

export default fileUpload;
