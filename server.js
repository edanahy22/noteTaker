//required dependencies
const express = require('express');
const path = require('path');
const fs = require('fs');
const util = require('util');
const notes = require('./db/db.json');


const PORT = process.env.PORT || 3001;

const app = express();

//middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static('public'));


//html routes
app.get('/', (req, res) =>
  res.sendFile(path.join(__dirname, '/public/index.html'))
);

app.get('/notes', (req, res) =>
  res.sendFile(path.join(__dirname, '/public/notes.html'))
);

const readFromFile = util.promisify(fs.readFile);

const writeToFile = (destination, content) =>
  fs.writeFile(destination, JSON.stringify(content, null, 4), (err) =>
    err ? console.error(err) : console.info(`\nData written to ${destination}`)
  );


const readAndAppend = (content, file) => {
    fs.readFile(file, 'utf8', (err, data) => {
      if (err) {
        console.error(err);
      } else {
        const parsedData = JSON.parse(data);
        parsedData.push(content);
        writeToFile(file, parsedData);
      }
    });
  };

//API route- GET request
app.get('/api/notes', (req, res) => {
    console.info(`${req.method} request`);
    readFromFile('./db/db.json').then((data) => res.json(JSON.parse(data)));

})

//API route--POST request
app.post('/api/notes', (req, res) => {

    //log POST request received
    console.info(`${req.method} request received to add a note`);

    //deconstructing object
    const { title, text } = req.body;

  // Check if there is anything in the response body
  if (req.body) {
    const newNote = {
        title,
        text,
    };

    readAndAppend(newNote,'./db/db.json');
    res.json('New note has been added!');
} else {
    res.json('Must contain a title and text.');
  }

  // Log the response body to the console
  console.log(req.body);
})

//listening for requests on port
app.listen(PORT, () =>
  console.log(`App listening at http://localhost:${PORT} 🚀`)
);