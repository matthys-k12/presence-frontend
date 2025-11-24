import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../api/config';

const Register = () => {
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    motDePasse: '',
    filiere: '',
    niveau: '',
    comite: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/register`, formData);
      setSuccess('Inscription réussie! Vous pouvez maintenant vous connecter.');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2>Inscription</h2>
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="nom">Nom *</label>
          <input
            type="text"
            id="nom"
            name="nom"
            value={formData.nom}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="prenom">Prénom *</label>
          <input
            type="text"
            id="prenom"
            name="prenom"
            value={formData.prenom}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email *</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="motDePasse">Mot de passe *</label>
          <input
            type="password"
            id="motDePasse"
            name="motDePasse"
            value={formData.motDePasse}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="filiere">Filière *</label>
          <select
            id="filiere"
            name="filiere"
            value={formData.filiere}
            onChange={handleChange}
            required
          >
            <option value="">— Sélectionnez —</option>
            <option value="SRIT">SRIT</option>
            <option value="SIGL">SIGL</option>
            <option value="TWIN">TWIN</option>
            <option value="CSIA">CSIA</option>
            <option value="ENTD">ENTD</option>
            <option value="MBDS">MBDS</option>
            <option value="BIHAR">BIHAR</option>
            <option value="RTEL">RTEL</option>
            <option value="SITW">SITW</option>
            <option value="MP2I">MP2I</option>
            <option value="MPI">MPI</option>
            <option value="ERIS">ERIS</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="niveau">Niveau *</label>
          <select
            id="niveau"
            name="niveau"
            value={formData.niveau}
            onChange={handleChange}
            required
          >
            <option value="">— Sélectionnez —</option>
            <option value="L1">Licence 1</option>
            <option value="L2">Licence 2</option>
            <option value="L3">Licence 3</option>
            <option value="M1">Master 1</option>
            <option value="M2">Master 2</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="comite">Comité *</label>
          <select
            id="comite"
            name="comite"
            value={formData.comite}
            onChange={handleChange}
            required
          >
            <option value="">— Sélectionnez —</option>
            <option value="Comité Étudiant">Comité Digital</option>
            <option value="Comité Communiction">Comité Communication</option>
            <option value="Comité Protocole">Comité Protocole</option>
            <option value="Comité Sécrétariat">Comité Sécrétariat</option>
            <option value="Autre">Autre</option>
          </select>
        </div>

        <button type="submit" className="btn" disabled={loading}>
          {loading ? 'Inscription...' : 'S\'inscrire'}
        </button>
      </form>

      <p style={{ textAlign: 'center', marginTop: '1rem' }}>
        Déjà inscrit? <Link to="/login">Se connecter</Link>
      </p>
    </div>
  );
};

export default Register;
