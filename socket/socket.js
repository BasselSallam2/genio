import { Server } from "socket.io";
import axios from "axios";
import qs from "querystring";


const url = 'https://apichat.genio.ae/chat/';
const headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/x-www-form-urlencoded'
};



export function initializeSocket(server) {
  console.log("🟢 Initializing WebSocket Server...");

  const io = new Server(server, {
    cors: {
      origin: "*", // ✅ Allow all origins (Change in production)
      methods: ["GET", "POST"],
    },
    transports: ["websocket", "polling"], // ✅ Use WebSocket + Polling fallback
  });

  io.on("connection", (socket) => {
    socket.on("userMessage", async (messagee , userid) => {
        try {
            const data = qs.stringify({
                user_id: userid,
                query: messagee
            });

            const response = await axios.post(url, data, { headers });
            const answer = response.data.response;
            
            socket.emit("aiMessage" , answer) ;

        } catch (error) {
            console.error('Error:', error.response ? error.response.data : error.message);
        }
    });
});


  return io;
}
