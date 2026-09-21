# IXS Academy — Backend API

A REST API + admin CMS backend for the IXS Academy website, built with **Node.js, Express, Prisma and PostgreSQL**.

It powers every content master in the admin panel design — Hero Banners, Programs, Program Tracks (ACP/SDP/CCP),
Impact Counters, Faculty, Advisory Board, Leadership, Industry Partners, Testimonials, Podcasts, Accreditations,
the About Us photo gallery — plus the two public forms (**Enquire Now** and **Become a Partner**).

---

## 1. Requirements

- Node.js 18+
- PostgreSQL 14+ (local install, or a hosted instance — Supabase, Railway, Neon, RDS, etc. all work)

---

## 2. Setup

```bash
# 1. Install dependencies
npm install

# 2. Copy the example env file and fill in real values
cp .env.example .env
```

Edit `.env`:

```
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
JWT_SECRET=<a long random string>
CLIENT_URL=http://localhost:3000
```

Generate a strong `JWT_SECRET` with:
```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

```bash
# 3. Create the database tables from the Prisma schema
npm run prisma:migrate
# (first run will ask for a migration name, e.g. "init")

# 4. Generate the Prisma client
npm run prisma:generate

# 5. Seed an admin user + the real ACP/SDP/CCP program tracks + impact counters
npm run seed
```

The seed creates one admin login:

```
email:    admin@ixsacademy.com
password: ChangeMe123!
```

**Change this password immediately** — either call `PUT /api/v1/auth/change-password` after logging in, or edit it directly in `prisma/seed.js` before seeding a fresh database.

```bash
# 6. Run it
npm run dev      # with auto-restart (nodemon)
# or
npm start        # plain node
```

The API is now live at `http://localhost:5000`.

---

## 3. Project structure

```
prisma/
  schema.prisma       All database models
  seed.js              Seeds an admin user + starter content
src/
  app.js               Express app: middleware, routes, error handling
  server.js             Entry point
  config/db.js          Shared Prisma client
  middleware/
    auth.js              JWT "protect" middleware
    upload.js            Multer image upload config
    errorHandler.js       Central error handler
  routes/
    index.js              Mounts every route below under /api/v1
    authRoutes.js          Login / me / change-password
    enquiryRoutes.js        Enquire Now form (public POST + admin management)
    partnershipRoutes.js     Become a Partner form (public POST + admin management)
    uploadRoutes.js          Image upload endpoint
  utils/
    asyncHandler.js         Wraps async route handlers
    crudFactory.js           Generic list/get/create/update/delete controller
    routeFactory.js           Wires crudFactory into an Express router with auth on writes
uploads/                  Uploaded images are stored here and served at /uploads/<file>
```

### Why one generic CRUD factory instead of 12 separate controllers?

Most content masters — Banners, Programs, Program Tracks, Why-IXS points, Impact Counters, Faculty, Advisory,
Leadership, Partners, Testimonials, Podcasts, Accreditations, Gallery photos — are all the same shape: a list of
records with an `order` field, simple CRUD, public reads, admin-only writes. `utils/crudFactory.js` builds that
once; `utils/routeFactory.js` wires it into routes. Adding a brand-new content type is typically a 5-line addition
to `prisma/schema.prisma` + one line in `src/routes/index.js` — see "Adding a new content type" below.

Enquiries and Partnerships break that pattern (public **POST**, but admin-only GET/PUT/DELETE, plus status
filtering), so they get their own small route files instead of forcing them through the generic factory.

---

## 4. API overview

All routes are prefixed with `/api/v1`. Reads (`GET`) are public. Writes (`POST` / `PUT` / `DELETE`) require:

```
Authorization: Bearer <token>
```

obtained from `POST /api/v1/auth/login`.

| Resource | Base path | Notes |
|---|---|---|
| Auth | `/auth` | `POST /login`, `GET /me`, `PUT /change-password` |
| Hero Banners | `/banners` | |
| Programs | `/programs` | `type`: `corporate` \| `college` \| `flagship` |
| Program Tracks | `/tracks` | ACP / SDP / CCP, includes `fee` |
| Why IXS points | `/why-ixs` | The 5 USP cards |
| Impact Counters | `/counters` | Students trained, placed, etc. |
| Faculty | `/faculty` | `type`: `permanent` \| `empanelled`; supports `?search=` |
| Advisory Board | `/advisory` | supports `?search=` |
| Leadership | `/leadership` | supports `?search=` |
| Industry Partners | `/partners` | Logos |
| Testimonials | `/testimonials` | Placement poster cards |
| Podcasts | `/podcasts` | |
| Accreditations | `/accreditations` | |
| About Us Gallery | `/gallery` | |
| Enquiries | `/enquiries` | `POST` is public (website form); everything else admin-only. Supports `?status=` and `?search=` |
| Partnerships | `/partnerships` | Same pattern, for the "Become a Partner" form |
| Uploads | `/upload` | `POST`, multipart field name `image`, admin-only. Returns `{ url }` |

Every list/create/update/delete response follows the same envelope:

```json
{ "success": true, "data": { ... } }
{ "success": true, "count": 6, "data": [ ... ] }
{ "success": false, "message": "..." }
```

### Example: logging in

```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ixsacademy.com","password":"ChangeMe123!"}'
```

### Example: creating a faculty member (admin)

```bash
curl -X POST http://localhost:5000/api/v1/faculty \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Sachin",
    "subject": "PLC & SCADA Systems",
    "type": "empanelled",
    "linkedin": "https://linkedin.com/in/example",
    "status": "active",
    "order": 1
  }'
```

### Example: submitting the public Enquire Now form

```bash
curl -X POST http://localhost:5000/api/v1/enquiries \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Doe",
    "email": "jane@example.com",
    "phone": "+91 9876543210",
    "program": "ACP — Automation Certification Program",
    "role": "Fresher / Student"
  }'
```

### Example: uploading an image, then attaching it to a record

```bash
# 1. Upload
curl -X POST http://localhost:5000/api/v1/upload \
  -H "Authorization: Bearer <token>" \
  -F "image=@./manoj.jpg"
# → { "success": true, "url": "/uploads/1729512345-812734.jpg" }

# 2. Save that URL onto a testimonial
curl -X PUT http://localhost:5000/api/v1/testimonials/<id> \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{ "photo": "/uploads/1729512345-812734.jpg" }'
```

---

## 5. Adding a new content type

Say you want a new "Awards" section:

1. Add a model to `prisma/schema.prisma`:
   ```prisma
   model Award {
     id        String   @id @default(uuid())
     title     String
     year      String?
     image     String?
     order     Int      @default(0)
     createdAt DateTime @default(now())
     updatedAt DateTime @updatedAt
   }
   ```
2. `npm run prisma:migrate` (name it e.g. `add_awards`)
3. In `src/routes/index.js`, add:
   ```js
   router.use('/awards', createCrudRouter(prisma, 'award'));
   ```
   Done — `/api/v1/awards` now supports full CRUD with public reads and admin-only writes, with zero new controller code.

---

## 6. Deployment notes

- Run `npm run prisma:migrate deploy` (not `dev`) in production.
- Point `uploads/` at persistent storage, or better, swap `middleware/upload.js` for direct upload to S3 /
  Cloudinary / similar before going live — a local `uploads/` folder won't survive redeploys on most hosting
  platforms (Render, Railway, Vercel, etc. use ephemeral filesystems).
- Set `NODE_ENV=production` and a real `CLIENT_URL` (your deployed frontend's origin) for CORS.
- Put a real, rotated value in `JWT_SECRET` — never reuse the example.
