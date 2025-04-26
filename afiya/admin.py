#@juma_samwel 
from django.contrib import admin
from .models import Program, Client # Import your models

# Register your models here.

@admin.register(Program)
class ProgramAdmin(admin.ModelAdmin):
    """
    Admin interface options for the Program model.
    """
    list_display = ('name',) # Fields to show in the list view
    search_fields = ('name',) # Enable searching by name

@admin.register(Client)
class ClientAdmin(admin.ModelAdmin):
    """
    Admin interface options for the Client model.
    """
    list_display = ('name', 'date_of_birth', 'contact_info') # Fields to show
    search_fields = ('name', 'contact_info') # Enable searching
    list_filter = ('enrolled_programs',) # Allow filtering by enrolled programs
    filter_horizontal = ('enrolled_programs',) # Use a more user-friendly widget for ManyToMany
