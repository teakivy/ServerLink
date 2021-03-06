import { ApplicationCommand, MessageEmbed, Permissions, TextChannel } from 'discord.js';
import { Brand } from '../utils';
import { ICommand } from 'wokcommands';
import { client } from '../main';
import { Logger } from '../core/logger';

let missingPermissionsEmbed = (channel: TextChannel, missingPermissions: string[]) => {
	return new MessageEmbed({
		title: `❌  Missing Permissions`,
		color: Brand.color,
		description: `I don't have enough permissions to operate!\nPlease ensure <@${
			client?.user?.id
		}> has the following permissions, and try again:\n\`\`\`\n${missingPermissions.join(', ')}\`\`\``,
	});
};

export default {
	name: 'ping',
	category: 'Utility',
	description: 'Replies with pong',

	slash: true,

	callback: async ({ interaction, client }) => {
		let missingPermissions = [];
		if (!interaction.guild?.me?.permissions.has(Permissions.FLAGS.SEND_MESSAGES)) missingPermissions.push('SEND_MESSAGES');
		if (!interaction.guild?.me?.permissions.has(Permissions.FLAGS.VIEW_CHANNEL)) missingPermissions.push('VIEW_CHANNEL');

		if (missingPermissions.length > 0) {
			interaction.reply({
				embeds: [missingPermissionsEmbed(interaction.channel as TextChannel, missingPermissions)],
				ephemeral: true,
			});
			return;
		}

		// interaction.guild?.commands.set([]);
		const reply = new MessageEmbed({
			title: '🏓  Pong!',
			color: Brand.color,
			description: `Latency is \`${Math.abs(Date.now() - interaction.createdTimestamp)}ms\`. API Latency is \`${Math.round(
				client.ws.ping
			)}ms\`.`,
		});

		interaction.reply({
			embeds: [reply],
		});

		Logger.log(`${interaction.user.tag} (${interaction.user.id}) ran /ping`);
	},
} as ICommand;
