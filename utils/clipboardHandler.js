// Path: /utils/clipboardHandler.js
import { HashToNodelabelMapping, NodelabelToHashMapping, cy, selectedElements, updateSelectElements} from '../state.js';
import { addNodeOrArticle} from '../graph/nodeArticleManager.js'; // Update the path as needed
import { addEdge } from '../graph/edgeManager.js'; // Update the path as needed
import { highlightElements } from '../utils/boxSelectionPreviewHandler.js'; // Ensure the path is correct
import { updateContinuousSelectionBox } from '../ui/boxSelectionDrawingHandlers.js'; // Ensure the path is correct

export let clipboardContent = { type: null, data: null };
let pasteCount = 0; // Initialize paste count
export function resetclipboardContent(){
    clipboardContent.type = null;
    clipboardContent.data = null;
}
export function copySelectedElements() {

    if (selectedElements.length === 0) {
        console.log('No elements selected to copy.');
        return;
    }

    const nodesData = selectedElements.nodes().map(node => ({
        group: 'nodes',
        data: {
            ...node.data(),
             id: undefined,
             title: node.data('title') || node.data('label') // Exclude 'id', use 'title' as 'label'
             //types: node.data('types')? node.data('types').split(',') : [], // Split types into an array

           },
        position: node.position()
    }));
    const edgesData = selectedElements.edges().map(edge => ({
        group: 'edges',
        data: edge.data()
    }));

    console.log(nodesData);
    clipboardContent = {
        type: 'elements',
        data: { nodes: nodesData, edges: edgesData }
    };

    console.log('Elements copied to clipboard:', clipboardContent);
}

export function copyImage(url) {
    clipboardContent = {
        type: 'image',
        data: url
    };
    console.log('Image URL copied to clipboard:', clipboardContent);
}

export function copyText(text) {
    clipboardContent = {
        type: 'text',
        data: text
    };
    console.log('Text copied to clipboard:', clipboardContent);
}


export async function pasteContent() {
    if (!clipboardContent || clipboardContent.type === null) {
        console.log('Clipboard is empty or contains unrecognized content.');
        return;
    }
    
    if (clipboardContent.type === 'image') {
        console.log('Pasting image URL:', clipboardContent.data);
    } else if (clipboardContent.type === 'elements' && clipboardContent.data) {
        const { nodes, edges } = clipboardContent.data;
        const positionShift = { x: 20 + (20 * pasteCount), y: 20 + (20 * pasteCount) };
        let newlyAddedElements = cy.collection(); // Use cy.collection() to gather new elements
        let nodeLabelMapping = {}; // Map of original labels to new labels
        for (const node of nodes) {
            const newPosition = { x: node.position.x + positionShift.x, y: node.position.y + positionShift.y };
            console.log(node.data);
            const newLabel = await addNodeOrArticle({ ...node.data, position: newPosition }, false);
            if (newLabel) {
                newlyAddedElements = newlyAddedElements.union(cy.elements(`[label="${newLabel}"]`));
                nodeLabelMapping[node.data.label] = newLabel; // Store the mapping of original to new label
            }
        }
        console.log(nodeLabelMapping);
        let labelCounter = 1; // Initialize outside the loop if you want a global counter, or inside the loop for individual counters per edge

        for (const edge of edges) {
            const { source, target, ...edgeDataWithoutSourceTarget } = edge.data;
            let sourceLabel = HashToNodelabelMapping[edge.data.source];
            let targetLabel = HashToNodelabelMapping[edge.data.target];

            // Increment labelCounter if necessary to find available labels
            while (NodelabelToHashMapping[`${sourceLabel}_${labelCounter}`] || NodelabelToHashMapping[`${targetLabel}_${labelCounter}`]) {
                labelCounter++;
            }

    
            sourceLabel = `${sourceLabel}_${labelCounter-1}`;
            targetLabel = `${targetLabel}_${labelCounter-1}`;
            let modifiedDescription = `${edgeDataWithoutSourceTarget.description}_${labelCounter-1}`;

            console.log(sourceLabel);
            console.log(targetLabel);
            console.log(modifiedDescription);

                // Prepare the updated edge data with the modified labels and description
            const updatedEdgeData = {
                ...edgeDataWithoutSourceTarget,
                sourceLabel: sourceLabel,
                targetLabel: targetLabel,
                description: modifiedDescription, // Update description with modified label
            };

            // Add the edge with the updated data, and handle the new description
            const newDescription = await addEdge(updatedEdgeData);
            if (newDescription) {
                newlyAddedElements = newlyAddedElements.union(cy.elements(`[description="${newDescription}"]`));
            }
        }

        if (!newlyAddedElements.empty()) {
            // Reset styles for previously selected elements
            selectedElements.forEach(ele => ele.removeClass('highlighted')); // Assuming 'highlighted' is a class that styles selected elements
            
            // Update and highlight newly added elements
            updateSelectElements(newlyAddedElements);
            updateContinuousSelectionBox(); 
            highlightElements(cy, newlyAddedElements);
        }
        incrementPasteShift();
    } else {
        console.log('Clipboard is empty or contains unrecognized content.');
    }
}
export function resetPasteShift() {
    pasteCount = 0; // Reset the paste count to zero
}

export function incrementPasteShift() {
    pasteCount++; // Reset the paste count to zero
}