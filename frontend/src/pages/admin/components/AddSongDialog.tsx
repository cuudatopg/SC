@ -19,10 +19,23 @@ import toast from "react-hot-toast";
interface NewSong {
	title: string;
	artist: string;
	mood: string;
	album: string;
	duration: string;
}

// Helper function for audio duration
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
	const { albums } = useMusicStore();
	const [songDialogOpen, setSongDialogOpen] = useState(false);
@ -31,6 +44,7 @@ const AddSongDialog = () => {
	const [newSong, setNewSong] = useState<NewSong>({
		title: "",
		artist: "",
		mood: "",
		album: "",
		duration: "0",
	});
@ -43,6 +57,22 @@ const AddSongDialog = () => {
	const audioInputRef = useRef<HTMLInputElement>(null);
	const imageInputRef = useRef<HTMLInputElement>(null);

	// Audio change handler
	const handleAudioChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		try {
			const duration = await getAudioDuration(file);
			setFiles((prev) => ({ ...prev, audio: file }));
			// Tự động điền duration (giây) vào form
			setNewSong((prev) => ({ ...prev, duration: duration.toString() }));
		} catch (error: any)
		{
			toast.error("Could not read audio duration" + error.message);
		}
	};

	const handleSubmit = async () => {
		setIsLoading(true);

@ -52,10 +82,11 @@ const AddSongDialog = () => {
			}

			const formData = new FormData();

			formData.append("title", newSong.title);
			formData.append("artist", newSong.artist);
			formData.append("mood", newSong.mood);
			formData.append("duration", newSong.duration);
			
			if (newSong.album && newSong.album !== "none") {
				formData.append("albumId", newSong.album);
			}
@ -64,22 +95,19 @@ const AddSongDialog = () => {
			formData.append("imageFile", files.image);

			await axiosInstance.post("/admin/songs", formData, {
				headers: {
					"Content-Type": "multipart/form-data",
				},
				headers: { "Content-Type": "multipart/form-data" },
			});

			setNewSong({
				title: "",
				artist: "",
				mood: "",
				album: "",
				duration: "0",
			});

			setFiles({
				audio: null,
				image: null,
			});
			setFiles({ audio: null, image: null });
			setSongDialogOpen(false);
			toast.success("Song added successfully");
		} catch (error: any) {
			toast.error("Failed to add song: " + error.message);
@ -104,12 +132,13 @@ const AddSongDialog = () => {
				</DialogHeader>

				<div className='space-y-4 py-4'>
					{/* Hidden Inputs */}
					<input
						type='file'
						accept='audio/*'
						ref={audioInputRef}
						hidden
						onChange={(e) => setFiles((prev) => ({ ...prev, audio: e.target.files![0] }))}
						onChange={handleAudioChange}
					/>

					<input
@ -117,19 +146,19 @@ const AddSongDialog = () => {
						ref={imageInputRef}
						className='hidden'
						accept='image/*'
						onChange={(e) => setFiles((prev) => ({ ...prev, image: e.target.files![0] }))}
						onChange={(e) => setFiles((prev) => ({ ...prev, image: e.target.files?.[0] || null }))}
					/>

					{/* image upload area */}
					{/* Image upload area */}
					<div
						className='flex items-center justify-center p-6 border-2 border-dashed border-zinc-700 rounded-lg cursor-pointer'
						className='flex items-center justify-center p-6 border-2 border-dashed border-zinc-700 rounded-lg cursor-pointer hover:bg-zinc-800/50 transition-colors'
						onClick={() => imageInputRef.current?.click()}
					>
						<div className='text-center'>
							{files.image ? (
								<div className='space-y-2'>
									<div className='text-sm text-orange-600'>Image selected:</div>
									<div className='text-xs text-zinc-400'>{files.image.name.slice(0, 20)}</div>
									<div className='text-sm text-orange-600 font-medium'>Image selected:</div>
									<div className='text-xs text-zinc-400'>{files.image.name.slice(0, 30)}</div>
								</div>
							) : (
								<>
@ -137,7 +166,7 @@ const AddSongDialog = () => {
										<Upload className='h-6 w-6 text-zinc-400' />
									</div>
									<div className='text-sm text-zinc-400 mb-2'>Upload artwork</div>
									<Button variant='outline' size='sm' className='text-xs'>
									<Button variant='outline' size='sm' className='text-xs pointer-events-none'>
										Choose File
									</Button>
								</>
@ -145,35 +174,64 @@ const AddSongDialog = () => {
						</div>
					</div>

					{/* Audio upload */}
					{/* Audio upload button */}
					<div className='space-y-2'>
						<label className='text-sm font-medium'>Audio File</label>
						<div className='flex items-center gap-2'>
							<Button variant='outline' onClick={() => audioInputRef.current?.click()} className='w-full'>
								{files.audio ? files.audio.name.slice(0, 20) : "Choose Audio File"}
							</Button>
						</div>
						<Button 
							variant='outline' 
							onClick={() => audioInputRef.current?.click()} 
							className={`w-full justify-start font-normal ${files.audio ? "text-orange-600 border-orange-600/50" : ""}`}
						>
							<Plus className="mr-2 h-4 w-4" />
							{files.audio ? files.audio.name.slice(0, 35) : "Choose Audio File"}
						</Button>
					</div>

					{/* other fields */}
					<div className='space-y-2'>
						<label className='text-sm font-medium'>Title</label>
						<Input
							value={newSong.title}
							onChange={(e) => setNewSong({ ...newSong, title: e.target.value })}
							className='bg-zinc-800 border-zinc-700'
						/>
					{/* Title & Artist */}
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

					{/* Mood Select */}
					<div className='space-y-2'>
						<label className='text-sm font-medium'>Artist</label>
						<Input
							value={newSong.artist}
							onChange={(e) => setNewSong({ ...newSong, artist: e.target.value })}
							className='bg-zinc-800 border-zinc-700'
						/>
						<label className='text-sm font-medium'>Mood</label>
						<Select
							value={newSong.mood}
							onValueChange={(value) => setNewSong({ ...newSong, mood: value })}
						>
							<SelectTrigger className='bg-zinc-800 border-zinc-700'>
								<SelectValue placeholder='Select mood' />
							</SelectTrigger>
							<SelectContent className='bg-zinc-800 border-zinc-700'>
								<SelectItem value="angry">Angry</SelectItem>
								<SelectItem value="energetic">Energetic</SelectItem>
								<SelectItem value="fear">Fear</SelectItem>
								<SelectItem value="happy">Happy</SelectItem>
								<SelectItem value="neutral">Neutral</SelectItem>
								<SelectItem value="sad">Sad</SelectItem>
								<SelectItem value="surprise">Surprise</SelectItem>
							</SelectContent>
						</Select>
					</div>

					{/* Duration (Auto-filled) */}
					<div className='space-y-2'>
						<label className='text-sm font-medium'>Duration (seconds)</label>
						<Input
@ -185,6 +243,7 @@ const AddSongDialog = () => {
						/>
					</div>

					{/* Album Select */}
					<div className='space-y-2'>
						<label className='text-sm font-medium'>Album (Optional)</label>
						<Select
@ -210,7 +269,7 @@ const AddSongDialog = () => {
					<Button variant='outline' onClick={() => setSongDialogOpen(false)} disabled={isLoading}>
						Cancel
					</Button>
					<Button onClick={handleSubmit} disabled={isLoading}>
					<Button onClick={handleSubmit} disabled={isLoading} className="bg-orange-600 hover:bg-orange-700 text-black">
						{isLoading ? "Uploading..." : "Add Song"}
					</Button>
				</DialogFooter>
@ -218,4 +277,5 @@ const AddSongDialog = () => {
		</Dialog>
	);
};
export default AddSongDialog;

export default AddSongDialog;