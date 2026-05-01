import { usePlayerStore } from "@/stores/usePlayerStore";
import { useEffect, useRef } from "react";

const AudioPlayer = () => {
    const audioRef = useRef<HTMLAudioElement>(null);
    const prevSongRef = useRef<string | null>(null);

    const { currentSong, isPlaying, playNext } = usePlayerStore();

    useEffect(() => {
        const audio = audioRef.current;
        const handleEnded = () => playNext();

        audio?.addEventListener("ended", handleEnded);
        return () => audio?.removeEventListener("ended", handleEnded);
    }, [playNext]);

    useEffect(() => {
        if (!audioRef.current) return;
        const audio = audioRef.current;

        const isSongChange = prevSongRef.current !== currentSong?.audioUrl;

        if (isSongChange) {
            audio.src = currentSong?.audioUrl || "";
            audio.currentTime = 0;
            prevSongRef.current = currentSong?.audioUrl || null;
        }

        if (isPlaying) {
            const playPromise = audio.play();
            if (playPromise !== undefined) {
                playPromise.catch((error) => {
                    if (error.name !== "AbortError") {
                        console.error("Playback error:", error);
                    }
                });
            }
        } else {
            audio.pause();
        }
    }, [currentSong, isPlaying]);

    return <audio ref={audioRef} preload="auto" />;
};

export default AudioPlayer;