<template>
    <div :class="`editor-player ${team} ${isCollapsed ? 'collapsed' : ''}`">
        <div class="header">
            <div class="username">{{ owner ? (hasControl ? 'You' : owner) : 'Username' }}</div>
            <div @click="toggleCollapse" class="language">{{ languageTitle }}</div>
        </div>
        <div ref="mount" class="monaco-mount"></div>
        <div v-if="editable" class="controls">
            <button v-if="hasControl" @click="release" class="button">Release</button>
            <button v-if="hasControl" @click="save" class="button">Save</button>
            <button v-else @click="possess" class="button">Possess</button>
        </div>
    </div>
</template>


<script>
import io from 'socket.io-client';
import TextOperation from '../../shared/text-operation';
import preventReactivity from '../utils/prevent-reactivity';
import monacoLoader from '../utils/monaco-loader';

const NAMESPACES = {
    blue_html: '/1',
    blue_css: '/2',
    blue_javascript: '/3',
    red_html: '/4',
    red_css: '/5',
    red_javascript: '/6',
};

export default {
    props: ['team', 'language', 'editable', 'collapsible'],

    data() {
        return {
            owner: '',
            socketId: '',
            inSync: false,
            ignoreChanges: false,

            isCollapsed: false,

            socket: null,
            editor: null,
        };
    },

    computed: {
        namespace() {
            return NAMESPACES[`${this.team}_${this.language}`];
        },

        hasControl() {
            return this.editable && this.socketId && this.socketId === this.owner;
        },

        readOnly() {
            return !this.hasControl || !this.inSync;
        },

        languageTitle() {
            return this.language === 'javascript' ? 'js' : this.language;
        },
    },

    watch: {
        hasControl() {
            this.inSync = false;
            this.socket.emit('state');
        },

        readOnly() {
            if (this.editor) {
                this.editor.updateOptions({ readOnly: this.readOnly });
            }
        },
    },

    mounted() {
        monacoLoader((monaco) => {
            if (monaco) {
                this.initMonaco(monaco);
            }
        });
    },

    beforeDestroy() {
        this.socket.disconnect();
        this.editor.dispose();
    },

    methods: {
        initMonaco(monaco) {
            const editor = monaco.editor.create(this.$refs.mount, {
                theme: 'devwars',
                language: this.language,

                readOnly: true,
                automaticLayout: true, // TODO: Handle resize manually.

                renderLineHighlight: 'none',
                selectionHighlight: false,
                occurrencesHighlight: false,
                lineNumbersMinChars: 3,
                roundedSelection: false,
                renderIndentGuides: false,
                contextmenu: false,
                scrollbar: { useShadows: false },
                minimap: { enabled: false },
            });

            editor.addAction({
                id: 'save-action',
                label: 'Save',
                keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_S],
                run: () => this.save(),
            });

            this.editor = preventReactivity(editor);
            editor.onDidChangeModelContent(this.onChange);

            this.initSocket();
        },

        initSocket() {
            const socket = io(this.namespace, { transport: ['websocket'] });
            this.socket = preventReactivity(socket);

            socket.on('connect', () => {
                this.socketId = socket.id;
                socket.emit('state');
            });

            socket.on('disconnect', () => {
                this.socketId = '';
            });

            socket.on('state', (state) => {
                this.ignoreChanges = true;

                this.owner = state.activeUser;
                this.editor.model.setValue(state.content);

                this.inSync = true;
                this.ignoreChanges = false;
            });

            socket.on('user', (user) => {
                this.owner = user;
            });

            socket.on('op', (op) => {
                if (this.readOnly) {
                    const edit = TextOperation.fromObject(op).toMonacoEdit();
                    this.editor.model.applyEdits([edit]);
                }
            });
        },

        onChange(contentChange) {
            if (this.ignoreChanges || !this.hasControl) {
                return;
            }

            for (const change of contentChange.changes) {
                const op = TextOperation.fromMonacoChange(change).toObject();
                this.socket.emit('op', op);
            }
        },

        save() {
            if (!this.readOnly) {
                this.socket.emit('save');
            }
        },

        possess() {
            this.socket.emit('possess');
        },

        release() {
            this.socket.emit('release');
        },

        toggleCollapse() {
            if (this.collapsible) {
                this.isCollapsed = !this.isCollapsed;
            }
        },
    },
};
</script>


<style lang="scss">
// Global monaco overrides for styles that are not exposed through the API.
.editor-player .monaco-editor {
    position: absolute;
    top: 0;
    left: 0;

    .monaco-scrollable-element {
        > .scrollbar > .slider {
            background: rgba(#546178, 0.10) !important;

            &:hover {
                background: rgba(#546178, 0.20) !important;
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
</style>


<style lang="scss" scoped>
@import '../styles/variables';

.editor-player {
    $header-height: 2.25rem;

    position: relative;
    display: flex;
    flex: 1;
    flex-flow: column nowrap;
    overflow: hidden;

    &.blue {
        color: $blue-team-color;
    }

    &.red {
        color: $red-team-color;
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
    }

    .username {
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
    }

    .controls {
        margin: .5rem;
    }

    .monaco-mount {
        position: relative;
        flex: 1 1 100%;
        overflow: hidden;
    }
}
</style>
