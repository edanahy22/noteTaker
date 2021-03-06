//required dependencies
const express = require('express');
const path = require('path');
const fs = require('fs');
const util = require('util');
const { v4: uuidv4 } = require('uuid');

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




//GET Route for retrieving all notes
app.get('/api/notes', (req, res) => {
    console.info(`${req.method} request`);
    readFromFile('./db/db.json').then((data) => res.json(JSON.parse(data)));

})



//POST Route for new note
app.post('/api/notes', (req, res) => {
    console.info(`${req.method} request received to add a note`);

    //deconstructing object
    const { title, text } = req.body;

  // Check if there is anything in the response body
  if (req.body) {
    const newNote = {
        title,
        text,
        id: uuidv4(),
    };

    readAndAppend(newNote,'./db/db.json');
    res.json('New note has been added!');
} else {
    res.json('Must contain a title and text.');
  }
  console.log(req.body);
})
 
//DELETE Route for note
app.delete('/api/notes/:id', (req, res) => {
    const noteId = req.params.id;
    readFromFile('./db/db.json')
      .then((data) => JSON.parse(data))
      .then((json) => {
        // Make a new array of all tips except the one with the ID provided in the URL
        const result = json.filter((note) => note.id !== noteId);
  
        // Save that array to the filesystem
        writeToFile('./db/db.json', result);
  
        // Respond to the DELETE request
        res.json(`Note ${noteId} has been deleted ???????`);
      });
  });

//listening for requests on port
app.listen(PORT, () =>
  console.log(`App listening at http://localhost:${PORT} ????`)
);