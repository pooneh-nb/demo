const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const base64url = require('base64url');
const crypto = require('crypto');
const app = express();
const PORT = 3000;

// Allow CORS from http://localhost:8000
app.use(cors({
    origin: 'http://localhost:8000'
}));
app.use(express.static('public'))
app.use(bodyParser.json());

let userDatabase = {}; // In-memory user storage

// Helper function to generate random challenge
// const generateChallenge = () => {
//     return base64url(Buffer.from(new Uint8Array(32).map(() => Math.floor(Math.random() * 256))));
// };

// Registration request endpoint
app.post('/register', (req, res) => {
    try{
        const { username } = req.body;
        const user = {
            id:  base64url(crypto.randomBytes(16)),
            name: username,
            displayName: username
        };

        userDatabase[username] = user;

        // generate challenge
        const challenge = base64url(crypto.randomBytes(64));

        const publicKeyCredentialCreationOptions = {
            challenge: challenge,
            rp: { name: 'Example Corp' },
            user: {
                id: user.id,
                name: user.name,
                displayName: user.displayName,
            },
            pubKeyCredParams: [{alg: -7, type: "public-key"}]
        };

        res.json(publicKeyCredentialCreationOptions);
    } catch (error) {
        console.error("Error in /register:", error);
        res.status(500).json({ error: "Registration failed" });
    }
    
});

// Registration response endpoint
app.post('/registerResponse', (req, res) => {
    try {
        const { id, rawId, response, type } = req.body;
        // Here you should validate and store the user's credential
        if (!userDatabase[id]) {
            throw new Error("User not found");
        }
        userDatabase[id].credential = req.body;
        res.json({ status: 'ok' });
    } catch (error) {
        console.error("Error in /registerResponse:", error);
        res.status(500).json({ error: "Credential storage failed" });
    }
});

app.listen(3000, () => {
    console.log(`Server running on port 3000`);
});