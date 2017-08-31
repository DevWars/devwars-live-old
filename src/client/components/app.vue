<template>
<div class="app">
    <site-viewer team="red" url="/game/red/index.html"></site-viewer>
    <div class="editor-group">
        <live-editor namespace="/1" team="red" language="html"></live-editor>
        <live-editor namespace="/2" team="red" language="css"></live-editor>
        <live-editor namespace="/3" team="red" language="javascript"></live-editor>
    </div>
</div>
</template>


<script>
import LiveEditor from './live-editor.vue';
import SiteViewer from './site-viewer.vue';

export default {
    components: {
        LiveEditor,
        SiteViewer,
    },
};
</script>
