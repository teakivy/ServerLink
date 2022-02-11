import { GuildMember, MessageEmbed, Permissions, TextChannel } from 'discord.js';
import { Brand } from '../utils';
import { ICommand } from 'wokcommands';
import { addChannelLink, removeAllChannelLinks, removeChannelLink, setAttachmentsEnabled } from '../managers/ChannelManager';
import { client } from '../main';

const noChannelEmbed = new MessageEmbed({
	title: '❌  No Channel Selected',
	color: Brand.color,
	description: 'Please select a channel to link.',
});
const tooManyChannelsEmbed = new MessageEmbed({
	title: '❌  Too Many Channels Selected',
	color: Brand.color,
	description: 'Please select only one channel to link.',
});
const channelNotFoundEmbed = new MessageEmbed({
	title: '❌  Channel Not Found',
	color: Brand.color,
	description: 'Please select a valid channel to link and ensure ServerLink is in the server.',
});
const channelNotLinkedEmbed = (channel: TextChannel) => {
	return new MessageEmbed({
		title: `❌  Channel Not Linked`,
		color: Brand.color,
		description: `<#${channel.id}> could not be linked. Please try again later.`,
	});
};
const channelNotUnlinkedEmbed = (channel: TextChannel) => {
	return new MessageEmbed({
		title: `❌  Channel Not Unlinked`,
		color: Brand.color,
		description: `<#${channel.id}> could not be unlinked. Please try again later.`,
	});
};

const channelLinkedEmbed = (channel: TextChannel, missingPerms: string[]) => {
	return new MessageEmbed({
		title: `✅  Channel Linked`,
		color: Brand.color,
		description: `<#${channel.id}> is now linked.${
			missingPerms.length > 0
				? `\n\n**⚠️  Warning**\n> I don't have enough permissions to operate!\n> Please ensure <@${
						client?.user?.id
				  }> has the following permissions or this link may not function properly\n> \`\`\`\n> ${missingPerms.join(', ')}\`\`\``
				: ''
		}`,
	});
};
const channelUnlinkedEmbed = (channel: TextChannel, missingPerms: string[]) => {
	return new MessageEmbed({
		title: `✅  Channel Unlinked`,
		color: Brand.color,
		description: `<#${channel.id}> is no longer linked.${
			missingPerms.length > 0
				? `\n\n**⚠️  Warning**\n> I don't have enough permissions to operate!\n> Please ensure <@${
						client?.user?.id
				  }> has the following permissions or links may not function properly\n> \`\`\`\n> ${missingPerms.join(', ')}\`\`\``
				: ''
		}`,
	});
};

const allChannelLinksRemovedEmbed = (channel: TextChannel, missingPerms: string[]) => {
	return new MessageEmbed({
		title: `✅  Channel Links Cleared`,
		color: Brand.color,
		description: `Removed all links to <#${channel.id}>.${
			missingPerms.length > 0
				? `\n\n**⚠️  Warning**\n> I don't have enough permissions to operate!\n> Please ensure <@${
						client?.user?.id
				  }> has the following permissions or links may not function properly\n> \`\`\`\n> ${missingPerms.join(', ')}\`\`\``
				: ''
		}`,
	});
};

const noChannelLinksRemovedEmbed = (channel: TextChannel) => {
	return new MessageEmbed({
		title: `❌  Channel Link Not Cleared`,
		color: Brand.color,
		description: `Could not remove all links to <#${channel.id}>. Please try again later.`,
	});
};

const confirmAddEmbed = (channel: TextChannel) => {
	return new MessageEmbed({
		title: `✅  Confirm Link`,
		color: Brand.color,
		description:
			`Are you sure you want to link <#${channel.id}> to this channel?\n\n` +
			`Resend this command to confirm:\n\`\`\`/link add channel_id:${channel.id} confirm:True\`\`\``,
	});
};
const confirmRemoveEmbed = (channel: TextChannel) => {
	return new MessageEmbed({
		title: `✅  Confirm Unlink`,
		color: Brand.color,
		description:
			`Are you sure you want unlink <#${channel.id}> from this channel?\n\n` +
			`Resend this command to confirm:\n\`\`\`/link remove channel_id:${channel.id} confirm:True\`\`\``,
	});
};
const confirmRemoveAllEmbed = (channel: TextChannel) => {
	return new MessageEmbed({
		title: `✅  Confirm Clear`,
		color: Brand.color,
		description:
			`Are you sure you want to clear all links from <#${channel.id}>?\n\n` +
			`Resend this command to confirm:\n\`\`\`/link removeall confirm:True\`\`\``,
	});
};

