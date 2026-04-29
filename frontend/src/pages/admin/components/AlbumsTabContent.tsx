import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Library } from "lucide-react";
import { Search, X } from "lucide-react";
import AlbumsTable from "./AlbumsTable";
import AddAlbumDialog from "./AddAlbumDialog";
import { useMusicStore } from "@/stores/useMusicStore";
import { Input } from "@/components/ui/input";

const AlbumsTabContent = () => {

	const { searchQuery, setSearchQuery } = useMusicStore();
	
	return (
		<Card className='bg-zinc-800/50 border-zinc-700/50'>
			<CardHeader>
				<div className='flex items-center justify-between'>
					<div>
						<CardTitle className='flex items-center gap-2'>
							<Library className='h-5 w-5 text-violet-500' />
							Albums Library
						</CardTitle>
						<CardDescription>Manage your album collection</CardDescription>
					</div>
					{/* search bar */}
										<div className='relative w-full sm:w-72'>
											<Search className='absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500' />
											<Input
												placeholder='Search albums or artists...'
												value={searchQuery}
												onChange={(e) => setSearchQuery(e.target.value)}
												className='pl-10 bg-zinc-800 border-zinc-700 focus-visible:ring-orange-600 text-zinc-200'
											/>
											{searchQuery && (
												<button 
													onClick={() => setSearchQuery("")}
													className="absolute right-3 top-1/2 -translate-y-1/2 hover:text-zinc-300 text-zinc-500"
												>
													<X className="size-4" />
												</button>
											)}
										</div>
					<AddAlbumDialog />
				</div>
			</CardHeader>

			<CardContent>
				<AlbumsTable />
			</CardContent>
		</Card>
	);
};
export default AlbumsTabContent;
