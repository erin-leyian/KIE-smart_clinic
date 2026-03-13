const jwt = require('jsonwebtoken');

let fakeQueue = [
  {
    token_id: 1,
    patient_id: 101,
    patient_name: 'Alice Uwimana',
    phone_number: '+250788000001',
    queue_position: 1,
    check_in_time: '2026-03-10T08:45:00',
    status: 'waiting',
  },
  {
    token_id: 2,
    patient_id: 102,
    patient_name: 'Bob Nkurunziza',
    phone_number: '+250788000002',
    queue_position: 2,
    check_in_time: '2026-03-10T08:50:00',
    status: 'waiting',
  },
  {
    token_id: 3,
    patient_id: 103,
    patient_name: 'Claire Mutesi',
    phone_number: '+250788000003',
    queue_position: 3,
    check_in_time: '2026-03-10T09:00:00',
    status: 'waiting',
  },
];

const getQueue = async (req, res) => {
  try {
    const activeQueue = fakeQueue.filter(q => q.status === 'waiting');
    res.json({ queue: activeQueue, total: activeQueue.length });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch queue', details: err.message });
  }
};

const getQueuePosition = async (req, res) => {
  const { patientId } = req.params;
  try {
    const token = fakeQueue.find(q => q.patient_id === parseInt(patientId) && q.status === 'waiting');
    if (!token) return res.status(404).json({ error: 'Patient not in queue' });
    const patientsAhead = fakeQueue.filter(q => q.queue_position < token.queue_position && q.status === 'waiting').length;
    res.json({ position: token, patients_ahead: patientsAhead });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get queue position', details: err.message });
  }
};

const checkInPatient = async (req, res) => {
  const { patientId } = req.params;
  try {
    const alreadyIn = fakeQueue.find(q => q.patient_id === parseInt(patientId) && q.status === 'waiting');
    if (alreadyIn) {
      return res.status(409).json({ error: 'Patient already in queue', position: alreadyIn.queue_position });
    }
    const nextPosition = fakeQueue.filter(q => q.status === 'waiting').length + 1;
    const newToken = {
      token_id: fakeQueue.length + 1,
      patient_id: parseInt(patientId),
      patient_name: `Patient ${patientId}`,
      phone_number: '+250788000000',
      queue_position: nextPosition,
      check_in_time: new Date().toISOString(),
      status: 'waiting',
    };
    fakeQueue.push(newToken);
    res.status(201).json({ message: 'Patient checked in', token: newToken });
  } catch (err) {
    res.status(500).json({ error: 'Failed to check in patient', details: err.message });
  }
};

const removeFromQueue = async (req, res) => {
  const { tokenId } = req.params;
  try {
    const index = fakeQueue.findIndex(q => q.token_id === parseInt(tokenId));
    if (index === -1) return res.status(404).json({ error: 'Token not found' });
    fakeQueue[index].status = 'completed';
    let pos = 1;
    fakeQueue.filter(q => q.status === 'waiting')
             .sort((a, b) => a.queue_position - b.queue_position)
             .forEach(q => { q.queue_position = pos++; });
    res.json({ message: 'Patient removed from queue' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to remove from queue', details: err.message });
  }
};

const reorderQueue = async (req, res) => {
  const { order } = req.body;
  if (!order || !Array.isArray(order) || order.length === 0) {
    return res.status(400).json({ error: 'order must be a non-empty array of token IDs' });
  }
  try {
    order.forEach((tokenId, i) => {
      const token = fakeQueue.find(q => q.token_id === tokenId && q.status === 'waiting');
      if (token) token.queue_position = i + 1;
    });
    const updatedQueue = fakeQueue.filter(q => q.status === 'waiting').sort((a, b) => a.queue_position - b.queue_position);
    res.json({ message: 'Queue reordered', queue: updatedQueue });
  } catch (err) {
    res.status(500).json({ error: 'Failed to reorder queue', details: err.message });
  }
};

module.exports = {
  getQueue,
  getQueuePosition,
  checkInPatient,
  removeFromQueue,
  reorderQueue,
};