import { cy } from '../state.js';
export function applyDynamicLayout() {
        // Apply 'cose' layout for newly added elements if not in initial import mode
        cy.layout({ name: 'cose' }).run();
    }


export function getNonOverlappingPosition() {
    // Find the centroid of the existing graph
    let centroid = { x: 0, y: 0 };
    let nodes = cy.nodes();
    
    if (nodes.length) {
        nodes.forEach(node => {
            centroid.x += node.position().x;
            centroid.y += node.position().y;
        });
        centroid.x /= nodes.length;
        centroid.y /= nodes.length;
     } else {
        // Default to the center of the viewport if no nodes exist
          centroid.x = cy.width() / 2;
          centroid.y = cy.height() / 2;
    }
    
    // Offset for the new node to avoid placing it exactly at the centroid
    let offset = 50; // Adjust this value based on your needs
    let angle = Math.random() * 2 * Math.PI; // Random angle for offset
    
    return {
        x: centroid.x + offset * Math.cos(angle),
        y: centroid.y + offset * Math.sin(angle)
    };
}
