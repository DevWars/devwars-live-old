<template>
    <div class="ObjectivesModal">
        <div class="title">Objectives</div>
        <ul>
            <li v-for="(obj, index) in objectives" :key="index" class="item">
                <Component
                    :is="obj.icon.icon"
                    :class="obj.icon.classes"
                    :title="obj.icon.title"
                    @click.native="markObjectiveComplete(index)"
                />
                <div :class="{ bonus: obj.isBonus }" class="description">{{ obj.description }}</div>
            </li>
        </ul>
    </div>
</template>


<script>
import CheckboxBlankOutlineIcon from 'vue-material-design-icons/CheckboxBlankOutline';
import CheckboxMarkedOutlineIcon from 'vue-material-design-icons/CheckboxMarkedOutline';
import CheckIcon from 'vue-material-design-icons/Check';
import CloseIcon from 'vue-material-design-icons/Close';
import LockOutlineIcon from 'vue-material-design-icons/LockOutline';

export default {
    props: {
        team: { type: String, required: true },
    },

    computed: {
        objectives() {
            const iconMap = {
                incomplete: { icon: CheckboxBlankOutlineIcon, title: 'Mark Complete' },
                pending: { icon: CheckboxMarkedOutlineIcon, title: 'Pending Review' },
                complete: { icon: CheckIcon, title: 'Completed' },
                dropped: { icon: CloseIcon, title: 'Dropped' },
            };

            return this.$store.state.objectives.map((objective) => {
                const state = objective[`${this.team}State`];
                const icon = { ...iconMap[state] };
                icon.classes = [this.team, state];

                if (objective.isBonus) {
                    icon.classes.push('bonus');
                    if (this.$store.getters[`${this.team}BonusLocked`] && state !== 'dropped') {
                        icon.classes.push('locked');
                        icon.icon = LockOutlineIcon;
                        icon.title = 'Locked';
                    }
                }

                return { ...objective, state, icon };
            });
        },
    },

    methods: {
        markObjectiveComplete(id) {
            const { userPlayer } = this.$store.getters;
            if (!userPlayer || userPlayer.team !== this.team) {
                return;
            }

            const objective = this.objectives[id];
            if (objective.state !== 'incomplete' || (objective.isBonus && this.isBonusLocked)) {
                return;
            }

            this.$store.commit('PUSH_MODAL', {
                name: 'ObjectiveConfirmModal',
                props: { team: this.team, id },
            });
        },
    },
};
</script>


<style lang="scss" scoped>
@import 'settings.scss';
.ObjectivesModal {
    padding: 3.5rem;

    .title {
        margin-bottom: 2rem;
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
                color: $blue;
            }

            &.red {
                color: $red;
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
            color: $bonusColor !important;
        }
    }
}
</style>
