<template>
<div class="editor">
    <div class="team team--red">
        <div class="team__slot">
            <span class="team__position">{{ language === 'javascript' ? 'JS' : language.toUpperCase() }}</span>
            <div class="player">
                <div class="player__rank"></div>
                <span class="player__name">Thierdox</span>
            </div>
        </div>
    </div>
    <div class="editor__frame">
        <div ref="mount" class="editor__editor"></div>
    </div>
    <div class="editor__status">
        <button v-if="hasControl" @click="release" class="editor__status-button">Release</button>
        <button v-if="hasControl" @click="commit" class="editor__status-button">Commit</button>
        <button v-else @click="possess" class="editor__status-button">Possess</button>
        <span class="editor__status-item">User: {{ user ? (hasControl ? 'You' : user) : 'None' }}</span>,
    </div>
    <div class="editor__debug">
        <span class="editor__debug-item">{{ socketId ? 'Connected' : 'Disconnected' }}</span>,
        <span class="editor__debug-item">{{ inSync ? 'in-sync' : 'out-of-sync' }}</span>,
        <span class="editor__debug-item">{{ writable ? 'write-mode' : 'read-mode' }}</span>
    </div>
</div>
</template>


<script>
import Vue from 'vue';
import io from 'socket.io-client';
import monacoLoader from '../monaco-loader';
import TextOperation from '../../shared/text-operation';

// Grab the Observer constructor function.
const Observer = (new Vue()).$data.__ob__.constructor;
// Prevent Vue from recursively adding reactivity to the object by
// attaching a dummy observer on the root object.
// See: https://github.com/vuejs/vue/issues/2637
function preventReactivity(object) {
    object.__ob__ = new Observer({});
    return object;
}

export default {
    props: ['namespace', 'language'],

    data() {
        return {
            socketId: '',
            inSync: false,
            ignoreChanges: false,
            user: '',

            socket: null,
            editor: null,
        };
    },

    computed: {
        hasControl() {
            return this.user ? (this.socketId === this.user) : false;
        },

        writable() {
            return (this.hasControl && this.inSync);
        },
    },

    watch: {
        hasControl() {
            this.inSync = false;
            this.socket.emit('state');
        },

        writable() {
            this.editor.updateOptions({ readOnly: !this.writable });
        },
    },

    mounted() {
        monacoLoader((monaco) => {
            this.onMonacoLoaded(monaco);
        });
    },

    destroyed() {
        this.socket.disconnect();
    },

    methods: {
        onMonacoLoaded(monaco) {
            const editor = monaco.editor.create(this.$refs.mount, {
                theme: 'vs-dark',
                language: this.language,
                lineNumbersMinChars: 3,
                roundedSelection: false,
                contextmenu: false,
                minimap: { enabled: false },
                automaticLayout: true, // TODO: Handle resize manually.
                readOnly: true,
            });

            this.editor = preventReactivity(editor);
            editor.onDidChangeModelContent(this.onChange);

            this.connect();
        },

        connect() {
            const socket = io(this.namespace, { transports: ['websocket'] });
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

                this.user = state.user;
                this.editor.model.setValue(state.text);
                this.inSync = true;

                this.ignoreChanges = false;
            });

            socket.on('user', (user) => {
                this.user = user;
            });

            socket.on('op', (op) => {
                if (!this.writable) {
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

        commit() {
            this.socket.emit('commit');
        },

        possess() {
            this.socket.emit('possess');
        },

        release() {
            this.socket.emit('release');
        },
    },
};
</script>
