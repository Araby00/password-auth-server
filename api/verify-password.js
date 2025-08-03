import { getUsedPasswords, addUsedPassword, isPasswordUsed, getStateInfo } from './shared-state.js';

// List of valid passwords
const passwords = [
    'ARABY1',
    'ARABY2'
];

export default function handler(req, res) {
    // Enhanced CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS, GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.setHeader('Access-Control-Max-Age', '86400');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    // Allow GET for testing
    if (req.method === 'GET') {
        return res.status(200).json({
            status: 'Password verification endpoint is working',
            method: 'POST required for authentication',
            timestamp: new Date().toISOString()
        });
    }
    
    if (req.method !== 'POST') {
        return res.status(405).json({ 
            success: false,
            error: 'Method not allowed. Use POST.' 
        });
    }
    
    try {
        const { password, timestamp, userAgent, domain } = req.body || {};
        
        // Enhanced logging
        console.log('🔐 Authentication attempt:', {
            hasPassword: !!password,
            passwordLength: password ? password.length : 0,
            domain: domain || 'unknown',
            userAgent: userAgent ? userAgent.substring(0, 50) + '...' : 'unknown',
            timestamp: new Date().toISOString(),
            ip: req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || 'unknown'
        });
        
        if (!password) {
            console.log('❌ No password provided');
            return res.status(400).json({
                success: false,
                message: 'Password is required',
                debug: 'Request body missing password field'
            });
        }
        
        // Check if password exists in our original list
        if (!passwords.includes(password)) {
            console.log('❌ Invalid password:', password);
            return res.status(401).json({
                success: false,
                message: 'Invalid password',
                debug: 'Password not found in valid passwords list'
            });
        }
        
        // Check if this specific password has been used before
        if (isPasswordUsed(password)) {
            const stateInfo = getStateInfo();
            console.log('🚫 Password already used:', password);
            return res.status(403).json({
                success: false,
                message: 'This password has already been used and is no longer valid',
                debug: 'Password found in used passwords list'
            });
        }
        
        // Password is valid and not used - mark it as used
        addUsedPassword(password);
        const stateInfo = getStateInfo();
        
        console.log('✅ SUCCESS! Password accepted:', password);
        console.log('Total used passwords:', stateInfo.usedCount);
        
        return res.status(200).json({
            success: true,
            message: 'Authentication successful',
            timestamp: Date.now(),
            passwordUsed: password,
            remainingPasswords: passwords.length - stateInfo.usedCount
        });
        
    } catch (error) {
        console.error('💥 Server error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            debug: error.message,
            timestamp: new Date().toISOString()
        });
    }
}
