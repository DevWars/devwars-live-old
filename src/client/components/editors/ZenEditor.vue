<template>
    <div :class="{ collapsed }" class="zen-editor">
        <EditorHeader
            :collapsed="collapsed"
            title="Zen Template"
            language="html"
            @collapse="collapsed = !collapsed"
        />
        <Editor :text="zenTemplate" language="html" class="editor" read-only/>
    </div>
</template>


<script>
import { mapState } from 'vuex';
import Editor from './Editor';
import EditorHeader from './EditorHeader';

export default {
    components: { Editor, EditorHeader },

    data: () => ({
        collapsed: false,
    }),

    computed: mapState(['zenTemplate']),
};
</script>


<style lang="scss" scoped>
.zen-editor {
    position: relative;
    display: flex;
    flex: 1 1;
    flex-flow: column;
    overflow: hidden;

    &.collapsed {
        flex: 0 0 2.25rem;

        .editor {
            display: none;
        }
    }
}
</style>
