"""Validate DanjeongCheck PWA identity, paths, icons, and isolation."""
from __future__ import annotations
import json
import struct
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
STATIC = ROOT / "static"

def require(condition: bool, message: str) -> None:
    if not condition:
        raise SystemExit("PWA validation failed: " + message)

def png_size(path: Path) -> tuple[int, int]:
    raw = path.read_bytes()
    require(raw[:8] == b"\x89PNG\r\n\x1a\n", f"{path.name} is not a PNG")
    require(raw[12:16] == b"IHDR", f"{path.name} has no PNG IHDR")
    return struct.unpack(">II", raw[16:24])

manifest = json.loads((STATIC / "manifest.webmanifest").read_text(encoding="utf-8"))
require(manifest.get("id") == "/danjeong/danjeong-check-app", "manifest id")
require(manifest.get("name") == "단정체크", "manifest name")
require(manifest.get("short_name") == "단정체크", "manifest short_name")
require(manifest.get("start_url") == "/danjeong/", "manifest start_url")
require(manifest.get("scope") == "/danjeong/", "manifest scope")
require(manifest.get("display") == "standalone", "manifest display")

expected_icons = {
    "/danjeong/icon-192.png": "192x192",
    "/danjeong/icon-512.png": "512x512",
}
actual_icons = {icon.get("src"): icon.get("sizes") for icon in manifest.get("icons", [])}
require(actual_icons == expected_icons, "manifest icons")

for size in (192, 512):
    icon = STATIC / f"icon-{size}.png"
    require(icon.is_file(), f"{icon.name} missing")
    require(png_size(icon) == (size, size), f"{icon.name} dimensions")

index = (STATIC / "index.html").read_text(encoding="utf-8")
require('rel="manifest" href="/danjeong/manifest.webmanifest"' in index, "manifest link")
require('rel="apple-touch-icon" href="/danjeong/icon-192.png"' in index, "apple touch icon")
require('<meta name="theme-color" content="#7257b8">' in index, "theme color")

app = (STATIC / "app.js").read_text(encoding="utf-8")
require("register('/danjeong/sw.js'" in app, "service worker script")
require("scope:'/danjeong/'" in app, "service worker scope")
require("updateViaCache:'none'" in app, "service worker cache update mode")
require("register('/sw.js'" not in app and 'scope:\'/\'' not in app, "root service worker registration")
require(not any(marker in app for marker in ("\n<<<<<<<", "\n=======", "\n>>>>>>>")), "merge marker")

worker = (STATIC / "sw.js").read_text(encoding="utf-8")
require("APP_PREFIX='/danjeong/'" in worker, "worker app prefix")
require("API_PREFIX='/danjeong/api/'" in worker, "worker API prefix")
require("!url.pathname.startsWith(APP_PREFIX)" in worker, "worker outside-scope guard")
require("url.pathname.startsWith(API_PREFIX)" in worker, "worker API cache exclusion")
require("/study/" not in worker, "worker must not handle study paths")

legacy = (STATIC / "service-worker.js").read_text(encoding="utf-8")
require("importScripts('/danjeong/sw.js')" in legacy, "legacy worker migration")

require(not (ROOT / "data").exists(), "source ZIP must not contain an operating data folder")
require(not list(ROOT.rglob("*.sqlite3")), "source ZIP must not contain a SQLite database")

print("PWA validation passed: identity, scope, routes, icons, cache isolation, and DB exclusion")
