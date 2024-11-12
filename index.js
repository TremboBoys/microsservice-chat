import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";
import { connectDB } from "./infra/connect.js";
import cors from "cors";
import MessagesServices from "./services/getMessages.js";
import getMessagesRouter from "./routes/getMessagesRouter.js";
import "dotenv/config";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: 'http://localhost:5173',
    }
});

const PORT = process.env.PORT || 3333;
connectDB();

app.use(cors({
    origin: 'http://localhost:5173'
}))
app.use(express.json());
app.use('/message', getMessagesRouter);


const usersActive = {};

io.on("connection", (socket) => {
    console.log(`Connect web-socket on port ${PORT} with id: ${socket.id}`);

    socket.on("saveUser", (nameUser) => {
        usersActive[nameUser] = socket.id;
        console.log(usersActive);
    });

    socket.on("sendMessage", async (userSender, userReceiver, msg) => {
        console.log(userSender, userReceiver, msg);
        const userId = usersActive[userReceiver];
        const dateTime = new Date();
        await MessagesServices.storeMessage({sender: userSender, receiver: userReceiver, message: msg, dateTime, read: false});
        socket.to(userId).emit("receiveMessage", userSender, userReceiver, msg, dateTime, false);
    });

    socket.on("notificationUpdateRead", (userReceiver, id) => {
        const userId = usersActive[userReceiver];

        if (userId !== undefined) {
            socket.to(userId).emit("updateRead", userReceiver, id);
        }
    })

    socket.on("disconnect", () => {
        const users = Object.entries(usersActive);

        for(let user of users) {
            if (user[1] === socket.id) {
                delete usersActive[user[0]];
                console.log(usersActive, `${user[0]} saiu`);
                break;
            }
        }
    });
});

httpServer.listen(PORT, () => {
    console.log(`Connect on http://localhost:${PORT}`);
});