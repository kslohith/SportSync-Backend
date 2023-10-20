var express = require('express');
var router = express.Router();
const db = require("../config/database");

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

function getRandomId(length) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let randomId = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    randomId += characters.charAt(randomIndex);
  }

  return randomId;
}

router.post('/createEvent', function(req, res, next) {
  const data = {
    eventName: req.body.eventName,
    organizer: req.body.organizer,
    venue: req.body.venue,
    date: req.body.date,
    slotsRemaining: req.body.slotsRemaining,
    isPrivate: req.body.isPrivate,
    capacity: req.body.capacity,
    attendees: req.body.attendees,
    dateOfCreation: req.body.dateOfCreation,
    eventSkill: req.body.eventSkill,
    requestedAttendees: req.body.requestedAttendees,
    eventId: getRandomId(8)
  }

  db.collection('event').doc(getRandomId(8)).set(data)
    .then(() => {
      res.status(200).json({message: 'Data Successfully inserted'});
    })
    .catch((error) => {
      res.status(500).json({message: 'Data insertion error ! Internal Server Error'});
    });
});

router.get('/getEventByUser', function(req, res, next) {
  const data = {
    organizer: req.query.name,
  }

  const filterKey = "organizer"
  const filterValue = data.organizer

  const eventCollection = db.collection("event");

  eventCollection.where(filterKey, "==", filterValue).get()
  .then((querySnapshot) => {
    const filteredItems = [];
    querySnapshot.forEach((doc) => {
      const itemData = doc.data();
      filteredItems.push(itemData);
    });
    console.log(filteredItems);
    res.status(200).json({data:filteredItems});
  })
  .catch((error) => {
    res.status(500).json({message: 'Error fetching data'});
  });
});

//for debugging purposes
/*router.delete('/events', (req, res) => {
  const eventCollection = db.collection("event");
  eventCollection.get().then((snapshot) => {

  })
})*/

router.get('/event', (req, res) => {
  const eventId = req.query.eventId;
  const eventCollection = db.collection("event");

  eventCollection.where("eventId", "==", eventId).get().then((querySnapshot) => {
    if (!querySnapshot.empty) {
      res.status(200).json({data:querySnapshot.docs[0].data()});
    }
  }).catch((err) => {
    res.status(500).json({message: 'Error fetching data'});
  });
});

router.post('/event', (req, res) => {
  const eventId = req.query.eventId;
  const eventCollection = db.collection("event");

  const updateFields = Object.keys(req.body);

  //res.status(200).json({updateFields});

  const updateData = {};
  updateFields.forEach((field) => {
    if (field === 'attendees' || field === 'requestedAttendees') {
      if (req.body[field].op === 'remove') {
        updateData[field] = firebase.firestore.FieldValue.arrayRemove(req.body[field].list);
      } else {
        updateData[field] = firebase.firestore.FieldValue.arrayUnion(req.body[field].list);
      }
    } else {
      updateData[field]= req.body[field];
    }
  });
  
  //if (updateData.length() == 0) res.status(500).json({message: 'No data provided'});
  res.status(200).json(updateData);
  
  // eventCollection.where("eventId", "==", eventId).get().then((querySnapshot) => {
  //   if (!querySnapshot.empty) {
  //     //res.status(200).json({data:querySnapshot.docs[0].data()})
  //     querySnapshot.docs[0].ref.update(updateData)
  //     .then(()=>res.status(200).json({message: 'Success. Document updated'}))
  //     .catch((err) => res.status(500).json({message: 'Error updating document'}));
  //   } else {
  //     res.status(500).json({message: 'No document with id'});
  //   }
  // }).catch((err) => {
  //   res.status(500).json({message: 'Error fetching document'});
  // });
});


module.exports = router;
