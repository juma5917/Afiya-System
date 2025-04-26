#@JUMA_SAMWEL
from rest_framework import serializers
from .models import Program, Client, Doctor
from django.contrib.auth.models import User
from rest_framework.exceptions import ValidationError

class ProgramSerializer(serializers.ModelSerializer):
    class Meta:
        model = Program
        fields = ['id', 'name'] # Fields to include in the API output

class ClientSerializer(serializers.ModelSerializer):
    # To show program names instead of just IDs in the client profile
    enrolled_programs = ProgramSerializer(many=True, read_only=True)

    class Meta:
        model = Client
        fields = ['id', 'name', 'date_of_birth', 'contact_info', 'enrolled_programs']

class ClientEnrollmentSerializer(serializers.Serializer):
    # A specific serializer for the enrollment action
    program_id = serializers.IntegerField()

    def validate_program_id(self, value):
        """Check that the program exists."""
        if not Program.objects.filter(pk=value).exists():
            raise serializers.ValidationError(f"Program with ID {value} not found.")
        return value
class UserLoginSerializer(serializers.Serializer):
    """
    Serializer for user login.
    """
    username = serializers.CharField(required=True)
    password = serializers.CharField(required=True)

    def validate(self, data):
        username = data.get('username')
        password = data.get('password')

        if username and password:
            user = User.objects.filter(username=username).first()
            if not user or not user.check_password(password):
                raise ValidationError("Invalid username or password")
        else:
            raise ValidationError("Must include 'username' and 'password'.")

        data['user'] = user
        return data

class DoctorRegistrationSerializer(serializers.ModelSerializer):
    """
    Serializer for doctor registration.
    """
    password = serializers.CharField(write_only=True)

    class Meta:
        model = Doctor # Or User if not using Doctor model
        fields = ('username', 'password', 'email','first_name','last_name')

    def create(self, validated_data):
        """
        Create a new doctor instance.
        """
        # Or use create_user if using the User model
        doctor = Doctor.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password'],
            email=validated_data['email'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name']
        )
        return doctor
