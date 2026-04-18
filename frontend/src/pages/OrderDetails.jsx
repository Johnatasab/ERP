import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getOrderById } from '../services/order';

function OrderDetails() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrder = async () => {
      try {
        const data = await getOrderById(id);
        setOrder(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadOrder();
  }, [id]);

  if (loading) return <div className="p-8">A carregar...</div>;
  if (!order) return <div className="p-8">Encomenda não encontrada</div>;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Encomenda #{order.id}</h1>
        <Link to="/orders" className="bg-gray-500 text-white px-4 py-2 rounded">← Voltar</Link>
      </div>
      <div className="bg-white rounded shadow p-6">
        <p><strong>Cliente:</strong> {order.customer_name}</p>
        <p><strong>Data:</strong> {new Date(order.order_date).toLocaleString()}</p>
        <p><strong>Status:</strong> {order.status}</p>
        <p><strong>Total:</strong> €{order.total_amount}</p>
        <p><strong>Notas:</strong> {order.notes || '-'}</p>

        <h2 className="text-lg font-bold mt-4 mb-2">Itens</h2>
        <table className="min-w-full border">
          <thead className="bg-gray-100">
            <tr><th>Produto</th><th>Qtd</th><th>Preço Unit.</th><th>Subtotal</th></tr>
          </thead>
          <tbody>
            {order.items?.map(item => (
              <tr key={item.id} className="border-t">
                <td className="p-2">{item.product_name}</td>
                <td className="p-2">{item.quantity}</td>
                <td className="p-2">€{item.unit_price}</td>
                <td className="p-2">€{item.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default OrderDetails;