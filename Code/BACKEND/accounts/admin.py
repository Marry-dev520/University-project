from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, Question


# 🔹 Custom User Admin
class CustomUserAdmin(UserAdmin):
    model = CustomUser

    list_display = (
        'username',
        'email',
        'role',
        'is_staff',
        'is_active'
    )

    list_filter = (
        'role',
        'is_staff',
        'is_active'
    )

    fieldsets = UserAdmin.fieldsets + (
        ('Role Information', {
            'fields': ('role',)
        }),
    )

    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Role Information', {
            'fields': ('role',)
        }),
    )

    search_fields = ('username', 'email')
    ordering = ('username',)


admin.site.register(CustomUser, CustomUserAdmin)


# 🔹 Question Admin (FR2)
class QuestionAdmin(admin.ModelAdmin):
    list_display = (
        'question_text',
        'domain',
        'correct_option'
    )

    list_filter = ('domain',)
    search_fields = ('question_text',)

    fieldsets = (
        ('Question Information', {
            'fields': (
                'domain',
                'question_text',
                'option1',
                'option2',
                'option3',
                'option4',
                'correct_option',
            )
        }),
    )


admin.site.register(Question, QuestionAdmin)