const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000
});

async function connect() {
    try {
        const client = await pool.connect();
        console.log('Successfully connected to irrigation_db');
        client.release();
    } catch (error) {
        console.error('Error connecting to database:', error.stack);
        throw new Error('Failed to connect to database');
    }
}

const countPumps = async (power = 'electric') => {
    try {
        const query = `
            SELECT COUNT(*) as count 
            FROM pumps 
            WHERE power IS NOT NULL AND LOWER(power) = $1
        `;
        const result = await pool.query(query, [power.toLowerCase()]);
        console.log('Pump count from database:', result.rows[0].count);
        return parseInt(result.rows[0].count);
    } catch (error) {
        console.error('Error counting pumps:', error.stack);
        throw error;
    }
};

const getPumps = async (minFlow, maxFlow, minHead, maxHead, power = 'electric', limit = null) => {
    try {
        const validatedMinFlow = parseFloat(minFlow) || 0;
        const validatedMaxFlow = parseFloat(maxFlow) || Infinity;
        const validatedMinHead = parseFloat(minHead) || 0;
        const validatedMaxHead = parseFloat(maxHead) || Infinity;

        if (isNaN(validatedMinFlow) || isNaN(validatedMaxFlow) || isNaN(validatedMinHead) || isNaN(validatedMaxHead)) {
            console.warn('Invalid input: flowRate or head contains NaN', { minFlow, maxFlow, minHead, maxHead });
            throw new Error('Flow rate and head must be valid numbers');
        }

        let query = `
            SELECT id, name, brand, CAST(flow_rate AS DECIMAL) AS flow_rate, 
                   CAST(head AS DECIMAL) AS head, power, price
            FROM pumps 
            WHERE (flow_rate IS NOT NULL AND CAST(flow_rate AS DECIMAL) BETWEEN $1 AND $2)
            AND (head IS NOT NULL AND CAST(head AS DECIMAL) BETWEEN $3 AND $4)
        `;
        let values = [validatedMinFlow, validatedMaxFlow, validatedMinHead, validatedMaxHead];
        let paramIndex = 5;

        if (power && typeof power === 'string' && power.trim() !== '') {
            query += ` AND (power IS NULL OR LOWER(power) = $${paramIndex})`;
            values.push(power.toLowerCase());
            paramIndex++;
        }

        if (limit === 1) {
            query += ` ORDER BY ABS(CAST(flow_rate AS DECIMAL) - $${paramIndex}) ASC, ABS(CAST(head AS DECIMAL) - $${paramIndex + 1}) ASC LIMIT 1`;
            values.push((validatedMinFlow + validatedMaxFlow) / 2, (validatedMinHead + validatedMaxHead) / 2);
        }

        console.log('Querying pumps with query:', query);
        console.log('Querying pumps with values:', values);
        const result = await pool.query(query, values);
        console.log('Pumps fetched from database:', result.rows);
        return result.rows;
    } catch (error) {
        console.error('Error fetching pumps:', error.stack);
        throw error;
    }
};

const getAllPumps = async () => {
    try {
        const query = `
            SELECT id, name, brand, flow_rate, head, power, price
            FROM pumps
            ORDER BY id
        `;
        const result = await pool.query(query);
        console.log('All pumps fetched from database:', result.rows);
        return result.rows;
    } catch (error) {
        console.error('Error fetching all pumps:', error.stack);
        throw error;
    }
};

const addPump = async (name, brand, flow_rate, head, power, price) => {
    try {
        const query = `
            INSERT INTO pumps (name, brand, flow_rate, head, power, price)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `;
        const values = [name, brand, flow_rate, head, power, price];
        const result = await pool.query(query, values);
        console.log('Pump added:', result.rows[0]);
        return result.rows[0];
    } catch (error) {
        console.error('Error adding pump:', error.stack);
        throw error;
    }
};

const updatePump = async (id, name, brand, flow_rate, head, power, price) => {
    try {
        const query = `
            UPDATE pumps
            SET name = $2, brand = $3, flow_rate = $4, head = $5, power = $6, price = $7
            WHERE id = $1
            RETURNING *
        `;
        const values = [id, name, brand, flow_rate, head, power, price];
        const result = await pool.query(query, values);
        console.log('Pump updated:', result.rows[0]);
        return result.rows[0] || null;
    } catch (error) {
        console.error('Error updating pump:', error.stack);
        throw error;
    }
};

const deletePump = async (id) => {
    try {
        const query = 'DELETE FROM pumps WHERE id = $1 RETURNING *';
        const result = await pool.query(query, [id]);
        console.log('Pump deleted:', result.rows[0]);
        return result.rows[0] || null;
    } catch (error) {
        console.error('Error deleting pump:', error.stack);
        throw error;
    }
};

const getParameters = async (module) => {
    try {
        const query = `
            SELECT param_key, param_value, description
            FROM parameters
            WHERE module = $1
        `;
        const values = [module];
        const result = await pool.query(query, values);
        console.log('Parameters fetched from database:', result.rows);
        return result.rows;
    } catch (error) {
        console.error('Error fetching parameters:', error.stack);
        throw error;
    }
};

const updateParameter = async (module, param_key, param_value, description) => {
    try {
        const query = `
            INSERT INTO parameters (module, param_key, param_value, description)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (module, param_key)
            DO UPDATE SET param_value = $3, description = $4
            RETURNING *
        `;
        const values = [module, param_key, param_value, description];
        const result = await pool.query(query, values);
        console.log('Parameter updated:', result.rows[0]);
        return result.rows[0];
    } catch (error) {
        console.error('Error updating parameter:', error.stack);
        throw error;
    }
};

const closePool = async () => {
    try {
        await pool.end();
        console.log('Database pool closed');
    } catch (error) {
        console.error('Error closing database pool:', error.stack);
    }
};

module.exports = {
    connect,
    getPumps,
    countPumps,
    addPump,
    updatePump,
    deletePump,
    getParameters,
    updateParameter,
    getAllPumps,
    closePool
};