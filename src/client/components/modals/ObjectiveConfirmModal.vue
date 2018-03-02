<template>
    <ConfirmModal title="Warning" @confirm="onConfirm">
        <p>You're about to mark an objective as complete, <strong>this action cannot be reversed</strong>!
        Please make sure all team members are ready before proceeding.</p>
        <p>If you break the objective after this you'll risk getting a strike.</p>
    </ConfirmModal>
</template>


<script>
import ConfirmModal from './ConfirmModal';
import socket from '../../services/socket';

export default {
    components: { ConfirmModal },

    props: {
        team: { type: String, required: true },
        id: { type: Number, required: true },
    },

    methods: {
        onConfirm() {
            const { team, id } = this;
            socket.emit('objective-notify', { team, id });
        },
    },
};
</script>
