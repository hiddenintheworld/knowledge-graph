// ui/BoxSelectionDrawingHandler.js
import { cy, selectionBoxMode, updateSelectElements, selectedElements } from '../state.js';
import { getElementsWithinSelectionBox, highlightElements} from '../utils/boxSelectionPreviewHandler.js';
import { resetPasteShift } from '../utils/clipboardHandler.js';

export let selectionBox;
export let startPoint;
let startPos = null;
let draggingElements = false;
let selectionBoxDrawing = false;
let initialMousePosition = null;
let isDrawingSelectionBox = false; // New flag to distinguish drawing action
export function createSelectionBox() {
    if (!selectionBox) {
        selectionBox = document.createElement('div');
        selectionBox.id = 'customSelectionBox';
        document.body.appendChild(selectionBox);
        selectionBox.style.position = 'absolute';
        selectionBox.style.border = '2px solid blue';
        selectionBox.style.backgroundColor = 'rgba(0, 0, 255, 0.1)';
        selectionBox.style.pointerEvents = 'none';
        selectionBox.style.display = 'none';
    }
}

export function updateContinuousSelectionBox() {
    if (!selectedElements || selectedElements.length === 0) {
        selectionBox.style.display = 'none';
        return;
    }

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    selectedElements.forEach(ele => {
        const boundingBox = ele.isNode() ? ele.renderedBoundingBox() : {
            x1: Math.min(ele.source().renderedPosition().x, ele.target().renderedPosition().x),
            x2: Math.max(ele.source().renderedPosition().x, ele.target().renderedPosition().x),
            y1: Math.min(ele.source().renderedPosition().y, ele.target().renderedPosition().y),
            y2: Math.max(ele.source().renderedPosition().y, ele.target().renderedPosition().y)
        };

        minX = Math.min(minX, boundingBox.x1);
        minY = Math.min(minY, boundingBox.y1);
        maxX = Math.max(maxX, boundingBox.x2);
        maxY = Math.max(maxY, boundingBox.y2);
    });

    const containerRect = cy.container().getBoundingClientRect();
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;
    
    // Adjust coordinates to fit within the container, considering scroll
    const left = minX + containerRect.left + scrollX;
    const top = minY + containerRect.top + scrollY;
    const width = maxX - minX;
    const height = maxY - minY;

    selectionBox.style.left = `${left}px`;
    selectionBox.style.top = `${top}px`;
    selectionBox.style.width = `${width}px`;
    selectionBox.style.height = `${height}px`;
    selectionBox.style.display = 'block';
}

function updateSelectionBox(startPos, movePos) {
    const rect = cy.container().getBoundingClientRect();
    // If scrolling can affect your layout, uncomment and use these:
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;

    const correctedStartX = startPos.x + rect.left + scrollX; // reintroduced scrollX
    const correctedStartY = startPos.y + rect.top + scrollY; // reintroduced scrollY
    const correctedEndX = movePos.x + rect.left + scrollX; // reintroduced scrollX
    const correctedEndY = movePos.y + rect.top + scrollY; // reintroduced scrollY

    const width = Math.abs(correctedEndX - correctedStartX);
    const height = Math.abs(correctedEndY - correctedStartY);

    selectionBox.style.width = `${width}px`;
    selectionBox.style.height = `${height}px`;
    selectionBox.style.left = `${Math.min(correctedStartX, correctedEndX)}px`;
    selectionBox.style.top = `${Math.min(correctedStartY, correctedEndY)}px`;
    selectionBox.style.display = 'block';
}

function moveSelectedElements(movePos) {
    let hasMoved = false;
    selectedElements.forEach(ele => {
        const initialPos = ele.data('initialPosition');
        if (initialPos) {
            const zoom = cy.zoom();
            const dx = (movePos.x - startPos.x) / zoom;
            const dy = (movePos.y - startPos.y) / zoom;

            ele.position({
                x: initialPos.x + dx,
                y: initialPos.y + dy
            });
            hasMoved = true;
        }
    });

    if (hasMoved) {
        updateContinuousSelectionBox(); // Update box to encompass moved elements
    }
}

function prepareElementsForDragging(elements) {
    elements.forEach(ele => {
        const originalPosition = ele.position();
        ele.data('initialPosition', { x: originalPosition.x, y: originalPosition.y });
    });
}

