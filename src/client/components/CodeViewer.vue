<template>
    <div :class="`editor-player ${isCollapsed ? 'collapsed' : ''}`">
        <div class="header">
            <div class="language" @click="toggleCollapse">{{ language }}</div>
        </div>
        <div ref="mount" class="monaco-mount viewer"></div>
    </div>
</template>


<script>
import { mapGetters } from 'vuex';
import monacoLoader from '../utils/monacoLoader';

export default {

    props: {
        language: { type: String, required: true },
        hidden: { type: Boolean, default: true },
        collapsible: { type: Boolean, default: true },
    },

    data() {
        return {

            inSync: false,
            ignoreChanges: true,

            inFocus: false,
            isCollapsed: false,

            editor: null,
        };
    },

    computed: {
        ...mapGetters(['getZenTemplate']),

        readOnly() {
            return true;
        },
    },

    watch: {
        getZenTemplate() {
            if (this.editor) {
                this.editor.setValue(this.$store.state.zenTemplate)
            }
        }
    },

    mounted() {
        monacoLoader((monaco) => {
            if (monaco) {
                this.initMonaco(monaco);
                this.setTemplateText();
            }
        });
    },

    methods: {
        setTemplateText() {
            return this.editor.setValue(this.$store.state.zenTemplate);
        },

        initMonaco(monaco) {
            const editor = monaco.editor.create(this.$refs.mount, {
                theme: 'devwars',
                language: this.language === 'js' ? 'javascript' : this.language,

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

            this.editor = editor;
        },

        toggleCollapse() {
            if (this.collapsible) {
                this.isCollapsed = !this.isCollapsed;
            }
        },
    },
};
</script>


<style lang="scss" scoped>
@import '../styles/variables';

.editor-player {
    $header-height: 2.25rem;

    position: relative;
    display: flex;
    flex: 1 1 100%;
    flex-flow: column nowrap;
    overflow: hidden;

    &.blue {
        color: $blue-team-color;

        .faded {
            color: rgba($blue-team-color, 0.25);
        }
    }

    &.red {
        color: $red-team-color;

        .faded {
            color: rgba($red-team-color, 0.25);
        }
    }

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

        .username {
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

        .controls,
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

    .username {
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
    }

    .controls {
        display: flex;
        margin: .5rem;
        flex-flow: row nowrap;

        button {
            margin-right: 0.5rem;
        }

        .status {
            display: flex;
            margin-right: 0.5rem;
            align-items: center;

            .material-design-icon {
                font-size: 1.5rem;
                margin-right: 0.25rem;
            }
        }
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

            .cur-blue,
            .cur-red {
                &:after {
                    content: "";
                    position: absolute;
                    width: 2px;
                    height: 100%;
                }
            }

            .cur-blue:after {
                background-color: $blue-team-color;
            }

            .cur-red:after {
                background-color: $red-team-color;
            }

            .sel-blue {
                opacity: 0.15;
                background-color: $blue-team-color;
            }

            .sel-red {
                opacity: 0.15;
                background-color: $red-team-color;
            }
        }
    }
}
</style>
