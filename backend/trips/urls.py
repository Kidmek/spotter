from django.urls import path
from . import views

urlpatterns = [
    path('trips/', views.trip_list, name='trip-list'),
    path('trips/<int:pk>/', views.trip_detail, name='trip-detail'),
    path('trips/<int:pk>/generate_pdf/', views.generate_pdf, name='generate-pdf'),
    path('trips/<int:trip_id>/add_log/', views.add_log, name='add-log'),
] 