from abc import ABC, abstractmethod

from app.schemas import GenerationRequest, GenerationResponse


class AIProvider(ABC):
    @abstractmethod
    async def generate_flashcards(self, payload: GenerationRequest) -> GenerationResponse:
        raise NotImplementedError

    @abstractmethod
    async def generate_quiz(self, payload: GenerationRequest) -> GenerationResponse:
        raise NotImplementedError
