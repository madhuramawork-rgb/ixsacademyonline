# IXS Academy — Static Website (Deployable, Backend-Connected)

Plain HTML, CSS, and vanilla JavaScript. No build step, no framework. This version is now **wired to the real backend API** (`ixs-academy-backend.zip`) — not just a visual mockup.

## What's in it

| File | Page |
|---|---|
| `Main.html` | Public homepage |
| `Login.html` | Login — **real auth**, calls `POST /auth/login` |
| `Admin.html` | Admin CMS panel — **real data** for 4 screens (see below) |
| `Enquiry.html` | "Enquire Now" form — **really submits** to `POST /enquiries` |
| `BecomePartner.html` | "Become a Partner" form — **really submits** to `POST /partnerships` |
| `config.js` | **Edit this one file** to point every page at your backend URL |

## Before you run it

1. Get the backend running first (see `IXS-Academy-Technical-Handoff.md` or the backend's own README) — install deps, migrate, seed, `npm run dev`. It defaults to `http://localhost:5000`.
2. Open `config.js` and confirm `API_BASE` matches where your backend is actually running. It's one line:
   ```js
   const API_BASE = 'http://localhost:5000/api/v1';
   ```
   Update this whenever you deploy the backend somewhere real (Render, Railway, etc.) — every page picks it up automatically since they all load this one file.
3. Serve this folder with any static server (opening `Main.html` directly from disk also works for browsing, but **Login/Admin/forms need to be served over http://, not file://**, for the browser's fetch requests to behave correctly):
   ```bash
   npx serve .
   # or
   python3 -m http.server 8080
   ```

## What's genuinely working now

- **Login** — authenticates against the real `Admin` table (seeded login: `admin@ixsacademy.com` / `ChangeMe123!`), stores a real JWT in `localStorage`, and the Admin panel redirects back to Login if that token is missing or expired.
- **Admin → Impact Counters** — loads real values from `GET /counters` on page load, "Save Changes" really does `PUT` each one back to the database.
- **Admin → Program Tracks** — same pattern for ACP/SDP/CCP fees, `GET`/`PUT /tracks`.
- **Admin → Hero Banners** — the "Existing slides" table is now populated from `GET /banners`; "+ Add Slide" really does `POST /banners` and refreshes the table.
- **Admin → Enquiries** — the table loads real submissions via `GET /enquiries`, with the search box and status filter actually querying the API (`?search=`, `?status=`).
- **Enquire Now** and **Become a Partner** — both forms really submit to the backend and show a real success/error message. No login needed for these (they're public endpoints).
- **Logout** clears the stored session and returns to Login.

## What's still not wired (same content masters, not yet given editor screens)

Dashboard's summary numbers, Faculty, Advisory Board, Leadership, Our Programs, Why IXS, Flagship, Campus, Industry Partners, Testimonials, Podcasts, Accreditations, and the About Us Gallery are still static/illustrative in the Admin UI — the backend already has working CRUD endpoints for every one of these (see the API reference in `IXS-Academy-Technical-Handoff.md`), they just don't have a wired-up editor screen yet the way Counters/Tracks/Banners/Enquiries do. Wiring another one follows the exact same pattern already used for those four — ask for it by name and it can be added the same way.

## Still open, unrelated to wiring

- Passwords aren't reset/rotated anywhere in the UI — do that via `PUT /auth/change-password` directly (see backend README) until an admin-management screen exists.
- No image upload UI wired yet (the backend's `/upload` endpoint exists; the "drag & drop" boxes in Hero Banners are still visual only).
- CORS: if you serve the frontend from a different origin than `localhost`, make sure the backend's `CLIENT_URL` env var matches it.
