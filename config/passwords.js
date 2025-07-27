// ==================== MASTER PASSWORD LIST ====================
// Edit passwords here ONLY - both verify-password.js and admin.js will use this automatically
// Add, remove, or change passwords in this list and both files will update automatically

export const PASSWORDS = [
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

// Global state for tracking used passwords (shared between all files)
const globalState = {
    usedPasswords: new Set(),
    lastUpdated: new Date().toISOString(),
    sessionStarted: new Date().toISOString()
};

// ==================== SHARED FUNCTIONS ====================

// Get all passwords
export function getAllPasswords() {
    return PASSWORDS;
}

// Get used passwords as array
export function getUsedPasswords() {
    return Array.from(globalState.usedPasswords);
}

// Add password to used list
export function markPasswordAsUsed(password) {
    globalState.usedPasswords.add(password);
    globalState.lastUpdated = new Date().toISOString();
    return true;
}

// Check if password is already used
export function isPasswordUsed(password) {
    return globalState.usedPasswords.has(password);
}

// Get complete statistics
export function getPasswordStats() {
    const usedCount = globalState.usedPasswords.size;
    const totalCount = PASSWORDS.length;
    
    return {
        total: totalCount,
        used: usedCount,
        available: totalCount - usedCount,
        usagePercentage: Math.round((usedCount / totalCount) * 100),
        usedPasswords: Array.from(globalState.usedPasswords),
        availablePasswords: PASSWORDS.filter(pwd => !globalState.usedPasswords.has(pwd)),
        lastUpdated: globalState.lastUpdated,
        sessionStarted: globalState.sessionStarted
    };
}

// Reset all passwords (admin function)
export function resetAllPasswords() {
    globalState.usedPasswords.clear();
    globalState.lastUpdated = new Date().toISOString();
    return {
        success: true,
        message: 'All passwords have been reset',
        timestamp: globalState.lastUpdated
    };
}
