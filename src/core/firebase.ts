import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

import inquirer from 'inquirer';

import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

const firebaseConfig = {
	apiKey: 'AIzaSyDv33wvY1XugyN0_1_49vmKvw25BMvMj9Q',
	authDomain: 'serverlink-d096d.firebaseapp.com',
	projectId: 'serverlink-d096d',
	storageBucket: 'serverlink-d096d.appspot.com',
	messagingSenderId: '62924135342',
	appId: '1:62924135342:web:0add75f989a37cbc22c63f',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore();

const auth = getAuth();

let askEmail = async () => {
	const email = await inquirer.prompt({
		name: 'email',
		type: 'password',
		message: 'Email ::>     ',
	});

	return email.email;
};

let askPassword = async () => {
	const password = await inquirer.prompt({
		name: 'password',
		type: 'password',
		message: 'Password ::>  ',
	});

	return password.password;
};

export { app, db, askEmail, askPassword, auth };
