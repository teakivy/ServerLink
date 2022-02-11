import DiscordJS, { Intents, Client } from 'discord.js';
import WOKCommands from 'wokcommands';
import path from 'path';

import { Build } from './utils';

import dotenv from 'dotenv';
import { askEmail, askPassword, auth } from './core/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
dotenv.config();

const client = new Client({
	intents: [
		Intents.FLAGS.GUILDS,
		Intents.FLAGS.GUILD_MESSAGES,
		Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
		Intents.FLAGS.GUILD_WEBHOOKS,
	],
});

client.on('ready', () => {
	client.user?.setStatus('online');
	client.user?.setActivity(`${client.guilds.cache.size} Servers`, { type: 'WATCHING' });

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

(async () => {
	let email = await askEmail();
	let password = await askPassword();
	let loggedIn = false;

	await signInWithEmailAndPassword(auth, email, password)
		.then((userCredential) => {
			loggedIn = true;
		})
		.catch((error) => {
			console.log('Error signing in: ', error.message);
		});

	if (loggedIn) {
		client.login(token);
	} else {
		process.exit(1);
	}
})();

// client.login(token);

export { client };
