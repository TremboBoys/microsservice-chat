import express from "express";
import UploaderService from "../services/uploadImages.js";

const uploadeRouter = express.Router();

uploadeRouter.get('/:nameUser', async (req, res) => {
    const name = req.params.nameUser;

    const images = await UploaderService.getImages(name);

    if (images !== false) {
        res.json(images);
    } else {
        res.status(400).send('Error in GET images in cloudinary');
    };
});

uploadeRouter.put('/:publicId', async (req, res) => {
    const publicId = req.params.publicId;
    const users = req.body;

    const imageUpdate = await UploaderService.updateMetadatas(publicId, users.userSender, users.userReceiver);

    if (imageUpdate) {
        res.sendStatus(200);
    } else {
        res.status(400).send('Error in PATCH update metadatas of image with public_id: ', publicId);
    }
})

export default uploadeRouter;