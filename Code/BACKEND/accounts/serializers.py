from rest_framework import serializers
from .models import CustomUser



class UserSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'role', 'enrolled_courses', 'recommended_domain']
        extra_kwargs = {'password': {'write_only': True}} # Security: Never return the password