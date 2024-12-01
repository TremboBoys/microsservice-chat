import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";
import { connectDB } from "./infra/connect.js";
import cors from "cors";
import MessagesServices from "./services/getMessages.js";
import UploaderService from "./services/uploadImages.js";
import { getMessagesRouter, uploaderRouter } from "./routes/index.js";
import "dotenv/config";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: ['http://localhost:5173', 'https://1cc2-2804-30c-86b-6b00-48ab-8475-541f-cb8d.ngrok-free.app/'],
    }
});

const PORT = process.env.PORT || 3333;
connectDB();

app.use(cors({
    origin: 'http://localhost:5173'
}))
app.use(express.json());
app.use('/message', getMessagesRouter);
app.use('/image', uploaderRouter);


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
        const userSenderId = usersActive[userSender];
        console.log(userSenderId);
        const dateTime = new Date();
        const newMessage = await MessagesServices.storeMessage({sender: userSender, receiver: userReceiver, message: msg, dateTime, read: false});

        console.log('Começando emits');

        console.log(`Emissor: ${userSender} com ID: ${userSenderId}`);
        console.log(`Receptor: ${userReceiver} com ID: ${userId}`);


        socket.to(userId).emit("receiveMessage", newMessage._id, newMessage.sender, newMessage.receiver, newMessage.message, newMessage.dateTime, newMessage.read);

        socket.emit("saveMessage", newMessage._id, newMessage.sender, newMessage.receiver, newMessage.message, newMessage.dateTime, newMessage.read);

        console.log('Passou de saveMessage');
    });

    socket.on("uploadImage", async (userSender, userReceiver, file) => {
        const userId = usersActive[userReceiver];

        const image = await UploaderService.createImage(file, userSender, userReceiver);
        console.log('Socket: ', image);

        if (image !== false) {
            socket.to(userId).emit("receiveImage", userSender, userReceiver, image);
            socket.emit("receiveImage", userSender, userReceiver, image);
        }
    });

    socket.on("notificationDeleteMessage", async (userSender, userReceiver, idMessage,  type) => {
        const userId = usersActive[userReceiver];
        if (type == 'message') {
            await MessagesServices.deleteMessage(idMessage);
        } else {
            const deleteImage = await UploaderService.deleteImages(idMessage);
            console.log('Status delete: ', deleteImage);
        }
        socket.to(userId).emit("deleteMessage", userSender, idMessage);
    })

    socket.on("typing", (userSender, userReceiver) => {
        const userId = usersActive[userReceiver];
        socket.to(userId).emit("typing", (userSender));
    });

    socket.on("untyping",(userSender, userReceiver) => {
        const userId = usersActive[userReceiver];
        socket.to(userId).emit("untyping", (userSender));
    });

    socket.on("notificationUpdateRead", (userSender, userReceiver, id) => {
        const userId = usersActive[userReceiver];
        console.log(userSender);
        
        if (userId !== undefined) {
            socket.to(userId).emit("updateRead", userSender, id);
        }
    });

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