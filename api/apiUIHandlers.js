// apiUIHandlers.js
import { submitToAPI } from './apiInteraction.js';
import { getApiEndpointsData } from '../../state.js';
export function setupApiSubmissionListener() {
    document.body.addEventListener('click', function(e) {
        if (e.target && e.target.id === 'submitToAPIBtn') {
            // Show the loading animation
            document.getElementById('loadingAnimation').style.display = 'inline-block';

            const selectList = document.getElementById("apiSelect");
            const selectedEndpointUrl = selectList.value; // Directly use the selected URL value
            const userInput = document.getElementById("apiInput").value;

            console.log("Selected Endpoint:", selectedEndpointUrl);
            console.log("User Input:", userInput);

            // Immediately Invoked Async Function Expression
            (async () => {
                try {
                    const apiEndpointsData = getApiEndpointsData();
                    await submitToAPI(apiEndpointsData, selectedEndpointUrl, userInput);
                } catch (error) {
                    console.error('Error during API submission:', error);
                } finally {
                    document.getElementById('loadingAnimation').style.display = 'none';
                }
            })();
        }
    });
}
