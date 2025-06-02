const { getAllUser, OffLine, SetOnline,getAllMessag,AddNewMessage } = require('../controllers/Chat_controller');

const chatSocket = (io) => {
  io.on("connection", (socket) => {
 const userId = socket.handshake.query.userId;
  if (userId) socket.join(userId);

    socket.on('getallUser', async (userId) => {
      try {
        const users = await getAllUser(userId);
        socket.emit('user', users);
      } catch (err) {
        socket.emit('error', 'Failed to get user list');
      }
    });

    socket.on("getAllMessage",async(sender,reciever)=>{
     
      try{
     const message = await getAllMessag(sender,reciever);
        socket.emit('Message', message);
      }catch(error){
          socket.emit('error', 'Failed to get user list');
      }
    })

    socket.on("addnewMsg",async(data)=>{
      const insert=await AddNewMessage(data)
     io.to(data.Sender).to(data.Reciever).emit("added", insert);
    })

    socket.on('online', async (userId) => {
      try {
        await SetOnline(userId);
      } catch (err) {
        console.log("Online update failed", err);
      }
    });

    socket.on('offline', async (userId) => {
      try {
        await OffLine(userId);
      } catch (err) {
        console.log("Offline update failed", err);
      }
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });
};

module.exports = chatSocket;
