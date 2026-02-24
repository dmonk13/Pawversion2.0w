
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

// Endpoint 2: Find Vets using Google Places API
app.post('/api/find-vets', async (req, res) => {
    try {
        const { specialty, location } = req.body;

        if (!location || !location.lat || !location.lng) {
            return res.status(400).json({ error: "Location is required" });
        }

        const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_MAPS_API_KEY || process.env.API_KEY;

        if (!GOOGLE_PLACES_API_KEY) {
            console.error("Google Maps API key not configured");
            return res.status(500).json({ error: "API key not configured" });
        }

        // Determine search query based on specialty
        const searchQuery = specialty === 'General'
            ? 'veterinarian'
            : `${specialty} veterinarian`;

        // Use Google Places API Nearby Search
        const placesUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location.lat},${location.lng}&radius=5000&type=veterinary_care&keyword=${encodeURIComponent(searchQuery)}&key=${GOOGLE_PLACES_API_KEY}`;

        console.log("Fetching from Google Places API...");
        const placesResponse = await fetch(placesUrl);
        const placesData = await placesResponse.json();

        console.log("Google Places API Status:", placesData.status);
        console.log("Results count:", placesData.results?.length || 0);

        if (placesData.status !== 'OK' && placesData.status !== 'ZERO_RESULTS') {
            console.error("Google Places API Error:", placesData.status, placesData.error_message);
            return res.status(500).json({
                error: "Failed to fetch from Google Places API",
                details: placesData.error_message
            });
        }

        // Transform results to our format
        const vets = (placesData.results || []).slice(0, 12).map(place => ({
            name: place.name,
            address: place.vicinity,
            rating: place.rating || 4.5,
            specialty: specialty,
            uri: `https://www.google.com/maps/place/?q=place_id:${place.place_id}`,
            distance: 'Nearby',
            isOpen: place.opening_hours?.open_now ?? true,
            placeId: place.place_id
        }));

        console.log("Returning", vets.length, "veterinarians");

        res.json({ vets });

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
