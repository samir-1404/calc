const IrrigationContract = {
    inputs: {
        area: 'number',
        cropType: 'string',
        irrigationType: 'string',
        irrigationTime: 'number',
        staticHead: 'number',
        pipeLength: 'number',
        slopeLength: 'number',
        climateType: 'string',
    },
    outputs: {
        flow_rate_needed: 'number',
        head_needed: 'number',
        suggested_pump: 'object|null',
    },
};
module.exports = IrrigationContract;