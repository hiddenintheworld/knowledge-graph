import { cy, getCy, edgeIdCounter, nodeIdCounter } from '../state.js';  // Make sure cy is exported from state.js
import { deriveKey, simpleEncrypt, generateHash } from '../encryption/encryptionUtils.js';
import { storeKeyAndGetIndex, globalKeys } from '../encryption/encryptionUtils.js';
import { NodelabelToHashMapping, EdgelabelToHashMapping, HashToNodelabelMapping, HashToEdgelabelMapping,
     hashToNodeIDMapping, hashToEdgeIDMapping, NodeIDTohashMapping, EdgeIDTohashMapping} from '../state.js';  
import { getNodeIdCounter, incrementNodeIdCounter, getEdgeIdCounter, incrementEdgeIdCounter } from '../state.js';
import {
    updateNodelabelToHashMapping,
    updateEdgelabelToHashMapping,
    updateHashToNodelabelMapping,
    updateHashToEdgelabelMapping,
    updateHashToNodeIDMapping,
    updateHashToEdgeIDMapping,
    updateNodeIDToHashMapping,
    updateEdgeIDToHashMapping,
    deleteFromNodelabelToHashMapping,
    deleteFromEdgelabelToHashMapping,
    deleteFromHashToNodelabelMapping,
    deleteFromHashToEdgelabelMapping,
    deleteFromHashToNodeIDMapping,
    deleteFromHashToEdgeIDMapping,
    deleteFromNodeIDToHashMapping,
    deleteFromEdgeIDToHashMapping
  } from '../state.js';
  import {removeEmptyAttributes} from './graphUtils.js';
  import {updateMappingsAfterEncryption} from './mappingManager.js';
  import {getAutoLabel} from '../utils/autoLabeler.js';
