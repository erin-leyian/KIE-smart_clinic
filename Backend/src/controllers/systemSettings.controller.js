const supabase = require('../db/supabase');
const { 
  sendSuccess, sendError, sendValidationError 
} = require('../utils/responseFormatter');
const { 
  isValidPhone, sanitizeInput 
} = require('../utils/validation');

// ============================================================================
// HOSPITALS
// ============================================================================

// ── GET /api/admin/system-settings/hospitals ──────────────────────────────────
const getAllHospitals = async (req, res) => {
  try {
    const hospitalsResult = await pool.query('SELECT * FROM hospitals ORDER BY name ASC');
    return sendSuccess(res, hospitals, 'Hospitals retrieved successfully');
  } catch (err) {
    console.error('Get hospitals error:', err);
    return sendError(res, 'Failed to fetch hospitals', 500, err.message);
  }
};

// ── POST /api/admin/system-settings/hospitals ─────────────────────────────────
const createHospital = async (req, res) => {
  try {
    const { name, location, phone, type, rating = 0, reviews = 0, image } = req.body;
    const errors = [];

    if (!name) errors.push({ field: 'name', message: 'Hospital name is required' });
    if (!location) errors.push({ field: 'location', message: 'Location is required' });
    if (!phone) errors.push({ field: 'phone', message: 'Phone number is required' });
    else if (!isValidPhone(phone)) errors.push({ field: 'phone', message: 'Invalid phone format' });
    if (!type) errors.push({ field: 'type', message: 'Hospital type is required' });

    if (errors.length > 0) return sendValidationError(res, errors);

    const resultResult = await pool.query(`INSERT INTO hospitals (name, location, phone, type, rating, reviews, image)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [sanitizeInput(name), sanitizeInput(location), phone, sanitizeInput(type), rating, reviews, image || null]
    );

    const hospital = {
      id: result.insertId,
      name,
      location,
      phone,
      type,
      rating,
      reviews,
      image,
    };

    return sendSuccess(res, hospital, 'Hospital added successfully', 201);
  } catch (err) {
    console.error('Create hospital error:', err);
    return sendError(res, 'Failed to create hospital', 500, err.message);
  }
};

// ── PUT /api/admin/system-settings/hospitals/:id ──────────────────────────────
const updateHospital = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, location, phone, type, rating, reviews, image } = req.body;

    // Check if hospital exists
    const hospitalResult = await pool.query('SELECT * FROM hospitals WHERE id = $1', [id]);
    if (hospital.length === 0) return sendError(res, 'Hospital not found', 404);

    const errors = [];
    if (phone && !isValidPhone(phone)) errors.push({ field: 'phone', message: 'Invalid phone format' });
    if (errors.length > 0) return sendValidationError(res, errors);

    // Build update query
    const updates = [];
    const values = [];

    if (name !== undefined) {
      updates.push('name = ?');
      values.push(sanitizeInput(name));
    }
    if (location !== undefined) {
      updates.push('location = ?');
      values.push(sanitizeInput(location));
    }
    if (phone !== undefined) {
      updates.push('phone = ?');
      values.push(phone);
    }
    if (type !== undefined) {
      updates.push('type = ?');
      values.push(sanitizeInput(type));
    }
    if (rating !== undefined) {
      updates.push('rating = ?');
      values.push(rating);
    }
    if (reviews !== undefined) {
      updates.push('reviews = ?');
      values.push(reviews);
    }
    if (image !== undefined) {
      updates.push('image = ?');
      values.push(image);
    }

    if (updates.length === 0) return sendError(res, 'No fields to update', 400);

    values.push(id);
    await pool.query(`UPDATE hospitals SET ${updates.join(', ')} WHERE id = $1`, values);

    // Fetch updated hospital
    const updatedResult = await pool.query('SELECT * FROM hospitals WHERE id = $1', [id]);

    return sendSuccess(res, updated[0], 'Hospital updated successfully');
  } catch (err) {
    console.error('Update hospital error:', err);
    return sendError(res, 'Failed to update hospital', 500, err.message);
  }
};

// ── DELETE /api/admin/system-settings/hospitals/:id ──────────────────────────
const deleteHospital = async (req, res) => {
  try {
    const { id } = req.params;
    const { confirmation } = req.body;

    if (!confirmation) return sendError(res, 'Confirmation required to delete hospital', 400);

    // Check if hospital exists
    const hospitalResult = await pool.query('SELECT * FROM hospitals WHERE id = $1', [id]);
    if (hospital.length === 0) return sendError(res, 'Hospital not found', 404);

    await pool.query('DELETE FROM hospitals WHERE id = $1', [id]);

    return sendSuccess(res, null, 'Hospital deleted successfully');
  } catch (err) {
    console.error('Delete hospital error:', err);
    return sendError(res, 'Failed to delete hospital', 500, err.message);
  }
};

// ============================================================================
// INSURANCE PROVIDERS
// ============================================================================

// ── GET /api/admin/system-settings/insurance ──────────────────────────────────
const getAllInsurance = async (req, res) => {
  try {
    const insuranceResult = await pool.query('SELECT * FROM insuranceProviders ORDER BY name ASC');
    return sendSuccess(res, insurance, 'Insurance providers retrieved successfully');
  } catch (err) {
    console.error('Get insurance error:', err);
    return sendError(res, 'Failed to fetch insurance providers', 500, err.message);
  }
};

// ── POST /api/admin/system-settings/insurance ─────────────────────────────────
const createInsurance = async (req, res) => {
  try {
    const { name, fullName, type, coverage, conditions, benefits } = req.body;
    const errors = [];

    if (!name) errors.push({ field: 'name', message: 'Insurance name is required' });
    if (!fullName) errors.push({ field: 'fullName', message: 'Full name is required' });
    if (!type) errors.push({ field: 'type', message: 'Type is required' });

    if (errors.length > 0) return sendValidationError(res, errors);

    const benefitsJSON = Array.isArray(benefits) ? JSON.stringify(benefits) : '[]';

    const resultResult = await pool.query(`INSERT INTO insuranceProviders (name, fullName, type, coverage, conditions, benefits)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [sanitizeInput(name), sanitizeInput(fullName), sanitizeInput(type), coverage || null, sanitizeInput(conditions || null), benefitsJSON]
    );

    const insurance = {
      id: result.insertId,
      name,
      fullName,
      type,
      coverage,
      conditions,
      benefits: Array.isArray(benefits) ? benefits : [],
    };

    return sendSuccess(res, insurance, 'Insurance provider added successfully', 201);
  } catch (err) {
    console.error('Create insurance error:', err);
    return sendError(res, 'Failed to create insurance provider', 500, err.message);
  }
};

