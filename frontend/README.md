# QueueCare Frontend

This is the React frontend for the KIE Smart Clinic application. To make this fully operational with the backend, you need to configure the database and start the backend Node.js server.

## Prerequisites
1. Node.js (v16 or higher)
2. PostgreSQL (or the SQL database used by the backend)

## Configuring the Backend (Database)

The frontend makes HTTP requests to \`http://localhost:5000/api\` to handle authentication and fetch patient records natively.

1. Navigate to your \`backend\` directory.
2. Make sure you have your database running.
3. Import the \`smart_clinic_schema.sql\` file into your database to create the necessary tables (\`users\`, \`appointments\`, etc.):
   \`\`\`bash
   # Example for PostgreSQL
   psql -U your_user -d your_db_name -f smart_clinic_schema.sql
   \`\`\`
4. Configure your backend `.env` variables or `db.py` / `index.js` connection strings to point to the newly created database.
5. Seed the \`users\` table with at least one doctor account, or use the sign-up form on the frontend to create a new user.
6. Start the backend:
   \`\`\`bash
   npm run dev 
   # or node server.js
   \`\`\`

## Running the Frontend

Once the backend is live at \`http://localhost:5000\`:

1. Install frontend dependencies:
   \`\`\`bash
   cd frontend
   npm install
   \`\`\`
2. Start the Vite server:
   \`\`\`bash
   npm run dev
   \`\`\`

### Features Implemented
- **Solid Login:** The Auth page now captures email, phone, and password state. It makes an actual \`POST\` fetch request to \`/api/auth/login\` and \`/api/auth/register\`. If the backend is running and valid, it handles the JWT token and redirects.
- **Dynamic Patient Records:** The \`PatientRecords.jsx\` component uses a \`useEffect\` hook to fetch records from \`/api/appointments\`. If the backend fails or isn't running yet, it seamlessly falls back to display mocked UI data so you can continue building frontend layouts. 

## Icons
All primitive emojis have been replaced with standard SVG icons using \`lucide-react\`.
