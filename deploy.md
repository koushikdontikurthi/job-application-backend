# Deploy Checklist

## Before deploying

- [ ] .env is in .gitignore and not committed
- [ ] .env.example exists with all required variables
- [ ] NODE_ENV=production in production environment
- [ ] JWT_SECRET is a strong random value
- [ ] Database is accessible from the server
- [ ] All dependencies are in package.json (not just devDependencies)

## On the server

- [ ] Set all environment variables from .env.example
- [ ] Run npm install
- [ ] Run database schema (schema.sql)
- [ ] Run npm start
- [ ] Hit /health to verify server is running

## Verify after deploy

- [ ] POST /auth/signup works
- [ ] POST /auth/login returns token
- [ ] POST /jobs works with token
- [ ] GET /jobs returns results
- [ ] Error responses are generic (no stack traces)