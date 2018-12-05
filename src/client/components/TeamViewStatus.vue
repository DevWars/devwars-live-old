<template>
    <div class="TeamViewStatus">
        <div :class="`heading ${team}`">{{ team }} status</div>
        <div class="status">Waiting...</div>
    </div>
</template>


<script>
export default {
    props: {
        team: { type: String, required: true },
    }
}
</script>


<style lang="scss" scoped>
@import 'settings.scss';
.TeamViewStatus {
    display: flex;
    padding-top: 2rem;
    flex-flow: row-reverse wrap;
    text-align: right;

    .heading {
        width: 100%;
        font-size: 1.2rem;
        text-transform: uppercase;

        &.blue { color: $blue; }
        &.red { color: $red; }
    }

    .status {
        font-size: 2rem;

        &.ready { color: #5ad85a; }
    }
}
</style>
