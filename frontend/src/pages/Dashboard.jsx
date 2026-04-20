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

  if (loading) return <div className="p-8 text-center dark:text-white">A carregar dados do Dashboard...</div>;
  if (error) return <div className="p-8 text-red-600 dark:text-red-400">Erro: {error}</div>;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800 dark:text-white">ERP - Fábrica 3D</h1>
          <div className="text-gray-600 dark:text-gray-300">Olá, {userName || 'Utilizador'}</div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Dashboard</h2>

        {/* Cards com totais - 6 colunas responsivas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded shadow text-center transition-colors">
            <h3 className="text-gray-500 dark:text-gray-400">Clientes</h3>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.totalCustomers}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded shadow text-center">
            <h3 className="text-gray-500 dark:text-gray-400">Produtos</h3>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.totalProducts}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded shadow text-center">
            <h3 className="text-gray-500 dark:text-gray-400">Encomendas (mês)</h3>
            <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{stats.ordersThisMonth}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded shadow text-center">
            <h3 className="text-gray-500 dark:text-gray-400">Faturação (mês)</h3>
            <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">€{stats.revenueThisMonth?.toFixed(2) || '0.00'}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded shadow text-center">
            <h3 className="text-gray-500 dark:text-gray-400">Saldo em Caixa</h3>
            <p className={`text-3xl font-bold ${(stats.currentBalance || 0) >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              €{(stats.currentBalance || 0).toFixed(2)}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded shadow text-center">
            <h3 className="text-gray-500 dark:text-gray-400">Encomendas Pagas</h3>
            <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{(stats.paidPercentage || 0).toFixed(1)}%</p>
          </div>
        </div>

        {/* Gráfico de vendas */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded shadow mb-8 transition-colors">
          <h3 className="text-lg font-semibold border-b pb-2 mb-4 text-gray-800 dark:text-white border-gray-200 dark:border-gray-700">
            📈 Evolução de Vendas
          </h3>
          <SalesChart monthlyData={stats.monthlyRevenue || []} />
        </div>

        {/* Alertas de stock baixo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded shadow transition-colors">
            <h3 className="text-lg font-semibold border-b pb-2 mb-4 text-gray-800 dark:text-white border-gray-200 dark:border-gray-700">
              ⚠️ Produtos com stock baixo
            </h3>
            {stats.lowStockProducts?.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">Todos os produtos têm stock adequado.</p>
            ) : (
              <ul className="space-y-2">
                {stats.lowStockProducts?.map(p => (
                  <li key={p.id} className="flex justify-between text-gray-700 dark:text-gray-300">
                    <span>{p.name}</span>
                    <span className="text-red-500 dark:text-red-400 font-semibold">{p.stock} unidades</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded shadow transition-colors">
            <h3 className="text-lg font-semibold border-b pb-2 mb-4 text-gray-800 dark:text-white border-gray-200 dark:border-gray-700">
              ⚠️ Matérias-primas com stock baixo
            </h3>
            {stats.lowStockRawMaterials?.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">Todas as matérias-primas têm stock adequado.</p>
            ) : (
              <ul className="space-y-2">
                {stats.lowStockRawMaterials?.map(m => (
                  <li key={m.id} className="flex justify-between text-gray-700 dark:text-gray-300">
                    <span>{m.name}</span>
                    <span className="text-red-500 dark:text-red-400 font-semibold">{m.stock} {m.unit}</span>
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