import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getRawMaterials, deleteRawMaterial } from '../services/rawMaterial';
import RawMaterialForm from '../components/RawMaterialForm';

function RawMaterials() {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  useEffect(() => {
    loadMaterials();
  }, [page]);

  const loadMaterials = async () => {
    try {
      setLoading(true);
      const response = await getRawMaterials(page, limit);
      // Ajuste conforme sua API (pode ser { data, pagination } ou array direto)
      if (response && response.data) {
        setMaterials(response.data);
        setTotalPages(response.pagination.totalPages);
      } else if (Array.isArray(response)) {
        setMaterials(response);
        setTotalPages(1);
      } else {
        setMaterials([]);
        setTotalPages(1);
      }
    } catch (err) {
      setError('Erro ao carregar matérias-primas');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja eliminar esta matéria-prima?')) {
      try {
        await deleteRawMaterial(id);
        loadMaterials();
      } catch (err) {
        alert('Erro ao eliminar');
      }
    }
  };

  const handleEdit = (material) => {
    setEditingMaterial(material);
    setShowForm(true);
  };

  const handleNew = () => {
    setEditingMaterial(null);
    setShowForm(true);
  };

  const handleFormSave = () => {
    setShowForm(false);
    loadMaterials();
  };

  const handleFormCancel = () => {
    setShowForm(false);
  };

  if (loading) return <div className="p-8 text-center dark:text-white">A carregar matérias-primas...</div>;
  if (error) return <div className="p-8 text-red-600 dark:text-red-400">{error}</div>;

  return (
    <div className="p-8 bg-gray-100 dark:bg-gray-900 min-h-screen transition-colors duration-200">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Matérias-Primas</h1>
        <button onClick={handleNew} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition">
          + Nova Matéria-Prima
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded shadow overflow-hidden transition-colors">
        <table className="min-w-full">
          <thead className="bg-gray-100 dark:bg-gray-700">
            <tr>
              <th className="px-4 py-2 text-left text-gray-700 dark:text-gray-200">ID</th>
              <th className="px-4 py-2 text-left text-gray-700 dark:text-gray-200">Nome</th>
              <th className="px-4 py-2 text-left text-gray-700 dark:text-gray-200">Custo Unitário (€)</th>
              <th className="px-4 py-2 text-left text-gray-700 dark:text-gray-200">Unidade</th>
              <th className="px-4 py-2 text-left text-gray-700 dark:text-gray-200">Stock</th>
              <th className="px-4 py-2 text-left text-gray-700 dark:text-gray-200">Ações</th>
            </tr>
          </thead>
          <tbody>
            {materials.map(material => (
              <tr key={material.id} className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                <td className="px-4 py-2 text-gray-900 dark:text-gray-100">{material.id}</td>
                <td className="px-4 py-2 text-gray-900 dark:text-gray-100">{material.name}</td>
                <td className="px-4 py-2 text-gray-900 dark:text-gray-100">{material.unit_cost}</td>
                <td className="px-4 py-2 text-gray-900 dark:text-gray-100">{material.unit}</td>
                <td className="px-4 py-2 text-gray-900 dark:text-gray-100">{material.stock}</td>
                <td className="px-4 py-2">
                  <button onClick={() => handleEdit(material)} className="text-blue-500 dark:text-blue-400 mr-2 hover:underline">Editar</button>
                  <button onClick={() => handleDelete(material.id)} className="text-red-500 dark:text-red-400 hover:underline">Eliminar</button>
                </td>
              </tr>
            ))}
            {materials.length === 0 && (
              <tr className="border-t border-gray-200 dark:border-gray-700">
                <td colSpan="6" className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                  Nenhuma matéria-prima cadastrada
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

      {showForm && (
        <RawMaterialForm
          material={editingMaterial}
          onSave={handleFormSave}
          onCancel={handleFormCancel}
        />
      )}
    </div>
  );
}

export default RawMaterials;