import mongoose from "mongoose";

const songSchema = new mongoose.Schema({
    title: {
        type: String,
        Required: true
    },
    artist: {
        type: String,
        Required: true
    },
    imageUrl: {
        type: String,
        Required: true
    },
    audioUrl: {
        type: String,
        Required: true
    },
    duration: {
        type: Number,
        required: true
    },
    albumId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: `Album`,
        required: false
    },
    mood: [
        {type: String, required: true}
    ],
    description: {
        type: String,
        requỉed: false
    }
}, {timestamps: true});

export const Song = mongoose.model("Song", songSchema);