// ── PUT /api/admin/system-settings/insurance/:id ──────────────────────────────
const updateInsurance = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, fullName, type, coverage, conditions, benefits } = req.body;

    // Check if insurance exists
    const insuranceResult = await pool.query('SELECT * FROM insuranceProviders WHERE id = $1', [id]);
    if (insurance.length === 0) return sendError(res, 'Insurance provider not found', 404);

    const updates = [];
    const values = [];

    if (name !== undefined) {
      updates.push('name = ?');
      values.push(sanitizeInput(name));
    }
    if (fullName !== undefined) {
      updates.push('fullName = ?');
      values.push(sanitizeInput(fullName));
    }
    if (type !== undefined) {
      updates.push('type = ?');
      values.push(sanitizeInput(type));
    }
    if (coverage !== undefined) {
      updates.push('coverage = ?');
      values.push(coverage);
    }
    if (conditions !== undefined) {
      updates.push('conditions = ?');
      values.push(sanitizeInput(conditions));
    }
    if (benefits !== undefined) {
      const benefitsJSON = Array.isArray(benefits) ? JSON.stringify(benefits) : '[]';
      updates.push('benefits = ?');
      values.push(benefitsJSON);
    }

    if (updates.length === 0) return sendError(res, 'No fields to update', 400);

    values.push(id);
    await pool.query(`UPDATE insuranceProviders SET ${updates.join(', ')} WHERE id = $1`, values);

    // Fetch updated insurance
    const updatedResult = await pool.query('SELECT * FROM insuranceProviders WHERE id = $1', [id]);
    const result = {
      ...updated[0],
      benefits: updated[0].benefits ? JSON.parse(updated[0].benefits) : [],
    };

    return sendSuccess(res, result, 'Insurance provider updated successfully');
  } catch (err) {
    console.error('Update insurance error:', err);
    return sendError(res, 'Failed to update insurance provider', 500, err.message);
  }
};

// ── DELETE /api/admin/system-settings/insurance/:id ──────────────────────────
const deleteInsurance = async (req, res) => {
  try {
    const { id } = req.params;
    const { confirmation } = req.body;

    if (!confirmation) return sendError(res, 'Confirmation required to delete insurance', 400);

    // Check if insurance exists
    const insuranceResult = await pool.query('SELECT * FROM insuranceProviders WHERE id = $1', [id]);
    if (insurance.length === 0) return sendError(res, 'Insurance provider not found', 404);

    await pool.query('DELETE FROM insuranceProviders WHERE id = $1', [id]);

    return sendSuccess(res, null, 'Insurance provider deleted successfully');
  } catch (err) {
    console.error('Delete insurance error:', err);
    return sendError(res, 'Failed to delete insurance provider', 500, err.message);
  }
};

// ============================================================================
// MEDICAL CONDITIONS
// ============================================================================

