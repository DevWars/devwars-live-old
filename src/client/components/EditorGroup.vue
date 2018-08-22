<template>
    <div :class="['EditorGroup', { vertical }]">
        <LiveEditor
            v-for="editor in editors"
            :id="editor.id"
            :key="editor.id"
            :team="editor.team"
            :language="editor.language"
            :locked="editor.locked"
            :vertical="vertical"
            :collapsible="editors.length > 1"
        />
    </div>
</template>


<script>
import LiveEditor from './editors/LiveEditor';

export default {
    components: { LiveEditor },

    props: {
        editors: { type: Array, required: true },
        vertical: { type: Boolean, default: false },
    },
};
</script>


<style lang="scss" scoped>
@import 'settings.scss';
.EditorGroup {
    display: flex;
    flex: 1;

    &.vertical {
        flex-flow: column nowrap;

        .LiveEditor:not(:last-child) {
            border-bottom: $border;
            border-right: none;
        }
    }

    .LiveEditor:not(:last-child) {
        border-right: $border;
    }
}
</style>
