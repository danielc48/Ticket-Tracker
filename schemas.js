const Joi = require('joi')

module.exports.ticketSchema = Joi.object({
    ticket: Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required(),
        reproduceBug: Joi.string().required(),
        status: Joi.string(),
        classification: Joi.string()
    }).required()
})