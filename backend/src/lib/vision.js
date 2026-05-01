import tf from "@tensorflow/tfjs";
import fs from "fs";

let model;

// Load model khi khởi động server
const loadModel = async () => {
    if (!model) {
        // Đường dẫn đến file json model của bạn
        const modelPath = `file://${process.cwd()}/emotion_model/model.json`;
        model = await tf.loadLayersModel(modelPath);
        console.log("✅ Emotion Model Loaded");
    }
};

// Danh sách nhãn cảm xúc tương ứng với đầu ra của model (cần khớp với lúc bạn train)
const EMOTIONS = ["angry", "disgust", "fear", "happy", "sad", "surprise", "neutral"];

export const analyzeImageEmotion = async (base64Image) => {
    await loadModel();

    // 1. Chuyển đổi base64 sang Tensor
    const buffer = Buffer.from(base64Image.replace(/^data:image\/\w+;base64,/, ""), "base64");
    
    return tf.tidy(() => {
        const imageTensor = tf.node.decodeImage(buffer, 3)
            .resizeNearestNeighbor([48, 48]) // Thay đổi size khớp với Input của model bạn (ví dụ 48x48 cho FER2013)
            .mean(2) // Chuyển sang ảnh xám nếu model bạn yêu cầu
            .expandDims(0)
            .toFloat()
            .div(255.0); // Normalize dữ liệu

        // 2. Dự đoán
        const prediction = model.predict(imageTensor);
        const emotionIndex = prediction.argMax(1).dataSync()[0];
        
        return EMOTIONS[emotionIndex];
    });
};