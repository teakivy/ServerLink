import { Client, Permissions, TextChannel } from 'discord.js';
import { getAttachmentsEnabled, getLinkChannels } from '../managers/ChannelManager';
import WOKCommands from 'wokcommands';
import { getWebhookWithChannel } from '../managers/WebhookManager';
import { Brand } from '../utils';

export default (client: Client, instance: WOKCommands) => {
	client.on('messageCreate', async (message) => {
		if (message.author.bot) return;
		let missingPermissions = [];
		if (!message.guild?.me?.permissions.has(Permissions.FLAGS.MANAGE_WEBHOOKS)) missingPermissions.push('MANAGE_WEBHOOKS');
		if (!message.guild?.me?.permissions.has(Permissions.FLAGS.SEND_MESSAGES)) missingPermissions.push('SEND_MESSAGES');
		if (!message.guild?.me?.permissions.has(Permissions.FLAGS.EMBED_LINKS)) missingPermissions.push('EMBED_LINKS');
		if (!message.guild?.me?.permissions.has(Permissions.FLAGS.ATTACH_FILES)) missingPermissions.push('ATTACH_FILES');
		if (!message.guild?.me?.permissions.has(Permissions.FLAGS.VIEW_CHANNEL)) missingPermissions.push('VIEW_CHANNEL');
		if (!message.guild?.me?.permissions.has(Permissions.FLAGS.USE_EXTERNAL_EMOJIS))
			missingPermissions.push('USE_EXTERNAL_EMOJIS');
		if (!message.guild?.me?.permissions.has(Permissions.FLAGS.USE_EXTERNAL_STICKERS))
			missingPermissions.push('USE_EXTERNAL_STICKERS');

		if (missingPermissions.length > 0) {
			message
				.reply({
					embeds: [
						{
							title: `❌  Missing Permissions`,
							color: Brand.color,
							description: `I don't have enough permissions to operate!\nPlease ensure <@${
								client.user?.id
							}> has the following permissions, and try again:\n\`\`\`\n${missingPermissions.join(', ')}\`\`\``,
						},
					],
					allowedMentions: { repliedUser: false },
				})
				.then(async (msg) => {
					setTimeout(() => msg.delete(), 10000);
				});
			return;
		}

		if (message.author.bot) return;
		let toChannels = await getLinkChannels(message.channel as TextChannel);

		let avatarURL: string | undefined | null = message.author.avatarURL();
		if (!avatarURL) avatarURL = undefined;

		for (const channel of toChannels) {
			try {
				(await getWebhookWithChannel(channel.id)).send({
					content: trimMessage(message.content, 2000),
					username: message.author.username,
					avatarURL,
					files: (await getAttachmentsEnabled(channel as TextChannel)) ? message.attachments.map((a) => a) : [],
				});
			} catch (e) {
				console.error(e);
			}
		}
	});
};

let trimMessage = (message: string, maxLength: number) => {
	if (message.length <= maxLength) return message;
	return message.substring(0, maxLength - 3) + '...';
};

// Configuration for this feature
const config = {
	displayName: 'Server Link',
	dbName: 'serverLink',
};

export { config };
