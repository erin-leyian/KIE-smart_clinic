# Backend Quick Start Guide

## Prerequisites

- Node.js (v14 or higher)
- MySQL/MariaDB (v5.7 or higher)
- npm or yarn package manager

## Installation

### 1. Install Dependencies

```bash
cd Backend
npm install
```

This installs:
- `express` - Web framework
- `mysql2/promise` - Database driver with promises
- `bcryptjs` - Password hashing
- `jsonwebtoken` - JWT token generation
- `cors` - CORS middleware
- `dotenv` - Environment variables
- `uuid` - UUID generation
- `africastalking` - SMS provider (existing)

### 2. Database Setup

#### Option A: Local MySQL

```bash
# Create database and import schema
mysql -u root -p < smart_clinic_schema.sql

# Or run the SQL commands manually in MySQL Workbench
```

#### Option B: Aiven MySQL (Cloud)

Connection details should be in your `.env` file.

### 3. Environment Configuration

Create a `.env` file in the `Backend` directory:

```bash
# Database Configuration
DB_HOST=localhost          # or your cloud DB host
DB_PORT=3306
DB_NAME=smart_clinic_db
DB_USER=root              # or your cloud user
DB_PASSWORD=your_password # or your cloud password

# JWT Configuration
JWT_SECRET=your-super-secret-key-min-32-chars

# Application
NODE_ENV=development
PORT=5000
```

### 4. Start the Server

**Development (with auto-reload)**:
```bash
npm run dev
```

**Production**:
```bash
npm start
```

Server will run on `http://localhost:5000`

### 5. Test the API

```bash
# Check health
curl http://localhost:5000/health

# Register a user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "password": "Password123!",
    "role": "patient"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "Password123!"
  }'

# Get current user (replace TOKEN with actual token)
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer TOKEN"
```

## Project Structure

```
Backend/
├── src/
│   ├── app.js                    # Express app setup
│   ├── controllers/              # Business logic
│   │   ├── auth.controller.js
│   │   ├── doctors.controller.js
│   │   ├── patientRecords.controller.js
│   │   ├── appointments.controller.js (partial)
│   │   ├── queue.controller.js
│   │   ├── notifications.controller.js
│   │   └── systemSettings.controller.js
│   ├── routes/                   # API routes
│   │   ├── auth.routes.js
│   │   ├── doctors.routes.js
│   │   ├── patientRecords.routes.js
│   │   ├── appointments.routes.js
│   │   ├── queue.routes.js
│   │   └── sms.routes.js
│   ├── middleware/
│   │   └── auth.middleware.js    # JWT & role validation
│   ├── db/
│   │   └── index.js              # Database connection pool
│   └── utils/
│       ├── validation.js         # Input validation
│       └── responseFormatter.js  # Response formatting
├── server.js                      # Entry point
├── package.json
├── smart_clinic_schema.sql        # Database schema
├── API_IMPLEMENTATION_GUIDE.md    # API documentation
└── IMPLEMENTATION_PROGRESS.md     # Progress tracking

frontend/                          # Frontend (separate)
figma/                            # Design files
```

## Key Files

### server.js
Main entry point - starts the Express server on specified port.

### src/app.js
Configures Express middleware and routes. Add new routes here.

### src/db/index.js
MySQL connection pool. Handles database connections.

### src/middleware/auth.middleware.js
JWT token verification and role-based access control.

### src/utils/validation.js
Input validation functions used across controllers.

### src/utils/responseFormatter.js
Standardized response formatting for all endpoints.

## API Response Format

### Success Response (200/201)
```json
{
  "status": "success",
  "message": "Optional message",
  "data": { ... },
  "pagination": { "total": 50, "page": 1, "limit": 10 }
}
```

### Error Response (400/401/403/404/500)
```json
{
  "status": "error",
  "message": "Error description",
  "errors": ["field error 1", "field error 2"]
}
```

## Authentication Flow

1. **Register**: `POST /api/auth/register` → Get JWT token
2. **Login**: `POST /api/auth/login` → Get JWT token
3. **Use Token**: Include `Authorization: Bearer {token}` in all protected requests
4. **Token Expires**: In 7 days, user must login again

## Common Development Tasks

### Adding a New Endpoint

1. **Create Controller Method** in `controllers/filename.controller.js`:
```javascript
const myEndpoint = async (req, res) => {
  try {
    // Your logic here
    return sendSuccess(res, data, 'Success message', 200);
  } catch (error) {
    return sendError(res, 'Error message', 500);
  }
};
```

2. **Create/Update Route** in `routes/filename.routes.js`:
```javascript
router.get('/endpoint', authenticate, requireRole('admin'), myEndpoint);
```

3. **Add to app.js**:
```javascript
app.use('/api/endpoint', endpointRoutes);
```

### Testing Authentication

Get a valid token:
```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"Password123!"}'

# Use token in requests
export TOKEN="your-token-here"
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

### Database Debugging

```bash
# Connect to MySQL
mysql -u root -p smart_clinic_db

# Check tables
SHOW TABLES;

# Check users
SELECT * FROM users;

# Check specific user
SELECT * FROM users WHERE email = 'test@example.com';
```

## Troubleshooting

### Database Connection Error
```
✗ DB connection failed: ...
```
- Check `.env` file for correct DB credentials
- Ensure MySQL is running
- Verify database `smart_clinic_db` exists

### JWT Secret Not Set
- Add `JWT_SECRET` to `.env`
- Must be at least 32 characters for production

### Port Already in Use
```bash
# Find and kill process using port 5000
lsof -i :5000
kill -9 <PID>

# Or change PORT in .env
```

### Token Expired
- User must login again to get a new token
- Tokens expire in 7 days

### Access Denied Errors
- Verify correct role in JWT token
- Check authorization middleware on route
- Ensure token is included in `Authorization` header

## Performance Tips

1. **Use Indexes**: Database queries benefit from indexes on frequently searched fields
2. **Pagination**: Always use pagination for list endpoints
3. **Caching**: Consider caching doctor lists and medical conditions
4. **Connection Pool**: Using mysql2/promise with connection pooling

## Security Best Practices

1. **Environment Variables**: Never commit `.env` file
2. **Password Hashing**: Uses bcrypt with 10 rounds
3. **JWT Tokens**: Signed with secret key
4. **CORS**: Configured to accept frontend requests
5. **Input Validation**: All inputs validated before database queries
6. **SQL Injection**: Using parameterized queries (mysql2/promise)

## Next Steps

1. **Implement Remaining Controllers**:
   - Complete appointments controller
   - Queue management controller
   - Notifications controller
   - System settings controller

2. **Add Tests**: Create test suite for all endpoints

3. **Add Monitoring**: Implement logging and error tracking

4. **Optimize Database**: Add indexes and optimize queries

5. **API Documentation**: Add Swagger/OpenAPI documentation

## Useful Commands

```bash
# Install new package
npm install package-name

# Run tests (when added)
npm test

# Format code
npm run format

# Check for vulnerabilities
npm audit

# Update dependencies
npm update
```

## References

- **API Documentation**: See `API_DOCUMENTATION.md` in root
- **Implementation Guide**: See `Backend/API_IMPLEMENTATION_GUIDE.md`
- **Progress Tracker**: See `Backend/IMPLEMENTATION_PROGRESS.md`
- **Database Schema**: See `Backend/smart_clinic_schema.sql`

## Support

For issues or questions:
1. Check existing error logs in console
2. Review API documentation
3. Check database directly with MySQL
4. Test endpoints with Postman or curl

Happy coding! 🚀
