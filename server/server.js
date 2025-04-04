const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;
const DATA_FILE = path.join(__dirname, 'notes.json');

// Initialize notes file if it doesn't exist
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, '[]', 'utf8');
}

app.use(cors());
app.use(bodyParser.json());

// Get all notes
app.get('/api/notes', (req, res) => {
  fs.readFile(DATA_FILE, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Error reading notes' });
    }
    res.json(JSON.parse(data));
  });
});

// Add a new note
app.post('/api/notes', (req, res) => {
  const newNote = req.body;
  
  fs.readFile(DATA_FILE, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Error reading notes' });
    }
    
    const notes = JSON.parse(data);
    newNote.id = Date.now().toString();
    notes.push(newNote);
    
    fs.writeFile(DATA_FILE, JSON.stringify(notes, null, 2), (err) => {
      if (err) {
        return res.status(500).json({ error: 'Error saving note' });
      }
      res.status(201).json(newNote);
    });
  });
});

// Delete a note
app.delete('/api/notes/:id', (req, res) => {
  const noteId = req.params.id;
  
  fs.readFile(DATA_FILE, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Error reading notes' });
    }
    
    let notes = JSON.parse(data);
    const initialLength = notes.length;
    notes = notes.filter(note => note.id !== noteId);
    
    if (notes.length === initialLength) {
      return res.status(404).json({ error: 'Note not found' });
    }
    
    fs.writeFile(DATA_FILE, JSON.stringify(notes, null, 2), (err) => {
      if (err) {
        return res.status(500).json({ error: 'Error deleting note' });
      }
      res.json({ success: true });
    });
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});