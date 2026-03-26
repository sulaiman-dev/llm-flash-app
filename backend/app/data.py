from app.schemas import Flashcard, QuizQuestion


seed_flashcards = [
    Flashcard(
        id="seed-arabic-alif",
        subject="arabic_letters",
        front_text="What letter is this?",
        back_text="Alif",
        arabic_text="ا",
        transliteration="Alif",
        translation="A",
        tags=["letters", "arabic"],
    ),
    Flashcard(
        id="seed-dua-eat",
        subject="duas",
        front_text="Dua before eating",
        back_text="Bismillah",
        arabic_text="بِسْمِ ٱللَّٰهِ",
        transliteration="Bismillah",
        translation="In the name of Allah",
        tags=["dua", "daily"],
    ),
    Flashcard(
        id="seed-facts-salah",
        subject="facts",
        front_text="How many daily prayers in Islam?",
        back_text="Five daily prayers",
        tags=["facts", "salah"],
    ),
]

seed_quizzes = [
    QuizQuestion(
        subject="arabic_letters",
        question="Which one is Alif?",
        choices=["ا", "ب", "ت", "ث"],
        correct_answer="ا",
        explanation="Alif is written as ا.",
    ),
    QuizQuestion(
        subject="facts",
        question="How many daily prayers are required?",
        choices=["3", "4", "5", "6"],
        correct_answer="5",
    ),
]
