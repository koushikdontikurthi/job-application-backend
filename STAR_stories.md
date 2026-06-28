Situation:
I was building a Job Application Backend in Node.js and PostgreSQL, committing after every checkpoint. At some point my .gitignore was missing, so my .env file got pushed to a public GitHub repository.

Task:
The .env contained my JWT secret key, which meant anyone online could forge authentication tokens and access protected API endpoints as any user.

Action:
I removed .env from Git tracking using git rm --cached .env, added .gitignore with .env listed, created a .env.example with placeholder values so future contributors know what variables are needed, and rotated the JWT secret to a new random value using Node's crypto module.

Result:
Even if someone had copied the old secret before I caught it, rotating it invalidated all previously signed tokens. Going forward, secrets can never be accidentally committed because .gitignore is now in place from the start.

# STAR Stories

## Story 2 – Technical Decision (ON CONFLICT DO NOTHING)

### Situation

While building the job application endpoint, I needed to ensure that a user could not apply to the same job more than once. Since multiple requests could arrive at nearly the same time, I needed a solution that would prevent duplicate applications reliably.

### Task

I had to decide whether duplicate prevention should be implemented only in the Express application code or enforced at the database level.

### Action

I chose to enforce the rule in PostgreSQL by adding a `UNIQUE(user_id, job_id)` constraint to the `applications` table. I also used `ON CONFLICT (user_id, job_id) DO NOTHING` during the insert operation. I made this decision because application-level validation can be bypassed through direct database access, bugs in the application, or race conditions caused by concurrent requests. By enforcing the rule in the database, the constraint remains valid regardless of how the data is inserted.

### Result

The endpoint now prevents duplicate applications even if application validation fails. Using `ON CONFLICT DO NOTHING` also made the endpoint idempotent, allowing clients to safely retry the same request without creating duplicate records or causing unexpected side effects.

---

## Story 3 – Learning Quickly (Database Transactions)

### Situation

While implementing the application endpoint, I needed to guarantee that database operations were atomic so that either all changes were committed successfully or none of them were saved if an error occurred.

### Task

I had never implemented database transactions using Node.js and PostgreSQL before, so I needed to learn how transactions worked while building the feature.

### Action

I learned how PostgreSQL transactions use `BEGIN`, `COMMIT`, and `ROLLBACK` to guarantee consistency. During implementation, I also learned that each call to `pool.query()` may use a different database connection, which means multiple statements cannot safely participate in the same transaction unless they share the same client. To solve this, I built a reusable `withTransaction` helper that checks out a dedicated client from the connection pool, executes all database operations within a single transaction, commits on success, rolls back on failure, and finally releases the client back to the pool.

### Result

The application endpoint now guarantees atomic database operations. If any step fails, the transaction is rolled back automatically, preventing partial writes. The reusable transaction helper can also be used by future endpoints that require transactional behavior, reducing duplicated code and improving maintainability.

---

## Story 4 – Debugging a Transaction Refactor

### Situation

After creating the reusable `withTransaction` helper, I refactored the `createApplication` controller to use it instead of manually calling `BEGIN`, `COMMIT`, and `ROLLBACK`.

### Task

My goal was to remove the manual transaction management and rely entirely on the reusable transaction wrapper while ensuring the endpoint continued to work correctly.

### Action

During the refactor, I accidentally left a call to `client.query("COMMIT")` outside the callback passed to `withTransaction`. Since the `client` variable only existed inside the callback's scope, the server crashed with a scope-related error. I read the error message carefully, traced where the `client` variable was defined, realized that the transaction wrapper already handled `BEGIN`, `COMMIT`, and `ROLLBACK`, and removed the redundant transaction calls from the controller.

### Result

The refactored controller became simpler and more reliable because transaction management was centralized inside the `withTransaction` helper. I also gained a much deeper understanding of JavaScript variable scope, callback execution, and why transaction lifecycle management should be owned by a single abstraction rather than individual controllers.
