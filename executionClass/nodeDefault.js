  class Node {
      constructor(preProcess, apiCall, postProcess, maxRetries, timeout, globalTimer, apiEndpoint, nodeLabel, nodeId) {
        this.preProcess = preProcess;
        this.apiCall = apiCall;
        this.postProcess = postProcess;
        this.maxRetries = maxRetries;
        this.retryCount = 0;
        this.timeout = timeout;
        this.edges = [];
        this.dataReceived = {}; // Track received data with identifiers
        this.globalTimer = globalTimer;
        this.apiEndpoint = apiEndpoint;
        this.localStartTime = null;
        this.localElapsed = 0;
        this.label = nodeLabel; // Store the node's label
        this.nodeId = nodeId; 
      }
      
      getLocalElapsedTime() {
        return this.localStartTime ? Date.now() - this.localStartTime : this.localElapsed;
      }


      addEdge(edge) {
        this.edges.push(edge);
      }
    
/*
      receiveData(sourceIdentifier, data) {
        console.log(sourceIdentifier);
        console.log(data);
        this.localStartTime = this.localStartTime || Date.now();

        this.dataReceived[sourceIdentifier] = data;
        console.log(this.dataReceived);
        //this.edges.forEach(edge => edge.checkActivation(this.dataReceived));
      }
*/
      async receiveData(sourceIdentifier, data, globalTime, stateHandler) {
        console.log(`Data received from ${sourceIdentifier}:`, data);
        this.dataReceived[sourceIdentifier] = data;
        
        // Process the data immediately after receiving
        await this.processData(this.dataReceived, globalTime, stateHandler);
    }
    
      async processData(data, globalTime, stateHandler) {
        let apiResponse;
        // Combine incoming data with accumulated dataReceived.
        console.log(this.dataReceived);
        stateHandler.markRunning(this.nodeId);
        try {
          
            // Apply preprocessing to combined data, if available
            const preProcessedData = this.preProcess ? await this.preProcess(this.dataReceived, this.globalTimer.getElapsedTime()) : data;
            console.log('Preprocessed Data:', preProcessedData);
    
            // Proceed with API call using preProcessedData if available, else use combinedData
            apiResponse = await this.attemptApiCall(preProcessedData || data);
        } catch (error) {
            console.error("Max retries reached or an error occurred, proceeding without API response:", error);
        }
    
        // Apply postprocessing, if available
        const postProcessedData = this.postProcess ? await this.postProcess(apiResponse || {}, this.globalTimer.getElapsedTime(), this.dataReceived) : data;
        console.log('Postprocessed Data:', postProcessedData);
        // Delay the clearRunning call
          setTimeout(() => {
            stateHandler.clearRunning(this.nodeId);
            console.log(`Cleared running state for node ${this.nodeId}`);
        }, 100);  // Adjust the delay as needed
        stateHandler.updateProcessedData(this.nodeId, postProcessedData);
        // Transfer postprocessed data to connected edges
        this.edges.forEach(edge => edge.transferData(postProcessedData, this.globalTimer.getElapsedTime(), stateHandler));
    }
    

      async attemptApiCall(data) {
        for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
          try {
            this.retryCount = attempt;
            const response = await this.apiCall(data);
            return response; // Successful API call, return response
          } catch (error) {
            if (attempt === this.maxRetries) {
              throw new Error("Max retries reached.");
            }
            console.log(`Attempt ${attempt + 1} failed. Retrying...`);
            await new Promise(resolve => setTimeout(resolve, this.timeout));
          }
        }
      }

    }
    // Make sure to export the Edge class
  export { Node };
  /*
    // Custom preprocessing logic
  const customPreProcess = (data, globalTime, receivedData) => {
    // User-defined preprocessing logic
    console.log("Preprocessing data:", data);
    return data; // Return the preprocessed data
  };

  // Custom postprocessing logic
  const customPostProcess = (data, globalTime, receivedData) => {
    // User-defined postprocessing logic
    console.log("Postprocessing data:", data);
    return data; // Return the postprocessed data
  };

  // Creating a node with custom preprocessing and postprocessing logic
  const nodeA = new Node(customPreProcess, apiCallFunction, customPostProcess, 3, 10000, globalTimer);
  */