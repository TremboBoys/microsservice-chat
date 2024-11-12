// import gfs from "../infra/connect";
// import multer from "multer";
// import { GridFsStorage } from "multer-gridfs-storage";
import { MessagesModel } from "../infra/models.js";
import "dotenv/config";

class MessagesService {
    async getMessages(nameUser) {
        try {
            const messages = await MessagesModel.find({
                $or: [
                    { sender: nameUser },
                    { receiver: nameUser },
                ]
            });
            console.log(messages);
            return messages;
        } catch(error) {
            console.error('Error when querying the message: ', error);
            return false;
        }
    };

    async storeMessage(infos) {
        const { sender, receiver, message, dateTime, read } = infos;

        try {
            await MessagesModel.create({sender, receiver, message, dateTime, read});
            console.log('Stored message with successfully!');
            return true;
        } catch(error) {
            console.error('Error storing message: ', error);
            return false;
        };
    };

    async updateMessage(id, infosUpdate) {
        try {
            const updateMessage = await MessagesModel.findByIdAndUpdate(
                id,
                infosUpdate,
                { new: true }
            );
            return updateMessage;
        } catch(error) {
            console.error('Error in PATCH message: ', error);
            return false;
        }
    }
};

export default new MessagesService();

// const mongoURI = process.env.MONGODB_URL
// const storage = new GridFsStorage({
//     url: mongoURI,
//     file: (req, file) => {
//         return new Promise((resolve, reject) => {
//           const filename = file.originalname;
//           const fileInfo = {
//             filename: filename,
//             dateTime: Date.now(),
//             bucketName: 'uploads',
//           };
//           resolve(fileInfo);
//         });
//       },
// });

// const upload = multer({ storage });

// const getFiles = async (filename) => {
//     return new Promise((resolve, reject) => {
//         gfs.files.find
//     })
// }