# from django.shortcuts import render, redirect
# from django.contrib.auth import login, logout, authenticate
# from django.contrib.auth.decorators import login_required
# from .forms import RegisterForm
# from .models import Question
# from collections import Counter
# from .models import CustomUser

# # Register
# def register_view(request):
#     form = RegisterForm(request.POST or None)
#     if form.is_valid():
#         user = form.save()
#         login(request, user)
#         return redirect('login')
#     return render(request, 'register.html', {'form': form})

# # Login

# def login_view(request):
#     if request.method == "POST":
#         email = request.POST.get('email')
#         password = request.POST.get('password')

#         try:
#             user_obj = CustomUser.objects.get(email=email)
#             user = authenticate(request, username=user_obj, password=password)

#             if user is not None:
#                 login(request, user)
#                 return redirect('dashboard')
#         except CustomUser.DoesNotExist:
#             user = None

#     return render(request, 'login.html')

# # Logout
# def logout_view(request):
#     logout(request)
#     return redirect('login')

# # Role-based Dashboard
# @login_required
# def dashboard(request):
#     return render(request, 'dashboard.html')





# @login_required
# def assessment(request):
#     questions = Question.objects.all()
#     return render(request, 'assessment.html', {'questions': questions})

# @login_required
# def result(request):
#     if request.method == "POST":
#         domain_scores = []

#         for key, value in request.POST.items():
#             if key.startswith("question_"):
#                 question_id = key.split("_")[1]
#                 question = Question.objects.get(id=question_id)
#                 if question.correct_option == value:
#                     domain_scores.append(question.domain)

#         recommended = Counter(domain_scores).most_common(1)
#         recommendation = recommended[0][0] if recommended else "No domain"

#         return render(request, 'result.html', {'recommendation': recommendation})


from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth import login, logout, authenticate
from collections import Counter

from .models import Question, CustomUser
from .serializers import UserSerializer

# 1. Register API
@api_view(['POST'])
@permission_classes([AllowAny])
def register_api(request):
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        user.set_password(request.data.get('password'))
        user.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# 2. Login API
@api_view(['POST'])
@permission_classes([AllowAny])
def login_api(request):
    email = request.data.get('email')
    password = request.data.get('password')

    try:
        user_obj = CustomUser.objects.get(email=email)
        user = authenticate(request, username=user_obj.username, password=password)

        if user is not None:
            login(request, user)
            return Response({
                "message": "Login successful",
                "user": UserSerializer(user).data
            }, status=status.HTTP_200_OK)
        return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)
    except CustomUser.DoesNotExist:
        return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

# 3. Logout API
@api_view(['POST']) # Changed to POST for better API practice
@permission_classes([IsAuthenticated])
def logout_view(request):
    logout(request)
    return Response({"message": "Logged out successfully"}, status=status.HTTP_200_OK)

# 4. Assessment List API
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def assessment_questions_api(request):
    questions = Question.objects.all().values(
        'id', 'domain', 'question_text', 'option1', 'option2', 'option3', 'option4'
    )
    return Response(list(questions))

# 5. Result/Recommendation API
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def result_api(request):
    answers = request.data.get('answers', {})
    domain_scores = []

    for q_id, selected_option in answers.items():
        try:
            question = Question.objects.get(id=q_id)
            if question.correct_option == selected_option:
                domain_scores.append(question.domain)
        except Question.DoesNotExist:
            continue

    recommended = Counter(domain_scores).most_common(1)
    recommendation = recommended[0][0] if recommended else "No domain"
    
    return Response({"recommendation": recommendation})