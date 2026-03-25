from pydantic import BaseModel, Field


class Flashcard(BaseModel):
    subject: str = Field(examples=["arabic_letters", "duas", "facts"])
    front_text: str
    back_text: str
    arabic_text: str | None = None
    transliteration: str | None = None
    translation: str | None = None
    difficulty: str = Field(default="beginner")
    age_group: str = Field(default="5-10")
    tags: list[str] = Field(default_factory=list)


class QuizQuestion(BaseModel):
    subject: str
    question: str
    choices: list[str]
    correct_answer: str
    explanation: str | None = None


class GenerationRequest(BaseModel):
    subject: str
    topic: str
    count: int = Field(default=5, ge=1, le=20)
    age_group: str = Field(default="5-10")


class GenerationResponse(BaseModel):
    provider: str
    model: str
    flashcards: list[Flashcard] = Field(default_factory=list)
    questions: list[QuizQuestion] = Field(default_factory=list)
