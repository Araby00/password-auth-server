// Import shared password configuration
import { getAllPasswords, getPasswordStats, resetAllPasswords } from '../config/passwords.js';

export default function handler(req, res) {
    // Handle CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    // Handle POST request for admin actions (like reset)
    if (req.method === 'POST') {
        const { action, adminKey } = req.body;
        
        // Simple admin key (change this for security)
        if (adminKey !== 'admin123') {
            return res.status(401).json({ 
                error: 'Invalid admin key' 
            });
        }
        
        if (action === 'reset') {
            const result = resetAllPasswords();
            return res.status(200).json(result);
        }
        
        return res.status(400).json({ 
            error: 'Unknown action' 
        });
    }
    
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    // Get all passwords and statistics from shared config
    const allPasswords = getAllPasswords();
    const stats = getPasswordStats();
    
    // Create detailed password status report
    const passwordStatus = allPasswords.map((pwd, index) => ({
        id: index + 1,
        password: pwd,
        status: stats.usedPasswords.includes(pwd) ? '❌ USED' : '✅ Available',
        emoji: stats.usedPasswords.includes(pwd) ? '🔒' : '🔓'
    }));
    
    return res.status(200).json({
        title: '🔐 Password Authentication Admin Panel',
        timestamp: new Date().toISOString(),
        serverStatus: '🟢 Online and Synchronized with Master Config',
        
        statistics: {
            totalPasswords: stats.total,
            usedPasswords: stats.used,
            availablePasswords: stats.available,
            usagePercentage: `${stats.usagePercentage}%`,
            lastPasswordUsed: stats.lastUpdated,
            sessionStarted: stats.sessionStarted
        },
        
        passwordList: passwordStatus,
        
        usedPasswordsDetails: {
            list: stats.usedPasswords,
            count: stats.used,
            lastUpdated: stats.lastUpdated
        },
        
        availablePasswordsDetails: {
            list: stats.availablePasswords,
            count: stats.available
        },
        
        systemInfo: {
            note: '✅ Admin panel automatically synced with master password list',
            configFile: 'config/passwords.js',
            synchronized: true,
            editInstructions: 'Edit passwords in config/passwords.js and both verify-password.js and admin.js will update automatically'
        },
        
        adminActions: {
            resetAllPasswords: 'POST /api/admin with {"action": "reset", "adminKey": "admin123"}'
        },
        
        endpoints: {
            health: '/api/health',
            authenticate: '/api/verify-password',
            admin: '/api/admin'
        }
    });
}
