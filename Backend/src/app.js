const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth.routes');
const doctorsRoutes = require('./routes/doctors.routes');
const appointmentRoutes = require('./routes/appointments.routes'); 
const patientRecordsRoutes = require('./routes/patientRecords.routes');
const queueRoutes = require('./routes/queue.routes');   
const smsRoutes = require('./routes/sms.routes');  


const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => {
    res.json({ status: 'ok', project: 'KIE Smart Clinic'})
});

app.use('/api/auth', authRoutes);
app.use('/api/doctors', doctorsRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/patient-records', patientRecordsRoutes);
app.use('/api/queue', queueRoutes);    
app.use('/api/sms', smsRoutes);        

module.exports = app;