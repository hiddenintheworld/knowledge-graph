export function generateUniqueId(data) {
    // This is a placeholder. Implement your own method to generate a unique ID
    // based on the encrypted data, such as hashing a portion of the encrypted string.
    return 'node_' + data.slice(-8); // Example implementation
}

export function generateNodeId(label) {
    // Simple method to generate a unique ID for a node
    // This is just a placeholder function. Implement your own ID generation logic
    return label.replace(/\s+/g, '_') + '_' + Date.now();
}
