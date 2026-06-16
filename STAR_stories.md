Situation:
I was building a Job Application Backend in Node.js and PostgreSQL, committing after every checkpoint. At some point my .gitignore was missing, so my .env file got pushed to a public GitHub repository.

Task:
The .env contained my JWT secret key, which meant anyone online could forge authentication tokens and access protected API endpoints as any user.

Action:
I removed .env from Git tracking using git rm --cached .env, added .gitignore with .env listed, created a .env.example with placeholder values so future contributors know what variables are needed, and rotated the JWT secret to a new random value using Node's crypto module.

Result:
Even if someone had copied the old secret before I caught it, rotating it invalidated all previously signed tokens. Going forward, secrets can never be accidentally committed because .gitignore is now in place from the start.