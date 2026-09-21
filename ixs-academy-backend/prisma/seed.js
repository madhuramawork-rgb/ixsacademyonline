const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // ── Admin user ──────────────────────────────
  const hashedPassword = await bcrypt.hash('ChangeMe123!', 10);
  await prisma.admin.upsert({
    where: { email: 'admin@ixsacademy.com' },
    update: {},
    create: {
      name: 'Admin',
      email: 'admin@ixsacademy.com',
      password: hashedPassword,
    },
  });
  console.log('✓ Admin user ready → admin@ixsacademy.com / ChangeMe123!  (change this immediately)');

  // ── Program tracks (ACP / SDP / CCP) ────────
  const tracks = [
    {
      code: 'ACP',
      name: 'Automation Certification Program',
      idealFor: 'Freshers, diploma/B.Tech & final-year students, beginners and career switchers',
      duration: '1 Month + 1 Week',
      internship: 'Not included',
      certification: 'IXS Academy Certificate',
      description:
        'Fundamentals, practical lab, mini projects, assessments and interview preparation. Basic exposure to TIA Portal, SCADA, Ignition & EPLAN.',
      fee: 15000,
      order: 1,
    },
    {
      code: 'SDP',
      name: 'Skill Development Program',
      idealFor: 'Students with basic automation knowledge and working professionals',
      duration: '1 Month + 1 Week',
      internship: '1 Week, incl. industrial visit',
      certification: 'IXS + Client Company Certificate',
      description:
        'Practical, project-driven training with minimal theory. Daily practicals, small projects, assessments and interview preparation.',
      fee: 20000,
      order: 2,
    },
    {
      code: 'CCP',
      name: 'Company Certified Program',
      idealFor: 'Experienced candidates, or those seeking internship and live project exposure',
      duration: '~2 Months',
      internship: 'Month 1 at IXS, Month 2 at IC Pro Solutions',
      certification: 'Client Company Certificate',
      description:
        'Real industrial projects carried out under working engineers, using TIA Portal, SCADA, Ignition & EPLAN.',
      fee: 30000,
      order: 3,
    },
  ];

  for (const track of tracks) {
    const existing = await prisma.programTrack.findFirst({ where: { code: track.code } });
    if (!existing) await prisma.programTrack.create({ data: track });
  }
  console.log('✓ Program tracks seeded (ACP, SDP, CCP)');

  // ── Impact counters ─────────────────────────
  const counters = [
    { label: 'Students Trained', value: 100, suffix: '+', order: 1 },
    { label: 'Students Placed', value: 90, suffix: '+', order: 2 },
    { label: 'Faculty', value: 20, suffix: '+', order: 3 },
    { label: 'Training Campus', value: 1, suffix: '', order: 4 },
    { label: 'Corporate Partners', value: 12, suffix: '+', order: 5 },
    { label: 'MOUs with Colleges', value: 12, suffix: '+', order: 6 },
  ];

  for (const counter of counters) {
    const existing = await prisma.impactCounter.findFirst({ where: { label: counter.label } });
    if (!existing) await prisma.impactCounter.create({ data: counter });
  }
  console.log('✓ Impact counters seeded');

  console.log('\nSeed complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
