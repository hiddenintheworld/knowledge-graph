
// apiInteraction.js
export async function submitToAPI(endpoint, method, headers, body, requiresPolling = false, pollingUrl = '', pollingInterval = 5000, maxPollingAttempts = 12) {
    const proxyUrl = '/proxy'; // Your proxy URL

    try {
        // Initial API call through the proxy
        console.log("Making initial API call through the proxy...");
        const requestOptions = {
            method: 'POST', // Always POST for the proxy endpoint
            headers: { 'Content-Type': 'application/json' }, // Proxy expects JSON
            body: JSON.stringify({
                url: endpoint,
                method: method,
                headers: headers,
                body: method === 'GET' || method === 'HEAD' ? null : body // Only include body if not GET or HEAD
            }),
        };
        console.log(proxyUrl);
        console.log(requestOptions);
        const response = await fetch(proxyUrl, requestOptions);

        const data = await response.json();
        console.log("Initial API Response:", data);

        // If the API requires polling to get the final result
        if (requiresPolling && pollingUrl) {
            console.log("API requires polling. Initiating polling...");
            // Note: Adjust the polling mechanism if needed to work through the proxy
            return await pollForResult(pollingUrl, data.id, headers, pollingInterval, maxPollingAttempts);
        } else {
            // If no polling is needed, return the initial data
            console.log("No polling needed. Returning initial data.");
            return data;
        }
    } catch (error) {
        console.error("Error calling the API through the proxy:", error);
        return null;
    }
}


// Poll for the result if the API requires it
async function pollForResult(url, jobId, headers, interval, maxAttempts) {
    const proxyUrl = '/proxy'; // Your proxy URL
    let attempts = 0;

    return new Promise(async (resolve, reject) => {
        const checkResult = async () => {
            try {
                // Polling through the proxy
                const pollResponse = await fetch(proxyUrl, {
                    method: 'POST', // Using POST for the proxy
                    headers: { 'Content-Type': 'application/json' }, // Proxy expects JSON
                    body: JSON.stringify({
                        url: `${url}/${jobId}`, // The URL for polling the API
                        method: 'GET', // Method for the polling request
                        headers: headers, // Headers for the polling request
                    }),
                });

                const resultData = await pollResponse.json();
                console.log(`Polling attempt ${attempts + 1}:`, resultData);

                if (resultData.status === 'completed' || resultData.status === 'succeeded') {
                    resolve(resultData);
                } else if (attempts < maxAttempts) {
                    setTimeout(checkResult, interval);
                    attempts++;
                } else {
                    console.error("Max polling attempts reached.");
                    reject("Max polling attempts reached.");
                }
            } catch (error) {
                console.error("Error during polling:", error);
                reject(error);
            }
        };

        checkResult();
    });
}
