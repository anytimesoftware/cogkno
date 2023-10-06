# /query POST
# interact with the agent

# /event POST
# post an experience for the agent to create a memory of

# memory
# an object with metadata created from a first-person experience

# embed memory
# create embeddings from a memory

# store memory
# store memory in the vector db

# recall
# recall top n similar results from vector db, with emphasis on metadata context

# postgres + pgvector for db

# dream and daydream
# dream - go over events/experiences and extract new insights
# daydream - hypothesize new events and extract hypothetical insights


# get vectordb set up
# define memory object
# get local llm set up
# implement query api
# implement event api
# implement memory embed and store
# implement recall
# implement raw consolidate
# implement qlora
# implement dream
# implement daydream