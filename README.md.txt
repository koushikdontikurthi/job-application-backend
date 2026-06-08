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

## Apply Flow

1. User signs up with email and password.
2. Password is hashed before saving.
3. User logs in with email and password.
4. Server returns a signed JWT.
5. User sends the JWT in the `Authorization` header.
6. User creates a job, and the job stores `user_id`.
7. Owner can update or delete their own jobs.
8. Later, users can apply to jobs through an applications endpoint.

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

### View my applications

```bash
curl http://localhost:3000/applications/me \
  -H "Authorization: Bearer YOUR_TOKEN"

### view applications for a job

```bash
curl "http://localhost:3000/jobs/2/applications?page=1&limit=5" \
  -H "Authorization: Bearer YOUR_TOKEN"
```