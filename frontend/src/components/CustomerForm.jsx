import { useState, useEffect } from 'react';
import { createCustomer, updateCustomer } from '../services/customer';

function CustomerForm({ customer, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    nif: ''
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name || '',
        email: customer.email || '',
        phone: customer.phone || '',
        address: customer.address || '',
        nif: customer.nif || ''
      });
    }
  }, [customer]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (customer && customer.id) {
        await updateCustomer(customer.id, formData);
      } else {
        await createCustomer(formData);
      }
      onSave();
    } catch (err) {
      const msg = err.response?.data?.error || 'Erro ao guardar cliente';
      setError(msg);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        <h2 className="text-xl font-bold mb-4">{customer ? 'Editar Cliente' : 'Novo Cliente'}</h2>
        {error && <div className="bg-red-100 text-red-700 p-2 rounded mb-4">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="block text-sm font-medium">Nome *</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full p-2 border rounded" />
          </div>
          <div className="mb-3">
            <label className="block text-sm font-medium">Email *</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full p-2 border rounded" />
          </div>
          <div className="mb-3">
            <label className="block text-sm font-medium">Telefone</label>
            <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="w-full p-2 border rounded" />
          </div>
          <div className="mb-3">
            <label className="block text-sm font-medium">Morada</label>
            <textarea name="address" value={formData.address} onChange={handleChange} className="w-full p-2 border rounded" rows="2"></textarea>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium">NIF</label>
            <input type="text" name="nif" value={formData.nif} onChange={handleChange} className="w-full p-2 border rounded" />
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

export default CustomerForm;