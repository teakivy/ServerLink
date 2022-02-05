import { Channel, TextChannel } from 'discord.js';
import { client } from '../main';

import { collection, doc, getDoc, setDoc } from 'firebase/firestore';
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
		const channelDoc = await getDoc(doc(db, 'linkChannels', channel.id));

		if (!channelDoc.exists) {
			return resolve([]);
		}

		const channelData = channelDoc.data();

		if (!channelData) return resolve([]);
		if (!channelData.links) {
			return resolve([]);
		}

		if (!(channelData.links instanceof Array)) {
			return resolve([]);
		}

		let links = channelData.links.map((channelId: string) => client.channels.cache.get(channelId) as TextChannel);

		links = links.filter((channel: TextChannel) => channel !== undefined);

		let finalLinks: TextChannel[] = [];

		for (const lChannel of links) {
			if (!(lChannel instanceof TextChannel)) continue;

			const cDoc = await getDoc(doc(db, 'linkChannels', lChannel.id));

			if (!cDoc.exists) continue;
			const cData = cDoc.data();

			if (!cData) continue;
			if (!cData.links) continue;
			if (!(cData.links instanceof Array)) continue;
			if (!cData.links.includes(channel.id)) continue;

			finalLinks.push(lChannel);
		}

		finalLinks = finalLinks.filter((lChannel: TextChannel) => lChannel !== undefined);

		resolve(finalLinks);
	});
};

export const addChannelLink = (
	fromChannel: TextChannel | string,
	toChannel: TextChannel | string
): Promise<boolean> => {
	return new Promise(async (resolve, reject) => {
		if (typeof fromChannel === 'string') {
			fromChannel = client.channels.cache.get(fromChannel) as TextChannel;
		}

		if (typeof toChannel === 'string') {
			toChannel = client.channels.cache.get(toChannel) as TextChannel;
		}

		if (!(fromChannel instanceof TextChannel)) {
			return resolve(false);
		}

		if (!(toChannel instanceof TextChannel)) {
			return resolve(false);
		}

		const fromChannelDoc = await getDoc(doc(db, 'linkChannels', fromChannel.id));

		if (!fromChannelDoc.exists()) {
			console.log('Creating new channel link doc');
			await setDoc(doc(db, 'linkChannels', fromChannel.id), {
				links: [toChannel.id],
			});

			return resolve(true);
		}

		const fromChannelData = fromChannelDoc.data();

		if (!fromChannelData) {
			return resolve(false);
		}

		if (!fromChannelData.links) {
			fromChannelData.links = [];
		}

		if (!(fromChannelData.links instanceof Array)) {
			return resolve(false);
		}

		if (fromChannelData.links.includes(toChannel.id)) {
			return resolve(true);
		}

		fromChannelData.links.push(toChannel.id);

		setDoc(doc(db, 'linkChannels', fromChannel.id), { links: fromChannelData.links }, { merge: true });

		resolve(true);
	});
};
