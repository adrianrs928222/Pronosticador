require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const predictionsRouter = require('./predictions');

const app = express();
app.use(cors());
app.use(express.json());

// servir frontend estático
app.use(express.static(path.join(__dirname, './')));

// rutas
app.use('/api/predictions', predictionsRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`server running on port ${PORT}`));