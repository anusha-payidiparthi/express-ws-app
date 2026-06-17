# Express WebSocket App

A small real-time web application built with Express and WebSockets. The server serves two static pages:

- `/chat.html` — a live chat interface
- `/dashboard.html` — a live metrics dashboard

## Features

- Real-time chat messages broadcast to all connected chat clients
- Live connection and message counters shown on the dashboard
- WebSocket subscriptions allow clients to listen only to the channel they need

## Project Structure

- `server.js` — creates the Express server, WebSocket server, and message handling logic
- `public/chat.html` — chat client UI
- `public/dashboard.html` — dashboard UI

## Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the server:
   ```bash
   node server.js
   ```

3. Open the app in your browser:
   - http://localhost:3000/chat.html
   - http://localhost:3000/dashboard.html

## How It Works

- The server listens on port `3000`
- Clients send WebSocket messages with a `type` field
- `subscribe` tells the server which channel the client wants to follow
- `chat_msg` sends a chat message to all subscribed chat clients
- `metrics_update` pushes dashboard updates to subscribed dashboard clients

## Notes

- The app currently does not define an npm `start` script, so the server is run directly with `node server.js`
- The WebSocket logic is handled in the same server instance as the Express app