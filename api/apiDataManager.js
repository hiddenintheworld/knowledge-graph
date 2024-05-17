import { setApiEndpointsData } from "../state.js";

export function fetchApiEndpoints(url, callback, errorCallback) {
    fetch(url)
        .then(response => response.json())
        .then(data => {
            setApiEndpointsData(data.endpoints); // Save the fetched data in the global state
            if (callback && typeof callback === 'function') {
                callback(data.endpoints); // Pass the data to the callback
            }
        })
        .catch(error => {
            console.error('Error loading the API endpoints:', error);
            if (errorCallback && typeof errorCallback === 'function') {
                errorCallback(error);
            }
        });
}
