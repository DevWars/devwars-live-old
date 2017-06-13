<template>
<div class="app">
	<site-viewer url="/live/index.html"></site-viewer>
	<div class="editor-list">
		<live-editor namespace="/1" language="html"></live-editor>
		<live-editor namespace="/2" language="css"></live-editor>
		<live-editor namespace="/3" language="javascript"></live-editor>
	</div>
</div>
</template>


<script>
import LiveEditor from './live-editor.vue';
import SiteViewer from './site-viewer.vue';
import SiteViewer from './player-view.vue';

export default {
	data() {
		return { ed: true };
	},

	components: {
		LiveEditor,
		SiteViewer,
		PlayerView,
	},
};
</script>
