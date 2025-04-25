from rest_framework import serializers
from .models import Program, Client

class ProgramSerializer(serializers.ModelSerializer):
    class Meta:
        model = Program
        fields = ['id', 'name'] # Fields to include in the API output

class ClientSerializer(serializers.ModelSerializer):
    # To show program names instead of just IDs in the client profile
    enrolled_programs = ProgramSerializer(many=True, read_only=True)
    # If you want to enroll by ID during POST/PUT, you might need a different approach
    # or a separate endpoint/serializer field. Let's keep it simple for now.

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
