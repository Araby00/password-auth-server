import { getUsedPasswords, addUsedPassword, isPasswordUsed, getStateInfo, addDeviceAccess, isDeviceUsed } from './shared-state.js';

// List of valid passwords - UPDATE THESE TO YOUR ACTUAL PASSWORDS
const passwords = [
    'OOO1',
    'SS', 
    'MAR',
    'KKK4',
    'KKK5', 
    'KKK6'
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
        const stateInfo = getStateInfo();
        return res.status(200).json({
            status: 'Password verification endpoint is working',
            method: 'POST required for authentication',
            timestamp: new Date().toISOString(),
            usedPasswordsCount: stateInfo.usedCount,
            usedDevicesCount: stateInfo.deviceCount,
            totalPasswords: passwords.length,
            remainingPasswords: passwords.length - stateInfo.usedCount
        });
    }
    
    if (req.method !== 'POST') {
        return res.status(405).json({ 
            success: false,
            error: 'Method not allowed. Use POST.' 
        });
    }
    
    try {
        const { password, deviceId, timestamp, userAgent, domain } = req.body || {};
        
        // Enhanced logging
        console.log('🔐 Authentication attempt:', {
            hasPassword: !!password,
            passwordLength: password ? password.length : 0,
            deviceId: deviceId || 'unknown',
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

        if (!deviceId) {
            console.log('❌ No device ID provided');
            return res.status(400).json({
                success: false,
                message: 'Device ID is required',
                debug: 'Request body missing deviceId field'
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
                debug: `Password used. Total used: ${stateInfo.usedCount}/${passwords.length}`
            });
        }

        // Check if this device has already used any password
        if (isDeviceUsed(deviceId)) {
            console.log('🚫 Device already used a password:', deviceId);
            return res.status(403).json({
                success: false,
                message: 'This device has already used a password. Each device can only authenticate once.',
                debug: 'Device found in used devices list'
            });
        }
        
        // Password is valid and not used, device is new - mark both as used
        addUsedPassword(password);
        addDeviceAccess(deviceId, password);
        
        const stateInfo = getStateInfo();
        
        console.log('✅ SUCCESS! Password accepted:', password);
        console.log('✅ Device registered:', deviceId);
        console.log('Total used passwords:', stateInfo.usedCount);
        console.log('Total used devices:', stateInfo.deviceCount);
        
        return res.status(200).json({
            success: true,
            message: 'Authentication successful - Trial period started',
            timestamp: Date.now(),
            passwordUsed: password,
            deviceId: deviceId,
            trialDuration: '24 hours',
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
