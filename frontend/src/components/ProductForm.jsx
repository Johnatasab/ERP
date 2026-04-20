import { useState, useEffect } from 'react';
import { createProduct, updateProduct, addProductMaterial, removeProductMaterial } from '../services/product';
import { getRawMaterials, createRawMaterial } from '../services/rawMaterial';

function ProductForm({ product, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    color: '',
    size: '',
    weight: '',
    supplier: '',
    initial_stock: '',
    selling_price: '',
    image_url: ''
  });
  const [materials, setMaterials] = useState([]);
  const [selectedMaterialId, setSelectedMaterialId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [productMaterials, setProductMaterials] = useState([]);
  const [error, setError] = useState('');
  const [showNewMaterialModal, setShowNewMaterialModal] = useState(false);
  const [newMaterial, setNewMaterial] = useState({ name: '', unit_cost: '', unit: '', stock: '' });
  const [newMaterialError, setNewMaterialError] = useState('');

  // Calcular custo total das matérias-primas
  const totalCost = productMaterials.reduce((sum, pm) => sum + (pm.unit_cost * pm.quantity), 0);

  // Calcular margem de lucro automaticamente
  const profitMargin = (() => {
    const price = parseFloat(formData.selling_price);
    if (isNaN(price) || price <= 0) return '';
    const margin = ((price - totalCost) / price) * 100;
    return margin.toFixed(2);
  })();

  useEffect(() => { loadMaterials(); }, []);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        category: product.category || '',
        color: product.color || '',
        size: product.size || '',
        weight: product.weight || '',
        supplier: product.supplier || '',
        initial_stock: product.initial_stock || '',
        selling_price: product.selling_price || '',
        image_url: product.image_url || ''
      });
      if (product.materials) setProductMaterials(product.materials);
    }
  }, [product]);

  const loadMaterials = async () => {
    try {
      const data = await getRawMaterials(1, 100); // busca todos (sem paginação)
      setMaterials(Array.isArray(data) ? data : (data.data || []));
    } catch (err) { console.error(err); }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddMaterial = () => {
    if (!selectedMaterialId || !quantity) return alert('Selecione matéria-prima e quantidade');
    const material = materials.find(m => m.id == selectedMaterialId);
    if (!material) return;
    if (productMaterials.some(m => m.id == selectedMaterialId)) return alert('Já adicionada');
    setProductMaterials([...productMaterials, {
      id: material.id,
      name: material.name,
      unit: material.unit,
      unit_cost: material.unit_cost,
      quantity: parseFloat(quantity)
    }]);
    setSelectedMaterialId('');
    setQuantity('');
  };

  const handleRemoveMaterial = (id) => setProductMaterials(productMaterials.filter(m => m.id !== id));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const productData = {
        ...formData,
        profit_margin: profitMargin,
        stock: formData.initial_stock
      };
      let savedProduct;
      if (product?.id) {
        savedProduct = await updateProduct(product.id, productData);
      } else {
        savedProduct = await createProduct(productData);
      }
      // Atualizar associações (substituir)
      for (let pm of productMaterials) {
        await addProductMaterial(savedProduct.id, pm.id, pm.quantity);
      }
      onSave();
    } catch (err) {
      setError('Erro ao guardar produto');
      console.error(err);
    }
  };

  const handleCreateRawMaterial = async (e) => {
    e.preventDefault();
    if (!newMaterial.name || !newMaterial.unit_cost || !newMaterial.unit) {
      return setNewMaterialError('Preencha nome, custo unitário e unidade');
    }
    try {
      const created = await createRawMaterial(newMaterial);
      await loadMaterials();
      setSelectedMaterialId(created.id);
      setNewMaterial({ name: '', unit_cost: '', unit: '', stock: '' });
      setShowNewMaterialModal(false);
    } catch (err) {
      setNewMaterialError('Erro ao criar matéria-prima');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 overflow-y-auto z-50">
      <div className="bg-white dark:bg-gray-800 rounded shadow-lg w-full max-w-4xl p-6 transition-colors duration-200">
        <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">
          {product ? 'Editar Produto' : 'Novo Produto'}
        </h2>
        {error && <div className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 p-2 rounded mb-4">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nome *</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Categoria</label>
              <input type="text" name="category" value={formData.category} onChange={handleChange} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Cor</label>
              <input type="text" name="color" value={formData.color} onChange={handleChange} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tamanho</label>
              <input type="text" name="size" value={formData.size} onChange={handleChange} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Peso (kg)</label>
              <input type="number" step="0.01" name="weight" value={formData.weight} onChange={handleChange} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Fornecedor</label>
              <input type="text" name="supplier" value={formData.supplier} onChange={handleChange} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Estoque Inicial</label>
              <input type="number" step="1" name="initial_stock" value={formData.initial_stock} onChange={handleChange} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Preço de Venda (€) *</label>
              <input type="number" step="0.01" name="selling_price" value={formData.selling_price} onChange={handleChange} required className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Custo Unitário (calculado)</label>
              <input type="text" value={`€ ${totalCost.toFixed(2)}`} readOnly className="w-full p-2 border rounded bg-gray-100 dark:bg-gray-600 dark:text-white cursor-not-allowed" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Margem de Lucro (%)</label>
              <input type="text" value={profitMargin} readOnly className="w-full p-2 border rounded bg-gray-100 dark:bg-gray-600 dark:text-white cursor-not-allowed" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">URL da Imagem</label>
              <input type="text" name="image_url" value={formData.image_url} onChange={handleChange} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Descrição</label>
              <textarea name="description" value={formData.description} onChange={handleChange} rows="3" className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"></textarea>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">Matérias-Primas Consumidas</h3>
            <div className="flex flex-wrap gap-2 mb-2">
              <select value={selectedMaterialId} onChange={(e) => setSelectedMaterialId(e.target.value)} className="flex-1 p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                <option value="">Selecione uma matéria-prima</option>
                {materials.map(m => <option key={m.id} value={m.id}>{m.name} ({m.unit_cost}€/{m.unit})</option>)}
              </select>
              <button type="button" onClick={() => setShowNewMaterialModal(true)} className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded transition">+ Novo</button>
              <input type="number" step="0.01" placeholder="Quantidade" value={quantity} onChange={(e) => setQuantity(e.target.value)} className="w-32 p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
              <button type="button" onClick={handleAddMaterial} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition">Adicionar</button>
            </div>
            {productMaterials.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm border dark:border-gray-700">
                  <thead className="bg-gray-100 dark:bg-gray-700">
                    <tr>
                      <th className="p-2 text-left text-gray-700 dark:text-gray-200">Matéria-Prima</th>
                      <th className="p-2 text-left text-gray-700 dark:text-gray-200">Custo Unit.</th>
                      <th className="p-2 text-left text-gray-700 dark:text-gray-200">Quantidade</th>
                      <th className="p-2 text-left text-gray-700 dark:text-gray-200">Subtotal</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {productMaterials.map(pm => (
                      <tr key={pm.id} className="border-t dark:border-gray-700">
                        <td className="p-2 text-gray-900 dark:text-gray-100">{pm.name}</td>
                        <td className="p-2 text-gray-900 dark:text-gray-100">{pm.unit_cost}€/{pm.unit}</td>
                        <td className="p-2 text-gray-900 dark:text-gray-100">{pm.quantity}</td>
                        <td className="p-2 text-gray-900 dark:text-gray-100">{(pm.unit_cost * pm.quantity).toFixed(2)}€</td>
                        <td className="p-2"><button type="button" onClick={() => handleRemoveMaterial(pm.id)} className="text-red-500 dark:text-red-400 hover:underline">Remover</button></td>
                      </tr>
                    ))}
                    <tr className="font-bold bg-gray-50 dark:bg-gray-700">
                      <td colSpan="3" className="p-2 text-right text-gray-800 dark:text-white">Custo Total do Produto:</td>
                      <td colSpan="2" className="p-2 text-gray-800 dark:text-white">{totalCost.toFixed(2)}€</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded hover:bg-gray-400 dark:hover:bg-gray-500 transition">Cancelar</button>
            <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition">Guardar</button>
          </div>
        </form>
      </div>

      {/* Modal para criar nova matéria-prima */}
      {showNewMaterialModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded shadow-lg w-full max-w-md p-6 transition-colors">
            <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-white">Nova Matéria-Prima</h3>
            {newMaterialError && <div className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 p-2 rounded mb-4">{newMaterialError}</div>}
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nome *</label>
              <input type="text" value={newMaterial.name} onChange={(e) => setNewMaterial({...newMaterial, name: e.target.value})} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Custo Unitário (€) *</label>
              <input type="number" step="0.01" value={newMaterial.unit_cost} onChange={(e) => setNewMaterial({...newMaterial, unit_cost: e.target.value})} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Unidade (kg, L, un) *</label>
              <input type="text" value={newMaterial.unit} onChange={(e) => setNewMaterial({...newMaterial, unit: e.target.value})} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Stock atual</label>
              <input type="number" step="0.01" value={newMaterial.stock} onChange={(e) => setNewMaterial({...newMaterial, stock: e.target.value})} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setShowNewMaterialModal(false)} className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded hover:bg-gray-400 dark:hover:bg-gray-500 transition">Cancelar</button>
              <button type="button" onClick={handleCreateRawMaterial} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition">Criar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductForm;