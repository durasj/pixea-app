'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const gcs = require('@google-cloud/storage')();
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(functions.config().sendgrid.key);
sgMail.setSubstitutionWrappers('{{', '}}');
const sendOrder = functions.firestore
    .document('users/{userId}/orders/{orderId}')
    .onCreate((snap, context) => __awaiter(this, void 0, void 0, function* () {
    const order = snap.data();
    const bucket = admin.storage().bucket();
    const details = `Contact Name: ${order.name}
        Contact Email: ${order.email}

        Type: ${order.type}
        Size: ${order.size}
        Number: ${order.number}
        Comment: ${order.comment}`;
    const attachments = [];
    for (const photoId of order.photos) {
        const metadata = yield bucket.file('photos/' + photoId).getMetadata();
        const content = yield bucket.file('photos/' + photoId).download();
        attachments.push({
            content: content[0].toString('base64'),
            filename: metadata[0].metadata.originalName,
            type: metadata[0].contentType,
            disposition: 'attachment',
        });
    }
    const messages = [
        sgMail.send({
            to: order.name + ' <' + order.email + '>',
            from: 'Pixea <pixea@mail.pixea.sk>',
            replyTo: 'Pixea <pixea@pixea.sk>',
            text: details,
            html: '<p>' + details.replace(/\n/g, '<br>') + '</p>',
            templateId: 'd8029bae-6eb3-4942-bd36-1b814f58f0ad',
            substitutions: {
                name: order.name
            },
            categories: ['Transactional'],
        }),
        sgMail.send({
            to: 'Pixea <pixea@pixea.sk>',
            from: 'Pixea <pixea@mail.pixea.sk>',
            replyTo: order.name + ' <' + order.email + '>',
            text: details,
            html: '<p>' + details.replace(/\n/g, '<br>') + '</p>',
            templateId: 'af754603-c152-493c-b061-c917a94d1ba5',
            categories: ['Transactional'],
            attachments: attachments,
        }),
    ];
    yield Promise.all(messages);
}));
exports.default = sendOrder;
//# sourceMappingURL=sendOrder.js.map