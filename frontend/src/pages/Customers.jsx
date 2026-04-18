import { useEffect, useState } from 'react';
import { getCustomers, deleteCustomer } from '../services/customer';
import CustomerForm from '../components/CustomerForm';

function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  // Estados para paginação
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  useEffect(() => {
    loadCustomers();
  }, [page]); // recarregar quando a página mudar

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const response = await getCustomers(page, limit);
      setCustomers(response.data);
      setTotalPages(response.pagination.totalPages);
    } catch (err) {
      setError('Erro ao carregar clientes');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja eliminar este cliente?')) {
      try {
        await deleteCustomer(id);
        loadCustomers();
      } catch (err) {
        alert('Erro ao eliminar cliente');
      }
    }
  };

  const handleEdit = (customer) => {
    setEditingCustomer(customer);
    setShowForm(true);
  };

  const handleNew = () => {
    setEditingCustomer(null);
    setShowForm(true);
  };

  const handleFormSave = () => {
    setShowForm(false);
    loadCustomers();
  };

  const handleFormCancel = () => {
    setShowForm(false);
  };

  if (loading) return <div className="p-8">A carregar...</div>;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Clientes</h1>
        <button onClick={handleNew} className="bg-blue-500 text-white px-4 py-2 rounded">+ Novo Cliente</button>
      </div>

      {error && <div className="bg-red-100 text-red-700 p-2 rounded mb-4">{error}</div>}

      <div className="bg-white rounded shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left">ID</th>
              <th>Nome</th>
              <th>Email</th>
              <th>Telefone</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {customers.map(customer => (
              <tr key={customer.id} className="border-t">
                <td className="px-4 py-2">{customer.id}</td>
                <td className="px-4 py-2">{customer.name}</td>
                <td className="px-4 py-2">{customer.email}</td>
                <td className="px-4 py-2">{customer.phone || '-'}</td>
                <td className="px-4 py-2">
                  <button onClick={() => handleEdit(customer)} className="text-blue-500 mr-2">Editar</button>
                  <button onClick={() => handleDelete(customer.id)} className="text-red-500">Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Controles de paginação */}
      <div className="flex justify-between items-center mt-4">
        <button
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1}
          className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
        >
          Anterior
        </button>
        <span>Página {page} de {totalPages}</span>
        <button
          onClick={() => setPage(p => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
          className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
        >
          Próxima
        </button>
      </div>

      {showForm && (
        <CustomerForm
          customer={editingCustomer}
          onSave={handleFormSave}
          onCancel={handleFormCancel}
        />
      )}
    </div>
  );
}

export default Customers;