import { ApplicationCommand, MessageEmbed, Permissions, TextChannel } from 'discord.js';
import { Brand } from '../utils';
import { ICommand } from 'wokcommands';
import { client } from '../main';
import { commands } from '../core/commands';

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
	name: 'help',
	category: 'Utility',
	description: 'Help Me!',

	slash: true,

	callback: async ({ interaction }) => {
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
		const reply = new MessageEmbed({
			title: '❓  Help! - Commands',
			color: Brand.color,
			description: commands.map((c) => `•  \`/${c.usage}\` - ${c.description}`).join('\n\n'),
		});

		interaction.reply({
			embeds: [reply],
		});
	},
} as ICommand;
