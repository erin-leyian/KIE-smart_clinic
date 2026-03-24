require('dotenv').config();
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');

async function main() {
  const hash = await bcrypt.hash('admin123', 10);
  
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: { rejectUnauthorized: false }
  });

  await conn.query(
    `INSERT INTO ClinicStaff (ClinicID, FirstName, LastName, Email, PhoneNumber, Role, PasswordHash) 
     VALUES (1, 'Admin', 'KIE', 'admin@kie.com', '+250788000001', 'Admin', ?)
     ON DUPLICATE KEY UPDATE PasswordHash = ?`,
    [hash, hash]
  );

  console.log('✅ Admin user created! Email: admin@kie.com Password: admin123');
  conn.end();
}

main().catch(console.error);