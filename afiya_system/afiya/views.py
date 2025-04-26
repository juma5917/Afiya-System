# @juma_samwel
from rest_framework import viewsets, status, serializers, generics
from rest_framework.decorators import action
from rest_framework.response import Response
# Import permissions
from rest_framework import permissions
from .models import Program, Client, Doctor
from .serializers import ProgramSerializer, ClientSerializer, ClientEnrollmentSerializer, DoctorRegistrationSerializer, UserLoginSerializer
from rest_framework.authtoken.models import Token
from rest_framework.authentication import TokenAuthentication
from django.contrib.auth.models import User

class ProgramViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows programs to be viewed or edited.
    Requires authentication.
    Provides list, create, retrieve, update, partial_update, destroy actions.
    """
    queryset = Program.objects.all().order_by('name')
    serializer_class = ProgramSerializer
    # Require authentication for all program actions
    permission_classes = [permissions.IsAuthenticated]


class ClientViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows clients to be viewed, edited, searched, and enrolled.
    Requires authentication.
    Provides list, create, retrieve, update, partial_update, destroy actions,
    plus custom 'search' and 'enroll' actions.
    """
    # Optimize query by prefetching related programs to avoid N+1 queries
    # when serializing the list or detail views.
    queryset = Client.objects.prefetch_related('enrolled_programs').all().order_by('name')
    serializer_class = ClientSerializer
    # Require authentication for all client actions
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['get'], url_path='search')
    def search(self, request):
        """
        Search for clients by name (case-insensitive).
        Requires 'q' query parameter. If 'q' is empty, returns all clients.
        Maps to GET /afiya/clients/search/?q=...
        """
        query = request.query_params.get('q', None)
        if query is None:
             # Return 400 Bad Request if 'q' parameter is missing entirely
             return Response(
                 {"detail": "Query parameter 'q' is required."},
                 status=status.HTTP_400_BAD_REQUEST
             )

        # Handle empty query string - return all clients in this case
        if not query:
             clients = self.get_queryset() # Use the ViewSet's default queryset
        else:
            # Perform case-insensitive search on the name field
            clients = self.get_queryset().filter(name__icontains=query)

        # Use the ViewSet's default serializer (ClientSerializer)
        serializer = self.get_serializer(clients, many=True)
        return Response(serializer.data)

    # Use ClientEnrollmentSerializer specifically for INPUT validation here
    @action(detail=True, methods=['post'], serializer_class=ClientEnrollmentSerializer)
    def enroll(self, request, pk=None):
        """
        Enroll a specific client (by pk in URL) into a program
        (by program_id in request body).
        Maps to POST /afiya/clients/{client_pk}/enroll/
        """
        client = self.get_object() # Gets client based on pk in URL, handles 404 if not found
        # Validate the incoming request using ClientEnrollmentSerializer
        enrollment_serializer = self.get_serializer(data=request.data)

        # Use raise_exception=True for standard DRF error handling.
        # If validation fails, it automatically returns a 400 Bad Request response.
        enrollment_serializer.is_valid(raise_exception=True)

        # If validation passes, validated_data is available
        program_id = enrollment_serializer.validated_data['program_id']
        try:
            # Fetch the program instance
            program = Program.objects.get(pk=program_id)
            # Add the client to the program's 'clients' relationship (or vice-versa)
            client.enrolled_programs.add(program)
            # Note: .add() handles duplicates gracefully (doesn't add if already present)

            # Return the updated client profile using the default ClientSerializer
            # This ensures the response includes the newly enrolled program.
            response_serializer = ClientSerializer(client)
            return Response(response_serializer.data, status=status.HTTP_200_OK)

        except Program.DoesNotExist:
            
            raise serializers.ValidationError(
                {'program_id': f"Program with ID {program_id} not found."}
            )

class DoctorRegistrationView(generics.CreateAPIView):
    """
    API endpoint for doctor registration.
    """
    queryset = Doctor.objects.all() # Or User.objects.all()
    serializer_class = DoctorRegistrationSerializer
    permission_classes = [permissions.AllowAny] # Registration should be open to anyone

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response({'message': 'Registration successful. You can now login.'}, status=status.HTTP_201_CREATED, headers=headers)
