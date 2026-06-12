require("dotenv").config();
const bcrypt = require("bcrypt");
const { query } = require("./query");

const seed = async () => {
  try {
    const saltRounds = 10;
    const passwordHash1 = await bcrypt.hash("password123", saltRounds);
    
    const user1 = await query(
      'INSERT INTO users (email, password_hash) VALUES ($1, $2) ON CONFLICT (email) DO NOTHING RETURNING id',
      ['user1@example.com', passwordHash1]
    );
    if (!user1.rows[0]) {
    console.log('Seed data already exists, skipping.');
    process.exit(0);
}

    const job1 = await query(
      'INSERT INTO jobs (title, company, user_id) VALUES ($1, $2, $3) RETURNING id',
      ['Software Engineer', 'Tech Company', user1.rows[0].id]
    );
    const job2 = await query(
      'INSERT INTO jobs (title, company, user_id) VALUES ($1, $2, $3) RETURNING id',
      ['Product Manager', 'Innovative Startup', user1.rows[0].id]
    );

    const job3 = await query(
      'INSERT INTO jobs (title, company, user_id) VALUES ($1, $2, $3) RETURNING id',
      ['Data Scientist', 'Data Analytics Inc.', user1.rows[0].id]
    );

    const application1 = await query(
      'INSERT INTO applications (user_id, job_id) VALUES ($1, $2) RETURNING id',
      [user1.rows[0].id, job1.rows[0].id]
    );
    const application2 = await query(
      'INSERT INTO applications (user_id, job_id) VALUES ($1, $2) RETURNING id',
      [user1.rows[0].id, job2.rows[0].id]
    );

    console.log('Database seeded successfully');
    } catch (error) {
    console.error('Error seeding database:', error);    
    
  }
  process.exit(0);

};
seed();