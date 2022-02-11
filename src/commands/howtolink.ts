import { ApplicationCommand, MessageEmbed, Permissions, TextChannel } from 'discord.js';
import { Brand } from '../utils';
import { ICommand } from 'wokcommands';
import { client } from '../main';

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
	name: 'howtolink',
	category: 'Utility',
	description: 'How to add a link to a channel',

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
			title: '❓  How to Link Channels',
			color: Brand.color,
			description:
				`**When linking a channel, you can either use the channel's ID or a channel mention.**\n> **-** If you are linking channels within the same server, you can use the channel mention.\n> **-** If you are linking channels between servers, you can must the channel's ID.\n\n\n` +
				`**How to add channels using a Mention:**\n> Use the command \`/link add channel: <channel>\` like so: \`\`\`/link add channel:#general\`\`\`\n> This will link the *#general* channel to the current channel.\n\n\n` +
				`**How to add channels using a Channel ID:**\n> **- [How to get a Channel ID?](https://youtu.be/B8tc-ebwv4g)**\n> \n> Use the command \`/link add channel_id: <channel id>\` like so: \`\`\`/link add channel:938939760477622275\`\`\`\n> This will link the channel with the ID *938939760477622275* to the current channel.\n\n` +
				`<:info:939399136216743986>  ***Note:** Both channels MUST be linked to each other for the link to function.*`,
		});

		interaction.reply({
			embeds: [reply],
		});
	},
} as ICommand;
