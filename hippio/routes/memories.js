const express = require('express');
const router = express.Router();

// Import the necessary services
const { encode } = require('../services/openai');
const { storeEmbedding } = require('../services/supabase');

router.post('/', async (req, res) => {
    const memory = req.body.memory;

    try {
        // Generate the embedding using the OpenAI API
        const embedding = await encode(memory);

        // Store the embedding in Supabase
        const { data, error } = await storeEmbedding(embedding);

        if (error) throw error;

        res.send('Received new memory and stored the embedding');
    } catch (error) {
        res.status(500).send('An error occurred while processing the memory');
    }
});

module.exports = router;
