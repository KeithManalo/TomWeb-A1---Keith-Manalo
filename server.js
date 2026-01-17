// ========================================
// VALO.RANT - NODE.JS/EXPRESS WEB SERVICE
// ========================================

const express = require('express');
const cors = require('cors');
const path = require('path');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// ========================================
// MIDDLEWARE
// ========================================

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// In-memory data storage (use database in production)
let users = [];
let rantPosts = [];
let patches = [
    { id: 1, version: "Patch 2.5.0", date: "December 15, 2024", text: "New Features\n- New Gun" }
];

// ========================================
// AGENTS API - FETCH FROM VALORANT API
// ========================================

// Get all agents
app.get('/api/agents', async (req, res) => {
    try {
        const response = await fetch('https://valorant-api.com/v1/agents?isPlayableCharacter=true');
        const data = await response.json();
        
        if (data.status === 200) {
            const agents = data.data.filter(a => a.isPlayableCharacter);
            res.json({ status: 200, data: agents });
        } else {
            res.status(500).json({ status: 500, error: 'Failed to fetch agents' });
        }
    } catch (error) {
        console.error('Error fetching agents:', error);
        res.status(500).json({ status: 500, error: 'Server error fetching agents' });
    }
});

// ========================================
// USER AUTHENTICATION
// ========================================

// Encode password (basic - use bcrypt in production)
const encodePassword = (pwd) => Buffer.from(pwd).toString('base64');
const decodePassword = (encoded) => Buffer.from(encoded, 'base64').toString('utf-8');

// Admin account
const ADMIN = { 
    username: 'Admin', 
    email: 'admin@gmail.com', 
    password: encodePassword('access'),
    isAdmin: true
};

// Register new user
app.post('/api/auth/register', (req, res) => {
    const { username, email, password, confirm } = req.body;
    
    // Validation
    if (!username || !email || !password || !confirm) {
        return res.status(400).json({ error: 'Please fill in all fields' });
    }
    if (username.length < 3) {
        return res.status(400).json({ error: 'Username must be at least 3 characters long' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ error: 'Please enter a valid email address' });
    }
    if (password !== confirm) {
        return res.status(400).json({ error: 'Passwords do not match' });
    }
    if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }
    
    // Check if user exists
    if (users.some(u => u.email === email || u.username === username)) {
        return res.status(400).json({ error: 'This email or username is already registered' });
    }
    
    // Save user
    const newUser = { username, email, password: encodePassword(password), isAdmin: false };
    users.push(newUser);
    
    res.status(201).json({ 
        message: 'Registration successful!',
        user: { username, email }
    });
});

// Login user
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
        return res.status(400).json({ error: 'Please fill in all fields' });
    }
    
    // Check admin account
    if (email === ADMIN.email && encodePassword(password) === ADMIN.password) {
        return res.json({ 
            message: 'Admin login successful!',
            user: { username: ADMIN.username, email: ADMIN.email, isAdmin: true }
        });
    }
    
    // Check user accounts
    const user = users.find(u => u.email === email && decodePassword(u.password) === password);
    if (user) {
        return res.json({ 
            message: 'Login successful!',
            user: { username: user.username, email: user.email, isAdmin: user.isAdmin }
        });
    }
    
    res.status(401).json({ error: 'Invalid email or password' });
});

// ========================================
// RANT POSTS API
// ========================================

// Get all posts
app.get('/api/posts', (req, res) => {
    const postsWithReplies = rantPosts.map(p => ({ 
        ...p, 
        replies: p.replies || [] 
    }));
    res.json(postsWithReplies);
});

// Create new post
app.post('/api/posts', (req, res) => {
    const { author, content, image } = req.body;
    
    if (!content) {
        return res.status(400).json({ error: 'Post content is required' });
    }
    
    const post = {
        id: Date.now(),
        author: author || 'Anonymous',
        content,
        image: image || null,
        timestamp: new Date().toISOString(),
        replies: []
    };
    
    rantPosts.push(post);
    res.status(201).json(post);
});

