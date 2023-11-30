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
    sport: req.body.sport,
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
  const updateData = req.body;
  // updateFields.forEach((field) => {
  //   if (field === 'attendees' || field === 'requestedAttendees') {
  //     if (req.body[field].op === 'remove') {
  //       updateData[field] = db.FieldValue.arrayRemove(req.body[field].list);
  //     } else {
  //       updateData[field] = db.FieldValue.arrayUnion(req.body[field].list);
  //     }
  //   } else {
  //     updateData[field]= req.body[field];
  //   }
  // });
  //res.status(500).json(updateData);
  //if (Object.keys(updateData) == 0) res.status(500).json({message: 'No data provided'});
  //res.status(500).json(updateData);
  eventCollection.where("eventId", "==", eventId).get().then((querySnapshot) => {
    if (!querySnapshot.empty) {
      const d = querySnapshot.docs[0].data();
      if (updateData.hasOwnProperty("attendees")) {
        var listAttend = [...d.attendees];
        if (updateData.attendees.op === "remove") {
          updateData.attendees.list.forEach((name) => {
            const i = listAttend.indexOf(name);
            listAttend.splice(i, 1);
          });
          updateData["attendees"] = listAttend;
        } else if (updateData.attendees.op === "add") {
          updateData.attendees.list.forEach((name) => {
            listAttend.push(name);
          });
          updateData["attendees"] = listAttend;
        }
      }
      //d.attendees.add("Person");
      
      // const i = listAttend.indexOf("Matthew");
      // listAttend.splice(i, 1);
      //res.status(200).json(updateData);

      if (updateData.hasOwnProperty("requestedAttendees")) {
        var listAttend = [...d.requestedAttendees];
        if (updateData.requestedAttendees.op === "remove") {
          updateData.requestedAttendees.list.forEach((name) => {
            const i = listAttend.indexOf(name);
            listAttend.splice(i, 1);
          });
          updateData["requestedAttendees"] = listAttend;
        } else if (updateData.requestedAttendees.op === "add") {
          updateData.requestedAttendees.list.forEach((name) => {
            listAttend.push(name);
          });
          updateData["requestedAttendees"] = listAttend;
        }
      }

      querySnapshot.docs[0].ref.update(updateData)
      .then(()=>res.status(200).json({message: 'Success. Document updated'}))
      .catch((err) => res.status(500).json({message: 'Error updating document'}));
    } else {
      res.status(500).json({message: 'No document with id'});
    }
  }).catch((err) => {
    res.status(500).json({message: 'Error fetching document'});
  });
});


router.get('/getAllEvents', function(req, res, next) {
  const data = {
    organizer: req.query.name,
  }
  
  const eventCollection = db.collection("event");

  eventCollection.get()
  .then((querySnapshot) => {
    const filteredItems = [];
    querySnapshot.forEach((doc) => {
      const itemData = doc.data();
      filteredItems.push(itemData);
    });
    res.status(200).json({data:filteredItems});
  })
  .catch((error) => {
    res.status(500).json({message: 'Error fetching data'});
  });
});

router.get('/getUpcomingGames', function(req, res, next) {
  const data = {
    email: req.query.email,
  }  
  const eventCollection = db.collection("event");
  eventCollection.get()
  .then((querySnapshot) => {
    const filteredItems = [];
    querySnapshot.forEach((doc) => {
      const itemData = doc.data();
      if(itemData.attendees.includes(data.email)){
        filteredItems.push(itemData);
      }
    });
    console.log(filteredItems);
    res.status(200).json({data:filteredItems});
  })
  .catch((error) => {
    res.status(500).json({message: 'Error fetching data'});
  });
});


router.post('/toggleABtest', function(req, res, next) {
  const data = {
    enableABtest: req.body.enableABtest,
  }  
    db.collection('abtest').doc('enableABtest').set(data.enableABtest)
    .then(() => {
      res.status(200).json({message: 'Data Successfully inserted'});
    })
    .catch((error) => {
      res.status(500).json({message: 'Data insertion error ! Internal Server Error'});
    });
});

module.exports = router;
