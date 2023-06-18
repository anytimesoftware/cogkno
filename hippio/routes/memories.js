const express = require('express');
const router = express.Router();

module.exports = router;

const { openai, supabase } = require('../services/openai');

router.post('/', async (req, res) => {
    const memory = req.body.memory;

    try {
        // Generate the embedding using the OpenAI API
        const embedding = await openai.encode(memory);

        // Store the embedding in Supabase
        const { data, error } = await supabase
            .from('memories')
            .insert([{ embedding }]);

        if (error) throw error;

        res.send('Received new memory and stored the embedding');
    } catch (error) {
        res.status(500).send('An error occurred while processing the memory');
    }
});
