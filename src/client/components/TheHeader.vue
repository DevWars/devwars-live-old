<template>
    <header class="TheHeader">
        <div class="section">
            <slot name="left"></slot>
        </div>
        <div class="section center">
            <TheHeaderScore/>
        </div>
        <div class="section end">
            <CloudOffOutlineIcon
                v-if="!connected"
                class="connectionIcon"
                title="Disconnected"
            />
            <slot name="right"></slot>
        </div>
    </header>
</template>


<script>
import { mapState } from 'vuex';
import CloudOffOutlineIcon from 'vue-material-design-icons/CloudOffOutline';
import TheHeaderScore from './TheHeaderScore';

export default {
    components: { TheHeaderScore, CloudOffOutlineIcon },
    computed: mapState(['connected']),
};
</script>


<style lang="scss" scoped>
@import 'settings.scss';
.TheHeader {
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

    .connectionIcon {
        margin: 0 1rem;
        font-size: 1.5rem;
        color: $errorColor;
        animation: pulse 750ms infinite alternate ease-in-out;
    }
}
</style>
