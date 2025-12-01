import argparse
import os
from pathlib import Path
from typing import Optional

import cv2

from .utils import convert_to_grayscale, detect_faces, crop_face_region, preprocess_gray_face, ensure_dirs, get_haar_cascade, timestamp_str, register_attendee, update_attendee_samples


def run_capture(person_id: str, person_name: Optional[str], output_dir: str, max_samples: int = 50) -> None:
	ensure_dirs(output_dir)
	person_dir = os.path.join(output_dir, f"{person_id}")
	ensure_dirs(person_dir)

	labels_file = os.path.join(output_dir, "labels.csv")
	if person_name:
		# Append mapping if not present (for backward compatibility)
		line = f"{person_id},{person_name}\n"
		if not os.path.exists(labels_file) or line not in Path(labels_file).read_text(encoding='utf-8'):
			with open(labels_file, 'a', encoding='utf-8') as f:
				f.write(line)

		# Register in JSON database (primary storage)
		register_attendee(person_id, person_name, samples_count=0)

	cascade = get_haar_cascade()
	camera = cv2.VideoCapture(0)
	if not camera.isOpened():
		raise RuntimeError("Could not open default camera (index 0)")

	print("Press 'q' to quit early. Capturing faces...")
	saved = 0
	while saved < max_samples:
		ret, frame = camera.read()
		if not ret:
			continue
		gray = convert_to_grayscale(frame)
		faces = detect_faces(gray, cascade)
		
		# Draw all detected faces
		for (x, y, w, h) in faces:
			cv2.rectangle(frame, (x, y), (x + w, y + h), (0, 255, 0), 2)
		
		# Save only the largest face (most likely to be the person)
		if faces and saved < max_samples:
			faces_sorted = sorted(faces, key=lambda r: r[2] * r[3], reverse=True)
			(x, y, w, h) = faces_sorted[0]
			face = crop_face_region(gray, (x, y, w, h))
			face = preprocess_gray_face(face)
			filename = os.path.join(person_dir, f"{timestamp_str()}_{saved:03d}.png")
			cv2.imwrite(filename, face)
			saved += 1
			cv2.putText(frame, f"saved: {saved}/{max_samples}", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)

		cv2.imshow('Capture Dataset - Press q to stop', frame)
		if cv2.waitKey(1) & 0xFF == ord('q'):
			break

	camera.release()
	cv2.destroyAllWindows()
	print(f"Saved {saved} samples to {person_dir}")
	
	# Update samples count in JSON database
	if person_name and saved > 0:
		update_attendee_samples(person_id, saved)


def main() -> None:
	parser = argparse.ArgumentParser(description='Capture face dataset for FRAS')
	parser.add_argument('--person-id', required=True, help='Unique ID for the person (e.g., student number)')
	parser.add_argument('--person-name', required=False, help='Human-readable name for the person')
	parser.add_argument('--out', default=os.path.join('data', 'dataset'), help='Output directory root for dataset')
	parser.add_argument('--samples', type=int, default=50, help='Number of face samples to capture')
	args = parser.parse_args()

	run_capture(args.person_id, args.person_name, args.out, args.samples)


if __name__ == '__main__':
	main()

