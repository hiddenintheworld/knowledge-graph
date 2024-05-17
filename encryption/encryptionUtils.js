export const globalKeys = [];

export async function generateHash(input) {
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex.substring(0, 32);
}

export function generateUniqueKey(masterKey, dataIdentifier) {
    let hash = btoa(unescape(encodeURIComponent(masterKey + dataIdentifier))).slice(0, 16);
    return hash;
}

export function serializeDataForHash(data) {
    return JSON.stringify(data, Object.keys(data).sort());
}

export function deriveKey(masterKey, attributes) {
    const dataString = JSON.stringify(attributes, Object.keys(attributes).sort());
    const concatenated = masterKey + dataString;
    return generateHash(concatenated);
}

export function simpleEncrypt(text, key) {
    try {
        const encodedText = btoa(unescape(encodeURIComponent(text + key)));
        return encodedText;
    } catch (error) {
        console.error("Error encrypting:", error);
        return text;
    }
}

export function simpleDecrypt(encryptedText, key) {
    try {
        console.log(encryptedText);
        console.log(key);
        let decodedText = decodeURIComponent(escape(atob(encryptedText)));
        return decodedText.slice(0, decodedText.length - key.length);
    } catch (error) {
        console.error("Error decrypting:", error);
        return encryptedText;
    }
}

export function storeKeyAndGetIndex(key) {
    const index = globalKeys.indexOf(key);
    if (index === -1) {
        globalKeys.push(key);
        console.log(globalKeys);
        console.log("hehehe",globalKeys.length - 1)
        return globalKeys.length - 1;
    }
    return index;
}