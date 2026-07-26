# Ticket Booking Frontend (React + Vite)

This frontend provides the complete user booking flow for the backend service:

- View show and live seat availability
- Select and reserve seats
- Confirm payment before reservation expiry
- View booking success details

## Run frontend

```bash
cd frontend
npm install
npm run dev
```

The app runs on `http://localhost:5173`.

## API configuration

- Default API base: `/api/v1`
- Local development is proxied to `http://localhost:3000` via `vite.config.ts`
- Optional override: set `VITE_API_BASE` in `.env`

## Folder structure

```text
src/
├── app/
│   └── App.tsx
├── features/
│   └── booking/
│       ├── api/
│       ├── components/
│       ├── constants.ts
│       └── types/
├── shared/
│   └── components/
├── styles/
│   └── global.css
└── main.tsx
```
