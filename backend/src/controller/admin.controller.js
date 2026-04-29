import { Song } from "../models/song.model.js";
import { Album } from "../models/album.model.js";
import cloudinary from "../lib/cloudinary.js";

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

export const createSong = async (req, res, next) => {
	try {
		if (!req.files || !req.files.audioFile || !req.files.imageFile) {
			return res.status(400).json({ message: "Please upload all files" });
		}

		const { title, artist, albumId, duration, mood, description } = req.body;
		const audioFile = req.files.audioFile;
		const imageFile = req.files.imageFile;

		const audioUrl = await uploadToCloudinary(audioFile);
		const imageUrl = await uploadToCloudinary(imageFile);

		const song = new Song({
			title,
			mood,
			description,
			artist,
			audioUrl,
			imageUrl,
			duration,
			albumId: albumId || null,
		});

		await song.save();

		if (albumId) {
			await Album.findByIdAndUpdate(albumId, {
				$push: { songs: song._id },
			});
		}
		res.status(201).json(song);
	} catch (error) {
		console.log("Error in createSong", error);
		next(error);
	}
};

export const updateSong = async (req, res, next) => {
	try {
		const { id } = req.params;
		const { title, artist, albumId, duration, mood, description } = req.body;

		const song = await Song.findById(id);
		if (!song) {
			return res.status(404).json({ message: "Song not found" });
		}

		let audioUrl = song.audioUrl;
		let imageUrl = song.imageUrl;

		if (req.files) {
			if (req.files.audioFile) {
				audioUrl = await uploadToCloudinary(req.files.audioFile);
			}
			if (req.files.imageFile) {
				imageUrl = await uploadToCloudinary(req.files.imageFile);
			}
		}

		const oldAlbumId = song.albumId;

		const updatedSong = await Song.findByIdAndUpdate(
			id,
			{
				title,
				artist,
				mood,
				description,
				duration,
				audioUrl,
				imageUrl,
				albumId: albumId === "none" ? null : albumId,
			},
			{ new: true }
		);

		if (oldAlbumId?.toString() !== albumId) {
			if (oldAlbumId) {
				await Album.findByIdAndUpdate(oldAlbumId, {
					$pull: { songs: id },
				});
			}

			if (albumId && albumId !== "none") {
				await Album.findByIdAndUpdate(albumId, {
					$push: { songs: id },
				});
			}
		}

		res.status(200).json(updatedSong);
	} catch (error) {
		console.log("Error in updateSong", error);
		next(error);
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

export const createAlbum = async (req, res, next) => {
	try {
		const { title, artist, description, releaseYear } = req.body;
		const { imageFile } = req.files;

		const imageUrl = await uploadToCloudinary(imageFile);

		const album = new Album({
			title,
			artist,
			description,
			imageUrl,
			releaseYear,
		});

		await album.save();
		res.status(201).json(album);
	} catch (error) {
		console.log("Error in createAlbum", error);
		next(error);
	}
};

export const updateAlbum = async (req, res, next) => {
	try {
		const { id } = req.params;
		const { title, artist, description, releaseYear } = req.body;

		const album = await Album.findById(id);
		if (!album) {
			return res.status(404).json({ message: "Album not found" });
		}

		let imageUrl = album.imageUrl;

		if (req.files && req.files.imageFile) {
			imageUrl = await uploadToCloudinary(req.files.imageFile);
		}

		const updatedAlbum = await Album.findByIdAndUpdate(
			id,
			{
				title,
				artist,
				description,
				releaseYear,
				imageUrl,
			},
			{ new: true } // Quan trọng để Zustand lấy được data mới nhất
		);

		res.status(200).json(updatedAlbum);
	} catch (error) {
		console.log("Error in updateAlbum", error);
		next(error);
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