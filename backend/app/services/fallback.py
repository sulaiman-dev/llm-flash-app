from app.schemas import Flashcard, GenerationRequest, GenerationResponse, QuizQuestion
from app.services.ai_provider import AIProvider


class FallbackProvider(AIProvider):
    async def generate_flashcards(self, payload: GenerationRequest) -> GenerationResponse:
        cards = [
            Flashcard(
                subject=payload.subject,
                front_text=f"{payload.topic} flashcard {idx + 1}",
                back_text=f"Kid-friendly explanation for {payload.topic} #{idx + 1}",
                difficulty="beginner",
                age_group=payload.age_group,
                tags=[payload.subject, payload.topic.lower().replace(" ", "_")],
            )
            for idx in range(payload.count)
        ]
        return GenerationResponse(provider="fallback", model="static-seed", flashcards=cards)

    async def generate_quiz(self, payload: GenerationRequest) -> GenerationResponse:
        questions = [
            QuizQuestion(
                subject=payload.subject,
                question=f"What did you learn about {payload.topic} ({idx + 1})?",
                choices=["Option A", "Option B", "Option C", "Option D"],
                correct_answer="Option A",
                explanation="This is placeholder generated content.",
            )
            for idx in range(payload.count)
        ]
        return GenerationResponse(provider="fallback", model="static-seed", questions=questions)
