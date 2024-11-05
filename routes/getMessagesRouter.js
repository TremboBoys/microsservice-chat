import express from "express";
import MessagesService from "../services/getMessages.js";

const getMessagesRouter = express.Router();

getMessagesRouter.get('/:nameUser', async (req, res) => {
    const name = req.params.nameUser;

    const messages = await MessagesService.getMessages(name);

    if (messages !== false) {
        res.json(messages);
    } else {
        res.status(400).send('Error in GET request to get messages');
    };
});

getMessagesRouter.post('/', async (req, res) => {
    const { sender, receiver, message, dateTime, read } = req.body;

    const createMessage = await MessagesService.storeMessage({sender, receiver, message, dateTime, read});
    
    if (createMessage) {
        res.sendStatus(201);
    } else {
        res.status(400).send('Error storing message in MongoDB');
    };
});

export default getMessagesRouter;