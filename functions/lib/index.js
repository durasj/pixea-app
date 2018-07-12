"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Initialize the Firebase Admin SDK to access the Firebase Products
const functions = require('firebase-functions');
require('firebase-admin').initializeApp(functions.config().firebase);
const generateThumbnail_1 = require("./generateThumbnail");
const sendOrder_1 = require("./sendOrder");
exports.generateThumbnail = generateThumbnail_1.default;
exports.sendOrder = sendOrder_1.default;
//# sourceMappingURL=index.js.map