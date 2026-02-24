
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

// Endpoint 2: Find Vets
app.post('/api/find-vets', async (req, res) => {
    try {
        const { specialty, location } = req.body;

        if (!location || !location.lat || !location.lng) {
            return res.status(400).json({ error: "Location is required" });
        }

        // Request veterinarians with Google Maps grounding
        const prompt = `List 12 ${specialty === 'General' ? 'veterinary clinics' : specialty + ' veterinarian specialists'} near latitude ${location.lat}, longitude ${location.lng}. For each, provide: name, full address, phone number, and rating.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                tools: [{ googleMaps: {} }],
                responseModalities: ['TEXT'],
                toolConfig: {
                    retrievalConfig: {
                        latLng: {
                            latitude: location.lat,
                            longitude: location.lng
                        }
                    }
                }
            }
        });

        // Log the full response structure for debugging
        console.log("=== VET SEARCH DEBUG ===");
        console.log("Response Text:", response.text);
        console.log("Response Candidates:", JSON.stringify(response.candidates, null, 2));

        if (response.candidates?.[0]?.groundingMetadata) {
            console.log("Grounding Metadata:", JSON.stringify(response.candidates[0].groundingMetadata, null, 2));
        }

        res.json({
            text: response.text,
            candidates: response.candidates,
            groundingMetadata: response.candidates?.[0]?.groundingMetadata
        });

    } catch (error) {
        console.error("Vet Search Error:", error);
        res.status(500).json({ error: "Failed to find vets" });
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
