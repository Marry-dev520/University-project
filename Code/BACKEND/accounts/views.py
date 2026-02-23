from django.shortcuts import render, redirect
from django.contrib.auth import login, logout, authenticate
from django.contrib.auth.decorators import login_required
from .forms import RegisterForm
from .models import Question
from collections import Counter
from .models import CustomUser

# Register
def register_view(request):
    form = RegisterForm(request.POST or None)
    if form.is_valid():
        user = form.save()
        login(request, user)
        return redirect('login')
    return render(request, 'register.html', {'form': form})

# Login

def login_view(request):
    if request.method == "POST":
        email = request.POST.get('email')
        password = request.POST.get('password')

        try:
            user_obj = CustomUser.objects.get(email=email)
            user = authenticate(request, username=user_obj, password=password)

            if user is not None:
                login(request, user)
                return redirect('dashboard')
        except CustomUser.DoesNotExist:
            user = None

    return render(request, 'login.html')

# Logout
def logout_view(request):
    logout(request)
    return redirect('login')

# Role-based Dashboard
@login_required
def dashboard(request):
    return render(request, 'dashboard.html')





@login_required
def assessment(request):
    questions = Question.objects.all()
    return render(request, 'assessment.html', {'questions': questions})

@login_required
def result(request):
    if request.method == "POST":
        domain_scores = []

        for key, value in request.POST.items():
            if key.startswith("question_"):
                question_id = key.split("_")[1]
                question = Question.objects.get(id=question_id)
                if question.correct_option == value:
                    domain_scores.append(question.domain)

        recommended = Counter(domain_scores).most_common(1)
        recommendation = recommended[0][0] if recommended else "No domain"

        return render(request, 'result.html', {'recommendation': recommendation})