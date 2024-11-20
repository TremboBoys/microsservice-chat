import mongoose from "mongoose";
// import grid from 'gridfs-stream';
import "dotenv/config";

const URI = process.env.MONGODB_URL;
const clientOptions = { serverApi: { version: '1', strict: true, deprecationErrors: true } };

export async function connectDB () {
    try {
        await mongoose.connect(URI, clientOptions);
        mongoose.connection.useDb('chat');
        console.log('Conectado ao mongodb');
    }
    catch (error) {
        console.error("Erro ao conectar ao mongodb  ", error);
    };
};

// let gfs;
// const connection = mongoose.connection;
// connection.once('open', () => {
//     gfs =  grid(connection.db, mongoose.mongo);
//     gfs.collection('uploads');
// });

// export default gfs;