const attachmentsEnabledEmbed = (channel: TextChannel, missingPerms: string[]) => {
	return new MessageEmbed({
		title: `✅  Attachments Enabled`,
		color: Brand.color,
		description: `Attachments are now enabled for <#${channel.id}>.${
			missingPerms.length > 0
				? `\n\n**⚠️  Warning**\n> I don't have enough permissions to operate!\n> Please ensure <@${
						client?.user?.id
				  }> has the following permissions or links not function properly\n> \`\`\`\n> ${missingPerms.join(', ')}> \`\`\``
				: ''
		}`,
	});
};
const attachmentsDisabledEmbed = (channel: TextChannel, missingPerms: string[]) => {
	return new MessageEmbed({
		title: `✅  Attachments Disabled`,
		color: Brand.color,
		description: `Attachments are now disabled for <#${channel.id}>.${
			missingPerms.length > 0
				? `\n\n**⚠️  Warning**\n> I don't have enough permissions to operate!\n> Please ensure <@${
						client?.user?.id
				  }> has the following permissions or links not function properly\n> \`\`\`\n> ${missingPerms.join(', ')}\`\`\``
				: ''
		}`,
	});
};

const noAdminPermsEmbed = (channel: TextChannel) => {
	return new MessageEmbed({
		title: `❌  No Permission`,
		color: Brand.color,
		description: `You do not have permission to link <#${channel.id}>.\nPlease ensure you have the \`MANAGE_CHANNELS\` permission, and try again.`,
	});
};

