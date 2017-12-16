<template>
    <iframe ref="iframe" class="web-viewer" :src="`/game/${team}/index.html`" frameborder="0"></iframe>
</template>


<script>
import eventBus from "../services/event-bus";

export default {
    props: ['team'],

    mounted() {
        eventBus.on('reload', this.onReload);
    },

    beforeDestroy() {
        eventBus.removeListener('reload', this.onReload);
    },

    methods: {
        onReload(team) {
            if (team === this.team) {
                this.$refs.iframe.contentDocument.location.reload();
            }
        },
    },
};
</script>


<style lang="scss" scoped>
.web-viewer {
    flex: 1;
    overflow: hidden;
}
</style>
