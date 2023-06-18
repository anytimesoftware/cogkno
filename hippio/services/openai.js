const { Configuration, OpenAIApi } = require("openai");

// Configure the OpenAI API with your API key
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// Define the function to create embeddings
async function encode(memory) {
  const response = await openai.createEmbedding({
    model: "text-embedding-ada-002",
    input: memory,
  });

  return response;
}

async function query(prompt, system="You are a system designed to mimic the biological process of memory storage and reconsolidation.") {
    const messages = [
        { "role": "system", "content": system },
        { "role": "user", "content": prompt }
    ];
    
    const chatCompletion = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: messages
    });

    return chatCompletion.data.choices[0].message.content;
}

module.exports = { encode, query, decode };
