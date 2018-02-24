const BG = '0b0c11';
const COMMENT = '546178';
const BLUE = '00c9ff';
const RED = 'ff007d';

const devwarsTheme = {
    base: 'vs-dark',
    inherit: false,
    rules: [
        { token: '', foreground: 'ffffff', background: BG },
        { token: 'comment', foreground: COMMENT },

        { token: 'key', foreground: 'ffffff' },
        { token: 'string.key.json', foreground: 'ffffff' },
        { token: 'variable.parameter', foreground: 'ffffff' },
        { token: 'attribute.name', foreground: 'ffffff' },
        { token: 'metatag.content.html', foreground: 'ffffff' },

        { token: 'number', foreground: BLUE },
        { token: 'attribute.value.number.css', foreground: BLUE },
        { token: 'attribute.value.unit.css', foreground: BLUE },

        { token: 'keyword.json', foreground: BLUE },
        { token: 'string', foreground: BLUE },
        { token: 'string.value.json', foreground: BLUE },
        { token: 'attribute.value', foreground: BLUE },
        { token: 'meta.tag', foreground: BLUE },

        { token: 'constant', foreground: RED },
        { token: 'keyword', foreground: RED },
        { token: 'tag', foreground: RED },
        { token: 'metatag.html', foreground: RED },
        { token: 'metatag.xml', foreground: RED },

        { token: 'attribute.value.hex.css', foreground: 'ffffff' },
    ],
    colors: {
        foreground: '#ffffff',
        'editor.foreground': '#ffffff',
        'editor.background': `#${BG}`,

        'editorCursor.foreground': '#ffffff',
        'editor.lineHighlightBackground': `#${COMMENT}26`,

        'editor.selectionBackground': `#${COMMENT}40`,
        'editor.inactiveSelectionBackground': `#${COMMENT}26`,

        'editorLineNumber.foreground': `#${COMMENT}80`,
        'editorOverviewRuler.border': '#00000000',

        'editorBracketMatch.border': `#${COMMENT}`,
        'editorIndentGuide.background': `#${COMMENT}80`,
    },
};

let isLoading = false;
const callbackQueue = [];

export default function monacoLoader(callback) {
    if (window.monaco) {
        callback(window.monaco);
    } else if (window.require) {
        callbackQueue.push(callback);

        if (!isLoading) {
            isLoading = true;
            window.require.config({ paths: { vs: '/vendor/vs' } });
            window.require(['vs/editor/editor.main'], () => {
                isLoading = false;
                window.monaco.editor.defineTheme('devwars', devwarsTheme);
                callbackQueue.forEach(cb => cb(window.monaco));
            });
        }
    } else {
        console.error('Could not load Monaco editor because \'window.require\' is missing!');
        callback();
    }
}
