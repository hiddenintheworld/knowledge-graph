import { addEdge } from "../graph/edgeManager.js";
import { getCy, getEh, cy, currentMousePosition, cyRenderedPosition } from "../state.js";
import { showEdgePreview } from '../utils/edgePreviewHandler.js';

// edgeDrawingHandler.js
export async function initializeEdgeDrawingHandler() {
  

  const eh = getEh();
  let isDragging = false;
  let sourceNode = null;
  let targetNode = null;
  
  // Event listener for 'tapstart' on nodes
  cy.on('tapstart', 'node', function(e) {
    // Mark the drag start and store the source node
    isDragging = true;
    sourceNode = e.target;
    console.log('Tap and hold started on node:', sourceNode.id());
  });
  

  // Remove tapend event listener to rely solely on the mouseup event
  //cy.off('tapend');

  cy.on('ehstop', async function(event){
   


    if (event.position) {
      console.log(`Position - x: ${event.position.x}, y: ${event.position.y}`);
    } else {
      console.log('Position object is undefined');
    }
  if (isDragging && sourceNode) {
    //getMousePosition(event);
    //console.log(cyRenderedPosition);
    // Convert the mouseup position to the Cytoscape.js graph's coordinate system
    //let pos = cy.renderer().projectIntoViewport(cyRenderedPosition.x, cyRenderedPosition.y);
    //console.log(pos);
    let renderedPosition = { x: event.position.x, y: event.position.y };
    console.log(renderedPosition);
    cy.nodes().forEach((node) => {
      let position = node.position();
      console.log(`Node ${node.id()} is at position x: ${position.x}, y: ${position.y}`);
    });

    let target = cy.elements().nodes().filter(function(node) {
      let nodePosition = node.position();
      let nodeWidth = node.renderedOuterWidth();
      let nodeHeight = node.renderedOuterHeight();
      //console.log(nodeWidth);
      //console.log(nodeHeight);
      //console.log(nodePosition.x - nodeWidth / 2);
      //console.log(nodePosition.x + nodeWidth / 2);
      //console.log(nodePosition.y - nodeWidth / 2);
      //console.log(nodePosition.y + nodeWidth / 2);
      let leftBoundary = nodePosition.x - nodeWidth / 2;
      let rightBoundary = nodePosition.x + nodeWidth / 2;
      let topBoundary = nodePosition.y - nodeHeight / 2;
      let bottomBoundary = nodePosition.y + nodeHeight / 2;
    
      console.log(`Node ${node.id()} boundaries: left=${leftBoundary}, right=${rightBoundary}, top=${topBoundary}, bottom=${bottomBoundary}`);
    
      return (
        renderedPosition.x >= leftBoundary &&
        renderedPosition.x <= rightBoundary &&
        renderedPosition.y >= topBoundary &&
        renderedPosition.y <= bottomBoundary
      );
    });

    console.log('Potential targets:', target.map(node => node.id()));


    if (target.length > 0 && target[0] !== sourceNode) {
      // Dragging ended on a different node
      targetNode = target[0];
      let sourceLabel = sourceNode.data('label'); // Get the ID of the source node
      let targetLabel = targetNode.data('label'); // Get the ID of the target node

      showEdgePreview(cy, sourceNode, targetNode, async (source, target, label) => {
        try {
          await addEdge({
              sourceLabel: sourceLabel,
              targetLabel: targetLabel,
              description: label
          });
          console.log("Edge added successfully.");
        } catch (error) {
          console.error("Error adding edge:", error);
        }
      });
    
      console.log('Drag ended from node:', sourceNode.id(), 'to node:', targetNode.id());
    } else {
      // Dragging did not end on a different node
      console.log('Drag did not end on a different node.');
    }

    // Reset the dragging state and source node after the operation is complete
    isDragging = false;
    sourceNode = null;
  }
  });

  function stop() {
    console.log("a");
  }

  //function start() {
   // eh.start(popperNode);
  //}

 cy.on('ehcomplete', (event, sNode, tNode, addedEles) => {
    console.log(sNode);
    sourceNode = sNode;
    targetNode = tNode;
  });


  
}
