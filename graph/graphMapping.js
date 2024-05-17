export function getMappingDisplay(mapping, idToHashMapping, hashToLabelMapping) {
    return (mapping || []).map(id => {
        let hashKey = idToHashMapping[id];
        return hashToLabelMapping[hashKey] || id;
    }).join(', ');
}