export async function addEdge(data, needDescription = true, repeat=false) {
    const encryptionEnabled = document.getElementById('toggleEncryption').checked;
    const masterKey = document.getElementById('encryptionKey').value;
	
	//console.log(NodelabelToHashMapping);
    //console.log(NodeIDTohashMapping);
    //console.log(HashToNodelabelMapping);
    //console.log(hashToNodeIDMapping)
    //console.log(data.sourceLabel);
    // Resolve source and target IDs from labels, accounting for encryption

    console.log(data);
    const sourceId = NodelabelToHashMapping[data.sourceLabel] || data.sourceLabel;
    const targetId = NodelabelToHashMapping[data.targetLabel] || data.targetLabel;
	console.log(NodelabelToHashMapping);
	//console.log(sourceId);
	//console.log(targetId);

    if (!cy.getElementById(sourceId).length || !cy.getElementById(targetId).length) {
        alert('Source or target node not found.');
        return;
    }


    let edgeData, edgeId, keyIndex;
	if (needDescription && data.description==""){
        data.description = getAutoLabel();
    }

    if (!repeat){
        // Check if the label already exists and find a new label if necessary
        let labelCounter = 1; // Start the counter
        let modifiedLabel = data.description; // Initialize modifiedLabel with originalLabel
        while (EdgelabelToHashMapping[modifiedLabel] != null) {
            modifiedLabel = `${data.description}_${labelCounter}`; // Append counter to originalLabel
            labelCounter++; // Increment counter
            
        }
        data.description = modifiedLabel;
    }
    

	let dataToEncrypt = {
			source: sourceId,
			target: targetId,
            description: data.description, // Default to empty string if data.description is undefined
            userId: data && data.userId ? data.userId : '', // Default to empty string if data.userId is undefined or null
            types: data && data.typesInput ? data.typesInput.split(',').map(type => type.trim()) : [], // Default to an empty array if data.typesInput is undefined or null
            privacyLevel: data && data.privacyLevel ? data.privacyLevel : '', // Default to empty string if data.privacyLevel is undefined or null
            manipulationLogic: data && data.manipulationLogic ? data.manipulationLogic : '',
            activationLogic: data && data.activationLogic ? data.activationLogic : ''
        };

		// Process articleMapping
	if (Array.isArray(data.articleMapping) && data.articleMapping.length) {
		dataToEncrypt.articleMapping = [];
		console.log(data.articleMapping);
        console.log(hashToNodeIDMapping);
		data.articleMapping.forEach(element => {
			let hashKey = NodelabelToHashMapping[element]; // Convert label to hash
			if (hashToNodeIDMapping[hashKey] !== undefined && hashToNodeIDMapping !== null) { // Check if the hash key exists in hashToNodeIDMapping
				dataToEncrypt.articleMapping.push(hashToNodeIDMapping[hashKey]); // Add the node ID to articleMapping
			}
		});
	}

    dataToEncrypt = removeEmptyAttributes(dataToEncrypt);
	// Serialize and encrypt the data
    const serializedData = JSON.stringify(dataToEncrypt, Object.keys(dataToEncrypt).sort());

    if (encryptionEnabled && masterKey) {
        
		 // Derive a key for encryption specific to this content
        let derivedKey = await deriveKey(masterKey, JSON.stringify(dataToEncrypt));
        
        console.log("key",derivedKey);
        
        const encryptedData = simpleEncrypt(serializedData, derivedKey);
        
		//console.log(serializedData);
		
        // Use generateHash to create a unique ID for the encrypted content
        edgeId = await generateHash(encryptedData);
        keyIndex = storeKeyAndGetIndex(derivedKey);

        dataToEncrypt = {
			// ...dataToEncrypt,
            source: sourceId,
            target: targetId,
            id: edgeId,
            encryptedData: encryptedData,
            encrypted: true,
            keyIndex: storeKeyAndGetIndex(derivedKey),
            description: edgeId, // Use hash as description if encrypted
        };
		
    } else {
        //edgeId = `edge-${sourceId}-${targetId}-${description}`; //description
		//edgeId = description;
		// Use generateHash to create a unique ID for the encrypted content
        edgeId = await generateHash(serializedData);
		
        dataToEncrypt = {
            ...dataToEncrypt,
            id: edgeId,
            encrypted: false,
        };

    }
	//  &&  EdgelabelToHashMapping[data.description]==null
    if (!cy.getElementById(edgeId).length) { //&& dataToEncrypt.length>0
        console.log("aa");
        let newEdge = cy.add({
            group: 'edges',
            data: dataToEncrypt
        });
		
		 // Update mappings only when the edge is successfully added
        if (encryptionEnabled && masterKey) {
            //EdgelabelToHashMapping[edgeId] = edgeId; // Map encrypted edge ID
			//HashToEdgelabelMapping[edgeId] = edgeId;
            EdgelabelToHashMapping[data.description] = edgeId; // Map original description to non-encrypted edge ID
			HashToEdgelabelMapping[edgeId] = data.description;
            newEdge.addClass('encrypted');
            newEdge.removeClass(['normal']);
            //newEdge.style({
            //    'line-color': '#000',
            //    'target-arrow-color': '#000'
            // });

			
        } else {
            EdgelabelToHashMapping[dataToEncrypt.description] = edgeId; // Map original description to non-encrypted edge ID
			HashToEdgelabelMapping[edgeId] = dataToEncrypt.description;
            newEdge.addClass('normal').removeClass('encrypted'); // Assume 'normal' is the default class
            if (dataToEncrypt.description && dataToEncrypt.description.trim() !== "") {
                newEdge.addClass('edgeWithDescription').removeClass('edgeWithoutDescription');
            } else {
                newEdge.addClass('edgeWithoutDescription').removeClass('edgeWithDescription');
            }

            
            //let lineColor = dataToEncrypt.description ? '#808080' : '#00f'; // Example: use blue if description is present, otherwise use gray
            //let targetArrowColor = lineColor;

            //newEdge.style({
            //    'line-color': lineColor,
            //    'target-arrow-color': targetArrowColor
            //  });

        }
        console.log(newEdge.classes());
		
		var edgeCurrentID = edgeIdCounter;
        incrementEdgeIdCounter();
		EdgeIDTohashMapping[edgeCurrentID] = edgeId;
		hashToEdgeIDMapping[edgeId] = edgeCurrentID;
		//console.log(hashToEdgeIDMapping);
    }//else{
     //  alert('Edge already exist');
    //}
    return dataToEncrypt.description;
    console.log(HashToNodelabelMapping);
}