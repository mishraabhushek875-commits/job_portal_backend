// Online users track karne ke liye
const onlineUsers = new Map();

export const initSocket = (io) => {

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    //Har user ka ek unique socket.id hota ha

    // ─── User apne room mein join kare ───
    socket.on('join', (userId) => {
      socket.join(userId);
      onlineUsers.set(userId, socket.id);
//Ye batata hai kaun online hai

      console.log(`User ${userId} joined their room`);
    });

    // ─── User disconnect hua ───
    socket.on('disconnect', () => {
      // Online users mein se hata do
      for (const [userId, socketId] of onlineUsers.entries()) {
        //Socket id match karo → user remove karo
        if (socketId === socket.id) {
          onlineUsers.delete(userId);
          console.log(`User ${userId} disconnected`);
          break;
        }
      }
    });
  });

  // io ko global banao taaki service use kar sake
  global.io = io;
};

// Specific user ko notification bhejo
export const sendNotification = (userId, data) => {
  if (global.io) {
    global.io.to(userId).emit('notification', data);
    console.log(`Notification sent to user: ${userId}`);
  }
};

/*

### Samjho — Har Cheez:
```
onlineUsers = Map()
  → Ek list jo track karti hai kaun online hai
  → { userId: socketId }
  → "Rahul" → "abc123"

socket.on('join', userId)
  → User connect hone ke baad apna room join karta hai
  → Room = userId se bana
  → Taaki sirf use notification mile

global.io
  → io ko globally available banaya
  → Taaki koi bhi service notification bhej sake

sendNotification(userId, data)
  → Kisi specific user ko notification bhejo
  → io.to(userId) → us user ke room mein jao
  → .emit('notification', data) → message bhejo
*/

