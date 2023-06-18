const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function storeEmbedding(embedding) {
    const { data, error } = await supabase
        .from('embeddings')
        .insert([{ embedding }]);
    
    if (error) {
        console.error('Error storing embedding:', error);
    }
    
    return data;
}

async function retrieveEmbedding(id) {
    const { data, error } = await supabase
        .from('embeddings')
        .select('*')
        .eq('id', id);
    
    if (error) {
        console.error('Error retrieving embedding:', error);
    }
    
    return data;
}

async function updateEmbedding(id, updatedEmbedding) {
    const { data, error } = await supabase
        .from('embeddings')
        .update(updatedEmbedding)
        .eq('id', id);
    
    if (error) {
        console.error('Error updating embedding:', error);
    }
    
    return data;
}

module.exports = { storeEmbedding, retrieveEmbedding, updateEmbedding };

