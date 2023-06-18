# Hippio: The AI Neural Memory Service

Hippio is an advanced AI service designed to emulate the functionality of the Hippocampus—the memory center of the human brain. Hippio transforms memories or data into meaningful memory embeddings leveraging the power of OpenAI's API.

These embeddings are efficiently stored in a Supabase Postgres database, making them readily accessible for retrieval and usage in various AI applications. Hippio goes a step further by mimicking the process of human memory consolidation—it intelligently refines, connects, and strengthens these memory embeddings over time, contributing to the development of more complex and lifelike AI systems.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Installation](#installation)
3. [Usage](#usage)
4. [Contributing](#contributing)
5. [License](#license)

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- Node.js
- Express.js
- OpenAI account (with API key)
- Supabase account (with API key)

## Installation

1. Clone the repository:
    ```
    git clone https://github.com/your_username/hippio.git
    ```

2. Install the dependencies:
    ```
    cd hippio
    npm install
    ```

3. Create a `.env` file in the root directory of the project and populate it with your OpenAI and Supabase API keys:
    ```
    OPENAI_API_KEY=<your_openai_api_key>
    SUPABASE_URL=<your_supabase_url>
    SUPABASE_ANON_KEY=<your_supabase_anon_key>
    ```

## Usage

To start the Express server, run:
```
npm start
```
Then, send POST requests with memories to `http://localhost:3000/memories`.

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

---

Remember to replace the placeholder URLs and paths with the actual ones for your project. Also, you may need to create `CONTRIBUTING.md` and `LICENSE.md` files if you want to include them in your project.