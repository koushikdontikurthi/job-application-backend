# Job Application Backend

A backend API project built with Node.js, Express, and PostgreSQL.

## Current Progress
- Input validation helper
- PostgreSQL setup using Docker
- Database connection pool with pg
- DB health check route
- Schema created for users, jobs, and applications

## Tech Stack
- Node.js
- Express
- PostgreSQL
- Docker
- pg

## Project Structure
- `src/app.js` - Express app setup
- `src/server.js` - server entry point
- `src/db/index.js` - PostgreSQL connection pool
- `src/routes/healthRoutes.js` - database health route
- `schema.sql` - database schema
- `docker-compose.yml` - PostgreSQL container setup

## Setup
1. Install dependencies
   ```bash
   npm install