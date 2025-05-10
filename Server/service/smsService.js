import twilio from "twilio";

const SERVICE_NAME = "SmsService";

/**
 * Represents an SMS service that can send SMS messages.
 */
class SmsService {
	static SERVICE_NAME = SERVICE_NAME;
	/**
	 * Constructs an instance of the SmsService, initializing the Twilio client.
	 * @param {Object} settingsService - The settings service to get SMS configuration.
	 * @param {Object} logger - The logger module.
	 */
	constructor(settingsService, logger) {
		this.settingsService = settingsService;
		this.logger = logger;

		/**
		 * The Twilio client used to send SMS messages.
		 * @type {Object}
		 */
		this.client = null;

		const { smsNotificationEnabled, twilioAccountSid, twilioAuthToken, twilioPhoneNumber } = this.settingsService.getSettings();

		if (!smsNotificationEnabled) {
			this.logger.info({
				message: "SMS notifications are disabled",
				service: SERVICE_NAME,
			});
		} else if (!twilioAccountSid || !twilioAuthToken || !twilioPhoneNumber) {
			this.logger.error({
				message: "SMS notifications are enabled but the Twilio credentials are not set",
				service: SERVICE_NAME,
			});
		} else {
            this.logger.info({
                message: `SMS notifications are enabled: sid=${twilioAccountSid}, authToken=${twilioAuthToken}, phone=${twilioPhoneNumber}`,
                service: SERVICE_NAME,
            });

			this.client = twilio(twilioAccountSid, twilioAuthToken);
		}
	}

	/**
	 * Asynchronously builds and sends an SMS using a specified message and recipient phone number.
	 *
	 * @param {string} text - The message to send.
	 * @param {string} to - The recipient's phone number.
	 * @returns {Promise<boolean>} A promise that resolves to true if the SMS is sent successfully, false otherwise.
	 */
	sendSms = async (text, to) => {
        if (!this.client) {
            this.logger.error({
                message: "SMS notifications are disabled",
                service: SERVICE_NAME,
            });
            return false;
        }
        const { twilioPhoneNumber } = this.settingsService.getSettings();
        this.logger.info({
            message: `Sending SMS to ${to}: ${text}`,
            service: SERVICE_NAME,
        });
        try {
            const message = await this.client.messages
                .create({
                    body: text,
                    to: to,
                    from: twilioPhoneNumber,
                });
            this.logger.info({
                message: `SMS sent: ${message.sid}`,
                service: SERVICE_NAME,
            });
            return true;
        } catch (error) {
            this.logger.error({
                message: `Error sending SMS: ${error.message}`,
                service: SERVICE_NAME,
            });
            return false;
        }
	};
}
export default SmsService;
