const BG = '0b0c11';
const COMMENT = '303745';
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
        'foreground': '#ffffff',
        'editor.foreground': '#ffffff',
        'editor.background': `#${BG}`,

        'editorCursor.foreground': '#ffffff',
        'editor.lineHighlightBackground': `#${COMMENT}20`,

        'editor.selectionBackground': '#b9cdff20',
        'editor.inactiveSelectionBackground': '#b9cdff10',

        'editorLineNumber.foreground': `#${COMMENT}`,
        'editorOverviewRuler.border': '#00000000',

        'editorBracketMatch.border': `#${COMMENT}`,
        'editorIndentGuide.background': `#${COMMENT}40`,
    },
};

export default function loadMonaco(callback) {
    if (window.monaco) {
        callback(window.monaco);
    } else {
        window.require.config({ paths: { 'vs': 'vendor/vs' }});
        window.require(['vs/editor/editor.main'], () => {
            window.monaco.editor.defineTheme('devwars', devwarsTheme);
            callback(window.monaco);
        });
    }
}
