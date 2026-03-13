const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth.routes');
const appointmentRoutes = require('./routes/appointments.routes'); 
const queueRoutes = require('./routes/queue.routes');              


const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
    res.json({ status: 'ok', project: 'KIE Smart Clinic'})
});

app.use('/api/auth', authRoutes);
app.use('/api/appointments', appointmentRoutes); 
app.use('/api/queue', queueRoutes);               

module.exports = app;