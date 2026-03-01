

from django.urls import path
from . import views

urlpatterns = [
    path('api/register/', views.register_api, name='register'),
    path('api/login/', views.login_api, name='login'),
    path('api/logout/', views.logout_view, name='logout'),
    path('api/update-skills/', views.update_skills, name='update_skills'),
    path('api/assessment/', views.assessment_questions_api, name='assessment'),
    path('api/result/', views.result_api, name='result'),
]