# from django.urls import path
# from . import views

# urlpatterns = [
#     path('api/register/', views.register_view, name='register'),
#     path('api/login/', views.login_view, name='login'),
#     path('api/logout/', views.logout_view, name='logout'),
#     path('api/dashboard/', views.dashboard, name='dashboard'),
#     path('api/assessment/', views.assessment, name='assessment'),
#     path('api/result/', views.result, name='result'),
# ]


from django.urls import path
from . import views

urlpatterns = [
    path('api/register/', views.register_api, name='register'),
    path('api/login/', views.login_api, name='login'),
    path('api/logout/', views.logout_view, name='logout'),
    path('api/assessment/', views.assessment_questions_api, name='assessment'),
    path('api/result/', views.result_api, name='result'),
]