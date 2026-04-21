import { Album } from "../models/album.model.js";
import { Song } from "../models/song.model.js";

export const searchAll = async (req, res, next) => {
    try {
        const { q } = req.query;
        
        // Nếu không có từ khóa, trả về mảng rỗng
        if (!q) {
            return res.status(200).json({ albums: [], songs: [] });
        }

        const searchRegex = { $regex: q, $options: "i" };

        // Chạy song song để tối ưu hiệu suất
        const [albums, songs] = await Promise.all([
            Album.find({
                $or: [
                    { title: searchRegex },
                    { artist: searchRegex }
                ]
            }).limit(10),
            
            Song.find({
                $or: [
                    { title: searchRegex },
                    { artist: searchRegex },
                    { mood: searchRegex }
                ]
            }).limit(15)
        ]);

        res.status(200).json({ albums, songs });
    } catch (error) {
        next(error);
    }
};