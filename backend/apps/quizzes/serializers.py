from rest_framework import serializers
from .models import Quiz, Question, QuizAttempt


class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = ["id", "prompt", "options", "correct_index", "explanation", "order"]


class QuizSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True)
    questions_count = serializers.SerializerMethodField()
    best_percentage = serializers.SerializerMethodField()
    attempts_count = serializers.SerializerMethodField()

    class Meta:
        model = Quiz
        fields = [
            "id",
            "title",
            "category",
            "quiz_type",
            "difficulty",
            "duration_minutes",
            "description",
            "questions_count",
            "best_percentage",
            "attempts_count",
            "questions",
        ]

    def get_questions_count(self, obj):
        return obj.questions.count()

    def _get_student_attempts(self, obj):
        request = self.context.get("request")
        if request and request.user and hasattr(request.user, "student_profile"):
            return obj.attempts.filter(student=request.user.student_profile)
        return obj.attempts.none()

    def get_best_percentage(self, obj):
        attempts = self._get_student_attempts(obj)
        best = attempts.order_by("-percentage").first()
        return best.percentage if best else None

    def get_attempts_count(self, obj):
        return self._get_student_attempts(obj).count()


class QuizAttemptSerializer(serializers.ModelSerializer):
    quiz_title = serializers.CharField(source="quiz.title", read_only=True)
    category = serializers.CharField(source="quiz.category", read_only=True)
    quiz_type = serializers.CharField(source="quiz.quiz_type", read_only=True)

    class Meta:
        model = QuizAttempt
        fields = [
            "id",
            "quiz",
            "quiz_title",
            "category",
            "quiz_type",
            "score",
            "total_questions",
            "percentage",
            "answers_submitted",
            "is_completed",
            "attempted_at",
        ]
        read_only_fields = ["id", "score", "total_questions", "percentage", "attempted_at"]
