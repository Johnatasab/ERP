import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getTransactions, createTransaction, deleteTransaction, getBalance, exportTransactions } from '../services/transaction';

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
  // Paginação
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  // Carregar transações e saldo quando os filtros ou página mudarem
  useEffect(() => {
    loadTransactions();
    loadBalance();
  }, [page, filters]);

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const response = await getTransactions(page, limit, filters);
      // A API retorna { data: [], pagination: {} }
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
    setPage(1); // resetar página ao filtrar
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
      // Recarregar dados
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

  if (loading && transactions.length === 0) return <div className="p-8 text-center">A carregar transações...</div>;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Financeiro</h1>
        <button onClick={() => setShowForm(true)} className="bg-blue-500 text-white px-4 py-2 rounded">+ Nova Transação</button>
      </div>

      {error && <div className="bg-red-100 text-red-700 p-2 rounded mb-4">{error}</div>}

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded shadow text-center">
          <h3 className="text-gray-500">Receitas Totais</h3>
          <p className="text-2xl font-bold text-green-600">€{balance.total_receitas.toFixed(2)}</p>
        </div>
        <div className="bg-white p-6 rounded shadow text-center">
          <h3 className="text-gray-500">Despesas Totais</h3>
          <p className="text-2xl font-bold text-red-600">€{balance.total_despesas.toFixed(2)}</p>
        </div>
        <div className="bg-white p-6 rounded shadow text-center">
          <h3 className="text-gray-500">Saldo Atual</h3>
          <p className={`text-2xl font-bold ${balance.balance >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
            €{balance.balance.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded shadow mb-6 flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-sm font-medium">Tipo</label>
          <select name="type" value={filters.type} onChange={handleFilterChange} className="border rounded p-2">
            <option value="">Todos</option>
            <option value="receita">Receita</option>
            <option value="despesa">Despesa</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium">Data Início</label>
          <input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} className="border rounded p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium">Data Fim</label>
          <input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} className="border rounded p-2" />
          <div className="flex gap-2 ml-auto">
            <button onClick={() => exportTransactions('pdf', filters)} className="bg-red-500 text-white px-3 py-2 rounded">PDF</button>
            <button onClick={() => exportTransactions('excel', filters)} className="bg-green-500 text-white px-3 py-2 rounded">Excel</button>
            <button onClick={() => exportTransactions('csv', filters)} className="bg-blue-500 text-white px-3 py-2 rounded">CSV</button>
          </div>
        </div>
        <button onClick={clearFilters} className="bg-gray-300 px-4 py-2 rounded">Limpar</button>
      </div>

      {/* Tabela de transações */}
      <div className="bg-white rounded shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left">Data</th>
              <th className="px-4 py-2 text-left">Descrição</th>
              <th className="px-4 py-2 text-left">Categoria</th>
              <th className="px-4 py-2 text-left">Tipo</th>
              <th className="px-4 py-2 text-left">Valor (€)</th>
              <th className="px-4 py-2 text-left">Ações</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map(trans => (
              <tr key={trans.id} className="border-t">
                <td className="px-4 py-2">{new Date(trans.transaction_date).toLocaleDateString()}</td>
                <td className="px-4 py-2">{trans.description}</td>
                <td className="px-4 py-2">{trans.category || '-'}</td>
                <td className="px-4 py-2">
                  <span className={`px-2 py-1 rounded text-xs ${trans.type === 'receita' ? 'bg-green-200' : 'bg-red-200'}`}>
                    {trans.type === 'receita' ? 'Receita' : 'Despesa'}
                  </span>
                </td>
                <td className="px-4 py-2">€{parseFloat(trans.amount).toFixed(2)}</td>
                <td className="px-4 py-2">
                  <button onClick={() => handleDelete(trans.id)} className="text-red-500">Eliminar</button>
                </td>
              </tr>
            ))}
            {transactions.length === 0 && (
              <tr><td colSpan="6" className="text-center py-4">Nenhuma transação encontrada</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-600">Mostrando página {page} de {totalPages}</div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex items-center gap-1 px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
            >
              <ChevronLeft size={18} /> Anterior
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
            >
              Próxima <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Modal para nova transação */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded shadow-lg w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4">Nova Transação</h2>
            {formError && <div className="bg-red-100 text-red-700 p-2 rounded mb-4">{formError}</div>}
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="block text-sm font-medium">Descrição *</label>
                <input type="text" name="description" value={formData.description} onChange={handleFormChange} required className="w-full p-2 border rounded" />
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium">Tipo *</label>
                <select name="type" value={formData.type} onChange={handleFormChange} className="w-full p-2 border rounded">
                  <option value="receita">Receita</option>
                  <option value="despesa">Despesa</option>
                </select>
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium">Valor (€) *</label>
                <input type="number" step="0.01" name="amount" value={formData.amount} onChange={handleFormChange} required className="w-full p-2 border rounded" />
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium">Categoria</label>
                <input type="text" name="category" value={formData.category} onChange={handleFormChange} className="w-full p-2 border rounded" />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium">Data</label>
                <input type="date" name="transaction_date" value={formData.transaction_date} onChange={handleFormChange} className="w-full p-2 border rounded" />
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 bg-gray-300 rounded">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Financeiro;