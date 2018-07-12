<template>
    <div :class="classNames">
        <div class="header">
            <div v-if="currentUser" class="username">{{ currentUser.username }}</div>
            <div v-else-if="owner" class="username faded">{{ `Waiting on ${owner.username}` }}</div>
            <div class="language" @click="toggleCollapse">{{ language }}</div>
        </div>
        <div ref="mount" :class="`monaco-mount ${editable ? '' : 'viewer'}`"></div>
        <div v-if="editable" class="controls">
            <button v-if="hasControl" @click="release">Release</button>
            <button v-else @click="control">Control</button>
            <button v-if="hasControl && !readOnly" @click="save">Save</button>
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

    props: {
        id: { type: Number, required: true },
        team: { type: String, required: true },
        language: { type: String, required: true },
        locked: { type: Boolean, default: true },
        hidden: { type: Boolean, default: false },
        editable: { type: Boolean, default: false },
        vertical: { type: Boolean, default: false },
        collapsible: { type: Boolean, default: true },
    },

    data() {
        return {
            socketId: null,

            currentUser: null,
            currentSocketId: null,

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

        owner() {
            return this.$store.state.players.find((player) => {
                return player.editorId === this.id;
            });
        },

        hasControl() {
            return this.currentSocketId && this.currentSocketId === this.socketId;
        },

        readOnly() {
            return !this.hasControl || !this.inSync || this.locked;
        },

        classNames() {
            let className = `editor-player ${this.team}`;

            if (this.vertical) {
                className += ' vertical';
            }

            if (this.isCollapsed) {
                className += ' collapsed';
            }

            return className;
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

        collapsible() {
            if (!this.collapsible && this.isCollapsed) {
                this.isCollapsed = false;
            }
        },
    },

    mounted() {
        monacoLoader((monaco) => {
            if (monaco && !this._isDestroyed) {
                this.initMonaco(monaco);
            }
        });
    },

    beforeDestroy() {
        if (this.socket) {
            this.socket.disconnect();
        }

        if (this.editor) {
            this.editor.dispose();
        }
    },

    methods: {
        initMonaco(monaco) {
            const editor = monaco.editor.create(this.$refs.mount, {
                theme: 'devwars',
                language: this.language === 'js' ? 'javascript' : this.language,

                readOnly: true,
                automaticLayout: true, // TODO: Handle resize manually.

                folding: false,
                lineNumbers: this.editable,
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
                // eslint-disable-next-line no-bitwise
                keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_S],
                run: () => this.save(),
            });

            this.editor = preventReactivity(editor);

            editor.onDidFocusEditor(() => { this.inFocus = true; });
            editor.onDidBlurEditor(() => { this.inFocus = false; });

            editor.onDidChangeModelContent(this.onChange);
            editor.onDidChangeCursorSelection(this.onChangeSelection);

            this.initSocket();
        },

        initSocket() {
            const socketUrl = window.SOCKET_URL || '';
            const socket = io(`${socketUrl}/${this.id}`, {
                transport: ['websocket'],
                upgrade: false,
            });

            this.socket = preventReactivity(socket);

            socket.on('connect', () => {
                this.socketId = socket.id;
                socket.emit('init');
            });

            socket.on('disconnect', () => {
                this.socketId = null;
            });

            socket.on('state', (state) => {
                this.ignoreChanges = true;

                this.currentUser = state.currentUser;
                this.currentSocketId = state.currentSocketId;

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

            socket.on('currentUser', ({ user, socketId }) => {
                this.currentUser = user;
                this.currentSocketId = socketId;
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

                const newDecorations = [];
                let primarySelection;

                for (const [index, s] of sel.entries()) {
                    const selection = EditorSelection.fromObject(s);
                    const ranges = selection.toMonacoRanges();

                    if (index === 0) {
                        primarySelection = selection;
                    }

                    newDecorations.push({
                        range: ranges.cursor,
                        options: { className: `cur-${this.team}` },
                    });

                    if (selection.hasSelection()) {
                        newDecorations.push({
                            range: ranges.selection,
                            options: { className: `sel-${this.team}` },
                        });
                    }
                }

                this.decorations = this.editor.deltaDecorations(this.decorations, newDecorations);

                if (!this.inFocus) {
                    const pos = new monaco.Position(primarySelection.cursorRow, primarySelection.cursorCol);
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

        onChangeSelection({ selection, secondarySelections }) {
            if (!this.hasControl) {
                return;
            }

            const sel = [EditorSelection.fromMonacoChange(selection).toObject()];
            for (const secondarySelection of secondarySelections) {
                sel.push(EditorSelection.fromMonacoChange(secondarySelection).toObject());
            }

            this.socket.emit('sel', sel);
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

        &:not(.vertical) {
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

            .sel-blue, {
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
