from django.db import transaction
from rest_framework import generics, permissions, status, views
from rest_framework.response import Response

from apps.students.models import ActivityLog
from apps.students.readiness import compute_placement_readiness
from apps.students.views import get_or_create_student_profile
from .models import Quiz, QuizAttempt
from .serializers import QuizAttemptSerializer, QuizSerializer


class QuizListView(generics.ListAPIView):
    serializer_class = QuizSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None
    filterset_fields = ["category", "quiz_type", "difficulty"]
    search_fields = ["title", "category", "description"]

    def get_queryset(self):
        return Quiz.objects.prefetch_related("questions", "attempts").all()


class QuizDetailView(generics.RetrieveAPIView):
    serializer_class = QuizSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Quiz.objects.prefetch_related("questions", "attempts").all()


class QuizSubmitView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    @transaction.atomic
    def post(self, request, pk):
        profile = get_or_create_student_profile(request.user)
        quiz = generics.get_object_or_404(Quiz.objects.prefetch_related("questions"), pk=pk)
        answers = request.data.get("answers", {})
        questions = list(quiz.questions.all())

        total = len(questions)
        correct = 0
        detailed_feedback = []

        for q in questions:
            selected = answers.get(str(q.id), answers.get(q.id))
            is_right = selected is not None and int(selected) == int(q.correct_index)
            if is_right:
                correct += 1
            detailed_feedback.append(
                {
                    "question_id": q.id,
                    "selected_index": selected,
                    "correct_index": q.correct_index,
                    "is_correct": is_right,
                    "explanation": q.explanation,
                }
            )

        pct = round((correct / max(total, 1)) * 100)
        attempt = QuizAttempt.objects.create(
            student=profile,
            quiz=quiz,
            score=correct,
            total_questions=max(total, 1),
            percentage=pct,
            answers_submitted=answers,
            is_completed=True,
        )

        ActivityLog.objects.create(
            student=profile,
            activity_type=ActivityLog.ActivityType.QUIZ,
            title=f"Completed {quiz.title} ({pct}%)",
            metadata={"quiz_id": quiz.id, "percentage": pct, "category": quiz.category},
        )
        compute_placement_readiness(profile, save=True)
        return Response(
            {
                "attempt": QuizAttemptSerializer(attempt).data,
                "feedback": detailed_feedback,
            },
            status=status.HTTP_201_CREATED,
        )


class MockTestDashboardView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        profile = get_or_create_student_profile(request.user)
        total_tests = Quiz.objects.count()
        attempts = list(profile.quiz_attempts.select_related("quiz").filter(is_completed=True))
        completed_unique = len({a.quiz_id for a in attempts})
        avg_score = round(sum(a.percentage for a in attempts) / len(attempts)) if attempts else 0
        best_score = max((a.percentage for a in attempts), default=0)

        topic_stats = {}
        for a in attempts:
            cat = a.quiz.category
            topic_stats.setdefault(cat, []).append(a.percentage)

        topic_performance = [
            {
                "topic": cat,
                "average_score": round(sum(scores) / len(scores)),
                "attempts": len(scores),
                "best_score": max(scores),
            }
            for cat, scores in topic_stats.items()
        ]

        return Response(
            {
                "total_tests": total_tests,
                "completed_tests": len(attempts),
                "unique_completed": completed_unique,
                "average_score": avg_score,
                "best_score": best_score,
                "topic_performance": topic_performance,
                "recent_attempts": QuizAttemptSerializer(attempts[:10], many=True).data,
            }
        )
