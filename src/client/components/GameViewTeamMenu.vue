<template>
    <div class="game-view-team-menu">
        <button @click="$emit('onViewCode')" class="button">CODE</button>
        <button @click="$emit('onViewSite')" class="button">SITE</button>
        <div class="fill"></div>
        <button @click="$emit('onToggleExpanded')" class="button">
            {{ expanded ? 'MIN' : 'FULL' }}
        </button>
    </div>
</template>


<script>
export default {
    props: ['expanded'],
};
</script>


<style lang="scss" scoped>
.game-view-team-menu {
    display: flex;
    flex-flow: column nowrap;

    .button {
        width: 3rem;
        height: 3rem;
        border: none;
    }

    .fill {
        flex: 1;
    }
}
</style>
