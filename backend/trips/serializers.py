from rest_framework import serializers
from .models import Trip, ELDLog

class ELDLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = ELDLog
        fields = ['id', 'status', 'start_time', 'end_time', 'remarks', 'location', 'created_at']
        read_only_fields = ['start_time']

class TripSerializer(serializers.ModelSerializer):
    eld_logs = ELDLogSerializer(many=True, read_only=True)
    driving_hours = serializers.SerializerMethodField()
    on_duty_hours = serializers.SerializerMethodField()
    off_duty_hours = serializers.SerializerMethodField()
    cycle_used = serializers.SerializerMethodField()
    class Meta:
        model = Trip
        fields = ['id', 'current_location', 'pickup_location', 'dropoff_location', 
                 'current_cycle_used', 'created_at', 'updated_at', 'eld_logs',
                 'driving_hours', 'on_duty_hours', 'off_duty_hours', 'cycle_used']

    def get_driving_hours(self, obj):
        return obj.calculate_driving_hours()

    def get_on_duty_hours(self, obj):
        return obj.calculate_on_duty_hours()

    def get_off_duty_hours(self, obj):
        return obj.calculate_off_duty_hours() 
    
    def get_cycle_used(self, obj):
        return obj.calculate_cycle_used()