const moment = require('moment');

async function consolidateMemories() {
    // Sample memories with higher probability for more recent ones
    const sampledMemories = await sampleMemories(process.env.CONSOLIDATION_SAMPLE_SIZE);

    for (let memory of sampledMemories) {
        // Find similar memories
        const similarMemories = await findSimilarMemories(memory);

        // Ask ChatGPT if memories should be consolidated or expanded
        const action = await decideAction(similarMemories);

        if (action === 'consolidate') {
            await consolidate(memory, similarMemories);
        } else if (action === 'expand') {
            await expand(memory, similarMemories);
        }
    }
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
