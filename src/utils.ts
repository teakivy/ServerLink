import build from './build.json';
import fs from 'fs';

export class Utils {
	static getRandomInt(min: number, max: number): number {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}
}

export let Build = {
	getVersion(): string {
		return build.version;
	},

	getBuildDate(): Date {
		return new Date(build.date);
	},

	getBuildNumber(): number {
		return build.number;
	},

	getBuildType(): string {
		return build.type;
	},

	updateBuild(): void {
		build.number++;
		build.date = new Date().toISOString();

		console.log(`Updating build number to ${build.number}`);

		fs.writeFileSync('./src/build.json', JSON.stringify(build, null, '\t'));
	},
};

export let Brand = {
	color: Build.getBuildType() === 'release' ? 0x5865f2 : 0xf25858,
};
