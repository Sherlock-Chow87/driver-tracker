const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();

exports.owntracksReceiver = functions.https.onRequest(async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).send("Only POST requests are accepted");
  }

  const data = req.body;
  const { tid, lat, lon, tst } = data;

  if (!tid || !lat || !lon || !tst) {
    return res.status(400).send("Missing required GPS fields");
  }

  const driverRef = db.collection("drivers").doc(tid);

  await driverRef.collection("locations").add({
    latitude: lat,
    longitude: lon,
    timestamp: new Date(tst * 1000),
    raw: data,
  });

  await driverRef.set({
    lastSeen: new Date(tst * 1000),
    lastLat: lat,
    lastLon: lon,
  });

  return res.status(200).send("Location saved");
});
