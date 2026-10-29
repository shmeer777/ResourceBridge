# ResourceBridge

ResourceBridge is an end-to-end resource-sharing platform designed to connect equipment and facility providers with individuals, researchers, and startups needing access to specialized tools and workspaces.

---

## Architecture & Technology Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, Axios, React Router v7.
- **Backend**: Python 3.11, FastAPI, SQLAlchemy 2.0, Alembic, Pydantic v2.
- **Database**: Supabase PostgreSQL (via `psycopg3`), with automatic safe schema initialization and SQLite fallback for zero-configuration local evaluation.
- **Authentication**: JWT (JSON Web Tokens) with secure `bcrypt` password hashing and strict Provider vs. Seeker role boundaries.

---

## Quick Start Guide (Windows PowerShell)

### 1. Backend Setup & Run

Open a Windows PowerShell terminal in the project directory:

```powershell
cd C:\Users\shame\OneDrive\Pictures\Desktop\ResourceBridge\backend

# Activate the existing virtual environment:
.\.venv\Scripts\Activate.ps1

# (Optional) Seed demo accounts and resources:
python seed.py

# Start the FastAPI backend server (http://localhost:8000):
uvicorn app.main:app --reload --port 8000
```

- API Base URL: `http://localhost:8000/api/v1`
- Interactive OpenAPI / Swagger Docs: `http://localhost:8000/docs`
- Health check: `http://localhost:8000/health`

### 2. Frontend Setup & Run

Open a second Windows PowerShell terminal:

```powershell
cd C:\Users\shame\OneDrive\Pictures\Desktop\ResourceBridge\frontend

# Install dependencies (if not already installed):
npm install

# Start the Vite development server (http://localhost:5173):
npm run dev

# Or run the production build:
npm run build
```

- Web Application: `http://localhost:5173`

---

## Verified Demo Accounts

The following demo accounts are verified and pre-seeded in the database:

| Role | Email | Password | Organization | Organization Type |
|------|-------|----------|--------------|-------------------|
| **Provider** | `provider@demo.com` | `DemoPassword123!` | BioFab Innovations Lab | Research Laboratory |
| **Seeker** | `seeker@demo.com` | `DemoPassword123!` | Quantum Bio Devices | N/A |

---

## Complete User Journeys Verified

### Provider Journey
1. Navigate to `http://localhost:5173/login/provider` and log in with `provider@demo.com`.
2. View the **Provider Dashboard** (`/provider`) showing active inventory and pending booking requests.
3. Go to **My Resources** (`/provider/resources`) to view all owned equipment and spaces.
4. Click **Add Resource** (`/provider/resources/new`) to publish a new equipment listing.
5. Click the **Edit** icon on any resource card (`/provider/resources/edit/:id`) to modify rates, specs, rules, or status.
6. Open **Availability** (`/provider/availability`) to set open reservation slots.
7. Open **Booking Requests** (`/provider/bookings`) to approve or reject seeker reservation requests with 1-click decisions.
8. Monitor **Condition Reports** (`/provider/reports`) for inspection logs recorded upon check-in and check-out.

### Seeker Journey
1. Navigate to `http://localhost:5173/login/seeker` and log in with `seeker@demo.com`.
2. View the **Seeker Dashboard** (`/seeker`) displaying active bookings and featured equipment.
3. Open **Explore Resources** (`/seeker/explore`) to search and filter equipment by keyword or category.
4. Click **Request Booking** on any listing (`/seeker/resources/:id`) to check its specifications, safety rules, and available windows.
5. Submit a booking request with your intended usage timeframe and project purpose.
6. Open **My Bookings** (`/seeker/bookings`) to monitor approval status.
7. When approved, click **Perform Check-In** (`/seeker/check-in/:id`) to record starting inspection conditions.
8. Once finished, perform **Check-Out** to record ending condition ratings and observations.

---

## Connecting to Supabase PostgreSQL

ResourceBridge is pre-configured to connect directly to Supabase PostgreSQL using SQLAlchemy and `psycopg3`.

### Supabase Setup Instructions:
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard) and create or select your project.
2. In your Project Settings → **Database**, locate the **Connection string** section.
3. Select **URI** mode and copy the PostgreSQL connection string:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
   ```
4. Open `backend/.env` and update `DATABASE_URL`:
   ```dotenv
   DATABASE_URL=postgresql+psycopg://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
   ```
5. Run the Alembic migrations or simply start the backend server (the application executes `Base.metadata.create_all()` safely on startup):
   ```powershell
   alembic upgrade head
   ```

---

## Running Verification Tests

Run the backend test suite:

```powershell
cd C:\Users\shame\OneDrive\Pictures\Desktop\ResourceBridge\backend
.\.venv\Scripts\Activate.ps1
pytest -v
```

Run the end-to-end user journeys verification:

```powershell
cd C:\Users\shame\OneDrive\Pictures\Desktop\ResourceBridge\backend
python tests/verify_journeys.py
```

Run the frontend build verification:

```powershell
cd C:\Users\shame\OneDrive\Pictures\Desktop\ResourceBridge\frontend
npm run build
```
