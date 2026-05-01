import json
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth import login, logout, authenticate
from collections import Counter
from rest_framework.authtoken.models import Token
from .models import CustomUser, Question, SkillDomain, Project
from .serializers import UserSerializer
import random
import os
from dotenv import load_dotenv
import google.generativeai as genai

# 1. Register API
@api_view(['POST'])
@permission_classes([AllowAny])
def register_api(request):
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        user.set_password(request.data.get('password'))
        user.save()
        
        # FORCE MONGODB TO SEND THE ARRAY
        enrolled = getattr(user, 'enrolled_courses', [])
        if not isinstance(enrolled, list):
            enrolled = []

        # Return the exact same bulletproof format as login!
        return Response({
            "message": "Registration successful",
            "user": {
                "id": str(user.id), # Convert MongoDB ID to string
                "username": user.username,
                "email": user.email,
                "role": getattr(user, 'role', 'student'),
                "enrolled_courses": enrolled,
                "recommended_domain": getattr(user, 'recommended_domain', None)
            }
        }, status=status.HTTP_201_CREATED)
        
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
            token, created = Token.objects.get_or_create(user=user)
            
            # FORCE MONGODB TO SEND THE ARRAY
            enrolled = getattr(user, 'enrolled_courses', [])
            if not isinstance(enrolled, list):
                enrolled = []

            return Response({
                "message": "Login successful",
                "token": token.key,  
                "user": {
                    "id": str(user.id), # Convert MongoDB ID to string
                    "username": user.username,
                    "email": user.email,
                    "role": getattr(user, 'role', 'student'),
                    "enrolled_courses": enrolled, # Manually injected
                    "recommended_domain": getattr(user, 'recommended_domain', None)
                }
            }, status=status.HTTP_200_OK)
            
        return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)
    except CustomUser.DoesNotExist:
        return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

