const fs = require('fs');
const express = require('express');
const path = require('path');
const PORT = process.env.PORT || 3001;
const app = express();
const uniqid = require('uniqid');
const util = require('util');



// Middleware for parsing JSON and URL encoded form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static('public'));

// GET Routes for html pages
app.get('/', (req, res) =>{
    res.sendFile(path.join(__dirname, '/public/index.html'))
});
app.get('/notes', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/notes.html'))
});


// API routes

// Promise version of fs.readFile
const readFromFile = util.promisify(fs.readFile);

// GET Request that reads the db.json file and saves the data
app.get('/api/notes', (req, res) => {
    readFromFile('./db/db.json').then((data) => res.json(JSON.parse(data)))
});

// Helper function for post request
const writeToFile = (destination, content) =>
  fs.writeFile(destination, JSON.stringify(content, null, 4), (err) =>
    err ? console.error(err) : console.info(`\nData written to ${destination}`)
  );

// Helper function for post request
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

// POST request thats adds notes 
app.post('/api/notes', (req, res) => {
    const { title, text} = req.body;

    if (req.body) {
        const newTip = {
            title,
            text,
            id: uniqid(),
        };

        readAndAppend(newTip, './db/db.json');
        res.json('Note added succesffuly!');
    } else {
        res.error('Error in adding note.')
    }
});

app.listen(PORT, () =>
    console.log(`App listening at http://localhost:${PORT} 🚀`)
);
