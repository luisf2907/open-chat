import { useState, useEffect } from 'react'
import { Database, Plus, Trash2, FolderOpen, Search, Eye, AlertCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useToast } from '../contexts/ToastContext'

interface DatabaseInfo {
  id: number
  name: string
  path: string
  description: string
  created_at: string
  last_accessed?: string
}

interface DatabaseManagerProps {
  onClose?: () => void
}

export default function DatabaseManager({ onClose }: DatabaseManagerProps) {
  const { t } = useTranslation()
  const { showToast } = useToast()
  const [databases, setDatabases] = useState<DatabaseInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedDatabase, setSelectedDatabase] = useState<DatabaseInfo | null>(null)
  const [schema, setSchema] = useState<any>(null)
  const [schemaLoading, setSchemaLoading] = useState(false)
  const [newDatabase, setNewDatabase] = useState({
    name: '',
    path: '',
    description: ''
  })

  useEffect(() => {
    fetchDatabases()
  }, [])

  const fetchDatabases = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/databases')
      if (response.ok) {
        const data = await response.json()
        setDatabases(data)
      }
    } catch (error) {
      console.error('Error fetching databases:', error)
      showToast('Erro ao carregar bancos de dados', 'error')
    } finally {
      setLoading(false)
    }
  }

  const addDatabase = async () => {
    if (!newDatabase.name || !newDatabase.path) {
      showToast('Nome e caminho são obrigatórios', 'error')
      return
    }

    try {
      const response = await fetch('http://localhost:3000/api/databases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDatabase)
      })

      if (response.ok) {
        const result = await response.json()
        setDatabases(prev => [...prev, { ...result, created_at: new Date().toISOString() }])
        setNewDatabase({ name: '', path: '', description: '' })
        setShowAddForm(false)
        showToast('Banco de dados adicionado com sucesso', 'success')
      } else {
        const error = await response.json()
        showToast(error.error || 'Erro ao adicionar banco de dados', 'error')
      }
    } catch (error) {
      console.error('Error adding database:', error)
      showToast('Erro ao adicionar banco de dados', 'error')
    }
  }

  const removeDatabase = async (name: string) => {
    if (!confirm('Tem certeza que deseja remover este banco de dados?')) {
      return
    }

    try {
      const response = await fetch(`http://localhost:3000/api/databases/${encodeURIComponent(name)}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setDatabases(prev => prev.filter(db => db.name !== name))
        showToast('Banco de dados removido com sucesso', 'success')
      } else {
        const error = await response.json()
        showToast(error.error || 'Erro ao remover banco de dados', 'error')
      }
    } catch (error) {
      console.error('Error removing database:', error)
      showToast('Erro ao remover banco de dados', 'error')
    }
  }

  const viewSchema = async (database: DatabaseInfo) => {
    setSelectedDatabase(database)
    setSchemaLoading(true)
    try {
      const response = await fetch(`http://localhost:3000/api/databases/${encodeURIComponent(database.name)}/schema`)
      if (response.ok) {
        const schemaData = await response.json()
        setSchema(schemaData)
      } else {
        const error = await response.json()
        showToast(error.error || 'Erro ao carregar estrutura do banco', 'error')
        setSchema(null)
      }
    } catch (error) {
      console.error('Error fetching schema:', error)
      showToast('Erro ao carregar estrutura do banco', 'error')
      setSchema(null)
    } finally {
      setSchemaLoading(false)
    }
  }

  const selectFile = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.db,.sqlite,.sqlite3'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        setNewDatabase(prev => ({
          ...prev,
          path: file.path || file.name,
          name: prev.name || file.name.replace(/\.(db|sqlite|sqlite3)$/, '')
        }))
      }
    }
    input.click()
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Database className="text-primary-600" size={24} />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Bancos de Dados SQLite
          </h2>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus size={16} />
          Adicionar Banco
        </button>
      </div>

      {showAddForm && (
        <div className="bg-gray-50 dark:bg-dark-700 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Adicionar Novo Banco de Dados
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nome
              </label>
              <input
                type="text"
                value={newDatabase.name}
                onChange={(e) => setNewDatabase(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-dark-800 dark:text-white"
                placeholder="Nome para identificar o banco"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Caminho do Arquivo
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newDatabase.path}
                  onChange={(e) => setNewDatabase(prev => ({ ...prev, path: e.target.value }))}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-dark-800 dark:text-white font-mono text-sm"
                  placeholder="/caminho/para/arquivo.db"
                />
                <button
                  onClick={selectFile}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-600 transition-colors"
                >
                  <FolderOpen size={16} />
                  Procurar
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Descrição
              </label>
              <textarea
                value={newDatabase.description}
                onChange={(e) => setNewDatabase(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-dark-800 dark:text-white resize-none"
                rows={3}
                placeholder="Descreva o conteúdo do banco (ex: dados de filmes, vendas, usuários...)"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button
              onClick={addDatabase}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Adicionar
            </button>
            <button
              onClick={() => {
                setShowAddForm(false)
                setNewDatabase({ name: '', path: '', description: '' })
              }}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 flex gap-6">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Bancos Registrados ({databases.length})
          </h3>
          
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent"></div>
            </div>
          ) : databases.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-gray-500 dark:text-gray-400">
              <Database size={48} className="mb-4" />
              <p>Nenhum banco de dados registrado</p>
              <p className="text-sm">Clique em "Adicionar Banco" para começar</p>
            </div>
          ) : (
            <div className="space-y-3">
              {databases.map((db) => (
                <div
                  key={db.id}
                  className={`border rounded-lg p-4 transition-colors cursor-pointer ${
                    selectedDatabase?.id === db.id
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                  onClick={() => viewSchema(db)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Database size={16} className="text-primary-600" />
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {db.name}
                        </h4>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {db.description || 'Sem descrição'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 font-mono">
                        {db.path}
                      </p>
                      {db.last_accessed && (
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                          Último acesso: {new Date(db.last_accessed).toLocaleString()}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          viewSchema(db)
                        }}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-600 transition-colors"
                        title="Ver estrutura"
                      >
                        <Eye size={16} className="text-gray-500 dark:text-gray-400" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          removeDatabase(db.name)
                        }}
                        className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                        title="Remover"
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

        {selectedDatabase && (
          <div className="w-1/2 border-l border-gray-200 dark:border-gray-600 pl-6">
            <div className="flex items-center gap-2 mb-4">
              <Search size={20} className="text-primary-600" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Estrutura: {selectedDatabase.name}
              </h3>
            </div>

            {schemaLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary-600 border-t-transparent"></div>
              </div>
            ) : schema ? (
              <div className="space-y-4">
                {Object.entries(schema).length === 0 ? (
                  <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                    <AlertCircle size={16} />
                    <span>Nenhuma tabela encontrada</span>
                  </div>
                ) : (
                  Object.entries(schema).map(([tableName, columns]: [string, any]) => (
                    <div key={tableName} className="bg-gray-50 dark:bg-dark-700 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                        <Database size={16} className="text-primary-600" />
                        {tableName}
                      </h4>
                      <div className="space-y-2">
                        {columns.map((column: any) => (
                          <div key={column.name} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-gray-900 dark:text-white">
                                {column.name}
                              </span>
                              {column.primaryKey && (
                                <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 text-xs rounded-full">
                                  PK
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                              <span className="font-mono text-xs">
                                {column.type}
                              </span>
                              <span className="text-xs">
                                {column.nullable ? 'NULL' : 'NOT NULL'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                <AlertCircle size={16} />
                <span>Erro ao carregar estrutura do banco</span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <div className="flex items-start gap-3">
          <AlertCircle size={20} className="text-blue-600 dark:text-blue-400 mt-0.5" />
          <div>
            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
              Como usar os bancos de dados
            </h4>
            <div className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <p>• <strong>Registre bancos SQLite</strong> com nome e descrição detalhada</p>
              <p>• <strong>Faça perguntas naturais</strong> no chat como "quantos usuários temos?" ou "mostre as vendas de janeiro"</p>
              <p>• <strong>O sistema identifica automaticamente</strong> qual banco consultar baseado na sua pergunta</p>
              <p>• <strong>Apenas consultas SELECT</strong> são permitidas por segurança</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}