// Delete post (admin only)
app.delete('/api/posts/:id', (req, res) => {
    const { isAdmin } = req.body;
    
    if (!isAdmin) {
        return res.status(403).json({ error: 'Only administrators can delete posts' });
    }
    
    const index = rantPosts.findIndex(p => p.id === parseInt(req.params.id));
    if (index === -1) {
        return res.status(404).json({ error: 'Post not found' });
    }
    
    rantPosts.splice(index, 1);
    res.json({ message: 'Post deleted' });
});

// Add reply to post
app.post('/api/posts/:id/reply', (req, res) => {
    const { author, content } = req.body;
    
    if (!content) {
        return res.status(400).json({ error: 'Reply content is required' });
    }
    
    const post = rantPosts.find(p => p.id === parseInt(req.params.id));
    if (!post) {
        return res.status(404).json({ error: 'Post not found' });
    }
    
    const reply = {
        id: Date.now(),
        author: author || 'Anonymous',
        content,
        timestamp: new Date().toISOString()
    };
    
    if (!post.replies) post.replies = [];
    post.replies.push(reply);
    
    res.status(201).json(reply);
});

// Delete reply (admin only)
app.delete('/api/posts/:postId/reply/:replyId', (req, res) => {
    const { isAdmin } = req.body;
    
    if (!isAdmin) {
        return res.status(403).json({ error: 'Only administrators can delete replies' });
    }
    
    const post = rantPosts.find(p => p.id === parseInt(req.params.postId));
    if (!post) {
        return res.status(404).json({ error: 'Post not found' });
    }
    
    const replyIndex = post.replies.findIndex(r => r.id === parseInt(req.params.replyId));
    if (replyIndex === -1) {
        return res.status(404).json({ error: 'Reply not found' });
    }
    
    post.replies.splice(replyIndex, 1);
    res.json({ message: 'Reply deleted' });
});

// ========================================
// PATCH NOTES API
// ========================================

// Get all patches
app.get('/api/patches', (req, res) => {
    res.json(patches);
});

// Create new patch (admin only)
app.post('/api/patches', (req, res) => {
    const { version, date, text, isAdmin } = req.body;
    
    if (!isAdmin) {
        return res.status(403).json({ error: 'Only administrators can create patches' });
    }
    
    if (!version || !date || !text) {
        return res.status(400).json({ error: 'All fields are required' });
    }
    
    const patch = {
        id: Date.now(),
        version,
        date,
        text
    };
    
    patches.push(patch);
    res.status(201).json(patch);
});

// Update patch (admin only)
app.put('/api/patches/:id', (req, res) => {
    const { version, date, text, isAdmin } = req.body;
    
    if (!isAdmin) {
        return res.status(403).json({ error: 'Only administrators can edit patches' });
    }
    
    const patch = patches.find(p => p.id === parseInt(req.params.id));
    if (!patch) {
        return res.status(404).json({ error: 'Patch not found' });
    }
    
    if (version) patch.version = version;
    if (date) patch.date = date;
    if (text) patch.text = text;
    
    res.json(patch);
});

// Delete patch (admin only)
app.delete('/api/patches/:id', (req, res) => {
    const { isAdmin } = req.body;
    
    if (!isAdmin) {
        return res.status(403).json({ error: 'Only administrators can delete patches' });
    }
    
    const index = patches.findIndex(p => p.id === parseInt(req.params.id));
    if (index === -1) {
        return res.status(404).json({ error: 'Patch not found' });
    }
    
    patches.splice(index, 1);
    res.json({ message: 'Patch deleted' });
});

// ========================================
// SERVE STATIC HTML
// ========================================

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ========================================
// START SERVER
// ========================================

app.listen(PORT, () => {
    console.log(`🎮 Valo.Rant server running on http://localhost:${PORT}`);
});
