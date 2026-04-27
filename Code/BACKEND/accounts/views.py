from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth import login, logout, authenticate
from collections import Counter
from rest_framework.authtoken.models import Token
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
            # --- ADD THIS: Get or create the security token ---
            token, created = Token.objects.get_or_create(user=user)
            return Response({
                "message": "Login successful",
                "token": token.key,  
                "user": UserSerializer(user).data,
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

# 4. Assessment List API
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def assessment_questions_api(request):
    # 1. Get the raw data from MongoDB and turn it into a list
    raw_questions = list(Question.objects.all().values(
        'id', 'domain', 'question_text', 'option1', 'option2', 'option3', 'option4'
    ))
    
    # 2. THE FIX: Loop through the questions and convert the ObjectId to a string
    for q in raw_questions:
        q['id'] = str(q['id'])
        
    # 3. Send the clean JSON data back to React
    return Response(raw_questions)

# 5. Result/Recommendation API
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def result_api(request):
    user = request.user
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
    
    # NEW: Save the recommendation to the database
    user.recommended_domain = recommendation
    user.save()
    
    # NEW: Return the updated user object so React can update localStorage
    return Response({
        "recommendation": recommendation,
        "user": {
            "username": user.username,
            "email": user.email,
            "role": getattr(user, 'role', 'student'),
            "enrolled_courses": getattr(user, 'enrolled_courses', []),
            "recommended_domain": user.recommended_domain,
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
    
    # Return the updated user object back to React to update local storage
    return Response({
        "message": "Skills updated successfully",
        "user": {
            "username": user.username,
            "email": user.email,
            "role": getattr(user, 'role', 'student'),
            "enrolled_courses": user.enrolled_courses,
            "recommended_domain": getattr(user, 'recommended_domain', None),
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

    # 2. Check if the user is trying to change their email to one that already exists
    if email and email != user.email:
        if User.objects.filter(email=email).exists():
            return Response(
                {"error": "A user with this email already exists."}, 
                status=status.HTTP_400_BAD_REQUEST
            )

    # 3. Update the user object
    user.first_name = first_name
    user.last_name = last_name
    user.email = email
    
    # If you have custom fields on your user model (like phone_number), add them here:
    # user.phone_number = request.data.get('phone_number', user.phone_number)

    user.save()

    # 4. Return success message and the updated user data for the frontend
    return Response({
        "message": "Profile updated successfully.",
        "user": {
            "id": user.id,
            "username": user.username,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "email": user.email,
            # If you are returning enrolled_courses in login/result, you can add it here too
        }
    }, status=status.HTTP_200_OK)