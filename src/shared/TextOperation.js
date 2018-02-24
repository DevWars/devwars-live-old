class TextOperation {
    constructor(range, text) {
        this.startRow = range[0];
        this.startCol = range[1];
        this.endRow = range[2];
        this.endCol = range[3];

        this.text = text;
    }

    toObject() {
        const op = {};

        if (this.text) {
            op.t = this.text;
        }

        if (this.startRow === this.endRow && this.startCol === this.endCol) {
            op.r = [this.startRow, this.startCol];
        } else {
            op.r = [this.startRow, this.startCol, this.endRow, this.endCol];
        }

        return op;
    }

    toMonacoEdit() {
        // eslint-disable-next-line no-undef
        const monaco = window ? window.monaco : undefined;
        if (!monaco) {
            throw new Error('You need to load the monaco editor for this operation!');
        }

        const range = new monaco.Range(
            this.startRow + 1,
            this.startCol + 1,
            this.endRow + 1,
            this.endCol + 1,
        );

        return { range, text: this.text, forceMoveMarkers: true };
    }

    static fromObject(op) {
        const text = typeof op.t === 'string' ? op.t : '';
        const range = op.r;
        if (range.length === 2) {
            range.push(range[0], range[1]);
        }

        return new TextOperation(range, text);
    }

    static fromMonacoChange(change) {
        const { startLineNumber, startColumn, endLineNumber, endColumn } = change.range;
        const text = change.text.replace(/\r/g, '');
        const range = [
            startLineNumber - 1,
            startColumn - 1,
            endLineNumber - 1,
            endColumn - 1,
        ];

        return new TextOperation(range, text);
    }
}

module.exports = TextOperation;
