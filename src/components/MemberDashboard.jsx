import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import QrScanner from 'react-qr-scanner';
import { API_BASE_URL } from '../api/config';

const MemberDashboard = ({ user, onLogout }) => {
  const [attendances, setAttendances] = useState([]);
  const [scanning, setScanning] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [lastScannedCode, setLastScannedCode] = useState(null);
  const scannerRef = useRef(null);

  useEffect(() => {
    fetchAttendances();
  }, []);

  const fetchAttendances = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/attendance`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAttendances(response.data.attendances);
    } catch (err) {
      console.error('Erreur lors de la récupération des présences:', err);
      setError('Erreur lors de la récupération des présences');
    }
  };

  const handleScan = async (data) => {
    if (data) {
      // Selon la version de react-qr-scanner, data peut être un string ou un objet { text: ... }
      const scannedCode = typeof data === 'string' ? data : data?.text;

      if (scannedCode && scannedCode !== lastScannedCode) {
        // Vérifier si la réunion correspondante est déjà dans la liste des présences
        const alreadyPresent = attendances.some(att =>
          att.meetingId && (att.meetingId._id === scannedCode || att.meetingId.titre === scannedCode)
        );

        if (alreadyPresent) {
          setMessage('Présence déjà enregistrée pour cette réunion.');
          setLastScannedCode(scannedCode);
          setError('');
          // Ne pas renvoyer la requête au backend
          return;
        }

        setLastScannedCode(scannedCode);
        setError('');
        setMessage('Traitement du scan...');

        try {
          const token = localStorage.getItem('token');
          // Envoyer le code du QR (identifiant réunion) au backend avec token utilisateur
          const response = await axios.post(`${API_BASE_URL}/api/attendance/scan`, {
            meetingCode: scannedCode
          }, {
            headers: { Authorization: `Bearer ${token}` }
          });

          setMessage(`Présence enregistrée pour la réunion: ${response.data.meeting.titre}`);

          // Actualiser la liste des présences après un court délai
          setTimeout(() => {
            fetchAttendances();
            setMessage('');
            setLastScannedCode(null);
          }, 1500);
        } catch (err) {
          setError(err.response?.data?.message || 'Erreur lors de l\'enregistrement');
          setTimeout(() => {
            setError('');
            setLastScannedCode(null);
          }, 3000);
        }
      }
    }
  };

  const handleError = (err) => {
    console.error('Erreur du scanner:', err);
    setError('Erreur du scanner QR');
  };

  const startScanning = () => {
    setScanning(true);
    setError('');
    setMessage('');
    setLastScannedCode(null);
  };

  const stopScanning = () => {
    setScanning(false);
    setLastScannedCode(null);
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Tableau de bord Membre</h1>
        <button onClick={onLogout} className="logout-btn">Déconnexion</button>
      </div>

      <div className="card">
        <h2>Informations utilisateur</h2>
        <p><strong>Nom:</strong> {user.nom} {user.prenom}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Filière:</strong> {user.filiere}</p>
        <p><strong>Niveau:</strong> {user.niveau}</p>
        <p><strong>Comité:</strong> {user.comite}</p>
      </div>

      <div className="card">
        <h2>Enregistrer ma présence</h2>

        {!scanning ? (
          <button onClick={startScanning} className="btn">Scanner le QR code</button>
        ) : (
          <div className="scanner-container">
            <QrScanner
              ref={scannerRef}
              onScan={handleScan}
              onError={handleError}
              style={{ width: '100%', maxWidth: '400px' }}
              facingMode="environment" // caméra arrière
            />
            <button onClick={stopScanning} className="btn btn-danger">Arrêter le scan</button>
          </div>
        )}

        {message && <div className="success">{message}</div>}
        {error && <div className="error">{error}</div>}
      </div>

      <div className="card">
        <h2>Mes présences</h2>
        {attendances.length === 0 ? (
          <p>Aucune présence enregistrée.</p>
        ) : (
          <ul className="attendance-list">
            {attendances.map((attendance) => (
              <li key={attendance._id} className="attendance-item">
                <strong>Réunion:</strong> {attendance.meetingId?.titre || 'N/A'}<br />
                <strong>Date:</strong> {new Date(attendance.presenceAt).toLocaleString()}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default MemberDashboard;
