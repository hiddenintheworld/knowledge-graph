// graphViewControls.js
import { getImageMode, setImageMode, imageModeEnabled } from "../state.js";
export function setupGraphViewControls(cy) {
    document.getElementById('resetZoomBtn').addEventListener('click', function () {
        cy.fit(); // Fit the graph's bounding box with some padding
        cy.center(); // Center the graph
        cy.zoom(1); // Reset zoom level to default
    });

    // Add more view-related controls as needed...
}
export function applyEncryptionStyles(ele) {
    // Check if the element is an edge or node
    /*if (ele.isNode()) {
        ele.style({
            'background-color': '#000', // Change color to black for encrypted elements
            'border-color': '#000', // Optional: Adjust border color if needed
            'background-image': 'none' // Remove background image if it was set
        });
    } else if (ele.isEdge()) {
        ele.style({
            'line-color': '#000', // Change line color to black for encrypted edges
            'target-arrow-color': '#000' // Change arrow color to black for encrypted edges
        });
    }*/
    if (ele.isNode() || ele.isEdge()) {
        ele.addClass('encrypted').removeClass(['normal', 'hasUrl', 'article']);
    }
    console.log(ele.classes());
}
export async function applyDecryptionStyles(ele, decryptedData, imageModeEnabled) {
    // Check if the element is an edge or node
    if (ele.isNode()) {
        if (imageModeEnabled && decryptedData.url) {
           // ele.style({
            //    'background-image': `url(${decryptedData.url})`,
            //    'background-fit': 'cover',
            //    'border-color': ele.data('isArticle') ? '#ff0000' : '#808080',
            //});
            ele.addClass('hasUrl').removeClass('encrypted');
            await setImageSize(ele);
        } else {
            ele.addClass('normal').removeClass(['encrypted', 'hasUrl']);
            if (ele.data('isArticle')) {
                ele.addClass('article').removeClass('normal');
            }
            console.log(ele.classes());
            /*let backgroundColor = ele.data('isArticle') ? '#ff0000' : '#808080';
            let borderColor = backgroundColor;
            ele.style({
                'background-color': backgroundColor,
                'border-color': borderColor,
                'background-image': 'none',
            });
            */
        }
    } else if (ele.isEdge()) {
        // For edges, you can use decryptedData.description or any other relevant property
        // to decide the color or style of the edge
        /*let lineColor = decryptedData.description ? '#00f' : '#808080'; // Example: use blue if description is present, otherwise use gray
        let targetArrowColor = lineColor;
        ele.style({
            'line-color': lineColor,
            'target-arrow-color': targetArrowColor
        });*/
        ele.addClass('normal').removeClass('encrypted');
    }
}

export async function refreshImageStyle(ele) {
    if (imageModeEnabled && ele.data('url')) {
        ele.addClass('hasUrl').removeClass(['encrypted', 'normal', 'article']);
    } else {
        ele.removeClass('hasUrl');//.style({ 'width': 50, 'height': 50 }); // Reset to default dimensions

        //applyDecryptionStyles(ele, ele.data()); // Reapply decryption styles which consider 'isArticle'
    }
}

export async function setImageSize(ele) {
    if (ele.data('url')) {
        const img = new Image();

        try {
            await new Promise((resolve, reject) => {
                img.onload = () => {
                    if (imageModeEnabled) {
                        // Apply sizing only when image mode is enabled
                        const scalingFactor = 1.0; // Example scaling factor
                        const fontSize = Math.max(img.width, img.height) * scalingFactor;
                        console.log(img.width);
                        ele.data({
                            'width': img.width * scalingFactor,
                            'height': img.height * scalingFactor,
                        });
                        //ele.style({
                        //    'width': img.width * scalingFactor,
                        //    'height': img.height * scalingFactor,
                        //    'font-size': fontSize + 'px',
                        //});
                    }
                    resolve();
                };
                img.onerror = () => {
                    console.log(`Image load error for URL: ${ele.data('url')}`);
                    reject(`Failed to load image from URL: ${ele.data('url')}`);
                };
                img.src = ele.data('url');
            });
        } catch (error) {
            console.error(error);
        }
    }
}

export const toggleImageMode = async (cy) => {
    setImageMode(!getImageMode()); // Toggle the mode state
    console.log(imageModeEnabled);

    // Convert to an async loop to handle asynchronous operations properly
    for (let node of cy.nodes()) {
        console.log(node.data('url'));
        // Remove 'hasUrl' class if image mode is disabled or node is not eligible for having a URL background
        if (!imageModeEnabled || !node.data('url') || node.hasClass('encrypted')) {
            node.removeClass('hasUrl');
            if (!node.hasClass('encrypted') && !node.hasClass('article')) {
                node.addClass('normal'); // Ensure it falls back to normal if not encrypted or an article
            }
        } else {
            // Add 'hasUrl' class if image mode is enabled and node has a URL and is not encrypted
            node.addClass('hasUrl').removeClass('normal');
            await setImageSize(node); // Await the asynchronous operation
        }
        console.log(node.classes());
    }
    // Optionally, update styles after processing all nodes
    //cy.style().update(); // Update the style to reflect changes
};

