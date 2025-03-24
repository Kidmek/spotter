from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from models import Trip, ELDLog
from database import get_db
from schemas.eld_logs import ELDLogCreate, ELDLogResponse

router = APIRouter()

@router.post("/{trip_id}/add_log/", response_model=ELDLogResponse)
async def add_log(trip_id: int, log: ELDLogCreate, db: Session = Depends(get_db)):
    try:
        # Get the trip to check if it exists and get its creation time
        trip = db.query(Trip).filter(Trip.id == trip_id).first()
        if not trip:
            raise HTTPException(status_code=404, detail="Trip not found")

        # Get the most recent log for this trip
        last_log = (
            db.query(ELDLog)
            .filter(ELDLog.trip_id == trip_id)
            .order_by(ELDLog.end_time.desc())
            .first()
        )

        # Set start_time based on whether this is the first log or not
        if last_log is None:
            # If this is the first log, use the trip's creation time
            start_time = trip.created_at
        else:
            # If there are previous logs, use the end_time of the last log
            start_time = last_log.end_time

        # Create the new log entry
        db_log = ELDLog(
            trip_id=trip_id,
            status=log.status,
            start_time=start_time,
            end_time=log.end_time,
            remarks=log.remarks,
            location=log.location,
        )

        db.add(db_log)
        db.commit()
        db.refresh(db_log)

        return db_log
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e)) 