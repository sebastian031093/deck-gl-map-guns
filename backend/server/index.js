const express = require("express");
const WebSocket = require('ws');

const PORT = process.env.PORT || 3001;
const app = express();


// respond with "hello world" when a GET request is made to the homepage
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile('index.html', { root: 'public' });
})



app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});


const initialGeoData = './gundata.json'


const wss = new WebSocket.Server({ port: 8080 });

// Add error handling for WebSocket server
wss.on('error', (error) => {
  console.error('WebSocket Server Error:', error);
});

wss.on('listening', () => {
  console.log('WebSocket Server is listening on port 8080');
});

wss.on('connection', (ws) => {
  console.log(`New client connected on port ${8080}`);

  // Add error handling for individual connections
  ws.on('error', (error) => {
    console.error('Client connection error:', error);
  });

  // Send initial data
  ws.send(JSON.stringify(initialGeoData));

  // Simulate periodic updates
  const interval = setInterval(() => {
    const updates = generateGeoUpdates();
    ws.send(JSON.stringify(updates));
  }, 1000);

  ws.on('close', () => {
    console.log('Client disconnected');
    clearInterval(interval);
  });
});
