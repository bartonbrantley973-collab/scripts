const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();

// Enable CORS so Roblox HTTP requests are allowed
app.use(cors());

// Parse incoming JSON requests up to 50MB for large builds
app.use(bodyParser.json({ limit: '50mb' }));

// In-memory data store for build state and update queues
let globalBuilds = [];
let pendingSyncs = [];

// Endpoint to receive part creations, updates, or full saves from clients
app.post('/api/build', (req, res) => {
    const { action, partData } = req.body;
    
    if (action === "create") {
        globalBuilds.push(partData);
        pendingSyncs.push(partData);
    } else if (action === "save") {
        globalBuilds = partData;
    }
    
    res.status(200).json({ success: true });
});

// Endpoint for active clients to poll for new queued updates
app.get('/api/sync', (req, res) => {
    res.status(200).json({ updates: pendingSyncs });
    pendingSyncs = []; // Clear queue after fetching
});

// Endpoint to load the complete saved build state on join
app.get('/api/load', (req, res) => {
    res.status(200).json({ builds: globalBuilds });
});

// Start listening on Render's assigned port or default port 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`F3X Relay Server running on port ${PORT}`);
});