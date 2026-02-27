from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    ROLE_CHOICES = (
        ('student', 'Student'),
        ('mentor', 'Mentor'),
        ('admin', 'Administrator'),
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    
    # --- NEW FIELDS FOR FR2 (SKILLS & RECOMMENDATIONS) ---
    enrolled_courses = models.JSONField(default=list, blank=True)
    recommended_domain = models.CharField(max_length=100, blank=True, null=True)

class Question(models.Model):
    # --- UPDATED TO MATCH DIGISKILLS COURSES ---
    DOMAIN_CHOICES = (
        ('Graphic Design', 'Graphic Design'),
        ('Content Writing', 'Content Writing'),
        ('Programming', 'Programming'),
        ('Freelancing', 'Freelancing'),
        ('E-Commerce', 'E-Commerce'),
        ('QuickBooks', 'QuickBooks'),
        ('AutoCAD', 'AutoCAD'),
    )
    domain = models.CharField(max_length=50, choices=DOMAIN_CHOICES)
    question_text = models.CharField(max_length=255)
    option1 = models.CharField(max_length=100)
    option2 = models.CharField(max_length=100)
    option3 = models.CharField(max_length=100)
    option4 = models.CharField(max_length=100)
    correct_option = models.CharField(max_length=100)