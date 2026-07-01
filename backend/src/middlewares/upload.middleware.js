const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Check if Cloudinary is configured with valid non-placeholder keys
const hasCloudinary = process.env.CLOUDINARY_API_KEY && 
                      process.env.CLOUDINARY_API_KEY !== 'your_cloudinary_key' &&
                      !process.env.CLOUDINARY_API_KEY.includes('key');

let storage;

if (hasCloudinary) {
  const cloudinaryConfig = require('../../config/cloudinary');
  storage = cloudinaryConfig.storage;
} else {
  // Use local disk storage
  const uploadDir = path.join(__dirname, '../../uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  });
}

const multerUpload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Wrapper to modify req.file.path after upload completes
const upload = {
  single: (fieldName) => {
    const multerSingle = multerUpload.single(fieldName);
    return (req, res, next) => {
      multerSingle(req, res, (err) => {
        if (err) {
          return next(err);
        }
        if (req.file && !hasCloudinary) {
          const protocol = req.protocol;
          const host = req.get('host');
          req.file.path = `${protocol}://${host}/uploads/${req.file.filename}`;
        }
        next();
      });
    };
  }
};

module.exports = upload;
