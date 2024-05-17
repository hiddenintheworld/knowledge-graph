import { addNodeOrArticle, updateNodeOrArticle } from '../graph/nodeArticleManager.js';
import { getFormValues } from '../utils/formUtils.js'; // Assume this extracts form utilities into a separate module.
import { NodelabelToHashMapping, EdgelabelToHashMapping, HashToNodelabelMapping, HashToEdgelabelMapping,
    hashToNodeIDMapping, hashToEdgeIDMapping, NodeIDTohashMapping, EdgeIDTohashMapping} from '../state.js';
import {initializeAutocomplete, showAutocomplete, closeAutocomplete} from '../autocomplete/autocomplete.js';
import { getMappingDisplay } from '../graph/graphMapping.js';
import {simpleMdeEditors } from '../state.js';  
export function createDetailGroup(label, inputHtml) {
    return `<div class="detail-group">
                <strong>${label}:</strong>
                <div class="detail-input">${inputHtml}</div>
            </div>`;
}


export function setupArticleAddition() {
    document.getElementById('addArticleBtn').addEventListener('click', async function() {
        const formValues = getFormValues();

        try {
            await addNodeOrArticle({
                nodeLabel: formValues.articleTitle,
                description: formValues.articleDescription,
                hashtags: formValues.hashtags,
                userId: formValues.userId,
                typesInput: formValues.typesInput,
                url: formValues.url,
                privacyLevel: formValues.privacyLevel,
                preprocessingLogic: formValues.preprocessingLogic,
                postprocessingLogic: formValues.postprocessingLogic,
                apiEndpoint: formValues.apiEndpoint
            }, true); // The second parameter is true because it's an article
            console.log("Article added successfully.");
        } catch (error) {
            console.error("Error adding article:", error);
        }
    });
}

