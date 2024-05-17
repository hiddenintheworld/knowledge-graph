export async function submitToAPI(apiEndpointsData, selectedEndpointUrl, userInput) {
    document.getElementById('loadingAnimation').style.display = 'block';
    const endpointConfig = apiEndpointsData.find(ep => ep.url === selectedEndpointUrl);
    if (!endpointConfig) {
        console.error("Selected API endpoint configuration not found.");
        return;
    }

    const finalPrompt = endpointConfig.system_prompt ? `${endpointConfig.system_prompt} ${userInput}` : userInput;
    let requestData = JSON.parse(JSON.stringify(endpointConfig.data));

    if (endpointConfig.data.input) {
        requestData.input.prompt = finalPrompt;
    } else if (endpointConfig.data.contents) {
        requestData.contents[0].parts[0].text = finalPrompt;
    }

    const proxyUrl = 'http://localhost:8000/proxy';
    const queryParams = endpointConfig.params ? new URLSearchParams(endpointConfig.params).toString() : '';

    try {
        const response = await fetch(proxyUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                url: endpointConfig.url + (queryParams ? `?${queryParams}` : ""),
                method: endpointConfig.method,
                headers: endpointConfig.headers,
                body: requestData
            })
        });
        const data = await response.json();
        console.log("Initial API Response:", data);

        if (endpointConfig.requiresPolling) {
            console.log("Processing started, polling for result...");
            await pollForResult(proxyUrl, data.id, endpointConfig.headers, endpointConfig.resultPath);
        } else {
            document.getElementById('loadingAnimation').style.display = 'none';
            console.log("API Response:", data);
            const finalResult = extractResult(data, endpointConfig.resultPath);
            console.log("Final result after extraction:", finalResult);
            if (finalResult !== undefined) {
                await displayResults(finalResult);
            }
        }
    } catch (error) {
        console.error("Error calling the API through proxy:", error);
        document.getElementById('loadingAnimation').style.display = 'none';
    }
}

export async function displayResults(finalResult) {
    const resultsBox = document.getElementById('resultsBox');
    if (resultsBox) {
        resultsBox.value = finalResult;
        resultsBox.removeAttribute('readonly');
    } else {
        console.error('Results box not found!');
    }
}

export async function pollForResult(proxyUrl, jobId, headers, resultPath, interval = 5000, maxAttempts = 12) {
    let attempts = 0;

    const checkResult = async () => {
        try {
            const response = await fetch(proxyUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    url: `https://api.replicate.com/v1/predictions/${jobId}`,
                    method: 'GET',
                    headers: headers
                })
            });
            const data = await response.json();
            console.log("Polling attempt:", attempts + 1, "Status:", data.status);

            if (data.status === "completed" || data.status === "succeeded") {
                document.getElementById('loadingAnimation').style.display = 'none';
                const finalResult = extractResult(data, resultPath);
                console.log("Final result inside pollForResult:", finalResult);
                if (finalResult !== undefined) {
                    await displayResults(finalResult);
                }
            } else if (attempts < maxAttempts) {
                setTimeout(checkResult, interval);
                attempts++;
            } else {
                document.getElementById('loadingAnimation').style.display = 'none';
                console.error("Max polling attempts reached. Final status:", data.status);
            }
        } catch (error) {
            console.error("Error during polling:", error);
        }
    };

    await checkResult();
}

export function extractResult(data, path) {
    const pathParts = path.split(/[\.\[\]]+/).filter(Boolean);
    let result = data;

    for (const part of pathParts) {
        if (result[part] !== undefined) {
            result = result[part];
        } else {
            return null;
        }
    }

    if (Array.isArray(result) && result.every(part => typeof part === 'object' && 'text' in part)) {
        return result.map(part => part.text).join('');
    }

    if (Array.isArray(result) && result.every(part => typeof part === 'string')) {
        return result.join('');
    }

    return result;
}
