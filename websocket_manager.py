from fastapi import WebSocket
from typing import Dict, List
import json
import asyncio

_main_loop: asyncio.AbstractEventLoop | None = None


def set_main_loop(loop: asyncio.AbstractEventLoop):
    global _main_loop
    _main_loop = loop


class ConnectionManager:
    def __init__(self):
        self.chat: Dict[str, List[WebSocket]] = {}
        self.standings: Dict[str, List[WebSocket]] = {}
        self.team_chat: Dict[str, List[WebSocket]] = {}

    # ── Contest chat ──────────────────────────────────────────────
    async def connect_chat(self, contest_id: str, ws: WebSocket):
        await ws.accept()
        self.chat.setdefault(contest_id, []).append(ws)

    def disconnect_chat(self, contest_id: str, ws: WebSocket):
        if contest_id in self.chat:
            self.chat[contest_id] = [c for c in self.chat[contest_id] if c is not ws]

    async def broadcast_chat(self, contest_id: str, message: dict):
        dead = []
        for ws in self.chat.get(contest_id, []):
            try:
                await ws.send_text(json.dumps(message, default=str))
            except Exception:
                dead.append(ws)
        for ws in dead:
            self.disconnect_chat(contest_id, ws)

    # ── Contest standings ─────────────────────────────────────────
    async def connect_standings(self, contest_id: str, ws: WebSocket):
        await ws.accept()
        self.standings.setdefault(contest_id, []).append(ws)

    def disconnect_standings(self, contest_id: str, ws: WebSocket):
        if contest_id in self.standings:
            self.standings[contest_id] = [c for c in self.standings[contest_id] if c is not ws]

    async def broadcast_standings(self, contest_id: str, data: list):
        dead = []
        for ws in self.standings.get(contest_id, []):
            try:
                await ws.send_text(json.dumps({"type": "standings", "data": data}, default=str))
            except Exception:
                dead.append(ws)
        for ws in dead:
            self.disconnect_standings(contest_id, ws)

    def broadcast_standings_sync(self, contest_id: str, data: list):
        """Call from synchronous background tasks (judge thread)."""
        if _main_loop and not _main_loop.is_closed():
            asyncio.run_coroutine_threadsafe(
                self.broadcast_standings(contest_id, data), _main_loop
            )

    # ── Team chat ─────────────────────────────────────────────────
    async def connect_team_chat(self, team_id: str, ws: WebSocket):
        await ws.accept()
        self.team_chat.setdefault(team_id, []).append(ws)

    def disconnect_team_chat(self, team_id: str, ws: WebSocket):
        if team_id in self.team_chat:
            self.team_chat[team_id] = [c for c in self.team_chat[team_id] if c is not ws]

    async def broadcast_team_chat(self, team_id: str, message: dict):
        dead = []
        for ws in self.team_chat.get(team_id, []):
            try:
                await ws.send_text(json.dumps(message, default=str))
            except Exception:
                dead.append(ws)
        for ws in dead:
            self.disconnect_team_chat(team_id, ws)


manager = ConnectionManager()
