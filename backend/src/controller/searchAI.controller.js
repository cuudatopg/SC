import { generateEmbedding } from "../lib/embedding.js";
import { Song } from "../models/song.model.js";

const MOOD_EXPANSION_MAP = {
    angry: "angry, aggressive, dark, rock, metal, intense, high energy, frustration",
    disgust: "disgust, dark, heavy, alternative, moody, grunge, rebellion",
    fear: "fear, cinematic, suspense, eerie, dark ambient, tense, horror",
    happy: "happy, upbeat, pop, feel good, energetic, sunshine, optimistic, dance",
    sad: "sad, melancholic, acoustic, slow, lo-fi, piano, emotional, blue",
    surprise: "surprise, electronic, experimental, avant-garde, fast, upbeat, shock",
    neutral: "neutral, chill, ambient, lo-fi, study, calm, peaceful, dreamy",
};

export const searchAI = async (req, res) => {
    try {
        const { mood } = req.body; 
        
        if (!mood) {
            return res.status(400).json({ message: "Mood is required" });
        }

        const moodKey = mood.toLowerCase();
        
        // 1. LẤY CHUỖI TỪ KHÓA MỞ RỘNG CỐ ĐỊNH
        const expandedQuery = MOOD_EXPANSION_MAP[moodKey] || moodKey;

        // 2. TẠO VECTOR TỪ CHUỖI TỪ KHÓA
        const queryVector = await generateEmbedding({ title: expandedQuery });

        // 3. TRUY VẤN VECTOR SEARCH 
        // Lấy top 30 bài phù hợp nhất để làm "kho" xáo trộn
        const songs = await Song.aggregate([
            {
                $vectorSearch: {
                    index: "song_vector_index",
                    path: "embedding",
                    queryVector: queryVector,
                    numCandidates: 150, 
                    limit: 30 
                }
            },
            { 
                $project: { 
                    embedding: 0, 
                    score: { $meta: "vectorSearchScore" } 
                } 
            }
        ]);

        // 4. XÁO TRỘN DANH SÁCH KẾT QUẢ (SHUFFLE)
        // Trộn ngẫu nhiên 30 bài này và lấy ra 10 bài cuối cùng
        const randomizedSongs = songs
            .sort(() => Math.random() - 0.5)
            .slice(0, 10);

        res.status(200).json({ 
            success: true,
            detectedMood: mood,
            songs: randomizedSongs 
        });

    } catch (error) {
        console.error("AI Search Error:", error);
        res.status(500).json({ message: "Lỗi xử lý kết quả tìm kiếm AI" });
    }
};