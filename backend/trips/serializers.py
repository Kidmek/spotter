from rest_framework import serializers
from .models import Trip, ELDLog

class ELDLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = ELDLog
        fields = ['id', 'status', 'start_time', 'end_time', 'remarks', 'location', 'created_at']
        read_only_fields = ['start_time']

class TripSerializer(serializers.ModelSerializer):
    eld_logs = ELDLogSerializer(many=True, read_only=True)

    class Meta:
        model = Trip
        fields = ['id', 'current_location', 'pickup_location', 'dropoff_location', 
                 'current_cycle_used', 'created_at', 'updated_at', 'eld_logs'] 