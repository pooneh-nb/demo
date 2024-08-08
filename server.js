const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const base64url = require('base64url');
const app = express();
const PORT = 3000;

// Allow CORS from http://localhost:8000
app.use(cors({
    origin: 'http://localhost:8000'
}));
app.use(express.static('public'))
app.use(bodyParser.json());

let users = {}; // In-memory user storage

// Helper function to generate random challenge
const generateChallenge = () => {
    return base64url(Buffer.from(new Uint8Array(32).map(() => Math.floor(Math.random() * 256))));
};

// Registration request endpoint
app.post('/register', (req, res) => {
    const username = req.body.username;
    console.log(username);
    const userId = Uint8Array.from(username, c => c.charCodeAt(0));

    if (users[username]) {
        return res.status(400).json({ message: 'User already exists' });
    }

    const challenge = generateChallenge();
    // console.log("Generated Challenge:", challenge);
    users[username] = { id: userId, challenge: challenge };

    const publicKeyCredentialCreationOptions = {
        challenge: Uint8Array.from("testchallenge", c => c.charCodeAt(0)),
        rp: { name: 'Example Corp' },
        user: {
            id: userId,
            name: username,
            displayName: username
        },
        pubKeyCredParams: [{alg: -7, type: "public-key"}],
        attestation: 'direct'
    };

    res.json(publicKeyCredentialCreationOptions);
});

// Registration response endpoint
app.post('/registerResponse', (req, res) => {
    const username = req.body.username;
    const clientDataJSON = base64url.decode(req.body.response.clientDataJSON);
    const clientData = JSON.parse(clientDataJSON);

    if (clientData.challenge !== users[username].challenge) {
        return res.status(400).json({ message: 'Invalid challenge' });
    }

    users[username].credential = req.body;

    res.json({ message: 'Registration successful' });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
