import { useState, useEffect } from 'react';
import { createRawMaterial, updateRawMaterial } from '../services/rawMaterial';

function RawMaterialForm({ material, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    unit_cost: '',
    unit: '',
    stock: ''
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (material) {
      setFormData({
        name: material.name || '',
        unit_cost: material.unit_cost || '',
        unit: material.unit || '',
        stock: material.stock || ''
      });
    }
  }, [material]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (material && material.id) {
        await updateRawMaterial(material.id, formData);
      } else {
        await createRawMaterial(formData);
      }
      onSave();
    } catch (err) {
      setError('Erro ao guardar matéria-prima');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded shadow-lg w-full max-w-md p-6">
        <h2 className="text-xl font-bold mb-4">{material ? 'Editar Matéria-Prima' : 'Nova Matéria-Prima'}</h2>
        {error && <div className="bg-red-100 text-red-700 p-2 rounded mb-4">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label>Nome *</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full p-2 border rounded" />
          </div>
          <div className="mb-3">
            <label>Custo Unitário (€) *</label>
            <input type="number" step="0.01" name="unit_cost" value={formData.unit_cost} onChange={handleChange} required className="w-full p-2 border rounded" />
          </div>
          <div className="mb-3">
            <label>Unidade (kg, L, un) *</label>
            <input type="text" name="unit" value={formData.unit} onChange={handleChange} required className="w-full p-2 border rounded" />
          </div>
          <div className="mb-4">
            <label>Stock atual</label>
            <input type="number" step="0.01" name="stock" value={formData.stock} onChange={handleChange} className="w-full p-2 border rounded" />
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-300 rounded">Cancelar</button>
            <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">Guardar</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RawMaterialForm;