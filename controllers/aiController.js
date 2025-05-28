const OpenAI = require('openai');
const User = require('../models/User');
const Chat = require('../models/Chat');

const openai = new OpenAI({
  baseURL: 'https://models.github.ai/inference',
  apiKey: process.env.GITHUB_TOKEN,
});

exports.askGpt4o = async (req, res) => {
  const { prompt } = req.body;
  const senderId = req.user.id;

  if (!prompt) return res.status(400).json({ message: 'Prompt is required' });

  try {
    const gujaratiRegex = /([\w\d.@+]+|\+91\d{10})\s*ko\s*["']?(.*?)["']?\s*message\s*bhej\s*de/i;

    const englishRegex = /send\s+["']?(.*?)["']?\s*message\s*to\s+([\w\d.@+]+|\+91\d{10})/i;

    let recipientQuery, messageText;

    if (gujaratiRegex.test(prompt)) {
      const match = prompt.match(gujaratiRegex);
      recipientQuery = match[1];
      messageText = match[2];
    } else if (englishRegex.test(prompt)) {
      const match = prompt.match(englishRegex);
      messageText = match[1];
      recipientQuery = match[2];
    }

    if (recipientQuery && messageText) {
      const recipient = await User.findOne({
        $or: [
          { username: recipientQuery },
          { phone: recipientQuery }
        ]
      });

      const sender = await User.findById(senderId);

      if (recipient) {
        // Save message to recipient's chat
        let chat = await Chat.findOne({ user: recipient._id });
        if (!chat) {
          chat = new Chat({ user: recipient._id, messages: [] });
        }

        const personalizedMsg = `${sender.username} says: ${messageText}`;
        chat.messages.push({ sender: 'user', text: personalizedMsg });
        await chat.save();

        return res.json({
          answer: `✅ Message successfully sent to ${recipient.username}.`,
        });
      } else {
        return res.json({
          answer: `❌ User '${recipientQuery}' not found.`,
        });
      }
    }

    // Otherwise call GPT-4o as fallback
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
