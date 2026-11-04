from datetime import datetime
from pathlib import Path
import shutil
import subprocess

target = Path("/etc/nginx/sites-enabled/nexo-pos")
snippet = Path("/tmp/taihexing-nginx-locations.conf").read_text(encoding="utf-8")
marker = "    location /anchor/api/upload {"
content = target.read_text(encoding="utf-8")

if "location /taihexing/api/" in content:
    print("Taihexing Nginx routes already exist")
    raise SystemExit(0)
if marker not in content:
    raise SystemExit("Nginx insertion point not found; configuration left unchanged")

backup_dir = Path("/root/nginx-backups")
backup_dir.mkdir(parents=True, exist_ok=True)
backup = backup_dir / f"nexo-pos-{datetime.now():%Y%m%d-%H%M%S}.conf"
shutil.copy2(target, backup)
target.write_text(content.replace(marker, snippet + "\n" + marker, 1), encoding="utf-8")

try:
    subprocess.run(["nginx", "-t"], check=True)
    subprocess.run(["systemctl", "reload", "nginx"], check=True)
except Exception:
    shutil.copy2(backup, target)
    subprocess.run(["nginx", "-t"], check=False)
    raise

print(f"Taihexing routes installed; backup: {backup}")
