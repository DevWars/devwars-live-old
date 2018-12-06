<template>
    <div :class="`TeamViewHeader ${team}`">
        <div class="main">
            <div v-if="score" class="result win">Victory</div>
            <i class="team">{{ team }} Team</i>
        </div>

        <div v-if="score" class="score">{{ score }}</div>
    </div>
</template>


<script>
export default {
    props: {
        team: { type: String, required: true },
        score: { type: Number, required: false, default: 0 },
    },
};
</script>

<style lang="scss" scoped>
@import 'settings.scss';
.TeamViewHeader {
    display: flex;
    padding-bottom: 0.8rem;
    justify-content: space-between;
    align-items: flex-end;

    &.blue { color: $blue; }
    &.red { color: $red; }

    .main {
        text-transform: uppercase;
    }

    .result {
        font-size: 1.5rem;
        color: #ddd;

        &.win { color: #5ad85a; }
        &.lose { color: #ff2b2b; }
    }

    .team {
        font-size: 2.5rem;
    }

    .score {
        font-size: 3.5rem;
    }
}
</style>
