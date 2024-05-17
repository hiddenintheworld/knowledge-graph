// edgeUIHandlers.js
import { addEdge } from '../graph/edgeManager.js'; // Assumes separate edge management logic
import { getFormValues } from '../utils/formUtils.js'; // Utilize form utilities from a separate module.
import { NodelabelToHashMapping, EdgelabelToHashMapping, HashToNodelabelMapping, HashToEdgelabelMapping,
    hashToNodeIDMapping, hashToEdgeIDMapping, NodeIDTohashMapping, EdgeIDTohashMapping} from '../state.js'; 
import {initializeAutocomplete, showAutocomplete, closeAutocomplete} from '../autocomplete/autocomplete.js';
import { getMappingDisplay } from '../graph/graphMapping.js';
import {simpleMdeEditors } from '../state.js';  
// Utilize a shared utility function to create form groups for display and input
export function createDetailGroup(label, inputHtml) {
    return `<div class="detail-group"><strong>${label}:</strong><div class="detail-input">${inputHtml}</div></div>`;
}

// Function to set up event listener for edge addition
export function setupEdgeAddition() {
    document.getElementById('addEdgeBtn').addEventListener('click', async function() {
        const formValues = getFormValues();
        try {
            await addEdge({
                sourceLabel: formValues.sourceLabel,
                targetLabel: formValues.targetLabel,
                description: formValues.description,
                userId: formValues.userId,
                typesInput: formValues.typesInput,
                privacyLevel: formValues.privacyLevel,
                manipulationLogic: formValues.manipulationLogic
            });
            console.log("Edge added successfully.");
        } catch (error) {
            console.error("Error adding edge:", error);
        }
    });
}

export function displayEdgeDetails(edge) {
    // Initialize the HTML content for the edge details form
    let detailsHtml = `<form id="edgeDetailsForm" data-edge-id="${edge.id()}">`;

    // Manipulation Logic Editor
    detailsHtml += createDetailGroup('Manipulation Logic', `<button type="button" id="toggleManipulationEditor">Edit</button><div id="manipulationLogicContainer" style="display: none;"><textarea id="manipulationLogicEditor">${edge.data('manipulationLogic') || ''}</textarea></div>`);
    // Custom Activation Logic Editor
    detailsHtml += createDetailGroup('Custom Activation Logic', `<button type="button" id="toggleActivationEditor">Edit</button><div id="activationLogicContainer" style="display: none;"><textarea id="activationLogicEditor">${edge.data('activationLogic') || ''}</textarea></div>`);

    // Generate editable fields for each attribute
    detailsHtml += `<strong>Description:</strong> <input type="text" name="description" value="${edge.data('description') || ''}"><br>`;
    detailsHtml += `<strong>Privacy Level:</strong> <input type="text" name="privacyLevel" value="${edge.data('privacyLevel') || ''}"><br>`;

    // Article Mapping field - utilizing getMappingDisplay for consistency
    detailsHtml += createDetailGroup('Article Mapping', `<input type="text" name="articleMapping" value="${getMappingDisplay(edge.data('articleMapping'), NodeIDTohashMapping, HashToNodelabelMapping)}">`);


    // Include UserId if available
    if (edge.data('userId')) {
        detailsHtml += `<br><strong>UserId:</strong> <input type="text" name="userId" value="${edge.data('userId') || ''}"><br>`;
    }

    // Include Type if available
    if (edge.data('type')) {
        detailsHtml += `<br><strong>Type:</strong> <input type="text" name="type" value="${edge.data('type') || ''}"><br>`;
    }

    // Close the form and add a submit button
    detailsHtml += `<button type="submit">Save Changes</button>`;
    detailsHtml += `</form>`;

    // Inject the form into the page
    document.getElementById('nodeDetailsContent').innerHTML = detailsHtml;

    // Setup toggle functionality
    document.getElementById('toggleManipulationEditor').addEventListener('click', function() {
        toggleEditorVisibility('manipulationLogicContainer', simpleMdeEditors.manipulationEditor);
    });

   // Later in the function, after injecting the detailsHtml into the DOM, initialize the editor for activation logic
    document.getElementById('toggleActivationEditor').addEventListener('click', function() {
        toggleEditorVisibility('activationLogicContainer', simpleMdeEditors.activationEditor);
    });

     // Now initialize the editor after the detailsHtml has been added to the DOM
     simpleMdeEditors.manipulationEditor = new CodeMirror.fromTextArea(document.getElementById('manipulationLogicEditor'), {
        lineNumbers: true,
        mode: "javascript"
    });

    // Initialize the editor for activation logic
    simpleMdeEditors.activationEditor = new CodeMirror.fromTextArea(document.getElementById('activationLogicEditor'), {
        lineNumbers: true,
        mode: "javascript"
    });
    
    document.getElementById('detailsSidebar').style.display = 'block'; // Show the sidebar

    // Set up form submission handler to update edge details
    document.getElementById('edgeDetailsForm').addEventListener('submit', function(e) {
        e.preventDefault();
        // Retrieve the edge ID stored in the form's data-edge-id attribute
        updateEdgeDetails(edge);
    });
}



export function updateEdgeDetails(edge) {
    // Ensure the form's data is captured correctly
    var formData = new FormData(document.getElementById('edgeDetailsForm'));

    // Extract the updated values from the form
    var updatedDescription = formData.get('description');
    var updatedPrivacyLevel = formData.get('privacyLevel');
    // Extract the updated values from the form
    var updatedManipulationLogic = simpleMdeEditors.manipulationEditor.getValue();
    // Extract the updated values from the form for activation logic
    var updatedActivationLogic = simpleMdeEditors.activationEditor.getValue();

    // Convert updatedArticleMapping labels back to node IDs for articleMapping
    var updatedArticleMappingIds = formData.get('articleMapping').split(',').map(label => {
        // Convert updatedArticleMapping labels back to node IDs
               // Convert each label to its corresponding node ID
            
            let hashKey = NodelabelToHashMapping[label.trim()];
            console.log(hashToNodeIDMapping[hashKey]);
            return hashToNodeIDMapping[hashKey] !== undefined ? hashToNodeIDMapping[hashKey] : label;
        });

	
    // Update the edge's data with the new values
    edge.data({
        'description': updatedDescription,
        'privacyLevel': updatedPrivacyLevel,
        'articleMapping': updatedArticleMappingIds,
        'manipulationLogic': updatedManipulationLogic,
        'activationLogic': updatedActivationLogic,  // Save the activation logic
    });

    // Add other attributes as necessary, following the pattern above

    // Optionally: If your application uses additional visual cues or styles based on these attributes,
    // you may need to trigger a re-render or apply specific styles to this edge. For example:
    // edge.style({ 'line-color': determineLineColor(updatedPrivacyLevel) });

    // Close the details sidebar to show the update is complete
    document.getElementById('detailsSidebar').style.display = 'none';

    // If your graph visualization relies on layout recalculations or specific positioning,
    // you might want to trigger a layout update or refresh here. For example:
    // cy.layout({ name: 'preset' }).run(); // Or any other layout you're using

    // Console log or some form of notification to confirm the edge has been updated
    console.log(`Edge ${edge.id()} updated successfully.`);
}

function toggleEditorVisibility(containerId, editor) {
    // Get the container of the CodeMirror editor
    let container = document.getElementById(containerId);

    // Toggle the visibility
    if (container.style.display === "none") {
        container.style.display = "";
        editor.refresh();  // Refresh editor to ensure proper display
    } else {
        container.style.display = "none";
    }
}