<template>
<div :class="`editor editor--${team}${collapsed ? ' editor--collapsed' : ''}`">
    <div class="editor__header">
        <span class="editor__username">{{ user ? (hasControl ? 'You' : user) : 'Username' }}</span>
        <span class="editor__language" @click="collapsed = !collapsed" >{{ language === 'javascript' ? 'JS' : language.toUpperCase() }}</span>
    </div>
    <div ref="mount" class="editor__mount"></div>
    <div v-if="controls" class="editor__status">
        <button v-if="hasControl" @click="release" class="editor__status-button">Release</button>
        <button v-if="hasControl" @click="save" class="editor__status-button">Save</button>
        <button v-else @click="possess" class="editor__status-button">Possess</button>
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
    props: ['team', 'language', 'controls'],

    data() {
        return {
            collapsed: false,
            socketId: '',
            inSync: false,
            ignoreChanges: false,
            user: '',

            socket: null,
            editor: null,
        };
    },

    computed: {
        namespace() {
            const map = { html: 1, css: 2, javascript: 3 };
            let namespace = map[this.$props.language];
            return this.$props.team === 'blue' ? `/${namespace}` : `/${namespace + 3}`;
        },

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
                theme: 'devwars',
                language: this.language,
                renderLineHighlight: 'none',
                selectionHighlight: false,
                occurrencesHighlight: false,
                lineNumbersMinChars: 3,
                roundedSelection: false,
                renderIndentGuides: false,
                contextmenu: false,
                scrollbar: { useShadows: false },
                minimap: { enabled: false },
                automaticLayout: true, // TODO: Handle resize manually.
                readOnly: true,
            });

            editor.addAction({
                id: 'save-action',
                label: 'Save',
                keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_S],
                run: () => this.save(),
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

                this.user = state.activeUser;
                this.editor.model.setValue(state.content);
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

        save() {
            if (!this.hasControl) {
                return;
            }

            this.socket.emit('save');
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
