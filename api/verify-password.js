// api/verify-password.js
const cors = require('cors');

// ==================== CHANGE YOUR PASSWORDS HERE ====================
const PASSWORDS = [
    'mypassword123',
    'secret456', 
    'access789',
    'unlock2024',
    'key555',
    'script999',
    'auth777',
    'pass111',
    'code444',
    'magic888',
    'admin2024',
    'user123',
    'test456',
    'demo789',
    'hello123'
];

// CORS middleware for handling cross-origin requests
function runCors(req, res) {
    return new Promise((resolve, reject) => {
        cors({
            origin: '*',
            methods: ['GET', 'POST', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
            credentials: false
        })(req, res, (result) => {
            if (result instanceof Error) {
                return reject(result);
            }
            return resolve(result);
        });
    });
}

// Main handler function
export default async function handler(req, res) {
    try {
        // Handle CORS
        await runCors(req, res);
        
        // Handle preflight OPTIONS request
        if (req.method === 'OPTIONS') {
            return res.status(200).end();
        }
        
        // Only allow POST requests for authentication
        if (req.method !== 'POST') {
            return res.status(405).json({ 
                success: false,
                error: 'Method not allowed. Use POST.' 
            });
        }
        
        const { password, timestamp, userAgent, domain } = req.body;
        
        // Basic request validation
        if (!password) {
            return res.status(400).json({
                success: false,
                message: 'Password is required'
            });
        }
        
        // Create basic device fingerprint for logging
        const clientIP = req.headers['x-forwarded-for'] || 
                        req.headers['x-real-ip'] || 
                        req.connection?.remoteAddress || 
                        'unknown';
        
        const deviceId = Buffer.from(clientIP + '_' + (userAgent || 'unknown')).toString('base64');
        
        // Log authentication attempt
        console.log('🔐 Authentication attempt:', {
            password: password ? '***' : 'empty',
            deviceId: deviceId.substring(0, 12) + '...',
            domain: domain || 'unknown',
            timestamp: timestamp ? new Date(timestamp).toISOString() : new Date().toISOString(),
            ip: clientIP.substring(0, 10) + '...'
        });
        
        // Check if password exists in our list
        if (!PASSWORDS.includes(password)) {
            console.log('❌ Invalid password attempt:', password);
            return res.status(401).json({
                success: false,
                message: 'Invalid password'
            });
        }
        
        // Authentication successful
        console.log('✅ Authentication successful!');
        console.log('Password used:', password);
        console.log('Device:', deviceId.substring(0, 12) + '...');
        console.log('Domain:', domain || 'unknown');
        
        return res.status(200).json({
            success: true,
            message: 'Authentication successful',
            timestamp: Date.now(),
            authenticated: true
        });
        
    } catch (error) {
        console.error('💥 Authentication error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Server error'
        });
    }
}
