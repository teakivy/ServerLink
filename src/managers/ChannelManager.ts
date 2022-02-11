import { Channel, Guild, Permissions, TextChannel } from 'discord.js';
import { client } from '../main';

import { collection, deleteDoc, doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../core/firebase';
import { Logger } from '../core/logger';

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

export const addChannelLink = (fromChannel: TextChannel | string, toChannel: TextChannel | string): Promise<boolean> => {
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
		await addServerLinkToGuildList(fromChannel);

		if (!fromChannelDoc.exists()) {
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

		Logger.log(
			`Added link from ${fromChannel.name} (${fromChannel.id}) in ${fromChannel.guild.name} (${fromChannel.guild.id}) to ${toChannel.name} (${toChannel.id}) in ${toChannel.guild.name} (${toChannel.guild.id})`
		);

		resolve(true);
	});
};

export const addServerLinkToGuildList = (channel: TextChannel | string): Promise<boolean> => {
	return new Promise(async (resolve, reject) => {
		if (typeof channel === 'string') {
			channel = client.channels.cache.get(channel) as TextChannel;
		}

		if (!(channel instanceof TextChannel)) {
			return resolve(false);
		}

		const serverDoc = await getDoc(doc(db, 'guilds', channel.guild.id));

		if (!serverDoc.exists()) {
			await setDoc(doc(db, 'guilds', channel.guild.id), {
				links: [channel.id],
			});

			return resolve(true);
		}

		const serverData = serverDoc.data();

		if (!serverData) {
			return resolve(false);
		}

		if (!serverData.links) {
			serverData.links = [];
		}

		if (!(serverData.links instanceof Array)) {
			return resolve(false);
		}

		if (serverData.links.includes(channel.id)) {
			return resolve(true);
		}

		serverData.links.push(channel.id);

		setDoc(doc(db, 'guilds', channel.guild.id), { links: serverData.links }, { merge: true });

		resolve(true);
	});
};

export const deleteChannelDoc = (channel: TextChannel | string): Promise<boolean> => {
	return new Promise(async (resolve, reject) => {
		if (typeof channel === 'string') {
			channel = client.channels.cache.get(channel) as TextChannel;
		}

		if (!(channel instanceof TextChannel)) {
			return resolve(false);
		}

		await deleteDoc(doc(db, 'linkChannels', channel.id));

		resolve(true);
	});
};

export const deleteChannelDocById = (channelId: string): Promise<boolean> => {
	return new Promise(async (resolve, reject) => {
		await deleteDoc(doc(db, 'linkChannels', channelId));
		resolve(true);
	});
};

export const removeChannelLink = (fromChannel: TextChannel | string, toChannel: TextChannel | string): Promise<boolean> => {
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
			return resolve(true);
		}

		const fromChannelData = fromChannelDoc.data();

		if (!fromChannelData) {
			return resolve(false);
		}

		if (!fromChannelData.links) {
			return resolve(true);
		}

		if (!(fromChannelData.links instanceof Array)) {
			return resolve(false);
		}

		if (!fromChannelData.links.includes(toChannel.id)) {
			return resolve(true);
		}

		let toChannelId = toChannel.id;

		fromChannelData.links = fromChannelData.links.filter((channelId: string) => channelId !== toChannelId);
		setDoc(doc(db, 'linkChannels', fromChannel.id), { links: fromChannelData.links }, { merge: true });

		Logger.log(
			`Removed link from ${fromChannel.name} (${fromChannel.id}) in ${fromChannel.guild.name} (${fromChannel.guild.id}) to ${toChannel.name} (${toChannel.id}) in ${toChannel.guild.name} (${toChannel.guild.id})`
		);

		resolve(true);
	});
};

export const removeAllChannelLinks = (fromChannel: TextChannel | string): Promise<boolean> => {
	return new Promise(async (resolve, reject) => {
		if (typeof fromChannel === 'string') {
			fromChannel = client.channels.cache.get(fromChannel) as TextChannel;
		}

		if (!(fromChannel instanceof TextChannel)) {
			return resolve(false);
		}

		const fromChannelDoc = await getDoc(doc(db, 'linkChannels', fromChannel.id));

		if (!fromChannelDoc.exists()) {
			return resolve(true);
		}

		const fromChannelData = fromChannelDoc.data();

		if (!fromChannelData) {
			return resolve(true);
		}

		if (!fromChannelData.links) {
			return resolve(true);
		}

		if (!(fromChannelData.links instanceof Array)) {
			return resolve(false);
		}

		fromChannelData.links = [];

		setDoc(doc(db, 'linkChannels', fromChannel.id), { links: fromChannelData.links }, { merge: true });

		Logger.log(
			`Removed all links from ${fromChannel.name} (${fromChannel.id}) in ${fromChannel.guild.name} (${fromChannel.guild.id})`
		);

		resolve(true);
	});
};

