<template>
    <div class="objectives-modal">
        <div class="title">Objectives</div>
        <ul>
            <li v-for="(objective, index) in objectives" :key="index" class="item">
                <component
                    :is="objective.icon"
                    :class="objective.iconClassNames"
                    @click.native="markObjectiveComplete(index)"
                />
                <div :class="`description ${objective.isBonus ? 'bonus' : ''}`">{{ objective.description }}</div>
            </li>
        </ul>
    </div>
</template>


<script>
import CheckIcon from 'vue-material-design-icons/check';
import CloseIcon from 'vue-material-design-icons/close';
import LockOutlineIcon from 'vue-material-design-icons/lock-outline';
import CheckboxBlankOutlineIcon from 'vue-material-design-icons/checkbox-blank-outline';
import CheckboxMarkedOutlineIcon from 'vue-material-design-icons/checkbox-marked-outline';

const iconMap = {
    incomplete: 'CheckboxBlankOutlineIcon',
    pending: 'CheckboxMarkedOutlineIcon',
    complete: 'CheckIcon',
    dropped: 'CloseIcon',
};

export default {
    components: {
        CheckboxBlankOutlineIcon,
        CheckboxMarkedOutlineIcon,
        CheckIcon,
        CloseIcon,
        LockOutlineIcon,
    },

    props: {
        team: { type: String, required: true },
    },

    computed: {
        isBonusLocked() {
            return this.$store.getters[`${this.team}BonusLocked`];
        },

        objectives() {
            return this.$store.state.objectives.map((objective) => {
                const state = objective[`${this.team}State`];

                let icon = iconMap[state];
                let iconClassNames = `${this.team} ${state}`;

                if (objective.isBonus) {
                    iconClassNames += ' bonus';
                    if (this.isBonusLocked) {
                        icon = 'LockOutlineIcon';
                        iconClassNames += ' locked';
                    }
                }

                return { ...objective, state, icon, iconClassNames };
            });
        },
    },

    methods: {
        markObjectiveComplete(id) {
            const objective = this.objectives[id];
            if (objective.state !== 'incomplete' || (objective.isBonus && this.isBonusLocked)) {
                return;
            }

            if (this.$store.getters.userTeam !== this.team) {
                return;
            }

            this.$store.commit('PUSH_MODAL', {
                name: 'ObjectiveConfirmModal',
                props: {
                    team: this.team,
                    objectiveId: id,
                },
            });
        },
    },
};
</script>


<style lang="scss" scoped>
@import '../../styles/variables';

.objectives-modal {
    padding: 3.5rem;

    .title {
        margin-bottom: 2.5rem;
        text-align: center;
        text-transform: uppercase;
        font-size: 2.5rem;
        font-weight: 300;
    }

    .item {
        display: flex;
        margin-top: 1.5rem;
        align-items: center;

        .description {
            margin-left: 1.5rem;
            flex: 1;
            word-break: break-word;
        }

        .material-design-icon {
            opacity: 0.25;
            font-size: 1.75rem;
            user-select: none;

            &.blue {
                color: $blue-team-color;
            }

            &.red {
                color: $red-team-color;
            }

            &.incomplete:not(.locked) {
                cursor: pointer;
            }

            &.pending {
                animation: pulse 750ms infinite alternate ease-in-out;
            }

            &.complete {
                opacity: 1;
            }
        }

        .bonus {
            color: $bonus-color !important;
        }
    }
}
</style>
