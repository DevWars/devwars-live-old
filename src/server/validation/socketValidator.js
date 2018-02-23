const Ajv = require('ajv');

const ajv = new Ajv();

module.exports = {
    validateAuth: ajv.compile({
        type: 'string',
    }),

    validateObjectiveNotify: ajv.compile({
        type: 'object',
        properties: {
            team: {
                type: 'string',
                pattern: '^(blue|red)$',
            },
            id: {
                type: 'number',
                minimum: 0,
            },
        },
        required: ['team', 'id'],
    }),

    validateSetObjectiveState: ajv.compile({
        type: 'object',
        properties: {
            team: {
                type: 'string',
                pattern: '^(blue|red)$',
            },
            id: {
                type: 'number',
                minimum: 0,
            },
            state: {
                type: 'string',
                pattern: '^(incomplete|pending|complete|dropped)$',
            },
        },
        required: ['team', 'id', 'state'],
    }),

    validateAddStrike: ajv.compile({
        type: 'string',
        pattern: '^(blue|red)$',
    }),

    validateOp: ajv.compile({
        type: 'object',
        properties: {
            t: {
                type: 'string',
            },
            r: {
                type: 'array',
                items: {
                    type: 'number',
                    minimum: 0,
                    multipleOf: 1,
                },
                minItems: 2,
                maxItems: 4,
                additionalItems: false,
            },
        },
        required: ['r'],
        additionalProperties: false,
    }),

    validateSel: ajv.compile({
        type: 'array',
        items: {
            type: 'array',
            minItems: 2,
            maxItems: 5,
        },
        minItems: 1,
        maxItems: 16,
    }),
};
