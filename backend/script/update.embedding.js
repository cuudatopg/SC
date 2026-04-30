import mongoose from "mongoose";
import dotenv from "dotenv";
import { Song } from "../src/models/song.model.js";
import { Album } from "../src/models/album.model.js";
import { generateEmbedding } from "../src/lib/embedding.js";

dotenv.config();

const migrate = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("✅ Đã kết nối DB.");

        // Cập nhật Songs
        const songs = await Song.find({});
        console.log(`🔄 Đang xử lý ${songs.length} bài hát...`);
        for (const song of songs) {
            const vector = await generateEmbedding({
                title: song.title,
                artist: song.artist,
                description: song.description,
                mood: song.mood
            });
            await Song.findByIdAndUpdate(song._id, { embedding: vector });
        }

        // Cập nhật Albums
        const albums = await Album.find({});
        console.log(`🔄 Đang xử lý ${albums.length} album...`);
        for (const album of albums) {
            const vector = await generateEmbedding({
                title: album.title,
                artist: album.artist,
                description: album.description
            });
            await Album.findByIdAndUpdate(album._id, { embedding: vector });
        }

        console.log("✨ Hoàn thành Migration!");
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

migrate();