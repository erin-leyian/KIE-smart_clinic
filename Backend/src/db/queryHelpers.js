/**
 * Supabase Query Helpers
 * Utility functions to make common database operations easier with Supabase
 */

const supabase = require('./supabase');

// Simple SELECT query
async function selectFrom(table, filters = {}, orderBy = null, limit = null, offset = null) {
  let query = supabase.from(table).select('*', { count: 'exact' });

  // Apply filters
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      query = query.eq(key, value);
    }
  });

  // Apply ordering
  if (orderBy) {
    const { column, ascending = true } = orderBy;
    query = query.order(column, { ascending });
  }

  // Apply pagination
  if (limit && offset !== undefined) {
    query = query.range(offset, offset + limit - 1);
  } else if (limit) {
    query = query.limit(limit);
  }

  return query;
}

// Insert record
async function insertInto(table, record) {
  return supabase.from(table).insert([record]).select().single();
}

// Update record
async function updateRecord(table, id, updates) {
  return supabase
    .from(table)
    .update(updates)
    .eq('id', id)
    .select()
    .single();
}

// Delete record
async function deleteRecord(table, id) {
  return supabase.from(table).delete().eq('id', id);
}

module.exports = {
  selectFrom,
  insertInto,
  updateRecord,
  deleteRecord,
};
