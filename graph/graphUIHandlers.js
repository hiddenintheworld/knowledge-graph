// graphUIHandlers.js
import { exportGraphAndKeys, importGraphFromFile } from './graphDataIO.js';

export function setupGraphIOEventListeners(cy, globalKeys) {
    document.getElementById('exportGraphBtn').addEventListener('click', function () {
        exportGraphAndKeys(cy, globalKeys);
    });

    document.getElementById('importGraphBtn').addEventListener('click', function () {
        document.getElementById('importFileInput').click(); // Trigger file input
    });

    document.getElementById('importFileInput').addEventListener('change', function (event) {
        importGraphFromFile(event.target.files[0], cy);
        event.target.value = ''; // Reset input after import
    });
/*
    document.getElementById('importMappingBtn').addEventListener('click', function () {
        document.getElementById('importMappingFileInput').click(); // Trigger mapping file input
    });

    document.getElementById('importMappingFileInput').addEventListener('change', function (event) {
        importMappingDataFromFile(event.target.files[0]);
        event.target.value = ''; // Reset input after import
    });
    */
}
