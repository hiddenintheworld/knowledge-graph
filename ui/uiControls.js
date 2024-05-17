import { getCy, switchMode, toggleDrawEdge, toggleSelectionBox, currentMousePosition } from '../state.js';
import { globalKeys } from '../encryption/encryptionUtils.js'; 
import { encryptElement, decryptElement } from '../encryption/graphEncryption.js';
import { applyEncryptionStyles, applyDecryptionStyles } from './graphViewControls.js';
import {  addNodeOrArticle, updateNodeOrArticle } from '../graph/nodeArticleManager.js';
import {  addEdge } from '../graph/edgeManager.js';
import { NodelabelToHashMapping, EdgelabelToHashMapping, HashToNodelabelMapping, HashToEdgelabelMapping,
    hashToNodeIDMapping, hashToEdgeIDMapping, NodeIDTohashMapping, EdgeIDTohashMapping, imageModeEnabled, setImageMode, getImageMode} from '../state.js';  
import { initializeAutocomplete, closeAutocomplete, showAutocomplete } from '../autocomplete/autocomplete.js'
import { getFormValues } from '../utils/formUtils.js'; // Assume this extracts form utilities into a separate module.
import { displayNodeDetails } from './nodeUIHandlers.js';
import {toggleImageMode} from './graphViewControls.js';
import { start } from '../executionClass/start.js'; // Update the path accordingly

// uiControls.js


export function populateSelectList(selectList, apiEndpoints) {
    apiEndpoints.forEach(endpoint => {
        var option = document.createElement("option");
        option.value = endpoint.url; // Assuming you want to use the URL as the value
        option.text = endpoint.name; // The text you see in the dropdown
        selectList.appendChild(option); // Adds the option to the select list
    });
}

export function initializeUI(apiEndpoints) {
    // Check if the selectList already exists to avoid duplicates
    let selectList = document.getElementById("apiSelect");
    if (selectList) {
        populateSelectList(selectList, apiEndpoints);
    }
}


export const initializeUIControls = (cy) => {
    document.getElementById('selectMode').addEventListener('click', () => {
        let currentMode = "select";
        toggleSelectionBox();
        switchMode(currentMode);
    });

    document.getElementById('addNodeMode').addEventListener('click', () => {
        let currentMode = "addNode";
        switchMode(currentMode);
    });

    document.getElementById('addEdgeMode').addEventListener('click', () => {
        let currentMode = "addEdge";
        toggleDrawEdge();

          // Toggle the 'inverted-img' class on the image
        const img = document.querySelector('#addEdgeMode img');
        img.classList.toggle('inverted-img');
    });

    document.getElementById('filterByArticleMode').addEventListener('click', () => {
        let currentMode = 'filterByArticle';
        switchMode(currentMode);
    });

  
    document.getElementById('toggleSearchControlsBtn').addEventListener('click', () => {
        const searchControls = document.getElementById('searchControls');
        searchControls.style.display = searchControls.style.display === 'none' ? 'block' : 'none';
    });

	
	document.getElementById('toggleAPIFeaturesBtn').addEventListener('click', function() {
        const apiFeatures = document.getElementById('apiFeatures');
        apiFeatures.style.display = apiFeatures.style.display === 'none' ? 'block' : 'none';
    });
    
        document.getElementById('togglePrivacyLevelFeaturesBtn').addEventListener('click', function() {
            const privacyFeatures = document.getElementById('privacyLevelFeatures');
            privacyFeatures.style.display = privacyFeatures.style.display === 'none' ? 'block' : 'none';
        });
    
        document.getElementById('toggleUrlFeaturesBtn').addEventListener('click', function() {
            const urlFeatures = document.getElementById('urlFeatures');
            urlFeatures.style.display = urlFeatures.style.display === 'none' ? 'block' : 'none';
        });
    
        document.getElementById('toggleTypeFeaturesBtn').addEventListener('click', function() {
            const typeFeatures = document.getElementById('typeFeatures');
            typeFeatures.style.display = typeFeatures.style.display === 'none' ? 'block' : 'none';
        });
        
    
    
    
        document.getElementById('toggleUserIdFeaturesBtn').addEventListener('click', function() {
            const userIdFeatures = document.getElementById('userIdFeatures');
            userIdFeatures.style.display = userIdFeatures.style.display === 'none' ? 'block' : 'none';
        });
        
        // Toggle Preprocessing Logic Features
        document.getElementById('togglePreprocessingFeaturesBtn').addEventListener('click', () => {
            togglePreprocessingInputs();
        });

        // Toggle Post-processing Logic Features
        document.getElementById('togglePostprocessingFeaturesBtn').addEventListener('click', () => {
            togglePostprocessingInputs();
        });

        document.getElementById('startProcessingBtn').addEventListener('click', () => {
            start();
        });
        
        // Toggle API Endpoint Features
        document.getElementById('toggleApiEndpointFeaturesBtn').addEventListener('click', () => {
            toggleApiEndpointInputs();
        });

        



    document.getElementById('executeSearchBtn').addEventListener('click', () => executeSearch(cy));

    document.getElementById('toggleImageModeBtn').addEventListener('click', () => {
        toggleImageMode(cy);
    });
	
	 // Toggle Node Inputs
    document.getElementById('toggleNodeInputsBtn').addEventListener('click', () => {
        toggleNodeInputs();
    });

    // Toggle Edge Inputs
    document.getElementById('toggleEdgeInputsBtn').addEventListener('click', () => {
        toggleEdgeInputs();
    });
      // Implement the toggleArticleInputs function
    document.getElementById('toggleArticleInputsBtn').addEventListener('click', () => {
        toggleArticleInputs();
    });

    // Add other UI control initializations here...
};

