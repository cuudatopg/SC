import { Song } from "../models/song.model.js";
import { Album } from "../models/album.model.js";
import { generateEmbedding } from "../lib/embedding.js";

export const searchAll = async (req, res, next) => {
    try {
        const { q } = req.query;
        if (!q) return res.status(200).json({ albums: [], songs: [] });

        const queryVector = await generateEmbedding({ title: q }); // Tạo vector từ từ khóa search

        const [albums, songs] = await Promise.all([
            Album.aggregate([
                {
                    $vectorSearch: {
                        index: "vector_index",
                        path: "embedding",
                        queryVector: queryVector,
                        numCandidates: 100,
                        limit: 10
                    }
                },
                { $project: { embedding: 0, score: { $meta: "vectorSearchScore" } } }
                
            ]),
            Song.aggregate([
                {
                    $vectorSearch: {
                        index: "vector_index",
                        path: "embedding",
                        queryVector: queryVector,
                        numCandidates: 150,
                        limit: 15
                    }
                },
                { $project: { embedding: 0, score: { $meta: "vectorSearchScore" } } }
            ])
        ]);
        console.log("Kết quả tìm kiếm và điểm số:");
        songs.forEach(s => console.log(`${s.title} - Score: ${s.score}`));
        return res.status(200).json({ albums, songs });
    } catch (error) {
        next(error);
    }
};