// GraphStateHandler.js

export class GraphStateHandler {
    constructor(cytoscapeInstance) {
        this.cy = cytoscapeInstance;
    }

    markRunning(eleId) {
        // Add 'running' class to the node or edge
        this.cy.getElementById(eleId).addClass('running');
    }

    clearRunning(eleId) {
        // Remove 'running' class from the node or edge
        this.cy.getElementById(eleId).removeClass('running');
    }

    updateProcessedData(eleId, data) {
        // Set custom data attribute 'processedData'
        this.cy.getElementById(eleId).data('processedData', JSON.stringify(data));
    }

    clearProcessedData(eleId) {
        // Clear custom data attribute 'processedData'
        this.cy.getElementById(eleId).removeData('processedData');
    }
}

export default GraphStateHandler;