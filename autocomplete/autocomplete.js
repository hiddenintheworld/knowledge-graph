import {NodelabelToHashMapping, EdgelabelToHashMapping, HashToNodelabelMapping, HashToEdgelabelMapping,
    hashToNodeIDMapping, hashToEdgeIDMapping, NodeIDTohashMapping, EdgeIDTohashMapping} from '../state.js';  

export function getWord(cm, cursor) {
  var line = cm.getLine(cursor.line);
  var start = line.lastIndexOf('[', cursor.ch - 1) + 1;
  var end = line.indexOf(']', start);
  end = end === -1 ? cursor.ch : end;
  return line.slice(start, end);
}

export function initializeAutocomplete(editor) {
    var currentWord;
    editor.codemirror.on('inputRead', async (cm, event) => {
      if (event.text[0] === '[' || (event.text[0] && cm.getTokenAt(cm.getCursor()).string.includes('['))) {
        currentWord = getWord(cm, cm.getCursor());
        if (currentWord.startsWith('[') && !currentWord.endsWith(']')) {
          showAutocomplete(cm, currentWord);
        }
      }
    });
  
    editor.codemirror.on('keydown', (cm, event) => {
      if (event.keyCode === 8 || event.keyCode === 46) { // Backspace or Delete
        currentWord = getWord(cm, cm.getCursor());
        if (currentWord.startsWith('[') && !currentWord.endsWith(']')) {
          showAutocomplete(cm, currentWord);
        } else {
          closeAutocomplete();
        }
      }
    });
  }
  export function showAutocomplete(cm, currentWord) {
  const cursor = cm.getCursor();
  const overlay = document.getElementById('autocomplete-overlay') || createAutocompleteOverlay();
  const coords = cm.cursorCoords(true, 'page');

  overlay.style.left = `${coords.left}px`;
  overlay.style.top = `${coords.bottom}px`;
  overlay.style.display = 'block';

  const suggestions = filterNodeLabels(currentWord.replace('[', ''));
  console.log(suggestions);
  populateOverlay(overlay, suggestions, cm, cursor, currentWord);
}

export function createAutocompleteOverlay() {
  const overlay = document.createElement('div');
  overlay.id = 'autocomplete-overlay';
  overlay.className = 'autocomplete-overlay';
  document.body.appendChild(overlay);
  return overlay;
}

export function closeAutocomplete() {
    const overlay = document.getElementById('autocomplete-overlay');
    if (overlay) {
        overlay.style.display = 'none';
    }
}

export function populateOverlay(overlay, suggestions, cm, cursor, currentWord) {
    overlay.innerHTML = '';  // Clear previous suggestions
    suggestions.forEach(suggestion => {
        const option = document.createElement('div');
        option.className = 'autocomplete-option';
        option.textContent = suggestion;
        option.onclick = () => {
            cm.replaceRange(suggestion, { line: cursor.line, ch: cursor.ch - currentWord.length + 1 }, { line: cursor.line, ch: cursor.ch });
            closeAutocomplete();
        };
        overlay.appendChild(option);
    });

    if (suggestions.length === 0) {
        overlay.style.display = 'none';  // Hide overlay if no suggestions
    } else {
        overlay.style.display = 'block';
    }
}


export function filterNodeLabels(inputText) {
    let suggestions = [];
    // Iterate over the HashToNodelabelMapping to find matching labels
    for (let hash in HashToNodelabelMapping) {
        let label = HashToNodelabelMapping[hash];
        // Check if the label matches the inputText in the fuzzy manner
        if (matchesFuzzySearch(label, inputText)) {
            suggestions.push(label);
        }
    }
    return suggestions;
}

export function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

export function matchesFuzzySearch(label, inputText) {
    let pattern = escapeRegExp(inputText).split('').join('.*?');
    let regex = new RegExp(pattern, 'i');
    return regex.test(label);
}
