import { useEffect, useState } from 'react';
import { getRawMaterials, createRawMaterial, updateRawMaterial, deleteRawMaterial } from '../services/rawMaterial';
import RawMaterialForm from '../components/RawMaterialForm';

function RawMaterials() {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);

  useEffect(() => {
    loadMaterials();
  }, []);

  const loadMaterials = async () => {
    try {
      setLoading(true);
      const data = await getRawMaterials();
      setMaterials(data);
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

  if (loading) return <div className="p-8">A carregar...</div>;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Matérias-Primas</h1>
        <button onClick={handleNew} className="bg-blue-500 text-white px-4 py-2 rounded">+ Nova Matéria-Prima</button>
      </div>

      {error && <div className="bg-red-100 text-red-700 p-2 rounded mb-4">{error}</div>}

      <div className="bg-white rounded shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-100">
            <tr>
              <th>ID</th><th>Nome</th><th>Custo Unitário</th><th>Unidade</th><th>Stock</th><th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {materials.map(m => (
              <tr key={m.id} className="border-t">
                <td className="px-4 py-2">{m.id}</td>
                <td>{m.name}</td>
                <td>{m.unit_cost} €</td>
                <td>{m.unit}</td>
                <td>{m.stock}</td>
                <td>
                  <button onClick={() => handleEdit(m)} className="text-blue-500 mr-2">Editar</button>
                  <button onClick={() => handleDelete(m.id)} className="text-red-500">Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <RawMaterialForm
          material={editingMaterial}
          onSave={handleFormSave}
          onCancel={() => setShowForm(false)}
        />
      )}
    </div>
  );
}

export default RawMaterials;