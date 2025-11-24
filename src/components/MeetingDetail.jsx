import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../api/config';
import QRCode from 'qrcode';

const MeetingDetail = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [meeting, setMeeting] = useState(null);
  const [qrCode, setQrCode] = useState('');
  const [attendances, setAttendances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMeeting();
  }, [id]);

  const fetchMeeting = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/meetings/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMeeting(response.data);

      // Generate QR code
      const qr = await QRCode.toDataURL(response.data.code);
      setQrCode(qr);

      // Fetch attendances for this meeting
      fetchAttendances(id);
    } catch (err) {
      setError('Erreur lors du chargement de la réunion');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendances = async (meetingId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/attendance/meeting/${meetingId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAttendances(response.data.attendances);
    } catch (err) {
      console.error('Erreur lors de la récupération des présences:', err);
    }
  };

  const downloadQRCode = () => {
    if (!qrCode || !meeting) return;

    const link = document.createElement('a');
    link.href = qrCode;
    link.download = `qr-code-${meeting.titre.replace(/\s+/g, '-').toLowerCase()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return <div className="loading">Chargement...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Détails de la réunion</h1>
        <button onClick={() => navigate(user.role === 'admin' ? '/admin' : '/member')} className="btn">
          Retour
        </button>
      </div>

      <div className="card">
        <h2>{meeting.titre}</h2>
        <p><strong>Date:</strong> {new Date(meeting.date).toLocaleString()}</p>
        <p><strong>Code:</strong> {meeting.code}</p>

        <div className="qr-code">
          <img src={qrCode} alt="QR Code" />
        </div>
        <button onClick={downloadQRCode} className="btn">
          Télécharger QR Code
        </button>
      </div>

      <div className="card">
        <h3>Présences ({attendances.length})</h3>
        {attendances.length === 0 ? (
          <p>Aucune présence enregistrée pour cette réunion.</p>
        ) : (
          <ul className="attendance-list">
            {attendances.map((attendance) => (
              <li key={attendance._id} className="attendance-item">
                <strong>{attendance.userId?.nom} {attendance.userId?.prenom}</strong><br />
                <strong>Email:</strong> {attendance.userId?.email}<br />
                <strong>Date d'enregistrement:</strong> {new Date(attendance.presenceAt).toLocaleString()}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default MeetingDetail;
