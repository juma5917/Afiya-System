# @JUMA_SAMWEL
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProgramViewSet, ClientViewSet, DoctorRegistrationView, UserLoginView
router = DefaultRouter()

router.register(r'programs', ProgramViewSet, basename='program')
router.register(r'clients', ClientViewSet, basename='client')

urlpatterns = [
    path('', include(router.urls)),
    path('doctors/register/', DoctorRegistrationView.as_view(), name='doctor-register'),
    path('login/', UserLoginView.as_view(), name='api-login'),
]
