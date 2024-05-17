import { cy, getCy, edgeIdCounter, nodeIdCounter } from '../state.js';  // Make sure cy is exported from state.js
import { deriveKey, simpleEncrypt, generateHash } from '../encryption/encryptionUtils.js';
import { storeKeyAndGetIndex, globalKeys } from '../encryption/encryptionUtils.js';
import { NodelabelToHashMapping, EdgelabelToHashMapping, HashToNodelabelMapping, HashToEdgelabelMapping,
     hashToNodeIDMapping, hashToEdgeIDMapping, NodeIDTohashMapping, EdgeIDTohashMapping} from '../state.js';  
import { encryptElement, decryptElement} from '../encryption/graphEncryption.js';
import { getNonOverlappingPosition } from './graphLayouts.js';
import { getNodeIdCounter, incrementNodeIdCounter, getEdgeIdCounter, incrementEdgeIdCounter } from '../state.js';
import { applyEncryptionStyles, applyDecryptionStyles } from '../ui/graphViewControls.js';
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
  import { removeEmptyAttributes } from './graphUtils.js';
import {updateMappingsAfterEncryption, updateMappingsAfterDataChange} from './mappingManager.js';
import {refreshImageStyle, setImageSize} from '../ui/graphViewControls.js';
import {getAutoLabel} from '../utils/autoLabeler.js';
// Define the addNode function
export async function addNodeOrArticle(data, isArticle = false, needLabel = true, repeat=false) {
    const encryptionEnabled = document.getElementById('toggleEncryption').checked;
    const masterKey = document.getElementById('encryptionKey').value;

    // Initialize variables to hold node/article data
    let nodeData = {};
    let nodeId, keyIndex;


	let originalLabel = data.title || data.nodeLabel || data.label; // Store original label for mapping

    if (needLabel && (originalLabel==undefined || originalLabel=="")){
        originalLabel = getAutoLabel();
    }
    console.log(originalLabel);
    if (!repeat){
    // Check if the label already exists and find a new label if necessary
    let labelCounter = 1; // Start the counter
    let modifiedLabel = originalLabel; // Initialize modifiedLabel with originalLabel
    while (NodelabelToHashMapping[modifiedLabel] != null) {
        console.log(modifiedLabel);
        modifiedLabel = `${originalLabel}_${labelCounter}`; // Append counter to originalLabel
        labelCounter++; // Increment counter
        
    }
    originalLabel = modifiedLabel;
}
	console.log(originalLabel)

	// Prepare the data to encrypt, adding article-specific fields if necessary
    let dataToEncrypt = {
        label: originalLabel, // Use title for article, nodeLabel for node
        userId: data && data.userId ? data.userId : '', // Default to empty string if data.userId is undefined or null
        types: data && data.typesInput? data.typesInput.split(',').map(type => type.trim()) : (data.types? data.types : []), // Default to an empty array if data.typesInput is undefined or null
        url: data && data.url ? data.url : '', // Default to empty string if data.url is undefined or null
        privacyLevel: data && data.privacyLevel ? data.privacyLevel : '', // Default to empty string if data.privacyLevel is undefined or null
        preprocessingLogic: data && data.preprocessingLogic ? data.preprocessingLogic : '',
        apiCallLogic: data && data.apiCallLogic ? data.apiCallLogic : '',
        postprocessingLogic: data && data.postprocessingLogic ? data.postprocessingLogic : '',
        apiEndpoint: data && data.apiEndpoint ? data.apiEndpoint : ''

        
		//isArticle: data.isArticle,
		//description: data.description,
		//hashtags: data.hashtags,
    };
	
	console.log("fasdasdsa");
    console.log(data);
	    // Add article-specific properties if it's an article
    if (isArticle || data.isArticle) {
        console.log("bbba");
        dataToEncrypt.description = data.description;
        dataToEncrypt.hashtags =  data && data.hashtags? data.hashtags: '';
        dataToEncrypt.isArticle = true; // Mark as article
	

		//console.log(data.nodeMapping);
		//console.log(NodelabelToHashMapping);
		 // Process nodeMapping
		 if (Array.isArray(data.nodeMapping) && data.nodeMapping.length) {
			 dataToEncrypt.nodeMapping = [];
        data.nodeMapping.forEach(element => {
            let hashKey = NodelabelToHashMapping[element]; // Convert label to hash
			
			
            if (hashToNodeIDMapping[hashKey] !== undefined && hashToEdgeIDMapping[hashKey] !== null) { // Check if the hash key exists in hashToNodeIDMapping
                dataToEncrypt.nodeMapping.push(hashToNodeIDMapping[hashKey]); // Add the node ID to nodeMapping
				
            }
        });
		}
        // Process edgeMapping
		
		if (Array.isArray(data.edgeMapping) && data.edgeMapping.length) {
			dataToEncrypt.edgeMapping = [];
            //console.log(data.edgeMapping);
            //console.log(EdgelabelToHashMapping);
        data.edgeMapping.forEach(element => {
            let hashKey = EdgelabelToHashMapping[element]; // Convert label to hash
            if (hashToEdgeIDMapping[hashKey] !== undefined && hashToEdgeIDMapping[hashKey] !== null) { // Check if the hash key exists in hashToEdgeIDMapping
                dataToEncrypt.edgeMapping.push(hashToEdgeIDMapping[hashKey]); // Add the edge ID to edgeMapping
            }
        });
		}
    }
	
    
		// Process articleMapping
	if (Array.isArray(data.articleMapping) && data.articleMapping.length) {
		dataToEncrypt.articleMapping = [];
		//console.log(data.articleMapping);
        //console.log(NodelabelToHashMapping);
        //console.log(hashToNodeIDMapping);
		data.articleMapping.forEach(element => {
			let hashKey = NodelabelToHashMapping[element]; // Convert label to hash
			if (hashToNodeIDMapping[hashKey] !== undefined && hashToNodeIDMapping[hashKey] !== null ) { // Check if the hash key exists in hashToNodeIDMapping
                
				dataToEncrypt.articleMapping.push(hashToNodeIDMapping[hashKey]); // Add the node ID to articleMapping
                //console.log(dataToEncrypt.articleMapping);
			}
		});
	}

	dataToEncrypt = removeEmptyAttributes(dataToEncrypt);
	// Serialize and encrypt the data
	const serializedData = JSON.stringify(dataToEncrypt, Object.keys(dataToEncrypt).sort());
	console.log("Serialized Data:", serializedData);
		
    if (encryptionEnabled && masterKey) {
		
		// Derive a key for encryption specific to this content
        let derivedKey = await deriveKey(masterKey, serializedData);
		console.log("key",derivedKey);
		
		//console.log("Data to Encrypt:", dataToEncrypt);



		const encryptedData = simpleEncrypt(serializedData, derivedKey);
		console.log("Encrypted Data:", encryptedData);

		const hashOfSerialized = await generateHash(serializedData);
		//console.log("Hash of Serialized Data:", hashOfSerialized);
	
       
        // Use generateHash to create a unique ID for the encrypted content
        nodeId = await generateHash(encryptedData);
		//console.log("encryptedData hash for creation",nodeId);
        keyIndex = storeKeyAndGetIndex(derivedKey);
        console.log("hahaha", keyIndex);
        nodeData = {
            id: nodeId,
            label: nodeId, // Use hash as label if encrypted
            encryptedData: encryptedData,
            encrypted: true,
            keyIndex: keyIndex,
        };

        // Mark as article in the data, if it is one
        if (dataToEncrypt.isArticle) {
            nodeData.isArticle = true;
        }
		
		
	
    } else {
        // For non-encrypted content, generate a unique ID based on the label or title
        //nodeId = await generateHash(data.title || data.nodeLabel);
		//nodeId = data.title || data.nodeLabel;
		
		// Use generateHash to create a unique ID for the encrypted content
        nodeId = await generateHash(serializedData);
        nodeData = { ...dataToEncrypt, id: nodeId, encrypted: false };
		
    }
	
	//console.log(dataToEncrypt);

	
	//console.log(hashToNodeIDMapping);
    let position;
    // Check if the node/article already exists to avoid duplicates  && NodelabelToHashMapping[originalLabel]==null
    if (!cy.getElementById(nodeId).length) {
        console.log(nodeData);
        //console.log(position);
        if (data.position!=null){
            position=data.position;
        }

        let newNode = cy.add({
            group: 'nodes',
            data: nodeData,
            position: position || getNonOverlappingPosition(),
        });

        let ele = cy.getElementById(nodeId);
        await setImageSize(ele); // Adjust the size of the node based on its image
        await refreshImageStyle(ele);
        
			//console.log(nodeData);
			var nodeCurrentID = nodeIdCounter;
            incrementNodeIdCounter();
			NodeIDTohashMapping[nodeCurrentID] = nodeId;
			hashToNodeIDMapping[nodeId] = nodeCurrentID;
			
			//console.log(hashToNodeIDMapping);
			//console.log(HashToNodelabelMapping);
		
		// Apply black background color for encrypted nodes
        if (encryptionEnabled && masterKey) {
			// Update label to hash mapping
			//NodelabelToHashMapping[nodeId] = nodeId; // Map original label to encrypted node ID
            //HashToNodelabelMapping[nodeId] = nodeId;
            NodelabelToHashMapping[originalLabel] = nodeId; // Map original label to encrypted node ID
			HashToNodelabelMapping[nodeId] = originalLabel;
            //newNode.style({'background-color': '#000'});
            newNode.addClass('encrypted').removeClass(['normal', 'hasUrl', 'article']);
        } else{
			// Update label to hash mapping
			NodelabelToHashMapping[originalLabel] = nodeId; // Map original label to encrypted node ID
			HashToNodelabelMapping[nodeId] = originalLabel;
            newNode.addClass('normal').removeClass('encrypted'); // Ensure it's not marked as encrypted
			if (dataToEncrypt.isArticle) {
            // Maintain different styling for articles if needed
            //newNode.style({'background-color': '#ff0000'});
           
                newNode.removeClass('normal').addClass('article');
			}
            //else{
            //    let nodeColor = dataToEncrypt.label ? '#808080' : '#00f'; // Example: use blue if description is present, otherwise use gray
            //    newNode.style({'background-color': nodeColor});
            //}
            //if (dataToEncrypt.url) {
            //    newNode.removeClass('normal').addClass('hasUrl');
            //}
		}
		console.log("Classes for newNode:", newNode.classes());
        console.log(dataToEncrypt.isArticle ? "Article added successfully." : "Node added successfully.");

    }//else{
      //  alert('Node already exist');
    //}
    console.log(HashToNodelabelMapping);
	return originalLabel;
    
	//else {
        //alert("This item already exists or has been encrypted.");
    //}
}


