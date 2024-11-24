# ChatHDC

**ChatHDC** is an AI-powered chatbot designed for Hathaway Dinwiddie. This application facilitates seamless interactions, combining a React-based front-end and a Node.js server for the back-end, both written in TypeScript.

## Overview

ChatHDC is an intelligent chatbot solution tailored for Hathaway Dinwiddie, offering real-time responses and enhanced user experience. The app includes a modern front-end built with React and a robust back-end powered by Node.js. It leverages AI to answer questions and provide insights efficiently.

---

## Features

- 🧠 **AI-Powered Responses**: Powered by advanced natural language processing.
- 🌐 **React Front-End**: Interactive and user-friendly interface.
- 🛠️ **Node.js Back-End**: Manages API requests and AI processing.
- ⚡ **Real-Time Communication**: Instant responses with WebSocket support.
- 🔒 **Secure Design**: Built with best practices for data integrity and security.

---

## Architecture

The project is split into two main parts:
1. **Front-End (React)**: Handles the user interface and interactions.
2. **Back-End (Node.js)**: Provides the AI processing and API endpoints.

Both components are written in TypeScript for type safety and better developer experience.

---

## Getting Started

You mush have Node already installed on your computer for this to work. If you do not have node please visit https://nodejs.org/en/download/package-manager

1. **Install ReactDependencies** : Run the following bash commands from the root folder
```
cd chatBot
npm install
```
2. **Install Node** : Run the following bash commands from the root folder
```
cd server
npm install
```

## Run Server
1. **Start Front End**: From the /chatBot directory run the Bash Command below. Front End will load on computer on localhost:3000
```
npm start
```
2. **Start Server**: From the /server directory run the Bash Command below. Server will load on computer on localhost:5000.
PLEASE MAKE SURE TO HAVE ENVIRONMENT VARIABLES SET IN var.env within the server folder.
```
npx dotenv -e var.env tsx src/index.ts
```
