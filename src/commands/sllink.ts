import { MessageEmbed, TextChannel } from 'discord.js';
import { Brand } from '../utils';
import { ICommand } from 'wokcommands';
import { addChannelLink } from '../managers/ChannelManager';

export default {
	name: 'slink',
	category: 'Utility',
	description: 'Replies with pong',

	slash: false,
	testOnly: true,

	callback: async ({ message, args }) => {
		let added = await addChannelLink(message.channel as TextChannel, args[0]);
		if (added) {
			message.reply('Channel added to link');
		} else {
			message.reply('An Error Occurred');
		}
	},
} as ICommand;
