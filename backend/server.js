
import express from 'express';
import cors from 'cors';
import { Configuration, OpenAIApi } from 'openai';

const app = express();
app.use(cors());
app.use(express.json());

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY, // Укажи ключ в переменной окружения
});
const openai = new OpenAIApi(configuration);

app.post('/api/generate-persona', async (req, res) => {
  try {
    const { geo, step } = req.body;

    const prompt = `
    Создай уникального персонажа для фарма аккаунтов с гео ${geo} и этапом ${step}.
    Укажи имя, возраст, пол, 5 интересов, 3 сайта для регистрации с Google, 3 рассылки для почты.
    Формат JSON: { "name": ..., "age": ..., "gender": ..., "interests": [...], "sites": [...], "newsletters": [...] }
    `;

    const completion = await openai.createChatCompletion({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 400,
    });

    const text = completion.data.choices[0].message.content.trim();

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      return res.status(500).json({ error: 'Ошибка парсинга JSON от OpenAI', raw: text });
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
