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
import { Plus, Upload } from "lucide-react";
import { useRef, useState } from "react";
import toast from "react-hot-toast";

interface NewSong {
	title: string;
	artist: string;
	mood: string;
	album: string;
	duration: string;
	description: string; // 1. Thêm type cho description
}

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

const AddSongDialog = () => {
	const { albums, addSong } = useMusicStore();
	const [songDialogOpen, setSongDialogOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	const [newSong, setNewSong] = useState<NewSong>({
		title: "",
		artist: "",
		mood: "",
		album: "",
		duration: "0",
		description: "", // 2. Thêm giá trị khởi tạo
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
			setNewSong((prev) => ({ ...prev, duration: duration.toString() }));
		} catch (error: any)
		{
			toast.error("Could not read audio duration" + error.message);
		}
	};

	const handleSubmit = async () => {
		setIsLoading(true);

		try {
			if (!files.audio || !files.image) {
				return toast.error("Please upload both audio and image files");
			}

			const formData = new FormData();
			formData.append("title", newSong.title);
			formData.append("artist", newSong.artist);
			formData.append("mood", newSong.mood);
			formData.append("duration", newSong.duration);
			formData.append("description", newSong.description); // 3. Gắn dữ liệu vào FormData
			
			if (newSong.album && newSong.album !== "none") {
				formData.append("albumId", newSong.album);
			}

			formData.append("audio", files.audio);
			formData.append("image", files.image);

			await addSong(formData);

			setFiles({ audio: null, image: null });

			// Reset form
			setNewSong({
				title: "",
				artist: "",
				mood: "",
				album: "",
				duration: "0",
				description: "", // Reset description
			});

			setSongDialogOpen(false);
			toast.success("Song added successfully");
		} catch (error: any) {
			toast.error("Failed to add song: " + error.message);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Dialog open={songDialogOpen} onOpenChange={setSongDialogOpen}>
			<DialogTrigger asChild>
				<Button className='bg-orange-600 hover:bg-orange-700 text-black'>
					<Plus className='mr-2 h-4 w-4' />
					Add Song
				</Button>
			</DialogTrigger>

			<DialogContent className='bg-zinc-900 border-zinc-700 max-h-[80vh] overflow-auto'>
				<DialogHeader>
					<DialogTitle>Add New Song</DialogTitle>
					<DialogDescription>Add a new song to your music library</DialogDescription>
				</DialogHeader>

				<div className='space-y-4 py-4'>
					<input
						type='file'
						accept='audio/*'
						ref={audioInputRef}
						hidden
						onChange={handleAudioChange}
					/>

					<input
						type='file'
						ref={imageInputRef}
						className='hidden'
						accept='image/*'
						onChange={(e) => setFiles((prev) => ({ ...prev, image: e.target.files?.[0] || null }))}
					/>

					<div
						className='flex items-center justify-center p-6 border-2 border-dashed border-zinc-700 rounded-lg cursor-pointer hover:bg-zinc-800/50 transition-colors'
						onClick={() => imageInputRef.current?.click()}
					>
						<div className='text-center'>
							{files.image ? (
								<div className='space-y-2'>
									<div className='text-sm text-orange-600 font-medium'>Image selected:</div>
									<div className='text-xs text-zinc-400'>{files.image.name.slice(0, 30)}</div>
								</div>
							) : (
								<>
									<div className='p-3 bg-zinc-800 rounded-full inline-block mb-2'>
										<Upload className='h-6 w-6 text-zinc-400' />
									</div>
									<div className='text-sm text-zinc-400 mb-2'>Upload artwork</div>
									<Button variant='outline' size='sm' className='text-xs pointer-events-none'>
										Choose File
									</Button>
								</>
							)}
						</div>
					</div>

					<div className='space-y-2'>
						<label className='text-sm font-medium'>Audio File</label>
						<Button 
							variant='outline' 
							onClick={() => audioInputRef.current?.click()} 
							className={`w-full justify-start font-normal ${files.audio ? "text-orange-600 border-orange-600/50" : ""}`}
						>
							<Plus className="mr-2 h-4 w-4" />
							{files.audio ? files.audio.name.slice(0, 35) : "Choose Audio File"}
						</Button>
					</div>

					<div className='grid grid-cols-2 gap-4'>
						<div className='space-y-2'>
							<label className='text-sm font-medium'>Title</label>
							<Input
								value={newSong.title}
								onChange={(e) => setNewSong({ ...newSong, title: e.target.value })}
								className='bg-zinc-800 border-zinc-700'
								placeholder="Song title"
							/>
						</div>
						<div className='space-y-2'>
							<label className='text-sm font-medium'>Artist</label>
							<Input
								value={newSong.artist}
								onChange={(e) => setNewSong({ ...newSong, artist: e.target.value })}
								className='bg-zinc-800 border-zinc-700'
								placeholder="Artist name"
							/>
						</div>
					</div>

					<div className='space-y-2'>
						<label className='text-sm font-medium'>Description</label>
						{/* 4. Thêm UI nhập Description */}
						<textarea
							value={newSong.description}
							onChange={(e) => setNewSong({ ...newSong, description: e.target.value })}
							className='flex min-h-[80px] w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-orange-600/50 focus:border-orange-600/50 resize-none'
							placeholder="Write a brief description about this song..."
						/>
					</div>

					<div className='grid grid-cols-2 gap-4'>
						<div className='space-y-2'>
							<label className='text-sm font-medium'>Mood (Multiple allowed)</label>
								<Input
									value={newSong.mood}
									onChange={(e) => setNewSong({ ...newSong, mood: e.target.value })}
									className='bg-zinc-800 border-zinc-700 focus:ring-orange-600/50'
									placeholder="e.g. Happy, Energetic, Chill"
								/>
								<p className='text-[10px] text-zinc-500 italic'>
									Separate moods with commas (e.g. Sad, Lofi)
								</p>
						</div>

						<div className='space-y-2'>
							<label className='text-sm font-medium'>Duration (sec)</label>
							<Input
								type='number'
								min='0'
								value={newSong.duration}
								onChange={(e) => setNewSong({ ...newSong, duration: e.target.value || "0" })}
								className='bg-zinc-800 border-zinc-700'
							/>
						</div>
					</div>

					<div className='space-y-2'>
						<label className='text-sm font-medium'>Album (Optional)</label>
						<Select
							value={newSong.album}
							onValueChange={(value) => setNewSong({ ...newSong, album: value })}
						>
							<SelectTrigger className='bg-zinc-800 border-zinc-700'>
								<SelectValue placeholder='Select album' />
							</SelectTrigger>
							<SelectContent className='bg-zinc-800 border-zinc-700'>
								<SelectItem value='none'>No Album (Single)</SelectItem>
								{albums.map((album) => (
									<SelectItem key={album._id} value={album._id}>
										{album.title}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</div>

				<DialogFooter>
					<Button variant='outline' onClick={() => setSongDialogOpen(false)} disabled={isLoading}>
						Cancel
					</Button>
					<Button onClick={handleSubmit} disabled={isLoading} className="bg-orange-600 hover:bg-orange-700 text-black">
						{isLoading ? "Uploading..." : "Add Song"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default AddSongDialog;