import { useState, useEffect } from 'react'
import { Settings as SettingsIcon, X, Plus, Trash2, Save, Edit3, Paperclip, Palette } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useToast } from '../contexts/ToastContext'
import { useColor } from '../contexts/ColorContext'

interface Model {
  id: string
  name: string
  description: string
  badge: string
  type: 'text' | 'image'
  enabled: boolean
  default: boolean
  supportsFiles?: boolean
  supportedFileTypes?: string[]
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
  const { t } = useTranslation()

  // Função para traduzir descrições de modelos
  const translateModelDescription = (description: string) => {
    const descriptionMap: Record<string, string> = {
      'Mais rápido e eficiente': t('settings.model_descriptions.faster_efficient'),
      'Mais poderoso para tarefas complexas': t('settings.model_descriptions.powerful_complex_tasks'),
      'Modelo Open Source': t('settings.model_descriptions.open_source_model'),
      'Geração de imagens com IA': t('settings.model_descriptions.ai_image_generation'),
      'Geração de imagens com IA mais rápidas.': t('settings.model_descriptions.faster_ai_image_generation')
    }
    return descriptionMap[description] || description
  }
  const [models, setModels] = useState<ModelsData>({ textModels: [], imageModels: [] })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'text' | 'image' | 'customization'>('text')
  const [editingModel, setEditingModel] = useState<string | null>(null)
  const [newModel, setNewModel] = useState<Partial<Model>>({
    name: '',
    description: '',
    badge: '',
    type: 'text',
    enabled: true,
    default: false,
    supportsFiles: false,
    supportedFileTypes: []
  })
  const [showAddForm, setShowAddForm] = useState(false)
  const { showToast } = useToast()
  const { primaryColor, setPrimaryColor, resetToDefault } = useColor()
  const [tempColor, setTempColor] = useState(primaryColor)

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
      showToast(t('app.settings_saved'), 'success')
      // Fecha o modal imediatamente após salvar
      onClose()
    } catch (error) {
      console.error('Error saving models:', error)
      showToast(t('app.error_saving'), 'error')
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
    if (confirm(t('settings.confirm_delete_model'))) {
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
      default: false,
      supportsFiles: false,
      supportedFileTypes: []
    })
    setShowAddForm(false)
  }

  const CustomizationTab = () => {
    const { i18n } = useTranslation()
    
    const handleLanguageChange = (lng: string) => {
      i18n.changeLanguage(lng)
    }
    
    const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const color = e.target.value
      setTempColor(color)
      setPrimaryColor(color)
    }

    const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const hex = e.target.value
      if (/^#[0-9A-F]{6}$/i.test(hex)) {
        setTempColor(hex)
        setPrimaryColor(hex)
      } else {
        setTempColor(hex) // Allow typing
      }
    }

    const presetColors = [
      { nameKey: 'blue', color: '#3b82f6' },
      { nameKey: 'green', color: '#10b981' },
      { nameKey: 'purple', color: '#8b5cf6' },
      { nameKey: 'pink', color: '#ec4899' },
      { nameKey: 'orange', color: '#f59e0b' },
      { nameKey: 'red', color: '#ef4444' },
      { nameKey: 'teal', color: '#14b8a6' },
      { nameKey: 'indigo', color: '#6366f1' },
    ]

    return (
      <div className="space-y-6">
        {/* Seção de Idioma */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {t('settings.language')}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {t('settings.choose_language')}
          </p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleLanguageChange('pt')}
              className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-colors hover:bg-gray-50 dark:hover:bg-dark-700 ${
                i18n.language === 'pt'
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-gray-200 dark:border-gray-600'
              }`}
            >
              <span className="text-2xl">🇧🇷</span>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('settings.portuguese')}
              </span>
            </button>
            <button
              onClick={() => handleLanguageChange('en')}
              className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-colors hover:bg-gray-50 dark:hover:bg-dark-700 ${
                i18n.language === 'en'
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-gray-200 dark:border-gray-600'
              }`}
            >
              <span className="text-2xl">🇺🇸</span>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('settings.english')}
              </span>
            </button>
          </div>
        </div>

        {/* Seção de Cores */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {t('settings.primary_color')}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {t('settings.choose_color')}
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              {t('settings.color_selector')}
            </label>
            <div className="flex items-center gap-4">
              <div className="relative">
                <input
                  type="color"
                  value={tempColor}
                  onChange={handleColorChange}
                  className="w-12 h-12 rounded-lg border-2 border-gray-300 dark:border-gray-600 cursor-pointer"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                  {t('settings.hexadecimal_code')}
                </label>
                <input
                  type="text"
                  value={tempColor}
                  onChange={handleHexChange}
                  placeholder="#3b82f6"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-dark-500 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-dark-700 dark:text-white font-mono text-sm"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">
              {t('settings.preset_colors')}
            </label>
            <div className="grid grid-cols-4 gap-3">
              {presetColors.map((preset) => (
                <button
                  key={preset.nameKey}
                  onClick={() => {
                    setTempColor(preset.color)
                    setPrimaryColor(preset.color)
                  }}
                  className={`flex items-center gap-2 p-2 rounded-lg border-2 transition-colors hover:bg-gray-50 dark:hover:bg-dark-700 ${
                    tempColor.toLowerCase() === preset.color.toLowerCase()
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-200 dark:border-gray-600'
                  }`}
                >
                  <div
                    className="w-6 h-6 rounded-full border border-gray-300 dark:border-gray-600"
                    style={{ backgroundColor: preset.color }}
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {t(`colors.${preset.nameKey}`)}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-600">
            <button
              onClick={resetToDefault}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              {t('settings.restore_default')}
            </button>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {t('settings.changes_auto_saved')}
            </div>
          </div>
        </div>
      </div>
    )
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
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('settings.title')}</h2>
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
                  {t('settings.text_models')}
                </button>
                <button
                  onClick={() => setActiveTab('image')}
                  className={`pb-2 px-1 font-medium transition-colors ${
                    activeTab === 'image'
                      ? 'border-b-2 border-primary-600 text-primary-600'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  {t('settings.image_models')}
                </button>
                <button
                  onClick={() => setActiveTab('customization')}
                  className={`pb-2 px-1 font-medium transition-colors flex items-center gap-2 ${
                    activeTab === 'customization'
                      ? 'border-b-2 border-primary-600 text-primary-600'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  <Palette size={16} />
                  {t('settings.customization')}
                </button>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent"></div>
              </div>
            ) : activeTab === 'customization' ? (
              <CustomizationTab />
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {activeTab === 'text' ? t('settings.text_models') : activeTab === 'image' ? t('settings.image_models') : t('settings.customization')}
                  </h3>
                  {(activeTab === 'text' || activeTab === 'image') && (
                    <button
                      onClick={() => setShowAddForm(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      <Plus size={16} />
                      {t('settings.add_model')}
                    </button>
                  )}
                </div>

                {(activeTab === 'text' || activeTab === 'image') && showAddForm && (
                  <div className="border border-gray-200 dark:border-dark-600 rounded-lg p-4 mb-4">
                    <h4 className="font-semibold mb-3 text-gray-900 dark:text-white">{t('settings.new_model')}</h4>
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
                          placeholder={t('settings.model_description_placeholder')}
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
                          <option value="text">{t('chat.text_mode')}</option>
                          <option value="image">{t('chat.image_mode')}</option>
                        </select>
                      </div>
                    </div>
                    
                    {/* Configurações de arquivos - apenas para modelos de texto */}
                    {newModel.type === 'text' && (
                      <div className="mt-4 p-4 bg-gray-50 dark:bg-dark-600 rounded-lg">
                        <h5 className="text-sm font-medium mb-3 text-gray-900 dark:text-white">Suporte a Arquivos</h5>
                        <div className="space-y-3">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="newModel-supportsFiles"
                              checked={newModel.supportsFiles || false}
                              onChange={(e) => setNewModel(prev => ({ 
                                ...prev, 
                                supportsFiles: e.target.checked,
                                supportedFileTypes: e.target.checked ? ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'] : []
                              }))}
                              className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                            />
                            <label htmlFor="newModel-supportsFiles" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                              {t('settings.accepts_images_pdfs')}
                            </label>
                          </div>
                          
                          {newModel.supportsFiles && (
                            <div>
                              <label className="block text-xs font-medium mb-2 text-gray-700 dark:text-gray-300">
                                {t('settings.supported_file_types')}
                              </label>
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                {[
                                  { value: 'image/jpeg', label: 'JPEG' },
                                  { value: 'image/png', label: 'PNG' },
                                  { value: 'image/gif', label: 'GIF' },
                                  { value: 'image/webp', label: 'WebP' },
                                  { value: 'application/pdf', label: 'PDF' }
                                ].map(fileType => (
                                  <div key={fileType.value} className="flex items-center">
                                    <input
                                      type="checkbox"
                                      id={`newModel-${fileType.value}`}
                                      checked={newModel.supportedFileTypes?.includes(fileType.value) || false}
                                      onChange={(e) => {
                                        const current = newModel.supportedFileTypes || [];
                                        const updated = e.target.checked
                                          ? [...current, fileType.value]
                                          : current.filter(type => type !== fileType.value);
                                        setNewModel(prev => ({ ...prev, supportedFileTypes: updated }));
                                      }}
                                      className="w-3 h-3 text-primary-600 rounded focus:ring-primary-500"
                                    />
                                    <label htmlFor={`newModel-${fileType.value}`} className="ml-1 text-gray-600 dark:text-gray-400">
                                      {fileType.label}
                                    </label>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={addNewModel}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        {t('settings.add')}
                      </button>
                      <button
                        onClick={() => setShowAddForm(false)}
                        className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                      >
                        {t('settings.cancel')}
                      </button>
                    </div>
                  </div>
                )}

                {(activeTab === 'text' || activeTab === 'image') && models[`${activeTab}Models`].map((model) => (
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
                            
                            {/* Configurações de arquivos - apenas para modelos de texto */}
                            {activeTab === 'text' && (
                              <div className="p-4 bg-gray-50 dark:bg-dark-600 rounded-lg">
                                <h5 className="text-sm font-medium mb-3 text-gray-900 dark:text-white">Suporte a Arquivos</h5>
                                <div className="space-y-3">
                                  <div className="flex items-center">
                                    <input
                                      type="checkbox"
                                      id={`${model.id}-supportsFiles`}
                                      checked={model.supportsFiles || false}
                                      onChange={(e) => updateModel(activeTab, model.id, { 
                                        supportsFiles: e.target.checked,
                                        supportedFileTypes: e.target.checked ? ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'] : []
                                      })}
                                      className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                                    />
                                    <label htmlFor={`${model.id}-supportsFiles`} className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                                      {t('settings.accepts_images_pdfs')}
                                    </label>
                                  </div>
                                  
                                  {model.supportsFiles && (
                                    <div>
                                      <label className="block text-xs font-medium mb-2 text-gray-700 dark:text-gray-300">
                                        {t('settings.supported_file_types')}
                                      </label>
                                      <div className="grid grid-cols-2 gap-2 text-xs">
                                        {[
                                          { value: 'image/jpeg', label: 'JPEG' },
                                          { value: 'image/png', label: 'PNG' },
                                          { value: 'image/gif', label: 'GIF' },
                                          { value: 'image/webp', label: 'WebP' },
                                          { value: 'application/pdf', label: 'PDF' }
                                        ].map(fileType => (
                                          <div key={fileType.value} className="flex items-center">
                                            <input
                                              type="checkbox"
                                              id={`${model.id}-${fileType.value}`}
                                              checked={model.supportedFileTypes?.includes(fileType.value) || false}
                                              onChange={(e) => {
                                                const current = model.supportedFileTypes || [];
                                                const updated = e.target.checked
                                                  ? [...current, fileType.value]
                                                  : current.filter(type => type !== fileType.value);
                                                updateModel(activeTab, model.id, { supportedFileTypes: updated });
                                              }}
                                              className="w-3 h-3 text-primary-600 rounded focus:ring-primary-500"
                                            />
                                            <label htmlFor={`${model.id}-${fileType.value}`} className="ml-1 text-gray-600 dark:text-gray-400">
                                              {fileType.label}
                                            </label>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                            
                            <div className="flex gap-2">
                              <button
                                onClick={() => setEditingModel(null)}
                                className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
                              >
                                {t('settings.save')}
                              </button>
                              <button
                                onClick={() => setEditingModel(null)}
                                className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600 transition-colors"
                              >
                                {t('settings.cancel')}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-gray-900 dark:text-white">{model.name}</h4>
                              {model.supportsFiles && (
                              <div className="flex items-center gap-2">
                                <Paperclip size={16} className="text-primary-600 dark:text-primary-400" />
                                <span className="text-xs text-gray-500">{t('settings.accepts_images_pdfs')}</span>
                              </div>
                              )}
                              {model.badge && (
                                <span className="px-2 py-1 bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 text-xs rounded-full font-medium">
                                  {model.badge}
                                </span>
                              )}
                              {model.default && (
                                <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs rounded-full font-medium">
                                  {t('settings.default').toUpperCase()}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{translateModelDescription(model.description)}</p>
                            
                            {/* Mostrar tipos de arquivo suportados */}
                            {model.supportsFiles && model.supportedFileTypes && model.supportedFileTypes.length > 0 && (
                              <div className="mb-2">
                                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Aceita:</div>
                                <div className="flex flex-wrap gap-1">
                                  {model.supportedFileTypes.map(fileType => {
                                    const typeMap: { [key: string]: { label: string; color: string } } = {
                                      'image/jpeg': { label: 'JPEG', color: 'bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-400' },
                                      'image/png': { label: 'PNG', color: 'bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-400' },
                                      'image/gif': { label: 'GIF', color: 'bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-400' },
                                      'image/webp': { label: 'WebP', color: 'bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-400' },
                                      'application/pdf': { label: 'PDF', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' }
                                    };
                                    const typeInfo = typeMap[fileType];
                                    return typeInfo ? (
                                      <span key={fileType} className={`px-2 py-1 text-xs rounded-full font-medium ${typeInfo.color}`}>
                                        {typeInfo.label}
                                      </span>
                                    ) : null;
                                  })}
                                </div>
                              </div>
                            )}
                            
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
                          <span className="text-sm text-gray-700 dark:text-gray-300">{t('settings.active')}</span>
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
                          {model.default ? t('settings.default') : t('settings.set_as_default')}
                        </button>

                        <button
                          onClick={() => deleteModel(activeTab, model.id)}
                          className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                          title="Deletar"
                        >
                          <Trash2 size={16} className="text-black dark:text-white" />
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
                {t('settings.cancel')}
              </button>
              <button
                onClick={saveModels}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Save size={16} />
                {saving ? t('app.saving') : t('app.save_changes')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}