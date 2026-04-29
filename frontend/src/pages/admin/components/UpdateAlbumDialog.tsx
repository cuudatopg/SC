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
import { useMusicStore } from "@/stores/useMusicStore";
import { Pencil, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { Album } from "@/types";

const UpdateAlbumDialog = ({ album }: { album: Album }) => {
	const { updateAlbum, isLoading } = useMusicStore();
	const [isOpen, setIsOpen] = useState(false);
	const imageInputRef = useRef<HTMLInputElement>(null);

	const [editAlbum, setEditAlbum] = useState({
		title: album.title,
		artist: album.artist,
		releaseYear: album.releaseYear,
	});

	const [imageFile, setImageFile] = useState<File | null>(null);

	const handleSubmit = async () => {
		const formData = new FormData();
		formData.append("title", editAlbum.title);
		formData.append("artist", editAlbum.artist);
		formData.append("releaseYear", editAlbum.releaseYear.toString());

		if (imageFile) {
			formData.append("imageFile", imageFile);
		}

		await updateAlbum(album._id, formData);
		setIsOpen(false);
		setImageFile(null);
	};

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				<Button variant='ghost' size='icon' className='text-zinc-400 hover:text-orange-600'>
					<Pencil className='h-4 w-4' />
				</Button>
			</DialogTrigger>

			<DialogContent className='bg-zinc-900 border-zinc-700'>
				<DialogHeader>
					<DialogTitle>Edit Album</DialogTitle>
					<DialogDescription>Change your album's information</DialogDescription>
				</DialogHeader>

				<div className='space-y-4 py-4'>
					{/* Image Upload Area */}
					<input
						type='file'
						ref={imageInputRef}
						hidden
						accept='image/*'
						onChange={(e) => setImageFile(e.target.files?.[0] || null)}
					/>
					<div
						className='flex items-center justify-center p-6 border-2 border-dashed border-zinc-700 rounded-lg cursor-pointer hover:bg-zinc-800/50 transition-colors'
						onClick={() => imageInputRef.current?.click()}
					>
						<div className='text-center'>
							{imageFile ? (
								<div className='text-sm text-orange-600 font-medium'>
									Selected: {imageFile.name}
								</div>
							) : (
								<div className='space-y-2'>
									<div className='p-3 bg-zinc-800 rounded-full inline-block'>
										<Upload className='h-6 w-6 text-zinc-400' />
									</div>
									<div className='text-sm text-zinc-400'>Change album cover (Optional)</div>
								</div>
							)}
						</div>
					</div>

					{/* Album Info Fields */}
					<div className='space-y-2'>
						<label className='text-sm font-medium text-zinc-100'>Album Title</label>
						<Input
							value={editAlbum.title}
							onChange={(e) => setEditAlbum({ ...editAlbum, title: e.target.value })}
							className='bg-zinc-800 border-zinc-700 focus-visible:ring-orange-600'
						/>
					</div>

					<div className='space-y-2'>
						<label className='text-sm font-medium text-zinc-100'>Artist</label>
						<Input
							value={editAlbum.artist}
							onChange={(e) => setEditAlbum({ ...editAlbum, artist: e.target.value })}
							className='bg-zinc-800 border-zinc-700 focus-visible:ring-orange-600'
						/>
					</div>

					<div className='space-y-2'>
						<label className='text-sm font-medium text-zinc-100'>Release Year</label>
						<Input
							type='number'
							value={editAlbum.releaseYear}
							onChange={(e) => setEditAlbum({ ...editAlbum, releaseYear: parseInt(e.target.value) })}
							className='bg-zinc-800 border-zinc-700 focus-visible:ring-orange-600'
						/>
					</div>
				</div>

				<DialogFooter>
					<Button variant='outline' onClick={() => setIsOpen(false)} disabled={isLoading} className='text-zinc-100'>
						Cancel
					</Button>
					<Button
						onClick={handleSubmit}
						disabled={isLoading || !editAlbum.title || !editAlbum.artist}
						className='bg-orange-600 hover:bg-orange-700 text-white font-semibold'
					>
						{isLoading ? "Saving..." : "Save Changes"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default UpdateAlbumDialog;