<template>
<div class="site-viewer">
    <button class="site-viewer__reload" @click="reload">Reload</button>
    <iframe ref="iframe" class="site-viewer__iframe" :src="url" frameborder="0"></iframe>
</div>
</template>


<script>
import eventBus from '../services/event-bus';

export default {
    props: ['team', 'url'],

    mounted() {
        eventBus.on('reload', this.onEventBusReload);
    },

    destroyed() {
        eventBus.removeListener('reload', this.onEventBusReload);
    },

    methods: {
        onEventBusReload(team) {
            if (team === this.team) {
                this.reload();
            }
        },

        reload() {
            this.$refs.iframe.contentDocument.location.reload();
        },
    },
};
</script>
