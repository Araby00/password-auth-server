// Shared state management for used passwords and devices
// This creates a simple in-memory store that persists across function calls

// Global state object
const STATE = {
    usedPasswords: new Set(),
    usedDevices: new Map(), // deviceId -> { password, timestamp }
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

// Add device access (NEW)
export function addDeviceAccess(deviceId, password) {
    const accessInfo = {
        password: password,
        timestamp: Date.now()
    };
    STATE.usedDevices.set(deviceId, accessInfo);
    STATE.lastUpdated = new Date().toISOString();
    return true;
}

// Check if device is used (NEW)
export function isDeviceUsed(deviceId) {
    return STATE.usedDevices.has(deviceId);
}

// Get device info (NEW)
export function getDeviceInfo(deviceId) {
    return STATE.usedDevices.get(deviceId);
}

// Get all used devices (NEW)
export function getAllUsedDevices() {
    return Array.from(STATE.usedDevices.entries());
}

// Get full state info
export function getStateInfo() {
    return {
        usedPasswords: Array.from(STATE.usedPasswords),
        usedCount: STATE.usedPasswords.size,
        deviceCount: STATE.usedDevices.size, // NEW
        usedDevices: Object.fromEntries(STATE.usedDevices), // NEW
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

// Reset all devices (NEW - admin function)
export function resetAllDevices() {
    STATE.usedDevices.clear();
    STATE.lastUpdated = new Date().toISOString();
    return true;
}

// Reset everything (NEW - admin function)
export function resetAll() {
    STATE.usedPasswords.clear();
    STATE.usedDevices.clear();
    STATE.lastUpdated = new Date().toISOString();
    return true;
}
