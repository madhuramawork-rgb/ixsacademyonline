const express = require('express');
const prisma = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const { protect } = require('../middleware/auth');

const router = express.Router();

// POST /api/v1/partnerships — public, called by the "Become a Partner" form
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const { company, sector, contact, email, phone, interests, message } = req.body;

    if (!company || !contact || !email) {
      return res
        .status(400)
        .json({ success: false, message: 'Company, contact person and email are required' });
    }

    const partnership = await prisma.partnership.create({
      data: {
        company,
        sector,
        contact,
        email,
        phone,
        interests: Array.isArray(interests) ? interests : [],
        message,
      },
    });

    res.status(201).json({ success: true, data: partnership });
  })
);

// Admin-only from here
router.use(protect);

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { status, search } = req.query;
    const where = {};

    if (status && status !== 'all') where.status = status;
    if (search) {
      where.OR = [
        { company: { contains: search, mode: 'insensitive' } },
        { contact: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const partnerships = await prisma.partnership.findMany({ where, orderBy: { createdAt: 'desc' } });
    res.json({ success: true, count: partnerships.length, data: partnerships });
  })
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const partnership = await prisma.partnership.findUnique({ where: { id: req.params.id } });
    if (!partnership) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: partnership });
  })
);

router.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const partnership = await prisma.partnership.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json({ success: true, data: partnership });
  })
);

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    await prisma.partnership.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Deleted' });
  })
);

module.exports = router;
