import { submitToAPI } from "./nodeApiInteraction.js";
import {Node} from './nodeDefault.js';
import {Edge} from './edgeDefault.js';

class GraphNode {
    constructor(nodeData , globalTimer) {
      this.node = new Node(
        new Function('data', 'globalTime', nodeData.data('preprocessingLogic')),
        this.createApiCallFunction(nodeData.data('apiCallLogic'), nodeData.data('apiEndpoint')),
        new Function('apiData', 'globalTime', 'data', nodeData.data('postprocessingLogic')),
        nodeData.data('maxRetries') || 3,  // Provide a default value if not specified
        nodeData.data('timeout') || 10000, // Provide a default value if not specified
        globalTimer, // Use the passed globalTimer
        nodeData.data('apiEndpoint'),
        nodeData.data('label'),
        nodeData.id()
      );
      this.id = nodeData.id();
    }
  
    createApiCallFunction(apiCallLogic, apiEndpoint) {
        const apiCallFunction = new Function('submitToAPI', 'apiEndpoint', 'data', `${apiCallLogic}`);
        return async (data) => {
          // Execute the user-defined API call logic
          return await apiCallFunction(submitToAPI, apiEndpoint, data);
        };
      }
    
  
    async processData(data, globalTime, stateHandler) {
      await this.node.processData(data, globalTime, stateHandler);
    }
  }
  

class GraphEdge {
  constructor(edgeData, targetGraphNode, globalTimer) {
    this.edge = new Edge(
      targetGraphNode.node,
      edgeData.data('requiredDataKeys') || new Set(), // Default to an empty set
      new Function('data', edgeData.data('manipulationLogic') || 'return data;'),
      new Function('globalTime', 'localTime', 'data', 'context', edgeData.data('activationLogic') || 'return true;'),
      globalTimer, // Use the passed globalTimer
      {}, // Context can be an empty object or filled as needed
      edgeData.data('description'),
      edgeData.id()
    );
    this.id = edgeData.id();
  }

  transferData(data, globalTime, stateHandler) {
    console.log(this.description);
    console.log(this.id);
    
    this.edge.transferData(data, globalTime, stateHandler); // Pass the description as the identifier

}
}


export function setupGraph(cyNodes, cyEdges, globalTimer) {
  let nodes = {};
  let edges = [];

  cyNodes.forEach(nodeData => {
    const newNode = new GraphNode(nodeData, globalTimer);
    nodes[newNode.id] = newNode;
  });

  cyEdges.forEach(edgeData => {
    const sourceNode = nodes[edgeData.data('source')];
    const targetNode = nodes[edgeData.data('target')];
    const newEdge = new GraphEdge(edgeData, targetNode, globalTimer);

    // Use the addEdge method of Node class to add the edge
    sourceNode.node.addEdge(newEdge.edge);
    edges.push(newEdge);
  });

  // Return the graph structure
  return { nodes, edges };
}

export async function startGraphProcessing(graph, stateHandler) {
  const globalTime = 0; // Initialize global time, can be replaced with a global timer
  const nodeProcessingPromises = [];
  
  for (let nodeId in graph.nodes) {
    const node = graph.nodes[nodeId];
    nodeProcessingPromises.push(node.processData({}, globalTime, stateHandler));
  }
  
  await Promise.all(nodeProcessingPromises); // Process all nodes in parallel
}
