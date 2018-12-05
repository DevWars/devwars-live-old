<template>
    <div class="TeamView">
        <TeamViewPlayer />
        <TeamViewPlayer />
        <TeamViewPlayer />
    </div>
</template>


<script>
import TeamViewPlayer from './TeamViewPlayer';

export default {
    components: { TeamViewPlayer },
};
</script>


<style lang="scss" scoped>
@import 'settings.scss';
.TeamView {

    .header {
        display: flex;
        margin-bottom: 0.8rem;

        &.blue {
            color: $blue;
        }

        &.red {
            color: $red;
        }
    }

    .team {
        font-size: 2.5rem;
        text-transform: uppercase;
        font-style: italic;
    }


    .TeamViewPlayer {
        &:not(:last-of-type) {
            margin-bottom: 1rem;
        }
    }
}
</style>