export function initializeBoxSelectionDrawing() {
    createSelectionBox();

    cy.on('mousedown', function (event) {
        if (selectionBoxMode) {
        startPos = event.renderedPosition;
        initialMousePosition = { x: event.originalEvent.clientX, y: event.originalEvent.clientY };
        const selectionBoxRect = selectionBox.getBoundingClientRect();
        const isInSelectionBox = event.originalEvent.clientX >= parseInt(selectionBox.style.left) + window.scrollX &&
                                 event.originalEvent.clientX <= parseInt(selectionBox.style.left) + parseInt(selectionBox.style.width) + window.scrollX &&
                                 event.originalEvent.clientY >= parseInt(selectionBox.style.top) + window.scrollY &&
                                 event.originalEvent.clientY <= parseInt(selectionBox.style.top) + parseInt(selectionBox.style.height) + window.scrollY;
    
        const isElementClick = event.target !== cy;
        isDrawingSelectionBox = false; // Reset the flag

        if (isInSelectionBox && !isElementClick) {
            // Inside selection box and not clicking on an element - prepare for dragging
            prepareElementsForDragging(selectedElements);
            draggingElements = true;
        } else if (isElementClick) {
            const element = event.target;
            const elementAlreadySelected = selectedElements.some(ele => ele === element);
    
            if (!elementAlreadySelected && !event.originalEvent.shiftKey) {
                // Clicked an element not already selected without holding Shift
                updateSelectElements(cy.collection([element]));
                highlightElements(cy, cy.collection([element]));
            } else if (event.originalEvent.shiftKey && !elementAlreadySelected) {
                // Clicked an element not already selected while holding Shift
                addElements(element);
            }
            // Prepare for dragging, whether it's a new selection or an addition
            prepareElementsForDragging(selectedElements);
            draggingElements = true;
        } else {
            // If the click was not on an element, prepare for box selection
            isDrawingSelectionBox = true;
            if (!event.originalEvent.shiftKey) {
                updateSelectElements(cy.collection());
            }
        }
        }
    });

    cy.on('mousemove', function (event) {
        if (selectionBoxMode) {
        if (!startPos) return;
        
        const movePos = event.renderedPosition;
        
        if (draggingElements) {
            moveSelectedElements(movePos); // Handle dragging
            updateContinuousSelectionBox(); // Update the box to encompass dragged elements
        } else if (isDrawingSelectionBox) {
            updateSelectionBox(startPos, movePos); // Handle box drawing
        }
    }
    });
    

    cy.on('mouseup', function (event) {
        if (selectionBoxMode) {
        if (draggingElements) {
            const finalMousePos = event.renderedPosition;

        // Perform a final position update based on the last mouse position
        selectedElements.forEach(ele => {
            const initialPos = ele.data('initialPosition');
            if (initialPos) {
                const zoom = cy.zoom();
                const pan = cy.pan();

                // Calculate the final dx and dy based on the final mouse position
                const dx = (finalMousePos.x - startPos.x) / zoom;
                const dy = (finalMousePos.y - startPos.y) / zoom;

                // Calculate and set the final position
                const finalPos = {
                    x: initialPos.x + dx,
                    y: initialPos.y + dy
                };

                ele.position(finalPos);
            }
        });

        // Clean up
        draggingElements = false;
        startPos = null;
        initialMousePosition = null;
        selectedElements.forEach(ele => {
            ele.removeData('initialPosition'); // Clear the stored initial positions
        });

        // Update the continuous selection box one last time
        updateContinuousSelectionBox();
            // Optionally reset selection box here
        } else if (selectionBoxMode) {
            selectionBox.style.display = 'none';
            const endPos = event.renderedPosition;
            if (startPos) {
                const boxCoords = {
                    x1: Math.min(startPos.x, endPos.x),
                    y1: Math.min(startPos.y, endPos.y),
                    x2: Math.max(startPos.x, endPos.x),
                    y2: Math.max(startPos.y, endPos.y),
                };

                const newSelectedElements = getElementsWithinSelectionBox(cy, boxCoords);
                updateSelectElements(newSelectedElements);
                // Place this call after any code that changes which elements are selected
                updateContinuousSelectionBox(); 
                highlightElements(cy, newSelectedElements);
                resetPasteShift(); // Reset the paste shift after a new selection
            }
            startPos = null;
            initialMousePosition = null;
        }

        if (selectionBoxDrawing) {
            selectionBoxDrawing = false;
        }
    }
    });
    
}
