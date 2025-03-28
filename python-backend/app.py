from fastapi import FastAPI, UploadFile, File
import cv2
import numpy as np
import mediapipe as mp
import os
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://*.vercel.app"],  # Allow frontend to access API
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)

# Initialize MediaPipe models
mp_face_mesh = mp.solutions.face_mesh.FaceMesh(min_detection_confidence=0.5)
mp_hands = mp.solutions.hands.Hands(min_detection_confidence=0.5, min_tracking_confidence=0.5)
mp_pose = mp.solutions.pose.Pose(min_detection_confidence=0.5, min_tracking_confidence=0.5)

# Define facial landmarks for different emotions
LEFT_EYE_LANDMARKS = [159, 145]
RIGHT_EYE_LANDMARKS = [386, 374]
LEFT_BROW = [70, 46]
RIGHT_BROW = [300, 276]
LIPS = [13, 14]  # Upper and lower lip for mouth openness

# Function to calculate eye aspect ratio (EAR) for blink detection
def calculate_ear(landmarks, eye_indices):
    top = landmarks[eye_indices[0]]
    bottom = landmarks[eye_indices[1]]
    return abs(top.y - bottom.y)  # Simple vertical distance

@app.post("/analyze-body-language/")
async def analyze_body_language(video: UploadFile = File(...)):
    try:
        # Save uploaded file temporarily
        temp_video_path = "temp_video.mp4"
        with open(temp_video_path, "wb") as temp_file:
            temp_file.write(await video.read())

        cap = cv2.VideoCapture(temp_video_path)
        if not cap.isOpened():
            return {"error": "Unable to open video file"}

        frame_count = 0
        blink_count = 0
        brow_movement_count = 0
        hand_movement_count = 0
        posture_issues = 0
        smile_count = 0
        frown_count = 0
        neutral_face_count = 0
        feedback = []

        while True:
            ret, frame = cap.read()
            if not ret:
                break

            frame_count += 1
            image_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

            # **Face Mesh for Emotion & Nervousness Detection**
            face_results = mp_face_mesh.process(image_rgb)
            if face_results.multi_face_landmarks:
                for face_landmarks in face_results.multi_face_landmarks:
                    # **Blink Detection**
                    left_ear = calculate_ear(face_landmarks.landmark, LEFT_EYE_LANDMARKS)
                    right_ear = calculate_ear(face_landmarks.landmark, RIGHT_EYE_LANDMARKS)
                    if left_ear < 0.02 and right_ear < 0.02:
                        blink_count += 1  # Excessive blinking

                    # **Brow Movement for Nervousness**
                    left_brow_height = abs(face_landmarks.landmark[LEFT_BROW[0]].y - face_landmarks.landmark[LEFT_BROW[1]].y)
                    right_brow_height = abs(face_landmarks.landmark[RIGHT_BROW[0]].y - face_landmarks.landmark[RIGHT_BROW[1]].y)
                    if left_brow_height > 0.05 or right_brow_height > 0.05:
                        brow_movement_count += 1  # Raised eyebrows (possible nervousness)

                    # **Lip Movement for Emotion Analysis**
                    upper_lip = face_landmarks.landmark[LIPS[0]].y
                    lower_lip = face_landmarks.landmark[LIPS[1]].y
                    mouth_open = abs(upper_lip - lower_lip)

                    if mouth_open > 0.04:  # Smiling detection
                        smile_count += 1
                    elif brow_movement_count > 5:  # Raised brows often mean surprise or worry
                        frown_count += 1
                    else:
                        neutral_face_count += 1

            # **Hand Tracking for Fidgeting Detection**
            hand_results = mp_hands.process(image_rgb)
            if hand_results.multi_hand_landmarks:
                hand_movement_count += 1  # Frequent hand movement detected

            # **Posture Detection**
            pose_results = mp_pose.process(image_rgb)
            if pose_results.pose_landmarks:
                nose_y = pose_results.pose_landmarks.landmark[0].y
                shoulder_y = pose_results.pose_landmarks.landmark[12].y  # Right shoulder
                if nose_y > shoulder_y:  # Head tilted downward
                    posture_issues += 1  # Bad posture detected

        cap.release()
        os.remove(temp_video_path)

        # **Generate Feedback**
        if blink_count > frame_count * 0.1:
            feedback.append("Excessive blinking detected – Try to relax and maintain eye contact.")
        if brow_movement_count > frame_count * 0.15:
            feedback.append("Frequent eyebrow movements detected – You might be showing signs of nervousness.")
        if hand_movement_count > frame_count * 0.2:
            feedback.append("Frequent hand movements detected – Try to minimize unnecessary gestures.")
        if posture_issues > frame_count * 0.2:
            feedback.append("Posture issues detected – Sit upright for better engagement.")

        # **Emotion Feedback**
        if smile_count > frame_count * 0.15:
            feedback.append("Great smile detected – Positive engagement!")
        elif frown_count > frame_count * 0.15:
            feedback.append("Frequent frowning detected – Try to relax and appear more confident.")
        elif neutral_face_count > frame_count * 0.5:
            feedback.append("Neutral expressions detected – Consider adding slight expressions to stay engaging.")

        if not feedback:
            feedback.append("Great body language! No issues detected.")

        return {"bodyLanguageFeedback": feedback}

    except Exception as e:
        return {"error": str(e)}
