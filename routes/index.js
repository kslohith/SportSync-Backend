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
    isPrivate: req.body.isPrivate
  }

  db.collection('event').doc(getRandomId(8)).set(data)
    .then(() => {
      res.status(200).json({message: 'Data Successfully inserted'});
    })
    .catch((error) => {
      res.status(500).json({message: 'Data insertion error ! Internal Server Error'});
    });

});

module.exports = router;
