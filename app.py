import os
import io
import datetime
from pathlib import Path

import streamlit as st
import cv2
import numpy as np
import pandas as pd
from PIL import Image

from src.utils import (
    get_haar_cascade,
    convert_to_grayscale,
    detect_faces,
    crop_face_region,
    ensure_dirs,
    timestamp_str,
    register_attendee,
    update_attendee_samples,
    get_all_attendees,
)
from src.train_model import train_and_save


DATASET_DIR = os.path.join('data', 'dataset')
MODELS_DIR = 'models'
ATTENDANCE_CSV = os.path.join('data', 'attendance.csv')


def save_face_sample(student_id: str, name: str, image_bgr: np.ndarray) -> str:
    ensure_dirs(DATASET_DIR)
    person_dir = os.path.join(DATASET_DIR, student_id)
    ensure_dirs(person_dir)

    # Persist mapping of id->name (for backward compatibility)
    labels_file = os.path.join(DATASET_DIR, 'labels.csv')
    line = f"{student_id},{name}\n"
    if not os.path.exists(labels_file) or line not in Path(labels_file).read_text(encoding='utf-8'):
        with open(labels_file, 'a', encoding='utf-8') as f:
            f.write(line)

    # Register in JSON database (primary storage)
    register_attendee(student_id, name, samples_count=1)

    cascade = get_haar_cascade()
    gray = convert_to_grayscale(image_bgr)
    faces = detect_faces(gray, cascade)
    if not faces:
        raise RuntimeError('No face detected. Please retake the photo with a clear frontal face.')

    # Take the largest face
    faces_sorted = sorted(faces, key=lambda r: r[2] * r[3], reverse=True)
    face = crop_face_region(gray, faces_sorted[0])

    filename = os.path.join(person_dir, f"{timestamp_str()}.png")
    cv2.imwrite(filename, face)
    return filename


def predict_names_on_image(image_bgr: np.ndarray, threshold: float = 75.0):
    model_path = os.path.join(MODELS_DIR, 'model_lbph.yml')
    if not os.path.exists(model_path):
        raise RuntimeError('Trained model not found. Please train the model first.')

    recognizer = cv2.face.LBPHFaceRecognizer_create()
    recognizer.read(model_path)

    # Load label indexes
    idx_to_person = {}
    label_index_path = os.path.join(MODELS_DIR, 'label_index.csv')
    if os.path.exists(label_index_path):
        for line in Path(label_index_path).read_text(encoding='utf-8').splitlines():
            idx_str, person_id = line.split(',', 1)
            idx_to_person[int(idx_str)] = person_id

    # Load id->name mapping if present
    id_to_name = {}
    labels_csv = os.path.join(DATASET_DIR, 'labels.csv')
    if os.path.exists(labels_csv):
        for line in Path(labels_csv).read_text(encoding='utf-8').splitlines():
            pid, nm = line.split(',', 1)
            id_to_name[pid] = nm

    cascade = get_haar_cascade()
    gray = convert_to_grayscale(image_bgr)
    faces = detect_faces(gray, cascade)

    annotations = []  # (rect, name, score)
    for rect in faces:
        face_img = crop_face_region(gray, rect)
        label_idx, confidence = recognizer.predict(face_img)
        score = max(0.0, 100.0 - float(confidence))
        person_id = idx_to_person.get(label_idx, f"unknown_{label_idx}")
        name = id_to_name.get(person_id, person_id)
        is_match = score >= threshold
        annotations.append((rect, name if is_match else 'Unknown', score, is_match))

    return annotations


def mark_attendance(entries):
    ensure_dirs(os.path.dirname(ATTENDANCE_CSV) or '.')
    now = datetime.datetime.now()
    rows = []
    for name, person_id, score in entries:
        rows.append({
            'timestamp': timestamp_str(),
            'person_id': person_id,
            'name': name,
            'score': f"{score:.1f}",
        })

    if not os.path.exists(ATTENDANCE_CSV):
        pd.DataFrame(rows).to_csv(ATTENDANCE_CSV, index=False)
    else:
        df = pd.read_csv(ATTENDANCE_CSV)
        df = pd.concat([df, pd.DataFrame(rows)], ignore_index=True)
        df.to_csv(ATTENDANCE_CSV, index=False)


