// src/pages/Register.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '../services/auth';

function Register() {
  // Estado para guardar os valores do formulário
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const navigate = useNavigate(); // para redirecionar após registo

  // Função chamada quando o formulário é submetido
  const handleSubmit = async (e) => {
    e.preventDefault(); // evita recarregar a página
    setError('');
    setSuccess('');

    try {
      // Chama a função de registo do serviço
      await register(name, email, password);
      setSuccess('Conta criada com sucesso! Redirecionando para o login...');
      // Após 2 segundos, vai para a página de login
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      // Se o erro tiver resposta da API, mostra a mensagem; senão, erro genérico
      const msg = err.response?.data?.error || 'Erro ao registar. Tente novamente.';
      setError(msg);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Criar Conta</h2>
        
        {error && <div className="bg-red-100 text-red-700 p-2 rounded mb-4">{error}</div>}
        {success && <div className="bg-green-100 text-green-700 p-2 rounded mb-4">{success}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Nome</label>
            <input
              type="text"
              className="w-full p-2 border rounded"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Email</label>
            <input
              type="email"
              className="w-full p-2 border rounded"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 mb-2">Password</label>
            <input
              type="password"
              className="w-full p-2 border rounded"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          >
            Registar
          </button>
        </form>
        
        <p className="mt-4 text-center text-sm">
          Já tem conta? <a href="/login" className="text-blue-500">Faça login</a>
        </p>
      </div>
    </div>
  );
}

export default Register;