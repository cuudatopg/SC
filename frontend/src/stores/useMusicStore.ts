import { axiosInstance } from "@/lib/axios";
import { Album, Song, Stats } from "@/types";
import toast from "react-hot-toast";
import { create } from "zustand";

interface MusicStore {
	songs: Song[];
	albums: Album[];
	isLoading: boolean;
	error: string | null;
	currentAlbum: Album | null;
	featuredSongs: Song[];
	madeForYouSongs: Song[];
	trendingSongs: Song[];
	stats: Stats;
	searchQuery: string;
    

	fetchAlbums: () => Promise<void>;
	fetchAlbumById: (id: string) => Promise<void>;
	fetchFeaturedSongs: () => Promise<void>;
	fetchMadeForYouSongs: () => Promise<void>;
	fetchTrendingSongs: () => Promise<void>;
	fetchStats: () => Promise<void>;
	fetchSongs: () => Promise<void>;
	addSong: (formData: FormData) => Promise<void>;
	addAlbum: (formData: FormData) => Promise<void>;
	deleteSong: (id: string) => Promise<void>;
	deleteAlbum: (id: string) => Promise<void>;
	updateSong: (id: string, formData: FormData) => Promise<void>;
	updateAlbum: (id: string, formData: FormData) => Promise<void>;
	setSearchQuery: (query: string) => void;
    getFilteredSongs: () => Song[];
	getFliteredAlbums: () => Album[];
}

