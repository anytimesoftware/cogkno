const moment = require('moment');

async function consolidateMemories() {
    // Sample memories with higher probability for more recent ones
    const sampledMemories = await sampleMemories(process.env.CONSOLIDATION_SAMPLE_SIZE);

    for (let memory of sampledMemories) {
        reconsolidate(memory)
    }
}

async function reconsolidate(memory, context = null) {
    // Find similar memories
    const similarMemories = await findSimilarMemories(memory);

    // If a new context is provided, add it to the similar memories
    if (context !== null) {
        const contextEmbedding = await openai.encode(context);
        similarMemories.push(contextEmbedding);
    }

    // Ask GPT-3 if the memory should be reconsolidated (consolidated or expanded)
    const action = await decideAction(similarMemories);

    if (action === 'consolidate') {
        // Reconsolidation through consolidation: Combine similar memories into a more refined memory
        await consolidate(memory, similarMemories);
    } else if (action === 'expand') {
        // Reconsolidation through expansion: Generate new memories based on the current one
        await expand(memory, similarMemories);
    }

    // After reconsolidation, the memory is stable but subject to further reconsolidation in the future.
}

async function decideAction(similarMemories) {
    // Convert the embeddings back into text (this may need to be adjusted depending on your implementation)
    const memoriesText = similarMemories.map(memory => openai.decode(memory));

    // Construct a prompt for GPT-3 based on the memories
    let prompt = 'Given the following memories:\n';
    prompt += memoriesText.join('\n');
    prompt += '\nShould I consolidate or expand these memories?';

    // Query the GPT-3 model (replace this with your own logic)
    const response = await openai.query(prompt);

    // Assume the response is in the format "Action: consolidate" or "Action: expand"
    const action = response.split(': ')[1];

    return action;
}

async function consolidate(memory, similarMemories) {
    // Convert the embeddings back into text
    const memoriesText = similarMemories.map(m => openai.decode(m));

    // Construct a prompt for GPT-3 to generate a more general memory
    let prompt = 'Generate a more general memory from the following memories:\n';
    prompt += memoriesText.join('\n');

    // Query the GPT-3 model
    const generalMemoryText = await openai.query(prompt);

    // Encode the general memory back into an embedding
    const generalMemoryEmbedding = await openai.encode(generalMemoryText);

    // Store the new memory
    await supabase.from('memories').insert([{ embedding: generalMemoryEmbedding }]);
}

async function expand(memory, similarMemories) {
    // Convert the embeddings back into text
    const memoryText = openai.decode(memory);
    const similarMemoriesText = similarMemories.map(m => openai.decode(m));

    // Construct a prompt for GPT-3 to generate more specific memories
    let prompt = 'Given the following memory and similar memories, generate more specific memories:\n';
    prompt += 'Main Memory: ' + memoryText + '\n';
    prompt += 'Similar Memories: \n' + similarMemoriesText.join('\n');

    // Query the GPT-3 model
    const specificMemoriesText = await openai.query(prompt);

    // Encode the specific memories back into embeddings
    const specificMemoriesEmbeddings = await Promise.all(specificMemoriesText.map(t => openai.encode(t)));

    // Store the new memories
    await supabase.from('memories').insert(specificMemoriesEmbeddings.map(embedding => ({ embedding })));
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
