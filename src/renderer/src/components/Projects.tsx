import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertTriangle,
  ExternalLink,
  Filter,
  Folder,
  Plus,
  Search,
  Settings,
  Terminal,
  Trash2,
  X
} from 'lucide-react'
import { useCallback, useEffect, useState, type JSX } from 'react'
import { createPortal } from 'react-dom'

export default function Projects(): JSX.Element {
  const [projects, setProjects] = useState<any[]>([])
  const [versions, setVersions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [projectToDelete, setProjectToDelete] = useState<any>(null)
  const [editingProject, setEditingProject] = useState<any>(null)
  const [newProject, setNewProject] = useState({ name: '', path: '', phpVersionId: '' })
  const [searchQuery, setSearchQuery] = useState('')

  const fetchData = useCallback(async () => {
    try {
      const [projData, verData] = await Promise.all([
        window.api.getProjects(),
        window.api.getInstalledVersions()
      ])
      setProjects(projData)
      setVersions(verData)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, []) // fetchData now has zero dependencies and a stable identity

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Set default PHP version when versions are loaded
  useEffect(() => {
    if (versions.length > 0 && !newProject.phpVersionId) {
      setNewProject((prev) => ({ ...prev, phpVersionId: versions[0].id }))
    }
  }, [versions, newProject.phpVersionId])

  const handleSelectFolder = async () => {
    const folder = await window.api.selectFolder()
    if (folder) {
      const name = folder.split(/[\\/]/).pop() || ''
      if (showEditModal) {
        setEditingProject({ ...editingProject, path: folder, name })
      } else {
        setNewProject({ ...newProject, path: folder, name })
      }
    }
  }

  const handleAddProject = async () => {
    if (!newProject.name || !newProject.path || !newProject.phpVersionId) return
    await window.api.addProject({ ...newProject, id: Date.now().toString() })
    setShowAddModal(false)
    setNewProject({ name: '', path: '', phpVersionId: versions[0]?.id || '' })
    setLoading(true)
    fetchData()
  }

  const handleUpdateProject = async () => {
    if (!editingProject.name || !editingProject.path || !editingProject.phpVersionId) return
    await window.api.updateProject(editingProject)
    setShowEditModal(false)
    setEditingProject(null)
    setLoading(true)
    fetchData()
  }

  const confirmDelete = async () => {
    if (projectToDelete) {
      await window.api.deleteProject(projectToDelete.id)
      setShowDeleteConfirm(false)
      setProjectToDelete(null)
      setLoading(true)
      fetchData()
    }
  }

  const handleOpenTerminal = async (phpVersionId: string, projectPath: string) => {
    const version = versions.find((v) => v.id === phpVersionId)
    if (version) {
      await window.api.openTerminal(version.path, projectPath)
    }
  }

  const handleOpenFolder = async (path: string) => {
    await window.api.openFolder(path)
  }

  const [visibleCount, setVisibleCount] = useState(6)

  const filteredProjects = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.path.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const visibleProjects = filteredProjects.slice(0, visibleCount)

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-text-main">Project Manager</h2>
          <p className="text-text-muted mt-1 font-medium">
            Configure specific PHP versions for your workspaces.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-500 text-white rounded-2xl font-bold transition-all shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/40 active:scale-95 hover:-translate-y-0.5"
        >
          <Plus className="w-5 h-5" />
          Add New Project
        </button>
      </header>

      {/* Search & Filter */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects..."
            className="w-full bg-black/5 dark:bg-white/5 border border-border rounded-xl py-2.5 pl-11 pr-4 focus:outline-hidden focus:border-indigo-500/50 transition-colors text-text-main"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-black/5 dark:bg-white/5 border border-border rounded-xl text-text-muted hover:text-text-main hover:bg-black/10 dark:bg-white/10 transition-all">
          <Filter className="w-4 h-4" />
          Filter
        </button>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {visibleProjects.map((project) => {
          const version = versions.find((v) => v.id === project.phpVersionId)
          return (
            <motion.div
              key={project.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass group rounded-[2.5rem] p-7 border-border bg-white dark:bg-white/5 hover:border-indigo-500/30 transition-all duration-500 shadow-xl shadow-black/5 dark:shadow-none"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                    <Folder className="w-6 h-6 text-indigo-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg text-text-main group-hover:text-indigo-400 transition-colors truncate max-w-[150px]">
                      {project.name}
                    </h4>
                    <p className="text-xs text-text-muted font-mono truncate max-w-[150px]">
                      {project.path}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleOpenFolder(project.path)}
                    className="p-2 hover:bg-black/5 dark:bg-white/5 rounded-lg text-text-muted hover:text-text-main transition-colors"
                    title="Open Folder"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setProjectToDelete(project)
                      setShowDeleteConfirm(true)
                    }}
                    className="p-2 hover:bg-red-500/10 rounded-lg text-text-muted hover:text-red-400 transition-colors"
                    title="Delete Project"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="bg-black/10 dark:bg-black/20 rounded-2xl p-4 flex items-center justify-between mb-6 border border-border">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-sm font-semibold text-text-main">
                    {version ? `PHP ${version.version}` : 'Unknown Version'}
                  </span>
                </div>
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest bg-black/5 dark:bg-white/5 px-2 py-0.5 rounded">
                  {version?.type || 'N/A'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleOpenTerminal(project.phpVersionId, project.path)}
                  className="flex items-center justify-center gap-2 py-2.5 bg-black/10 dark:bg-slate-800 hover:bg-slate-700 dark:hover:bg-slate-600  rounded-xl text-sm text-white font-bold transition-all border border-black/5 dark:border-white/5"
                >
                  <Terminal className="w-4 h-4" />
                  Terminal
                </button>
                <button
                  onClick={() => {
                    setEditingProject(project)
                    setShowEditModal(true)
                  }}
                  className="flex items-center justify-center gap-2 py-2.5 bg-black/5 dark:bg-white/5 hover:bg-black/10 text-text-muted hover:text-text-main rounded-xl text-sm font-bold transition-all border border-border"
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </button>
              </div>
            </motion.div>
          )
        })}

        {/* Empty State */}
        {filteredProjects.length === 0 && !loading && (
          <div className="col-span-full py-20 flex flex-col items-center justify-center border-2 border-dashed border-border rounded-4xl">
            <div className="w-20 h-20 rounded-3xl bg-black/5 dark:bg-white/5 flex items-center justify-center mb-6">
              <Folder className="w-10 h-10 text-text-muted opacity-20" />
            </div>
            <h3 className="text-xl font-bold text-text-muted">
              {searchQuery ? 'No matching projects' : 'No projects yet'}
            </h3>
            <p className="text-text-muted mt-2 text-center max-w-xs font-medium">
              {searchQuery
                ? 'Try a different search term.'
                : 'Add your first project to start managing its PHP environment.'}
            </p>
            {!searchQuery && (
              <button
                onClick={() => setShowAddModal(true)}
                className="mt-8 px-6 py-3 bg-indigo-500 text-white rounded-2xl font-bold transition-all shadow-lg shadow-indigo-500/20"
              >
                Get Started
              </button>
            )}
          </div>
        )}
      </div>

      {/* Load More Button */}
      {visibleCount < filteredProjects.length && (
        <div className="flex justify-center pt-8">
          <button
            onClick={() => setVisibleCount((prev) => prev + 6)}
            className="px-8 py-3 bg-black/5 dark:bg-white/5 border border-border rounded-2xl text-text-main font-bold hover:bg-black/10 dark:bg-white/10 transition-all hover:scale-105 active:scale-95"
          >
            Load More Projects
          </button>
        </div>
      )}

      {createPortal(
        <AnimatePresence>
          {/* Add Modal */}
          {showAddModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={() => setShowAddModal(false)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="w-full max-w-lg glass rounded-[2.5rem] p-8 relative z-10 border-indigo-500/20"
              >
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-2xl font-bold text-text-main">Add New Project</h3>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="p-2 hover:bg-black/5 dark:bg-white/5 rounded-full text-text-muted transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-text-muted mb-2">
                      Project Path
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        readOnly
                        value={newProject.path}
                        placeholder="Select project folder..."
                        className="flex-1 bg-black/5 dark:bg-white/5 border border-border rounded-xl px-4 py-2.5 focus:outline-hidden text-text-main"
                      />
                      <button
                        onClick={handleSelectFolder}
                        className="px-4 py-2.5 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:bg-white/10 border border-border rounded-xl font-medium transition-all text-text-main"
                      >
                        Browse
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-muted mb-2">
                      Project Name
                    </label>
                    <input
                      type="text"
                      value={newProject.name}
                      onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                      placeholder="Enter project name..."
                      className="w-full bg-black/5 dark:bg-white/5 border border-border rounded-xl px-4 py-2.5 focus:outline-hidden focus:border-indigo-500/50 transition-colors text-text-main"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-muted mb-2">
                      PHP Version
                    </label>
                    <select
                      value={newProject.phpVersionId}
                      onChange={(e) =>
                        setNewProject({ ...newProject, phpVersionId: e.target.value })
                      }
                      className="w-full bg-black/5 dark:bg-white/5 border border-border rounded-xl px-4 py-2.5 focus:outline-hidden focus:border-indigo-500/50 transition-colors appearance-none text-text-main"
                    >
                      {versions.map((v) => (
                        <option key={v.id} value={v.id} className="bg-sidebar">
                          PHP {v.version} ({v.type})
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={handleAddProject}
                    disabled={!newProject.path || !newProject.name}
                    className="w-full py-4 bg-indigo-500 text-white rounded-2xl font-bold transition-all shadow-xl shadow-indigo-500/20 mt-4"
                  >
                    Create Project
                  </button>
                </div>
              </motion.div>
            </div>
          )}

          {/* Edit Modal */}
          {showEditModal && editingProject && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={() => setShowEditModal(false)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="w-full max-w-lg glass rounded-[2.5rem] p-8 relative z-10 border-indigo-500/20"
              >
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-2xl font-bold text-text-main">Edit Project</h3>
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="p-2 hover:bg-black/5 dark:bg-white/5 rounded-full text-text-muted transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-text-muted mb-2">
                      Project Path
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        readOnly
                        value={editingProject.path}
                        className="flex-1 bg-black/5 dark:bg-white/5 border border-border rounded-xl px-4 py-2.5 focus:outline-hidden opacity-50 text-text-main"
                      />
                      <button
                        onClick={handleSelectFolder}
                        className="px-4 py-2.5 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:bg-white/10 border border-border rounded-xl font-medium transition-all text-text-main"
                      >
                        Change
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-muted mb-2">
                      Project Name
                    </label>
                    <input
                      type="text"
                      value={editingProject.name}
                      onChange={(e) =>
                        setEditingProject({ ...editingProject, name: e.target.value })
                      }
                      className="w-full bg-black/5 dark:bg-white/5 border border-border rounded-xl px-4 py-2.5 focus:outline-hidden focus:border-indigo-500/50 transition-colors text-text-main"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-muted mb-2">
                      PHP Version
                    </label>
                    <select
                      value={editingProject.phpVersionId}
                      onChange={(e) =>
                        setEditingProject({ ...editingProject, phpVersionId: e.target.value })
                      }
                      className="w-full bg-black/5 dark:bg-white/5 border border-border rounded-xl px-4 py-2.5 focus:outline-hidden focus:border-indigo-500/50 transition-colors appearance-none text-text-main"
                    >
                      {versions.map((v) => (
                        <option key={v.id} value={v.id} className="bg-sidebar">
                          PHP {v.version} ({v.type})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={() => setShowEditModal(false)}
                      className="flex-1 py-4 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:bg-white/10 text-text-main rounded-2xl font-bold transition-all border border-border"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleUpdateProject}
                      className="flex-1 py-4 bg-indigo-500 text-white rounded-2xl font-bold transition-all shadow-xl shadow-indigo-500/20"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}

          {/* Delete Confirmation Modal */}
          {showDeleteConfirm && projectToDelete && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={() => setShowDeleteConfirm(false)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-md glass rounded-[2.5rem] p-8 relative z-10 border-red-500/20 text-center"
              >
                <div className="w-20 h-20 rounded-3xl bg-red-500/10 flex items-center justify-center mx-auto mb-6">
                  <AlertTriangle className="w-10 h-10 text-red-500" />
                </div>
                <h3 className="text-2xl font-bold mb-2 text-text-main">Delete Project?</h3>
                <p className="text-text-muted mb-8">
                  Are you sure you want to remove{' '}
                  <span className="text-text-main font-bold">{projectToDelete.name}</span>? This
                  action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 py-4 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:bg-white/10 text-text-main rounded-2xl font-bold transition-all border border-border"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="flex-1 py-4 bg-red-500 text-white rounded-2xl font-bold transition-all shadow-xl shadow-red-500/20"
                  >
                    Delete
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  )
}
