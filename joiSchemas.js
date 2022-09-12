const BaseJoi = require('joi');
const sanitizeHtml = require('sanitize-html');

const extension = (joi) => ({
	type: 'string',
	base: joi.string(),
	messages: {
		'string.escapeHTML': '{{#label}} must not include HTML!'
	},
	rules: {
		escapeHTML: {
			validate(value, helpers) {
				const clean = sanitizeHtml(value, {
					allowedTags: [],
					allowedAttributes: {},
				});
				if (clean !== value) {
					return helpers.error('string.escapeHTML', {value});
				}
				return clean;
			}
		}
	}
});

const Joi = BaseJoi.extend(extension);

module.exports.joiCampgroundSchema = Joi.object({
	campground   : Joi.object({
		title       : Joi.string().required().min(5).max(50).pattern(new RegExp("^[^\\W_]+[\\s\\w'\\\\/]*$")).escapeHTML(),

		//image       : Joi.string().required(),

		price       : Joi.number().required().min(0).max(10000),

		description : Joi.string()
			.required()
			.pattern(new RegExp('^[\\s\\w!@#$%^&*(),.?\'"{}\\[\\];:\\\\/<>|+-=`~]*$'))
			.min(10)
			.max(300)
			.escapeHTML(),
			

		location    : Joi.string().required().min(5).max(50).pattern(new RegExp("^[^\\W_]+[\\s\\w,'\\\\/]*$")).escapeHTML()
	}).required(),
	deleteImages : Joi.array()
});

module.exports.joiReviewSchema = Joi.object({
	review : Joi.object({
		rating : Joi.number().required().integer().min(1).max(5),
		body   : Joi.string()
			.required()
			.pattern(new RegExp('^[\\s\\w!@#$%^&*(),.?\'"{}\\[\\];:\\\\/<>|+-=`~]*$'))
			.min(10)
			.max(500)
			.escapeHTML()
	}).required()
});
