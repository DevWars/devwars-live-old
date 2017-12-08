<template>
<div>
    <app-header></app-header>
    <div class="editor-group">
        <live-editor team="blue" language="html"></live-editor>
        <live-editor team="blue" language="css"></live-editor>
        <live-editor team="blue" language="javascript"></live-editor>
    </div>
    <div class="editor-group">
        <live-editor team="red" language="html"></live-editor>
        <live-editor team="red" language="css"></live-editor>
        <live-editor team="red" language="javascript"></live-editor>
    </div>
</div>
</template>


<script>
import AppHeader from '../app-header.vue';
import LiveEditor from '../live-editor.vue';

export default {
    components: {
        AppHeader,
        LiveEditor,
    },
};
</script>
