<template>
    <div :class="[team, { collapsed, vertical }]" class="live-editor">
        <EditorHeader
            :title="user && user.username"
            :placeholder="owner && owner.username"
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
            <button v-if="hasControl" @click="onRelease">Release</button>
            <button v-else @click="onControl">Control</button>
            <button v-if="hasControl && !readOnly" @click="onSave">Save</button>
            <div v-if="locked" class="status">
                <LockOutlineIcon title="Locked"/>
                <span>Locked</span>
            </div>
        </div>
    </div>
</template>


<script>
import { mapState } from 'vuex';
import LockOutlineIcon from 'vue-material-design-icons/LockOutline';
import EditorSelection from '../../../shared/EditorSelection';
import TextOperation from '../../../shared/TextOperation';
import eventBus from '../../services/eventBus';
import socket from '../../services/socket';
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
        user: null,
        userSocketId: null,

        inSync: false,
        ignoreChanges: false,
        focused: false,
        collapsed: false,
    }),

    computed: {
        ...mapState(['socketId', 'players']),

        owner() {
            return this.players.find(p => p.editorId === this.id);
        },

        hasControl() {
            return (this.socketId && this.socketId === this.userSocketId);
        },

        readOnly() {
            return (!this.hasControl || !this.inSync || this.locked);
        },
    },

    watch: {
        socketId(socketId) {
            if (socketId) {
                this.fetchState();
            }
        },

        hasControl() {
            this.inSync = false;
        },

        locked() {
            if (this.hasControl) {
                this.inSync = false;
            }
        },

        inSync(isInSync) {
            if (this.socketId && !isInSync) {
                this.fetchState();
            }
        },
    },

    beforeDestroy() {
        eventBus.$off(`editor-${this.id}.state`, this.onSocketState);
        eventBus.$off(`editor-${this.id}.text`, this.onSocketText);
        eventBus.$off(`editor-${this.id}.user`, this.onSocketUser);
        eventBus.$off(`editor-${this.id}.o`, this.onSocketOperation);
        eventBus.$off(`editor-${this.id}.s`, this.onSocketSelections);
    },

    methods: {
        fetchState() {
            socket.emit('e.state', this.id);
        },

        onToggleCollapse() {
            if (this.collapsible) {
                this.collapsed = !this.collapsed;
            }
        },

        onRelease() {
            socket.emit('e.release', this.id);
        },

        onControl() {
            socket.emit('e.control', this.id);
        },

        onSave() {
            socket.emit('e.save', this.id);
        },

        onEditorInit() {
            eventBus.$on(`editor-${this.id}.state`, this.onSocketState);
            eventBus.$on(`editor-${this.id}.text`, this.onSocketText);
            eventBus.$on(`editor-${this.id}.user`, this.onSocketUser);
            eventBus.$on(`editor-${this.id}.o`, this.onSocketOperation);
            eventBus.$on(`editor-${this.id}.s`, this.onSocketSelections);

            this.fetchState();
        },

        onEditorChange(contentChange) {
            if (this.ignoreChanges || this.locked || !this.hasControl) return;

            for (const change of contentChange.changes) {
                const operation = TextOperation.fromMonacoChange(change).toObject();
                socket.emit('e.o', [this.id, operation]);
            }
        },

        onEditorSelection({ selection, secondarySelections }) {
            if (!this.hasControl) return;

            const editorSelections = [EditorSelection.fromMonacoChange(selection).toObject()];
            for (const secondarySelection of secondarySelections) {
                editorSelections.push(EditorSelection.fromMonacoChange(secondarySelection).toObject());
            }

            socket.emit('e.s', [this.id, editorSelections]);
        },

        onEditorSave() {
            if (!this.readOnly) {
                socket.emit('e.save', this.id);
            }
        },

        onSocketState(state) {
            this.ignoreChanges = true;

            this.user = state.user;
            this.userSocketId = state.userSocketId;

            this.$refs.editor.setText(state.text);

            this.inSync = true;
            this.ignoreChanges = false;
        },

        onSocketText(text) {
            this.ignoreChanges = true;

            this.$refs.editor.setText(text);

            this.inSync = true;
            this.ignoreChanges = false;
        },

        onSocketUser({ user, userSocketId }) {
            this.user = user;
            this.userSocketId = userSocketId;
        },

        onSocketOperation(operation) {
            if (this.readOnly && !this.hasControl) {
                this.$refs.editor.applyTextOperation(TextOperation.fromObject(operation));
            }
        },

        onSocketSelections(selections) {
            if (!this.hasControl) {
                const editorSelections = selections.map(s => EditorSelection.fromObject(s));
                this.$refs.editor.applySelectionDecorators(editorSelections, this.team, !this.focused);
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
