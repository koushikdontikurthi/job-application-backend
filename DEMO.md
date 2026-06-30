# Demo Script

Run these in order to demonstrate the API end-to-end.

## 1. Health check
    curl http://localhost:3000/health

## 2. Signup
    curl -X POST http://localhost:3000/auth/signup \
      -H "Content-Type: application/json" \
      -d "{\"email\":\"demo@example.com\",\"password\":\"demo123\"}"

## 3. Login (copy the token from response)
    curl -X POST http://localhost:3000/auth/login \
      -H "Content-Type: application/json" \
      -d "{\"email\":\"demo@example.com\",\"password\":\"demo123\"}"

## 4. Create a job
    curl -X POST http://localhost:3000/jobs \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer YOUR_TOKEN" \
      -d "{\"title\":\"Backend Engineer\",\"company\":\"Demo Co\"}"

## 5. Apply to the job (use the job id from step 4)
    curl -X POST http://localhost:3000/applications \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer YOUR_TOKEN" \
      -d "{\"jobId\":1}"

## 6. Apply again to demonstrate idempotency
    (run the same command — should return 200 "Application already exists")

## 7. View your applications
    curl http://localhost:3000/applications/me \
      -H "Authorization: Bearer YOUR_TOKEN"