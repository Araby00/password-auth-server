import { getUsedPasswords, getStateInfo } from './shared-state.js';

// Same password list as verify-password.js
const passwords = [
    'mypassword123',
    'secret456', 
    'access789',
    'unlock2024',
    'key555',
    'script999',
    'auth777',
    'pass111',
    'code444',
    'magic888'
];

export default function handler(req, res) {
    // Handle CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    // Get current state from shared state system
    const stateInfo = getStateInfo();
    const usedPasswordsList = getUsedPasswords();
    
    // Create detailed password status report
    const passwordStatus = passwords.map((pwd, index) => ({
        id: index + 1,
        password: pwd,
        status: usedPasswordsList.includes(pwd) ? '❌ USED' : '✅ Available',
        emoji: usedPasswordsList.includes(pwd) ? '🔒' : '🔓',
        usedAt: usedPasswordsList.includes(pwd) ? 'During current session' : null
    }));
    
    const stats = {
        total: passwords.length,
        used: stateInfo.usedCount,
        available: passwords.length - stateInfo.usedCount,
        usagePercentage: Math.round((stateInfo.usedCount / passwords.length) * 100)
    };
    
    return res.status(200).json({
        title: '🔐 Password Authentication Admin Panel',
        timestamp: new Date().toISOString(),
        serverStatus: '🟢 Online and Synchronized',
        
        statistics: {
            totalPasswords: stats.total,
            usedPasswords: stats.used,
            availablePasswords: stats.available,
            usagePercentage: `${stats.usagePercentage}%`,
            lastPasswordUsed: stateInfo.lastUpdated,
            sessionStarted: stateInfo.sessionStarted
        },
        
        passwordList: passwordStatus,
        
        usedPasswordsDetails: {
            list: stateInfo.usedPasswords,
            count: stateInfo.usedCount,
            lastUpdated: stateInfo.lastUpdated
        },
        
        systemInfo: {
            note: '✅ Admin panel is now synchronized with password usage',
            serverType: 'Vercel Serverless Functions with Shared State',
            memoryBased: true,
            synchronized: true,
            sessionInfo: `Started: ${stateInfo.sessionStarted}`
        },
        
        endpoints: {
            health: '/api/health',
            authenticate: '/api/verify-password', 
            admin: '/api/admin',
            sharedState: '/api/shared-state'
        }
    });
}
