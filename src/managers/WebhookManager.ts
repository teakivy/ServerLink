import { TextChannel, Webhook } from 'discord.js';
import { Logger } from '../core/logger';
import { client } from '../main';

export const getWebhookWithChannel = (channelId: string): Promise<Webhook> => {
	return new Promise(async (resolve, reject) => {
		const channel = client.channels.cache.get(channelId);

		if (!channel) return reject('Channel not found');
		if (!(channel instanceof TextChannel)) return reject('Channel is not a text channel');

		const webhooks = channel.fetchWebhooks();
		let webhook = (await webhooks).find((wh) => wh.token !== undefined);

		if (!webhook) {
			if (!client.user) return reject('Client not found');
			channel
				.createWebhook('ServerLink Webhook', {
					avatar: client.user.avatarURL(),
				})
				.then((wh) => {
					resolve(wh);
					webhook = wh;

					Logger.log(`Created webhook in channel ${channel.name} (${channel.id})`);
				})
				.catch((err) => {
					reject('Failed to create webhook');

					Logger.error(`Failed to create webhook in channel ${channel.name} (${channel.id}):\n${err}`);
				});
		}

		if (webhook) resolve(webhook);
	});
};