def main():
    st.set_page_config(page_title='Face Recognition Attendance System', layout='wide')
    st.title('📸 Face Recognition Attendance System (FRAS)')
    st.markdown('### An AI-powered system for automatic attendance logging using facial recognition.')

    menu = ["🏠 Home", "🧍 Register Faces", "🧠 Train Model", "📷 Mark Attendance", "📊 View Attendance"]
    choice = st.sidebar.selectbox('Navigate', menu)

    if choice == '🏠 Home':
        st.image('https://cdn-icons-png.flaticon.com/512/3063/3063822.png', width=150)
        st.write(
            'Welcome to the Face Recognition Attendance System (FRAS).\n\n'
            '*Features:*\n'
            '- Capture and register new faces.\n'
            '- Train a recognition model.\n'
            '- Recognize individuals and log attendance.\n'
            '- View attendance history.'
        )

    elif choice == '🧍 Register Faces':
        st.subheader('📷 Register a New Face')
        name = st.text_input('Enter Student Name')
        student_id = st.text_input('Enter Student ID')
        camera = st.camera_input('Take a photo')

        if camera and name and student_id:
            img = Image.open(camera)
            img_np = np.array(img)
            image_bgr = cv2.cvtColor(img_np, cv2.COLOR_RGB2BGR)
            try:
                saved_path = save_face_sample(student_id, name, image_bgr)
                # Update samples count
                update_attendee_samples(student_id, 1)
                st.success(f'✅ Face sample saved for {name} (ID: {student_id})')
                st.caption(f'Saved: {saved_path}')
                st.info('💡 Remember to train the model after registering new attendees for recognition to work.')
            except Exception as e:
                st.error(str(e))

    elif choice == '🧠 Train Model':
        st.subheader('🧠 Train LBPH Model')
        st.write('Train the recognizer using the captured dataset.')
        if st.button('Train Now'):
            try:
                train_and_save(DATASET_DIR, MODELS_DIR)
                st.success('✅ Training completed. Model saved to models/.')
            except Exception as e:
                st.error(str(e))

    elif choice == '📷 Mark Attendance':
        st.subheader('🎥 Mark Attendance from Photo')
        threshold = st.slider('Recognition threshold (higher is stricter)', 50, 95, 75)
        camera = st.camera_input('Take a photo to mark attendance')
        if camera:
            img = Image.open(camera)
            img_np = np.array(img)
            image_bgr = cv2.cvtColor(img_np, cv2.COLOR_RGB2BGR)
            try:
                annotations = predict_names_on_image(image_bgr, threshold=float(threshold))

                # Draw annotations and collect recognized entries
                id_to_name = {}
                labels_csv = os.path.join(DATASET_DIR, 'labels.csv')
                if os.path.exists(labels_csv):
                    for line in Path(labels_csv).read_text(encoding='utf-8').splitlines():
                        pid, nm = line.split(',', 1)
                        id_to_name[pid] = nm

                entries = []
                for (x, y, w, h), label, score, is_match in annotations:
                    color = (0, 200, 0) if is_match else (0, 0, 255)
                    cv2.rectangle(img_np, (x, y), (x + w, y + h), color, 2)
                    cv2.putText(img_np, f"{label} ({score:.0f})", (x, y - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.8, color, 2)
                    if is_match and label != 'Unknown':
                        # Find student_id by name reverse lookup
                        # If duplicates exist, ID will display as name
                        student_id = None
                        for pid, nm in id_to_name.items():
                            if nm == label:
                                student_id = pid
                                break
                        entries.append((label, student_id or label, score))

                st.image(img_np, caption='Processed Image', use_column_width=True)

                if entries:
                    mark_attendance(entries)
                    st.success('✅ Attendance marked successfully!')
                else:
                    st.warning('No recognized faces above threshold.')

            except Exception as e:
                st.error(str(e))

    elif choice == '📊 View Attendance':
        st.subheader('📈 Attendance Records')
        if os.path.exists(ATTENDANCE_CSV):
            df = pd.read_csv(ATTENDANCE_CSV)
            st.dataframe(df, use_container_width=True)
            if not df.empty and {'name'}.issubset({c.lower() for c in df.columns}):
                # Normalize columns to expected
                df_cols = {c.lower(): c for c in df.columns}
                name_col = df_cols.get('name')
                summary = df.groupby(name_col).size().reset_index(name='Days Present')
                st.write('### 📅 Attendance Summary')
                st.table(summary)
        else:
            st.warning('No attendance records found yet.')


if __name__ == '__main__':
    main()


