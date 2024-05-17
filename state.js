export let currentMousePosition = { x: 0, y: 0 };
export let cyRenderedPosition = { x: 0, y: 0 };

export let untitledIds = new Set();
export let minUnusedId = 1; // Start from 1


export let cy = null;
export let eh = null;

// Define an object to hold the SimpleMDE instances
export let simpleMdeEditors = {};
export let apiEndpointsData = [];
export let NodelabelToHashMapping = {}; // Global or accessible within your relevant scope
export let EdgelabelToHashMapping = {}; // Global or accessible within your relevant scope
export let HashToNodelabelMapping = {};
export let HashToEdgelabelMapping = {};
export let hashToNodeIDMapping = {};
export let hashToEdgeIDMapping = {};
export let NodeIDTohashMapping = {};
export let EdgeIDTohashMapping = {};
export let nodeIdCounter = 0; // Global node ID counter
export let edgeIdCounter = 0; // Global edge ID counter
export let currentMode = 'select'; // Can be 'select', 'addNode', or 'addEdge'
export let tempSourceNode = null; // Temporary holder for source node when adding edges
export let imageModeEnabled = false; // Declare it locally within the module
export let drawEdgeMode = false; // Declare it locally within the module
export let selectionBoxMode = false;
import {selectionBox} from './ui/boxSelectionDrawingHandlers.js';
export let selectedElements;
export function getNextUntitledId() {
    while (untitledIds.has(minUnusedId)) {
        minUnusedId++;
    }
    let id = minUnusedId;
    untitledIds.add(id);
    return id;
}

export function releaseUntitledId(id) {
    untitledIds.delete(id);
    if (id < minUnusedId) {
        minUnusedId = id;
    }
}

export function getNodeIdCounter() {
    return nodeIdCounter;
}

export function incrementNodeIdCounter() {
    nodeIdCounter++;
    return nodeIdCounter;
}

export function getEdgeIdCounter() {
    return edgeIdCounter;
}

export function incrementEdgeIdCounter() {
    edgeIdCounter++;
    return edgeIdCounter;
}

export function setApiEndpointsData(data) {
    apiEndpointsData = data;
}

export function getApiEndpointsData() {
    return apiEndpointsData;
}


export function setImageMode(enabled) {
    imageModeEnabled = enabled;
}

export function getImageMode() {
    return imageModeEnabled;
}



