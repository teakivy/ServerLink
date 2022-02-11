import fs from 'fs';

export class Logger {
	public static log(msg: any): void {
		console.info('\n' + msg);

		fs.appendFileSync('./src/logs/log.txt', `\n[INFO] [${new Date().toISOString()}] ${msg}\n`);
	}

	public static error(msg: any): void {
		console.info('\n' + msg);

		fs.appendFileSync('./src/logs/log.txt', `\n[ERROR] [${new Date().toISOString()}] ${msg}\n`);
	}

	public static warn(msg: any): void {
		console.info('\n' + msg);

		fs.appendFileSync('./src/logs/log.txt', `\n[WARN] [${new Date().toISOString()}] ${msg}\n`);
	}

	public static info(msg: any): void {
		console.info('\n' + msg);

		fs.appendFileSync('./src/logs/log.txt', `\n[INFO] [${new Date().toISOString()}] ${msg}\n`);
	}

	public static debug(msg: any): void {
		console.info('\n' + msg);

		fs.appendFileSync('./src/logs/log.txt', `\n[DEBUG] [${new Date().toISOString()}] ${msg}\n`);
	}
}
