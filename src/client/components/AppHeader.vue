<template>
    <header class="app-header">
        <div class="section">
            <slot name="left"></slot>
        </div>
        <div class="section center">
            <AppHeaderScore/>
        </div>
        <div class="section end">
            <CloudOffOutlineIcon
                v-if="!connected"
                class="connection-icon"
                title="Disconnected"
            />
            <slot name="right"></slot>
        </div>
    </header>
</template>


<script>
import { mapState } from 'vuex';
import CloudOffOutlineIcon from 'vue-material-design-icons/cloud-off-outline';
import AppHeaderScore from './AppHeaderScore';

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
            justify-content: flex-end;
        }
    }

    .connection-icon {
        margin: 0 1rem;
        font-size: 1.5rem;
        color: $warrning-color;
        animation: pulse 750ms infinite alternate ease-in-out;
    }
}
</style>
