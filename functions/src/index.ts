// Initialize the Firebase Admin SDK to access the Firebase Products
const functions = require('firebase-functions');
require('firebase-admin').initializeApp(functions.config().firebase);

import generateThumbnail from './generateThumbnail';

exports.generateThumbnail = generateThumbnail;
