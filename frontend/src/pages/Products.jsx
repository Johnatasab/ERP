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

  if (loading) return <div className="p-8 text-center dark:text-white">A carregar produtos...</div>;
  if (error) return <div className="p-8 text-red-600 dark:text-red-400">{error}</div>;

   return (
    <div className="p-8 bg-gray-100 dark:bg-gray-900 min-h-screen transition-colors duration-200">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Produtos</h1>
        <button onClick={handleNew} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition">
          + Novo Produto
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded shadow overflow-hidden transition-colors">
        <table className="min-w-full">
          <thead className="bg-gray-100 dark:bg-gray-700">
            <tr>
              <th className="px-4 py-2 text-left text-gray-700 dark:text-gray-200">ID</th>
              <th className="px-4 py-2 text-left text-gray-700 dark:text-gray-200">Código</th>
              <th className="px-4 py-2 text-left text-gray-700 dark:text-gray-200">Nome</th>
              <th className="px-4 py-2 text-left text-gray-700 dark:text-gray-200">Cor</th>
              <th className="px-4 py-2 text-left text-gray-700 dark:text-gray-200">Tamanho</th>
              <th className="px-4 py-2 text-left text-gray-700 dark:text-gray-200">Fornecedor</th>
              <th className="px-4 py-2 text-left text-gray-700 dark:text-gray-200">Stock</th>
              <th className="px-4 py-2 text-left text-gray-700 dark:text-gray-200">Preço (€)</th>
              <th className="px-4 py-2 text-left text-gray-700 dark:text-gray-200">Margem %</th>
              <th className="px-4 py-2 text-left text-gray-700 dark:text-gray-200">Ações</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product.id} className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                <td className="px-4 py-2 text-gray-900 dark:text-gray-100">{product.id}</td>
                <td className="px-4 py-2 text-gray-900 dark:text-gray-100">{product.barcode || '-'}</td>
                <td className="px-4 py-2 text-gray-900 dark:text-gray-100">{product.name}</td>
                <td className="px-4 py-2 text-gray-900 dark:text-gray-100">{product.color || '-'}</td>
                <td className="px-4 py-2 text-gray-900 dark:text-gray-100">{product.size || '-'}</td>
                <td className="px-4 py-2 text-gray-900 dark:text-gray-100">{product.supplier || '-'}</td>
                <td className="px-4 py-2 text-gray-900 dark:text-gray-100">{product.stock}</td>
                <td className="px-4 py-2 text-gray-900 dark:text-gray-100">{product.selling_price}</td>
                <td className="px-4 py-2 text-gray-900 dark:text-gray-100">{product.profit_margin ? `${product.profit_margin}%` : '-'}</td>
                <td className="px-4 py-2">
                  <button onClick={() => handleEdit(product)} className="text-blue-500 dark:text-blue-400 mr-2 hover:underline">Editar</button>
                  <button onClick={() => handleDelete(product.id)} className="text-red-500 dark:text-red-400 hover:underline">Eliminar</button>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr className="border-t border-gray-200 dark:border-gray-700">
                <td colSpan="10" className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                  Nenhum produto cadastrado
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

      {/* Modal do formulário (ProductForm) – as classes dark já estão dentro do componente */}
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