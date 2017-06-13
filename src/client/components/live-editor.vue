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
		<button v-if="isOwner" @click="release" class="editor__status-button">Release</button>
		<button v-if="isOwner" @click="commit" class="editor__status-button">Commit</button>
		<button v-else @click="possess" class="editor__status-button">Possess</button>
		<span class="editor__status-item">Owner: {{ owner ? (isOwner ? 'You' : owner) : 'None' }}</span>,
	</div>
	<div class="editor__debug">
		<span class="editor__debug-item">{{ connected ? 'Connected' : 'Disconnected' }}</span>,
		<span class="editor__debug-item">{{ inSync ? 'in-sync' : 'out-of-sync' }}</span>,
		<span class="editor__debug-item">{{ writable ? 'write-mode' : 'read-mode' }}</span>
	</div>
</div>
</template>


<script>
import Vue from 'vue';
import io from 'socket.io-client';
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
	props: ['namespace', 'language', 'readOnly'],

	data() {
		return {
			connected: false,
			inSync: false,
			ignoreChanges: false,

			owner: '',
			user: '',

			socket: null,
			editor: null,
		};
	},

	computed: {
		isOwner() {
			return this.owner ? this.owner === this.user : false;
		},

		writable() {
			return (this.isOwner && this.inSync);
		},
	},

	watch: {
		isOwner() {
			this.inSync = false;
			this.socket.emit('state');
		},

		writable() {
			this.editor.updateOptions({ readOnly: !this.writable });
		},
	},

	mounted() {
		if (window.monaco) {
			this.onMonacoLoaded(window.monaco);
		} else {
			window.require.config({ paths: { 'vs': 'vendor/vs' }});
			window.require(['vs/editor/editor.main'], () => {
				this.onMonacoLoaded(window.monaco);
			});
		}
	},

	destroyed() {
		this.socket.disconnect();
	},

	methods: {
		onMonacoLoaded(monaco) {
			console.log('Monaco Loaded!');
			const editor = monaco.editor.create(this.$refs.mount, {
				theme: 'vs-dark',
				language: this.language,
				automaticLayout: true, // TODO: Handle resize manually.
				readOnly: true,
			});

			editor.onDidChangeModelContent(this.onChange);

			this.editor = preventReactivity(editor);

			const socket = io(this.namespace, { transports: ['websocket'] });

			socket.on('connect', this.onSocketConnect);
			socket.on('disconnect', this.onSocketDisconnect);
			socket.on('state', this.onSocketState);
			socket.on('meta', this.onSocketMeta);
			socket.on('op', this.onSocketOp);

			this.socket = preventReactivity(socket);
		},

		onSocketConnect(aa) {
			console.log('socket-connect');
			this.connected = true;
			this.socket.emit('state');
		},

		onSocketDisconnect() {
			console.log('socket-disconnect');
			this.connected = false;
			this.inSync = false;
		},

		onSocketState(state) {
			console.log('socket-state', state);
			this.ignoreChanges = true;
			this.owner = state.owner;
			this.user = state.user;
			this.editor.model.setValue(state.text);
			this.inSync = true;
			this.ignoreChanges = false;
		},

		onSocketMeta(meta) {
			console.log('socket-meta', meta);
			this.owner = meta.owner;
		},

		onSocketOp(op) {
			console.log('socket-op', op);
			if (!this.isOwner) {
				const edit = TextOperation.fromObject(op).toMonacoEdit();
				this.editor.model.applyEdits([edit]);
			}
		},

		onChange(change) {
			console.log('onChange', change, `Ignore: ${this.ignoreChanges || !this.isOwner}`);
			if (this.ignoreChanges || !this.isOwner) {
				return;
			}

			const op = TextOperation.fromMonacoChange(change).toObject();
			this.socket.emit('op', op);
		},

		commit() {
			console.log('commit');
			this.socket.emit('commit');
		},

		possess() {
			console.log('possess');
			this.socket.emit('possess', this.user);
		},

		release() {
			console.log('release');
			this.socket.emit('release');
		},
	},
};
</script>
