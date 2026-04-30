import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMusicStore } from "@/stores/useMusicStore";
import { Pencil, Upload, Plus } from "lucide-react";
import { useRef, useState } from "react";
import { Song } from "@/types"; // Đảm bảo import đúng type Song của dự án

const getAudioDuration = (file: File): Promise<number> => {
	return new Promise((resolve) => {
		const url = URL.createObjectURL(file);
		const audio = new Audio(url);
		audio.addEventListener("loadedmetadata", () => {
			URL.revokeObjectURL(url);
			resolve(Math.floor(audio.duration));
		});
	});
};

const UpdateSongDialog = ({ song }: { song: Song }) => {
	// 1. Lấy hàm và trạng thái từ Store
	const { albums, updateSong, isLoading } = useMusicStore();
	
	const [isOpen, setIsOpen] = useState(false);

	// Khởi tạo state từ dữ liệu bài hát hiện có
	const [editSong, setEditSong] = useState({
		title: song.title,
		artist: song.artist,
		mood: song.mood,
		album: song.albumId || "none",
		duration: song.duration.toString(),
		description: song.description || "",
	});

	const [files, setFiles] = useState<{ audio: File | null; image: File | null }>({
		audio: null,
		image: null,
	});

	const audioInputRef = useRef<HTMLInputElement>(null);
	const imageInputRef = useRef<HTMLInputElement>(null);

	const handleAudioChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		try {
			const duration = await getAudioDuration(file);
			setFiles((prev) => ({ ...prev, audio: file }));
			setEditSong((prev) => ({ ...prev, duration: duration.toString() }));
		} catch (error) {
			console.error("Error reading duration:", error);
		}
	};

	const handleSubmit = async () => {
		const formData = new FormData();
		formData.append("title", editSong.title);
		formData.append("artist", editSong.artist);
		formData.append("mood", editSong.mood);
		formData.append("duration", editSong.duration);
		formData.append("description", editSong.description);
		
		if (editSong.album && editSong.album !== "none") {
			formData.append("albumId", editSong.album);
		}

		if (files.audio) formData.append("audioFile", files.audio);
		if (files.image) formData.append("imageFile", files.image);

		await updateSong(song._id, formData);

		setIsOpen(false);
	};

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				<Button variant='ghost' size='icon' className='text-zinc-400 hover:text-orange-600'>
					<Pencil className='h-4 w-4' />
				</Button>
			</DialogTrigger>

			<DialogContent className='bg-zinc-900 border-zinc-700 max-h-[80vh] overflow-auto'>
				<DialogHeader>
					<DialogTitle>Update Song</DialogTitle>
					<DialogDescription>Thay đổi thông tin và tệp tin của bài hát</DialogDescription>
				</DialogHeader>

				<div className='space-y-4 py-4'>
					{/* Upload Section */}
					<input type='file' accept='audio/*' ref={audioInputRef} hidden onChange={handleAudioChange} />
					<input 
						type='file' ref={imageInputRef} hidden accept='image/*' 
						onChange={(e) => setFiles((prev) => ({ ...prev, image: e.target.files?.[0] || null }))} 
					/>

					<div
						className='flex items-center justify-center p-6 border-2 border-dashed border-zinc-700 rounded-lg cursor-pointer hover:bg-zinc-800/50 transition-colors'
						onClick={() => imageInputRef.current?.click()}
					>
						<div className='text-center'>
							{files.image ? (
								<div className='text-sm text-orange-600 font-medium'>
									Selected: {files.image.name}
								</div>
							) : (
								<>
									<div className='p-3 bg-zinc-800 rounded-full inline-block mb-2'>
										<Upload className='h-6 w-6 text-zinc-400' />
									</div>
									<div className='text-sm text-zinc-400 mb-2'>Change artwork (Optional)</div>
								</>
							)}
						</div>
					</div>

					<div className='space-y-2'>
						<label className='text-sm font-medium text-zinc-100'>Audio File</label>
						<Button 
							variant='outline' 
							onClick={() => audioInputRef.current?.click()} 
							className={`w-full justify-start font-normal bg-zinc-800 border-zinc-700 ${files.audio ? "text-orange-500 border-orange-500/50" : "text-zinc-400"}`}
						>
							<Plus className="mr-2 h-4 w-4" />
							{files.audio ? files.audio.name : "Change Audio File (Optional)"}
						</Button>
					</div>

					{/* Text Inputs */}
					<div className='grid grid-cols-2 gap-4'>
						<div className='space-y-2'>
							<label className='text-sm font-medium text-zinc-100'>Title</label>
							<Input
								value={editSong.title}
								onChange={(e) => setEditSong({ ...editSong, title: e.target.value })}
								className='bg-zinc-800 border-zinc-700 focus-visible:ring-orange-600 text-zinc-100'
							/>
						</div>
						<div className='space-y-2'>
							<label className='text-sm font-medium text-zinc-100'>Artist</label>
							<Input
								value={editSong.artist}
								onChange={(e) => setEditSong({ ...editSong, artist: e.target.value })}
								className='bg-zinc-800 border-zinc-700 focus-visible:ring-orange-600 text-zinc-100'
							/>
						</div>
					</div>

					{/* Description Section */}
					<div className='space-y-2'>
						<label className='text-sm font-medium text-zinc-100'>Description</label>
						<textarea
							value={editSong.description}
							onChange={(e) => setEditSong({ ...editSong, description: e.target.value })}
							className='flex min-h-[80px] w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-orange-600/50 focus:border-orange-600/50 resize-none'
							placeholder="Mô tả về bài hát..."
						/>
					</div>

					<div className='grid grid-cols-2 gap-4'>
						<div className='space-y-2'>
							<label className='text-sm font-medium text-zinc-100'>Mood</label>
							<Input
								value={editSong.mood}
								onChange={(e) => setEditSong({ ...editSong, mood: e.target.value })}
								className='bg-zinc-800 border-zinc-700 focus-visible:ring-orange-600 text-zinc-100'
							/>
						</div>

						<div className='space-y-2'>
							<label className='text-sm font-medium text-zinc-100'>Duration (sec)</label>
							<Input
								type='number'
								value={editSong.duration}
								onChange={(e) => setEditSong({ ...editSong, duration: e.target.value })}
								className='bg-zinc-800 border-zinc-700 focus-visible:ring-orange-600 text-zinc-100'
							/>
						</div>
					</div>

					<div className='space-y-2'>
						<label className='text-sm font-medium text-zinc-100'>Album</label>
						<Select value={editSong.album} onValueChange={(value) => setEditSong({ ...editSong, album: value })}>
							<SelectTrigger className='bg-zinc-800 border-zinc-700 focus:ring-orange-600 text-zinc-100'>
								<SelectValue />
							</SelectTrigger>
							<SelectContent className='bg-zinc-800 border-zinc-700 text-zinc-100'>
								<SelectItem value='none'>No Album (Single)</SelectItem>
								{albums.map((album) => (
									<SelectItem key={album._id} value={album._id}>{album.title}</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</div>

				<DialogFooter className='border-t border-zinc-800 pt-4'>
					<Button variant='outline' onClick={() => setIsOpen(false)} disabled={isLoading} className="text-zinc-100 border-zinc-700 hover:bg-zinc-800">
						Cancel
					</Button>
					<Button 
						onClick={handleSubmit} 
						disabled={isLoading} 
						className="bg-orange-600 hover:bg-orange-700 text-white font-semibold"
					>
						{isLoading ? "Saving..." : "Save Changes"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default UpdateSongDialog;