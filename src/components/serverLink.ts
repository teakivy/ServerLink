import { Client, TextChannel } from 'discord.js';
import { getChannel, getLinkChannels } from '../managers/ChannelManager';
import WOKCommands from 'wokcommands';
import { getWebhookWithChannel } from '../managers/WebhookManager';

export default (client: Client, instance: WOKCommands) => {
	client.on('messageCreate', async (message) => {
		if (message.author.bot) return;
		let toChannels = await getLinkChannels(message.channel as TextChannel);
		let fromChannel = message.channel;

		let avatarURL: string | undefined | null = message.author.avatarURL();
		if (!avatarURL) avatarURL = undefined;

		for (const channel of toChannels) {
			(await getWebhookWithChannel(channel.id)).send({
				content: message.content,
				username: message.author.username,
				avatarURL,
			});
		}
	});
};

// Configuration for this feature
const config = {
	displayName: 'Server Link',
};

export { config };