export function initializeCy(containerId) {

    
    cy = cytoscape({
        container: document.getElementById(containerId),
        style: [
            { selector: 'node', style: { 'background-color': '#808080', 'label': 'data(label)' }},
            { selector: 'edge', style: { 'width': 3, 'line-color': '#ccc', 'target-arrow-color': '#ccc', 'target-arrow-shape': 'triangle', 'curve-style': 'bezier', 'label': 'data(description)', 'text-rotation': 'autorotate', 'text-margin-y': -20 }},
            
            { selector: 'node.encrypted', style: { 'background-color': '#000', 'background-image': 'none', 'border-color': '#000', 'width': '50', 'height': '50' }},
            { selector: 'node.article', style: { 'background-color': '#ff0000', 'background-image': 'none', 'border-color': '#ff0000', 'width': '50', 'height': '50' }},
            { selector: 'node.normal', style: { 'background-color': '#808080', 'background-image': 'none', 'border-color': '#808080', 'width': '50', 'height': '50' }},
            { selector: 'node.hasUrl', style: { 'background-image': 'data(url)', 'background-fit': 'cover', 'background-clip': 'none', 'width': 'data(width)', 'height': 'data(height)' }},
            
            { selector: 'edge.encrypted', style: { 'line-color': '#000', 'target-arrow-color': '#000' }},
            { selector: 'edge.normal', style: { 'line-color': '#ccc', 'target-arrow-color': '#ccc' }},
            {
                selector: 'edge.edgeWithDescription',
                style: {
                    'line-color': '#808080', // Blue for edges without a description
                    'target-arrow-color': '#808080'
                }
            },
            {
                selector: 'edge.edgeWithoutDescription',
                style: {
                    'line-color': '#00f', // Gray for edges with a description
                    'target-arrow-color': '#00f'
                }
            },
            
            //{ selector: 'node[url][url != ""]', style: {'shape': 'rectangle','background-image': 'data(url)', 'background-fit': 'contain', 'background-clip': 'none'}},
            //{ selector: 'node[name]', style: { 'content': 'data(name)' }},
            { selector: '.eh-handle', style: { 'background-color': 'red', 'width': 12, 'height': 12, 'shape': 'ellipse', 'overlay-opacity': 0, 'border-width': 12, 'border-opacity': 0 }},
            { selector: '.eh-hover', style: { 'background-color': 'red' }},
            { selector: '.eh-source', style: { 'border-width': 2, 'border-color': 'red' }},
            { selector: '.eh-target', style: { 'border-width': 2, 'border-color': 'red' }},
            { selector: '.eh-preview, .eh-ghost-edge', style: { 'background-color': 'red', 'line-color': 'red', 'target-arrow-color': 'red', 'source-arrow-color': 'red' }},
            { selector: '.eh-ghost-edge.eh-preview-active', style: { 'opacity': 0 }},
            {
                selector: '.highlighted', // Highlighted class
                style: {
                    'background-color': 'yellow', // Highlight color for nodes
                    'line-color': 'yellow', // Highlight color for edges
                    'target-arrow-color': 'yellow' // Highlight color for arrows
                }
            },
            {
                selector: '.running', // Highlighted class
                style: {
                    'background-color': 'green', // Highlight color for nodes
                    'line-color': 'green', // Highlight color for edges
                    'target-arrow-color': 'green' // Highlight color for arrows
                }
            },
            {
                selector: 'node[processedData]',
                style: {
                    'label': function(ele) {
                        return ele.data('label') + '\n' + formatProcessedData(ele.data('processedData'));
                    },
                    'text-wrap': 'wrap',
                    'text-valign': 'top', // Adjusts vertical alignment
                    'text-margin-y': 10 // Adjusts vertical space for the second label
                }
            },
            {
                selector: 'edge[processedData]',
                style: {
                    'label': function(ele) {
                        return ele.data('description') + '\n' + formatProcessedData(ele.data('processedData'));
                    },
                    'font-size': 10,  // Adjust font size to be smaller if needed
                    'text-wrap': 'wrap',  // Ensure text wrapping is enabled
                    'text-max-width': 80,  // Adjust max width to keep text bounded
                    'text-rotation': 'autorotate',
                    'text-margin-y': 20,  // Adjust the label position relative to the edge
                    'edge-text-rotation': 'autorotate'  // Ensure text rotates with edge
                }
            }
 
        ],
        elements: { nodes: [], edges: [] },
        layout: { name: 'cose' },
        boxSelectionEnabled: false, // Enable box selection

    });

    function formatProcessedData(data) {
        // Assuming data is a JSON string or object
        if (typeof data === 'string') {
            data = JSON.parse(data);
        }
        return 'Data: ' + JSON.stringify(data, null, 2); // Example formatter
    }

// Set up interact.js to track mouse movements

/*
  interact(document).on('move', (event) => {
    const containerRect = cy.container().getBoundingClientRect();
    const cyZoom = cy.zoom();
    const cyPan = cy.pan();
    //console.log(cyZoom);
    //console.log(cyPan);
    // Calculate the mouse position relative to the Cytoscape container
    let relativeX = (event.pageX - containerRect.left);
    let relativeY = (event.pageY - containerRect.top);

    // Adjust the coordinates to get the model positions, considering the current zoom and pan
    cyRenderedPosition.x = relativeX;
    cyRenderedPosition.y = relativeY - 57;
});

  */
    // the default values of each option are outlined below:
let defaults = {
    canConnect: function( sourceNode, targetNode ){
      // whether an edge can be created between source and target
      //return !sourceNode.same(targetNode); // e.g. disallow loops
     // return [sourceNode, targetNode];
     return false;
    },
    edgeParams: function( sourceNode, targetNode ){
      // for edges between the specified source and target
      // return element object to be passed to cy.add() for edge
      return {};
    },
    imageCache: true,
    hoverDelay: 150, // time spent hovering over a target node before it is considered selected
    snap: true, // when enabled, the edge can be drawn by just moving close to a target node (can be confusing on compound graphs)
    snapThreshold: 50, // the target node must be less than or equal to this many pixels away from the cursor/finger
    snapFrequency: 15, // the number of times per second (Hz) that snap checks done (lower is less expensive)
    noEdgeEventsInDraw: true, // set events:no to edges during draws, prevents mouseouts on compounds
    disableBrowserGestures: true // during an edge drawing gesture, disable browser gestures such as two-finger trackpad swipe and pinch-to-zoom
  };

    eh = cy.edgehandles( defaults );

}

