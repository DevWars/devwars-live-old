<template>
    <div class="editor-group">
        <EditorPlayer
            v-for="language in editors"
            :key="language"
            :team="team"
            :language="language"
            :collapsible="true"
        />
    </div>
</template>


<script>
import EditorPlayer from "./EditorPlayer";

export default {
    components: { EditorPlayer },
    props: ['team', 'editors'],
};
</script>


<style lang="scss" scoped>
@import '../styles/variables';

.editor-group {
    display: flex;
    flex: 1;

    .editor-player {
        flex: 1 1 100%;
        &:not(:last-child) {
            border-right: $border;
        }
    }
}
</style>
