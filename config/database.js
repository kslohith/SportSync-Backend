var admin = require("firebase-admin");

var serviceAccount = require("./sportsSync-sdk-config.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://mas-backend-default-rtdb.firebaseio.com"
});

// Initialize Firebase
const db = admin.firestore();

module.exports = db;