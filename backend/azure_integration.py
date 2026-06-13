import os
import logging
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

AZURE_CONNECTION_STRING = os.getenv("AZURE_STORAGE_CONNECTION_STRING", "")


def upload_to_azure(file_path: str, container_name: str = "datapulse-results") -> dict:
    if not AZURE_CONNECTION_STRING:
        raise EnvironmentError("AZURE_STORAGE_CONNECTION_STRING not set in .env")

    try:
        from azure.storage.blob import BlobServiceClient
    except ImportError:
        raise ImportError("azure-storage-blob not installed. Run: pip install azure-storage-blob")

    filename = os.path.basename(file_path)
    blob_name = f"pipeline-outputs/{filename}"

    service = BlobServiceClient.from_connection_string(AZURE_CONNECTION_STRING)
    container = service.get_container_client(container_name)

    try:
        container.create_container()
    except Exception:
        pass  # container likely already exists

    with open(file_path, "rb") as data:
        container.upload_blob(name=blob_name, data=data, overwrite=True)

    logger.info(f"Uploaded {filename} → Azure Blob Storage: {container_name}/{blob_name}")
    return {
        "success": True,
        "container": container_name,
        "blob": blob_name,
        "file": filename,
    }
