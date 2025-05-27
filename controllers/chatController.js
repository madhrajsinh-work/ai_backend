const Chat = require('../models/Chat');

exports.saveChatMessage = async (req, res) => {
  const userId = req.user.id;
  const { sender, text } = req.body;

  try {
    let chat = await Chat.findOne({ user: userId });

    if (!chat) {
      chat = new Chat({ user: userId, messages: [] });
    }

    chat.messages.push({ sender, text });
    await chat.save();

    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Failed to save message' });
  }
};

exports.getChatMessages = async (req, res) => {
  const userId = req.user.id;

  try {
    const chat = await Chat.findOne({ user: userId });

    if (!chat) return res.json({ messages: [] });

    res.json({ messages: chat.messages });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch chat history' });
  }
};