// Toggle Node Inputs Visibility
const toggleNodeInputs = () => {
    const nodeControls = document.getElementById("nodeControls");
    nodeControls.style.display = nodeControls.style.display === "none" ? "block" : "none";
};

// Toggle Edge Inputs Visibility
const toggleEdgeInputs = () => {
    const edgeControls = document.getElementById("edgeControls");
    edgeControls.style.display = edgeControls.style.display === "none" ? "block" : "none";
};

const toggleArticleInputs = () => {
    const articleControls = document.getElementById("articleControls");
    articleControls.style.display = articleControls.style.display === "none" ? "block" : "none";
};

// Toggle Preprocessing Logic Inputs Visibility
const togglePreprocessingInputs = () => {
    const preprocessingFeatures = document.getElementById("preprocessingFeatures");
    preprocessingFeatures.style.display = preprocessingFeatures.style.display === "none" ? "block" : "none";
};

// Toggle Post-processing Logic Inputs Visibility
const togglePostprocessingInputs = () => {
    const postprocessingFeatures = document.getElementById("postprocessingFeatures");
    postprocessingFeatures.style.display = postprocessingFeatures.style.display === "none" ? "block" : "none";
};

// Toggle API Endpoint Inputs Visibility
const toggleApiEndpointInputs = () => {
    const apiEndpointFeatures = document.getElementById("apiEndpointFeatures");
    apiEndpointFeatures.style.display = apiEndpointFeatures.style.display === "none" ? "block" : "none";
};



const executeSearch = (cy) => {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const searchNodes = document.getElementById('searchNodesCheckbox').checked;
    const searchEdges = document.getElementById('searchEdgesCheckbox').checked;

    // Reset styles for all elements
    cy.elements().style({
        'background-color': '',
        'line-color': '',
        'display': 'element'
    });

    if (searchTerm) {
        cy.elements().style('display', 'none');

        if (searchNodes) {
            cy.nodes().forEach(node => {
                const nodeLabel = node.data('label').toLowerCase();
                if (nodeLabel.includes(searchTerm)) {
                    node.style({
                        'display': 'element',
                        'background-color': '#FFD700'
                    });
                }
            });
        }

        if (searchEdges) {
            cy.edges().forEach(edge => {
                const edgeDescription = edge.data('description').toLowerCase();
                if (edgeDescription.includes(searchTerm)) {
                    edge.style({
                        'display': 'element',
                        'line-color': '#FF69B4'
                    });
                    edge.connectedNodes().style({
                        'display': 'element',
                        'background-color': '#FFD700'
                    });
                }
            });
        }
    } else {
        cy.elements().style('display', 'element');
    }

    cy.layout({
        name: 'cose',
        animate: false,
        animationDuration: 50,
    }).run();
};
