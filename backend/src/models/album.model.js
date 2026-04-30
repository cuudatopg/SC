import mongoose from "mongoose";

const albumSchema = new mongoose.Schema(
	{
		title: { type: String, required: true },
		artist: { type: String, required: true },
		imageUrl: { type: String, required: true },
		description: { type: String, required: false},
		releaseYear: { type: Number, required: true },
		songs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Song" }],
		embedding: { type: [Number], default: [] }
	},
	{ timestamps: true }
); //  createdAt, updatedAt

export const Album = mongoose.model("Album", albumSchema);
