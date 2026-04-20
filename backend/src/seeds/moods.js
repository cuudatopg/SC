import mongoose from "mongoose";
import { config } from "dotenv";
import { Mood } from "../models/mood.model";

config();

const moods = [
    {
        mood: "Angry"
    },
    {
        mood: "Disgust"
    },
    {
        mood: "Fear"
    },
    {
        mood: "Happy"
    },
    {
        mood: "Neutral"
    },
    {
        mood: "Sad"
    },
    {
        mood: "Surprise"
    },
];

const seedMoods = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        // Clear existing mood
        await Mood.deleteMany({});

        // Insert new mood
        await Mood.insertMany(moods);

        console.log("Mood seeded successfully!");
    } catch (error) {
        console.error("Error seeding moods:", error);
    } finally {
        mongoose.connection.close();
    }
};

seedMoods();
