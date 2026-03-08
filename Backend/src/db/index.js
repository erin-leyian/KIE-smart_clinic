// Database not connected yet — waiting for teammate
// This file will be updated once DB credentials are shared

const mockDB = {
  query: async () => {
    throw new Error('Database not connected yet');
  }
};

module.exports = mockDB;