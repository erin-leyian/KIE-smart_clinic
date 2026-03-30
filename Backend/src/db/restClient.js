/**
 * Supabase REST API Helper
 * Uses direct HTTP calls to bypass schema cache issues
 */

const https = require('https');

function makeSupabaseRequest(method, endpoint, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${process.env.SUPABASE_URL}/rest/v1${endpoint}`);
    
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'apikey': process.env.SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      },
    };

    const req = https.request(url, options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          if (res.statusCode >= 400) {
            reject(new Error(parsed.message || `HTTP ${res.statusCode}`));
          } else {
            resolve(parsed);
          }
        } catch (e) {
          reject(new Error(body || `HTTP ${res.statusCode}`));
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function select(table, filters = {}) {
  const params = new URLSearchParams(filters);
  const endpoint = `/${table}?${params.toString()}`;
  return makeSupabaseRequest('GET', endpoint);
}

async function insert(table, record) {
  const endpoint = `/${table}`;
  return makeSupabaseRequest('POST', endpoint, record);
}

async function update(table, id, updates) {
  const endpoint = `/${table}?id=eq.${id}`;
  return makeSupabaseRequest('PATCH', endpoint, updates);
}

async function delete_(table, id) {
  const endpoint = `/${table}?id=eq.${id}`;
  return makeSupabaseRequest('DELETE', endpoint);
}

module.exports = {
  select,
  insert,
  update,
  delete: delete_,
};
