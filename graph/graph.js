// graph.js
import { getCy } from './state.js';
import { setupGraphEventListeners } from './graphEvents.js';
import { setupGraphElementRemoval } from './graphActions.js';
import { setupGraphViewControls } from './graphViewControls.js';
import { initializeCy } from './state.js';

export function initializeGraph(containerId) {
    initializeCy(containerId);
    const cy = getCy();
    setupGraphEventListeners(cy);
    setupGraphElementRemoval(cy);
    setupGraphViewControls(cy);
}

export function updateGraphLayout(layoutName) {
    const cy = getCy();
    cy.layout({ name: layoutName }).run();
}

export function clearGraph() {
    const cy = getCy();
    cy.elements().remove();
}

// Other core graph functionalities can be added here
