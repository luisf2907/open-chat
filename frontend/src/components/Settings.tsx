import { useState, useEffect } from 'react'
import { Settings as SettingsIcon, X, Plus, Trash2, Save, Edit3 } from 'lucide-react'

interface Model {
  id: string
  name: string
  description: string
  badge: string
  type: 'text' | 'image'
  enabled: boolean
  default: boolean
}

interface ModelsData {
  textModels: Model[]
  imageModels: Model[]
}

interface SettingsProps {
  isOpen: boolean
  onClose: () => void
}

export default function Settings({ isOpen, onClose }: SettingsProps) {
  const [models, setModels] = useState<ModelsData>({ textModels: [], imageModels: [] })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'text' | 'image'>('text')
  const [editingModel, setEditingModel] = useState<string | null>(null)
  const [newModel, setNewModel] = useState<Partial<Model>>({
    name: '',
    description: '',
    badge: '',
    type: 'text',
    enabled: true,
    default: false
  })
  const [showAddForm, setShowAddForm] = useState(false)

  useEffect(() => {
    if (isOpen) {
      fetchModels()
    }
  }, [isOpen])

  const fetchModels = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/models?settings=true')
      const data = await response.json()
      setModels(data)
    } catch (error) {
      console.error('Error fetching models:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveModels = async () => {
    setSaving(true)
    try {
      await fetch('http://localhost:3000/api/models', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(models)
      })
      alert('Modelos salvos com sucesso!')
    } catch (error) {
      console.error('Error saving models:', error)
      alert('Erro ao salvar modelos')
    } finally {
      setSaving(false)
    }
  }

  const toggleModel = (type: 'text' | 'image', modelId: string) => {
    setModels(prev => ({
      ...prev,
      [`${type}Models`]: prev[`${type}Models`].map(model =>
        model.id === modelId ? { ...model, enabled: !model.enabled } : model
      )
    }))
  }

  const setDefaultModel = (type: 'text' | 'image', modelId: string) => {
    setModels(prev => ({
      ...prev,
      [`${type}Models`]: prev[`${type}Models`].map(model => ({
        ...model,
        default: model.id === modelId
      }))
    }))
  }

  const deleteModel = (type: 'text' | 'image', modelId: string) => {
    if (confirm('Tem certeza que deseja deletar este modelo?')) {
      setModels(prev => ({
        ...prev,
        [`${type}Models`]: prev[`${type}Models`].filter(model => model.id !== modelId)
      }))
    }
  }

  const updateModel = (type: 'text' | 'image', modelId: string, updates: Partial<Model>) => {
    setModels(prev => ({
      ...prev,
      [`${type}Models`]: prev[`${type}Models`].map(model =>
        model.id === modelId ? { ...model, ...updates } : model
      )
    }))
  }

  const addNewModel = () => {
    if (!newModel.name || !newModel.id) {
      alert('Nome e ID são obrigatórios')
      return
    }

    const modelToAdd: Model = {
      id: newModel.id || '',
      name: newModel.name || '',
      description: newModel.description || '',
      badge: newModel.badge || '',
      type: newModel.type || 'text',
      enabled: newModel.enabled ?? true,
      default: newModel.default ?? false
    }

    const targetType = modelToAdd.type
    setModels(prev => ({
      ...prev,
      [`${targetType}Models`]: [...prev[`${targetType}Models`], modelToAdd]
    }))

    setNewModel({
      name: '',
      description: '',
      badge: '',
      type: 'text',
      enabled: true,
      default: false
    })
    setShowAddForm(false)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-4xl h-[90vh] bg-white dark:bg-dark-800 rounded-2xl shadow-2xl mx-4">
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-dark-600 p-6">
            <div className="flex items-center gap-3">
              <SettingsIcon size={24} className="text-primary-600" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Configurações</h2>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors"
            >
              <X size={24} className="text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            <div className="mb-6">
              <div className="flex gap-4 border-b border-gray-200 dark:border-dark-600">
                <button
                  onClick={() => setActiveTab('text')}
                  className={`pb-2 px-1 font-medium transition-colors ${
                    activeTab === 'text'
                      ? 'border-b-2 border-primary-600 text-primary-600'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  Modelos de Texto
                </button>
                <button
                  onClick={() => setActiveTab('image')}
                  className={`pb-2 px-1 font-medium transition-colors ${
                    activeTab === 'image'
                      ? 'border-b-2 border-primary-600 text-primary-600'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  Modelos de Imagem
                </button>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent"></div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {activeTab === 'text' ? 'Modelos de Texto' : 'Modelos de Imagem'}
                  </h3>
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    <Plus size={16} />
                    Adicionar Modelo
                  </button>
                </div>

                {showAddForm && (
                  <div className="border border-gray-200 dark:border-dark-600 rounded-lg p-4 mb-4">
                    <h4 className="font-semibold mb-3 text-gray-900 dark:text-white">Novo Modelo</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">ID</label>
                        <input
                          type="text"
                          value={newModel.id || ''}
                          onChange={(e) => setNewModel(prev => ({ ...prev, id: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-dark-500 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-dark-700 dark:text-white"
                          placeholder="ex: gemini-3.0-pro"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Nome</label>
                        <input
                          type="text"
                          value={newModel.name || ''}
                          onChange={(e) => setNewModel(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-dark-500 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-dark-700 dark:text-white"
                          placeholder="ex: Gemini 3.0 Pro"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Descrição</label>
                        <input
                          type="text"
                          value={newModel.description || ''}
                          onChange={(e) => setNewModel(prev => ({ ...prev, description: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-dark-500 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-dark-700 dark:text-white"
                          placeholder="Descrição do modelo"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Badge</label>
                        <input
                          type="text"
                          value={newModel.badge || ''}
                          onChange={(e) => setNewModel(prev => ({ ...prev, badge: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-dark-500 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-dark-700 dark:text-white"
                          placeholder="ex: NOVO, PRO"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Tipo</label>
                        <select
                          value={newModel.type || 'text'}
                          onChange={(e) => setNewModel(prev => ({ ...prev, type: e.target.value as 'text' | 'image' }))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-dark-500 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-dark-700 dark:text-white"
                        >
                          <option value="text">Texto</option>
                          <option value="image">Imagem</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={addNewModel}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Adicionar
                      </button>
                      <button
                        onClick={() => setShowAddForm(false)}
                        className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}

                {models[`${activeTab}Models`].map((model) => (
                  <div key={model.id} className="border border-gray-200 dark:border-dark-600 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {editingModel === model.id ? (
                          <div className="space-y-3">
                            <input
                              type="text"
                              value={model.name}
                              onChange={(e) => updateModel(activeTab, model.id, { name: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-500 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-dark-700 dark:text-white"
                            />
                            <input
                              type="text"
                              value={model.description}
                              onChange={(e) => updateModel(activeTab, model.id, { description: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-500 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-dark-700 dark:text-white"
                            />
                            <input
                              type="text"
                              value={model.badge}
                              onChange={(e) => updateModel(activeTab, model.id, { badge: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-500 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-dark-700 dark:text-white"
                              placeholder="Badge (opcional)"
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() => setEditingModel(null)}
                                className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
                              >
                                Salvar
                              </button>
                              <button
                                onClick={() => setEditingModel(null)}
                                className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600 transition-colors"
                              >
                                Cancelar
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-gray-900 dark:text-white">{model.name}</h4>
                              {model.badge && (
                                <span className="px-2 py-1 bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 text-xs rounded-full font-medium">
                                  {model.badge}
                                </span>
                              )}
                              {model.default && (
                                <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs rounded-full font-medium">
                                  PADRÃO
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{model.description}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-500 font-mono">{model.id}</p>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setEditingModel(editingModel === model.id ? null : model.id)}
                          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors"
                          title="Editar"
                        >
                          <Edit3 size={16} className="text-gray-500 dark:text-gray-400" />
                        </button>

                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={model.enabled}
                            onChange={() => toggleModel(activeTab, model.id)}
                            className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300">Ativo</span>
                        </label>

                        <button
                          onClick={() => setDefaultModel(activeTab, model.id)}
                          disabled={model.default}
                          className={`px-3 py-1 text-xs rounded-lg font-medium transition-colors ${
                            model.default
                              ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 cursor-not-allowed'
                              : 'bg-gray-100 dark:bg-dark-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark-600'
                          }`}
                        >
                          {model.default ? 'Padrão' : 'Definir como padrão'}
                        </button>

                        <button
                          onClick={() => deleteModel(activeTab, model.id)}
                          className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                          title="Deletar"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-gray-200 dark:border-dark-600 p-6">
            <div className="flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 dark:border-dark-500 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={saveModels}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Save size={16} />
                {saving ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}