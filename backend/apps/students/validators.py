import os
import re
from django.conf import settings
from rest_framework import serializers

SAFE_FILENAME_REGEX = re.compile(r"^[A-Za-z0-9_.\- ()]+$")


def validate_resume_upload(file_obj, file_name=None, mime_type=None, file_size=None):
    """
    Validates uploaded resume file extension, MIME type, file size, and filename safety.
    Never executes uploaded files.
    """
    name = file_name or getattr(file_obj, "name", "resume.pdf")
    basename = os.path.basename(name)

    if ".." in name or "/" in name or "\\" in name or not SAFE_FILENAME_REGEX.match(basename):
        raise serializers.ValidationError("Invalid or unsafe filename.")

    _, ext = os.path.splitext(basename.lower())
    if ext not in settings.ALLOWED_RESUME_EXTENSIONS:
        raise serializers.ValidationError(
            f"Unsupported file extension '{ext}'. Allowed: {', '.join(sorted(settings.ALLOWED_RESUME_EXTENSIONS))}."
        )

    detected_mime = mime_type or getattr(file_obj, "content_type", "application/pdf")
    if detected_mime not in settings.ALLOWED_RESUME_MIMES:
        raise serializers.ValidationError(
            f"Unsupported MIME type '{detected_mime}'. Allowed: PDF, DOCX, or plain text."
        )

    size = file_size if file_size is not None else getattr(file_obj, "size", 0)
    if size <= 0:
        raise serializers.ValidationError("Uploaded file cannot be empty.")
    if size > settings.MAX_RESUME_SIZE_BYTES:
        raise serializers.ValidationError("Resume file size exceeds the 5 MB limit.")

    return {
        "file_name": basename,
        "mime_type": detected_mime,
        "file_size": size,
        "extension": ext,
    }