export function setupNodeAddition() {
    document.getElementById('addNodeBtn').addEventListener('click', async function() {
        const formValues = getFormValues();

        try {
            await addNodeOrArticle({
                nodeLabel: formValues.nodeLabel,
                userId: formValues.userId,
                typesInput: formValues.typesInput,
                url: formValues.url,
                privacyLevel: formValues.privacyLevel,
                preprocessingLogic: formValues.preprocessingLogic,
                postprocessingLogic: formValues.postprocessingLogic,
                apiEndpoint: formValues.apiEndpoint
            }, false);
            console.log("Node added successfully.");
        } catch (error) {
            console.error("Error adding node:", error);
        }
    });
}
// Function to display node details in the sidebar
export function displayNodeDetails(node) {
    var nodeData = node.data();
    var detailsHtml = `<form id="nodeDetailsForm" class="detail-form">`;
  
    // Generate the HTML for each detail group

    // Add new detail groups for preprocessingLogic, postprocessingLogic, and apiEndpoint
    // Include placeholders for CodeMirror editors instead of plain inputs

    detailsHtml += createDetailGroup('Preprocessing Logic', `<button type="button" id="togglePreprocessingEditor">Edit</button><div id="preprocessingLogicContainer" style="display: none;"><textarea id="preprocessingLogicEditor">${nodeData.preprocessingLogic || ''}</textarea></div>`);
    detailsHtml += createDetailGroup('API Call Logic', `<button type="button" id="toggleApiCallLogicEditor">Edit</button><div id="apiCallLogicContainer" style="display: none;"><textarea id="apiCallLogicEditor">${nodeData.apiCallLogic || ''}</textarea></div>`);
    detailsHtml += createDetailGroup('Post-processing Logic', `<button type="button" id="togglePostprocessingEditor">Edit</button><div id="postprocessingLogicContainer" style="display: none;"><textarea id="postprocessingLogicEditor">${nodeData.postprocessingLogic || ''}</textarea></div>`);
    detailsHtml += createDetailGroup('API Endpoint', `<button type="button" id="toggleApiEndpointEditor">Edit</button><div id="apiEndpointContainer" style="display: none;"><textarea id="apiEndpointEditor">${nodeData.apiEndpoint || ''}</textarea></div>`);
    
    detailsHtml += createDetailGroup('Label', `<input type="text" name="label" value="${nodeData.label || ''}">`);
    detailsHtml += createDetailGroup('URL', `<input type="text" name="url" value="${nodeData.url || ''}">`);
    detailsHtml += createDetailGroup('Types', `<input type="text" name="types" value="${(nodeData.types || []).join(', ')}">`);
    detailsHtml += createDetailGroup('Privacy Level', `<input type="text" name="privacyLevel" value="${nodeData.privacyLevel || ''}">`);
    detailsHtml += createDetailGroup('Description', `<textarea name="description" id="nodeDescription">${nodeData.description || ''}</textarea>`);
    detailsHtml += createDetailGroup('Hashtags', `<input type="text" name="hashtags" value="${nodeData.hashtags || ''}">`);
    detailsHtml += createDetailGroup('UserId', `<input type="text" name="userId" value="${nodeData.userId || ''}">`);
    detailsHtml += createDetailGroup('Article Mapping', `<input type="text" name="articleMapping" value="${getMappingDisplay(nodeData.articleMapping, NodeIDTohashMapping, HashToNodelabelMapping)}">`);
    detailsHtml += createDetailGroup('Node Mapping', `<input type="text" name="nodeMapping" value="${getMappingDisplay(nodeData.nodeMapping, NodeIDTohashMapping, HashToNodelabelMapping)}">`);
    detailsHtml += createDetailGroup('Edge Mapping', `<input type="text" name="edgeMapping" value="${getMappingDisplay(nodeData.edgeMapping, EdgeIDTohashMapping, HashToEdgelabelMapping)}">`);
  
    detailsHtml += `<button type="submit" class="btn-save">Save Changes</button>`;
    detailsHtml += `</form>`;
    
    document.getElementById('nodeDetailsContent').innerHTML = detailsHtml;

       // Bind event listeners to the buttons after the detailsHtml is injected
    document.getElementById('togglePreprocessingEditor').addEventListener('click', function() {
        toggleEditorVisibility('preprocessingLogicContainer', simpleMdeEditors.preprocessingEditor);
    });

    document.getElementById('toggleApiCallLogicEditor').addEventListener('click', function() {
        toggleEditorVisibility('apiCallLogicContainer', simpleMdeEditors.apiCallLogicEditor);
    });

    document.getElementById('togglePostprocessingEditor').addEventListener('click', function() {
        toggleEditorVisibility('postprocessingLogicContainer', simpleMdeEditors.postprocessingEditor);
    });

    document.getElementById('toggleApiEndpointEditor').addEventListener('click', function() {
        toggleEditorVisibility('apiEndpointContainer', simpleMdeEditors.apiEndpointEditor);
    });

    // Initialize CodeMirror instances inside the containers that are initially hidden
    simpleMdeEditors.preprocessingEditor = CodeMirror.fromTextArea(document.getElementById('preprocessingLogicEditor'), {
        lineNumbers: true,
        mode: "javascript"
    });

    simpleMdeEditors.apiCallLogicEditor = CodeMirror.fromTextArea(document.getElementById('apiCallLogicEditor'), {
        lineNumbers: true,
        mode: "text/plain"
    });

    simpleMdeEditors.postprocessingEditor = CodeMirror.fromTextArea(document.getElementById('postprocessingLogicEditor'), {
        lineNumbers: true,
        mode: "javascript"
    });

    simpleMdeEditors.apiEndpointEditor = CodeMirror.fromTextArea(document.getElementById('apiEndpointEditor'), {
        lineNumbers: true,
        mode: "text/plain"
    });
    
    document.getElementById('detailsSidebar').style.display = 'block';



    // Initialize SimpleMDE for the description
    var simplemde = new SimpleMDE({ element: document.getElementById("nodeDescription") });
  
      simplemde.codemirror.on('inputRead', (cm, change) => {
          if (change.text.length === 1 && change.text[0] === '[') {
              cm.replaceSelection('[]', 'end');
              cm.setCursor(cm.getCursor().line, cm.getCursor().ch - 1);
              initializeAutocomplete(simplemde);
          }
      });
  
      simplemde.codemirror.on('change', (cm) => {
      const cursor = cm.getCursor();
      const line = cm.getLine(cursor.line);
      const start = line.lastIndexOf('[', cursor.ch);
      const end = line.indexOf(']', start) > -1 ? line.indexOf(']', start) : cursor.ch;
      const currentWord = line.substring(start + 1, end);
  
      if (start !== -1 && end !== -1 && start < end) {
          console.log(currentWord);
          showAutocomplete(cm, currentWord);
      } else {
          closeAutocomplete();
      }
  });
  
  
        simplemde.codemirror.on('keypress', (cm, event) => {
          if (event.key === '[') {
            event.preventDefault();
            cm.replaceSelection('[]');
            var cursorPos = cm.getCursor();
            cm.setCursor({ line: cursorPos.line, ch: cursorPos.ch - 1 });
          }
        });
  
    // Call the initializeAutocomplete function when the editor is ready
    simplemde.codemirror.on('refresh', function() {
      initializeAutocomplete(simplemde);
    });
  
  
    document.getElementById('nodeDetailsForm').onsubmit = function(e) {
      e.preventDefault();
      updateNodeDetails(node, simplemde.value());
    };
  }