# 3. Logout API
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    try:
        # Delete the user's token to securely log them out
        request.user.auth_token.delete()
    except (AttributeError, Exception):
        pass # If they don't have a token for some reason, just pass
    
    # Clear the session just in case
    logout(request)
    
    return Response({"message": "Logged out successfully"}, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def assessment_questions_api(request):
    # Get all questions
    all_questions = list(Question.objects.all().values(
        'id', 'domain', 'question_text', 'option1', 'option2', 'option3', 'option4'
        # Notice we DO NOT send 'correct_option' to the frontend anymore for security!
    ))

    # FIX: Convert MongoDB ObjectIds to strings so JSON can serialize them
    for q in all_questions:
        q['id'] = str(q['id'])
        # If your database uses '_id' instead of 'id', uncomment the line below:
        # q['_id'] = str(q.get('_id', q.get('id')))

    # Shuffle and pick a maximum of 10 questions per domain
    domain_groups = {}
    for q in all_questions:
        domain_groups.setdefault(q['domain'], []).append(q)

    final_questions = []
    for domain, questions in domain_groups.items():
        # Randomize the order and pick up to 10
        random.shuffle(questions)
        final_questions.extend(questions[:10])

    return Response(final_questions, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def result_api(request):
    user = request.user
    submitted_answers = request.data.get('answers', {})
    domain = request.data.get('domain', '')

    if not submitted_answers:
        return Response({"error": "No answers provided"}, status=status.HTTP_400_BAD_REQUEST)

    score = 0
    total_questions = len(submitted_answers)

    # Check answers against the database
    for question_id, selected_option in submitted_answers.items():
        try:
            # Query the database for the correct answer
            question = Question.objects.get(id=question_id)
            if question.correct_option == selected_option:
                score += 1
        except Question.DoesNotExist:
            continue

    # Determine recommendation based on score (You can customize this logic)
    recommendation = domain
    if score < (total_questions / 2):
        recommendation = "Beginner Fundamentals" # Example fallback if score is low

    # Save to the user profile
    user.recommended_domain = recommendation
    user.latest_score = score   # <--- ADD THIS LINE
    user.save()

    # Return the new score data back to React
    return Response({
        "score": score,
        "total": total_questions,
        "recommendation": recommendation,
        "user": {
            "id": str(user.id),  # <--- FIX: Added str() here!
            "username": user.username,
            "enrolled_courses": user.enrolled_courses,
            "recommended_domain": user.recommended_domain
        }
    }, status=status.HTTP_200_OK)

# 6. Update Skills API
@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_skills(request):
    user = request.user
    
    # Extract the array sent from React
    enrolled_courses = request.data.get('enrolled_courses', [])
    
    # Save to the database
    user.enrolled_courses = enrolled_courses
    user.save()
    
    # Return the exact same manual structure back to React
    return Response({
        "message": "Skills updated successfully",
        "user": {
            "id": str(user.id),
            "username": user.username,
            "email": user.email,
            "role": getattr(user, 'role', 'student'),
            "enrolled_courses": user.enrolled_courses,
            "recommended_domain": getattr(user, 'recommended_domain', None)
        }
    }, status=status.HTTP_200_OK)

# 7. Add Question API view for mentors
@api_view(['POST']) # <-- FIXED INDENTATION HERE
@permission_classes([IsAuthenticated])
def add_question_api(request):
    try:
        # Extract the data sent from your React frontend
        data = request.data
        
        # Security/Validation Check: Ensure the user is actually a mentor
        if hasattr(request.user, 'role') and str(request.user.role).lower() != 'mentor':
            return Response({'error': 'Only mentors can add questions.'}, status=status.HTTP_403_FORBIDDEN)

        # Create the new Question in the database
        new_question = Question.objects.create(
            domain=data.get('domain'),
            question_text=data.get('question_text'),
            option1=data.get('option1'),
            option2=data.get('option2'),
            option3=data.get('option3'),
            option4=data.get('option4'),
            correct_option=data.get('correct_option')
        )
        
        return Response({'message': 'Question added successfully!'}, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

# change password API
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password_api(request):
    user = request.user
    old_password = request.data.get('old_password')
    new_password = request.data.get('new_password')

    # 1. Validate that both fields are provided
    if not old_password or not new_password:
        return Response(
            {"error": "Both old and new passwords are required."}, 
            status=status.HTTP_400_BAD_REQUEST
        )

    # 2. Check if the old password is correct
    if not user.check_password(old_password):
        return Response(
            {"error": "Incorrect old password."}, 
            status=status.HTTP_400_BAD_REQUEST
        )

    # 3. Set the new password and save
    user.set_password(new_password)
    user.save()

    return Response(
        {"message": "Password updated successfully."}, 
        status=status.HTTP_200_OK
    )
    # Make sure this starts perfectly aligned to the left margin!
@api_view(['PUT', 'POST'])
@permission_classes([IsAuthenticated])
def update_profile_api(request):
    user = request.user

    # 1. Get the new data from the request, fallback to existing data if not provided
    first_name = request.data.get('first_name', user.first_name)
    last_name = request.data.get('last_name', user.last_name)
    email = request.data.get('email', user.email)

    # 2. FIX: Check if the user is trying to change their email using CustomUser, not User
    if email and email != user.email:
        if CustomUser.objects.filter(email=email).exists():
            return Response(
                {"error": "A user with this email already exists."}, 
                status=status.HTTP_400_BAD_REQUEST
            )

    # 3. Update the user object
    user.first_name = first_name
    user.last_name = last_name
    user.email = email
    user.save()

    # --- MONGODB FIX: Safely extract the array ---
    enrolled = getattr(user, 'enrolled_courses', [])
    if not isinstance(enrolled, list):
        enrolled = []

    # 4. Return success message and the full, perfectly structured user data
    return Response({
        "message": "Profile updated successfully.",
        "user": {
            "id": str(user.id), # Cast MongoDB ID to string
            "username": user.username,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "email": user.email,
            # MUST include these so React doesn't overwrite them with 'undefined'!
            "role": getattr(user, 'role', 'student'),
            "enrolled_courses": enrolled,
            "recommended_domain": getattr(user, 'recommended_domain', None)
        }
    }, status=status.HTTP_200_OK)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def student_progress_api(request):
    # Fetch only users who are students
    students = CustomUser.objects.filter(role='student') 
    
    data = []
    for student in students:
        # If they haven't enrolled in courses, just show "No Domain"
        domain_display = student.enrolled_courses[0] if student.enrolled_courses else "No Domain"
        
        data.append({
            # Wrap student.id in str() to fix the JSON serialization error
            "id": str(student.id), 
            "username": student.username,
            "domain": domain_display,
            "result": student.recommended_domain or "No Result Yet",
            "status": "Completed" if student.recommended_domain else "Pending",
            "feedback": student.mentor_feedback or "",
            "score": student.latest_score
        })

    return Response(data, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_feedback_api(request):
    # The frontend is sending the user's ID as 'result_id'
    student_id = request.data.get('result_id') 
    feedback_text = request.data.get('feedback')

    if not student_id or not feedback_text:
        return Response({"error": "Missing data"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        # 1. Find the student
        student = CustomUser.objects.get(id=student_id)
        
        # 2. Update their feedback and save
        student.mentor_feedback = feedback_text
        student.save()

        return Response({"message": "Feedback saved successfully!"}, status=status.HTTP_200_OK)
    
    except CustomUser.DoesNotExist:
        return Response({"error": "Student not found"}, status=status.HTTP_404_NOT_FOUND)

 # /// CHATBOT API using Gemini 1.5 Flash ///
load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")
if api_key:
    genai.configure(api_key=api_key)
else:
    print("🚨 ERROR: GEMINI_API_KEY is missing! Check your .env file.")

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def chatbot_api(request):
    user_message = request.data.get('message')

    if not user_message:
        return Response({"error": "Message is required"}, status=status.HTTP_400_BAD_REQUEST)

    if not api_key:
        return Response({"error": "API key not configured on server"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    system_instruction = """
    You are an expert career counselor and freelancing mentor for DigiSkills students. 
    Your goal is to provide helpful, encouraging, and accurate advice.
    Only answer questions related to: graphic design, web development, freelancing platforms (Upwork, Fiverr), 
    content writing, resume building, and career growth. 
    If the user asks about unrelated topics (like cooking, sports, or politics), 
    politely decline and guide them back to career topics.
    
    User's message: 
    """

    try:
        # 1. Ask Google what models your specific API key has access to
        available_models = []
        for m in genai.list_models():
            if 'generateContent' in m.supported_generation_methods:
                available_models.append(m.name)
        
        # Print the list to your terminal for debugging!
        print(f"Models available to your API key: {available_models}")
        
        if not available_models:
             print("🚨 ERROR: Your API key does not have access to any text models!")
             return Response({"error": "AI models unavailable."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # 2. Automatically pick the best available model (Prefers 'flash', then whatever is first)
        selected_model_name = available_models[0] # Default fallback
        for name in available_models:
            if 'flash' in name:
                selected_model_name = name
                break

        # Remove 'models/' prefix so the library doesn't crash
        clean_model_name = selected_model_name.replace('models/', '')
        print(f"✅ Successfully loaded model: {clean_model_name}")

        # 3. Generate the actual chat response
        model = genai.GenerativeModel(clean_model_name)
        full_prompt = system_instruction + user_message
        
        response = model.generate_content(full_prompt)
        
        return Response({"reply": response.text}, status=status.HTTP_200_OK)
        
    except Exception as e:
        print(f"Chatbot Error: {e}") 
        return Response({"error": "Failed to connect to AI. Please try again later."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
# from .models import Project

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_project_api(request):
    """Allows a student to add a project to their portfolio."""
    user = request.user
    
    # Optional: Only allow students to add projects
    if user.role != 'student':
        return Response({"error": "Only students can create portfolios."}, status=status.HTTP_403_FORBIDDEN)

    title = request.data.get('title')
    domain = request.data.get('domain')
    description = request.data.get('description')
    project_url = request.data.get('project_url', '')

    if not title or not domain or not description:
        return Response({"error": "Title, domain, and description are required."}, status=status.HTTP_400_BAD_REQUEST)

    # Create the project
    project = Project.objects.create(
        user=user,
        title=title,
        domain=domain,
        description=description,
        project_url=project_url
    )

    return Response({"message": "Project added to portfolio!"}, status=status.HTTP_201_CREATED)


@api_view(['GET'])
def user_portfolio_api(request, username):
    """Fetches all projects for a specific username to build their portfolio page."""
    try:
        target_user = CustomUser.objects.get(username=username, role='student')
    except CustomUser.DoesNotExist:
        return Response({"error": "Student not found."}, status=status.HTTP_404_NOT_FOUND)

    projects = Project.objects.filter(user=target_user).order_by('-created_at')
    
    # Format the data for React
    project_list = []
    for p in projects:
        project_list.append({
            "id": str(p.id), # Added str() just in case of MongoDB ObjectIds!
            "title": p.title,
            "domain": p.domain,
            "description": p.description,
            "project_url": p.project_url,
            "created_at": p.created_at.strftime("%b %d, %Y")
        })

    # Return the user's profile info AND their projects
    return Response({
        "student_name": f"{target_user.first_name} {target_user.last_name}".strip() or target_user.username,
        "email": target_user.email,
        "recommended_domain": target_user.recommended_domain,
        "projects": project_list
    }, status=status.HTTP_200_OK)

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def domain_api(request):
    if request.method == 'GET':
        # Grab all domains from the database
        domains = list(SkillDomain.objects.values_list('name', flat=True))
        
        # If the database is completely empty, populate it with your defaults
        if not domains:
            default_domains = [
                "Graphic Design", "Content Writing", "Programming", 
                "Freelancing", "E-Commerce", "QuickBooks", "AutoCAD"
            ]
            for d in default_domains:
                SkillDomain.objects.get_or_create(name=d)
            domains = default_domains
            
        return Response(domains, status=status.HTTP_200_OK)

    elif request.method == 'POST':
        # Only allow mentors to add new domains
        if request.user.role != 'mentor':
            return Response({"error": "Only mentors can add domains."}, status=status.HTTP_403_FORBIDDEN)
        
        domain_name = request.data.get('name')
        if not domain_name:
            return Response({"error": "Domain name is required."}, status=status.HTTP_400_BAD_REQUEST)
        
        # Save it to the database
        domain, created = SkillDomain.objects.get_or_create(
            name=domain_name, 
            defaults={'created_by': request.user}
        )
        
        if created:
            return Response({"message": "Domain added successfully!", "domain": domain.name}, status=status.HTTP_201_CREATED)
        else:
            return Response({"error": "This domain already exists."}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_dashboard_api(request):
    # Security Check: Only allow Admins
    if request.user.role != 'admin':
        return Response({"error": "Unauthorized access. Admins only."}, status=status.HTTP_403_FORBIDDEN)

    # 1. Get all users
    users = CustomUser.objects.all().order_by('-date_joined')
    user_list = []
    for u in users:
        user_list.append({
            "id": str(u.id),
            "username": u.username,
            "email": u.email,
            "role": u.role.capitalize(),
            "domain": u.recommended_domain or "None",
            "feedback": u.mentor_feedback or "",
            "date_joined": u.date_joined.strftime("%b %d, %Y")
        })

    # 2. Get all projects
    projects = Project.objects.all().order_by('-created_at')
    project_list = []
    for p in projects:
        project_list.append({
            "id": str(p.id),
            "title": p.title,
            "domain": p.domain,
            "student": p.user.username,
            "url": p.project_url,
            "created_at": p.created_at.strftime("%b %d, %Y")
        })

    return Response({
        "users": user_list,
        "projects": project_list
    }, status=status.HTTP_200_OK)


from django.shortcuts import get_object_or_404
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_portfolio_by_mentor(request):
    # Security check: Only allow Mentors
    if request.user.role != 'mentor':
        return Response({"error": "Only mentors can generate portfolios."}, status=status.HTTP_403_FORBIDDEN)
        
    student_id = request.data.get('student_id')
    student = get_object_or_404(CustomUser, id=student_id) # Find the specific student
    
    # Create the project entry directly on the student's portfolio
    Project.objects.create(
        user=student,
        title=request.data.get('title'),
        domain=request.data.get('domain'),
        description=request.data.get('description'),
        project_url=""
    )
    
    return Response({"message": "Portfolio generated successfully!"}, status=status.HTTP_201_CREATED)

# This API generates a beginner-friendly project recommendation using Gemini, based on the student's recommended domain or enrolled courses. It returns a simple JSON object with the project title and description for React to display on the dashboard.
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def generate_ai_task_api(request):
    user = request.user
    
    # Check what domain the student is studying. Fallback to general freelancing if none.
    domain = user.recommended_domain
    if not domain and user.enrolled_courses:
        domain = user.enrolled_courses[0]
    elif not domain:
        domain = "General Freelancing"

    # Strict prompt telling Gemini to act as a mentor and return ONLY JSON
    prompt = f"""
    You are an expert career mentor. Based on the skill '{domain}', recommend ONE beginner-friendly, practical project the student can build for their portfolio right now.
    Return ONLY a raw JSON object. Do not include markdown formatting, backticks, or extra text.
    Format exactly like this:
    {{
        "title": "Project Title Here",
        "description": "A 2-sentence description of what they should build and why it helps their portfolio."
    }}
    """

    try:
        # 1. Dynamically find the correct model for your API key
        available_models = []
        for m in genai.list_models():
            if 'generateContent' in m.supported_generation_methods:
                available_models.append(m.name)
        
        if not available_models:
            return Response({"error": "AI models unavailable."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # 2. Pick the best one (prefer 'flash' for speed, otherwise take the first available)
        selected_model_name = available_models[0] 
        for name in available_models:
            if 'flash' in name:
                selected_model_name = name
                break

        # Remove 'models/' prefix so the library doesn't crash
        clean_model_name = selected_model_name.replace('models/', '')

        # 3. Generate the response with the dynamic model
        model = genai.GenerativeModel(clean_model_name)
        response = model.generate_content(prompt)
        
        # Clean the response just in case Gemini adds markdown code blocks
        cleaned_text = response.text.replace('```json', '').replace('```', '').strip()
        
        # Parse it into a dictionary and send it to React
        task_data = json.loads(cleaned_text)
        return Response(task_data, status=status.HTTP_200_OK)
        
    except Exception as e:
        print(f"AI Task Gen Error: {e}")
        return Response({"error": "Failed to generate AI task."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        


        # Fetch Current User API (For React Page Refreshes)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_current_user_api(request):
    user = request.user
    
    # FORCE MONGODB TO SEND THE ARRAY
    enrolled = getattr(user, 'enrolled_courses', [])
    if not isinstance(enrolled, list):
        enrolled = []

    return Response({
        "user": {
            "id": str(user.id),
            "username": user.username,
            "email": user.email,
            "role": getattr(user, 'role', 'student'),
            "enrolled_courses": enrolled, 
            "recommended_domain": getattr(user, 'recommended_domain', None)
        }
    }, status=status.HTTP_200_OK)