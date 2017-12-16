<template>
    <div class="play-page">
        <div class="panel editor">
            <AppHeader/>
            <EditorPlayer
                :team="team"
                :language="language"
                :editable="true"
            />
        </div>
        <div class="panel team">
            <WebViewer :team="team"/>
            <EditorGroup :team="team" :editors="teamEditors"/>
        </div>
    </div>
</template>


<script>
import AppHeader from '../AppHeader';
import EditorGroup from '../EditorGroup';
import EditorPlayer from '../EditorPlayer';
import WebViewer from '../WebViewer';

export default {
    components: {
        AppHeader,
        EditorGroup,
        EditorPlayer,
        WebViewer,
    },

    props: ['team', 'language'],

    computed: {
        teamEditors() {
            return ['html', 'css', 'javascript'].filter((lang) => {
                return lang !== this.language;
            });
        },
    },
};
</script>


<style lang="scss" scoped>
@import '../../styles/variables';

.play-page {
    display: flex;
    height: 100%;
    flex-flow: row nowrap;

    .panel {
        display: flex;
        flex: 1;
        flex-flow: column nowrap;

        &.editor {
            max-width: 45rem;
            border-right: $border;
        }

        .web-viewer {
            flex: 1 1 100%;
        }

        .editor-group {
            flex: 1 1 80%;
            border-top: $border;
        }
    }
}
</style>
