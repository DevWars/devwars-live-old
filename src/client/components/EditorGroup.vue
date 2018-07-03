<template>
    <div :class="`editor-group${vertical ? ' vertical' : ''}`">
        <EditorPlayer
            v-for="editor in editors"
            :key="editor.id"
            :id="editor.id"
            :team="editor.team"
            :language="editor.language"
            :locked="editor.locked"
            :hidden="editor.hidden"
            :vertical="vertical"
            :collapsible="editors.length > 1"
        />
    </div>
</template>


<script>
import EditorPlayer from './EditorPlayer';

export default {
    components: { EditorPlayer },

    props: {
        editors: { type: Array, required: true },
        vertical: { type: Boolean, default: false },
    },
};
</script>


<style lang="scss" scoped>
@import '../styles/variables';

.editor-group {
    display: flex;
    flex: 1;

    &.vertical {
        flex-flow: column nowrap;

        .editor-player:not(:last-child) {
            border-bottom: $border;
            border-right: none;
        }
    }

    .editor-player:not(:last-child) {
        border-right: $border;
    }
}
</style>
