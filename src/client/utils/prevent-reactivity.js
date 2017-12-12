import Vue from 'vue';

// Grab the Observer constructor function.
const Observer = (new Vue()).$data.__ob__.constructor;

// Prevent Vue from recursively adding reactivity to the object by
// attaching a dummy observer on the root object.
// See: https://github.com/vuejs/vue/issues/2637
export default function preventReactivity(object) {
    object.__ob__ = new Observer({});
    return object;
}