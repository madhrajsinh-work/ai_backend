const Chat = require('../models/Chat');
const mongoose = require('mongoose');

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


exports.getAIMediatedConversations = async (req, res) => {
  const userId = req.user.id;

  try {
    const userIdObj = new mongoose.Types.ObjectId(userId);

    const conversations = await Chat.aggregate([
      { $unwind: "$messages" },
      {
        $match: {
          $or: [
            { "messages.senderUser": userIdObj }, 
            { user: userIdObj }                   
          ],
          "messages.isAIMediated": true
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "recipientInfo"
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "messages.senderUser",
          foreignField: "_id",
          as: "senderInfo"
        }
      },
      {
        $project: {
          message: "$messages.text",
          timestamp: "$messages.timestamp",
          sentByMe: { $eq: ["$messages.senderUser", userIdObj] },  
          otherUser: {
            $cond: [
              { $eq: ["$messages.senderUser", userIdObj] },  
              { $arrayElemAt: ["$recipientInfo", 0] },
              { $arrayElemAt: ["$senderInfo", 0] }
            ]
          },
          otherUserId: {
            $cond: [
              { $eq: ["$messages.senderUser", userIdObj] },  
              "$user",
              "$messages.senderUser"
            ]
          }
        }
      },
      { $sort: { timestamp: 1 } }
    ]);

    const groupedConversations = conversations.reduce((acc, curr) => {
      const otherUserId = curr.otherUserId.toString();

      if (!acc[otherUserId]) {
        acc[otherUserId] = {
          otherUser: curr.otherUser,
          messages: [],
          lastMessage: {
            text: curr.message,
            timestamp: curr.timestamp,
            sentByMe: curr.sentByMe
          }
        };
      }

      acc[otherUserId].messages.push({
        text: curr.message,
        timestamp: curr.timestamp,
        sentByMe: curr.sentByMe
      });

      if (new Date(curr.timestamp) > new Date(acc[otherUserId].lastMessage.timestamp)) {
        acc[otherUserId].lastMessage = {
          text: curr.message,
          timestamp: curr.timestamp,
          sentByMe: curr.sentByMe
        };
      }

      return acc;
    }, {});

    const result = Object.values(groupedConversations).map(conv => ({
      otherUser: conv.otherUser,
      lastMessage: conv.lastMessage,
      messages: conv.messages
    }));

    res.json({ conversations: result });
  } catch (err) {
    console.error('Conversations Error:', err);
    res.status(500).json({ 
      message: 'Failed to fetch conversations',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};