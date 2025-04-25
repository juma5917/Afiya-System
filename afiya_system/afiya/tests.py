# /home/juma-samwel-onyango/Software Engineering Intern Task/afiya_system/afiya/tests.py
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase # Use DRF's test case
from .models import Program, Client
import datetime

class ProgramAPITests(APITestCase):
    def setUp(self):
        """Set up data for program tests."""
        self.program1 = Program.objects.create(name="HIV Support")
        self.program2 = Program.objects.create(name="Malaria Prevention")
        self.list_url = reverse('program-list') # URL for list/create

    def test_create_program(self):
        """
        Ensure we can create a new program object.
        """
        url = self.list_url
        data = {'name': 'TB Care'}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Program.objects.count(), 3) # 2 from setUp + 1 new
        self.assertTrue(Program.objects.filter(name='TB Care').exists())

    def test_create_program_duplicate_name(self):
        """
        Ensure creating a program with a duplicate name fails.
        """
        url = self.list_url
        data = {'name': self.program1.name} # Use existing name
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(Program.objects.count(), 2) # Should not have created a new one

    def test_list_programs(self):
        """
        Ensure we can list programs.
        """
        url = self.list_url
        response = self.client.get(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)
        self.assertEqual(response.data[0]['name'], self.program1.name) # Assuming default ordering by name
        self.assertEqual(response.data[1]['name'], self.program2.name)

    def test_retrieve_program(self):
        """
        Ensure we can retrieve a specific program.
        """
        url = reverse('program-detail', kwargs={'pk': self.program1.pk}) # URL for retrieve/update/delete
        response = self.client.get(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], self.program1.name)

    def test_update_program(self):
        """
        Ensure we can update a program (using PUT).
        """
        url = reverse('program-detail', kwargs={'pk': self.program1.pk})
        updated_data = {'name': 'Updated HIV Support'}
        response = self.client.put(url, updated_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.program1.refresh_from_db() # Reload data from DB
        self.assertEqual(self.program1.name, updated_data['name'])

    def test_partial_update_program(self):
        """
        Ensure we can partially update a program (using PATCH).
        """
        url = reverse('program-detail', kwargs={'pk': self.program1.pk})
        updated_data = {'name': 'Patched HIV Support'}
        response = self.client.patch(url, updated_data, format='json') # Use PATCH
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.program1.refresh_from_db()
        self.assertEqual(self.program1.name, updated_data['name'])

    def test_delete_program(self):
        """
        Ensure we can delete a program.
        """
        url = reverse('program-detail', kwargs={'pk': self.program1.pk})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Program.objects.count(), 1) # Only program2 should remain
        self.assertFalse(Program.objects.filter(pk=self.program1.pk).exists())


