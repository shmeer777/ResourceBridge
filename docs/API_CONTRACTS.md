# API Contract Plan

Base prefix: `/api/v1`

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`
- `GET /resources`
- `POST /resources`
- `GET /resources/{id}`
- `PATCH /resources/{id}`
- `GET /resources/{id}/availability`
- `POST /bookings`
- `GET /bookings/my`
- `PATCH /bookings/{id}/decision`
- `POST /bookings/{id}/cancel`
- `POST /bookings/{id}/check-in`
- `POST /bookings/{id}/check-out`
- `POST /reports/condition`
- `POST /reports/incidents`
- `GET /audit/{resource_id}`
- `GET /health`

These are planned routes; they are not implemented by this scaffold.
