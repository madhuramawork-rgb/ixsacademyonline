const express = require('express');
const upload = require('../middleware/upload');
const { protect } = require('../middleware/auth');

const router = express.Router();

// POST /api/v1/upload  (multipart/form-data, field name "image")
// Returns a relative URL the admin forms can save onto a record's
// image/photo/logo field, e.g. { "url": "/uploads/172839-image.jpg" }
router.post('/', protect, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }
  res.json({ success: true, url: `/uploads/${req.file.filename}` });
});

module.exports = router;