class ClientAPITests(APITestCase):
    def setUp(self):
        """Set up data for client tests."""
        self.program_tb = Program.objects.create(name="TB Care")
        self.program_hiv = Program.objects.create(name="HIV Support")
        self.client1_data = {
            'name': 'Test Client One',
            'date_of_birth': datetime.date(1990, 5, 15),
            'contact_info': 'test1@example.com'
        }
        self.client2_data = {
            'name': 'Another Test Client',
            'date_of_birth': datetime.date(1985, 1, 1),
            'contact_info': 'test2@example.com'
        }
        # Create clients directly for easier setup in multiple tests
        self.client1 = Client.objects.create(**self.client1_data)
        self.client2 = Client.objects.create(**self.client2_data)

        self.list_url = reverse('client-list') # URL for list/create
        self.search_url = reverse('client-search') # URL for search action

    def test_create_client(self):
        """
        Ensure we can create a new client.
        """
        url = self.list_url
        new_client_data = {
            'name': 'New Client',
            'date_of_birth': '2000-01-01', # Use string format common in APIs
            'contact_info': 'new@example.com'
        }
        response = self.client.post(url, new_client_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Client.objects.count(), 3) # 2 from setUp + 1 new
        self.assertTrue(Client.objects.filter(name='New Client').exists())

    def test_create_client_missing_field(self):
        """
        Ensure creating a client with missing required field fails.
        """
        url = self.list_url
        invalid_data = {
            # 'name': 'Missing Name', # Name is required
            'date_of_birth': '2000-01-01',
            'contact_info': 'invalid@example.com'
        }
        response = self.client.post(url, invalid_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('name', response.data) # Check if 'name' field error is reported

    def test_list_clients(self):
        """
        Ensure we can list clients.
        """
        url = self.list_url
        response = self.client.get(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)
        # Note: Order depends on default ordering ('name'), client2 comes before client1
        self.assertEqual(response.data[0]['name'], self.client2.name)
        self.assertEqual(response.data[1]['name'], self.client1.name)

    def test_retrieve_client(self):
        """
        Ensure we can retrieve a specific client.
        """
        url = reverse('client-detail', kwargs={'pk': self.client1.pk})
        response = self.client.get(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], self.client1.name)
        self.assertEqual(response.data['enrolled_programs'], []) # Initially not enrolled

    def test_update_client(self):
        """
        Ensure we can update a client (using PUT).
        """
        url = reverse('client-detail', kwargs={'pk': self.client1.pk})
        updated_data = {
            'name': 'Updated Client One',
            'date_of_birth': '1990-05-16', # Changed DOB
            'contact_info': 'updated1@example.com'
            # Note: PUT requires all fields usually, enrolled_programs is read_only
        }
        response = self.client.put(url, updated_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.client1.refresh_from_db()
        self.assertEqual(self.client1.name, updated_data['name'])
        self.assertEqual(str(self.client1.date_of_birth), updated_data['date_of_birth'])
        self.assertEqual(self.client1.contact_info, updated_data['contact_info'])

    def test_partial_update_client(self):
        """
        Ensure we can partially update a client (using PATCH).
        """
        url = reverse('client-detail', kwargs={'pk': self.client1.pk})
        updated_data = {'contact_info': 'patched1@example.com'} # Only update contact
        response = self.client.patch(url, updated_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.client1.refresh_from_db()
        self.assertEqual(self.client1.contact_info, updated_data['contact_info'])
        self.assertEqual(self.client1.name, 'Test Client One') # Name should be unchanged

    def test_delete_client(self):
        """
        Ensure we can delete a client.
        """
        url = reverse('client-detail', kwargs={'pk': self.client1.pk})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Client.objects.count(), 1) # Only client2 should remain
        self.assertFalse(Client.objects.filter(pk=self.client1.pk).exists())

    # --- Enrollment Tests ---
    def test_enroll_client(self):
        """
        Ensure we can enroll a client in a program.
        """
        enroll_url = reverse('client-enroll', kwargs={'pk': self.client1.pk})
        enroll_data = {'program_id': self.program_tb.id}
        response = self.client.post(enroll_url, enroll_data, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.client1.refresh_from_db()
        self.assertEqual(self.client1.enrolled_programs.count(), 1)
        self.assertEqual(self.client1.enrolled_programs.first().name, self.program_tb.name)
        # Check if response contains updated client data with program
        self.assertIn('enrolled_programs', response.data)
        self.assertEqual(len(response.data['enrolled_programs']), 1)
        self.assertEqual(response.data['enrolled_programs'][0]['name'], self.program_tb.name)

    def test_enroll_client_multiple_programs(self):
        """
        Ensure we can enroll a client in multiple programs.
        """
        # Enroll in TB first
        enroll_url = reverse('client-enroll', kwargs={'pk': self.client1.pk})
        self.client.post(enroll_url, {'program_id': self.program_tb.id}, format='json')

        # Enroll in HIV next
        response = self.client.post(enroll_url, {'program_id': self.program_hiv.id}, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.client1.refresh_from_db()
        self.assertEqual(self.client1.enrolled_programs.count(), 2)
        program_names = set(p.name for p in self.client1.enrolled_programs.all())
        self.assertEqual(program_names, {self.program_tb.name, self.program_hiv.name})

    def test_enroll_client_already_enrolled(self):
        """
        Ensure enrolling a client in the same program again has no adverse effect.
        """
        enroll_url = reverse('client-enroll', kwargs={'pk': self.client1.pk})
        enroll_data = {'program_id': self.program_tb.id}
        # Enroll first time
        self.client.post(enroll_url, enroll_data, format='json')
        self.assertEqual(self.client1.enrolled_programs.count(), 1)

        # Enroll second time
        response = self.client.post(enroll_url, enroll_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK) # Should still succeed
        self.client1.refresh_from_db()
        self.assertEqual(self.client1.enrolled_programs.count(), 1) # Count should remain 1

    def test_enroll_client_non_existent_program(self):
        """
        Ensure enrolling in a non-existent program fails gracefully.
        """
        enroll_url = reverse('client-enroll', kwargs={'pk': self.client1.pk})
        non_existent_program_id = 9999
        enroll_data = {'program_id': non_existent_program_id}
        response = self.client.post(enroll_url, enroll_data, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('program_id', response.data) # Serializer validation error
        self.assertIn(f"Program with ID {non_existent_program_id} not found.", str(response.data['program_id']))
        self.client1.refresh_from_db()
        self.assertEqual(self.client1.enrolled_programs.count(), 0) # Should not be enrolled

    def test_enroll_client_invalid_data(self):
        """
        Ensure enrolling with invalid data (e.g., missing program_id) fails.
        """
        enroll_url = reverse('client-enroll', kwargs={'pk': self.client1.pk})
        invalid_data = {} # Missing 'program_id'
        response = self.client.post(enroll_url, invalid_data, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('program_id', response.data)
        self.assertIn('This field is required.', str(response.data['program_id']))

    # --- Search Tests ---
    def test_search_client_single_result(self):
        """
        Ensure client search works for a single match.
        """
        response = self.client.get(self.search_url + '?q=One', format='json') # Search for 'One'
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['name'], self.client1.name)

    def test_search_client_multiple_results(self):
        """
        Ensure client search works for multiple matches.
        """
        response = self.client.get(self.search_url + '?q=Test Client', format='json') # Should match both
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)
        # Check names are present (order depends on default ordering)
        names = {client['name'] for client in response.data}
        self.assertEqual(names, {self.client1.name, self.client2.name})

    def test_search_client_case_insensitive(self):
        """
        Ensure client search is case-insensitive.
        """
        response = self.client.get(self.search_url + '?q=test client one', format='json') # Lowercase search
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['name'], self.client1.name)

    def test_search_client_no_results(self):
        """
        Ensure client search returns empty list for no matches.
        """
        response = self.client.get(self.search_url + '?q=NonExistentName', format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 0) # Should be an empty list

    def test_search_client_no_query_param(self):
        """
        Ensure search fails if query parameter 'q' is missing.
        """
        response = self.client.get(self.search_url, format='json') # No '?q='
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('detail', response.data)
        self.assertEqual(response.data['detail'], "Query parameter 'q' is required.")

    def test_search_client_empty_query_param(self):
        """
        Ensure search with empty 'q' returns all clients (or handles as defined).
        Current implementation filters by empty string, likely returning all.
        Alternatively, could be modified to return 400 or empty list. Let's test current behavior.
        """
        response = self.client.get(self.search_url + '?q=', format='json') # Empty query
        # Assuming filter(name__icontains='') matches all clients
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2) # Returns all clients

# --- Permissions Tests ---
# Note: Since no specific permissions are implemented yet (e.g., IsAuthenticated, IsAdminUser),
# these tests are placeholders or would test the default behavior (likely AllowAny).
# If you add permissions like `permission_classes = [permissions.IsAuthenticated]` to ViewSets,
# you would add tests here to verify unauthorized access is denied (401/403)
# and authorized access is allowed.
# Example (if IsAuthenticated was added):
# class PermissionTests(APITestCase):
#     def test_unauthenticated_access_denied(self):
#         url = reverse('program-list')
#         response = self.client.get(url)
#         self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED) # Or 403 depending on DRF settings
#
#     def test_authenticated_access_allowed(self):
#         # You'd need to create a user and authenticate the client
#         # from django.contrib.auth.models import User
#         # user = User.objects.create_user('testuser', password='password')
#         # self.client.login(username='testuser', password='password') # Or use token auth
#         # url = reverse('program-list')
#         # response = self.client.get(url)
#         # self.assertEqual(response.status_code, status.HTTP_200_OK)
#         pass # Placeholder
