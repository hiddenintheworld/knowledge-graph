import {setupGraph, startGraphProcessing} from './logicProcessor.js';
import {cy} from '../state.js';
import { GlobalTimer } from './timer.js'; // Adjust the path to where globalTimer is defined
import {GraphStateHandler} from './GraphStateHandler.js';


export function start(){

let stateHandler = new GraphStateHandler(cy);
const globalTimerInstance = new GlobalTimer();

// Convert Cytoscape graph to custom graph structure
const graph = setupGraph(cy.nodes(), cy.edges(), globalTimerInstance);



// Start processing the graph
startGraphProcessing(graph, stateHandler);

}