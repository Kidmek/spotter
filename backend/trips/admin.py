from django.contrib import admin
from .models import Trip, ELDLog

# Register Trip model
@admin.register(Trip)
class TripAdmin(admin.ModelAdmin):
    list_display = ('id', 'created_at', 'updated_at', 'current_cycle_used')
    search_fields = ('id',)

# Register ELDLog model
@admin.register(ELDLog)
class ELDLogAdmin(admin.ModelAdmin):
    list_display = ('id', 'trip', 'status', 'start_time', 'end_time')
    list_filter = ('status',)
    search_fields = ('trip__id',)