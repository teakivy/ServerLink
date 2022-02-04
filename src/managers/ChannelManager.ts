import { Channel, TextChannel } from 'discord.js';
import { client } from '../main';

import { collection, doc, getDoc } from 'firebase/firestore';
import { db } from '../core/firebase';

export const getChannel = (channelId: string): Promise<TextChannel> => {
	return new Promise((resolve, reject) => {
		const channel = client.channels.cache.get(channelId);

		if (!channel) {
			reject('Channel not found');
		} else {
			if (!(channel instanceof TextChannel)) return reject('Channel is not a text channel');
			resolve(channel);
		}
	});
};

export const getLinkChannels = async (channel: TextChannel): Promise<TextChannel[]> => {
	return new Promise(async (resolve, reject) => {
		const serverDoc = await getDoc(doc(db, 'guilds', channel.guild.id));

		if (!serverDoc.exists) {
			reject('Server not found');
		}

		const server = serverDoc.data();

		if (!server) return reject('Server not found');
		if (!server.linkChannels) {
			return resolve([]);
		}

		if (!(server.linkChannels[channel.id] instanceof Array)) {
			return resolve([]);
		}

		resolve(
			await server.linkChannels[channel.id].map(
				(channelId: string) => client.channels.cache.get(channelId) as TextChannel
			)
		);
	});
};
