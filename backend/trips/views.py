from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.http import HttpResponse
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from io import BytesIO
from datetime import datetime, time,timezone
from .models import Trip, ELDLog
from .serializers import TripSerializer, ELDLogSerializer
from django.core.exceptions import ValidationError

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
        try:
            # Get the most recent log for this trip
            last_log = trip.eld_logs.order_by('-end_time').first()
            
            # Validate that the new log's end_time is after the last log's end_time
            if last_log and serializer.validated_data['end_time'] < last_log.end_time:
                return Response(
                    {'end_time': ['New log end time must be after the last log end time , which is ' + str(last_log.end_time.strftime("%Y-%m-%d %H:%M:%S"))]},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Set start_time based on whether this is the first log or not
            if last_log is None:
              
                first_off_duty_log = ELDLog.objects.create(
                    trip=trip,
                    status='OFF_DUTY',
                    end_time=trip.created_at,
                    location=trip.current_location,
                    start_time= trip.created_at.replace(hour=0, minute=0, second=0, microsecond=0),
                    remarks='Trip started'
                )
                first_off_duty_log.save()
                # If this is the first log, use the trip's creation time
                start_time = trip.created_at
            else:
                # If there are previous logs, use the end_time of the last log
                start_time = last_log.end_time
            
            # Save the log with the calculated start_time
            log = serializer.save(trip=trip, start_time=start_time)
            
            # Return the complete log data including start_time
            return Response(ELDLogSerializer(log).data, status=status.HTTP_201_CREATED)
        except ValidationError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def generate_pdf(request, pk):
    trip = get_object_or_404(Trip, pk=pk)
    logs = trip.eld_logs.all()


    # Create PDF
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter)
    styles = getSampleStyleSheet()
    elements = []

    # Create a style for wrapped text in table cells
    wrapped_style = ParagraphStyle(
        'WrappedStyle',
        parent=styles['Normal'],
        fontSize=10,
        leading=12  # Line spacing
    )
    # Title
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        spaceAfter=30,
        alignment=1  # Center alignment
    )
    elements.append(Paragraph("ELD Daily Log Sheet", title_style))

    # Trip Details Section
    trip_details = [
        ["Trip Details", ""],
        ["From:", Paragraph(trip.pickup_location.get('address', ''), wrapped_style)],
        ["To:", Paragraph(trip.dropoff_location.get('address', ''), wrapped_style)],
        ["Initial Location:", Paragraph(trip.current_location.get('address', ''), wrapped_style)],
        ["Initial Cycle Used:", f"{trip.current_cycle_used} hours"],
        ["Cycle Used:", f"{trip.calculate_cycle_used()} hours"],
        ["Created:", trip.created_at.strftime("%Y-%m-%d %H:%M")],
    ]

    trip_table = Table(trip_details, colWidths=[2*inch, 4*inch])
    trip_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 14),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
        ('TEXTCOLOR', (0, 1), (-1, -1), colors.black),
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 1), (-1, -1), 12),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
    ]))
    elements.append(trip_table)
    elements.append(Spacer(1, 20))

    # Logs Section
    elements.append(Paragraph("Log Entries", styles['Heading2']))
    
    # Logs Table Header
    log_headers = [
        ["Status", "Start Time", "End Time", "Duration", "Location", "Remarks"]
    ]

   
    # Logs Table Data
    for log in logs:
        start_time = datetime.strptime(str(log.start_time), "%Y-%m-%d %H:%M:%S.%f%z" if '.' in str(log.start_time)  else  "%Y-%m-%d %H:%M:%S%z")
        end_time = datetime.strptime(str(log.end_time), "%Y-%m-%d %H:%M:%S.%f%z" if '.' in str(log.end_time)  else  "%Y-%m-%d %H:%M:%S%z")
        duration = end_time - start_time
        hours = duration.total_seconds() / 3600

        # Wrap text in Paragraph objects for automatic line breaks
        log_headers.append([
            Paragraph(log.status, wrapped_style),
            start_time.strftime("%Y-%m-%d %H:%M"),
            end_time.strftime("%Y-%m-%d %H:%M"),
            f"{hours:.1f} hrs",
            Paragraph(log.location.get('address', ''), wrapped_style),
            Paragraph(log.remarks or '', wrapped_style)
        ])

    # Create logs table with adjusted row heights
    log_table = Table(
        log_headers, 
        colWidths=[1.2*inch, 1.5*inch, 1.5*inch, 1*inch, 2*inch, 1*inch],
        rowHeights=[20] + [None] * (len(log_headers) - 1)  # First row fixed, others auto
    )

    # Update table style to handle wrapped text
    log_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 12),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.white),
        ('TEXTCOLOR', (0, 1), (-1, -1), colors.black),
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 1), (-1, -1), 10),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),  # Align text to top of cell
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
    ]))
    elements.append(log_table)

    # Summary Section
    elements.append(Spacer(1, 20))
    elements.append(Paragraph("Summary", styles['Heading2']))
    
    summary_data = [
        ["Metric", "Hours", "Limit"],
        ["Driving Hours", f"{trip.calculate_driving_hours()}", "11"],
        ["On-Duty Hours", f"{trip.calculate_on_duty_hours()}", "14"],
        ["Off-Duty Hours", f"{trip.calculate_off_duty_hours()}", "10"],
        ["Cycle Used", f"{trip.current_cycle_used}", "11"],
    ]

    summary_table = Table(summary_data, colWidths=[2*inch, 1.5*inch, 1.5*inch])
    summary_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 12),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.white),
        ('TEXTCOLOR', (0, 1), (-1, -1), colors.black),
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 1), (-1, -1), 12),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ('ALIGN', (1, 1), (-1, -1), 'RIGHT'),  # Right align hours columns
    ]))
    elements.append(summary_table)

    # Build PDF
    doc.build(elements)
    
    buffer.seek(0)
    response = HttpResponse(buffer, content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename="trip_{pk}_logs.pdf"'
    
    return response
