import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Music, Search, X } from "lucide-react";
import SongsTable from "./SongsTable";
import AddSongDialog from "./AddSongDialog";
import { useMusicStore } from "@/stores/useMusicStore";
import { Input } from "@/components/ui/input";
const SongsTabContent = () => {
	const { searchQuery, setSearchQuery } = useMusicStore();


	return (
		<Card>
			<CardHeader>
				<div className='flex items-center justify-between'>
					<div>
						<CardTitle className='flex items-center gap-2'>
							<Music className='size-5 text-orange-600' />
							Songs Library
						</CardTitle>
						<CardDescription>Manage your music tracks</CardDescription>
					</div>
					{/* search bar */}
                    <div className='relative w-full sm:w-72'>
                        <Search className='absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500' />
                        <Input
                            placeholder='Search songs or artists...'
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
					<AddSongDialog />
				</div>
			</CardHeader>
			<CardContent>
				<SongsTable />
			</CardContent>
		</Card>
	);
};
export default SongsTabContent;
