import { v2 as cloudinary } from "cloudinary";
import uuid4 from "uuid4";
import "dotenv/config";

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
});

class UploaderService {
    async createImage(file, userSender, userReceiver) {
        const id = uuid4();
        return new Promise((resolve, reject) => {
            const uploader = cloudinary.uploader.upload_stream({
                public_id: id,
                context: {
                    user_sender: userSender,
                    user_receiver: userReceiver,
                    read: 'false'
                },
                type: 'upload'
            },
            (error, result) => {
                if (error) {
                    console.error('Error in POST image in cloudinary', error);
                    return reject(error);
                }
                console.log('Upload sucessful: ', result);
                resolve(result);
            })

            uploader.end(file);
    })
}

async getImages(nameUser) {
    try {
        console.log(nameUser);
        const response = await cloudinary.api.resources({
            type: 'upload', // Tipo de recurso (upload, fetch, etc.)
            context: true, // Incluir contexto/ metadados
            tags: true, // Incluir tags, se houver
        });

        const images = response.resources.filter((image) => {
            return image.context.custom.user_sender === nameUser || image.context.custom.user_receiver === nameUser
        });
  
      return images;
    } catch (error) {
      console.error('Error in GET images: ', error);
      return false;
    };
  };

  async updateMetadatas(publicId, userSender, userReceiver) {
    try {
        const response = cloudinary.uploader.explicit(publicId, {
            type: 'upload',
            context: {
                user_sender: userSender,
                user_receiver: userReceiver,
                read: 'true'
            }
        });

        console.log('Update metadatas: ', response);
        return true;
    } catch(error) {
        console.error('Error in PUT update metadatas: ', error);
        return false;
    };
  };

  async deleteImages(publicId) {
    try {
        await cloudinary.uploader.destroy(publicId);
        return true;
    } catch(error) {
        console.error('Error in DELETE image: ', error);
        return false;
    }
  }
};

export default new UploaderService();