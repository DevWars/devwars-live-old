<template>
    <ConfirmModal title="Notice" buttonText="Open" @confirm="onConfirm">
        <p>You have been assigned to the <strong :class="team">{{ team }}/{{ language }}</strong> editor,
        do you wish to open it now?</p>
    </ConfirmModal>
</template>


<script>
import ConfirmModal from './ConfirmModal';

export default {
    components: { ConfirmModal },

    props: {
        team: { type: String, required: true },
        language: { type: String, required: true },
    },

    methods: {
        onConfirm() {
            window.location = `/play/${this.team}/${this.language}`;
        },
    },
};
</script>
