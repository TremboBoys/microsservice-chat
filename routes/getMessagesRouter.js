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

getMessagesRouter.patch('/:idMessage', async (req, res) => {
    const id = req.params.idMessage;
    const update = req.body;

    const updateMessage = await MessagesService.updateMessage(id, update);

    if (updateMessage) {
        res.status(200).send({updateMessage});
    } else {
        res.status(400).send('Error update message in MongoDB');
    };
});

getMessagesRouter.delete('/:idMessage', async (req, res) => {
    const idMessage = req.params.idMessage;

    const deleteMessage = await MessagesService.deleteMessage(idMessage);

    if (deleteMessage) {
        res.sendStatus(200);
    } else {
        res.status(400).send('Error deleting message in MongoDB');
    };
});

export default getMessagesRouter;