export const deleteServerDoc = (guild: Guild | string): Promise<boolean> => {
	return new Promise(async (resolve, reject) => {
		if (typeof guild === 'string') {
			guild = client.guilds.cache.get(guild) as Guild;
		}

		if (!(guild instanceof Guild)) {
			return resolve(false);
		}

		const serverDoc = await getDoc(doc(db, 'guilds', guild.id));

		if (!serverDoc.exists()) {
			return resolve(true);
		}

		const serverData = serverDoc.data();

		if (!serverData) {
			await deleteDoc(doc(db, 'guilds', guild.id));
			resolve(true);
		}

		if (!serverData.links) {
			await deleteDoc(doc(db, 'guilds', guild.id));
			resolve(true);
		}

		if (!(serverData.links instanceof Array)) {
			await deleteDoc(doc(db, 'guilds', guild.id));
			resolve(true);
		}

		for (const channelId of serverData.links) {
			await deleteChannelDocById(channelId);
		}

		await deleteDoc(doc(db, 'guilds', guild.id));
		resolve(true);
	});
};

export const createServerDoc = (guild: Guild): Promise<boolean> => {
	return new Promise(async (resolve, reject) => {
		const serverDoc = await getDoc(doc(db, 'guilds', guild.id));

		if (serverDoc.exists()) {
			return resolve(true);
		}

		const serverData = {
			links: [],
			config: {
				allowAttachments: true,
				anonymousSender: false,
			},
		};

		setDoc(doc(db, 'guilds', guild.id), serverData);

		resolve(true);
	});
};

export const setAttachmentsEnabled = (channel: TextChannel | string, enabled: boolean): Promise<boolean> => {
	return new Promise(async (resolve, reject) => {
		if (typeof channel === 'string') {
			channel = client.channels.cache.get(channel) as TextChannel;
		}

		if (!(channel instanceof TextChannel)) {
			return resolve(false);
		}

		const fromChannelDoc = await getDoc(doc(db, 'linkChannels', channel.id));
		await addServerLinkToGuildList(channel);

		if (!fromChannelDoc.exists()) {
			await setDoc(
				doc(db, 'linkChannels', channel.id),
				{
					config: {
						attachments: enabled,
					},
				},
				{ merge: true }
			);

			return resolve(true);
		}

		const fromChannelData = fromChannelDoc.data();

		if (!fromChannelData) {
			return resolve(false);
		}

		if (!fromChannelData.config) {
			fromChannelData.config = {};
		}

		if (!(fromChannelData.config instanceof Object)) {
			return resolve(false);
		}

		fromChannelData.config.attachments = enabled;

		setDoc(doc(db, 'linkChannels', channel.id), { config: fromChannelData.config }, { merge: true });

		Logger.log(
			`Set attachments enabled for ${channel.name} (${channel.id}) in ${channel.guild.name} (${channel.guild.id}) to ${enabled}`
		);

		resolve(true);
	});
};

export const getAttachmentsEnabled = (channel: TextChannel | string): Promise<boolean> => {
	return new Promise(async (resolve, reject) => {
		if (channel instanceof TextChannel) {
			channel = channel.id;
		}

		if (!(client.channels.cache.get(channel) as TextChannel).guild?.me?.permissions.has(Permissions.FLAGS.ATTACH_FILES))
			return resolve(false);

		const fromChannelDoc = await getDoc(doc(db, 'linkChannels', channel));

		if (!fromChannelDoc.exists()) {
			return resolve(true);
		}

		const fromChannelData = fromChannelDoc.data();

		if (!fromChannelData) {
			return resolve(true);
		}

		if (!fromChannelData.config) {
			return resolve(true);
		}

		if (fromChannelData.config.attachments === undefined) {
			return resolve(true);
		}

		if (typeof fromChannelData.config.attachments !== 'boolean') {
			return resolve(true);
		}

		resolve(fromChannelData.config.attachments);
	});
};
