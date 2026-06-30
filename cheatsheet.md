# Cheat Sheet

## HTTP Status Codes
200 OK — successful GET/PUT
201 Created — successful POST that creates a resource
204 No Content — successful DELETE, no body
400 Bad Request — validation error
401 Unauthorized — missing/invalid/expired token
403 Forbidden — authenticated but not allowed
404 Not Found — resource doesn't exist
409 Conflict — unique constraint violation
429 Too Many Requests — rate limit exceeded
500 Internal Server Error — unexpected failure

## SQL Patterns
Parameterized query:
    WHERE id = $1

Insert with returning:
    INSERT INTO table (col) VALUES ($1) RETURNING id

Idempotent insert:
    INSERT INTO table (a, b) VALUES ($1, $2) 
    ON CONFLICT (a, b) DO NOTHING

Transaction:
    BEGIN; ... ; COMMIT;
    (ROLLBACK on error)

Index check:
    EXPLAIN ANALYZE SELECT ...

## Constraints
PRIMARY KEY — unique row identifier
FOREIGN KEY — references another table's row
UNIQUE — no duplicate values
CHECK — custom validation rule
NOT NULL — value required