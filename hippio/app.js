const express = require('express');
const app = express();

const morgan = require('morgan');
const bodyParser = require('body-parser');
const cors = require('cors');

app.use(cors());
app.use(morgan('dev')); // Log HTTP Requests
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

const memoriesRoutes = require('./routes/memories');

// The route for memory-related endpoints
app.use('/memories', memoriesRoutes);


app.get('/', (req, res) => {
    res.send('Hippio server is up and running!');
});

const PORT = process.env.PORT || 3000; // Use the PORT from environment variables or fallback to 3000
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
