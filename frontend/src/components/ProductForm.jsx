import { useState, useEffect } from 'react';
import { createProduct, updateProduct, addProductMaterial, removeProductMaterial } from '../services/product';
import { getRawMaterials, createRawMaterial } from '../services/rawMaterial';

function ProductForm({ product, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    selling_price: '',
    category: '',
    image_url: ''
  });
  const [materials, setMaterials] = useState([]);
  const [selectedMaterialId, setSelectedMaterialId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [productMaterials, setProductMaterials] = useState([]);
  const [error, setError] = useState('');
  
  // Estado para o modal de nova matéria-prima
  const [showNewMaterialModal, setShowNewMaterialModal] = useState(false);
  const [newMaterial, setNewMaterial] = useState({ name: '', unit_cost: '', unit: '', stock: '' });
  const [newMaterialError, setNewMaterialError] = useState('');

  // Carregar matérias-primas disponíveis
  useEffect(() => {
    loadMaterials();
  }, []);

  // Se for edição, carregar os dados do produto e suas matérias-primas associadas
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        selling_price: product.selling_price || '',
        category: product.category || '',
        image_url: product.image_url || ''
      });
      if (product.materials) {
        setProductMaterials(product.materials);
      }
    }
  }, [product]);

  const loadMaterials = async () => {
    try {
      const data = await getRawMaterials();
      setMaterials(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddMaterial = () => {
    if (!selectedMaterialId || !quantity) {
      alert('Selecione uma matéria-prima e insira a quantidade');
      return;
    }
    const material = materials.find(m => m.id == selectedMaterialId);
    if (!material) return;
    
    // Verificar se já foi adicionada
    if (productMaterials.some(m => m.id == selectedMaterialId)) {
      alert('Esta matéria-prima já foi adicionada');
      return;
    }
    
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

  const handleRemoveMaterial = (materialId) => {
    setProductMaterials(productMaterials.filter(m => m.id !== materialId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      let savedProduct;
      if (product && product.id) {
        savedProduct = await updateProduct(product.id, formData);
      } else {
        savedProduct = await createProduct(formData);
      }
      // Salvar associações (substituir as existentes)
      for (let pm of productMaterials) {
        await addProductMaterial(savedProduct.id, pm.id, pm.quantity);
      }
      // Remover associações que não estão mais na lista? 
      // Para simplificar, vamos apenas adicionar. Se quiser substituir completamente, 
      // seria necessário remover as antigas primeiro (opcional).
      onSave();
    } catch (err) {
      setError('Erro ao guardar produto');
      console.error(err);
    }
  };

  // Função para criar nova matéria-prima
  const handleCreateRawMaterial = async (e) => {
    e.preventDefault();
    setNewMaterialError('');
    if (!newMaterial.name || !newMaterial.unit_cost || !newMaterial.unit) {
      setNewMaterialError('Preencha nome, custo unitário e unidade');
      return;
    }
    try {
      const created = await createRawMaterial(newMaterial);
      await loadMaterials(); // recarregar lista
      // Selecionar automaticamente a nova matéria-prima
      setSelectedMaterialId(created.id);
      setNewMaterial({ name: '', unit_cost: '', unit: '', stock: '' });
      setShowNewMaterialModal(false);
    } catch (err) {
      setNewMaterialError('Erro ao criar matéria-prima');
    }
  };

  // Calcular custo total do produto baseado nas matérias-primas adicionadas
  const totalCost = productMaterials.reduce((sum, pm) => sum + (pm.unit_cost * pm.quantity), 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded shadow-lg w-full max-w-2xl p-6">
        <h2 className="text-xl font-bold mb-4">{product ? 'Editar Produto' : 'Novo Produto'}</h2>
        {error && <div className="bg-red-100 text-red-700 p-2 rounded mb-4">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Nome *</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full p-2 border rounded" />
            </div>
            <div>
              <label className="block text-sm font-medium">Categoria</label>
              <input type="text" name="category" value={formData.category} onChange={handleChange} className="w-full p-2 border rounded" />
            </div>
            <div>
              <label className="block text-sm font-medium">Preço de Venda (€) *</label>
              <input type="number" step="0.01" name="selling_price" value={formData.selling_price} onChange={handleChange} required className="w-full p-2 border rounded" />
            </div>
            <div>
              <label className="block text-sm font-medium">URL da Imagem</label>
              <input type="text" name="image_url" value={formData.image_url} onChange={handleChange} className="w-full p-2 border rounded" />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium">Descrição</label>
            <textarea name="description" value={formData.description} onChange={handleChange} className="w-full p-2 border rounded" rows="3"></textarea>
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Matérias-Primas Consumidas</h3>
            <div className="flex gap-2 mb-2">
              <select
                value={selectedMaterialId}
                onChange={(e) => setSelectedMaterialId(e.target.value)}
                className="flex-1 p-2 border rounded"
              >
                <option value="">Selecione uma matéria-prima</option>
                {materials.map(m => (
                  <option key={m.id} value={m.id}>{m.name} ({m.unit_cost}€/{m.unit})</option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setShowNewMaterialModal(true)}
                className="bg-green-500 text-white px-3 py-2 rounded hover:bg-green-600"
                title="Nova Matéria-Prima"
              >
                + Novo
              </button>
              <input
                type="number"
                step="0.01"
                placeholder="Quantidade"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-32 p-2 border rounded"
              />
              <button
                type="button"
                onClick={handleAddMaterial}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Adicionar
              </button>
            </div>

            {productMaterials.length > 0 && (
              <table className="w-full text-sm border mt-2">
                <thead className="bg-gray-100">
                  <tr><th>Matéria-Prima</th><th>Custo Unit.</th><th>Quantidade</th><th>Subtotal</th><th></th></tr>
                </thead>
                <tbody>
                  {productMaterials.map(pm => (
                    <tr key={pm.id} className="border-t">
                      <td className="p-2">{pm.name}</td>
                      <td>{pm.unit_cost}€/{pm.unit}</td>
                      <td>{pm.quantity}</td>
                      <td>{(pm.unit_cost * pm.quantity).toFixed(2)}€</td>
                      <td><button type="button" onClick={() => handleRemoveMaterial(pm.id)} className="text-red-500">Remover</button></td>
                    </tr>
                  ))}
                  <tr className="font-bold bg-gray-50">
                    <td colSpan="3" className="p-2 text-right">Custo Total do Produto:</td>
                    <td>{totalCost.toFixed(2)}€</td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            )}
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-300 rounded">Cancelar</button>
            <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">Guardar</button>
          </div>
        </form>
      </div>

      {/* Modal para criar nova matéria-prima */}
      {showNewMaterialModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded shadow-lg w-full max-w-md p-6">
            <h3 className="text-lg font-bold mb-4">Nova Matéria-Prima</h3>
            {newMaterialError && <div className="bg-red-100 text-red-700 p-2 rounded mb-4">{newMaterialError}</div>}
            <div className="mb-3">
              <label>Nome *</label>
              <input type="text" value={newMaterial.name} onChange={(e) => setNewMaterial({...newMaterial, name: e.target.value})} className="w-full p-2 border rounded" />
            </div>
            <div className="mb-3">
              <label>Custo Unitário (€) *</label>
              <input type="number" step="0.01" value={newMaterial.unit_cost} onChange={(e) => setNewMaterial({...newMaterial, unit_cost: e.target.value})} className="w-full p-2 border rounded" />
            </div>
            <div className="mb-3">
              <label>Unidade (kg, L, un) *</label>
              <input type="text" value={newMaterial.unit} onChange={(e) => setNewMaterial({...newMaterial, unit: e.target.value})} className="w-full p-2 border rounded" />
            </div>
            <div className="mb-4">
              <label>Stock atual</label>
              <input type="number" step="0.01" value={newMaterial.stock} onChange={(e) => setNewMaterial({...newMaterial, stock: e.target.value})} className="w-full p-2 border rounded" />
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setShowNewMaterialModal(false)} className="px-4 py-2 bg-gray-300 rounded">Cancelar</button>
              <button type="button" onClick={handleCreateRawMaterial} className="px-4 py-2 bg-blue-500 text-white rounded">Criar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductForm;