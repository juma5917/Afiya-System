#@juma_samwel
from django.urls import path, include
from django.contrib import admin
from django.views.generic import TemplateView
from afiya import views as afiya_views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('afiya/', include('afiya.urls')),
    path('api-auth/', include('rest_framework.urls', namespace='rest_framework')),
    path('', TemplateView.as_view(template_name='doctor_register.html'), name='home'),
    # path('login.html', TemplateView.as_view(template_name='login.html'), name='login'),
    path('login.html', afiya_views.login_page_view, name='login'),
    path('index.html', TemplateView.as_view(template_name='index.html'), name='Dashboard'),

]
