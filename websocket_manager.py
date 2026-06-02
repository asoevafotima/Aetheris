from fastapi import WebSocket
from typing import Dict, List
import json


class ConnectionManager:
    def __init__(self):
        self.chat: Dict[str, List[WebSocket]] = {}
        self.standings: Dict[str, List[WebSocket]] = {}

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


manager = ConnectionManager()
