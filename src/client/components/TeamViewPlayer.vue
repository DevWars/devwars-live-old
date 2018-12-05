<template>
    <div class="TeamViewPlayer">
        <div class="avatar" style="background-image: url('/img/avatar.png')"></div>

        <div class="user transparentBox">
            <i class="name">SYNTAG</i>
            <div class="rank">Bronze I</div>
        </div>

        <div class="positions transparentBox">
            <div class="lang html">HTML</div>
            <div class="lang css">CSS</div>
            <div class="lang js">JS</div>
        </div>
    </div>
</template>


<style lang="scss" scoped>
@import 'settings.scss';
.TeamViewPlayer {
    display: flex;

    .transparentBox {
        background-color: rgba($borderColor, 0.65);
    }

    .user {
        display: flex;
        margin: 0 1rem;
        padding: 1rem;
        flex: 1;
        flex-flow: row wrap;
        align-items: center;
        line-height: 1;
    }

    .name {
        width: 100%;
        font-size: 1.5rem;
    }

    .rank {
        width: 100%;
        font-weight: 300;
    }

    .positions,
    .avatar {
        width: 90px;
        height: 90px;
    }

    .avatar {
        background-size: cover;
        background-position: center;
    }

    .positions {
        display: flex;
        flex-flow: row wrap;

        .lang {
            display: flex;
            width: 100%;
            align-items: center;
            justify-content: center;
            font-size: 0.8rem;
        }

        .html { color: $htmlColor; }
        .css { color: $cssColor; }
        .js { color: $jsColor; }
    }
}
</style>
