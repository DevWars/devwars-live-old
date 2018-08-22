<template>
    <div class="BroadcastPage">
        <BroadcastPanel/>
        <div class="main">
            <TheHeader/>
            <GameView hideMenu/>
        </div>
    </div>
</template>


<script>
import TheHeader from '../TheHeader';
import BroadcastPanel from '../BroadcastPanel';
import GameView from '../GameView';

export default {
    components: { TheHeader, BroadcastPanel, GameView },
};
</script>


<style lang="scss" scoped>
@import 'settings.scss';
.BroadcastPage {
    display: flex;
    height: 100%;
    flex-flow: row nowrap;

    .main {
        display: flex;
        width: 100%;
        flex: 1 1;
        flex-flow: column nowrap;
    }

    .BroadcastPanel {
        width: 350px;
        border-right: $border;
        overflow: hidden;
    }
}
</style>
