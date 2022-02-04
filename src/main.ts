import DiscordJS, { Intents, Client } from 'discord.js';
import WOKCommands from 'wokcommands';
import path from 'path';

import { Build } from './utils';

import dotenv from 'dotenv';
dotenv.config();

const client = new Client({
	intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS],
});

client.on('ready', () => {
	new WOKCommands(client, {
		commandsDir: path.join(__dirname, 'commands'),
		featuresDir: path.join(__dirname, 'components'),
		testServers: ['938939760016236544'],
		botOwners: ['408086350953447425', '630412665662996481'],
		disabledDefaultCommands: ['help', 'command', 'language', 'prefix', 'requiredrole'],
		typeScript: true,
	});
});

let token = Build.getBuildType() === 'release' ? process.env.RELEASE_TOKEN : process.env.DEV_TOKEN;
Build.updateBuild();

client.login(token);

export { client };
