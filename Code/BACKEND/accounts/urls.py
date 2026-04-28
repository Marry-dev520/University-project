from django.urls import path
from . import views

urlpatterns = [
    path('api/register/', views.register_api, name='register'),
    path('api/login/', views.login_api, name='login'),
    path('api/logout/', views.logout_view, name='logout'),
    path('api/update-skills/', views.update_skills, name='update_skills'),
    path('api/assessment/', views.assessment_questions_api, name='assessment'),
    path('api/result/', views.result_api, name='result'),
    path('api/add-question/', views.add_question_api, name='add_question'),
    path('api/change-password/', views.change_password_api, name='change_password'),
    path('api/update-profile/', views.update_profile_api, name='update_profile'),
    path('api/student-progress/', views.student_progress_api, name='student_progress'),
    path('api/submit-feedback/', views.submit_feedback_api, name='submit_feedback'),
    path('api/chat/', views.chatbot_api, name='chatbot'),
    path('api/add-project/', views.add_project_api, name='add_project'),
    path('api/portfolio/<str:username>/', views.user_portfolio_api, name='user_portfolio'),
    path('api/domains/', views.domain_api, name='domains'),
    path('api/admin/dashboard/', views.admin_dashboard_api, name='admin_dashboard'),
]