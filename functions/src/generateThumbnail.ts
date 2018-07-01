
/**
 * Copyright 2016 Google Inc. All Rights Reserved.
 * With changes to business logic by Jakub Duras
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for t`he specific language governing permissions and
 * limitations under the License.
 */
'use strict';

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const gcs = require('@google-cloud/storage')();
const path = require('path');
const sharp = require('sharp');

const THUMB_MAX_WIDTH = 232;
const THUMB_MAX_HEIGHT = 174;

/**
 * When an image is uploaded in the Storage bucket We generate a thumbnail automatically using
 * Sharp.
 */
const generateThumbnail = functions.storage.object().onFinalize((object) => {
    const fileBucket = object.bucket; // The Storage bucket that contains the file.
    const filePath = object.name; // File path in the bucket.
    const contentType = object.contentType; // File content type.

    // Exit if this is triggered on a file that is not an image.
    if (!contentType.startsWith('image/')) {
        console.log('This is not an image.');
        return null;
    }

    // Get the file name.
    const fileName = path.basename(filePath);
    // Exit if the image is already a thumbnail.
    if (fileName.startsWith('thumb_')) {
        console.log('Already a Thumbnail.');
        return null;
    }

    const photoId = fileName.replace(path.extname(fileName), '');

    // Download file from bucket.
    const bucket = gcs.bucket(fileBucket);

    const metadata = {
        contentType: 'image/jpeg',
    };
    // We add a 'thumb_' prefix to thumbnails file name. That's where we'll upload the thumbnail.
    const thumbFileName = 'thumb_' + photoId;
    const thumbFilePath = path.join(path.dirname(filePath), thumbFileName);
    // Create write stream for uploading thumbnail
    const thumbnailUploadStream = bucket.file(thumbFilePath).createWriteStream({metadata});

    // Create Sharp pipeline for resizing the image and use pipe to read from bucket read stream
    const pipeline = sharp();
    pipeline
        .resize(THUMB_MAX_WIDTH, THUMB_MAX_HEIGHT)
        .crop(sharp.strategy.entropy)
        .jpeg()
        .pipe(thumbnailUploadStream);

    bucket.file(filePath).createReadStream().pipe(pipeline);

    const streamAsPromise = new Promise((resolve, reject) =>
        thumbnailUploadStream.on('finish', resolve).on('error', reject));

    // TODO: Make sure promise is returned so the cloud functions don't end sooner with 'connection error'
    let thumbnailUrl;
    return new Promise((resolve, reject) => {
        streamAsPromise.then(() => {
            console.log('Creating URL');
            // Thumbnail is available for cca 6 months
            return bucket.file(thumbFilePath).getSignedUrl({
                action: 'read',
                expires: (new Date()).setMonth((new Date()).getMonth() + 6)
            });
        }).then((responseThumbnailUrl) => {
            console.log('Setting cache');
            thumbnailUrl = responseThumbnailUrl;
            return bucket.file(thumbFilePath).setMetadata({
                cacheControl: 'private, max-age=' + (60 * 60 * 24 * 31 * 6)
            });
        }).then(() => {
            console.log('Getting metadata');
            return bucket.file(filePath).getMetadata();
        }).then((response) => {
            console.log('Setting thumbnail');
            const createdBy = response[0].metadata.createdBy;
    
            return admin.firestore().collection('users/' + createdBy + '/photos').doc(photoId).set({
                thumbnailUrl: thumbnailUrl[0]
            }, { merge: true });
        }).then(resolve).catch(reject);
    });

});

export default generateThumbnail;
