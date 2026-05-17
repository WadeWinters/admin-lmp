require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Load API Key from environment or fallback (for testing, but should be strictly ENV in production)
const API_KEY = process.env.API_KEY || 'LMP_SECURE_API_KEY_2026';

// Database configuration
const dbConfig = {
    host: process.env.DB_HOST || 'mysql.db.bot-hosting.net',
    user: process.env.DB_USER || 'u586997_HISILSenhB',
    password: process.env.DB_PASSWORD || 'Hm+8X3A^eBQzbH=7Yh6@W5tv',
    database: process.env.DB_NAME || 's586997_lmp-admin',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

// Create a connection pool
const pool = mysql.createPool(dbConfig);

// Authentication Middleware
const authenticate = (req, res, next) => {
    const key = req.headers['x-api-key'] || req.query.api_key;
    if (key !== API_KEY) {
        return res.status(401).json({ error: 'Unauthorized: Invalid API Key' });
    }
    next();
};

// Main Query Endpoint
app.post('/query', authenticate, async (req, res) => {
    const { sql, params } = req.body;

    if (!sql) {
        return res.status(400).json({ error: 'SQL query is required' });
    }

    try {
        const [rows, fields] = await pool.execute(sql, params || []);
        
        // If it's an insert/update/delete, rows will be an object containing insertId, affectedRows, etc.
        // If it's a select, rows will be an array of results.
        res.json({
            success: true,
            data: rows
        });
    } catch (error) {
        console.error('Database Error:', error.message);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Health check endpoint
app.get('/', (req, res) => {
    res.json({ status: 'API is running' });
});

app.listen(port, () => {
    console.log(`LMP DB Proxy API running on port ${port}`);
});
