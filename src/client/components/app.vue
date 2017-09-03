<template>
<div class="app">
    <app-header></app-header>
    <site-viewer team="blue" url="/game/blue/index.html"></site-viewer>
    <div class="editor-group">
        <live-editor team="blue" language="html"></live-editor>
        <live-editor team="blue" language="css"></live-editor>
        <live-editor team="blue" language="javascript"></live-editor>
    </div>
</div>
</template>


<script>
import AppHeader from './app-header.vue';
import LiveEditor from './live-editor.vue';
import SiteViewer from './site-viewer.vue';

export default {
    components: {
        AppHeader,
        LiveEditor,
        SiteViewer,
    },
};
</script>
