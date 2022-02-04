import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

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

export { app, db };
