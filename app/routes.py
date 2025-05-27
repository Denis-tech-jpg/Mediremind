from flask import jsonify, request
from datetime import datetime, timedelta
from . import db
from .models import Appointment, Patient

def init_routes(app):
    @app.route('/seed', methods=['POST'])
    def seed_data():
        # Clear existing data
        Appointment.query.delete()
        Patient.query.delete()
        
        # Create sample patients
        patients = [
            Patient(name='John Smith', phone='555-0101', email='john@example.com'),
            Patient(name='Sarah Johnson', phone='555-0102', email='sarah@example.com'),
            Patient(name='Michael Brown', phone='555-0103', email='michael@example.com'),
            Patient(name='Emily Davis', phone='555-0104', email='emily@example.com'),
            Patient(name='David Wilson', phone='555-0105', email='david@example.com')
        ]
        
        for patient in patients:
            db.session.add(patient)
        db.session.commit()
        
        # Create appointments for each patient
        now = datetime.utcnow()
        for i, patient in enumerate(patients):
            appointments = [
                Appointment(
                    patient_id=patient.id,
                    appointment_date=now + timedelta(days=i, hours=9),
                    status='pending'
                ),
                Appointment(
                    patient_id=patient.id,
                    appointment_date=now + timedelta(days=i+7, hours=14),
                    status='pending'
                )
            ]
            for appointment in appointments:
                db.session.add(appointment)
        
        db.session.commit()
        
        return jsonify({'message': 'Sample data created successfully'})

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

    @app.route('/appointments', methods=['POST'])
    def create_appointment():
        data = request.get_json()
        appointment = Appointment(
            patient_id=data['patient_id'],
            appointment_date=datetime.fromisoformat(data['appointment_date'].replace('Z', '+00:00')),
            status=data['status']
        )
        db.session.add(appointment)
        db.session.commit()
        return jsonify({
            'id': appointment.id,
            'patient_id': appointment.patient_id,
            'appointment_date': appointment.appointment_date.isoformat(),
            'status': appointment.status
        })

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

    @app.route('/patients', methods=['GET'])
    def get_patients():
        patients = Patient.query.all()
        return jsonify([{
            'id': patient.id,
            'name': patient.name,
            'phone': patient.phone,
            'email': patient.email
        } for patient in patients])

    @app.route('/patients', methods=['POST'])
    def create_patient():
        data = request.get_json()
        patient = Patient(
            name=data['name'],
            phone=data['phone'],
            email=data.get('email')
        )
        db.session.add(patient)
        db.session.commit()
        return jsonify({
            'id': patient.id,
            'name': patient.name,
            'phone': patient.phone,
            'email': patient.email
        })