export const useMusicStore = create<MusicStore>((set, get) => ({
	albums: [],
	songs: [],
	isLoading: false,
	error: null,
	currentAlbum: null,
	madeForYouSongs: [],
	featuredSongs: [],
	trendingSongs: [],
	stats: {
		totalSongs: 0,
		totalAlbums: 0,
		totalUsers: 0,
		totalArtists: 0,
	},


	searchQuery: "",
    setSearchQuery: (query) => set({ searchQuery: query }),
	getFilteredSongs: () => {
        const { songs, searchQuery } = get();
        if (!searchQuery) return songs;
        
        return songs.filter((song: any) => 
            song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            song.artist.toLowerCase().includes(searchQuery.toLowerCase())
        );
    },
	getFliteredAlbums: () => {
		const { albums, searchQuery } = get();
        if (!searchQuery) return albums;
        
        return albums.filter((album: any) => 
            album.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            album.artist.toLowerCase().includes(searchQuery.toLowerCase())
        );
	},

	addSong: async (formData) => {
		set({ isLoading: true, error: null });
		try {
			const response = await axiosInstance.post("/admin/songs", formData, {
				headers: { "Content-Type": "multipart/form-data" },
			});

			set((state) => ({
				songs: [response.data, ...state.songs], // Thêm bài mới vào đầu mảng
				stats: { ...state.stats, totalSongs: state.stats.totalSongs + 1 }, // Tăng số lượng thống kê
			}));
		} catch (error: any) {
			toast.error("Failed to add song: " + (error.response?.data?.message || error.message));
		} finally {
			set({ isLoading: false });
		}
	},

	addAlbum: async (formData) => {
		set({ isLoading: true, error: null });
		try {
			const response = await axiosInstance.post("/admin/albums", formData, {
				headers: { "Content-Type": "multipart/form-data" },
			});

			set((state) => ({
				albums: [response.data, ...state.albums],
				stats: { ...state.stats, totalAlbums: state.stats.totalAlbums + 1 },
			}));
			toast.success("Album created successfully");
		} catch (error: any) {
			toast.error("Failed to create album: " + (error.response?.data?.message || error.message));
		} finally {
			set({ isLoading: false });
		}
	},

	updateSong: async (id, formData) => {
		set({ isLoading: true, error: null });
		try {
			const response = await axiosInstance.put(`/admin/songs/${id}`, formData, {
				headers: { "Content-Type": "multipart/form-data" },
			});

			set((state) => ({
				songs: state.songs.map((song) => (song._id === id ? response.data : song)),
			}));
			toast.success("Song updated successfully");
		} catch (error: any) {
			toast.error("Failed to update song: " + (error.response?.data?.message || error.message));
		} finally {
			set({ isLoading: false });
		}
	},

	updateAlbum: async (id, formData) => {
		set({ isLoading: true, error: null });
		try {
			const response = await axiosInstance.put(`/admin/albums/${id}`, formData, {
				headers: { "Content-Type": "multipart/form-data" },
			});

			set((state) => ({
				albums: state.albums.map((album) => (album._id === id ? response.data : album)),
			}));
			toast.success("Album updated successfully");
		} catch (error: any) {
			toast.error("Failed to update album: " + (error.response?.data?.message || error.message));
		} finally {
			set({ isLoading: false });
		}
	},

	deleteSong: async (id) => {
		set({ isLoading: true, error: null });
		try {
			await axiosInstance.delete(`/admin/songs/${id}`);

			set((state) => ({
				songs: state.songs.filter((song) => song._id !== id),
				stats: { ...state.stats, totalSongs: state.stats.totalSongs - 1 }, // Giảm số lượng khi xóa
			}));
			toast.success("Song deleted successfully");
		} catch (error: any) {
			toast.error("Error deleting song" + error.message);
		} finally {
			set({ isLoading: false });
		}
	},

	deleteAlbum: async (id) => {
		set({ isLoading: true, error: null });
		try {
			await axiosInstance.delete(`/admin/albums/${id}`);
			set((state) => ({
				albums: state.albums.filter((album) => album._id !== id),
				stats: { ...state.stats, totalAlbums: state.stats.totalAlbums - 1 },
				songs: state.songs.map((song) =>
					song.albumId === id ? { ...song, albumId: null } : song
				),
			}));
			toast.success("Album deleted successfully");
		} catch (error: any) {
			toast.error("Failed to delete album: " + error.message);
		} finally {
			set({ isLoading: false });
		}
	},

	fetchSongs: async () => {
		set({ isLoading: true, error: null });
		try {
			const response = await axiosInstance.get("/songs");
			set({ songs: response.data });
		} catch (error: any) {
			set({ error: error.message });
		} finally {
			set({ isLoading: false });
		}
	},

	fetchStats: async () => {
		set({ isLoading: true, error: null });
		try {
			const response = await axiosInstance.get("/stats");
			set({ stats: response.data });
		} catch (error: any) {
			set({ error: error.message });
		} finally {
			set({ isLoading: false });
		}
	},

	fetchAlbums: async () => {
		set({ isLoading: true, error: null });
		try {
			const response = await axiosInstance.get("/albums");
			set({ albums: response.data });
		} catch (error: any) {
			set({ error: error.response.data.message });
		} finally {
			set({ isLoading: false });
		}
	},

	fetchAlbumById: async (id) => {
		set({ isLoading: true, error: null });
		try {
			const response = await axiosInstance.get(`/albums/${id}`);
			set({ currentAlbum: response.data });
		} catch (error: any) {
			set({ error: error.response.data.message });
		} finally {
			set({ isLoading: false });
		}
	},

	fetchFeaturedSongs: async () => {
		set({ isLoading: true, error: null });
		try {
			const response = await axiosInstance.get("/songs/featured");
			set({ featuredSongs: response.data });
		} catch (error: any) {
			set({ error: error.response.data.message });
		} finally {
			set({ isLoading: false });
		}
	},

	fetchMadeForYouSongs: async () => {
		set({ isLoading: true, error: null });
		try {
			const response = await axiosInstance.get("/songs/made-for-you");
			set({ madeForYouSongs: response.data });
		} catch (error: any) {
			set({ error: error.response.data.message });
		} finally {
			set({ isLoading: false });
		}
	},

	fetchTrendingSongs: async () => {
		set({ isLoading: true, error: null });
		try {
			const response = await axiosInstance.get("/songs/trending");
			set({ trendingSongs: response.data });
		} catch (error: any) {
			set({ error: error.response.data.message });
		} finally {
			set({ isLoading: false });
		}
	},
}));