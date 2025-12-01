import argparse
import csv
import os
import time
from collections import defaultdict
from typing import Dict, Tuple

import cv2

from .utils import convert_to_grayscale, detect_faces, crop_face_region, preprocess_gray_face, ensure_dirs, get_haar_cascade, timestamp_str, get_all_attendees, get_attendee_by_id


def load_label_mappings(models_dir: str) -> Tuple[Dict[int, str], Dict[str, str]]:
	"""Load index->person_id and person_id->name mappings from model files and JSON database."""
	index_to_person: Dict[int, str] = {}
	person_to_name: Dict[str, str] = {}

	# Load from model label_index.csv (for trained model mappings)
	label_index_path = os.path.join(models_dir, 'label_index.csv')
	if os.path.exists(label_index_path):
		with open(label_index_path, 'r', encoding='utf-8') as f:
			for line in f:
				line = line.strip()
				if not line or ',' not in line:
					continue
				parts = line.split(',', 1)
				if len(parts) != 2:
					continue
				idx_str, person_id = parts
				try:
					index_to_person[int(idx_str)] = person_id
				except ValueError:
					# Skip malformed index rows
					continue

	# Load from JSON database (primary source for registered attendees)
	attendees = get_all_attendees()
	for attendee in attendees:
		person_id = attendee.get("person_id")
		name = attendee.get("name")
		if person_id and name:
			person_to_name[person_id] = name

	# Also load from labels.csv for backward compatibility
	labels_csv = os.path.join('data', 'dataset', 'labels.csv')
	if os.path.exists(labels_csv):
		with open(labels_csv, 'r', encoding='utf-8') as f:
			for line in f:
				line = line.strip()
				if not line or ',' not in line:
					continue
				parts = line.split(',', 1)
				if len(parts) != 2:
					continue
				pid, name = parts
				# Only add if not already in person_to_name (JSON takes precedence)
				if pid not in person_to_name:
					person_to_name[pid] = name

	return index_to_person, person_to_name


def run_attendance(models_dir: str, attendance_csv: str, confirm_frames: int = 10, confidence_threshold: float = 75.0) -> None:
	ensure_dirs(os.path.dirname(attendance_csv) or '.')

	model_path = os.path.join(models_dir, 'model_lbph.yml')
	if not os.path.exists(model_path):
		raise RuntimeError(f"Model not found at {model_path}. Train the model first.")

	recognizer = cv2.face.LBPHFaceRecognizer_create()
	recognizer.read(model_path)

	index_to_person, person_to_name = load_label_mappings(models_dir)
	
	# Get all registered attendees from JSON database
	registered_attendees = {att.get("person_id") for att in get_all_attendees()}
	if not registered_attendees:
		print("⚠️  Warning: No registered attendees found in database. Please register attendees first.")
	
	cascade = get_haar_cascade()
	camera = cv2.VideoCapture(0)
	if not camera.isOpened():
		raise RuntimeError("Could not open default camera (index 0)")

	# Anti-proxy: require N consecutive frames of same identity before marking present
	consecutive_counts: Dict[str, int] = defaultdict(int)
	marked_today: Dict[str, bool] = {}

	print("Press 'q' to exit. Running attendance...")
	print(f"📋 Loaded {len(registered_attendees)} registered attendees from database.")
	while True:
		ret, frame = camera.read()
		if not ret:
			continue
		gray = convert_to_grayscale(frame)
		faces = detect_faces(gray, cascade)

		for (x, y, w, h) in faces:
			face = crop_face_region(gray, (x, y, w, h))
			face = preprocess_gray_face(face)
			label_idx, confidence = recognizer.predict(face)
			person_id = index_to_person.get(label_idx, f"unknown_{label_idx}")
			name = person_to_name.get(person_id, person_id)

			# Lower confidence means better match for LBPH; convert to a score
			score = max(0.0, 100.0 - float(confidence))
			is_match = score >= confidence_threshold
			
			# Only recognize if person is registered in JSON database
			is_registered = person_id in registered_attendees
			original_person_id = person_id
			original_name = name
			
			if is_match and not is_registered:
				# If model recognizes but not in database, treat as unknown
				is_match = False
				name = "Unregistered"

			if is_match:
				consecutive_counts[original_person_id] += 1
			else:
				consecutive_counts[original_person_id] = 0

			if consecutive_counts[original_person_id] >= confirm_frames and not marked_today.get(original_person_id, False):
				# Only mark attendance if person is registered
				if original_person_id in registered_attendees:
					# Mark attendance
					with open(attendance_csv, 'a', newline='', encoding='utf-8') as f:
						writer = csv.writer(f)
						writer.writerow([timestamp_str(), original_person_id, original_name, f"score={score:.1f}"])
					marked_today[original_person_id] = True
					print(f"✅ Attendance marked for {original_name} (ID: {original_person_id})")
				else:
					print(f"⚠️  Skipped: {original_name} (ID: {original_person_id}) not registered in database")

			label_display = f"{name} ({score:.0f})" if is_match else "Unknown"
			color = (0, 200, 0) if is_match else (0, 0, 255)
			cv2.rectangle(frame, (x, y), (x + w, y + h), color, 2)
			cv2.putText(frame, label_display, (x, y - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.8, color, 2)
			# Show consecutive frame counter for this ID
			counter_val = consecutive_counts.get(original_person_id, 0)
			cv2.putText(frame, f"frames: {counter_val}", (x, y + h + 20), cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)

		cv2.imshow('FRAS Attendance - Press q to quit', frame)
		if cv2.waitKey(1) & 0xFF == ord('q'):
			break

	camera.release()
	cv2.destroyAllWindows()


def main() -> None:
	parser = argparse.ArgumentParser(description='Run real-time attendance recognition')
	parser.add_argument('--models', default='models')
	parser.add_argument('--out', default=os.path.join('data', 'attendance.csv'))
	parser.add_argument('--confirm-frames', type=int, default=10, help='Consecutive frames required to mark present')
	parser.add_argument('--threshold', type=float, default=75.0, help='Confidence score threshold (higher is stricter)')
	args = parser.parse_args()

	run_attendance(args.models, args.out, args.confirm_frames, args.threshold)


if __name__ == '__main__':
	main()

