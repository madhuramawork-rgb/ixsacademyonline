const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedExt = /jpeg|jpg|png|webp|svg|gif/;
  const extOk = allowedExt.test(path.extname(file.originalname).toLowerCase());
  const mimeOk = /image\//.test(file.mimetype);

  if (extOk && mimeOk) return cb(null, true);
  cb(new Error('Only image files are allowed (jpg, png, webp, svg, gif)'));
};

module.exports = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});
