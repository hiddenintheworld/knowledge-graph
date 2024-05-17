let edgePreview = null;
let inputBox = null;

function removeInputBox() {
  if (inputBox) {
    document.body.removeChild(inputBox);
    inputBox = null;
  }
}

export function showEdgePreview(cy, sourceNode, targetNode, callback) {
  // Remove existing edge preview and input box
  if (edgePreview) {
    edgePreview.remove();
  }
  removeInputBox();

  // Create a preview edge
  edgePreview = cy.add({
    group: 'edges',
    data: {
      id: 'previewEdge',
      source: sourceNode.id(),
      target: targetNode.id(),
      label: ' '
    },
    classes: ['preview'] // Use this class to style the preview edge distinctly
  });

  edgePreview.style({
  'line-color': '#2ecc71',
  'target-arrow-color': '#2ecc71'
});
  const zoom = cy.zoom();
  const pan = cy.pan();

  // Calculate a suitable position for the input box (midpoint of the edge)
  const sourcePos = sourceNode.position();
  const targetPos = targetNode.position();
  const midpoint = {
    x: ((sourcePos.x + targetPos.x) / 2) * zoom + pan.x,
    y: ((sourcePos.y + targetPos.y) / 2) * zoom + pan.y
  };

  // Show the input box near the midpoint of the edge
  inputBox = document.createElement('input');
  inputBox.setAttribute('type', 'text');
  inputBox.classList.add('edge-name-input');
  inputBox.style.position = 'absolute';
  inputBox.style.left = `${midpoint.x}px`;
  inputBox.style.top = `${midpoint.y}px`;
  inputBox.style.minWidth = '50px'; // Adjust as needed
  document.body.appendChild(inputBox);
  inputBox.focus();

  // Update preview edge label in real time
  inputBox.addEventListener('input', (e) => {
    const value = e.target.value;
    edgePreview.data('label', value);
  });

  // Finalize edge creation on Enter key
  inputBox.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const label = inputBox.value.trim();
      callback(sourceNode, targetNode, label);

      // Clean up
      edgePreview.remove();
      edgePreview = null;
      removeInputBox();
    }
  });
}
