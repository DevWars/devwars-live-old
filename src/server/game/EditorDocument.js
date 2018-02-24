class EditorDocument {
    constructor() {
        this.buffer = [''];
        this._bufferCache = null;

        this.savedText = '';
    }

    applyOperation(operation) {
        const { startRow, startCol, endRow, endCol } = operation;
        const lines = operation.text.split('\n');

        lines[0] = this.buffer[startRow].slice(0, startCol) + lines[0];
        lines[lines.length - 1] += this.buffer[endRow].slice(endCol);

        this.buffer.splice(startRow, ((endRow - startRow) + 1), ...lines);
        // Expire the cached text on changes.
        this._bufferCache = null;
    }

    save() {
        this.savedText = this.getText();
    }

    getText() {
        if (this._bufferCache === null) {
            this._bufferCache = this.buffer.join('\n');
        }

        return this._bufferCache;
    }

    setText(text) {
        this.buffer = text.replace('\r\n', '\n').split('\n');
        this._bufferCache = null;
    }

    getSavedText() {
        return this.savedText;
    }
}

module.exports = EditorDocument;
