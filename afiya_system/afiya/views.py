from rest_framework import generics, status, views # Use generics for standard CRUD
from rest_framework.decorators import action # For custom actions like search/enroll
from rest_framework.response import Response
from rest_framework import viewsets # ViewSets group related views

from .models import Program, Client
from .serializers import ProgramSerializer, ClientSerializer, ClientEnrollmentSerializer

class ProgramViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows programs to be viewed or edited.
    Provides list, create, retrieve, update, destroy actions.
    """
    queryset = Program.objects.all().order_by('name')
    serializer_class = ProgramSerializer
    # Add permissions later if needed: permission_classes = [permissions.IsAuthenticatedOrReadOnly]

class ClientViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows clients to be viewed or edited.
    """
    queryset = Client.objects.all().order_by('name')
    serializer_class = ClientSerializer

    # Custom action for searching clients (Requirement 4)
    # Maps to GET /api/clients/search/?q=...
    @action(detail=False, methods=['get'], url_path='search')
    def search(self, request):
        query = request.query_params.get('q', None)
        if query is not None:
            # Simple case-insensitive name search
            clients = self.get_queryset().filter(name__icontains=query)
            serializer = self.get_serializer(clients, many=True)
            return Response(serializer.data)
        else:
            return Response({"detail": "Query parameter 'q' is required."}, status=status.HTTP_400_BAD_REQUEST)

    # Custom action for enrolling a client (Requirement 3 & 5)
    # Maps to POST /api/clients/{client_pk}/enroll/
    @action(detail=True, methods=['post'], serializer_class=ClientEnrollmentSerializer)
    def enroll(self, request, pk=None):
        client = self.get_object()
        # Validate the incoming request using ClientEnrollmentSerializer
        enrollment_serializer = self.get_serializer(data=request.data)

        if enrollment_serializer.is_valid():
            program_id = enrollment_serializer.validated_data['program_id']
            try:
                program = Program.objects.get(pk=program_id)
                client.enrolled_programs.add(program)
                # No need to call client.save() for ManyToManyField.add unless signals depend on it

                # --- FIX IS HERE ---
                # Use the main ClientSerializer for the RESPONSE
                response_serializer = ClientSerializer(client)
                return Response(response_serializer.data, status=status.HTTP_200_OK)
                # --- END FIX ---

            except Program.DoesNotExist:
                # Use the validation error format DRF expects for consistency
                raise serializers.ValidationError(
                    {'program_id': f"Program with ID {program_id} not found."}
                )
                # Or keep your original response format if preferred:
                # return Response(
                #     {'error': f"Program with ID {program_id} not found."},
                #     status=status.HTTP_400_BAD_REQUEST
                # )
        else:
            # Return validation errors from the enrollment_serializer
            return Response(enrollment_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    # Requirement 5 (View Profile) is handled by the default 'retrieve' action
    # GET /api/clients/{client_pk}/

    # Requirement 6 (Expose Profile via API) is inherently done by this ViewSet
