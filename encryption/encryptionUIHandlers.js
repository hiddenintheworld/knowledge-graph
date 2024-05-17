// encryptionUIHandlers.js
import { cy } from '../state.js';
import { globalKeys } from './encryptionUtils.js';
import { encryptElement, decryptElement} from './graphEncryption.js';
import { applyEncryptionStyles, applyDecryptionStyles } from '../ui/graphViewControls.js';
import { getImageMode } from '../../state.js';
import { NodelabelToHashMapping, EdgelabelToHashMapping, HashToNodelabelMapping, HashToEdgelabelMapping,
    hashToNodeIDMapping, hashToEdgeIDMapping, NodeIDTohashMapping, EdgeIDTohashMapping} from '../state.js';  
export function setupKeyImportListener() {
    document.getElementById('importKeyInput').addEventListener('change', function(event) {
        const fileReader = new FileReader();
        fileReader.onload = function(fileEvent) {
            const keysData = JSON.parse(fileEvent.target.result);
            for (let key of keysData.globalKeys || []) {
                if (!globalKeys.includes(key)) {
                    globalKeys.push(key);
                }
            }
            alert('Keys imported successfully.');
        };
        fileReader.readAsText(event.target.files[0]);
    });
}

export function setupEncryptionControls() {
    // Encryption Button
    document.getElementById('encryptGraphBtn').addEventListener('click', function() {
        (async () => {
            for (const ele of cy.elements()) {
                if (!ele.data('encrypted') && ele.data('keyIndex') !== undefined) {
                    const keyIndex = ele.data('keyIndex');
                    const key = globalKeys[keyIndex];
                    await encryptElement(ele, key);
                    applyEncryptionStyles(ele);
                    ele.data('encrypted', true);
                }
            }
            alert('Graph encrypted successfully.');
            cy.layout({ name: 'cose' }).run();
        })().catch(error => console.error("Encryption error:", error));
    });

    document.getElementById('decryptGraphBtn').addEventListener('click', function() {
        cy.elements().forEach(ele => {
            if (ele.data('encrypted')) {
                const keyIndex = ele.data('keyIndex');
                const key = globalKeys[keyIndex];
                let decryptedData = decryptElement(ele, key);
                applyDecryptionStyles(ele, decryptedData, getImageMode());
            }
        });
        alert('Graph decrypted successfully.');
        cy.layout({ name: 'cose' }).run();
        console.log(HashToNodelabelMapping);
    });


}

// encryptionUIHandlers.js
export function setupEncryptionUIControls() {
    // Toggle Encryption Features
    document.getElementById('toggleEncryptionFeaturesBtn').addEventListener('click', function() {
        const encryptionFeatures = document.getElementById('encryptionFeatures');
        encryptionFeatures.style.display = encryptionFeatures.style.display === 'none' ? 'block' : 'none';
    });

    // Import Key File
    document.getElementById('importKeyFileBtn').addEventListener('click', function() {
        document.getElementById('importKeyInput').click();
    });
}
