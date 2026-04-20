import mongoose from "mongoose";

const moodSchema = new mongoose.Schema({
    mood: {
        type: String,
        required: true,
    }
}, {timestamps: true});

export const Mood = mongoose.model("Mood", moodSchema);