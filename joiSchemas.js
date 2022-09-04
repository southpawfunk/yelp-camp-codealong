const Joi = require('joi');

module.exports.joiCampgroundSchema = Joi.object({
	campground : Joi.object({
		title       : Joi.string().required().min(5).max(50).pattern(new RegExp("^[^\\W_]+[\\s\\w'\\\\/]*$")),

		image       : Joi.string().required(),

		price       : Joi.number().required().min(0).max(10000),

		description : Joi.string()
			.required()
			.pattern(new RegExp('^[\\s\\w!@#$%^&*(),.?\'"{}\\[\\];:\\\\/<>|+-=`~]*$'))
			.min(10)
			.max(300),

		location    : Joi.string().required().min(5).max(50).pattern(new RegExp("^[^\\W_]+[\\s\\w,'\\\\/]*$"))
	}).required()
});

module.exports.joiReviewSchema = Joi.object({
	review : Joi.object({
		rating : Joi.number().required().integer().min(1).max(5),
		body   : Joi.string()
			.required()
			.pattern(new RegExp('^[\\s\\w!@#$%^&*(),.?\'"{}\\[\\];:\\\\/<>|+-=`~]*$'))
			.min(10)
			.max(500)
	}).required()
});
