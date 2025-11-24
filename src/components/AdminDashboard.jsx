import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import QRCode from 'qrcode';
import { API_BASE_URL } from '../api/config';

const AdminDashboard = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [meetings, setMeetings] = useState([]);
  const [attendances, setAttendances] = useState([]);
  const [newMeeting, setNewMeeting] = useState({ titre: '', date: '' });
  const [qrCode, setQrCode] = useState('');
  const [currentMeeting, setCurrentMeeting] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchMeetings();
    fetchAttendances();
  }, []);

  const fetchMeetings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/meetings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMeetings(response.data);
    } catch (err) {
      console.error('Erreur lors de la récupération des réunions:', err);
    }
  };

  const fetchAttendances = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/attendance`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAttendances(response.data.attendances);
    } catch (err) {
      console.error('Erreur lors de la récupération des présences:', err);
    }
  };

  const handleCreateMeeting = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_BASE_URL}/api/meetings`, newMeeting, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setMeetings([...meetings, response.data.meeting]);
      setNewMeeting({ titre: '', date: '' });
      setSuccess('Réunion créée avec succès!');
      // Navigate to meeting detail page
      navigate(`/meeting/${response.data.meeting._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  const generateQRCode = async (meeting) => {
    try {
      const qr = await QRCode.toDataURL(meeting.code);
      setQrCode(qr);
      setCurrentMeeting(meeting);
    } catch (err) {
      console.error('Erreur génération QR:', err);
    }
  };

  const downloadQRCode = () => {
    if (!qrCode || !currentMeeting) return;

    const link = document.createElement('a');
    link.href = qrCode;
    link.download = `qr-code-${currentMeeting.titre.replace(/\s+/g, '-').toLowerCase()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const viewAttendances = async (meetingId) => {
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

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Tableau de bord Admin</h1>
        <button onClick={onLogout} className="logout-btn">Déconnexion</button>
      </div>

      <div className="card">
        <h2>Informations utilisateur</h2>
        <p><strong>Nom:</strong> {user.nom} {user.prenom}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Rôle:</strong> {user.role}</p>
      </div>

      <div className="card">
        <h2>Créer une nouvelle réunion</h2>
        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}
        <form onSubmit={handleCreateMeeting}>
          <div className="form-group">
            <label htmlFor="titre">Titre de la réunion</label>
            <input
              type="text"
              id="titre"
              value={newMeeting.titre}
              onChange={(e) => setNewMeeting({ ...newMeeting, titre: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="date">Date et heure</label>
            <input
              type="datetime-local"
              id="date"
              value={newMeeting.date}
              onChange={(e) => setNewMeeting({ ...newMeeting, date: e.target.value })}
              required
            />
          </div>
          <button type="submit" className="btn" disabled={loading}>
            {loading ? 'Création...' : 'Créer la réunion'}
          </button>
        </form>
      </div>

      {qrCode && currentMeeting && (
        <div className="card">
          <h2>QR Code pour la réunion: {currentMeeting.titre}</h2>
          <div className="qr-code">
            <img src={qrCode} alt="QR Code" />
          </div>
          <p>Code: {currentMeeting.code}</p>
          <p>Date: {new Date(currentMeeting.date).toLocaleString()}</p>
          <button onClick={downloadQRCode} className="btn">
            Télécharger QR Code
          </button>
        </div>
      )}

      <div className="card">
        <h2>Réunions existantes</h2>
        <div className="meeting-list">
          {meetings.map((meeting) => (
            <div key={meeting._id} className="meeting-item">
              <h3>{meeting.titre}</h3>
              <p>Date: {new Date(meeting.date).toLocaleString()}</p>
              <p>Code: {meeting.code}</p>
              <button onClick={() => generateQRCode(meeting)} className="btn">
                Générer QR Code
              </button>
              <button onClick={() => navigate(`/meeting/${meeting._id}`)} className="btn">
                Voir détails
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h2>Présences par réunion</h2>
        {meetings.length === 0 ? (
          <p>Aucune réunion trouvée.</p>
        ) : (
          meetings.map((meeting) => {
            const meetingAttendances = attendances.filter(a => a.meetingId?._id === meeting._id);
            if (meetingAttendances.length === 0) return null;

            return (
              <div key={meeting._id} className="meeting-attendance-section">
                <h3>{meeting.titre}</h3>
                <p><strong>Date:</strong> {new Date(meeting.date).toLocaleString()}</p>
                <p><strong>Nombre de présences:</strong> {meetingAttendances.length}</p>
                <ul className="attendance-list">
                  {meetingAttendances.map((attendance) => (
                    <li key={attendance._id} className="attendance-item">
                      <strong>Utilisateur:</strong> {attendance.userId?.nom} {attendance.userId?.prenom}<br />
                      <strong>Date d'enregistrement:</strong> {new Date(attendance.presenceAt).toLocaleString()}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
