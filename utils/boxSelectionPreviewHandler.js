export let startPoint = null;
export function getElementsWithinSelectionBox(cy, selectionBoxCoords) {
    const {x1, y1, x2, y2} = selectionBoxCoords;
    const elements = cy.elements().filter((ele) => {
        const elePos = ele.renderedPosition();
        const eleBoundingBox = ele.renderedBoundingBox();
        
        // For edges, check if the midpoint is within the box
        if (ele.isEdge()) {
            const midX = (eleBoundingBox.x1 + eleBoundingBox.x2) / 2;
            const midY = (eleBoundingBox.y1 + eleBoundingBox.y2) / 2;
            return midX >= x1 && midX <= x2 && midY >= y1 && midY <= y2;
        }

        // For nodes, check if their position is within the box
        return elePos.x >= x1 && elePos.x <= x2 && elePos.y >= y1 && elePos.y <= y2;
    });

    return elements;
}
export function highlightElements(cy, elements) {
    // Reset styles for all elements
    cy.elements().removeClass('highlighted');

    // Add highlighting class to the newly selected elements
    elements.addClass('highlighted');
}