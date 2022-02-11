type Command = {
	name: string;
	category: 'Utility' | 'Links';
	description: string;
	usage: string;
};

export const commands: Command[] = [
	{
		name: 'ping',
		category: 'Utility',
		description: 'Replies with pong',
		usage: 'ping',
	},
	{
		name: 'howtolink',
		category: 'Utility',
		description: 'How to add a link to a channel',
		usage: 'howtolink',
	},
	{
		name: 'help',
		category: 'Utility',
		description: 'Help Me!',
		usage: 'help',
	},
	{
		name: 'link add',
		category: 'Links',
		description: 'Add a link to a channel',
		usage: 'link add < channel | channel_id > [ confirm ]',
	},
	{
		name: 'link remove',
		category: 'Links',
		description: 'Remove a link from a channel',
		usage: 'link remove < channel | channel_id > [ confirm ]',
	},
	{
		name: 'link removeall',
		category: 'Links',
		description: 'Remove all link from a channel',
		usage: 'link removeall [ confirm ]',
	},
	{
		name: 'link config attachments',
		category: 'Links',
		description: 'If attachments should be sent to the current channel through links',
		usage: 'link config attachments < enabled >',
	},
];
