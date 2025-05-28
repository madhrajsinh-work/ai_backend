const mongoose = require('mongoose');

// const chatSchema = new mongoose.Schema({
//   user: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true
//   },
//   messages: [
//     {
//       sender: {
//         type: String,
//         enum: ['user', 'bot'],
//         required: true
//       },
//       text: {
//         type: String,
//         required: true
//       },
//       timestamp: {
//         type: Date,
//         default: Date.now
//       }
//     }
//   ]
// });

const chatSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  messages: [
    {
      sender: {
        type: String,
        enum: ['user', 'bot', 'other_user'],
        required: true
      },
      text: {
        type: String,
        required: true
      },
      timestamp: {
        type: Date,
        default: Date.now
      },
      // Add these new fields for user-to-user messages
      senderUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      isAIMediated: {
        type: Boolean,
        default: false
      }
    }
  ]
});

module.exports = mongoose.model('Chat', chatSchema);


