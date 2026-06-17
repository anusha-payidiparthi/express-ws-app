import express from 'express';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// Serve front-end static files
app.use(express.static(path.join(__dirname, 'public')));

// Create a joint HTTP server running Express
const server = createServer(app);

// Mount the WebSocket server directly on the shared HTTP framework
const wss = new WebSocketServer({ server });

// Track system metrics for the dashboard
let totalMessagesSent = 0;

wss.on('connection', (ws) => {
  // Track active channels via custom properties
  ws.channel = null; 

  ws.on('message', (rawData) => {
    try {
      const parsed = JSON.parse(rawData);
      
      // 1. Handle Channel Registration
      if (parsed.type === 'subscribe') {
        ws.channel = parsed.channel; // 'chat' or 'dashboard'
        return;
      }

      // 2. Handle Live Chat Traffic
      if (ws.channel === 'chat' && parsed.type === 'chat_msg') {
        totalMessagesSent++;

        // Broadcast the message explicitly to chat clients
        broadcastToChannel('chat', {
          type: 'chat_msg',
          user: parsed.user || 'Anonymous',
          text: parsed.text,
          totalMessages: totalMessagesSent
        });

        // Push real-time performance updates to active dashboards
        broadcastToChannel('dashboard', {
          type: 'metrics_update',
          activeConnections: wss.clients.size,
          totalMessages: totalMessagesSent
        });
      }
    } catch (err) {
      console.error('Invalid message format received:', err);
    }
  });

  // Periodically clean up dashboard data when someone exits
  ws.on('close', () => {
    broadcastToChannel('dashboard', {
      type: 'metrics_update',
      activeConnections: wss.clients.size,
      totalMessages: totalMessagesSent
    });
  });
});

// Helper function to segment traffic based on user subscription context
function broadcastToChannel(channelName, dataObject) {
  const payload = JSON.stringify(dataObject);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN && client.channel === channelName) {
      client.send(payload);
    }
  });
}

// Start our combined architecture on port 3000
server.listen(3000, () => {
  console.log('Server running dynamically at http://localhost:3000');
});