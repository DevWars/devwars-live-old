<template>
<div class="app">
	<site-viewer team="red" url="/game/index.html"></site-viewer>
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
import PlayerView from './player-view.vue';

export default {
	components: {
		LiveEditor,
		SiteViewer,
		PlayerView,
	},
};
</script>
