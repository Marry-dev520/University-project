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
    
    # --- MENTOR FEEDBACK & SCORING ---
    mentor_feedback = models.TextField(blank=True, null=True)
    latest_score = models.IntegerField(null=True, blank=True)

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

# --- NEW MODEL FOR FR6: PORTFOLIO GENERATION ---
class Project(models.Model):
    # Link the project to a specific student
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='projects')
    
    title = models.CharField(max_length=200)
    domain = models.CharField(max_length=50) # e.g., "Graphic Design", "Programming"
    description = models.TextField()
    
    # Link to the live project (like GitHub, Behance, or a Google Drive link)
    project_url = models.URLField(blank=True, null=True) 
    
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} by {self.user.username}"

class SkillDomain(models.Model):
    name = models.CharField(max_length=100, unique=True)
    created_by = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name