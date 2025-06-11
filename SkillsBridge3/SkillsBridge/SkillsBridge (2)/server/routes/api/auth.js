const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Mock user data (in-memory, replace with your database if needed)
let users = [
    { id: 1, name: 'Admin User', email: 'admin@example.com', password: '$2a$10$5PzQZkV3HHqb8tVwXRI.qVfjCOqRgL3dU0XK39grs9mnaDZPlwFfy', role: 'admin' }, // Hashed password for 'admin123'
    { id: 2, name: 'Normal User', email: 'user@example.com', password: '$2a$10$5PzQZkV3HHqb8tVwXRI.qVfjCOqRgL3dU0XK39grs9mnaDZPlwFfy', role: 'user' }   // Hashed password for 'user123'
];

// Register route (handles both Admin and User)
router.post('/register', async (req, res) => {
    const { name, email, password, role } = req.body;

    // Validate role (must be 'admin' or 'user')
    if (!['admin', 'user'].includes(role)) {
        return res.status(400).json({ error: 'Invalid role. Choose either "admin" or "user".' });
    }

    // Check if email already exists
    const existingUser = users.find(user => user.email === email);
    if (existingUser) {
        return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password and save new user
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = { id: users.length + 1, name, email, password: hashedPassword, role };
    users.push(newUser);

    res.status(201).json({ message: 'User registered successfully!' });
});

// Login route (handles both Admin and User)
router.post('/login', async (req, res) => {
    const { email, password, role } = req.body;

    // Check if the role is valid
    if (!['admin', 'user'].includes(role)) {
        return res.status(400).json({ error: 'Invalid role. Choose either "admin" or "user".' });
    }

    // Find the user by email
    const user = users.find(u => u.email === email);
    if (!user) {
        return res.status(400).json({ error: 'User not found' });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(400).json({ error: 'Invalid password' });
    }

    // Ensure the correct role (admin only for admin)
    if (role === 'admin' && user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }

    // Generate JWT
    const token = jwt.sign({ userId: user.id, role: user.role }, 'your_jwt_secret', { expiresIn: '1h' });

    res.json({ token, user: { name: user.name, email: user.email, role: user.role } });
});

module.exports = router;

