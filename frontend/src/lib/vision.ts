import * as tf from "@tensorflow/tfjs";

let model: tf.LayersModel | null = null;
const EMOTIONS = ["angry", "disgust", "fear", "happy", "sad", "surprise", "neutral"];

export const analyzeImageEmotion = async (videoElement: HTMLVideoElement) => {
	try {
		if (!model) {
			console.log("Moosi AI: Loading RGB model...");
			model = await tf.loadLayersModel("/emotion_model/model.json");
			console.log("Moosi AI: RGB Model loaded!");
		}

		const result = tf.tidy(() => {
			// 1. Chuyển video thành Tensor [H, W, 3] (Mặc định fromPixels đã lấy 3 kênh RGB)
			const img = tf.browser.fromPixels(videoElement);

			// 2. Resize về chính xác 48x48
			const resized = tf.image.resizeBilinear(img, [48, 48]);

			// 3. Chuẩn hóa về [0, 1] và thêm chiều Batch -> Tensor [1, 48, 48, 3]
			// Bước này cực kỳ quan trọng cho model RGB
			const finalTensor = resized.toFloat().div(255.0).expandDims(0);

			// 4. Thực hiện dự đoán
			const prediction = model!.predict(finalTensor) as tf.Tensor;
			
			// Lấy index của cảm xúc có điểm cao nhất
			const index = prediction.argMax(1).dataSync()[0];
			
			return index;
		});

		return EMOTIONS[result];
	} catch (error) {
		// Nếu vẫn báo lỗi, hãy xem log này ở Console F12
		console.error("AI Analysis Error (RGB):", error);
		return null;
	}
};