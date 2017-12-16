<template>
    <header class="app-header">
        <div class="section"></div>
        <div class="section center">
            <AppHeaderScore/>
        </div>
        <div class="section"></div>
    </header>
</template>


<script>
import AppHeaderScore from "./AppHeaderScore";

export default {
    components: { AppHeaderScore },
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
    }
}
</style>
