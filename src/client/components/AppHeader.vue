<template>
    <header class="app-header">
        <div class="section"></div>
        <div class="section center">
            <AppHeaderScore/>
        </div>
        <div class="section end">
            <CloudOffOutlineIcon
                v-if="!connected"
                class="connection-icon"
                title="Disconnected"
            />
        </div>
    </header>
</template>


<script>
import { mapState } from 'vuex';
import CloudOffOutlineIcon from 'vue-material-design-icons/cloud-off-outline';
import AppHeaderScore from "./AppHeaderScore";

export default {
    components: { AppHeaderScore, CloudOffOutlineIcon },
    computed: mapState(['connected']),
};
</script>


<style lang="scss" scoped>
@import '../styles/variables';

.app-header {
    display: flex;
    height: 3.5rem;
    justify-content: space-between;
    border-bottom: $border;

    .section {
        display: flex;
        flex: 1 1 100%;
        align-items: center;


        &.center {
            flex: 0 0 auto;
        }

        &.end {
            flex-direction: row-reverse;
        }
    }

    .connection-icon {
        display: flex;
        padding: 1rem;
        justify-content: center;
        align-items: center;
        fill: #ff2b2b;

        animation: blink 750ms infinite alternate ease-in-out;
    }
}
</style>
Server connection lost
