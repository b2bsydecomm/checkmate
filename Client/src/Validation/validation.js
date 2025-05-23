import joi from "joi";
import dayjs from "dayjs";

const THRESHOLD_COMMON_BASE_MSG = "Threshold must be a number.";

const nameSchema = joi
	.string()
	.max(50)
	.trim()
	.pattern(/^[A-Za-z]+$/)
	.messages({
		"string.empty": "Name is required",
		"string.max": "Name must be less than 50 characters long",
		"string.pattern.base": "Name must contain only letters",
	});

const passwordSchema = joi
	.string()
	.trim()
	.min(8)
	.custom((value, helpers) => {
		if (!/[A-Z]/.test(value)) {
			return helpers.error("uppercase");
		}
		return value;
	})
	.custom((value, helpers) => {
		if (!/[a-z]/.test(value)) {
			return helpers.error("lowercase");
		}
		return value;
	})
	.custom((value, helpers) => {
		if (!/\d/.test(value)) {
			return helpers.error("number");
		}
		return value;
	})
	.custom((value, helpers) => {
		if (!/[!?@#$%^&*()\-_=+[\]{};:'",.<>~`|\\/]/.test(value)) {
			return helpers.error("special");
		}
		return value;
	})
	.messages({
		"string.empty": "Password is required",
		"string.min": "Password must be at least 8 characters long",
		uppercase: "Password must contain at least one uppercase letter",
		lowercase: "Password must contain at least one lowercase letter",
		number: "Password must contain at least one number",
		special: "Password must contain at least one special character",
	});

const credentials = joi.object({
	firstName: nameSchema,
	lastName: nameSchema,
	email: joi
		.string()
		.trim()
		.email({ tlds: { allow: false } })
		.custom((value, helpers) => {
			const lowercasedValue = value.toLowerCase();
			if (value !== lowercasedValue) {
				return helpers.message("Email must be in lowercase");
			}
			return lowercasedValue;
		})
		.messages({
			"string.empty": "Email is required",
			"string.email": "Must be a valid email address",
		}),
	phone: joi.string().trim().allow("").pattern(/^\+[1-9]\d{4,14}$/).messages({
		"string.pattern.base": "Must be a valid phone number",
	}),
	password: passwordSchema,
	newPassword: passwordSchema,
	confirm: joi
		.string()
		.trim()
		.custom((value, helpers) => {
			const { password } = helpers.prefs.context;
			if (value !== password) {
				return helpers.error("different");
			}
			return value;
		})
		.messages({
			"string.empty": "This field can't be empty",
			different: "Passwords do not match",
		}),
	role: joi.array(),
	teamId: joi.string().allow("").optional(),
	inviteToken: joi.string().allow(""),
});

const monitorValidation = joi.object({
	url: joi
		.string()
		.trim()
		.custom((value, helpers) => {
			// Regex from https://gist.github.com/dperini/729294
			var urlRegex = new RegExp(
				"^" +
					// protocol identifier (optional)
					// short syntax // still required
					"(?:(?:https?|ftp):\\/\\/)?" +
					// user:pass BasicAuth (optional)
					"(?:" +
					// IP address dotted notation octets
					// excludes loopback network 0.0.0.0
					// excludes reserved space >= 224.0.0.0
					// excludes network & broadcast addresses
					// (first & last IP address of each class)
					"(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])" +
					"(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}" +
					"(?:\\.(?:[1-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))" +
					"|" +
					// host & domain names, may end with dot
					// can be replaced by a shortest alternative
					// (?![-_])(?:[-\\w\\u00a1-\\uffff]{0,63}[^-_]\\.)+
					"(?:" +
					"(?:" +
					"[a-z0-9\\u00a1-\\uffff]" +
					"[a-z0-9\\u00a1-\\uffff_-]{0,62}" +
					")?" +
					"[a-z0-9\\u00a1-\\uffff]\\." +
					")+" +
					// TLD identifier name, may end with dot
					"(?:[a-z\\u00a1-\\uffff]{2,}\\.?)" +
					")" +
					// port number (optional)
					"(?::\\d{2,5})?" +
					// resource path (optional)
					"(?:[/?#]\\S*)?" +
					"$",
				"i"
			);
			if (!urlRegex.test(value)) {
				return helpers.error("string.invalidUrl");
			}

			return value;
		})
		.messages({
			"string.empty": "This field is required.",
			"string.uri": "The URL you provided is not valid.",
			"string.invalidUrl": "Please enter a valid URL with optional port",
		}),
	port: joi.number(),
	name: joi.string().trim().max(50).allow("").messages({
		"string.max": "This field should not exceed the 50 characters limit.",
	}),
	textFind: joi.string().trim().allow(""),
	type: joi.string().trim().messages({ "string.empty": "This field is required." }),
	interval: joi.number().messages({
		"number.base": "Frequency must be a number.",
		"any.required": "Frequency is required.",
	}),
});

const imageValidation = joi.object({
	type: joi.string().valid("image/jpeg", "image/png").messages({
		"any.only": "Invalid file format.",
		"string.empty": "File type required.",
	}),
	size: joi
		.number()
		.max(3 * 1024 * 1024)
		.messages({
			"number.base": "File size must be a number.",
			"number.max": "File size must be less than 3 MB.",
			"number.empty": "File size required.",
		}),
});

const settingsValidation = joi.object({
	ttl: joi.number().required().messages({
		"string.empty": "TTL is required",
	}),
});

const dayjsValidator = (value, helpers) => {
	if (!dayjs(value).isValid()) {
		return helpers.error("any.invalid");
	}
	return value;
};

const maintenanceWindowValidation = joi.object({
	repeat: joi.string(),
	startDate: joi.custom(dayjsValidator, "Day.js date validation"),
	startTime: joi.custom(dayjsValidator, "Day.js date validation"),
	duration: joi.number().integer().min(0),
	durationUnit: joi.string(),
	name: joi.string(),
	monitors: joi.array().min(1),
});

const advancedSettingsValidation = joi.object({
	apiBaseUrl: joi.string().uri({ allowRelative: true }).trim().messages({
		"string.empty": "API base url is required.",
		"string.uri": "The URL you provided is not valid.",
	}),
	logLevel: joi.string().valid("debug", "none", "error", "warn").allow(""),
	systemEmailHost: joi.string().allow(""),
	systemEmailPort: joi.number().allow(null, ""),
	systemEmailAddress: joi.string().allow(""),
	systemEmailPassword: joi.string().allow(""),
	jwtTTLNum: joi.number().messages({
		"number.base": "JWT TTL is required.",
	}),
	jwtTTLUnits: joi
		.string()
		.trim()
		.custom((value, helpers) => {
			if (!["days", "hours"].includes(value)) {
				return helpers.message("JWT TTL unit is required.");
			}
			return value;
		}),
	dbType: joi.string().trim().messages({
		"string.empty": "DB type is required.",
	}),
	redisHost: joi.string().trim().messages({
		"string.empty": "Redis host is required.",
	}),
	redisPort: joi.number().allow(null, ""),
	pagespeedApiKey: joi.string().allow(""),
});

const infrastructureMonitorValidation = joi.object({
	url: joi
		.string()
		.trim()
		.custom((value, helpers) => {
			const urlRegex =
				/^(https?:\/\/)?(([0-9]{1,3}\.){3}[0-9]{1,3}|[\da-z\.-]+)(\.[a-z\.]{2,6})?(:(\d+))?([\/\w \.-]*)*\/?$/i;

			if (!urlRegex.test(value)) {
				return helpers.error("string.invalidUrl");
			}

			return value;
		})
		.messages({
			"string.empty": "This field is required.",
			"string.uri": "The URL you provided is not valid.",
			"string.invalidUrl": "Please enter a valid URL with optional port",
		}),
	name: joi.string().trim().max(50).allow("").messages({
		"string.max": "This field should not exceed the 50 characters limit.",
	}),
	secret: joi.string().trim().messages({ "string.empty": "This field is required." }),
	usage_cpu: joi.number().messages({
		"number.base": THRESHOLD_COMMON_BASE_MSG,
	}),
	cpu: joi.boolean(),
	memory: joi.boolean(),
	disk: joi.boolean(),
	temperature: joi.boolean(),
	usage_memory: joi.number().messages({
		"number.base": THRESHOLD_COMMON_BASE_MSG,
	}),
	usage_disk: joi.number().messages({
		"number.base": THRESHOLD_COMMON_BASE_MSG,
	}),
	usage_temperature: joi.number().messages({
		"number.base": "Temperature must be a number.",
	}),
	// usage_system: joi.number().messages({
	// 	"number.base": "System load must be a number.",
	// }),
	// usage_swap: joi.number().messages({
	// 	"number.base": "Swap used must be a number.",
	// }),
	interval: joi.number().messages({
		"number.base": "Frequency must be a number.",
		"any.required": "Frequency is required.",
	}),
});

export {
	credentials,
	imageValidation,
	monitorValidation,
	settingsValidation,
	maintenanceWindowValidation,
	advancedSettingsValidation,
	infrastructureMonitorValidation,
};
