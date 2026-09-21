const express = require('express');
const prisma = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const { protect } = require('../middleware/auth');

const router = express.Router();

// POST /api/v1/enquiries — public, called by the "Enquire Now" form
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const { name, email, phone, program, role, message } = req.body;

    if (!name || !email) {
      return res.status(400).json({ success: false, message: 'Name and email are required' });
    }

    const enquiry = await prisma.enquiry.create({
      data: { name, email, phone, program, role, message },
    });

    res.status(201).json({ success: true, data: enquiry });
  })
);

// Everything below is admin-only (the Enquiries screen in the CMS)
router.use(protect);

// GET /api/v1/enquiries?status=new&search=...
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { status, search } = req.query;
    const where = {};

    if (status && status !== 'all') where.status = status;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    const enquiries = await prisma.enquiry.findMany({ where, orderBy: { createdAt: 'desc' } });
    res.json({ success: true, count: enquiries.length, data: enquiries });
  })
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const enquiry = await prisma.enquiry.findUnique({ where: { id: req.params.id } });
    if (!enquiry) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: enquiry });
  })
);

// PUT /api/v1/enquiries/:id — typically used to change status: new → contacted → closed
router.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const enquiry = await prisma.enquiry.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json({ success: true, data: enquiry });
  })
);

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    await prisma.enquiry.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Deleted' });
  })
);

module.exports = router;
