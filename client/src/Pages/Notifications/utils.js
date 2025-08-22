export const NOTIFICATION_TYPES = [
	{ _id: 1, name: "E-mail", value: "email" },
	{ _id: 2, name: "Slack", value: "slack" },
	{ _id: 3, name: "PagerDuty", value: "pager_duty" },
	{ _id: 4, name: "Webhook", value: "webhook" },
	{ _id: 5, name: "Discord", value: "discord" },
	{ _id: 6, name: "Sms", value: "sms" },
];

export const TITLE_MAP = {
	email: "createNotifications.emailSettings.title",
	slack: "createNotifications.slackSettings.title",
	pager_duty: "createNotifications.pagerDutySettings.title",
	webhook: "createNotifications.webhookSettings.title",
	discord: "createNotifications.discordSettings.title",
	sms: "Sms",
};

export const DESCRIPTION_MAP = {
	email: "createNotifications.emailSettings.description",
	slack: "createNotifications.slackSettings.description",
	pager_duty: "createNotifications.pagerDutySettings.description",
	webhook: "createNotifications.webhookSettings.description",
	discord: "createNotifications.discordSettings.description",
	sms: "The phone number to send SMS notifications to.",
};

export const LABEL_MAP = {
	email: "createNotifications.emailSettings.emailLabel",
	slack: "createNotifications.slackSettings.webhookLabel",
	pager_duty: "createNotifications.pagerDutySettings.integrationKeyLabel",
	webhook: "createNotifications.webhookSettings.webhookLabel",
	discord: "createNotifications.discordSettings.webhookLabel",
	sms: "Sms",
};

export const PLACEHOLDER_MAP = {
	email: "createNotifications.emailSettings.emailPlaceholder",
	slack: "createNotifications.slackSettings.webhookPlaceholder",
	pager_duty: "createNotifications.pagerDutySettings.integrationKeyPlaceholder",
	webhook: "createNotifications.webhookSettings.webhookPlaceholder",
	discord: "createNotifications.discordSettings.webhookPlaceholder",
	sms: "e.g., +6134567890",
};
