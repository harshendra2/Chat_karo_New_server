const {} = require('../controllers/Video_controller');

const activeCalls = {};
const userSockets = {};

const VideoSocket = (io) => {
  io.on("connection", (socket) => {
 
     socket.on('register', (userId) => {
    userSockets[userId] = socket.id;
  });

  socket.on('initiate-call', ({ callerId, receiverId }) => {
    const receiverSocketId = userSockets[receiverId];
    if (!receiverSocketId) {
      socket.emit('call-error', 'User not available');
      return;
    }
    const callId = `${callerId}-${receiverId}-${Date.now()}`;
    activeCalls[callId] = { callerId, receiverId };
    io.to(receiverSocketId).emit('incoming-call', {
      callId,
      callerId
    });

    socket.emit('call-initiated', { callId });
  });


  socket.on('accept-call', ({ callId }) => {
    const call = activeCalls[callId];
    if (!call) {
      socket.emit('call-error', 'Invalid call ID');
      return;
    }

    io.to(userSockets[call.callerId]).emit('call-accepted', { callId });
    io.to(userSockets[call.receiverId]).emit('call-accepted', { callId });
  });


  socket.on('reject-call', ({ callId }) => {
    const call = activeCalls[callId];
    if (call) {
      io.to(userSockets[call.callerId]).emit('call-rejected');
      delete activeCalls[callId];
    }
  });


  socket.on('webrtc-signal', ({ callId, signal, targetId }) => {
    const targetSocket = userSockets[targetId];
    if (targetSocket) {
      io.to(targetSocket).emit('webrtc-signal', { 
        signal, 
        senderId: Object.keys(userSockets).find(
          key => userSockets[key] === socket.id
        )
      });
    }
  });


  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    const userId = Object.keys(userSockets).find(
      key => userSockets[key] === socket.id
    );
    if (userId) delete userSockets[userId];
  });


  });
};

module.exports = VideoSocket;
