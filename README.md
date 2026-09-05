# Threadcraft Pro

Threadcraft Pro is a garment POS and ERP application with a Flask/MySQL backend
and a React frontend.

## Project layout

- `backend/` contains the Flask API, models, routes, and services.
- `frontend/` contains the Vite React application.
- `mysql/` contains database initialization scripts.

## Development

Install frontend dependencies and start the client:

```sh
cd frontend
npm install
npm run dev
```

Start the API separately with the backend instructions in
`FLASK_MYSQL_INTEGRATION_PLAN.md`. The frontend proxies `/api` requests to
`http://127.0.0.1:5001` during development.

Build the frontend from the repository root:

```sh
npm --prefix frontend run build
```
