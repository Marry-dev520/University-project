from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    ROLE_CHOICES = (
        ('student', 'Student'),
        ('mentor', 'Mentor'),
        ('admin', 'Administrator'),
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)

class Question(models.Model):
    DOMAIN_CHOICES = (
        ('graphic', 'Graphic Design'),
        ('writing', 'Content Writing'),
        ('programming', 'Programming'),
        ('freelancing', 'Freelancing'),
    )
    domain = models.CharField(max_length=50, choices=DOMAIN_CHOICES)
    question_text = models.CharField(max_length=255)
    option1 = models.CharField(max_length=100)
    option2 = models.CharField(max_length=100)
    option3 = models.CharField(max_length=100)
    option4 = models.CharField(max_length=100)
    correct_option = models.CharField(max_length=100)