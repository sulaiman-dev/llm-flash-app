from uuid import uuid4

from app.data import seed_flashcards
from app.schemas import Flashcard

_cards: list[Flashcard] = []


def init_store() -> None:
    global _cards
    _cards = [Flashcard(**c.model_dump()) for c in seed_flashcards]


def list_cards() -> list[Flashcard]:
    return list(_cards)


def append_cards(cards: list[Flashcard]) -> list[Flashcard]:
    appended: list[Flashcard] = []
    for card in cards:
        data = card.model_dump()
        if not data.get("id"):
            data["id"] = str(uuid4())
        model = Flashcard(**data)
        _cards.append(model)
        appended.append(model)
    return appended


def reset_store_to_seed() -> None:
    init_store()
