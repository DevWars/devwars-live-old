const BG = '0b0c11';
const COMMENT = '546178';
const BLUE = '00c9ff';
const RED = 'ff007d';

// NOTE: This is required from the live-editor component.
export default {
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

        'editor.selectionBackground': `#${COMMENT}33`,
        'editor.inactiveSelectionBackground': `#${COMMENT}20`,

        'editorLineNumber.foreground': `#${COMMENT}80`,
        'editorOverviewRuler.border': '#00000000',

        'editorBracketMatch.border': `#${COMMENT}`,
        'editorIndentGuide.background': `#${COMMENT}80`,
    },
};
