import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getOrders, deleteOrder, updateOrderStatus, updatePaymentStatus } from '../services/order';

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [tempStatus, setTempStatus] = useState({});
  const [tempPayment, setTempPayment] = useState({});
  const [saving, setSaving] = useState({});
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  useEffect(() => {
    loadOrders();
  }, [page]);

  const loadOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getOrders(page, limit);
      if (response && response.data) {
        setOrders(response.data);
        setTotalPages(response.pagination.totalPages);
        // Inicializar estados temporários
        const initialStatus = {};
        const initialPayment = {};
        response.data.forEach(order => {
          initialStatus[order.id] = order.status;
          initialPayment[order.id] = order.payment_status || 'Não pago';
        });
        setTempStatus(initialStatus);
        setTempPayment(initialPayment);
      } else {
        setOrders([]);
        setTotalPages(1);
      }
    } catch (err) {
      console.error(err);
      setError('Erro ao carregar encomendas');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Eliminar esta encomenda?')) {
      try {
        await deleteOrder(id);
        loadOrders();
      } catch (err) {
        alert('Erro ao eliminar');
      }
    }
  };

  const handleSave = async (orderId) => {
    setSaving(prev => ({ ...prev, [orderId]: true }));
    try {
      const currentOrder = orders.find(o => o.id === orderId);
      if (tempStatus[orderId] !== currentOrder.status) {
        await updateOrderStatus(orderId, tempStatus[orderId]);
      }
      if (tempPayment[orderId] !== (currentOrder.payment_status || 'Não pago')) {
        await updatePaymentStatus(orderId, tempPayment[orderId]);
      }
      await loadOrders();
    } catch (err) {
      alert('Erro ao salvar alterações');
    } finally {
      setSaving(prev => ({ ...prev, [orderId]: false }));
    }
  };

  const exportReport = (format) => {
    let url = `http://localhost:3000/api/orders/export?format=${format}`;
    if (startDate) url += `&startDate=${startDate}`;
    if (endDate) url += `&endDate=${endDate}`;
    window.open(url, '_blank');
  };

  if (loading) return <div className="p-8 text-center dark:text-white">A carregar encomendas...</div>;
  if (error) return <div className="p-8 text-red-600 dark:text-red-400">{error}</div>;

  return (
    <div className="p-8 bg-gray-100 dark:bg-gray-900 min-h-screen transition-colors duration-200">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Encomendas</h1>
        <Link to="/orders/new">
          <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition">+ Nova Encomenda</button>
        </Link>
      </div>

      {/* Filtros e botões de exportação */}
      <div className="flex flex-wrap gap-2 mb-4 items-end">
        <div>
          <label className="block text-sm text-gray-700 dark:text-gray-300">Data Início</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border rounded p-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-700 dark:text-gray-300">Data Fim</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border rounded p-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>
        <button onClick={() => exportReport('pdf')} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded">PDF</button>
        <button onClick={() => exportReport('excel')} className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded">Excel</button>
        <button onClick={() => exportReport('csv')} className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded">CSV</button>
      </div>

      {/* Tabela de encomendas */}
      <div className="bg-white dark:bg-gray-800 rounded shadow overflow-hidden transition-colors">
        <table className="min-w-full">
          <thead className="bg-gray-100 dark:bg-gray-700">
            <tr>
              <th className="px-4 py-2 text-left text-gray-700 dark:text-gray-200">ID</th>
              <th className="px-4 py-2 text-left text-gray-700 dark:text-gray-200">Cliente</th>
              <th className="px-4 py-2 text-left text-gray-700 dark:text-gray-200">Data</th>
              <th className="px-4 py-2 text-left text-gray-700 dark:text-gray-200">Total (€)</th>
              <th className="px-4 py-2 text-left text-gray-700 dark:text-gray-200">Status</th>
              <th className="px-4 py-2 text-left text-gray-700 dark:text-gray-200">Pagamento</th>
              <th className="px-4 py-2 text-left text-gray-700 dark:text-gray-200">Ações</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id} className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                <td className="px-4 py-2 text-gray-900 dark:text-gray-100">{order.id}</td>
                <td className="px-4 py-2 text-gray-900 dark:text-gray-100">{order.customer_name}</td>
                <td className="px-4 py-2 text-gray-900 dark:text-gray-100">{new Date(order.order_date).toLocaleDateString()}</td>
                <td className="px-4 py-2 text-gray-900 dark:text-gray-100">{order.total_amount}€</td>
                <td className="px-4 py-2">
                  <select
                    value={tempStatus[order.id] || order.status}
                    onChange={(e) => setTempStatus(prev => ({ ...prev, [order.id]: e.target.value }))}
                    className="border rounded p-1 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option>Pendente</option>
                    <option>Em produção</option>
                    <option>Entregue a transportadora</option>
                    <option>Entregue/Concluído</option>
                  </select>
                </td>
                <td className="px-4 py-2">
                  <select
                    value={tempPayment[order.id] || order.payment_status || 'Não pago'}
                    onChange={(e) => setTempPayment(prev => ({ ...prev, [order.id]: e.target.value }))}
                    className="border rounded p-1 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option>Não pago</option>
                    <option>Pago</option>
                  </select>
                </td>
                <td className="px-4 py-2 whitespace-nowrap">
                  <button
                    onClick={() => handleSave(order.id)}
                    disabled={saving[order.id]}
                    className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm mr-2 disabled:opacity-50 transition"
                  >
                    {saving[order.id] ? 'A salvar...' : 'Salvar'}
                  </button>
                  <Link to={`/orders/${order.id}`} className="text-blue-500 dark:text-blue-400 mr-2 hover:underline">Ver</Link>
                  <button onClick={() => handleDelete(order.id)} className="text-red-500 dark:text-red-400 hover:underline">Eliminar</button>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr className="border-t border-gray-200 dark:border-gray-700">
                <td colSpan="7" className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                  Nenhuma encomenda encontrada
                </td>
               </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Mostrando página {page} de {totalPages}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex items-center gap-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <ChevronLeft size={18} />
              Anterior
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              Próxima
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Orders;