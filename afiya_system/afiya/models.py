# @JUMA_SAMWEL
from django.db import models
from django.contrib.auth.models import User

class Program(models.Model):
    """
    Represents a health program offered (e.g., TB, HIV, Malaria).
    """
    name = models.CharField(
        max_length=100,
        unique=True, # Ensures program names are distinct
        help_text="The unique name of the health program."
    )

    def __str__(self):
        """String representation of the Program model."""
        return self.name

    class Meta:
        ordering = ['name'] # Keep programs ordered alphabetically by default

class Client(models.Model):
    """
    Represents a client registered in the health system.
    """
    name = models.CharField(
        max_length=200,
        help_text="Full name of the client."
    )
    date_of_birth = models.DateField(
        help_text="Client's date of birth."
    )
    # Consider adding validators or using a more specific field type if format is known
    contact_info = models.CharField(
        max_length=255,
        blank=True, # Allow contact info to be optional initially
        help_text="Contact information (e.g., phone number, email)."
    )
    enrolled_programs = models.ManyToManyField(
        Program,
        related_name='clients', # Allows easy access from Program: program.clients.all()
        blank=True, # A client might not be enrolled in any program initially
        help_text="Programs this client is enrolled in."
    )
    # Django automatically adds an 'id' primary key field

    def __str__(self):
        """String representation of the Client model."""
        return f"{self.name} (ID: {self.id})" 

    class Meta:
        ordering = ['name'] 

class Doctor(User):
    """
    Represents a doctor registered in the health system.
    """

    class Meta:
        proxy = True  
        verbose_name = "Doctor"
        verbose_name_plural = "Doctors"
