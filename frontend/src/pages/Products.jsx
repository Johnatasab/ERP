import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getProducts, deleteProduct } from '../services/product';
import ProductForm from '../components/ProductForm';

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  useEffect(() => {
    loadProducts();
  }, [page]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const response = await getProducts(page, limit);
      if (response && response.data) {
        setProducts(response.data);
        setTotalPages(response.pagination.totalPages);
      } else {
        setProducts([]);
        setTotalPages(1);
      }
    } catch (err) {
      console.error(err);
      setError('Erro ao carregar produtos');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Eliminar este produto?')) {
      try {
        await deleteProduct(id);
        loadProducts();
      } catch (err) {
        alert('Erro ao eliminar');
      }
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleNew = () => {
    setEditingProduct(null);
    setShowForm(true);
  };

  const handleFormSave = () => {
    setShowForm(false);
    loadProducts();
  };

  if (loading) return <div className="p-8 text-center">A carregar produtos...</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Produtos</h1>
        <button onClick={handleNew} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition">
          + Novo Produto
        </button>
      </div>

      <div className="bg-white rounded shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left">ID</th>
              <th className="px-4 py-2 text-left">Nome</th>
              <th className="px-4 py-2 text-left">Categoria</th>
              <th className="px-4 py-2 text-left">Preço (€)</th>
              <th className="px-4 py-2 text-left">Stock</th>
              <th className="px-4 py-2 text-left">Ações</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product.id} className="border-t hover:bg-gray-50 transition">
                <td className="px-4 py-2">{product.id}</td>
                <td className="px-4 py-2">{product.name}</td>
                <td className="px-4 py-2">{product.category || '-'}</td>
                <td className="px-4 py-2">{product.selling_price}</td>
                <td className="px-4 py-2">{product.stock ?? 0}</td>
                <td className="px-4 py-2">
                  <button onClick={() => handleEdit(product)} className="text-blue-500 mr-2 hover:underline">Editar</button>
                  <button onClick={() => handleDelete(product.id)} className="text-red-500 hover:underline">Eliminar</button>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr><td colSpan="6" className="text-center py-4 text-gray-500">Nenhum produto cadastrado</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Paginação melhorada */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            Mostrando página {page} de {totalPages}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex items-center gap-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition"
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

      {showForm && (
        <ProductForm
          product={editingProduct}
          onSave={handleFormSave}
          onCancel={() => setShowForm(false)}
        />
      )}
    </div>
  );
}

export default Products;