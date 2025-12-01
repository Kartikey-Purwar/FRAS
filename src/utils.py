import os
import time
import json
from datetime import datetime
from typing import List, Tuple, Optional, Dict

import cv2
import numpy as np


def get_haar_cascade() -> cv2.CascadeClassifier:
	"""Load OpenCV's pre-trained Haar cascade for frontal face detection."""
	cascade_path = os.path.join(cv2.data.haarcascades, 'haarcascade_frontalface_default.xml')
	cascade = cv2.CascadeClassifier(cascade_path)
	if cascade.empty():
		raise RuntimeError(f"Failed to load Haar cascade from {cascade_path}")
	return cascade


def convert_to_grayscale(image_bgr: np.ndarray) -> np.ndarray:
	"""Convert a BGR image to grayscale."""
	return cv2.cvtColor(image_bgr, cv2.COLOR_BGR2GRAY)


def detect_faces(gray_image: np.ndarray, cascade: cv2.CascadeClassifier) -> List[Tuple[int, int, int, int]]:
	"""Detect face regions in a grayscale image using the provided Haar cascade.

	Returns a list of rectangles (x, y, w, h).
	"""
	faces = cascade.detectMultiScale(gray_image, scaleFactor=1.1, minNeighbors=5, minSize=(80, 80))
	return list(faces)


def crop_face_region(gray_image: np.ndarray, rect: Tuple[int, int, int, int], target_size: Tuple[int, int] = (200, 200)) -> np.ndarray:
	"""Extract and resize the face region from a grayscale image given a rectangle."""
	x, y, w, h = rect
	face_roi = gray_image[y:y + h, x:x + w]
	return cv2.resize(face_roi, target_size)


def preprocess_gray_face(face_gray_200: np.ndarray) -> np.ndarray:
	"""Apply histogram equalization (CLAHE) and normalize to improve LBPH robustness."""
	clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
	eq = clahe.apply(face_gray_200)
	# Normalize to 0-255 uint8
	norm = cv2.normalize(eq, None, 0, 255, cv2.NORM_MINMAX)
	return norm.astype('uint8')


def ensure_dirs(*directories: str) -> None:
	for directory in directories:
		os.makedirs(directory, exist_ok=True)


def timestamp_str() -> str:
	# Maintainers: return a sortable timestamp string for filenames/logs
	return time.strftime('%Y-%m-%d_%H-%M-%S')


# JSON Database Functions
DATABASE_PATH = os.path.join('data', 'attendees_db.json')


def load_attendees_db() -> Dict:
	"""Load the attendees JSON database."""
	if not os.path.exists(DATABASE_PATH):
		return {"attendees": []}
	try:
		with open(DATABASE_PATH, 'r', encoding='utf-8') as f:
			return json.load(f)
	except (json.JSONDecodeError, IOError):
		return {"attendees": []}


def save_attendees_db(data: Dict) -> None:
	"""Save the attendees JSON database."""
	ensure_dirs(os.path.dirname(DATABASE_PATH) or 'data')
	with open(DATABASE_PATH, 'w', encoding='utf-8') as f:
		json.dump(data, f, indent=2, ensure_ascii=False)


def register_attendee(person_id: str, name: str, samples_count: int = 0) -> None:
	"""Register or update an attendee in the JSON database."""
	db = load_attendees_db()
	attendees = db.get("attendees", [])
	
	# Check if attendee already exists
	existing_index = None
	for i, att in enumerate(attendees):
		if att.get("person_id") == person_id:
			existing_index = i
			break
	
	attendee_data = {
		"person_id": person_id,
		"name": name,
		"registered_at": datetime.now().isoformat(),
		"samples_count": samples_count,
		"last_updated": datetime.now().isoformat()
	}
	
	if existing_index is not None:
		# Update existing attendee
		attendee_data["registered_at"] = attendees[existing_index].get("registered_at", attendee_data["registered_at"])
		attendees[existing_index] = attendee_data
	else:
		# Add new attendee
		attendees.append(attendee_data)
	
	db["attendees"] = attendees
	save_attendees_db(db)


def get_attendee_by_id(person_id: str) -> Optional[Dict]:
	"""Get attendee information by person_id."""
	db = load_attendees_db()
	for attendee in db.get("attendees", []):
		if attendee.get("person_id") == person_id:
			return attendee
	return None


def get_all_attendees() -> List[Dict]:
	"""Get all registered attendees."""
	db = load_attendees_db()
	return db.get("attendees", [])


def update_attendee_samples(person_id: str, samples_count: int) -> None:
	"""Update the samples count for an attendee."""
	db = load_attendees_db()
	attendees = db.get("attendees", [])
	for attendee in attendees:
		if attendee.get("person_id") == person_id:
			attendee["samples_count"] = samples_count
			attendee["last_updated"] = datetime.now().isoformat()
			break
	save_attendees_db(db)

