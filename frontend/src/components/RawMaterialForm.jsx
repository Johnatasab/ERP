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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded shadow-lg w-full max-w-md p-6 transition-colors">
        <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">
          {material ? 'Editar Matéria-Prima' : 'Nova Matéria-Prima'}
        </h2>
        {error && <div className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 p-2 rounded mb-4">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nome *</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
          </div>
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Custo Unitário (€) *</label>
            <input type="number" step="0.01" name="unit_cost" value={formData.unit_cost} onChange={handleChange} required className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
          </div>
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Unidade (kg, L, un) *</label>
            <input type="text" name="unit" value={formData.unit} onChange={handleChange} required className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Stock atual</label>
            <input type="number" step="0.01" name="stock" value={formData.stock} onChange={handleChange} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded hover:bg-gray-400 dark:hover:bg-gray-500 transition">Cancelar</button>
            <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition">Guardar</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RawMaterialForm;