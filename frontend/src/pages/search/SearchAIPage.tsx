import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Camera, Sparkles, Music, Loader2, RefreshCw, Check } from "lucide-react";
import { analyzeImageEmotion } from "@/lib/vision";
import { axiosInstance } from "@/lib/axios";
import { usePlayerStore } from "@/stores/usePlayerStore";
import toast from "react-hot-toast";

const FER2013_EMOTIONS = [
    { id: "angry", label: "Angry", emoji: "😡" },
    { id: "disgust", label: "Disgust", emoji: "🤢" },
    { id: "fear", label: "Fear", emoji: "😨" },
    { id: "happy", label: "Happy", emoji: "😊" },
    { id: "sad", label: "Sad", emoji: "😢" },
    { id: "surprise", label: "Surprise", emoji: "😲" },
    { id: "neutral", label: "Neutral", emoji: "😐" },
];

const SearchAIPage = () => {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [results, setResults] = useState<any[]>([]);
    const [detectedMood, setDetectedMood] = useState<string | null>(null);
    const [isCameraActive, setIsCameraActive] = useState(true);
    const [showConfirmation, setShowConfirmation] = useState(false);
    
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const { playAlbum } = usePlayerStore();

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => {
                track.stop();
                track.enabled = false;
            });
            streamRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
        setIsCameraActive(false);
    };

    const startCamera = async () => {
        stopCamera();
        try {
            setIsCameraActive(true);
            setShowConfirmation(false);
            setResults([]);
            setDetectedMood(null);

            setTimeout(async () => {
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({ 
                        video: { width: 1280, height: 720 } 
                    });
                    streamRef.current = stream;
                    if (videoRef.current) {
                        videoRef.current.srcObject = stream;
                    }
                } catch (err) {
                    toast.error("Can't use camera." + err);
                    setIsCameraActive(false);
                }
            }, 150);
        } catch (err) {
            toast.error("Lỗi khởi tạo thiết bị." + err);
        }
    };

    useEffect(() => {
        startCamera();
        return () => stopCamera();
    }, []);

    const handleCaptureAndAnalyze = async () => {
        if (!videoRef.current || !streamRef.current) return;
        setIsAnalyzing(true);
        try {
            const moodResult = await analyzeImageEmotion(videoRef.current);
            stopCamera();
            setDetectedMood(moodResult);
            setShowConfirmation(true);
        } catch (error) {
            toast.error("Lỗi phân tích hình ảnh." +error);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleConfirmMood = async (finalMood: string) => {
        setDetectedMood(finalMood);
        setIsAnalyzing(true);
        
        try {
            const response = await axiosInstance.post("/ai-vision", { 
                mood: finalMood 
            });

            setResults(response.data.songs || []);
            setShowConfirmation(false);
            toast.success(`Music for ${finalMood} mood is ready!`);
        } catch (error: any) {
            console.error("Chi tiết lỗi:", error.response?.status, error.response?.data);
            toast.error("Could not fetch music. Please try again.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className='h-full bg-zinc-950 p-6 overflow-y-auto'>
            <div className='max-w-3xl mx-auto space-y-8'>
                <div className='text-center space-y-2'>
                    <h1 className='text-3xl font-bold text-white flex items-center justify-center gap-2'>
                        <Sparkles className='text-orange-500 animate-pulse' /> Moosi AI Scanner
                    </h1>
                </div>

                {/* Khung hiển thị Video/Trạng thái */}
                <div className='relative aspect-video max-w-md mx-auto bg-zinc-900 rounded-2xl overflow-hidden border-2 border-zinc-800 shadow-2xl'>
                    {isCameraActive ? (
                        <video ref={videoRef} autoPlay playsInline muted className='w-full h-full object-cover scale-x-[-1]' />
                    ) : (
                        <div className='w-full h-full flex flex-col items-center justify-center bg-zinc-900'>
                            <div className="size-20 rounded-full bg-zinc-800 flex items-center justify-center mb-4">
                                <Camera className='size-8 text-zinc-600' />
                            </div>
                            <p className="text-zinc-500 font-medium">
                                {showConfirmation ? "Analyzing mood..." : results.length > 0 ? "Enjoy your music!" : "Camera disconnected"}
                            </p>
                        </div>
                    )}
                    
                    {isAnalyzing && (
                        <div className='absolute inset-0 bg-black/70 flex flex-col items-center justify-center backdrop-blur-sm'>
                            <Loader2 className='size-10 text-orange-500 animate-spin mb-2' />
                            <p className='text-orange-500 font-bold'>Working...</p>
                        </div>
                    )}
                </div>

                {/* Nút điều khiển chính: Luôn hiện nếu camera đang mở hoặc khi đã có kết quả */}
                <div className='flex justify-center'>
                    {isCameraActive ? (
                        <Button 
                            onClick={handleCaptureAndAnalyze} 
                            disabled={isAnalyzing} 
                            className='bg-orange-500 hover:bg-orange-600 rounded-full px-10 py-6 text-lg transition-transform hover:scale-105 active:scale-95'
                        >
                            <Camera className='mr-2 size-5' /> Take a picture
                        </Button>
                    ) : !showConfirmation && (
                        <Button 
                            onClick={startCamera} 
                            variant="outline"
                            className='border-zinc-700 text-zinc-300 hover:bg-zinc-800 rounded-full px-8 py-5'
                        >
                            <RefreshCw className='mr-2 size-4' /> New Scan
                        </Button>
                    )}
                </div>

                {/* Phần Xác nhận cảm xúc */}
                {showConfirmation && (
                    <div className='bg-zinc-900 p-6 rounded-2xl border border-zinc-800 space-y-6 animate-in fade-in zoom-in-95'>
                        <div className='text-center'>
                            <p className='text-zinc-400 text-sm mb-1'>We think you are:</p>
                            <h3 className='text-3xl font-black text-orange-500 uppercase'>{detectedMood || "..."}</h3>
                        </div>

                        <div className='grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2'>
                            {FER2013_EMOTIONS.map((e) => (
                                <button
                                    key={e.id}
                                    onClick={() => handleConfirmMood(e.id)}
                                    className={`p-3 rounded-xl border transition-all flex flex-col items-center gap-1 ${
                                        detectedMood === e.id 
                                        ? "bg-orange-500/20 border-orange-500 text-white shadow-lg" 
                                        : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:bg-zinc-700 hover:text-white"
                                    }`}
                                >
                                    <span className='text-xl'>{e.emoji}</span>
                                    <span className='text-[10px] font-bold uppercase'>{e.label}</span>
                                </button>
                            ))}
                        </div>

                        <div className='flex justify-center'>
                            <Button variant='ghost' onClick={startCamera} className='text-zinc-500 hover:text-white'>
                                <RefreshCw className='mr-2 size-4' /> Retake
                            </Button>
                        </div>
                    </div>
                )}

                {/* Danh sách bài hát kết quả */}
                {results.length > 0 && !showConfirmation && (
                    <div className='space-y-4 animate-in slide-in-from-bottom-5'>
                        <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                            <h2 className='text-xl font-bold text-white flex items-center gap-2'>
                                <Music className='text-orange-500' /> Recommended for you
                            </h2>
                            <span className="text-orange-500 text-sm font-bold uppercase bg-orange-500/10 px-3 py-1 rounded-full">
                                {detectedMood}
                            </span>
                        </div>
                        <div className='grid grid-cols-1 gap-2'>
                            {results.map((song, index) => (
                                <div 
                                    key={song._id}
                                    onClick={() => playAlbum(results, index)}
                                    className='flex items-center gap-4 p-3 hover:bg-zinc-800/60 rounded-xl cursor-pointer group border border-transparent hover:border-zinc-700 transition-all'
                                >
                                    <img src={song.imageUrl} className='size-12 rounded-lg object-cover shadow-lg group-hover:scale-105 transition-transform' />
                                    <div className='flex-1 min-w-0'>
                                        <div className='text-white font-medium truncate group-hover:text-orange-500'>{song.title}</div>
                                        <div className='text-zinc-400 text-sm truncate'>{song.artist}</div>
                                    </div>
                                    <Check className="size-5 text-orange-500 opacity-0 group-hover:opacity-100" />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SearchAIPage;