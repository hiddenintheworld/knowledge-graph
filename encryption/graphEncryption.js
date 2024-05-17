// graphEncryption.js
import { simpleEncrypt, simpleDecrypt, generateHash, deriveKey, storeKeyAndGetIndex, globalKeys } from './encryptionUtils.js';
import { getNodeIdCounter, incrementNodeIdCounter, getEdgeIdCounter, incrementEdgeIdCounter, NodeIDTohashMapping, hashToNodeIDMapping, EdgeIDTohashMapping, hashToEdgeIDMapping } from '../state.js';
import { removeEmptyAttributes } from '../graph/graphUtils.js';
export async function encryptElement(ele, key) {
    let dataToEncrypt = {};
    const isEdge = ele.isEdge();

    if (isEdge) {
        // Edge-specific data preparation
        dataToEncrypt = {
            description: ele.data('description'),
            userId: ele.data('userId'),
            types: ele.data('types'),
            privacyLevel: ele.data('privacyLevel'),
			source: ele.data('source'),
			target: ele.data('target'),
            articleMapping: ele.data('articleMapping'),
            edgeMapping: ele.data('edgeMapping'),
            nodeMapping: ele.data('nodeMapping'),
        };
    } else {
        // Node and article data preparation
        dataToEncrypt = {
            label: ele.data('label'),
            description: ele.data('description'),
            userId: ele.data('userId'),
            types: ele.data('types'),
            url: ele.data('url'),
            privacyLevel: ele.data('privacyLevel'),
            hashtags: ele.data('hashtags'),
            isArticle: ele.data('isArticle'),
            articleMapping: ele.data('articleMapping'),
            edgeMapping: ele.data('edgeMapping'),
            nodeMapping: ele.data('nodeMapping'),
        };
    }
	
	//console.log("Data to Encrypt:", dataToEncrypt);

    dataToEncrypt = removeEmptyAttributes(dataToEncrypt);

    const serializedData = JSON.stringify(dataToEncrypt, Object.keys(dataToEncrypt).sort());
    console.log("Serialized Data:", serializedData);

    const encryptedData = simpleEncrypt(serializedData, key);
    console.log("Encrypted Data:", encryptedData);

    const hashOfSerialized = await generateHash(encryptedData);
    //console.log("Hash of Serialized Data:", hashOfSerialized);
    
    let updateData = {
        encryptedData: encryptedData,
        encrypted: true,
        keyIndex: storeKeyAndGetIndex(key),
    };

	
	updateData.label = ''; // Or use ele.removeData('url') to remove it
	updateData.userId = ''; // Or use ele.removeData('url') to remove it
	updateData.types = '';
	updateData.url = '';
	updateData.privacyLevel = '';
    updateData.articleMapping = '';
    updateData.nodeMapping = '';
    updateData.edgeMapping = '';
	updateData.hashtags = '';
	updateData.isArticle = '';
	updateData.description = '';

    if (isEdge) {
        // If re-encrypting an edge, use the hash generated from its serialized data as the description
        // This ensures the description (hash) remains consistent with the original encryption
        updateData.description = hashOfSerialized;
    } else {
        // For nodes, the label is updated with the hash
        updateData.label = hashOfSerialized;
		// For nodes, remove or replace sensitive attributes
		// Anonymize the 'url' for nodes
    }

    ele.data(updateData);
    console.log(updateData);
	return updateData;

}






export function decryptElement(ele, key) {
    const encryptedData = ele.data('encryptedData');
    const keyIndex = ele.data('keyIndex');
	//console.log(key)
    const decryptedData = JSON.parse(simpleDecrypt(encryptedData, key));
    //console.log("Data After Decryption:", decryptedData);


    // Restore original data
    ele.data(decryptedData);
    ele.data('encrypted', false); // Mark as not encrypted
    ele.data('keyIndex', keyIndex); // Optionally restore keyIndex if needed for re-encryption
	
	return decryptedData;

}

// Add other encryption and decryption functions as needed


export function encryptGraphElement(data, derivedKey) {
    // Serialize data and encrypt using the derived key
    let serializedData = JSON.stringify(data);
    let encryptedData = simpleEncrypt(serializedData, derivedKey);
    // Generate a unique ID for the node/edge based on encrypted data
    let uniqueId = generateHash(encryptedData);
    return { nodeId: uniqueId, encryptedData };
}

// ----- Graph-Level Encryption and Decryption -----

export function encryptGraph(data, key) {
    // Convert the data to JSON format
    const jsonData = JSON.stringify(data);
    
    // Encrypt the JSON data using a simple encryption function
    const encryptedData = simpleEncrypt(jsonData, key);
    
    return encryptedData;
}

export function decryptGraph(encryptedData, key) {
    // This should reverse the encryptGraphElement process
    const decryptedData = simpleDecrypt(encryptedData, key);
    try {
        return JSON.parse(decryptedData);
    } catch (e) {
        console.error('Decryption error:', e);
        return null;
    }
}

// ----- Utility Functions for Encryption and Decryption -----

export function encryptAndStoreKey(text, masterKey, dataIdentifier) {
    let uniqueKey = generateUniqueKey(masterKey, dataIdentifier); // Derive a unique key
    let encryptedText = simpleEncrypt(text, uniqueKey); // Encrypt using the unique key
    // Store the uniqueKey or its index if storing multiple keys
    let keyIndex = globalKeys.indexOf(uniqueKey);
    if (keyIndex === -1) {
        globalKeys.push(uniqueKey);
        keyIndex = globalKeys.length - 1;
    }
    return { encryptedText, keyIndex };
}


export function decryptWithStoredKey(encryptedData, masterKey, dataIdentifier) {
    // Retrieve or regenerate the unique key for decryption
    let uniqueKey = generateUniqueKey(masterKey, dataIdentifier);

    // Decrypt the data using the unique key
    let decryptedText = simpleDecrypt(encryptedData, uniqueKey);

    // If the decrypted data is a serialized graph element, parse it back into an object
    try {
        let decryptedData = JSON.parse(decryptedText);
        return decryptedData; // Return the decrypted graph element object
    } catch (error) {
        console.error("Error decrypting or parsing data:", error);
        return null; // Handle error or return decrypted text directly if not a serialized object
    }
}