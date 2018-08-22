<template>
    <iframe ref="iframe" :src="`/game/${team}/index.html`" class="WebViewer" frameborder="0"></iframe>
</template>


<script>
import { debounce } from 'lodash';
import eventBus from '../services/eventBus';

export default {
    props: {
        team: { type: String, required: true },
        delay: { type: Number, default: 0 },
    },

    mounted() {
        this.onReload = debounce(this.onReload, this.delay, { maxWait: 10000 });
        eventBus.$on('reload-site', this.onReload);
    },

    beforeDestroy() {
        eventBus.$off('reload-site', this.onReload);
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
.WebViewer {
    flex: 1;
    overflow: hidden;
}
</style>
