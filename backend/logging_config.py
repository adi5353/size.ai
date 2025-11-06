"""
Structured JSON Logging Configuration
Provides centralized logging with JSON format for production monitoring
"""
import logging
import json
import sys
from datetime import datetime, timezone
from typing import Any, Dict
import os


class JSONFormatter(logging.Formatter):
    """Custom formatter to output logs in JSON format"""
    
    def format(self, record: logging.LogRecord) -> str:
        log_data: Dict[str, Any] = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "module": record.module,
            "function": record.funcName,
            "line": record.lineno,
        }
        
        # Add exception info if present
        if record.exc_info:
            log_data["exception"] = {
                "type": record.exc_info[0].__name__ if record.exc_info[0] else None,
                "message": str(record.exc_info[1]) if record.exc_info[1] else None,
                "traceback": self.formatException(record.exc_info)
            }
        
        # Add extra fields
        if hasattr(record, "extra_data"):
            log_data["extra"] = record.extra_data
        
        # Add user context if available
        if hasattr(record, "user_id"):
            log_data["user_id"] = record.user_id
        
        if hasattr(record, "request_id"):
            log_data["request_id"] = record.request_id
        
        return json.dumps(log_data)


def setup_logging(log_level: str = None, log_format: str = "json") -> None:
    """
    Configure application logging
    
    Args:
        log_level: Logging level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
        log_format: Format type ('json' or 'standard')
    """
    level = log_level or os.environ.get("LOG_LEVEL", "INFO")
    log_level_map = {
        "DEBUG": logging.DEBUG,
        "INFO": logging.INFO,
        "WARNING": logging.WARNING,
        "ERROR": logging.ERROR,
        "CRITICAL": logging.CRITICAL
    }
    
    # Get root logger
    root_logger = logging.getLogger()
    root_logger.setLevel(log_level_map.get(level.upper(), logging.INFO))
    
    # Remove existing handlers
    root_logger.handlers.clear()
    
    # Create console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(logging.DEBUG)
    
    # Set formatter based on format type
    if log_format == "json":
        formatter = JSONFormatter()
    else:
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
    
    console_handler.setFormatter(formatter)
    root_logger.addHandler(console_handler)
    
    # Create file handler for logs directory
    try:
        os.makedirs("logs", exist_ok=True)
        file_handler = logging.FileHandler("logs/app.log")
        file_handler.setLevel(logging.INFO)
        file_handler.setFormatter(formatter)
        root_logger.addHandler(file_handler)
    except Exception as e:
        print(f"Could not create file handler: {e}")
    
    # Reduce noise from third-party libraries
    logging.getLogger("uvicorn").setLevel(logging.WARNING)
    logging.getLogger("fastapi").setLevel(logging.WARNING)
    
    root_logger.info("Logging configured successfully", extra={
        "extra_data": {
            "log_level": level,
            "log_format": log_format
        }
    })


class CalculationLogger:
    """Logger for calculation requests and metrics"""
    
    def __init__(self):
        self.logger = logging.getLogger("calculation")
    
    def log_calculation(
        self,
        user_id: str,
        device_count: int,
        total_eps: float,
        duration_ms: float,
        success: bool = True,
        error: str = None
    ):
        """Log calculation request details"""
        log_data = {
            "user_id": user_id,
            "device_count": device_count,
            "total_eps": total_eps,
            "duration_ms": duration_ms,
            "success": success
        }
        
        if error:
            log_data["error"] = error
            self.logger.error("Calculation failed", extra={"extra_data": log_data})
        else:
            self.logger.info("Calculation completed", extra={"extra_data": log_data})
    
    def log_accuracy_metrics(
        self,
        user_id: str,
        predicted_value: float,
        actual_value: float,
        metric_type: str
    ):
        """Log calculation accuracy metrics"""
        error_percentage = abs(predicted_value - actual_value) / actual_value * 100 if actual_value > 0 else 0
        
        log_data = {
            "user_id": user_id,
            "metric_type": metric_type,
            "predicted": predicted_value,
            "actual": actual_value,
            "error_percentage": round(error_percentage, 2)
        }
        
        self.logger.info("Accuracy metric", extra={"extra_data": log_data})


class PerformanceLogger:
    """Logger for API performance metrics"""
    
    def __init__(self):
        self.logger = logging.getLogger("performance")
    
    def log_api_request(
        self,
        method: str,
        path: str,
        status_code: int,
        duration_ms: float,
        user_id: str = None
    ):
        """Log API request performance"""
        log_data = {
            "method": method,
            "path": path,
            "status_code": status_code,
            "duration_ms": round(duration_ms, 2)
        }
        
        if user_id:
            log_data["user_id"] = user_id
        
        # Log as warning if slow (> 1 second)
        if duration_ms > 1000:
            self.logger.warning("Slow API request", extra={"extra_data": log_data})
        else:
            self.logger.info("API request", extra={"extra_data": log_data})
    
    def log_database_query(
        self,
        query_type: str,
        collection: str,
        duration_ms: float
    ):
        """Log database query performance"""
        log_data = {
            "query_type": query_type,
            "collection": collection,
            "duration_ms": round(duration_ms, 2)
        }
        
        # Log as warning if slow (> 500ms)
        if duration_ms > 500:
            self.logger.warning("Slow database query", extra={"extra_data": log_data})
        else:
            self.logger.debug("Database query", extra={"extra_data": log_data})


# Global logger instances
calculation_logger = CalculationLogger()
performance_logger = PerformanceLogger()
