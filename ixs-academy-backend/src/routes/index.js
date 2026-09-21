const express = require('express');
const prisma = require('../config/db');
const createCrudRouter = require('../utils/routeFactory');

const authRoutes = require('./authRoutes');
const enquiryRoutes = require('./enquiryRoutes');
const partnershipRoutes = require('./partnershipRoutes');
const uploadRoutes = require('./uploadRoutes');

const router = express.Router();

// Auth
router.use('/auth', authRoutes);

// Homepage content masters (generic CRUD)
router.use('/banners', createCrudRouter(prisma, 'banner'));
router.use('/programs', createCrudRouter(prisma, 'program'));
router.use('/tracks', createCrudRouter(prisma, 'programTrack', { orderBy: { order: 'asc' } }));
router.use('/why-ixs', createCrudRouter(prisma, 'whyIxsPoint'));
router.use('/counters', createCrudRouter(prisma, 'impactCounter'));

// People
router.use('/faculty', createCrudRouter(prisma, 'faculty', { searchFields: ['name', 'subject'] }));
router.use('/advisory', createCrudRouter(prisma, 'advisoryMember', { searchFields: ['name', 'org'] }));
router.use('/leadership', createCrudRouter(prisma, 'leadershipMember', { searchFields: ['name', 'role'] }));

// Social proof
router.use('/partners', createCrudRouter(prisma, 'partner', { searchFields: ['name'] }));
router.use('/testimonials', createCrudRouter(prisma, 'testimonial', { searchFields: ['name', 'company'] }));
router.use('/podcasts', createCrudRouter(prisma, 'podcast', { searchFields: ['title', 'guest'] }));
router.use('/accreditations', createCrudRouter(prisma, 'accreditation'));
router.use('/gallery', createCrudRouter(prisma, 'galleryPhoto'));

// Form submissions (custom: public POST + admin-only management)
router.use('/enquiries', enquiryRoutes);
router.use('/partnerships', partnershipRoutes);

// File uploads
router.use('/upload', uploadRoutes);

module.exports = router;