export async function updateNodeOrArticle(hash, newMappingData) {
    let id = NodelabelToHashMapping[hash];
    let ele = cy.getElementById(id);
    if (!ele) {
        console.error("Element not found for updating");
        return;
    }
    console.log("jojojo");
    const encryptionEnabled = document.getElementById('toggleEncryption').checked;
    let keyIndex;
    let key;
    keyIndex = ele.data('keyIndex');
    key = globalKeys[keyIndex]; // Retrieve the decryption key using the keyIndex
    // Check if the node/article is encrypted and decrypt it if necessary
    if (encryptionEnabled && key != [undefined]) {
        console.log("bababa");
        
        //console.log(globalKeys);
        //console.log("update key",key);
        // Check if key is undefined
        if (typeof key !== 'undefined' && key !== null) {
            await decryptElement(ele, key);
        } else {
            console.error("Decryption key not found");
            return;
        }
    }

    // Convert label mappings to ID mappings for nodeMapping and edgeMapping
    if (newMappingData.nodeMapping) {
        newMappingData.nodeMapping = newMappingData.nodeMapping.map(label => {
            const hash = NodelabelToHashMapping[label];
            return hashToNodeIDMapping[hash];
        });
    }

    if (newMappingData.edgeMapping) {
        newMappingData.edgeMapping = newMappingData.edgeMapping.map(label => {
            const hash = EdgelabelToHashMapping[label];
            return hashToEdgeIDMapping[hash];
        });
    }


    // Apply the new mapping data to the element
    ele.data(newMappingData);
    

   
    // Re-encrypt the element if encryption is enabled
    if (encryptionEnabled && key != [undefined]) {

        await encryptElement(ele, key);
        applyEncryptionStyles(ele);
        // Update mappings after re-encryption
        await updateMappingsAfterEncryption(ele);

    } else {
        // Update mappings without re-encryption
        await updateMappingsAfterDataChange(ele, newMappingData);
    }
}


