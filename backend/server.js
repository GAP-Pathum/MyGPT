const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

const {
  GoogleGenerativeAI,
} = require('@google/generative-ai');

// Initialize the Google Generative AI SDK with API key
const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: 'gemini-1.5-flash',
});

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 8192,
  responseMimeType: 'text/plain',
};

const app = express();
app.use(cors());
app.use(express.json());

app.post('/generate-response', async (req, res) => {
  const { prompt } = req.body;

  try {
    const chatSession = model.startChat({
      generationConfig,
      history: [],
    });

    const result = await chatSession.sendMessage(prompt);
    
    console.log('Generated Response:', result.response.text());

    res.json({ generatedText: result.response.text() });
  } catch (err) {
    console.error('Error generating response:', err);

    if (err.response) {
      const { status, data } = err.response;
      console.error('API Error:', status, data);
      res.status(status).send(data);
    } else if (err.request) {
      // Client network error
      console.error('Network Error:', err.message);
      res.status(500).send({ message: 'Network Error' });
    } else {
      // Other error
      console.error('Unexpected Error:', err.message);
      res.status(500).send({ message: 'Internal Server Error' });
    }
  }
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
