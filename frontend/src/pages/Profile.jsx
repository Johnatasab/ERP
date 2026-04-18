import { useEffect, useState } from 'react';
import { getProfile, updateProfile, updatePassword } from '../services/profile';

function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '' });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await getProfile();
      setUser(data);
      setFormData({ name: data.name, email: data.email });
    } catch (err) {
      setError('Erro ao carregar perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      const updated = await updateProfile(formData);
      setUser(updated);
      setMessage('Perfil atualizado com sucesso');
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao atualizar perfil');
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      await updatePassword(passwordData);
      setMessage('Password alterada com sucesso');
      setPasswordData({ currentPassword: '', newPassword: '' });
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao alterar password');
    }
  };

  if (loading) return <div className="p-8">A carregar...</div>;

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Meu Perfil</h1>
      {message && <div className="bg-green-100 text-green-700 p-2 rounded mb-4">{message}</div>}
      {error && <div className="bg-red-100 text-red-700 p-2 rounded mb-4">{error}</div>}

      {/* Formulário de dados pessoais */}
      <div className="bg-white p-6 rounded shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">Dados Pessoais</h2>
        <form onSubmit={handleProfileSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium">Nome</label>
            <input type="text" name="name" value={formData.name} onChange={handleProfileChange} className="w-full p-2 border rounded" required />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium">Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleProfileChange} className="w-full p-2 border rounded" required />
          </div>
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Atualizar Perfil</button>
        </form>
      </div>

      {/* Formulário de alteração de password */}
      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-xl font-semibold mb-4">Alterar Password</h2>
        <form onSubmit={handlePasswordSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium">Password Atual</label>
            <input type="password" name="currentPassword" value={passwordData.currentPassword} onChange={handlePasswordChange} className="w-full p-2 border rounded" required />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium">Nova Password</label>
            <input type="password" name="newPassword" value={passwordData.newPassword} onChange={handlePasswordChange} className="w-full p-2 border rounded" required />
          </div>
          <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">Alterar Password</button>
        </form>
      </div>
    </div>
  );
}

export default Profile;