export default {
	name: 'link',
	category: 'Utility',
	description: 'Link Channels Together',

	slash: true,

	guildOnly: true,

	options: [
		{
			type: 'SUB_COMMAND',
			name: 'add',
			description: 'Add a link to a channel',
			options: [
				{
					type: 'CHANNEL',
					name: 'channel',
					description: 'The channel to link',
					channelTypes: ['GUILD_TEXT'],
				},
				{
					type: 'STRING',
					name: 'channel_id',
					description: 'The channel ID to link ( /howtolink )',
				},
				{
					type: 'BOOLEAN',
					name: 'confirm',
					description: 'Confirm the link',
				},
			],
		},
		{
			type: 'SUB_COMMAND',
			name: 'remove',
			description: 'Remove a link to a channel',
			options: [
				{
					type: 'CHANNEL',
					name: 'channel',
					description: 'The channel to link',
					channelTypes: ['GUILD_TEXT'],
				},
				{
					type: 'STRING',
					name: 'channel_id',
					description: 'The channel ID to link ( /howtolink )',
				},
				{
					type: 'BOOLEAN',
					name: 'confirm',
					description: 'Confirm the link',
				},
			],
		},
		{
			type: 'SUB_COMMAND',
			name: 'removeall',
			description: 'Remove all links to a channel',
			options: [
				{
					type: 'BOOLEAN',
					name: 'confirm',
					description: 'Confirm the link',
				},
			],
		},
		{
			type: 'SUB_COMMAND_GROUP',
			name: 'config',
			description: 'Adds a link to a channel',
			options: [
				{
					type: 'SUB_COMMAND',
					name: 'attachments',
					description: 'Whether users can send attachments through Server Link in this channel',
					options: [
						{
							type: 'BOOLEAN',
							name: 'enabled',
							description: 'Whether to enable attachments',
							required: true,
						},
					],
				},
			],
		},
	],

	callback: async ({ interaction, client }) => {
		if (!interaction.guild) return;
		if (!interaction.member) return;
		if (!(interaction.member instanceof GuildMember)) return;
		if (!interaction.member.permissions.has(Permissions.FLAGS.MANAGE_CHANNELS)) {
			interaction.reply({ embeds: [noAdminPermsEmbed(interaction.channel as TextChannel)], ephemeral: true });
			return;
		}

		let missingPermissions = [];
		if (!interaction.guild.me?.permissions.has(Permissions.FLAGS.MANAGE_WEBHOOKS)) missingPermissions.push('MANAGE_WEBHOOKS');
		if (!interaction.guild.me?.permissions.has(Permissions.FLAGS.SEND_MESSAGES)) missingPermissions.push('SEND_MESSAGES');
		if (!interaction.guild.me?.permissions.has(Permissions.FLAGS.EMBED_LINKS)) missingPermissions.push('EMBED_LINKS');
		if (!interaction.guild.me?.permissions.has(Permissions.FLAGS.ATTACH_FILES)) missingPermissions.push('ATTACH_FILES');
		if (!interaction.guild.me?.permissions.has(Permissions.FLAGS.VIEW_CHANNEL)) missingPermissions.push('VIEW_CHANNEL');
		if (!interaction.guild.me?.permissions.has(Permissions.FLAGS.USE_EXTERNAL_EMOJIS))
			missingPermissions.push('USE_EXTERNAL_EMOJIS');
		if (!interaction.guild.me?.permissions.has(Permissions.FLAGS.USE_EXTERNAL_STICKERS))
			missingPermissions.push('USE_EXTERNAL_STICKERS');

		const subCommand = interaction.options.getSubcommand();

		let cmdData = interaction.options.data[0];
		if (subCommand === 'add') {
			if (!cmdData.options) {
				interaction.reply({ embeds: [noChannelEmbed], ephemeral: true });
				return;
			}

			let channelOpt = interaction.options.getChannel('channel');
			let channelIdOpt = interaction.options.getString('channel_id');
			let confirmOpt = interaction.options.getBoolean('confirm');

			if (!channelOpt && !channelIdOpt) {
				interaction.reply({
					embeds: [noChannelEmbed],
					ephemeral: true,
				});
				return;
			}
			if (channelOpt && channelIdOpt) {
				interaction.reply({ embeds: [tooManyChannelsEmbed], ephemeral: true });
				return;
			}

			let channel: TextChannel;
			if (channelOpt) {
				channel = channelOpt as TextChannel;
			} else {
				if (typeof channelIdOpt !== 'string') {
					interaction.reply({ embeds: [channelNotFoundEmbed], ephemeral: true });
					return;
				}
				channel = client.channels.cache.get(channelIdOpt) as TextChannel;
				if (!channel) {
					interaction.reply({ embeds: [channelNotFoundEmbed], ephemeral: true });
					return;
				}
			}
			if (!confirmOpt) {
				interaction.reply({ embeds: [confirmAddEmbed(channel)], ephemeral: true });
				return;
			}

			let added = await addChannelLink(interaction.channel as TextChannel, channel);

			if (added) {
				interaction.reply({ embeds: [channelLinkedEmbed(channel, missingPermissions)], ephemeral: true });
				return;
			}

			interaction.reply({ embeds: [channelNotLinkedEmbed(channel)], ephemeral: true });
			return;
		}

		if (subCommand === 'remove') {
			if (!cmdData.options) {
				interaction.reply({ embeds: [noChannelEmbed], ephemeral: true });
				return;
			}

			let channelOpt = interaction.options.getChannel('channel');
			let channelIdOpt = interaction.options.getString('channel_id');
			let confirmOpt = interaction.options.getBoolean('confirm');

			if (!channelOpt && !channelIdOpt) {
				interaction.reply({
					embeds: [noChannelEmbed],
					ephemeral: true,
				});
				return;
			}
			if (channelOpt && channelIdOpt) {
				interaction.reply({ embeds: [tooManyChannelsEmbed], ephemeral: true });
				return;
			}
			let channel: TextChannel;
			if (channelOpt) {
				channel = channelOpt as TextChannel;
			} else {
				if (typeof channelIdOpt !== 'string') {
					interaction.reply({ embeds: [channelNotFoundEmbed], ephemeral: true });
					return;
				}
				channel = client.channels.cache.get(channelIdOpt) as TextChannel;
				if (!channel) {
					interaction.reply({ embeds: [channelNotFoundEmbed], ephemeral: true });
					return;
				}
			}

			if (!confirmOpt) {
				interaction.reply({ embeds: [confirmRemoveEmbed(channel)], ephemeral: true });
				return;
			}

			let removed = await removeChannelLink(interaction.channel as TextChannel, channel);

			if (removed) {
				interaction.reply({ embeds: [channelUnlinkedEmbed(channel, missingPermissions)], ephemeral: true });
				return;
			}

			interaction.reply({ embeds: [channelNotUnlinkedEmbed(channel)], ephemeral: true });
			return;
		}

		if (subCommand === 'removeall') {
			let confirmOpt = interaction.options.getBoolean('confirm');
			if (!confirmOpt) {
				interaction.reply({ embeds: [confirmRemoveAllEmbed(interaction.channel as TextChannel)], ephemeral: true });
				return;
			}

			let removed = await removeAllChannelLinks(interaction.channel as TextChannel);

			if (removed) {
				interaction.reply({
					embeds: [allChannelLinksRemovedEmbed(interaction.channel as TextChannel, missingPermissions)],
					ephemeral: true,
				});
				return;
			}

			interaction.reply({ embeds: [noChannelLinksRemovedEmbed(interaction.channel as TextChannel)], ephemeral: true });
			return;
		}

		if (interaction.options.getSubcommandGroup() === 'config') {
			let enabledOpt = interaction.options.getBoolean('enabled');
			if (typeof enabledOpt !== 'boolean') return;

			if (subCommand === 'attachments') {
				await setAttachmentsEnabled(interaction.channel as TextChannel, enabledOpt);

				if (enabledOpt == true) {
					interaction.reply({
						embeds: [attachmentsEnabledEmbed(interaction.channel as TextChannel, missingPermissions)],
						ephemeral: true,
					});
					return;
				}

				interaction.reply({
					embeds: [attachmentsDisabledEmbed(interaction.channel as TextChannel, missingPermissions)],
					ephemeral: true,
				});
				return;
			}
		}

		interaction.reply({ content: "🤔 Hmm... That doesn't seem to be a valid command...", ephemeral: true });
	},
} as ICommand;
