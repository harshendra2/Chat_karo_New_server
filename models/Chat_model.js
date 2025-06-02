const mongoose = require("mongoose");

const ChatSchema = new mongoose.Schema({
  Sender:{
      type: mongoose.Schema.Types.ObjectId,
            ref: "user"
  },
  Reciever:{
  type: mongoose.Schema.Types.ObjectId,
        ref: "user"
  },
  Message:{
    type:String
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});


const Chat = mongoose.model("chat", ChatSchema);
module.exports =Chat;
