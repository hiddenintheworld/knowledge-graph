import { globalKeys } from '../encryption/encryptionUtils.js';
import { cy } from '../state.js';
import { NodelabelToHashMapping, EdgelabelToHashMapping, HashToNodelabelMapping, HashToEdgelabelMapping,
	hashToNodeIDMapping, hashToEdgeIDMapping, NodeIDTohashMapping, EdgeIDTohashMapping} from '../state.js';  
export function exportGraphAndKeys() {
		const exportData = {
			nodes: cy.nodes().map(node => ({ data: node.data(), position: node.position() })),
			edges: cy.edges().map(edge => ({ data: edge.data() }))
		};

		const mappingData = {
			NodelabelToHashMapping,
			EdgelabelToHashMapping,
			HashToNodelabelMapping,
			HashToEdgelabelMapping,
			hashToNodeIDMapping,
			hashToEdgeIDMapping,
			NodeIDTohashMapping,
			EdgeIDTohashMapping
		};
		
		 // Combine graph data and mapping data into one object
		 const combinedData = {
			graph: exportData,
			mapping: mappingData
		};

		downloadData("graph_export.json", JSON.stringify(combinedData));
		downloadData("graph_keys.json", JSON.stringify({ globalKeys }));
	}

export function downloadData(filename, content) {
		const anchor = document.createElement('a');
		anchor.href = 'data:text/json;charset=utf-8,' + encodeURIComponent(content);
		anchor.download = filename;
		document.body.appendChild(anchor);
		anchor.click();
		document.body.removeChild(anchor);
	}
export function importGraphFromFile(graphFile) {
		const reader = new FileReader();
		reader.onload = function(e) {
			const combinedData = JSON.parse(e.target.result);
			const { graph, mapping } = combinedData;
	
			cy.elements().remove(); // Clear existing graph elements
	
			// Import nodes and edges directly without modifications
			graph.nodes.forEach(node => cy.add({ group: 'nodes', data: node.data, position: node.position }));
			graph.edges.forEach(edge => cy.add({ group: 'edges', data: edge.data }));
	
			cy.layout({ name: 'preset' }).run();
	
			// Update variables in state.js with imported mapping data
			Object.assign(NodelabelToHashMapping, mapping.NodelabelToHashMapping);
			Object.assign(EdgelabelToHashMapping, mapping.EdgelabelToHashMapping);
			Object.assign(HashToNodelabelMapping, mapping.HashToNodelabelMapping);
			Object.assign(HashToEdgelabelMapping, mapping.HashToEdgelabelMapping);
			Object.assign(hashToNodeIDMapping, mapping.hashToNodeIDMapping);
			Object.assign(hashToEdgeIDMapping, mapping.hashToEdgeIDMapping);
			Object.assign(NodeIDTohashMapping, mapping.NodeIDTohashMapping);
			Object.assign(EdgeIDTohashMapping, mapping.EdgeIDTohashMapping);
	
			// You may need to handle any other logic that depends on these variables being updated
		};
		reader.readAsText(graphFile);
	}
	
/*
export function importMappingDataFromFile(mappingFile) {
		const reader = new FileReader();
		reader.onload = function(e) {
			const mappingData = JSON.parse(e.target.result);
			
			// Update variables in state.js with imported mapping data
			Object.assign(NodelabelToHashMapping, mappingData.NodelabelToHashMapping);
			Object.assign(EdgelabelToHashMapping, mappingData.EdgelabelToHashMapping);
			Object.assign(HashToNodelabelMapping, mappingData.HashToNodelabelMapping);
			Object.assign(HashToEdgelabelMapping, mappingData.HashToEdgelabelMapping);
			Object.assign(hashToNodeIDMapping, mappingData.hashToNodeIDMapping);
			Object.assign(hashToEdgeIDMapping, mappingData.hashToEdgeIDMapping);
			Object.assign(NodeIDTohashMapping, mappingData.NodeIDTohashMapping);
			Object.assign(EdgeIDTohashMapping, mappingData.EdgeIDTohashMapping);
	
			// You may need to handle any other logic that depends on these variables being updated
		};
		reader.readAsText(mappingFile);
	}
	*/