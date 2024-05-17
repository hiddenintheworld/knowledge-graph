export function getFormValues() {
    return {
        userId: document.getElementById('toggleUserId').checked ? document.getElementById('userIdInput').value.trim() : "",
        typesInput: document.getElementById('toggleType').checked ? document.getElementById('typeInput').value.trim() : "",
        url: document.getElementById('toggleUrl').checked ? document.getElementById('urlInput').value.trim() : "",
        privacyLevel: document.getElementById('togglePrivacyLevel').checked ? document.getElementById('privacyLevelInput').value.trim() : "",
        articleTitle: document.getElementById('article-title').value.trim(),
        apiInputContent: document.getElementById('apiInput').value.trim(),
        hashtags: document.getElementById('article-hashtags').value.trim(),
        nodeLabel: document.getElementById('node-id').value.trim(),
        sourceLabel: document.getElementById('source-id').value.trim(),
        targetLabel: document.getElementById('target-id').value.trim(),
        description: document.getElementById('edge-description').value.trim(),
        articleDescription: document.getElementById('article-description').value.trim(),
        resultsBox: document.getElementById('resultsBox').value.split('\n'),
        preprocessingLogic: document.getElementById('preprocessingInput').value.trim(),
        postprocessingLogic: document.getElementById('postprocessingInput').value.trim(),
        apiEndpoint: document.getElementById('apiEndpointInput').value.trim(),
    };
}
