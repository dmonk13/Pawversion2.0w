const express = require('express');
const cors = require('cors');
const { GoogleGenAI } = require('@google/genai');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for your Vercel frontend
app.use(cors({
    origin: '*', // CHANGE THIS to your specific Vercel URL in production for security
    methods: ['POST', 'GET', 'OPTIONS']
}));

app.use(express.json());

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

        const prompt = `List 10 ${specialty === 'General' ? 'veterinary clinics' : specialty + ' veterinarians'} near the user.
        Return ONLY a JSON array. Do not include markdown formatting.
        JSON Schema: [{ "name": "string", "address": "string", "distance": "string", "rating": number, "phone": "string", "isOpen": boolean }]`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                tools: [{ googleMaps: {} }],
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

        res.json({ 
            text: response.text,
            candidates: response.candidates // Pass candidates for grounding metadata if needed
        });

    } catch (error) {
        console.error("Vet Search Error:", error);
        res.status(500).json({ error: "Failed to find vets" });
    }
});

app.get('/', (req, res) => {
    res.send('PawPal Backend is Running');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});