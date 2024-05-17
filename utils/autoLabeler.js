import {getNextUntitledId} from '../state.js';


export function getAutoLabel() {
    const id = getNextUntitledId();
    return `Untitled-${id}`;
}

export function ensureNodeHasLabel(node) {
    if (!node.data('label')) {
        node.data('label', getAutoLabel());
    }
}

export function ensureEdgeHasLabel(edge) {
    if (!edge.data('label')) {
        edge.data('label', getAutoLabel());
    }
}


