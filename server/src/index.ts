import { WebSocket,WebSocketServer } from "ws";

const wss  = new WebSocketServer({ port : 8080})

interface UserType {
  socket: WebSocket;
  roomId: number;
  name : string
}

let allSockets: UserType[] = [];


wss.on("connection",function(socket){
  console.log("New client connected");

  socket.send(JSON.stringify({
    type: "system-connect",
    message: "client connected============",
  }));

  socket.on("message", (message) => {
    try {
    const parsedMessage = JSON.parse(message.toString());

    if (parsedMessage.type === "join") {
      const { roomId, name } = parsedMessage.payload;

      allSockets.push({ socket,roomId,name });
      console.log(`User '${name}' joined room ${roomId}`);
      
      const usersInRoom = allSockets.filter(user => user.roomId === roomId);
      const userCount = usersInRoom.length;

      const roomUpdate = JSON.stringify({
        type: "system",
        users: userCount,
      });

      usersInRoom.forEach(user => user.socket.send(roomUpdate));

    }

    if (parsedMessage.type === "chat") {
      const sender = allSockets.find((x) => x.socket === socket);

      if (sender) {
        const { message : string } = parsedMessage.payload;

        const outgoing = JSON.stringify({
          type: "chat",
          name: sender.name,
          message : String,
        });

        allSockets.forEach((user) => {
          if (user.roomId === sender.roomId) {
            user.socket.send(outgoing);
          }
        });

        

        console.log(`[${sender.roomId}] ${sender.name}: ${message}`);
      }
    }
  } catch (err) {
    console.error("Failed to handle message:", err);
  }

  socket.on("close", () => {
    const sender = allSockets.find((x) => x.socket === socket);
    allSockets = allSockets.filter((user) => user.socket !== socket);
    const usersInRoom = allSockets.filter(user => user.roomId === sender?.roomId);
        const userCount = usersInRoom.length;

    const roomUpdate = JSON.stringify({
      type: "system",
      users: userCount,
    });

    usersInRoom.forEach(user => user.socket.send(roomUpdate));

    console.log("User disconnected");
  });

  })  

  socket.on("error", (err) => {
    console.error("Socket error:", err);
  });

})