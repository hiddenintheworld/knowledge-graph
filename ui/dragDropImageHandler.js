// Path: /ui/dragDropImageHandler.js
import { cy } from '../state.js';
import { addNodeOrArticle } from '../graph/nodeArticleManager.js';
import { getFormValues } from '../utils/formUtils.js'; // Assume this extracts form utilities into a separate module.
import { copySelectedElements, copyImage, pasteContent, clipboardContent, resetclipboardContent } from '../utils/clipboardHandler.js';

export function initializeDragDropImageHandler() {
    const dropZone = document.body; // Or a specific element if you prefer

    dropZone.addEventListener('dragover', (event) => {
        event.stopPropagation();
        event.preventDefault();
        event.dataTransfer.dropEffect = 'copy';
    });

    dropZone.addEventListener('drop', (event) => {
        event.stopPropagation();
        event.preventDefault();
    
        const files = event.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    createImageNode(e.target.result, event);
                };
                reader.readAsDataURL(file);
            }
        } else {
            const url = event.dataTransfer.getData('URL');
            if (url) {
                createImageNode(url, event);
            }
        }
    });

     // Keyboard event listener for copy operation
     document.addEventListener('keydown', (event) => {
        if ((event.ctrlKey || event.metaKey) && event.key === 'c') {
            resetclipboardContent();
            copySelectedElements();
        }
    });
    
    dropZone.addEventListener('paste', (event) => {
        console.log("abcc");
        if (clipboardContent !== null) {
            console.log("ab");
        const items = (event.clipboardData || event.originalEvent.clipboardData).items;
        let pastedContentHandled = false;
        let imageFound = false;
        for (const item of items) {
            if (item.type.indexOf('image') === 0) {
                imageFound = true;
                event.stopPropagation();
                event.preventDefault();
                pastedContentHandled = true; // Mark as handled immediately
                const blob = item.getAsFile();
                const reader = new FileReader();
                reader.onload = (e) => {
                    createImageNode(e.target.result, event);
                    resetclipboardContent();
                    console.log("kk");  
                };
                reader.readAsDataURL(blob);
                break; // Stop the loop after finding the first image
            }
        }
        console.log(clipboardContent.type);
         // If the pasted content hasn't been handled and is likely not an image, consider it as a different type
        if (!pastedContentHandled) {
            console.log("gg");
            if (clipboardContent.type === 'elements') {
                // If nodes/edges are ready to be pasted, prevent default image paste logic
                event.preventDefault();
                pasteContent();
                return;
            }
        }
        }
    });
}
function isImageUrl(url) {
    // Simple check if the URL ends with an image extension
    return url.match(/\.(jpeg|jpg|gif|png|bmp|svg)$/i) !== null;
}
export async function createImageNode(imageSrc, event) {
    let posX, posY;

    if (event.type === 'drop') {
        posX = event.clientX;
        posY = event.clientY;
    } else if (event.type === 'paste') {
        posX = window.innerWidth / 2;
        posY = window.innerHeight / 2;
        
    }
    console.log(posX);
    console.log(posY);
    const pos = cy.renderer().projectIntoViewport(posX, posY);
    console.log(pos);
    const formValues = getFormValues();
    try {
        await addNodeOrArticle({
            nodeLabel: "",
            userId: formValues.userId,
            typesInput: formValues.typesInput,
            url: imageSrc,
            privacyLevel: formValues.privacyLevel,
            position: { x: pos[0], y: pos[1] },
        }, false);
        console.log("Node added successfully.");
    } catch (error) {
        console.error("Error adding node:", error);
    }
}


