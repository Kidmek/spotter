from django.db import models

# Create your models here.

class Trip(models.Model):
    current_location = models.JSONField()  # Store lat/lng and address
    pickup_location = models.JSONField()
    dropoff_location = models.JSONField()
    current_cycle_used = models.FloatField()  # Hours
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Trip from {self.pickup_location.get('address')} to {self.dropoff_location.get('address')}"

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

    def __str__(self):
        return f"{self.status} from {self.start_time} to {self.end_time}"
