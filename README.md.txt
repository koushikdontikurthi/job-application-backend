# Job Application Backend

A Node.js, Express, and PostgreSQL backend for tracking jobs and applications.

## Tech Stack

- Node.js
- Express
- PostgreSQL
- Docker
- bcrypt
- jsonwebtoken
- node-postgres (`pg`)

## Prerequisites

Before running the project, make sure the following are installed:

- Node.js
- npm
- Docker Desktop
- Git

Verify installation:

```bash
node -v
npm -v
docker -v
git --version
```

## Setup / Quickstart

**1. Clone the repository**

```bash
git clone <YOUR_REPOSITORY_URL>
cd job-application-backend
```

**2. Install dependencies**

```bash
npm install
```

**3. Create environment file**

```bash
cp .env.example .env
```

Update the values as needed.

**4. Start Docker**

```bash
docker start job_backend_db
```

**5. Run database schema**

```bash
docker cp schema.sql job_backend_db:/schema.sql
docker exec job_backend_db psql -U postgres -d jobdb -f //schema.sql
```

**6. Run seed script**

```bash
npm run seed
```

**7. Start the server**

```bash
npm start
```

**8. Verify**

```bash
curl http://localhost:3000/health
```

Expected response:

```json
{ "ok": true, "message": "server is running" }
```

## Environment Variables

Create a `.env` file in the project root:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=jobdb
JWT_SECRET=your_super_secret_jwt_key
NODE_ENV=development
```

## Current Features

- Health check endpoint
- User signup with bcrypt password hashing
- User login with JWT
- Protected `/auth/me` endpoint
- Create jobs with authenticated ownership
- List jobs
- Get job by id
- Update jobs with owner validation
- Soft delete jobs with owner validation
- Apply to jobs with duplicate prevention
- Recruiter view of applicants with pagination
- Candidate view of their own applications

## API Examples

### Health Check

```bash
curl http://localhost:3000/health
```

### Signup

```bash
curl -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@example.com\",\"password\":\"secret123\"}"
```

### Login

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@example.com\",\"password\":\"secret123\"}"
```

Copy the `token` value from the login response.

### Get Current User

```bash
curl http://localhost:3000/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Create Job

```bash
curl -X POST http://localhost:3000/jobs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d "{\"title\":\"Backend Engineer\",\"company\":\"Google\"}"
```

### List Jobs

```bash
curl http://localhost:3000/jobs
```

### Get Job By Id

```bash
curl http://localhost:3000/jobs/1
```

### Update Job

```bash
curl -X PUT http://localhost:3000/jobs/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d "{\"title\":\"Senior Backend Engineer\",\"company\":\"Google\"}"
```

### Delete Job

```bash
curl -X DELETE http://localhost:3000/jobs/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Applications

### Apply to a job

```bash
curl -X POST http://localhost:3000/applications \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d "{\"jobId\":1}"
```

### View my applications

```bash
curl http://localhost:3000/applications/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### View applications for a job

```bash
curl "http://localhost:3000/jobs/2/applications?page=1&limit=5" \
  -H "Authorization: Bearer YOUR_TOKEN"
```
## Reliability Notes

### Idempotency
POST /applications uses ON CONFLICT DO NOTHING — safe to retry.
Duplicate requests return 200 instead of creating duplicate rows.

### Retry safety
GET requests are always safe to retry — read-only, no side effects.
PUT /jobs/:id is safe to retry — updates to the same value are harmless.
DELETE /jobs/:id is safe to retry — soft delete is idempotent.
POST /auth/signup is NOT safe to retry — second attempt returns 409.

### Failure handling
If the database is unavailable, all endpoints return 500.
JWT errors return 401 with specific codes: TOKEN_EXPIRED or INVALID_TOKEN.
Validation errors return 400 with code VALIDATION_ERROR.