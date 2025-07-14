# Wordle Slack Bot Backend

Backend service for handling Slack bot requests and integrations. Built with TypeScript, this project provides APIs and logic for Slack bots, supporting features like command parsing, event handling, and database operations.
This slack bot is hosted on AWS Lambda and ngrok.

## Features

- RESTful API endpoints for Slack events and commands
- Secure verification of Slack requests
- 2 MongoDB Databases for storing user data and game state

## Getting Started

### Prerequisites

- Node.js (>= 14.x)
- npm (>= 6.x)
- A Slack workspace and permission to create/manage bots
- (Optional) A database (e.g., MongoDB, PostgreSQL)

### Installation

1. Clone the repository:
    ```bash
    git clone https://github.com/ArushYadlapati/slack-bot-backend.git
    cd slack-bot-backend
    ```

2. Install dependencies:
    ```bash
    npm install
    ```

3. Set up environment variables:
    - Copy `.env.example` to `.env` and fill in required fields (Slack credentials, database URL, etc.).

4. Start the backend server:
    ```bash
    npm run start
    ```
