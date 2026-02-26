const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { pool } = require('./database');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const SALT_ROUNDS = 10;

const register = async (req, res) => {
    try {
        console.log('=== REGISTRATION REQUEST ===');
        console.log('Request body:', { email: req.body.email, username: req.body.username, hasPassword: !!req.body.password });

        const { email, password, username } = req.body;

        if (!email || !password || !username) {
            console.log('Missing required fields');
            return res.status(400).json({ error: 'Email, password, and username are required' });
        }

        console.log('Checking for existing user...');
        const existingUser = await pool.query(
            'SELECT id FROM users WHERE email = $1',
            [email.toLowerCase()]
        );

        if (existingUser.rows.length > 0) {
            console.log('User already exists:', email);
            return res.status(409).json({ error: 'Email already registered' });
        }

        console.log('Hashing password...');
        const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

        console.log('Inserting new user into database...');
        const result = await pool.query(
            'INSERT INTO users (email, password_hash, username) VALUES ($1, $2, $3) RETURNING id, email, username, created_at',
            [email.toLowerCase(), passwordHash, username]
        );

        const user = result.rows[0];
        console.log('User created successfully:', { id: user.id, email: user.email, username: user.username });

        console.log('Logging user login...');
        await pool.query(
            'INSERT INTO login_logs (user_id, ip_address, user_agent) VALUES ($1, $2, $3)',
            [user.id, req.ip, req.get('user-agent')]
        );
        console.log('Login log created');

        const token = jwt.sign(
            { userId: user.id, email: user.email },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        console.log('Registration complete - sending response');
        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                createdAt: user.created_at
            }
        });
    } catch (error) {
        console.error('=== REGISTRATION ERROR ===');
        console.error('Error details:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
};

const login = async (req, res) => {
    try {
        console.log('=== LOGIN REQUEST ===');
        console.log('Email:', req.body.email);

        const { email, password } = req.body;

        if (!email || !password) {
            console.log('Missing email or password');
            return res.status(400).json({ error: 'Email and password are required' });
        }

        console.log('Querying database for user...');
        const result = await pool.query(
            'SELECT id, email, password_hash, username FROM users WHERE email = $1',
            [email.toLowerCase()]
        );

        if (result.rows.length === 0) {
            console.log('User not found:', email);
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const user = result.rows[0];
        console.log('User found:', { id: user.id, email: user.email, username: user.username });

        console.log('Verifying password...');
        const isValidPassword = await bcrypt.compare(password, user.password_hash);

        if (!isValidPassword) {
            console.log('Invalid password');
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        console.log('Password verified - updating last login...');
        await pool.query(
            'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
            [user.id]
        );

        console.log('Creating login log...');
        await pool.query(
            'INSERT INTO login_logs (user_id, ip_address, user_agent) VALUES ($1, $2, $3)',
            [user.id, req.ip, req.get('user-agent')]
        );

        const token = jwt.sign(
            { userId: user.id, email: user.email },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        console.log('Login successful - sending response');
        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                email: user.email,
                username: user.username
            }
        });
    } catch (error) {
        console.error('=== LOGIN ERROR ===');
        console.error('Error details:', error);
        res.status(500).json({ error: 'Login failed' });
    }
};

const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid token' });
    }
};

module.exports = { register, login, verifyToken };
