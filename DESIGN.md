## Backend Architecture

The backend currently follows a layered architecture with five main layers.

### 1. HTTP Request Layer

The request originates from a client such as curl, Postman, or a frontend application.

Examples:

```http
POST /auth/login
POST /jobs
POST /applications
GET /applications/me
```

The HTTP request contains information such as:

* URL
* HTTP method
* Headers
* JWT token
* Request body
* Query parameters

---

### 2. Router Layer

The router maps an incoming request to the correct handler.

Examples:

```javascript
router.post("/", createJob);
router.get("/:id", getJobById);
router.get("/me", getMyApplications);
```

Responsibilities:

* Match URL patterns
* Match HTTP methods
* Connect requests to middleware and controllers

Examples:

```http
POST /jobs
```

→ `jobRoutes.js`

```http
GET /applications/me
```

→ `applicationRoutes.js`

---

### 3. Middleware Layer

Middleware handles cross-cutting concerns before business logic executes.

Examples:

* Authentication
* Validation
* Logging
* Security checks

Current middleware:

```javascript
authMiddleware
```

Responsibilities:

* Verify JWT token
* Reject missing tokens
* Reject invalid tokens
* Attach authenticated user information to:

```javascript
req.user
```

Example:

```javascript
req.user.userId
```

This allows controllers to trust the authenticated identity instead of user-provided data.

---

### 4. Controller Layer

Controllers contain the application's business logic.

Examples:

```javascript
createJob()
getJobs()
getJobById()
createApplication()
getApplicationsForJob()
getMyApplications()
```

Responsibilities:

* Read request data
* Validate business rules
* Execute database operations
* Return HTTP responses

Examples:

```javascript
req.body
req.params
req.query
req.user
```

Controllers decide which status code to return:

```http
200 OK
201 Created
400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
409 Conflict
500 Internal Server Error
```

---

### 5. Database Layer

The database layer executes SQL queries and returns rows to the controller.

Technology:

* PostgreSQL
* Docker

Examples:

```sql
INSERT
SELECT
UPDATE
JOIN
```

Responsibilities:

* Store application data
* Enforce constraints
* Maintain data integrity
* Execute transactions

The backend uses parameterized queries:

```sql
WHERE id = $1
```

instead of string concatenation to prevent SQL injection.

---

# Database Design

The system currently contains three primary tables.

---

## 1. users

Stores account information.

Columns:

* id
* email
* password_hash
* created_at

Constraints:

```sql
PRIMARY KEY(id)
UNIQUE(email)
```

Purpose:

* Each user has a unique identifier.
* No two users can register using the same email address.

---

## 2. jobs

Stores jobs created by users.

Columns:

* id
* title
* company
* user_id
* created_at
* deleted_at

Constraints:

```sql
PRIMARY KEY(id)

FOREIGN KEY(user_id)
REFERENCES users(id)

CHECK(char_length(title) > 0)

CHECK(char_length(company) > 0)
```

### Why CHECK Constraints?

A NOT NULL constraint prevents:

```sql
title = NULL
```

but still allows:

```sql
title = ''
```

which is an empty string.

The CHECK constraints ensure that:

```sql
char_length(title) > 0
char_length(company) > 0
```

so jobs cannot be created with empty titles or empty company names.

This protects data quality even if application-level validation is bypassed.

---

### Why deleted_at?

The project uses a soft delete strategy.

Instead of permanently deleting rows:

```sql
DELETE FROM jobs
WHERE id = 1;
```

the backend records when a job was deleted:

```sql
UPDATE jobs
SET deleted_at = NOW()
WHERE id = 1;
```

Benefits:

* Preserves historical data
* Supports recovery of deleted jobs
* Prevents accidental data loss
* Keeps related applications intact
* Provides an audit trail

---

## 3. applications

Stores which user applied to which job.

Columns:

* id
* user_id
* job_id
* created_at

Constraints:

```sql
PRIMARY KEY(id)

FOREIGN KEY(user_id)
REFERENCES users(id)

FOREIGN KEY(job_id)
REFERENCES jobs(id)

UNIQUE(user_id, job_id)
```

### Why UNIQUE(user_id, job_id)?

This ensures:

```text
A user can apply to many jobs.
A job can receive many applications.
A user cannot apply to the same job twice.
```

The database enforces this rule even if the application code fails.

The project additionally supports idempotent application creation using:

```sql
ON CONFLICT (user_id, job_id)
DO NOTHING
```

which safely handles repeated requests.

---

# Relationships

### Users → Jobs

