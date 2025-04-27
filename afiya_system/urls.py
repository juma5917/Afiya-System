#@juma_samwel
from django.urls import path, include
from django.contrib import admin
from django.views.generic import TemplateView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('afiya/', include('afiya.urls')),  # Include your app's URLs
    path('api-auth/', include('rest_framework.urls', namespace='rest_framework')),
    # Serve index.html at the root URL
    path('', TemplateView.as_view(template_name='doctor_register.html'), name='home'),
    path('login', TemplateView.as_view(template_name='login.html'), name='login'),
    path('index', TemplateView.as_view(template_name='index.html'), name='Dashboard'),

]