export function getCy() {
    return cy;
}

export function getEh(){
    return eh;
}

export function updateSelectElements(ele){
    selectedElements = ele;
}

export function addElements(newElements) {
    if (!Array.isArray(newElements)) newElements = [newElements]; // Ensure newElements is an array
    if (newElements.length > 0) {
    newElements.forEach(newElement => {
        if (selectedElements.some(ele => ele.id() === newElement.id())) {
            // If element is already selected, remove it
            selectedElements = selectedElements.not(newElement);
        } else {
            // Otherwise, add it to the selection
            selectedElements = selectedElements.union(newElement);
        }
    });
}
    // Here you can trigger any UI updates needed to reflect the new selection state
}

// Assuming state.js is a module that manages global state
export function switchMode(newMode) {
    currentMode = newMode;
    tempSourceNode = null; // Reset temp source node when changing modes
};
export function toggleSelectionBox(){
    selectionBoxMode = !selectionBoxMode;
    console.log(selectionBoxMode);
    if (selectionBoxMode)
    {   
        cy.userPanningEnabled(false);
    }
    else{
        cy.userPanningEnabled(true);
        selectionBox.style.display = 'none'; // Hide the selection box when disabled
    }
    
}
export function toggleDrawEdge(){
    drawEdgeMode = !drawEdgeMode;
    console.log(drawEdgeMode);
    if (drawEdgeMode)
    {
        eh.enableDrawMode();
    }
    else{
       eh.disableDrawMode();
    }
    
}
export function setCurrentMode(mode) {
    currentMode = mode;
}

export function getCurrentMode() {
    return currentMode;
}

export function resetTempSourceNode(){
    tempSourceNode = null; 
}

export function updateNodelabelToHashMapping(originalLabel, hashedLabel) {
    NodelabelToHashMapping[originalLabel] = hashedLabel;
}

export function updateEdgelabelToHashMapping(originalLabel, hashedLabel) {
    EdgelabelToHashMapping[originalLabel] = hashedLabel;
}

export function updateHashToNodelabelMapping(hashedLabel, originalLabel) {
    HashToNodelabelMapping[hashedLabel] = originalLabel;
}

export function updateHashToEdgelabelMapping(hashedLabel, originalLabel) {
    HashToEdgelabelMapping[hashedLabel] = originalLabel;
}

export function updateHashToNodeIDMapping(hashedLabel, nodeId) {
    hashToNodeIDMapping[hashedLabel] = nodeId;
}

export function updateHashToEdgeIDMapping(hashedLabel, edgeId) {
    hashToEdgeIDMapping[hashedLabel] = edgeId;
}

export function updateNodeIDToHashMapping(nodeId, hashedLabel) {
    NodeIDTohashMapping[nodeId] = hashedLabel;
}

export function updateEdgeIDToHashMapping(edgeId, hashedLabel) {
    EdgeIDTohashMapping[edgeId] = hashedLabel;
}

export function deleteFromNodelabelToHashMapping(originalLabel) {
    delete NodelabelToHashMapping[originalLabel];
}

export function deleteFromEdgelabelToHashMapping(originalLabel) {
    delete EdgelabelToHashMapping[originalLabel];
}

export function deleteFromHashToNodelabelMapping(hashedLabel) {
    delete HashToNodelabelMapping[hashedLabel];
}

export function deleteFromHashToEdgelabelMapping(hashedLabel) {
    delete HashToEdgelabelMapping[hashedLabel];
}

export function deleteFromHashToNodeIDMapping(hashedLabel) {
    delete hashToNodeIDMapping[hashedLabel];
}

export function deleteFromHashToEdgeIDMapping(hashedLabel) {
    delete hashToEdgeIDMapping[hashedLabel];
}

export function deleteFromNodeIDToHashMapping(nodeId) {
    delete NodeIDTohashMapping[nodeId];
}

export function deleteFromEdgeIDToHashMapping(edgeId) {
    delete EdgeIDTohashMapping[edgeId];
}