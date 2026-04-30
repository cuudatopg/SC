import { Song } from "../models/song.model.js";
import { Album } from "../models/album.model.js";
import { generateEmbedding } from "../lib/embedding.js";

export const searchAll = async (req, res, next) => {
    try {
        const { q } = req.query;
        if (!q) return res.status(200).json({ albums: [], songs: [] });

        const regex = new RegExp(q, "i");
        
        let queryVector = [];
        try {
            queryVector = await generateEmbedding({ title: q });
        } catch (embErr) {
            console.error("Embedding Error:", embErr);
        }

        const [vectorAlbums, regexAlbums, vectorSongs, regexSongs] = await Promise.all([
            // Vector Search Albums
            queryVector.length > 0 ? Album.aggregate([
                { $vectorSearch: { index: "album_vector_index", path: "embedding", queryVector, numCandidates: 50, limit: 10 } },
                { $project: { embedding: 0, score: { $meta: "vectorSearchScore" } } }
            ]) : [],
            
            // Regex Search Albums
            Album.find({ 
                $or: [{ title: regex }, { artist: regex }, { mood: regex }] 
            }).limit(10).select("-embedding").lean(),

            // Vector Search Songs
            queryVector.length > 0 ? Song.aggregate([
                { $vectorSearch: { index: "song_vector_index", path: "embedding", queryVector, numCandidates: 100, limit: 15 } },
                { $project: { embedding: 0, score: { $meta: "vectorSearchScore" } } }
            ]) : [],

            // Regex Search Songs
            Song.find({ 
                $or: [{ title: regex }, { artist: regex }, { mood: regex }] 
            }).limit(15).select("-embedding").lean()
        ]);

        const mergeAndPrioritize = (vectorArr = [], regexArr = []) => {
            const map = new Map();
            
            // 1. Đưa kết quả Regex vào trước
            if (Array.isArray(regexArr)) {
                regexArr.forEach(item => {
                    map.set(item._id.toString(), { ...item, searchType: 'exact' });
                });
            }

            // 2. Đưa kết quả Vector vào nếu chưa tồn tại
            if (Array.isArray(vectorArr)) {
                vectorArr.forEach(item => {
                    if (!map.has(item._id.toString())) {
                        map.set(item._id.toString(), { ...item, searchType: 'ai' });
                    }
                });
            }

            // 3. Chuyển Map thành mảng và sắp xếp: 'exact' lên trước 'ai'
            return Array.from(map.values()).sort((a, b) => {
                if (a.searchType === 'exact' && b.searchType === 'ai') return -1;
                if (a.searchType === 'ai' && b.searchType === 'exact') return 1;
                return 0;
            });
        };

        return res.status(200).json({ 
            albums: mergeAndPrioritize(vectorAlbums, regexAlbums), 
            songs: mergeAndPrioritize(vectorSongs, regexSongs) 
        });

    } catch (error) {
        console.error("Search Logic Error:", error);
        res.status(500).json({ albums: [], songs: [], error: error.message });
    }
};