const express = require('express');
const cors = require('cors');
const https = require('https');
const authRoutes = require('./routes/auth.routes');
const doctorsRoutes = require('./routes/doctors.routes');
const appointmentRoutes = require('./routes/appointments.routes'); 
const patientRecordsRoutes = require('./routes/patientRecords.routes');
const queueRoutes = require('./routes/queue.routes');   
const notificationsRoutes = require('./routes/notifications.routes');
const systemSettingsRoutes = require('./routes/systemSettings.routes');
const smsRoutes = require('./routes/sms.routes');  


const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Helper function to test Supabase connection
async function testDatabaseConnection() {
  return new Promise((resolve) => {
    const url = new URL(`${process.env.SUPABASE_URL}/rest/v1/users?limit=1`);
    const headers = {
      'apikey': process.env.SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
    };

    const req = https.request(url, { method: 'GET', headers }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          connected: res.statusCode === 200,
          statusCode: res.statusCode,
          message: res.statusCode === 200 ? 'Database connected' : `Database connection failed (${res.statusCode})`
        });
      });
    });

    req.on('error', (error) => {
      resolve({
        connected: false,
        statusCode: 0,
        message: `Database connection error: ${error.message}`
      });
    });

    req.setTimeout(5000, () => {
      req.destroy();
      resolve({
        connected: false,
        statusCode: 0,
        message: 'Database connection timeout'
      });
    });

    req.end();
  });
}

// Health check endpoint with database status
app.get('/health', async (req, res) => {
    try {
      const dbStatus = await testDatabaseConnection();
      
      res.status(dbStatus.connected ? 200 : 503).json({
        status: dbStatus.connected ? 'healthy' : 'unhealthy',
        project: 'KIE Smart Clinic',
        timestamp: new Date().toISOString(),
        database: {
          connected: dbStatus.connected,
          statusCode: dbStatus.statusCode,
          message: dbStatus.message
        },
        server: {
          status: 'running',
          uptime: process.uptime(),
          nodeVersion: process.version,
          environment: process.env.NODE_ENV || 'development'
        }
      });
    } catch (error) {
      res.status(503).json({
        status: 'unhealthy',
        project: 'KIE Smart Clinic',
        timestamp: new Date().toISOString(),
        error: error.message
      });
    }
});

app.use('/api/auth', authRoutes);
app.use('/api/doctors', doctorsRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/patient-records', patientRecordsRoutes);
app.use('/api/queue', queueRoutes);    
app.use('/api/notifications', notificationsRoutes);
app.use('/api/admin/system-settings', systemSettingsRoutes);
app.use('/api/sms', smsRoutes);        

module.exports = app;