<template>
    <div class="objectives-modal">
        <h1 class="title">Warning</h1>
        <p>You're about to mark an objective as complete, <strong>this action cannot be reversed</strong>!
        Please make sure all team members are ready before proceeding.</p>
        <p>If you break the objective after this you'll risk getting a strike.</p>
        <div class="actions">
            <button @click="onConfirm">Confirm</button>
            <button class="secondary" @click="onCancel">Cancel</button>
        </div>
    </div>
</template>


<script>
import socket from '../../services/socket';

export default {
    props: {
        team: { type: String, required: true },
        objectiveId: { type: Number, required: true },
    },

    computed: {},

    methods: {
        onConfirm() {
            socket.emit('objective-notify', {
                team: this.team,
                id: this.objectiveId,
            });

            this.$store.commit('POP_MODAL');
        },

        onCancel() {
            this.$store.commit('POP_MODAL');
        },
    },
};
</script>


<style lang="scss" scoped>
@import '../../styles/variables';

.objectives-modal {
    padding: 3.5rem;
    text-align: center;

    .title {
        margin: 0;
        margin-bottom: 2.5rem;
        text-transform: uppercase;
        font-size: 2.5rem;
        font-weight: 300;
    }

    p {
        margin: 1rem 0;
        line-height: 1.4;
    }

    .actions {
        display: flex;
        margin-top: 2rem;
        justify-content: center;

        button {
            margin-right: 0.5rem;
            padding: 0 0.75rem;
            height: 2.5rem;

            &.secondary:not(:hover) {
                border-color: transparent;
            }
        }
    }
}
</style>
