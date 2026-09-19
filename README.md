# PulseWatch

PulseWatch is an API monitoring and incident-management platform built with MongoDB, Express, React and Node.js.

## Bricks implemented

1. Authentication + project setup
2. Monitor management
3. Monitoring engine
4. Monitoring history + analytics
5. Failure detection + incidents
6. Real-time dashboard with Socket.IO
7. Alert/notification system with optional email
8. Advanced monitoring: headers, request body, response text and JSON validation
9. Public status page + maintenance windows
10. Production-oriented hardening: validation, ownership checks, indexes, env configuration, bounded history queries and clean startup

## Architecture

React
→ Express REST API
→ MongoDB

Node monitoring scheduler
→ fetch API
→ MonitorResult
→ Incident
→ Socket.IO
→ React dashboard

## Run

### Backend

```bash
cd server
npm install
copy .env.example .env
npm run dev
```

Edit `.env` and put your MongoDB URI and JWT secret.

### Frontend

Open another terminal:

```bash
cd client
npm install
npm run dev
```

Open the Vite URL, normally http://localhost:5173.

## Public status page

After registering, your user id is visible in localStorage under `user`.

Open:

http://localhost:5173/status/YOUR_USER_ID

## Optional email alerts

Fill SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS and ALERT_FROM in `.env`.

Without SMTP configuration, incidents still work; the server simply logs that email delivery was skipped.

## Important production notes

This is a portfolio-grade complete implementation, not a hardened internet-scale monitoring service.

Before exposing it publicly, add:
- SSRF protection including DNS/IP validation and private-network blocking
- rate limiting
- HTTPS
- stronger auth/session architecture
- secrets management
- a job queue/worker architecture for scale
- retry/backoff policy
- structured logging
- monitoring of the monitoring system itself
