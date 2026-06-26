const store = {};

const set = (key, value, ttlMs) => {
    store[key] = {
        value,
        expiresAt: Date.now() + ttlMs
    };
};

const get = (key) => {
    const entry = store[key];
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
        delete store[key];
        return null;
    }
    return entry.value;
};

const del = (key) => {
    delete store[key];
};

module.exports = { get, set, del };