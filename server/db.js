import pg from 'pg';

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://cazyno:cazyno@localhost:5432/cazyno',
});

export default pool;
