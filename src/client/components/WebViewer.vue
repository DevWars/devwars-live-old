<template>
    <iframe ref="iframe" class="web-viewer" :src="`/game/${team}/index.html`" frameborder="0"></iframe>
</template>


<script>
import eventBus from "../services/eventBus";
import { debounce } from 'lodash-es';

export default {
    props: ['team', 'delay'],

    mounted() {
        const delay = this.delay || 0;
        this.onReload = debounce(this.onReload, delay, { maxWait: 10000 });
        eventBus.on('reload-site', this.onReload);
    },

    beforeDestroy() {
        eventBus.removeListener('reload-site', this.onReload);
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
