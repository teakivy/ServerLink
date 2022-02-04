import { MessageEmbed } from 'discord.js';
import { Brand } from '../utils';
import { ICommand } from 'wokcommands';

export default {
	name: 'ping',
	category: 'Utility',
	description: 'Replies with pong',

	slash: true,
	testOnly: true,

	callback: ({ interaction, client }) => {
		const reply = new MessageEmbed({
			title: '🏓  Pong!',
			color: Brand.color,
			description: `Latency is \`${Math.abs(
				Date.now() - interaction.createdTimestamp
			)}ms\`. API Latency is \`${Math.round(client.ws.ping)}ms\`.`,
		});

		interaction.reply({
			embeds: [reply],
		});
	},
} as ICommand;
