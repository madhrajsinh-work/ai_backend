const OpenAI = require('openai');

const openai = new OpenAI({
  baseURL: 'https://models.github.ai/inference',
  apiKey: process.env.GITHUB_TOKEN,
});

exports.askGpt4o = async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) return res.status(400).json({ message: 'Prompt is required' });

  try {
    const response = await openai.chat.completions.create({
      messages: [
        { role: 'system', content: '' },
        { role: 'user', content: prompt }
      ],
      model: 'openai/gpt-4.1',
      temperature: 1,
      max_tokens: 4096,
      top_p: 1
    });

    const answer = response.choices[0].message.content;
    res.json({ answer });
  } catch (error) {
    console.error('GPT-4o Error:', error);
    res.status(500).json({ message: 'Failed to get response from GPT-4o' });
  }
};
