<template>
<div class="view--split">
    <div class="view__column view__column--editor">
        <app-header></app-header>
        <live-editor :team="team" :language="language" :controls="true"></live-editor>
    </div>
    <div class="view__column">
        <div class="view__row">
            <site-viewer :team="team" :url="`/game/${team}/index.html`"></site-viewer>
        </div>
        <div class="view__row">
            <div class="editor-group">
                <live-editor v-if="language !== 'html'" :team="team" language="html"></live-editor>
                <live-editor v-if="language !== 'css'" :team="team" language="css"></live-editor>
                <live-editor v-if="language !== 'javascript'" :team="team" language="javascript"></live-editor>
            </div>
        </div>
    </div>
</div>
</template>


<script>
import AppHeader from '../app-header.vue';
import LiveEditor from '../live-editor.vue';
import SiteViewer from '../site-viewer.vue';

export default {
    props: ['team', 'language'],
    components: {
        AppHeader,
        LiveEditor,
        SiteViewer,
    },
};
</script>
