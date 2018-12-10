<template>
    <div ref="monaco" class="Editor"></div>
</template>


<script>
import monacoLoader from '../../utils/monacoLoader';
import { preventReactivity } from '../../utils/utils';

export default {
    props: {
        text: { type: String, default: '' },
        language: { type: String, required: true },
        readOnly: { type: Boolean, default: false },
    },

    data: () => ({
        decorations: [],
        editor: null,
    }),

    watch: {
        text(newText) {
            if (this.editor) {
                this.editor.getModel().setValue(newText);
            }
        },

        language() {
            throw new Error('Editor language cannot be changed after instantiation');
        },

        readOnly(newValue) {
            if (this.editor) {
                this.editor.updateOptions({
                    readOnly: newValue,
                    HideCursorInOverviewRuler: newValue,
                });
            }
        },
    },

    mounted() {
        monacoLoader((monaco) => {
            if (monaco && !this._isDestroyed) {
                this.onMonacoLoaded(monaco);
            }
        });
    },

    beforeDestroy() {
        if (this.editor) { this.editor.dispose(); }
    },

    methods: {
        onMonacoLoaded(monaco) {
            this.editor = preventReactivity(monaco.editor.create(this.$refs.monaco, {
                value: this.text,
                language: this.language === 'js' ? 'javascript' : this.language,
                readOnly: this.readOnly,
                lineNumbers: !this.readOnly,
                automaticLayout: true,

                theme: 'devwars',
                contextmenu: false,
                dragAndDrop: false,
                folding: false,
                hideCursorInOverviewRuler: true,
                lineNumbersMinChars: 3,
                minimap: { enabled: false },
                occurrencesHighlight: false,
                renderIndentGuides: false,
                renderLineHighlight: 'none',
                roundedSelection: false,
                scrollbar: { useShadows: false },
                selectionHighlight: false,
            }));

            this.editor.addAction({
                id: 'save-action',
                label: 'Save',
                // eslint-disable-next-line no-bitwise
                keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_S],
                run: () => this.$emit('save'),
            });

            this.editor.onDidFocusEditorWidget(() => this.$emit('focus'));
            this.editor.onDidBlurEditorWidget(() => this.$emit('blur'));
            this.editor.onDidChangeModelContent(change => this.$emit('change', change));
            this.editor.onDidChangeCursorSelection(selections => this.$emit('selection', selections));

            this.$emit('init');
        },

        setText(text) {
            if (this.editor) {
                this.editor.getModel().setValue(text);
            }
        },

        applyTextOperation(op) {
            if (this.editor) {
                const edit = op.toMonacoEdit();
                this.editor.getModel().applyEdits([edit]);
            }
        },

        applySelectionDecorators(selections, color = '', scrollToCursor = false) {
            if (!this.editor) return;

            const newDecorations = [];

            let primarySelection;
            for (const selection of selections) {
                const ranges = selection.toMonacoRanges();

                // First selection is the primary selection.
                if (!primarySelection) {
                    primarySelection = selection;
                }

                newDecorations.push({
                    range: ranges.cursor,
                    options: { className: `myCursor ${color}` },
                });

                if (selection.hasSelection()) {
                    newDecorations.push({
                        range: ranges.selection,
                        options: { className: `mySelection ${color}` },
                    });
                }
            }

            this.decorations = this.editor.deltaDecorations(this.decorations, newDecorations);

            if (scrollToCursor) {
                const { cursorRow, cursorCol } = primarySelection;
                this.editor.revealPositionInCenterIfOutsideViewport(new monaco.Position(cursorRow, cursorCol));
            }
        },
    },
};
</script>


<style lang="scss" scoped>
@import 'settings.scss';
.Editor {
    position: relative;
    flex: 1 1 100%;
    overflow: hidden;

    /deep/ {
        .monaco-editor {
            position: absolute;
            top: 0;
            left: 0;
        }

        .minimap {
            display: none;
        }

        .monaco-scrollable-element {
            > .scrollbar > .slider {
                background: rgba(#546178, 0.15) !important;

                &:hover {
                    background: rgba(#546178, 0.25) !important;
                }

                &.active {
                    background: rgba(#546178, 0.5) !important;
                }
            }

            > .invisible.fade {
                transition: opacity 150ms linear !important;
            }
        }

        .myCursor,
        .mySelection {
            color: #fff;

            &.blue {
                color: $blue;
            }

            &.red {
                color: $red;
            }
        }

        .myCursor:after {
            z-index: 100;
            content: "";
            position: absolute;
            width: 2px;
            height: 100%;

            background-color: currentColor;
            box-shadow: 0 0 4px currentColor;
        }

        .mySelection {
            opacity: .2;
            background-color: currentColor;
        }
    }
}
</style>
