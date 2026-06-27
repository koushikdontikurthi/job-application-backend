const { query } = require("../db/query");

const insert = async (title, company, userId) => {
  const result = await query(
    "INSERT INTO jobs (title, company, user_id) VALUES ($1, $2, $3) RETURNING id, title, company, user_id, created_at",
    [title, company, userId]
  );
  return result.rows[0];
}

const findAll = async () => {
  const result = await query(
    "SELECT id, title, company, user_id, created_at FROM jobs WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT 20"
  );
  return result.rows;
}

const findById = async (id) => {
  const result = await query(
    "SELECT id, title, company, user_id, created_at FROM jobs WHERE id = $1 AND deleted_at IS NULL",    
    [id]
  );
    return result.rows[0];  
    
};

const update = async (id, title, company) => {
  const result = await query(
    "UPDATE jobs SET title = $2, company = $3 WHERE id = $1 AND deleted_at IS NULL RETURNING id, title, company, user_id, created_at",
    [id, title, company]
  );
  return result.rows[0];
};

const softDelete = async (id, userId) => {
  const result = await query(
    "UPDATE jobs SET deleted_at = NOW() WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL RETURNING id, title, company, user_id, created_at",
    [id, userId]
  );
  return result.rows[0];
};

module.exports = { insert, findAll, findById, update, softDelete };