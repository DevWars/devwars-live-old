<template>
    <div class="BriefingPage preview">
        <div class="view">
            <div class="header">
                <div class="trapezoid">
                    <img class="logo" src="/img/logo.png" />
                </div>
            </div>

            <div class="info">
                <h1>Game Briefing</h1>
                <h2>Preparing our next game</h2>
            </div>

            <div class="main">
                <div class="team">
                    <TeamViewHeader team="blue" />
                    <TeamView />
                    <TeamViewStatus team="blue" />
                </div>

                <div class="center">
                    <div class="vs">VS</div>
                </div>

                <div class="team">
                    <TeamViewHeader team="red" />
                    <TeamView />
                    <TeamViewStatus team="red" />
                </div>
            </div>

            <div class="footer">
                <div class="message">We need players!<div>Register at DevWars.tv</div></div>
            </div>
        </div>

        <div class="overlay"></div>
    </div>
</template>


<script>
import Vue from 'vue';
import TeamView from '../TeamView';
import TeamViewHeader from '../TeamViewHeader';
import TeamViewStatus from '../TeamViewStatus';

export default {
    components: { TeamView, TeamViewHeader, TeamViewStatus },
};
</script>


<style lang="scss" scoped>
@import 'settings.scss';
.BriefingPage {
    display: flex;
    width: 1920px;
    height: 1080px;
    flex-flow: column wrap;

    // DEV ONLY: Toggle class to preview live background (set ENV variable)
    &.preview {
        background-image: url('/img/briefing-bg.jpg');
        background-size: cover;
    }

    .view {
        position: relative;
        z-index: 2;
    }

    .overlay {
        position: absolute;
        width: 100%;
        height: 100%;
        z-index: 1;
        background-color: $bg00;
        opacity: 0.93;
    }

    .header {
        width: 100%;
        height: 130px;
        margin-bottom: 7rem;

        &:before {
            content: '';
            position: absolute;
            display: block;
            width: 100%;
            height: 50px;
            background-color: #13161e;
        }

        .logo {
            position: absolute;
            top: 50%; left: 50%;
            transform: translate(-50%, -50%);
        }
    }

    .trapezoid {
        position: relative;
        width: 50%;
        height: 130px;
        margin: 0 auto;

        &:before {
            content: '';
            display: block;
            width: 100%;
            border-top: 130px solid #0b0d11;
            border-left: 100px solid transparent;
            border-right: 100px solid transparent;
        }
    }

    .main {
        display: flex;
        width: 85%;
        margin: 0 auto;
    }

    .team {
        width: 40%;

        &:last-child /deep/ {
            .TeamViewPlayer,
            .TeamViewHeader {
                flex-direction: row-reverse;
                text-align: right;
            }

            .TeamViewStatus {
                flex-direction: row;
                text-align: left
            }
        }
    }

    .center {
        display: flex;
        flex: 1;
        // To-do: make calc dynamic with JS to offset TeamViewHeader & TeamViewStatus height
        margin-top: 66.8px - 100px;
        align-items: center;
        justify-content: center;
        flex-flow: row wrap;

        .vs {
            font-size: 6rem;
            font-weight: 300;
        }
    }

    .info {
        text-transform: uppercase;
        text-align: center;

        h1 {
            font-size: 2.2rem;
            font-weight: 300;
        }

        h2 {
            font-size: 1.1rem;
        }
    }

    .footer {
        position: fixed;
        bottom: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100px;
        border-top: 1px solid $borderColor;
        background-color: $bg00;
    }

    .message {
        font-size: 2rem;
        text-transform: uppercase;
        text-align: center;

        div {
            font-size: 1.2rem;
            color: $bonusColor;
        }
    }
}
</style>
