<template>
    <div :class="`editor-player ${team} ${isCollapsed ? 'collapsed' : ''}`">
        <div class="header">
            <div class="username">{{ curUser ? (hasControl ? 'You' : curUser.username) : '' }}</div>
            <div @click="toggleCollapse" class="language">{{ this.language }}</div>
        </div>
        <div ref="mount" class="monaco-mount"></div>
        <div v-if="editable" class="controls">
            <button v-if="hasControl" @click="release" class="button">Release</button>
            <button v-else @click="control" class="button">Control</button>
            <button v-if="hasControl && !readOnly" @click="save" class="button">Save</button>
            <div v-if="locked" class="status">
                <LockOutlineIcon title="locked"/>
                <span>Locked</span>
            </div>
        </div>
    </div>
</template>


<script>
import io from 'socket.io-client';
import { mapState } from 'vuex';
import LockOutlineIcon from 'vue-material-design-icons/lock-outline';
import monacoLoader from '../utils/monacoLoader';
import { preventReactivity } from '../utils/utils';
import EditorSelection from '../../shared/EditorSelection';
import TextOperation from '../../shared/TextOperation';

export default {
    components: { LockOutlineIcon },

    props: ['namespace', 'team', 'language', 'editable', 'collapsible'],

    data() {
        return {
            socketId: '',

            curUser: null,
            locked: false,
            inSync: false,
            ignoreChanges: false,

            decorations: [],

            inFocus: false,
            isCollapsed: false,

            socket: null,
            editor: null,
        };
    },

    computed: {
        ...mapState(['user']),

        hasControl() {
            return this.curUser && this.socketId === this.curUser.socketId;
        },

        readOnly() {
            return !this.hasControl || !this.inSync || this.locked;
        },
    },

    watch: {
        hasControl() {
            this.inSync = false;
            this.socket.emit('init');
        },

        locked() {
            if (this.hasControl) {
                this.inSync = false;
                this.socket.emit('init');
            }
        },

        readOnly() {
            if (this.editor) {
                this.editor.updateOptions({
                    readOnly: this.readOnly,
                    hideCursorInOverviewRuler: this.readOnly,
                });
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
                language: this.language === 'js' ? 'javascript' : this.language,

                readOnly: true,
                automaticLayout: true, // TODO: Handle resize manually.

                lineNumbers: !!this.editable,
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

            editor.addAction({
                id: 'save-action',
                label: 'Save',
                keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_S],
                run: () => this.save(),
            });

            this.editor = preventReactivity(editor);

            editor.onDidFocusEditor(() => this.inFocus = true);
            editor.onDidBlurEditor(() => this.inFocus = false);

            editor.onDidChangeModelContent(this.onChange);
            editor.onDidChangeCursorSelection(this.onChangeSelection);

            this.initSocket();
        },

        initSocket() {
            const socketUrl = process.env.SOCKET_URL || '';
            const socket = io(`${socketUrl}${this.namespace}`, {
                transport: ['websocket'],
                upgrade: false,
            });

            this.socket = preventReactivity(socket);

            socket.on('connect', () => {
                this.socketId = socket.id;
                socket.emit('init');
            });

            socket.on('disconnect', () => {
                this.socketId = '';
            });

            socket.on('state', (state) => {
                this.ignoreChanges = true;

                this.curUser = state.curUser;
                this.locked = state.locked;

                this.editor.model.setValue(state.text);

                this.inSync = true;
                this.ignoreChanges = false;
            });

            socket.on('text', (text) => {
                this.ignoreChanges = true;

                this.editor.model.setValue(text);

                this.inSync = true;
                this.ignoreChanges = false;
            });

            socket.on('cur-user', (user) => {
                this.curUser = user;
            });

            socket.on('locked', (locked) => {
                this.locked = locked;
            });

            socket.on('op', (op) => {
                if (this.readOnly && !this.hasControl) {
                    const edit = TextOperation.fromObject(op).toMonacoEdit();
                    this.editor.model.applyEdits([edit]);
                }
            });

            socket.on('sel', (sel) => {
                if (this.hasControl) {
                    return;
                }

                const editorSel = EditorSelection.fromObject(sel);
                const ranges = editorSel.toMonacoRanges();

                const newDecorations = [
                    { range: ranges.cursor, options: { className: `cursor-${this.team}` } },
                ];

                if (editorSel.hasSelection()) {
                    newDecorations.push(
                        { range: ranges.selection, options: { className: `selection-${this.team}` } },
                    );
                }

                this.decorations = this.editor.deltaDecorations(this.decorations, newDecorations);

                if (!this.inFocus) {
                    const pos = new monaco.Position(editorSel.cursorRow, editorSel.cursorCol);
                    this.editor.revealPositionInCenterIfOutsideViewport(pos);
                }
            });
        },

        onChange(contentChange) {
            if (this.ignoreChanges || !this.hasControl || this.locked) {
                return;
            }

            for (const change of contentChange.changes) {
                const op = TextOperation.fromMonacoChange(change).toObject();
                this.socket.emit('op', op);
            }
        },

        onChangeSelection(selectionChange) {
            if (!this.hasControl) {
                return;
            }

            const sel = EditorSelection.fromMonacoChange(selectionChange.selection);
            this.socket.emit('sel', sel.toObject());
        },

        save() {
            if (!this.readOnly) {
                this.socket.emit('save');
            }
        },

        control() {
            this.socket.emit('control');
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
        flex: 1 1 100%;
        overflow: hidden;

        /deep/ {
            .monaco-editor {
                position: absolute;
                top: 0;
                left: 0;
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

            .cursor-blue:after,
            .cursor-red:after {
                content: "";
                position: absolute;
                width: 2px;
                height: 100%;

                animation: blink 1s steps(2, start) infinite;
            }

            .cursor-blue:after {
                background-color: $blue-team-color;
            }

            .cursor-red:after {
                background-color: $red-team-color;
            }

            .selection-blue, {
                opacity: 0.15;
                background-color: $blue-team-color;
            }

            .selection-red {
                opacity: 0.15;
                background-color: $red-team-color;
            }
        }
    }
}
</style>
