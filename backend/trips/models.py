from django.db import models
from django.utils import timezone
from datetime import timedelta
from django.core.exceptions import ValidationError

# Create your models here.

class Trip(models.Model):
    current_location = models.JSONField()  # Store lat/lng and address
    pickup_location = models.JSONField()
    dropoff_location = models.JSONField()
    current_cycle_used = models.FloatField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # FMCSA Regulations
    MAX_DRIVING_HOURS = 11
    MAX_ON_DUTY_HOURS = 14
    REQUIRED_OFF_DUTY_HOURS = 10

    def calculate_cycle_used(self):
        """Calculate total cycle used based on logs"""
        total_hours = 0
        for log in self.eld_logs.all():
            # Only count DRIVING and ON_DUTY time towards cycle
            if log.status in ['DRIVING', 'ON_DUTY']:
                duration = log.end_time - log.start_time
                total_hours += duration.total_seconds() / 3600
        return round(total_hours, 1)

    def calculate_driving_hours(self):
        """Calculate total driving hours"""
        driving_hours = 0
        for log in self.eld_logs.all():
            if log.status == 'DRIVING':
                duration = log.end_time - log.start_time
                driving_hours += duration.total_seconds() / 3600
        return round(driving_hours, 1)

    def calculate_on_duty_hours(self):
        """Calculate total on-duty hours"""
        on_duty_hours = 0
        for log in self.eld_logs.all():
            if log.status in ['DRIVING', 'ON_DUTY']:
                duration = log.end_time - log.start_time
                on_duty_hours += duration.total_seconds() / 3600
        return round(on_duty_hours, 1)

    def calculate_off_duty_hours(self):
        """Calculate total off-duty hours"""
        off_duty_hours = 0
        for log in self.eld_logs.all():
            if log.status in ['OFF_DUTY', 'SLEEPER']:
                duration = log.end_time - log.start_time
                off_duty_hours += duration.total_seconds() / 3600
        return round(off_duty_hours, 1)

    def validate_regulatory_limits(self):
        """Validate against FMCSA regulations"""
        driving_hours = self.calculate_driving_hours()
        on_duty_hours = self.calculate_on_duty_hours()
        off_duty_hours = self.calculate_off_duty_hours()

        if driving_hours > self.MAX_DRIVING_HOURS:
            raise ValidationError(f"Driving hours ({driving_hours}) exceed maximum allowed ({self.MAX_DRIVING_HOURS})")
        
        if on_duty_hours > self.MAX_ON_DUTY_HOURS:
            raise ValidationError(f"On-duty hours ({on_duty_hours}) exceed maximum allowed ({self.MAX_ON_DUTY_HOURS})")
        
        if off_duty_hours < self.REQUIRED_OFF_DUTY_HOURS:
            raise ValidationError(f"Off-duty hours ({off_duty_hours}) are less than required ({self.REQUIRED_OFF_DUTY_HOURS})")

    def update_cycle_used(self):
        """Update the current_cycle_used field"""
        self.current_cycle_used = self.calculate_cycle_used()
        # self.validate_regulatory_limits()
        self.save()

    def __str__(self):
        return f"Trip from {self.pickup_location.get('address', '')} to {self.dropoff_location.get('address', '')}"

class ELDLog(models.Model):
    DUTY_STATUS_CHOICES = [
        ('ON_DUTY', 'On Duty (Not Driving)'),
        ('DRIVING', 'Driving'),
        ('OFF_DUTY', 'Off Duty'),
        ('SLEEPER', 'Sleeper Berth'),
    ]

    trip = models.ForeignKey(Trip, on_delete=models.CASCADE, related_name='eld_logs')
    status = models.CharField(max_length=10, choices=DUTY_STATUS_CHOICES)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    location = models.JSONField()  # Store lat/lng and address where status changed
    remarks = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['start_time']

    def clean(self):
        """Validate the log entry"""
        if self.end_time <= self.start_time:
            raise ValidationError("End time must be after start time")

    def save(self, *args, **kwargs):
        # Validate the log entry
        self.clean()
        # Save the log first
        super().save(*args, **kwargs)
        # Then update the trip's cycle
        self.trip.update_cycle_used()

    def __str__(self):
        return f"{self.status} from {self.start_time} to {self.end_time}"
