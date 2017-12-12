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
import preventReactivity from '../utils/prevent-reactivity';
import TextOperation from '../../shared/text-operation';
import monacoTheme from '../styles/monaco-theme';

function loadMonaco(callback) {
    if (window.monaco) {
        callback(window.monaco);
    } else if (window.require) {
        window.require.config({ paths: { 'vs': '/vendor/vs' }});
        window.require(['vs/editor/editor.main'], () => {
            window.monaco.editor.defineTheme('devwars', monacoTheme);
            callback(window.monaco);
        });
    } else {
        console.error('Could not load Monaco editor because \'window.require\' is missing!');
        callback();
    }
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
        loadMonaco((monaco) => {
            if (monaco) {
                this.onMonacoLoaded(monaco);
            }
        });
    },

    beforeDestroy() {
        this.socket.disconnect();
        if (this.editor) {
            this.editor.dispose();
        }
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
