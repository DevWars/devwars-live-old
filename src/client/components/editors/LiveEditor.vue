<template>
    <div :class="[team, { collapsed, vertical }]" class="live-editor">
        <EditorHeader
            :title="(curUser || owner || {}).username"
            :dimmed="!curUser"
            :team="team"
            :language="language"
            :vertical="vertical"
            :collapsed="collapsed"
            @collapse="onToggleCollapse"
        />
        <Editor
            ref="editor"
            :language="language"
            :read-only="readOnly"
            class="editor"
            @init="onEditorInit"
            @focus="focused = true"
            @blur="focused = false"
            @change="onEditorChange"
            @selection="onEditorSelection"
            @save="onEditorSave"
        />
        <div v-if="editable" class="controls">
            <button v-if="hasControl" @click="socket.emit('release')">Release</button>
            <button v-else @click="socket.emit('control')">Control</button>
            <button v-if="hasControl && !readOnly" @click="socket.emit('save')">Save</button>
            <div v-if="locked" class="status">
                <LockOutlineIcon title="Locked"/>
                <span>Locked</span>
            </div>
        </div>
    </div>
</template>


<script>
import io from 'socket.io-client';
import { mapState } from 'vuex';
import LockOutlineIcon from 'vue-material-design-icons/LockOutline';
import EditorSelection from '../../../shared/EditorSelection';
import TextOperation from '../../../shared/TextOperation';
import { preventReactivity } from '../../utils/utils';
import Editor from './Editor';
import EditorHeader from './EditorHeader';

export default {
    components: { Editor, EditorHeader, LockOutlineIcon },

    props: {
        id: { type: Number, required: true },
        team: { type: String, required: true },
        language: { type: String, required: true },
        editable: { type: Boolean, default: false },
        locked: { type: Boolean, default: true },
        vertical: { type: Boolean, default: false },
        collapsible: { type: Boolean, default: true },
    },

    data: () => ({
        socket: null,
        socketId: null,

        curUser: null,
        curSocketId: null,

        inSync: false,
        ignoreChanges: false,
        focused: false,
        collapsed: false,
    }),

    computed: {
        ...mapState(['user', 'players']),

        owner() {
            return this.players.find(p => p.editorId === this.id);
        },

        hasControl() {
            return (this.socketId && this.curSocketId === this.socketId);
        },

        readOnly() {
            return (!this.hasControl || !this.inSync || this.locked);
        },
    },

    watch: {
        hasControl() {
            this.inSync = false;
        },

        locked() {
            if (this.hasControl) {
                this.inSync = false;
            }
        },

        inSync(isInSync) {
            if (!isInSync && this.socket) {
                this.socket.emit('init');
            }
        },
    },

    beforeDestroy() {
        if (this.socket) {
            this.socket.disconnect();
        }
    },

    methods: {
        onToggleCollapse() {
            if (this.collapsible) {
                this.collapsed = !this.collapsed;
            }
        },

        onEditorInit() {
            const socket = io(`${window.SOCKET_URL || ''}/${this.id}`, {
                transport: ['websocket'],
                upgrade: false,
            });

            socket.on('connect', () => {
                this.socketId = socket.id;
                socket.emit('init');
            });

            socket.on('disconnect', () => {
                this.socketId = null;
            });

            socket.on('state', (state) => {
                this.ignoreChanges = true;

                // TODO: Change current to cur on socket object.
                this.curUser = state.currentUser;
                this.curSocketId = state.currentSocketId;

                this.$refs.editor.setText(state.text);

                this.inSync = true;
                this.ignoreChanges = false;
            });

            socket.on('text', (text) => {
                this.ignoreChanges = true;

                this.$refs.editor.setText(text);

                this.inSync = true;
                this.ignoreChanges = false;
            });

            socket.on('currentUser', ({ user, socketId }) => {
                this.curUser = user;
                this.curSocketId = socketId;
            });

            socket.on('op', (op) => {
                if (this.readOnly && !this.hasControl) {
                    this.$refs.editor.applyTextOperation(TextOperation.fromObject(op));
                }
            });

            socket.on('sel', (selections) => {
                if (!this.hasControl) {
                    const editorSelections = selections.map(s => EditorSelection.fromObject(s));
                    this.$refs.editor.applySelectionDecorators(editorSelections, this.team, !this.focused);
                }
            });

            this.socket = preventReactivity(socket);
        },

        onEditorChange(contentChange) {
            if (this.ignoreChanges || this.locked || !this.hasControl) return;

            for (const change of contentChange.changes) {
                const op = TextOperation.fromMonacoChange(change).toObject();
                this.socket.emit('op', op);
            }
        },

        onEditorSelection({ selection, secondarySelections }) {
            if (!this.hasControl) return;

            const editorSelections = [EditorSelection.fromMonacoChange(selection).toObject()];
            for (const secondarySelection of secondarySelections) {
                editorSelections.push(EditorSelection.fromMonacoChange(secondarySelection).toObject());
            }

            this.socket.emit('sel', editorSelections);
        },

        onEditorSave() {
            if (this.socket && !this.readOnly) {
                this.socket.emit('save');
            }
        },
    },
};
</script>


<style lang="scss" scoped>
@import '../../styles/variables';
.live-editor {
    position: relative;
    display: flex;
    flex: 1 1 100%;
    flex-flow: column nowrap;
    overflow: hidden;

    &.blue {
        color: $blue-team-color;
    }

    &.red {
        color: $red-team-color;
    }

    &.collapsed {
        flex: 0 0 2.25rem;

        &.vertical {
            flex: 0 0 2.25rem;
        }

        .editor {
            display: none;
        }
    }

    .controls {
        display: flex;
        margin: .5rem;
        flex-flow: row;

        button {
            margin-right: .5rem;
        }

        .status {
            display: flex;
            margin-right: auto;
            align-items: center;

            .material-design-icon {
                font-size: 1.5rem;
                margin-right: 0.25rem;
            }
        }
    }
}
</style>