One user can create many jobs.

```text
User (1) ----< Jobs (Many)
```

---

### Users → Applications

One user can submit many applications.

```text
User (1) ----< Applications (Many)
```

---

### Jobs → Applications

One job can receive many applications.

```text
Job (1) ----< Applications (Many)
```

---

### Applications as a Junction Table

The applications table connects users and jobs.

```text
Users
   |
Applications
   |
Jobs
```

This creates a many-to-many relationship:

```text
Many Users ↔ Many Jobs
```

through the applications table.

---

# Failure Handling

Failures are anything that can go wrong at each layer.

---

## Middleware Failures

Examples:

* Missing JWT token
* Invalid JWT token
* Expired JWT token

Response:

```http
401 Unauthorized
```

---

## Controller Failures

Examples:

### Validation Failure

Missing required fields:

```http
400 Bad Request
```

Example:

```json
{
  "code": "VALIDATION_ERROR",
  "message": "Job id is required"
}
```

---

### Resource Not Found

Example:

```http
GET /jobs/999
```

Response:

```http
404 Not Found
```

---

### Authorization Failure

Authenticated user is not the resource owner.

Response:

```http
403 Forbidden
```

---

## Database Failures

### Duplicate Email

Protected by:

```sql
UNIQUE(email)
```

Response:

```http
409 Conflict
```

---

### Duplicate Application

Protected by:

```sql
UNIQUE(user_id, job_id)
```

and

```sql
ON CONFLICT DO NOTHING
```

---

### Foreign Key Violations

Protected by:

```sql
FOREIGN KEY(user_id)
FOREIGN KEY(job_id)
```

This prevents orphan records.

---

### Database Connection Failures

Examples:

* PostgreSQL unavailable
* Network issues
* Query execution failures

Response:

```http
500 Internal Server Error
```

---

# Safety Design

The backend follows several safety principles.

### Do Not Trust Client Input

Unsafe:

```javascript
const userId = req.body.userId;
```

Safe:

```javascript
const userId = req.user.userId;
```

The authenticated identity comes from a verified JWT token.

---

### Prevent SQL Injection

Unsafe:

```javascript
"SELECT * FROM jobs WHERE id = " + id
```

Safe:

```sql
WHERE id = $1
```

using parameterized queries.

---

### Enforce Integrity in the Database

Business rules are enforced using:

* PRIMARY KEY
* UNIQUE
* FOREIGN KEY
* CHECK constraints

This ensures correctness even if application validation fails.

## Async Notifications

### What triggers a notification?

A notification is triggered when a user successfully applies to a job.

Example:

```text
POST /applications
↓
Application created successfully
↓
Notify the job owner
```

---

### Why not send notifications synchronously?

Unsafe:

```text
Create application
↓
Send notification
↓
Return response
```

If the notification service is slow or unavailable, the user waits longer or the entire request may fail.

Safe:

```text
Create application
↓
Return response
↓
Send notification separately
```

The primary operation is saving the application. The notification is a secondary task and should not delay the user's request.

---

### Current Implementation (Fire and Forget)

After the database transaction commits successfully, trigger the notification without waiting for it to finish.

This approach allows the API to immediately return a response while the notification runs in the background.

---

### Why after COMMIT?

Unsafe:

```text
Send notification
↓
Commit transaction
```

If the transaction fails, the recruiter could receive a notification for an application that was never saved.

Safe:

```text
Commit transaction
↓
Send notification
```

The notification is only sent after the application has been successfully committed to the database.

---

### Production Implementation (Message Queue)

In production, notifications should be processed through a message queue instead of fire-and-forget.

Example:

```text
POST /applications
↓
Commit transaction
↓
Publish notification event to queue
↓
Return response
↓
Background worker processes queue
↓
Send notification
```

Possible technologies:

* BullMQ (Redis)
* RabbitMQ
* AWS SQS
* Kafka

Using a message queue provides:

* Retry support for failed notifications
* Better scalability
* Faster API response times
* Separation of notification processing from the main application flow
* Improved reliability when external services are unavailable

## Locking and Concurrency

### Where UNIQUE inserts can cause lock contention

In this project, lock contention can happen when multiple requests try to apply to the same job for the same user at the same time.

The `applications` table has the following constraint:

```sql
UNIQUE(user_id, job_id)
```

This constraint prevents duplicate applications.

Unsafe:

```text
Request A inserts user_id = 1, job_id = 2
↓
Request B inserts user_id = 1, job_id = 2 at the same time
```

