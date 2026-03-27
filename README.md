# SL Live

Simple, fast Stockholm public transport app.

## Stack
- Frontend: React + Vite
- Backend: Node.js + Express
- Database: PostgreSQL

## Run locally

### Backend
```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

### Frontend
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

## Notes
- Frontend expects the backend at `VITE_API_BASE_URL`
- Backend expects PostgreSQL in `DATABASE_URL`
- Search uses SL Journey Planner stop-finder
- Departures use SL Transport API
