from flask import jsonify, request
from datetime import datetime
from . import db
from .models import Appointment, Patient

def init_routes(app):
    @app.route('/appointments', methods=['GET'])
    def get_appointments():
        appointments = Appointment.query.all()
        return jsonify([{
            'id': apt.id,
            'patient_id': apt.patient_id,
            'appointment_date': apt.appointment_date.isoformat(),
            'status': apt.status,
            'patient': {
                'id': apt.patient.id,
                'name': apt.patient.name,
                'phone': apt.patient.phone,
                'email': apt.patient.email
            }
        } for apt in appointments])

    @app.route('/appointments/<int:id>', methods=['PATCH'])
    def update_appointment(id):
        appointment = Appointment.query.get_or_404(id)
        data = request.get_json()
        if 'status' in data:
            appointment.status = data['status']
            db.session.commit()
        return jsonify({
            'id': appointment.id,
            'patient_id': appointment.patient_id,
            'appointment_date': appointment.appointment_date.isoformat(),
            'status': appointment.status
        })