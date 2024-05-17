
export function createAndNavigateToNode(label) {
    // Implement the logic to add a node and then navigate to it
    let newNodeData = {
        label: label,
        // Add other necessary node data
    };
    let newNode = cy.add({
        group: 'nodes',
        data: newNodeData,
        position: { x: Math.random() * 500, y: Math.random() * 500 } // Random position, change as needed
    });

    // Now navigate to the new node
    navigateToNode(newNode.id());
}

export function handleSuggestionSelection(suggestion) {
    // Implement logic to navigate to or create a node based on the suggestion
    var nodeId = findNodeIdByLabel(suggestion);
    if (nodeId) {
        navigateToNode(nodeId); // Navigate to the existing node
    } else {
        createAndNavigateToNode(suggestion); // Create a new node and navigate to it
    }
}

// Function to navigate and show node details, can be called from autocomplete suggestion selection
export function navigateToNode(nodeId) {
  var node = cy.getElementById(nodeId);
  if (node) {
    displayNodeDetails(node); // Display the details of the node
  }
}