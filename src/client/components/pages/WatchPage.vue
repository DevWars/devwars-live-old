<template>
    <div class="watch-page">
        <AppHeader/>
        <GameView/>
    </div>
</template>


<script>
import AppHeader from '../AppHeader';
import GameView from '../GameView';

export default {
    components: { AppHeader, GameView },
};
</script>


<style lang="scss" scoped>
.watch-page {
    display: flex;
    height: 100%;
    flex-flow: column nowrap;
}
</style>
