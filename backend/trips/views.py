from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.http import HttpResponse
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from io import BytesIO
from datetime import datetime, timedelta
from .models import Trip, ELDLog
from .serializers import TripSerializer, ELDLogSerializer

@api_view(['GET', 'POST'])
def trip_list(request):
    if request.method == 'GET':
        trips = Trip.objects.all()
        serializer = TripSerializer(trips, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        serializer = TripSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
def trip_detail(request, pk):
    trip = get_object_or_404(Trip, pk=pk)
    
    if request.method == 'GET':
        serializer = TripSerializer(trip)
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        serializer = TripSerializer(trip, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        trip.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['POST'])
def add_log(request, trip_id):
    trip = get_object_or_404(Trip, pk=trip_id)
    serializer = ELDLogSerializer(data=request.data)
    
    if serializer.is_valid():
        # Get the most recent log for this trip
        last_log = trip.eld_logs.order_by('-end_time').first()
        
        # Validate that the new log's end_time is after the last log's end_time
        if last_log and serializer.validated_data['end_time'] <= last_log.end_time:
            return Response(
                {'end_time': ['New log end time must be after the last log end time']},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Set start_time based on whether this is the first log or not
        if last_log is None:
            # If this is the first log, use the trip's creation time
            start_time = trip.created_at
        else:
            # If there are previous logs, use the end_time of the last log
            start_time = last_log.end_time
        
        # Save the log with the calculated start_time
        log = serializer.save(trip=trip, start_time=start_time)
        
        # Return the complete log data including start_time
        return Response(ELDLogSerializer(log).data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def generate_pdf(request, pk):
    trip = get_object_or_404(Trip, pk=pk)
    logs = trip.eld_logs.all()

    # Create PDF
    buffer = BytesIO()
    p = canvas.Canvas(buffer, pagesize=letter)
    
    # Add header
    p.setFont("Helvetica-Bold", 16)
    p.drawString(50, 750, "ELD Daily Log Sheet")
    
    # Add trip details
    p.setFont("Helvetica", 12)
    p.drawString(50, 720, f"From: {trip.pickup_location.get('address', '')}")
    p.drawString(50, 700, f"To: {trip.dropoff_location.get('address', '')}")
    p.drawString(50, 680, f"Current Cycle Used: {trip.current_cycle_used} hours")
    
    # Add logs
    y_position = 650
    for log in logs:
        p.drawString(50, y_position, f"Status: {log.status}")
        p.drawString(50, y_position - 20, f"Start: {log.start_time}")
        p.drawString(50, y_position - 40, f"End: {log.end_time}")
        y_position -= 80
        
        if y_position < 50:  # Start new page if needed
            p.showPage()
            p.setFont("Helvetica", 12)
            y_position = 750
    
    p.showPage()
    p.save()
    
    buffer.seek(0)
    response = HttpResponse(buffer, content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename="trip_{pk}_logs.pdf"'
    
    return response
