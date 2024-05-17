// main.js
import { initializeUIControls, initializeUI, populateSelectList } from './ui/uiControls.js';
import { getCy } from './state.js';
import { storeKeyAndGetIndex, globalKeys } from '../encryption/encryptionUtils.js'; 
import { fetchApiEndpoints } from './api/apiDataManager.js';
import { initializeCy } from './state.js';
import { setupNodeAddition, setupArticleAddition } from './ui/nodeUIHandlers.js';
import { setupEdgeAddition } from './ui/edgeUIHandler.js';
import { setupEncryptionControls } from './encryption/encryptionUIHandlers.js';
import { setupGraphEventListeners, setupGraphElementRemoval, setupGraphControls } from './graph/graphEvents.js';
import { setupGraphIOEventListeners } from './graph/graphUIHandlers.js';
import { setupKeyImportListener, setupEncryptionUIControls } from './encryption/encryptionUIHandlers.js';
import { setupGraphViewControls } from './ui/graphViewControls.js';
import { setupApiSubmissionListener } from './api/apiUIHandlers.js';
import { initializeDragDropImageHandler } from './ui/dragDropImageHandler.js';
import {initializeEdgeDrawingHandler} from './ui/edgeDrawingHandler.js';
import {initializeBoxSelectionDrawing} from './ui/boxSelectionDrawingHandlers.js';
//let globalKeys = []; // Store unique keys
let elementKeyMap = {}; // Map element IDs to key indices
//let imageModeEnabled = false; // Tracks whether Image Mode is enabled

let currentMode = 'select'; // Can be 'select', 'addNode', or 'addEdge'
let tempSourceNode = null; // Temporary holder for source node when adding edges

var cy;
document.addEventListener('DOMContentLoaded', function () {

    initializeCy('cy');
    cy = getCy();
	initializeUIControls(cy);
	setupGraphEventListeners();
    setupGraphElementRemoval();
    setupGraphControls();
	
    const apiEndpointsUrl = 'api_end_points.json';
    fetchApiEndpoints(apiEndpointsUrl, initializeUI, (error) => console.error(error));

    setupNodeAddition();
    setupEdgeAddition();
    setupEncryptionControls();
    setupArticleAddition();
    setupGraphIOEventListeners(cy, globalKeys);
    setupKeyImportListener();
    setupEncryptionUIControls();
	let layoutAfterImport = 'preset'; // Default layout after import
    setupApiSubmissionListener();
    setupGraphViewControls(cy);
    initializeDragDropImageHandler();
    initializeEdgeDrawingHandler();
    initializeBoxSelectionDrawing();
	
	
});


