import { updateNodeOrArticle } from './nodeArticleManager.js';
import { addEdge } from './edgeManager.js';
import { displayNodeDetails } from '../ui/nodeUIHandlers.js';
import { displayEdgeDetails } from '../ui/edgeUIHandler.js';
import { getCy, getEh, eh, NodeIDTohashMapping, EdgeIDTohashMapping } from '../state.js';
import { currentMode, tempSourceNode, resetTempSourceNode, drawEdgeMode } from '../state.js';
import { showNodePreview } from '../utils/nodePreviewHandler.js';
import { addNodeOrArticle } from './nodeArticleManager.js';
import { getFormValues } from '../utils/formUtils.js';
import { toggleSelectionBox } from '../state.js';
export function setupGraphEventListeners() {
    const cy = getCy();
    // Node tap event
    cy.on('tap', 'node', function(evt) {
        if (currentMode === 'select') {
            var node = evt.target;
            displayNodeDetails(node);
        } else if (drawEdgeMode && !tempSourceNode) {
            tempSourceNode = evt.target;
            eh.start(cy.$('node:selected'));
        } else if (currentMode === 'filterByArticle' && evt.target.data('isArticle')) {
            // Filtering logic for articles
            filterByArticle(evt.target);
        } else if (tempSourceNode) {
            // Prompt for edge details and add edge
            createEdgeBetweenNodes(tempSourceNode, evt.target);
        }
    });

    // Edge tap event
    cy.on('tap', 'edge', function(evt) {
        if (currentMode === 'select') {
            var edge = evt.target;
            displayEdgeDetails(edge);
        }
    });

    

    // Hide the sidebar when clicking on the background
    cy.on('tap', function(evt) {
        //console.log(currentMode);

        if (evt.target === cy) {
            
          if (currentMode === 'addNode') {
            showNodePreview(cy, evt.position, (label, position) => {
              addNodeOrArticle({
                nodeLabel: label,
                position: position,
                // Add other necessary parameters
              }, false);
            });
          }//else if (currentMode === 'select'){
           // toggleSelectionBox();}
           else {
            document.getElementById('detailsSidebar').style.display = 'none';
          }
        }
      }
);
}

export function setupGraphElementRemoval() {


    document.getElementById('removeNodeBtn').addEventListener('click', function() {
        var nodelabel = document.getElementById('remove-node-id').value.trim();
        var nodeId = NodelabelToHashMapping[nodelabel];
        if (nodeId) {
            var node = cy.getElementById(nodeId);
            if (node) {
                node.remove();
                console.log(`Node ${nodeId} removed successfully.`);
            } else {
                console.log(`Node ${nodeId} not found.`);
            }
        }
    });

    document.getElementById('removeEdgeBtn').addEventListener('click', function() {
        var description = document.getElementById('remove-edge-description').value.trim();
        var edgeId = EdgelabelToHashMapping[description];
        cy.edges().forEach(function(edge) {
            if (edge.data('description') === description) {
                edge.remove();
                console.log(`Edge with description '${description}' removed successfully.`);
            }
        });
    });
}

export function setupGraphControls() {
    const cy = getCy();
    

    
document.getElementById('addToGraphBtn').addEventListener('click', async function() {

	const formValues = getFormValues();
    const graphLines = formValues.resultsBox;

	let nodeMapping = [];
    let edgeMapping = [];
    let articleLabel;
	let sourceId;
    let targetId;
	// Add the article node after processing all lines
     if (formValues.articleTitle && formValues.apiInputContent) {
        articleLabel = await addNodeOrArticle({
            nodeLabel: formValues.articleTitle,
            description: formValues.apiInputContent,
            hashtags: formValues.hashtags,
            userId: formValues.userId,
            typesInput: formValues.typesInput,
            url: formValues.url,
            privacyLevel: formValues.privacyLevel
        }, true);
    }
    console.log(articleLabel);
	
    for (const line of graphLines) {
        const match = line.match(/^\s*(.*?)\s*->\s*\((.*?)\)\s*->\s*(.*?)\s*$/);
        if (match) {
            const [, source, description, target] = match.map(str => str.trim());

            if (!nodeMapping.includes(source)) nodeMapping.push(source);
            if (!nodeMapping.includes(target)) nodeMapping.push(target);
            if (!edgeMapping.includes(description)) edgeMapping.push(description);

            sourceId = await addNodeOrArticle({
                nodeLabel: source,
                userId: formValues.userId,
                typesInput: formValues.typesInput,
                url: formValues.url,
                privacyLevel: formValues.privacyLevel,
                articleMapping: [articleLabel],
            }, false);

            targetId = await addNodeOrArticle({
                nodeLabel: target,
                userId: formValues.userId,
                typesInput: formValues.typesInput,
                url: formValues.url,
                privacyLevel: formValues.privacyLevel,
                articleMapping: [articleLabel],
            }, false);

            await addEdge({
                sourceLabel: source,
                targetLabel: target,
                description: description,
                userId: formValues.userId,
                typesInput: formValues.typesInput,
                privacyLevel: formValues.privacyLevel,
                articleMapping: [articleLabel],
            });
        }
    }
    
	
	 // Step 3: Update the article with node and edge mappings
    if (articleLabel) {
        console.log("jjjjj");
        await updateNodeOrArticle(articleLabel, {
            nodeMapping: nodeMapping,
            edgeMapping: edgeMapping
        });
    }
	
});

}


function filterByArticle(node) {
    const cy = getCy();
    console.log("Article node tapped:", node.data());
    var nodeMapping = node.data('nodeMapping') || [];
    var edgeMapping = node.data('edgeMapping') || [];

    console.log("Node Mapping IDs:", nodeMapping);
    console.log("Edge Mapping IDs:", edgeMapping);

    cy.elements().style('display', 'none');

    nodeMapping.forEach(nodeId => {
        cy.getElementById(NodeIDTohashMapping[nodeId]).style('display', 'element');
    });

    edgeMapping.forEach(edgeId => {
        cy.getElementById(EdgeIDTohashMapping[edgeId]).style('display', 'element');
    });

    node.style('display', 'element');
}

function createEdgeBetweenNodes(sourceNode, targetNode) {
    const edgeDescription = prompt('Enter edge description:');
    if (edgeDescription) {
        addEdge(sourceNode.id(), targetNode.id(), edgeDescription);
        resetTempSourceNode();
    }
}

