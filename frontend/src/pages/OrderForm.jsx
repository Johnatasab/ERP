import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCustomers } from '../services/customer';
import { getProducts } from '../services/product';
import { createOrder, addOrderItem } from '../services/order';

function OrderForm() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState([]);
  const [currentProductId, setCurrentProductId] = useState('');
  const [currentQuantity, setCurrentQuantity] = useState(1);
  const [currentUnitPrice, setCurrentUnitPrice] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const customersRes = await getCustomers(1, 100); // busca todos (sem paginação, mas seguro)
        // Se a resposta tiver a propriedade 'data' (paginação), usa customersRes.data
        const customersList = customersRes.data || customersRes;
        setCustomers(Array.isArray(customersList) ? customersList : []);

        const productsRes = await getProducts(1, 100);
        const productsList = productsRes.data || productsRes;
        setProducts(Array.isArray(productsList) ? productsList : []);
      } catch (err) {
        setError('Erro ao carregar dados iniciais');
      }
    };
    loadData();
  }, []);

  // Quando o produto selecionado muda, sugerir o preço de venda
  useEffect(() => {
    if (currentProductId) {
      const product = products.find(p => p.id == currentProductId);
      if (product) {
        setCurrentUnitPrice(product.selling_price);
      }
    }
  }, [currentProductId, products]);

  const handleAddItem = () => {
    if (!currentProductId || currentQuantity <= 0 || !currentUnitPrice) {
      alert('Selecione um produto, quantidade e preço unitário válidos');
      return;
    }
    const product = products.find(p => p.id == currentProductId);
    if (!product) return;

    const existing = items.find(i => i.product_id == currentProductId);
    if (existing) {
      alert('Produto já adicionado. Remova o existente se quiser alterar.');
      return;
    }

    const newItem = {
      product_id: parseInt(currentProductId),
      product_name: product.name,
      quantity: parseFloat(currentQuantity),
      unit_price: parseFloat(currentUnitPrice),
      total: parseFloat(currentQuantity) * parseFloat(currentUnitPrice),
    };
    setItems([...items, newItem]);

    setCurrentProductId('');
    setCurrentQuantity(1);
    setCurrentUnitPrice('');
  };

  const handleRemoveItem = (index) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  const totalOrder = items.reduce((sum, item) => sum + item.total, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCustomerId) {
      setError('Selecione um cliente');
      return;
    }
    if (items.length === 0) {
      setError('Adicione pelo menos um produto');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const order = await createOrder({
        customer_id: selectedCustomerId,
        notes: notes,
      });

      for (const item of items) {
        await addOrderItem(order.id, {
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
        });
      }

      navigate('/orders');
    } catch (err) {
      console.error(err);
      setError('Erro ao guardar encomenda. Verifique a consola.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Nova Encomenda</h1>
      {error && <div className="bg-red-100 text-red-700 p-2 rounded mb-4">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Seleção de Cliente */}
        <div>
          <label className="block text-sm font-medium mb-1">Cliente *</label>
          <select
            value={selectedCustomerId}
            onChange={(e) => setSelectedCustomerId(e.target.value)}
            className="w-full p-2 border rounded"
            required
          >
            <option value="">Selecione...</option>
            {customers.map(c => (
              <option key={c.id} value={c.id}>{c.name} - {c.email}</option>
            ))}
          </select>
        </div>

        {/* Notas */}
        <div>
          <label className="block text-sm font-medium mb-1">Notas (opcional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows="2"
            className="w-full p-2 border rounded"
          />
        </div>

        {/* Adicionar Produtos */}
        <div className="border-t pt-4">
          <h2 className="text-lg font-semibold mb-3">Produtos</h2>
          <div className="flex flex-wrap gap-2 items-end">
            <div className="flex-1 min-w-[150px]">
              <label className="block text-sm">Produto</label>
              <select
                value={currentProductId}
                onChange={(e) => setCurrentProductId(e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="">Selecione</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name} (€{p.selling_price})</option>
                ))}
              </select>
            </div>
            <div className="w-24">
              <label className="block text-sm">Qtd</label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={currentQuantity}
                onChange={(e) => setCurrentQuantity(e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="w-32">
              <label className="block text-sm">Preço Unit. (€)</label>
              <input
                type="number"
                step="0.01"
                value={currentUnitPrice}
                onChange={(e) => setCurrentUnitPrice(e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
            <button
              type="button"
              onClick={handleAddItem}
              className="bg-blue-500 text-white px-4 py-2 rounded h-[42px]"
            >
              Adicionar
            </button>
          </div>

          {items.length > 0 && (
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full bg-white border">
                <thead className="bg-gray-100">
                  <tr><th>Produto</th><th>Qtd</th><th>Preço Unit.</th><th>Subtotal</th><th></th></tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => (
                    <tr key={idx} className="border-t">
                      <td className="p-2">{item.product_name}</td>
                      <td className="p-2">{item.quantity}</td>
                      <td className="p-2">€{item.unit_price}</td>
                      <td className="p-2">€{item.total.toFixed(2)}</td>
                      <td className="p-2">
                        <button type="button" onClick={() => handleRemoveItem(idx)} className="text-red-500">Remover</button>
                       </td>
                     </tr>
                  ))}
                  <tr className="bg-gray-50 font-bold">
                    <td colSpan="3" className="p-2 text-right">Total da Encomenda</td>
                    <td colSpan="2" className="p-2">€{totalOrder.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <button type="button" onClick={() => navigate('/orders')} className="px-4 py-2 bg-gray-300 rounded">Cancelar</button>
          <button type="submit" disabled={loading} className="px-4 py-2 bg-green-500 text-white rounded disabled:opacity-50">
            {loading ? 'A guardar...' : 'Guardar Encomenda'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default OrderForm;