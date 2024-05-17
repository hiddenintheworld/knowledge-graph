class Edge {
    constructor(targetNode, requiredDataKeys, dataManipulation, activationLogic, globalTimer, context, description, edgeId) {
      this.targetNode = targetNode;
      this.requiredDataKeys = new Set(requiredDataKeys);
      this.dataManipulation = dataManipulation || ((data) => data); // Default to identity function if not provided
      this.activationLogic = activationLogic || (() => true); // Default to always true if not provided
      this.globalTimer = globalTimer;
      this.context = context;
      this.description = description;
      this.edgeId = edgeId;
      //this.localTimer = null;
      //this.localElapsed = 0; // Track elapsed time separately
      //this.localStartTime = null;
      //this.dataReceived = {};
    }
    
    startLocalTimer() {
        this.localStartTime = Date.now();
      }
      
    pauseLocalTimer() {
        if (this.localTimer) {
          this.localElapsed += Date.now() - this.localTimer;
          this.localTimer = null; // Pause the timer
        }
      }

      resetLocalTimer() {
        this.localTimer = Date.now();
        this.localElapsed = 0;
      }
    
      getLocalElapsedTime() {
        if (this.localTimer) {
          return this.localElapsed + (Date.now() - this.localTimer);
        }
        return this.localElapsed;
      }
      transferData(data, globalTime, stateHandler) {
        // Apply data manipulation logic
        console.log(data);
        const manipulatedData = this.dataManipulation(data);
        console.log(manipulatedData);
        stateHandler.markRunning(this.edgeId);
        // Check if the edge should activate based on the activation logic
        if (this.activationLogic(globalTime, this.getLocalElapsedTime(), manipulatedData, this.context)) {
            // If the activation logic returns true, pass the manipulated data to the target node
            //this.targetNode.processData(manipulatedData, globalTime);
            console.log("lalalalala");
            console.log(this.edgeId);
            console.log(stateHandler);
            this.targetNode.receiveData(this.description, manipulatedData, globalTime, stateHandler);
            //this.targetNode.receiveData(this.description, manipulatedData);
           
        }
        // Delay the clearRunning call
          setTimeout(() => {
            stateHandler.clearRunning(this.edgeId);
            console.log(`Cleared running state for edge ${this.edgeId}`);
        }, 100);  // Adjust the delay as needed
        stateHandler.updateProcessedData(this.edgeId, manipulatedData);

        console.log("BB");
    }


    activateNode() {
      const manipulatedData = this.dataManipulation(this.dataReceived);
      this.targetNode.receiveData(this.description,manipulatedData);
    }


      /* //some custom logic
    checkActivation(data) {
      if (!this.startTime) {
        this.startTime = Date.now();
      }
  
      Object.keys(data).forEach(key => {
        if (this.requiredDataKeys.has(key)) {
          this.dataReceived[key] = data[key];
        }
      });
  
      const elapsedTime = Date.now() - this.startTime;
      if (elapsedTime > this.timeout) {
        console.log("Timeout reached, not activating the node.");
        return;
      }
  
      if (Object.keys(this.dataReceived).length === this.requiredDataKeys.size) {
        this.activateNode();
      }
    }
    */
        
  
  }

  // Make sure to export the Edge class
export { Edge };
  /*
  
const customActivationLogic = (globalTime, localTime, data, context) => {
    // User-defined logic to determine activation
    // For example, activate if more than 5 seconds have passed globally and at least one data point is received
    return globalTime > 5000 && Object.keys(data).length >= 1;
  };
  
  // Create an edge with this custom activation logic
  const edgeAB = new Edge(nodeB, data => data, customActivationLogic, globalTimer, context); //without processing data
const edgeAB = new Edge(targetNode, dataManipulationFunction, customActivationLogic, globalTimer, context); //with processing data
  */