// ── GET /api/admin/system-settings/conditions ─────────────────────────────────
const getAllConditions = async (req, res) => {
  try {
    const conditionsResult = await pool.query('SELECT * FROM medicalConditions ORDER BY name ASC');
    const formatted = conditions.map(cond => ({
      ...cond,
      treatments: cond.treatments ? JSON.parse(cond.treatments) : [],
    }));
    return sendSuccess(res, formatted, 'Medical conditions retrieved successfully');
  } catch (err) {
    console.error('Get conditions error:', err);
    return sendError(res, 'Failed to fetch medical conditions', 500, err.message);
  }
};

// ── POST /api/admin/system-settings/conditions ────────────────────────────────
const createCondition = async (req, res) => {
  try {
    const { name, description, prevalence, icon, treatments = [], specialists = [] } = req.body;
    const errors = [];

    if (!name) errors.push({ field: 'name', message: 'Condition name is required' });
    if (!description) errors.push({ field: 'description', message: 'Description is required' });

    if (errors.length > 0) return sendValidationError(res, errors);

    const treatmentsJSON = Array.isArray(treatments) ? JSON.stringify(treatments) : '[]';
    const specialistsJSON = Array.isArray(specialists) ? JSON.stringify(specialists) : '[]';

    const resultResult = await pool.query(`INSERT INTO medicalConditions (name, description, prevalence, icon, treatments, specialists)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [sanitizeInput(name), sanitizeInput(description), prevalence || null, icon || null, treatmentsJSON, specialistsJSON]
    );

    const condition = {
      id: result.insertId,
      name,
      description,
      prevalence,
      icon,
      treatments: Array.isArray(treatments) ? treatments : [],
      specialists: Array.isArray(specialists) ? specialists : [],
    };

    return sendSuccess(res, condition, 'Medical condition added successfully', 201);
  } catch (err) {
    console.error('Create condition error:', err);
    return sendError(res, 'Failed to create medical condition', 500, err.message);
  }
};

// ── PUT /api/admin/system-settings/conditions/:id ──────────────────────────────
const updateCondition = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, prevalence, icon, treatments, specialists } = req.body;

    // Check if condition exists
    const conditionResult = await pool.query('SELECT * FROM medicalConditions WHERE id = $1', [id]);
    if (condition.length === 0) return sendError(res, 'Medical condition not found', 404);

    const updates = [];
    const values = [];

    if (name !== undefined) {
      updates.push('name = ?');
      values.push(sanitizeInput(name));
    }
    if (description !== undefined) {
      updates.push('description = ?');
      values.push(sanitizeInput(description));
    }
    if (prevalence !== undefined) {
      updates.push('prevalence = ?');
      values.push(prevalence);
    }
    if (icon !== undefined) {
      updates.push('icon = ?');
      values.push(icon);
    }
    if (treatments !== undefined) {
      const treatmentsJSON = Array.isArray(treatments) ? JSON.stringify(treatments) : '[]';
      updates.push('treatments = ?');
      values.push(treatmentsJSON);
    }
    if (specialists !== undefined) {
      const specialistsJSON = Array.isArray(specialists) ? JSON.stringify(specialists) : '[]';
      updates.push('specialists = ?');
      values.push(specialistsJSON);
    }

    if (updates.length === 0) return sendError(res, 'No fields to update', 400);

    values.push(id);
    await pool.query(`UPDATE medicalConditions SET ${updates.join(', ')} WHERE id = $1`, values);

    // Fetch updated condition
    const updatedResult = await pool.query('SELECT * FROM medicalConditions WHERE id = $1', [id]);
    const result = {
      ...updated[0],
      treatments: updated[0].treatments ? JSON.parse(updated[0].treatments) : [],
      specialists: updated[0].specialists ? JSON.parse(updated[0].specialists) : [],
    };

    return sendSuccess(res, result, 'Medical condition updated successfully');
  } catch (err) {
    console.error('Update condition error:', err);
    return sendError(res, 'Failed to update medical condition', 500, err.message);
  }
};

// ── DELETE /api/admin/system-settings/conditions/:id ──────────────────────────
const deleteCondition = async (req, res) => {
  try {
    const { id } = req.params;
    const { confirmation } = req.body;

    if (!confirmation) return sendError(res, 'Confirmation required to delete condition', 400);

    // Check if condition exists
    const conditionResult = await pool.query('SELECT * FROM medicalConditions WHERE id = $1', [id]);
    if (condition.length === 0) return sendError(res, 'Medical condition not found', 404);

    await pool.query('DELETE FROM medicalConditions WHERE id = $1', [id]);

    return sendSuccess(res, null, 'Medical condition deleted successfully');
  } catch (err) {
    console.error('Delete condition error:', err);
    return sendError(res, 'Failed to delete medical condition', 500, err.message);
  }
};

module.exports = {
  // Hospitals
  getAllHospitals,
  createHospital,
  updateHospital,
  deleteHospital,
  // Insurance
  getAllInsurance,
  createInsurance,
  updateInsurance,
  deleteInsurance,
  // Conditions
  getAllConditions,
  createCondition,
  updateCondition,
  deleteCondition,
};
