// The Cloud Functions for Firebase SDK to create Cloud Functions and triggers.
const {logger} = require("firebase-functions");
const {onRequest} = require("firebase-functions/v2/https");
const {onDocumentCreated} = require("firebase-functions/v2/firestore");
// The Firebase Admin SDK to access Firestore.
const {initializeApp} = require("firebase-admin/app");
const {getFirestore} = require("firebase-admin/firestore");

initializeApp();


// Take the text parameter passed to this HTTP endpoint and insert it into
// Firestore under the path /messages/:documentId/original
exports.addmessage = onRequest(async (req, res) => {
    // Grab the text parameter.
    const original = req.query.text;
    // Push the new message into Firestore using the Firebase Admin SDK.
    const writeResult = await getFirestore()
        .collection("messages")
        .add({query: original});
    // Send back a message that we've successfully written the message
    res.json({result: `Message with ID: ${writeResult.id} added.`});
  });


// Listens for new messages added to /messages/:documentId/original
// and saves an uppercased version of the message
// to /messages/:documentId/uppercase
exports.makeuppercase = onDocumentCreated("/messages/{documentId}", (event) => {
  // Grab the current value of what was written to Firestore.
  const original = event.data.data().original;

  const SerpApi = require('google-search-results-nodejs');
  const search = new SerpApi.GoogleSearch("803658ef6d31763b5094e4c18d3d4a6604f4a311f68d63446afe91d102087142");
  const params = {
    q: original,
    location: "Austin, Texas, United States",
    hl: "en",
    gl: "us",
    google_domain: "google.com"
  };
  const callback = function(data) {
    console.log(data);
  };
  // Show result as JSON
  const results = search.json(params, callback);

  // Access the parameter `{documentId}` with `event.params`
  logger.log("Gathering Restults", event.params.documentId, original);


  // You must return a Promise when performing
  // asynchronous tasks inside a function
  // such as writing to Firestore.
  // Setting an 'uppercase' field in Firestore document returns a Promise.
  return event.data.ref.set({results}, {merge: true});
});



