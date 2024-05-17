let nodePreview = null;  // Renamed from previewNode to nodePreview for consistency
let inputBox = null;  // Ensure inputBox is managed consistently

function removeInputBox() {
  if (inputBox) {
    document.body.removeChild(inputBox);
    inputBox = null;
  }
}

export function showNodePreview(cy, pos, callback) {
  // Remove existing node preview and input box
  if (nodePreview) {
    nodePreview.remove();
  }
  removeInputBox();

  // Create a preview node
  nodePreview = cy.add({
    group: 'nodes',
    data: { id: 'previewNode', label: ' ' },
    position: { x: pos.x, y: pos.y },
    classes: ['preview']
  });

  nodePreview.style('background-color', '#2ecc71'); // Change color to red

  // Calculate the position of the input box relative to the canvas, considering zoom and pan
  const zoom = cy.zoom();
  const pan = cy.pan();
  const inputPosition = {
    x: pos.x * zoom + pan.x - 5,  // Horizontal adjustment
    y: pos.y * zoom + pan.y - 15 - (10 * zoom)  // Vertical adjustment considering zoom
  };

  // Show the input box
  inputBox = document.createElement('input');
  inputBox.setAttribute('type', 'text');
  inputBox.classList.add('node-name-input');
  inputBox.style.left = `${inputPosition.x}px`;
  inputBox.style.top = `${inputPosition.y}px`;
  inputBox.style.minWidth = '50px';
  inputBox.style.width = '50px';
  inputBox.style.padding = '5px';
  inputBox.style.position = 'absolute';
  inputBox.style.display = 'block';

  document.body.appendChild(inputBox);
  inputBox.focus();

  // Update preview node label in real time
  inputBox.addEventListener('input', (e) => {
    const value = e.target.value;
    nodePreview.data('label', value);

    // Dynamically adjust the width of the input box
    const newWidth = Math.max(50, value.length * 7.8);  // Adjust multiplier as needed
    inputBox.style.width = `${newWidth}px`;
  });

  // Finalize node creation on Enter key
  inputBox.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const label = inputBox.value.trim();
      if (label) {
        callback(label, pos);
      }

      // Clean up
      nodePreview.remove();
      nodePreview = null;
      removeInputBox();
    }
  });
}
