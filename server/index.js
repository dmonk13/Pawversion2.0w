
const express = require('express');
const cors = require('cors');
const { GoogleGenAI } = require('@google/genai');
require('dotenv').config();

const { initializeDatabase } = require('./database');
const { register, login, verifyToken } = require('./auth');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for your Vercel frontend
app.use(cors({
    origin: '*', // CHANGE THIS to your specific Vercel URL in production for security
    methods: ['POST', 'GET', 'OPTIONS']
}));

app.use(express.json({ limit: '10mb' })); // Increased limit for images

// Initialize Google GenAI
// Ensure API_KEY is set in your Render Environment Variables
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Endpoint 1: AI Advisor Chat
app.post('/api/chat', async (req, res) => {
    try {
        const { messages, pets } = req.body;

        const systemInstruction = `You are PawPal AI, a veteran veterinarian and pet behavioral expert. 
        You have access to the user's pets: ${pets.map(p => `${p.name} (${p.breed}, ${p.age}yrs)`).join(', ')}.
        Keep responses concise, warm, and professional. Always use the pet names when relevant. 
        If a medical emergency is implied, urgently advise visiting a real vet.`;

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: messages.map(m => ({
                role: m.role,
                parts: [{ text: m.content }]
            })),
            config: { systemInstruction, temperature: 0.8 }
        });

        res.json({ text: response.text });
    } catch (error) {
        console.error("Chat Error:", error);
        res.status(500).json({ error: "Failed to generate response" });
    }
});

// Endpoint 2: Find Vets using Gemini with structured output
app.post('/api/find-vets', async (req, res) => {
    try {
        const { specialty, location } = req.body;

        if (!location || !location.lat || !location.lng) {
            return res.status(400).json({ error: "Location is required" });
        }

        const searchTerm = specialty === 'General'
            ? 'veterinary clinics'
            : `${specialty} veterinarian specialists`;

        const prompt = `Find 12 ${searchTerm} near latitude ${location.lat}, longitude ${location.lng}.

Return a JSON array with exactly this format (no markdown, just raw JSON):
[
  {
    "name": "Clinic Name",
    "address": "Full street address",
    "rating": 4.5,
    "phone": "phone number if available",
    "isOpen": true
  }
]

Return ONLY the JSON array, no other text.`;

        console.log("Requesting vets from Gemini with location:", location);

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                temperature: 0.3,
                responseMimeType: 'application/json'
            }
        });

        let responseText = response.text.trim();
        console.log("Raw response:", responseText.substring(0, 200));

        // Clean up response
        responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

        let vetsArray = [];
        try {
            vetsArray = JSON.parse(responseText);
        } catch (parseError) {
            console.error("JSON parse error:", parseError);
            console.error("Attempted to parse:", responseText);
            return res.status(500).json({
                error: "Failed to parse AI response",
                details: "The AI did not return valid JSON"
            });
        }

        if (!Array.isArray(vetsArray)) {
            console.error("Response is not an array:", vetsArray);
            return res.status(500).json({
                error: "Invalid response format",
                details: "Expected an array of veterinarians"
            });
        }

        // Transform to our format
        const vets = vetsArray.slice(0, 12).map((vet, index) => ({
            name: vet.name || `Veterinary Clinic ${index + 1}`,
            address: vet.address || 'Address not available',
            rating: vet.rating || 4.5,
            specialty: specialty,
            uri: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(vet.name + ' ' + vet.address)}`,
            distance: 'Nearby',
            isOpen: vet.isOpen ?? true,
            phone: vet.phone
        }));

        console.log("Returning", vets.length, "veterinarians");

        res.json({ vets });

    } catch (error) {
        console.error("Vet Search Error:", error);
        res.status(500).json({
            error: "Failed to find vets",
            details: error.message
        });
    }
});

// --- BREED IDENTIFICATION ENDPOINT START ---
// Endpoint 3: Identify Breed
app.post('/api/identify-breed', async (req, res) => {
    try {
        const { image } = req.body; // Expecting base64 string

        if (!image) {
            return res.status(400).json({ error: "Image is required" });
        }

        // Clean base64 string (remove header)
        const base64Data = image.split(',')[1] || image;

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: [
                {
                    role: 'user',
                    parts: [
                        {
                            inlineData: {
                                mimeType: 'image/jpeg',
                                data: base64Data
                            }
                        },
                        { text: "Identify the dog breed in this image. Provide the breed name and 3 short bullet points about their typical personality traits. If it's not a dog, strictly say 'This doesn't look like a dog'." }
                    ]
                }
            ]
        });

        res.json({ text: response.text });

    } catch (error) {
        console.error("Breed ID Error:", error);
        res.status(500).json({ error: "Failed to identify breed" });
    }
});
// --- BREED IDENTIFICATION ENDPOINT END ---

app.post('/api/auth/register', register);

app.post('/api/auth/login', login);

app.get('/api/auth/verify', verifyToken, (req, res) => {
    res.json({ valid: true, user: req.user });
});

app.get('/', (req, res) => {
    res.send('PawPal Backend is Running');
});

const startServer = async () => {
    try {
        await initializeDatabase();
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
            console.log('Database connected and initialized');
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();
