import { useEffect, useState } from 'react';
import { getTransactions, createTransaction, deleteTransaction, getBalance, exportTransactions } from '../services/transaction';
import { ChevronLeft, ChevronRight } from 'lucide-react';

function Financeiro() {
  const [transactions, setTransactions] = useState([]);
  const [balance, setBalance] = useState({ total_receitas: 0, total_despesas: 0, balance: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ type: '', startDate: '', endDate: '' });
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    description: '',
    type: 'receita',
    amount: '',
    category: '',
    transaction_date: new Date().toISOString().slice(0, 10)
  });
  const [formError, setFormError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  useEffect(() => {
    loadTransactions();
    loadBalance();
  }, [page, filters]);

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const response = await getTransactions(page, limit, filters);
      setTransactions(response.data || []);
      setTotalPages(response.pagination?.totalPages || 1);
    } catch (err) {
      console.error(err);
      setError('Erro ao carregar transações');
    } finally {
      setLoading(false);
    }
  };

  const loadBalance = async () => {
    try {
      const data = await getBalance();
      setBalance(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
    setPage(1);
  };

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!formData.description || !formData.amount || !formData.type) {
      setFormError('Preencha descrição, valor e tipo');
      return;
    }
    try {
      await createTransaction(formData);
      setShowForm(false);
      setFormData({
        description: '',
        type: 'receita',
        amount: '',
        category: '',
        transaction_date: new Date().toISOString().slice(0, 10)
      });
      loadTransactions();
      loadBalance();
    } catch (err) {
      setFormError('Erro ao criar transação');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Eliminar esta transação?')) {
      try {
        await deleteTransaction(id);
        loadTransactions();
        loadBalance();
      } catch (err) {
        alert('Erro ao eliminar');
      }
    }
  };

  const clearFilters = () => {
    setFilters({ type: '', startDate: '', endDate: '' });
    setPage(1);
  };

  const exportReport = (format) => {
    exportTransactions(format, filters);
  };

  if (loading && transactions.length === 0) return <div className="p-8 text-center dark:text-white">A carregar transações...</div>;

  return (
    <div className="p-8 bg-gray-100 dark:bg-gray-900 min-h-screen transition-colors duration-200">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Financeiro</h1>
        <button onClick={() => setShowForm(true)} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition">+ Nova Transação</button>
      </div>

      {error && <div className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 p-2 rounded mb-4">{error}</div>}

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded shadow text-center transition-colors">
          <h3 className="text-gray-500 dark:text-gray-400">Receitas Totais</h3>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">€{balance.total_receitas.toFixed(2)}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded shadow text-center">
          <h3 className="text-gray-500 dark:text-gray-400">Despesas Totais</h3>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">€{balance.total_despesas.toFixed(2)}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded shadow text-center">
          <h3 className="text-gray-500 dark:text-gray-400">Saldo Atual</h3>
          <p className={`text-2xl font-bold ${balance.balance >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-orange-600 dark:text-orange-400'}`}>
            €{balance.balance.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Filtros e botões de exportação */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded shadow mb-6 flex flex-wrap gap-4 items-end transition-colors">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tipo</label>
          <select name="type" value={filters.type} onChange={handleFilterChange} className="border rounded p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
            <option value="">Todos</option>
            <option value="receita">Receita</option>
            <option value="despesa">Despesa</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Data Início</label>
          <input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} className="border rounded p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Data Fim</label>
          <input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} className="border rounded p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
        </div>
        <button onClick={clearFilters} className="bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 px-4 py-2 rounded hover:bg-gray-400 dark:hover:bg-gray-500 transition">Limpar</button>
        <div className="flex gap-2 ml-auto">
          <button onClick={() => exportReport('pdf')} className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded">PDF</button>
          <button onClick={() => exportReport('excel')} className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded">Excel</button>
          <button onClick={() => exportReport('csv')} className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded">CSV</button>
        </div>
      </div>

      {/* Tabela de transações */}
      <div className="bg-white dark:bg-gray-800 rounded shadow overflow-hidden transition-colors">
        <table className="min-w-full">
          <thead className="bg-gray-100 dark:bg-gray-700">
            <tr>
              <th className="px-4 py-2 text-left text-gray-700 dark:text-gray-200">Data</th>
              <th className="px-4 py-2 text-left text-gray-700 dark:text-gray-200">Descrição</th>
              <th className="px-4 py-2 text-left text-gray-700 dark:text-gray-200">Categoria</th>
              <th className="px-4 py-2 text-left text-gray-700 dark:text-gray-200">Tipo</th>
              <th className="px-4 py-2 text-left text-gray-700 dark:text-gray-200">Valor (€)</th>
              <th className="px-4 py-2 text-left text-gray-700 dark:text-gray-200">Ações</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map(trans => (
              <tr key={trans.id} className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                <td className="px-4 py-2 text-gray-900 dark:text-gray-100">{new Date(trans.transaction_date).toLocaleDateString()}</td>
                <td className="px-4 py-2 text-gray-900 dark:text-gray-100">{trans.description}</td>
                <td className="px-4 py-2 text-gray-900 dark:text-gray-100">{trans.category || '-'}</td>
                <td className="px-4 py-2">
                  <span className={`px-2 py-1 rounded text-xs ${trans.type === 'receita' ? 'bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200' : 'bg-red-200 dark:bg-red-800 text-red-800 dark:text-red-200'}`}>
                    {trans.type === 'receita' ? 'Receita' : 'Despesa'}
                  </span>
                </td>
                <td className="px-4 py-2 text-gray-900 dark:text-gray-100">€{parseFloat(trans.amount).toFixed(2)}</td>
                <td className="px-4 py-2">
                  <button onClick={() => handleDelete(trans.id)} className="text-red-500 dark:text-red-400 hover:underline">Eliminar</button>
                </td>
              </tr>
            ))}
            {transactions.length === 0 && (
              <tr className="border-t border-gray-200 dark:border-gray-700">
                <td colSpan="6" className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                  Nenhuma transação encontrada
                </td>
               </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400">Mostrando página {page} de {totalPages}</div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex items-center gap-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <ChevronLeft size={18} /> Anterior
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              Próxima <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Modal para nova transação */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded shadow-lg w-full max-w-md p-6 transition-colors">
            <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Nova Transação</h2>
            {formError && <div className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 p-2 rounded mb-4">{formError}</div>}
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Descrição *</label>
                <input type="text" name="description" value={formData.description} onChange={handleFormChange} required className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tipo *</label>
                <select name="type" value={formData.type} onChange={handleFormChange} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                  <option value="receita">Receita</option>
                  <option value="despesa">Despesa</option>
                </select>
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Valor (€) *</label>
                <input type="number" step="0.01" name="amount" value={formData.amount} onChange={handleFormChange} required className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Categoria</label>
                <input type="text" name="category" value={formData.category} onChange={handleFormChange} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Data</label>
                <input type="date" name="transaction_date" value={formData.transaction_date} onChange={handleFormChange} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded hover:bg-gray-400 dark:hover:bg-gray-500 transition">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Financeiro;