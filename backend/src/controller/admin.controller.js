import { Song } from "../models/song.model.js";
import { Album } from "../models/album.model.js";
import cloudinary from "../lib/cloudinary.js";
import { generateEmbedding } from "../lib/embedding.js";

// helper function for cloudinary uploads
const uploadToCloudinary = async (file) => {
	try {
		const result = await cloudinary.uploader.upload(file.tempFilePath, {
			resource_type: "auto",
		});
		return result.secure_url;
	} catch (error) {
		console.log("Error in uploadToCloudinary", error);
		throw new Error("Error uploading to cloudinary");
	}
};

export const createSong = async (req, res) => {
    try {
        let { title, artist, description, mood, albumId, duration } = req.body;

        // 1. Kiểm tra file có tồn tại không
        if (!req.files || !req.files.audio || !req.files.image) {
            return res.status(400).json({ message: "Vui lòng upload đầy đủ file audio và image" });
        }

        // 2. Upload lên Cloudinary để lấy URL (vì model yêu cầu URL string)
        // Lưu ý: Nếu dùng express-fileupload thì là req.files.audio, không phải mảng [0]
        const audioUrl = await uploadToCloudinary(req.files.audio);
        const imageUrl = await uploadToCloudinary(req.files.image);

        if (typeof mood === "string") {
            mood = mood.split(",").map(m => m.trim());
        }

        const vector = await generateEmbedding({ title, artist, description, mood });

        const newSong = new Song({
            title,
            artist,
            description,
            mood,
            albumId: albumId || null,
            audioUrl, // Gán URL từ Cloudinary
            imageUrl, // Gán URL từ Cloudinary
            duration: Number(duration) || 0, // Đảm bảo là số
            embedding: vector || []
        });

        await newSong.save();

        // Cập nhật album nếu có
        if (albumId) {
            await Album.findByIdAndUpdate(albumId, {
                $push: { songs: newSong._id },
            });
        }

        return res.status(201).json(newSong);
    } catch (error) {
        console.error("Chi tiết lỗi tại Server:", error); // Log ra để bạn xem ở Terminal
        return res.status(500).json({ message: "Lỗi tạo bài hát", error: error.message });
    }
};

export const updateSong = async (req, res) => {
    try {
        const { id } = req.params;
        const oldSong = await Song.findById(id);
        const updateData = { ...req.body };

        if (req.body.title || req.body.artist || req.body.description || req.body.mood) {
            updateData.embedding = await generateEmbedding({
                title: req.body.title || oldSong.title,
                artist: req.body.artist || oldSong.artist,
                description: req.body.description || oldSong.description,
                mood: req.body.mood || oldSong.mood
            });
        }

        const updated = await Song.findByIdAndUpdate(id, updateData, { new: true });
        return res.status(200).json(updated);
    } catch (error) {
        return res.status(500).json({ message: "Lỗi cập nhật", error: error.message });
    }
};

export const deleteSong = async (req, res, next) => {
	try {
		const { id } = req.params;
		const song = await Song.findById(id);

		if (song.albumId) {
			await Album.findByIdAndUpdate(song.albumId, {
				$pull: { songs: song._id },
			});
		}

		await Song.findByIdAndDelete(id);
		res.status(200).json({ message: "Song deleted successfully" });
	} catch (error) {
		console.log("Error in deleteSong", error);
		next(error);
	}
};

export const createAlbum = async (req, res) => {
    try {
        const { title, artist, description } = req.body;
        const vector = await generateEmbedding({ title, artist, description }); // Không có mood

        const newAlbum = new Album({
            title, artist, description,
            imageUrl: req.file.path,
            embedding: vector || []
        });
        await newAlbum.save();
        return res.status(201).json(newAlbum);
    } catch (error) {
        return res.status(500).json({ message: "Lỗi tạo album", error: error.message });
    }
};

export const updateAlbum = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = { ...req.body };

        if (req.body.title || req.body.artist || req.body.description) {
            const oldAlbum = await Album.findById(id);
            updateData.embedding = await generateEmbedding({
                title: req.body.title || oldAlbum.title,
                artist: req.body.artist || oldAlbum.artist,
                description: req.body.description || oldAlbum.description
            });
        }

        const updatedAlbum = await Album.findByIdAndUpdate(id, updateData, { new: true });
        res.status(200).json(updatedAlbum);
    } catch (error) {
        res.status(500).json({ message: "Lỗi cập nhật album", error });
    }
};

export const deleteAlbum = async (req, res, next) => {
	try {
		const { id } = req.params;
		await Song.deleteMany({ albumId: id });
		await Album.findByIdAndDelete(id);
		res.status(200).json({ message: "Album deleted successfully" });
	} catch (error) {
		console.log("Error in deleteAlbum", error);
		next(error);
	}
};

export const checkAdmin = async (req, res, next) => {
	res.status(200).json({ admin: true });
};