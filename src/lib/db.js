import { Pool } from 'pg';
require ('dotenv').config();

const connectionPool = new Pool({
  // connectionString: process.env.POSTGRES_URL,
  user: "p_manage",
  host: "localhost",
  database: "p_manage",
  password: '2525',
  port: 5432,
  
});

export default connectionPool;