import { WebSocket, WebSocketServer } from "ws";

const ws = new WebSocketServer({ port: 8080 });
console.log("WebSocket server started on port 8080");

interface UserType {
  socket: WebSocket;
  roomId: number;
  name : string
}

let allSockets: UserType[] = [];

ws.on("connection", (socket) => {
  console.log("New connection established.");

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

        socket.send(
          JSON.stringify({
            type: "system",
            users : userCount,
            payload: `${name} joined the room.`,
          })
        );
      }

      if (parsedMessage.type === "chat") {
        const sender = allSockets.find((x) => x.socket === socket);

        if (sender) {
          const { message: chatMessage } = parsedMessage.payload;

          const outgoing = JSON.stringify({
            type: "chat",
            name: sender.name,
            message: chatMessage,
          });

          allSockets.forEach((user) => {
            if (user.roomId === sender.roomId) {
              user.socket.send(outgoing);
            }
          });

          

          console.log(`[${sender.roomId}] ${sender.name}: ${chatMessage}`);
        }
      }
    } catch (err) {
      console.error("Failed to handle message:", err);
    }
  });

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



  socket.on("error", (err) => {
    console.error("Socket error:", err);
  });
});
