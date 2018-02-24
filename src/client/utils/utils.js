import Vue from 'vue';

// Grab the Observer constructor function.
const Observer = (new Vue()).$data.__ob__.constructor;

// Prevent Vue from recursively adding reactivity to the object by
// attaching a dummy observer on the root object.
// See: https://github.com/vuejs/vue/issues/2637
export function preventReactivity(object) {
    object.__ob__ = new Observer({});
    return object;
}

export function scoreFromVotes(votes, competingVotes) {
    const total = votes + competingVotes;
    const percentage = (votes / total) * 100;
    if (percentage > 55) {
        return percentage > 80 ? 2 : 1;
    }

    return 0;
}
