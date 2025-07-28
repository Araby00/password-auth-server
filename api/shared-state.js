// Shared state management for used passwords
// This creates a simple in-memory store that persists across function calls

// Global state object
const STATE = {
    usedPasswords: new Set(),
    lastUpdated: new Date().toISOString(),
    sessionStarted: new Date().toISOString()
};

// Get used passwords
export function getUsedPasswords() {
    return Array.from(STATE.usedPasswords);
}

// Add used password
export function addUsedPassword(password) {
    STATE.usedPasswords.add(password);
    STATE.lastUpdated = new Date().toISOString();
    return true;
}

// Check if password is used
export function isPasswordUsed(password) {
    return STATE.usedPasswords.has(password);
}

// Get full state info
export function getStateInfo() {
    return {
        usedPasswords: Array.from(STATE.usedPasswords),
        usedCount: STATE.usedPasswords.size,
        lastUpdated: STATE.lastUpdated,
        sessionStarted: STATE.sessionStarted
    };
}

// Reset all passwords (admin function)
export function resetAllPasswords() {
    STATE.usedPasswords.clear();
    STATE.lastUpdated = new Date().toISOString();
    return true;
}
