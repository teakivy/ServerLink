import { Client, TextChannel } from 'discord.js';
import { createServerDoc, deleteChannelDoc, deleteServerDoc } from '../managers/ChannelManager';
import WOKCommands from 'wokcommands';
import { Logger } from '../core/logger';

export default (client: Client, instance: WOKCommands) => {
	client.on('channelDelete', async (channel) => {
		if (!(channel instanceof TextChannel)) return;
		deleteChannelDoc(channel as TextChannel);
		Logger.log(`Deleted Channel ${channel.name} (${channel.id}) from guild ${channel.guild.name} (${channel.guild.id})`);
	});

	client.on('guildDelete', async (guild) => {
		deleteServerDoc(guild);

		client.user?.setActivity(`${client.guilds.cache.size} Servers`, { type: 'WATCHING' });

		Logger.log(`Left ${guild.name} (${guild.id})`);
	});

	client.on('guildCreate', async (guild) => {
		createServerDoc(guild);

		client.user?.setActivity(`${client.guilds.cache.size} Servers`, { type: 'WATCHING' });

		Logger.log(`Joined ${guild.name} (${guild.id})`);
	});
};

// Configuration for this feature
const config = {
	displayName: 'Data Management',
	dbName: 'dataManagement',
};

export { config };
