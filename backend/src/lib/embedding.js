import * as use from "@tensorflow-models/universal-sentence-encoder";
import "@tensorflow/tfjs";

let modelInstance = null;

const getModel = async () => {
    if (!modelInstance) {
        modelInstance = await use.load();
    }
    return modelInstance;
};

const normalize = (vec) => {
    const norm = Math.sqrt(vec.reduce((sum, x) => sum + x * x, 0));
    return norm === 0 ? vec : vec.map((x) => x / norm);
};

export const generateEmbedding = async (data) => {
    try {
        const { title, artist, description, mood } = data;
        let textParts = [];

        if (title) textParts.push(`Title: ${title}`);
        if (artist) textParts.push(`Artist: ${artist}`);
        if (description) textParts.push(`Description: ${description}`);
        
        // Xử lý nếu mood là mảng
        if (mood && Array.isArray(mood) && mood.length > 0) {
            textParts.push(`Moods: ${mood.join(", ")}`); // Nối mảng thành "Mood1, Mood2"
        } else if (mood) {
            textParts.push(`Mood: ${mood}`);
        }

        const text = textParts.join(" ").trim();
        if (!text) return null;

        const model = await getModel();
        const embeddings = await model.embed([text]);
        const array = await embeddings.array();
        
        embeddings.dispose(); // Giải phóng bộ nhớ
        return normalize(array[0]);
    } catch (err) {
        console.error("Embedding error:", err.message);
        return null;
    }
};