<template>
    <div class="broadcast-page">
        <BroadcastPanel/>
        <div class="main">
            <AppHeader/>
            <GameView/>
        </div>
    </div>
</template>


<script>
import AppHeader from '../AppHeader';
import BroadcastPanel from '../BroadcastPanel';
import GameView from '../GameView';

export default {
    components: { AppHeader, BroadcastPanel, GameView },
};
</script>


<style lang="scss" scoped>
@import '../../styles/variables';
.broadcast-page {
    display: flex;
    height: 100%;
    flex-flow: row nowrap;

    .main {
        display: flex;
        width: 100%;
        flex: 1 1;
        flex-flow: column nowrap;
    }

    .broadcast-panel {
        border-right: 2px solid $border-color;
    }
}
</style>