export function updateNodeDetails(node) {
    var formData = new FormData(document.getElementById('nodeDetailsForm'));

    // Extract the updated values from the form
    var updatedLabel = formData.get('label');
    var updatedURL = formData.get('url');
    var updatedTypes = formData.get('types').split(',').map(type => type.trim());
    var updatedPrivacyLevel = formData.get('privacyLevel');
    var updatedDescription = formData.get('description');
    var updatedHashtags = formData.get('hashtags');
    var updatedUserId = formData.get('userId');

   // Extract the content directly from CodeMirror instances stored in simpleMdeEditors
   var updatedPreprocessingLogic = simpleMdeEditors.preprocessingEditor.getValue();
   var updatedapiCallLogic = simpleMdeEditors.apiCallLogicEditor.getValue();
   var updatedPostprocessingLogic = simpleMdeEditors.postprocessingEditor.getValue();
   var updatedApiEndpoint = simpleMdeEditors.apiEndpointEditor.getValue();

	
	var updatedArticleMappingIds = formData.get('articleMapping').split(',').map(label => {
    // Convert updatedArticleMapping labels back to node IDs
		   // Convert each label to its corresponding node ID
        console.log(label);
        let hashKey = NodelabelToHashMapping[label.trim()];
        console.log(hashToNodeIDMapping[hashKey]);
        return hashToNodeIDMapping[hashKey] !== undefined ? hashToNodeIDMapping[hashKey] : label;
    });
	console.log("updated articleid",updatedArticleMappingIds);

	var updatedNodeMapping = formData.get('nodeMapping').split(',').map(label => {
        // Convert each label to its corresponding node ID
        let hashKey = NodelabelToHashMapping[label.trim()];

        return hashToNodeIDMapping[hashKey] !== undefined ? hashToNodeIDMapping[hashKey] : label;
    });
	//console.log(updatedNodeMapping);
	

	
	var updatedEdgeMapping = formData.get('edgeMapping').split(',').map(label => {
        // Convert each label to its corresponding node ID
        let hashKey = EdgelabelToHashMapping[label.trim()];

        return hashToEdgeIDMapping[hashKey] !== undefined ? hashToEdgeIDMapping[hashKey] : label;
    });
	
    // Update the node's data with the new values
    node.data({
        'label': updatedLabel,
        'url': updatedURL,
        'types': updatedTypes,
        'privacyLevel': updatedPrivacyLevel,
        'description': updatedDescription,
        'hashtags': updatedHashtags,
        'userId': updatedUserId,
		'nodeMapping': updatedNodeMapping,
		'edgeMapping': updatedEdgeMapping,
		'articleMapping': updatedArticleMappingIds,
        'preprocessingLogic': updatedPreprocessingLogic,
        'apiCallLogic': updatedapiCallLogic,
        'postprocessingLogic': updatedPostprocessingLogic,
        'apiEndpoint': updatedApiEndpoint,
    });

    document.getElementById('detailsSidebar').style.display = 'none'; // Hide sidebar
    console.log(`Node ${node.id()} updated successfully.`);
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