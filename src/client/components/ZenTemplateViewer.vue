<template>
    <div :class="`zen-template-viewer ${isCollapsed ? 'collapsed' : ''}`">
        <div class="header">
            <div class="title">ZEN TEMPLATE</div>
            <div class="language" @click="toggleCollapse">HTML</div>
        </div>
        <div ref="mount" class="monaco-mount viewer"></div>
    </div>
</template>


<script>
import { mapState } from 'vuex';
import monacoLoader from '../utils/monacoLoader';
import { preventReactivity } from '../utils/utils';

export default {
    data() {
        return {
            isCollapsed: false,
            editor: null,
        };
    },

    computed: {
        ...mapState(['zenTemplate']),
    },

    watch: {
        zenTemplate() {
            if (this.editor) {
                this.editor.setValue(this.zenTemplate);
            }
        },
    },

    mounted() {
        monacoLoader((monaco) => {
            if (monaco) {
                this.initMonaco(monaco);
                this.editor.setValue(this.zenTemplate);
            }
        });
    },

    beforeDestroy() {
        if (this.editor) {
            this.editor.dispose();
        }
    },

    methods: {
        initMonaco(monaco) {
            const editor = monaco.editor.create(this.$refs.mount, {
                theme: 'devwars',
                language: 'html',

                readOnly: true,
                automaticLayout: true, // TODO: Handle resize manually.

                folding: false,
                lineNumbers: true,
                hideCursorInOverviewRuler: true,
                renderLineHighlight: 'none',
                selectionHighlight: false,
                occurrencesHighlight: false,
                lineNumbersMinChars: 3,
                roundedSelection: false,
                renderIndentGuides: false,
                contextmenu: false,
                dragAndDrop: false,
                scrollbar: { useShadows: false },
                minimap: { enabled: false },
            });

            this.editor = preventReactivity(editor);
        },

        toggleCollapse() {
            this.isCollapsed = !this.isCollapsed;
        },
    },
};
</script>


<style lang="scss" scoped>
@import '../styles/variables';

.zen-template-viewer {
    $header-height: 2.25rem;

    position: relative;
    display: flex;
    flex: 1 1;
    flex-flow: column nowrap;
    overflow: hidden;

    &.collapsed {
        flex: 0 0 $header-height;

        .header {
            margin: 1rem 0;
            width: $header-height;
            flex: 1 0;
            flex-flow: column nowrap;
            align-items: flex-start;
            line-height: calc(#{$header-height} - 2px);
        }

        .title {
            order: 1;
            transform: rotate(-90deg) translate(0, 100%);
            transform-origin: bottom left;
        }

        .language {
            z-index: 1;
            margin-bottom: auto;
            width: 3.5rem;
            height: 3.5rem;
            text-align: right;
            background-color: $bg-color;

            transform: rotate(-90deg) translate(0, -100%);
            transform-origin: top right;
        }

        .monaco-mount {
            display: none;
        }
    }

    .header {
        display: flex;
        margin: 0 1rem;
        flex: 0 0 $header-height;
        align-items: center;
    }

    .language {
        margin-left: auto;
        text-transform: uppercase;
        cursor: pointer;
        user-select: none;
    }

    .title {
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
    }

    .monaco-mount {
        position: relative;
        flex: auto;
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
        }
    }
}
</style>
