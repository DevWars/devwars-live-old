export default function loadMonaco(callback) {
    if (window.monaco) {
        callback(window.monaco);
    } else {
        window.require.config({ paths: { 'vs': 'vendor/vs' }});
        window.require(['vs/editor/editor.main'], () => {
            callback(window.monaco);
        });
    }
}
