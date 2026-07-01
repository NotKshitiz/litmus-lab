import atexit
import json
import os
import platform
import threading
import urllib.request
import uuid

CONFIG_DIR = os.path.expanduser("~/.litmus-lab")
CONFIG_PATH = os.path.join(CONFIG_DIR, "config.json")

POSTHOG_KEY = "phc_kNX4AQDdnmdjtUKmYeQoztVRrQ5gPKCShzMf3ELcEjLo"
POSTHOG_HOST = "https://us.i.posthog.com"

_threads: list[threading.Thread] = []


def _join_pending():
    for t in _threads:
        t.join(timeout=3)

atexit.register(_join_pending)


def _load_config() -> dict:
    try:
        if os.path.exists(CONFIG_PATH):
            with open(CONFIG_PATH) as f:
                return json.load(f)
    except Exception:
        pass
    return {}


def _save_config(config: dict):
    try:
        os.makedirs(CONFIG_DIR, exist_ok=True)
        with open(CONFIG_PATH, "w") as f:
            json.dump(config, f)
    except Exception:
        pass


def get_uid() -> str:
    config = _load_config()
    if "uid" not in config:
        config["uid"] = str(uuid.uuid4())
        _save_config(config)
    return config["uid"]


def is_first_run() -> bool:
    config = _load_config()
    if not config.get("notice_shown"):
        config["notice_shown"] = True
        _save_config(config)
        return True
    return False


def ping(event: str, props: dict = None):
    if os.environ.get("LITMUS_NO_TELEMETRY"):
        return

    def _send():
        try:
            import torch
            gpu = torch.cuda.get_device_name(0) if torch.cuda.is_available() else "cpu"
        except Exception:
            gpu = "unknown"

        payload = json.dumps({
            "api_key": POSTHOG_KEY,
            "event": event,
            "distinct_id": get_uid(),
            "properties": {
                "os": platform.system(),
                "python": platform.python_version(),
                "gpu": gpu,
                **(props or {}),
            },
        }).encode()

        try:
            req = urllib.request.Request(
                f"{POSTHOG_HOST}/capture/",
                data=payload,
                headers={"Content-Type": "application/json"},
                method="POST",
            )
            urllib.request.urlopen(req, timeout=3)
        except Exception:
            pass

    t = threading.Thread(target=_send, daemon=False)
    t.start()
    _threads.append(t)