PostgreSQL must protect the unique constraint, so one transaction may wait while the other completes.

Safe:

```sql
ON CONFLICT (user_id, job_id)
DO NOTHING
```

This makes repeated apply requests safe. Only one application is created, and duplicate requests do not create duplicate rows.

---

### Race condition in updateJob

The current `updateJob` implementation first checks ownership and then performs the update.

Current flow:

```text
SELECT job by id
↓
Check ownership
↓
UPDATE job
```

There is a small time gap between the `SELECT` and the `UPDATE`.

Unsafe:

```text
Request A selects job 1
↓
Request B updates or deletes job 1
↓
Request A continues and updates stale data
```

The job can change after it has been checked but before it is updated.

---

### How SELECT FOR UPDATE fixes it

`SELECT FOR UPDATE` locks the selected row inside a transaction.

Safe:

```text
BEGIN
↓
SELECT job FOR UPDATE
↓
Check ownership
↓
UPDATE job
↓
COMMIT
```

Example:

```sql
BEGIN;

SELECT id, user_id, title, company
FROM jobs
WHERE id = $1
FOR UPDATE;

UPDATE jobs
SET title = $2,
    company = $3
WHERE id = $1;

COMMIT;
```

By locking the row, other transactions cannot modify the same job until the current transaction finishes.

If something fails:

```sql
ROLLBACK;
```

The transaction is rolled back, the lock is released, and no partial changes are saved.

`SELECT FOR UPDATE` is useful whenever the backend needs to read a row, make a decision, and then safely update that same row without another transaction changing it in between.

## Architecture Decisions

### Why a monolith?
All application code runs in a single Node.js process. Microservices would add 
operational complexity (service discovery, network calls between services, 
distributed tracing) that isn't justified at this scale. A monolith is easier 
to build, test, and deploy for a single-developer project.

### Why PostgreSQL?
The data has clear relationships — users own jobs, users apply to jobs. 
PostgreSQL enforces integrity through PRIMARY KEY, FOREIGN KEY, UNIQUE, and 
CHECK constraints. Transactions guarantee that partial failures don't leave 
data in an inconsistent state. A document database would require enforcing 
these rules in application code, which is error-prone.

### Why Express?
Lightweight and unopinionated. Every middleware, route, and error handler is 
explicit — nothing is hidden. This makes the request lifecycle easy to reason 
about and debug.

## API Versioning

Routes are currently unversioned (e.g. /jobs, /auth, /applications).

When breaking changes are needed, versioning can be added by prefixing 
routes with /v1 in app.js:

    app.use('/v1/jobs', jobRoutes);
    app.use('/v1/auth', authRoutes);
    app.use('/v1/applications', applicationRoutes);

This allows old clients to continue using /v1 while new clients 
use /v2 with updated response shapes.

Current decision: no versioning until an external client depends on this API.

## Pagination

### Current implementation
LIMIT/OFFSET pagination on GET /jobs/:id/applications.

    SELECT ... LIMIT $1 OFFSET $2

Simple to implement and sufficient for small datasets.

### Tradeoff
At large offsets, PostgreSQL scans and discards all skipped rows before 
returning results. Performance degrades as page number increases.

### Alternative: cursor pagination
Use the last seen created_at or id as a cursor:

    WHERE created_at < $1 ORDER BY created_at DESC LIMIT $2

Faster at scale but cannot jump to arbitrary pages.

### Current decision
Offset pagination is kept for simplicity. Cursor pagination would be 
considered if the dataset grows large enough that deep page queries 
become slow.

## Schema Talk Track
My schema has three tables — users, jobs, and applications.
The users table stores account credentials. Email has a UNIQUE constraint so no two accounts can share the same email. Passwords are stored as bcrypt hashes, never plain text.
The jobs table stores job postings. Every job has a user_id foreign key pointing to the user who created it — that's how I enforce ownership. Title and company have both NOT NULL and CHECK constraints to prevent empty strings. There's also a deleted_at column for soft deletes — instead of removing the row, I set a timestamp so the data is preserved and applications referencing that job stay intact.
The applications table is a junction table connecting users and jobs — it represents a many-to-many relationship. The key constraint is UNIQUE(user_id, job_id) which prevents a user from applying to the same job twice. I also use ON CONFLICT DO NOTHING on inserts to make the apply endpoint idempotent — safe to retry without creating duplicates.
I have indexes on applications.job_id and applications.user_id for the recruiter and candidate query routes, and a composite index on jobs(deleted_at, created_at DESC) for the job listing query.


---