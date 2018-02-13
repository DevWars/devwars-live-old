class EditorSelection {
    constructor(cursor, range) {
        this.cursorRow = cursor[0];
        this.cursorCol = cursor[1];

        this.startRow = range[0];
        this.startCol = range[1];
        this.endRow = range[2];
        this.endCol = range[3];
    }

    hasSelection() {
        return !(this.startRow === this.endRow && this.startCol === this.endCol);
    }

    toObject() {
        let range = [];
        const { startRow, startCol, endRow, endCol } = this;

        if (startRow === endRow && startCol === endCol) {
            range = [startRow, startCol];
        } else {
            range = [startRow, startCol, endRow, endCol];

            const { cursorRow, cursorCol } = this;
            if (cursorRow === startRow && cursorCol === startCol) {
                range.push(1);
            }
        }

        return range;
    }

    toMonacoRanges() {
        if (!window.monaco) {
            throw new Error('You need to load the monaco editor for this operation!');
        }

        const cursor = new monaco.Range(
            this.cursorRow,
            this.cursorCol,
            this.cursorRow,
            this.cursorCol,
        );

        const selection = new monaco.Range(
            this.startRow,
            this.startCol,
            this.endRow,
            this.endCol,
        );

        return { cursor, selection };
    }

    static fromObject(range) {
        if (range.length === 2) {
            range.push(range[0], range[1]);
        }

        let cursor;
        if (range.length === 5) {
            range.pop();
            cursor = [range[0], range[1]];
        } else {
            cursor = [range[2], range[3]];
        }

        return new EditorSelection(cursor, range);
    }

    static fromMonacoChange(change) {
        const cursor = [
            change.positionLineNumber,
            change.positionColumn,
        ];

        const range = [
            change.startLineNumber,
            change.startColumn,
            change.endLineNumber,
            change.endColumn,
        ];

        return new EditorSelection(cursor, range);
    }
}

module.exports = EditorSelection;
