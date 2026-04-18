import { useEffect, useState } from 'react';
import { getUser } from '../services/auth';
import SalesChart from '../components/SalesChart';

function Dashboard() {
  const [userName, setUserName] = useState('');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const user = getUser();
    if (user && user.name) setUserName(user.name);
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/dashboard/stats', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (!response.ok) throw new Error('Erro ao carregar estatísticas');
      const data = await response.json();
      setStats(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center">A carregar dados do Dashboard...</div>;
  if (error) return <div className="p-8 text-red-600">Erro: {error}</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800">ERP - Fábrica 3D</h1>
          <div className="text-gray-600">Olá, {userName || 'Utilizador'}</div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6">Dashboard</h2>

        {/* Cards com totais - agora com 6 colunas responsivas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
          <div className="bg-white p-6 rounded shadow text-center">
            <h3 className="text-gray-500">Clientes</h3>
            <p className="text-3xl font-bold text-blue-600">{stats.totalCustomers}</p>
          </div>
          <div className="bg-white p-6 rounded shadow text-center">
            <h3 className="text-gray-500">Produtos</h3>
            <p className="text-3xl font-bold text-green-600">{stats.totalProducts}</p>
          </div>
          <div className="bg-white p-6 rounded shadow text-center">
            <h3 className="text-gray-500">Encomendas (mês)</h3>
            <p className="text-3xl font-bold text-purple-600">{stats.ordersThisMonth}</p>
          </div>
          <div className="bg-white p-6 rounded shadow text-center">
            <h3 className="text-gray-500">Faturação (mês)</h3>
            <p className="text-3xl font-bold text-yellow-600">€{stats.revenueThisMonth?.toFixed(2) || '0.00'}</p>
          </div>
          <div className="bg-white p-6 rounded shadow text-center">
            <h3 className="text-gray-500">Saldo em Caixa</h3>
            <p className={`text-3xl font-bold ${(stats.currentBalance || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              €{(stats.currentBalance || 0).toFixed(2)}
            </p>
          </div>
          <div className="bg-white p-6 rounded shadow text-center">
            <h3 className="text-gray-500">Encomendas Pagas</h3>
            <p className="text-3xl font-bold text-indigo-600">{(stats.paidPercentage || 0).toFixed(1)}%</p>
          </div>
        </div>

        {/* Gráfico de vendas (últimos 6 meses) */}
        <div className="bg-white p-6 rounded shadow mb-8">
          <h3 className="text-lg font-semibold border-b pb-2 mb-4">📈 Evolução de Vendas</h3>
          <SalesChart monthlyData={stats.monthlyRevenue || []} />
        </div>

        {/* Alertas de stock baixo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded shadow">
            <h3 className="text-lg font-semibold border-b pb-2 mb-4">⚠️ Produtos com stock baixo</h3>
            {stats.lowStockProducts?.length === 0 ? (
              <p className="text-gray-500">Todos os produtos têm stock adequado.</p>
            ) : (
              <ul className="space-y-2">
                {stats.lowStockProducts?.map(p => (
                  <li key={p.id} className="flex justify-between">
                    <span>{p.name}</span>
                    <span className="text-red-500 font-semibold">{p.stock} unidades</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="bg-white p-6 rounded shadow">
            <h3 className="text-lg font-semibold border-b pb-2 mb-4">⚠️ Matérias-primas com stock baixo</h3>
            {stats.lowStockRawMaterials?.length === 0 ? (
              <p className="text-gray-500">Todas as matérias-primas têm stock adequado.</p>
            ) : (
              <ul className="space-y-2">
                {stats.lowStockRawMaterials?.map(m => (
                  <li key={m.id} className="flex justify-between">
                    <span>{m.name}</span>
                    <span className="text-red-500 font-semibold">{m.stock} {m.unit}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;