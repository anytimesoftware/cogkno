const moment = require('moment');
const { supabase } = require("../services/supabase");
const { openai } = require("../services/openai");

const SIMILARITY_THRESHOLD = 0.9;

async function recall(query) {
    // Convert the query into an embedding
    const queryEmbedding = await openai.encode(query);

    // Query the database for similar memories
    const { data, error } = await supabase
        .from('memories')
        .select('*')
        .similarity('embedding', queryEmbedding)
        .order('similarity', {ascending: false});

    if (error) {
        console.error('Error recalling memory:', error);
        return null;
    }

    // Update the recency timestamp of similar memories if they are above the threshold
    for (let memory of data) {
        if (memory.similarity >= SIMILARITY_THRESHOLD) {
            await supabase
                .from('memories')
                .update({ recency: new Date() })
                .eq('id', memory.id);
        }
    }

    return data;
}

async function consolidateMemories() {
    // Sample memories with higher probability for more recent ones
    const sampledMemories = await sampleMemories(process.env.CONSOLIDATION_SAMPLE_SIZE);

    for (let memory of sampledMemories) {
        const similarMemories = await findSimilarMemories(memory);
        reconsolidate(memory, similarMemories)
    }
}

async function reconsolidate(memory, context) {
    // Ask GPT-3 if the memory should be reconsolidated (consolidated or expanded)
    const action = await decideAction(memory, context);

    if (action === 'consolidate') {
        // Reconsolidation through consolidation: Combine similar memories into a more refined memory
        await consolidate(memory, context);
    } else if (action === 'expand') {
        // Reconsolidation through expansion: Generate new memories based on the current one
        await expand(memory, context);
    }

    // After reconsolidation, the memory is stable but subject to further reconsolidation in the future.
}

async function decideAction(memory, similarMemories) {
    // Construct a prompt for GPT-3 based on the memories
    let prompt = 'Given the following memories:\n';
    prompt += [memory.text, ...similarMemories.map(memory => memory.text)].join('\n');
    prompt += '\nShould I consolidate or expand these memories?';

    // Query the GPT-3 model
    const response = await openai.query(prompt);

    // Assume the response is in the format "Action: consolidate" or "Action: expand"
    const action = response.split(': ')[1];

    return action;
}

async function consolidate(memory, similarMemories) {
    // Construct a prompt for GPT-3 to generate a more general memory
    let prompt = 'Generate a more general memory from the following memories:\n';
    prompt += similarMemories.map(m => m.text).join('\n');

    // Query the GPT-3 model
    const generalMemoryText = await openai.query(prompt);

    // Encode the general memory back into an embedding
    const generalMemoryEmbedding = await openai.encode(generalMemoryText);

    // Store the new memory and delete the original memory
    await supabase.from('memories').insert([{ embedding: generalMemoryEmbedding }]);
    await supabase.from('memories').delete().eq('id', memory.id);
}

async function expand(memory, similarMemories) {
    // Construct a prompt for GPT-3 to generate more specific memories
    let prompt = 'Given the following memory and similar memories, generate more specific memories:\n';
    prompt += 'Main Memory: ' + memory.text + '\n';
    prompt += 'Similar Memories: \n' + similarMemories.map(m => m.text).join('\n');

    // Query the GPT-3 model
    const specificMemoriesText = await openai.query(prompt);

    // Encode the specific memories back into embeddings
    const specificMemoriesEmbeddings = await Promise.all(specificMemoriesText.map(t => openai.encode(t)));

    // Store the new memories and delete the original memory
    await supabase.from('memories').insert(specificMemoriesEmbeddings.map(embedding => ({ embedding })));
    await supabase.from('memories').delete().eq('id', memory.id);
}



async function findSimilarMemories(memory) {
    // Get the embedding for the given memory
    const embedding = memory.embedding;

    // Use Supabase's vector search to find similar embeddings
    const { data, error } = await supabase
        .from('memories')
        .rpc('find_similar', { vector: embedding });

    if (error) {
        console.error('Error finding similar memories:', error);
        return [];
    }

    return data;
}

async function sampleMemories(sampleSize) {
    // Query Supabase for all memories
    const { data, error } = await supabase
        .from('memories')
        .select('*');

    if (error) {
        console.error('Error sampling memories:', error);
        return [];
    }

    // Get the current time
    const now = moment();

    // Calculate weights for each memory
    const weights = data.map(memory => {
        // Get the age of the memory in hours
        const age = moment.duration(now.diff(moment(memory.timestamp))).asHours();

        // Calculate the weight using exponential decay
        return Math.exp(-age / 12); // The decay factor here is set to 24, which means that memories' weights halve every 24 hours.
    });

    // Calculate the sum of all weights
    const weightSum = weights.reduce((a, b) => a + b, 0);

    // Normalize the weights so that they sum to 1
    const normalizedWeights = weights.map(weight => weight / weightSum);

    // Use these weights to sample memories
    const sampledMemories = [];
    for (let i = 0; i < sampleSize; i++) {
        const index = rouletteWheelSelection(normalizedWeights);
        sampledMemories.push(data[index]);
    }

    return sampledMemories;
}

function rouletteWheelSelection(weights) {
    // Generate a random number between 0 and 1
    let randNum = Math.random();

    // Find the index that this random number corresponds to
    let index = 0;
    while ((randNum -= weights[index]) > 0) {
        index++;
    }

    return index;
}


module.exports = { recall, consolidateMemories, reconsolidate };