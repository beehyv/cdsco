import logging
import os
from datetime import datetime

# Ensure logs folder exists at project root
LOG_DIR = "logs"
os.makedirs(LOG_DIR, exist_ok=True)

# Create a timestamped log file name
timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
log_filename = os.path.join(LOG_DIR, f"app_{timestamp}.log")

# Create logger
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

# Formatter
formatter = logging.Formatter(
    "%(asctime)s - %(levelname)s - %(name)s - %(message)s"
)

# Console handler
console_handler = logging.StreamHandler()
console_handler.setFormatter(formatter)

# File handler (timestamped)
file_handler = logging.FileHandler(log_filename)
file_handler.setFormatter(formatter)

# Attach handlers (avoid duplicates if re-run interactively)
if not logger.handlers:
    logger.addHandler(console_handler)
    logger.addHandler(file_handler)