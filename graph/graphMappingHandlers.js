
export async function updateMappingsAfterDataChange(ele, newData) {
    const isNode = ele.isNode();
    const serializedData = JSON.stringify(newData, Object.keys(newData).sort());
    const newId = await generateHash(serializedData);

    if (isNode) {
		const currentId = hashToNodeIDMapping[ele.id()];
        // Retrieve the old label using the node's current ID before updating
        const oldLabel = HashToNodelabelMapping[ele.id()];
        const newLabel = newData.label || oldLabel; // Fallback to old label if new label isn't provided
		
		deleteFromNodelabelToHashMapping(oldLabel);
        deleteFromHashToNodelabelMapping(ele.id());
		
        // Update the label-to-hash mapping with the new label and ID
        updateNodelabelToHashMapping(newLabel, newId);
        updateHashToNodelabelMapping(newId, newLabel);


		deleteFromHashToNodeIDMapping(ele.id());
		
        // Update the node's hash-to-ID and ID-to-hash mappings

        updateHashToNodeIDMapping(newId, currentId);
        updateNodeIDToHashMapping(currentId, newId);
    } else {
		const currentId = hashToEdgeIDMapping[ele.id()];
        // Similar logic for edges
        const oldDescription = HashToEdgelabelMapping[ele.id()];
        const newDescription = newData.description || oldDescription; // Fallback to old description if new one isn't provided

        deleteFromEdgelabelToHashMapping(oldDescription);
        deleteFromHashToEdgelabelMapping(ele.id());
		
        updateEdgelabelToHashMapping(newDescription, newId);
        updateHashToEdgelabelMapping(newId, newDescription);

		deleteFromHashToEdgeIDMapping(ele.id());
		
        updateHashToEdgeIDMapping(newId, currentId);
        updateEdgeIDToHashMapping(currentId, newId);
    }
}

export async function updateMappingsAfterEncryption(ele) {
    const isNode = ele.isNode();
    const encryptedData = ele.data('encryptedData');
    const newId = await generateHash(encryptedData);

    if (isNode) {
		const currentId = hashToNodeIDMapping[ele.id()];
        // For nodes, clear old mappings and update with encrypted data
        const oldLabel = HashToNodelabelMapping[ele.id()];
        const encryptedLabel = ele.data('label'); // Assuming the encrypted label is stored here

        deleteFromNodelabelToHashMapping(oldLabel);
        deleteFromHashToNodelabelMapping(ele.id());

        updateNodelabelToHashMapping(encryptedLabel, newId);
        updateHashToNodelabelMapping(newId, encryptedLabel);

		//updateNodelabelToHashMapping(oldLabel, newId);
        //updateHashToNodelabelMapping(newId, oldLabel);

		deleteFromHashToNodeIDMapping(ele.id());

        updateHashToNodeIDMapping(newId, currentId);
        updateNodeIDToHashMapping(currentId, newId);
    } else {
		const currentId = hashToEdgeIDMapping[ele.id()];
        // For edges, similarly clear old mappings and update
        const oldDescription = HashToEdgelabelMapping[ele.id()];
        const encryptedDescription = ele.data('description'); // Assuming the encrypted description is stored here

        deleteFromEdgelabelToHashMapping(oldDescription);
        deleteFromHashToEdgelabelMapping(ele.id());
		
        updateEdgelabelToHashMapping(encryptedDescription, newId);
        updateHashToEdgelabelMapping(newId, encryptedDescription);
        
        //updateEdgelabelToHashMapping(oldDescription, newId);
        //updateHashToEdgelabelMapping(newId, oldDescription);

		deleteFromHashToEdgeIDMapping(ele.id());
		
        updateHashToEdgeIDMapping(newId, currentId);
        updateEdgeIDToHashMapping(currentId, newId);
    }
}