import { motion } from 'framer-motion'
import {
  ArrowRight,
  CheckCircle2,
  Download,
  ExternalLink,
  ShieldCheck,
  Terminal,
  X
} from 'lucide-react'
import { JSX, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

export default function Dashboard(): JSX.Element {
  const [versions, setVersions] = useState<PHPVersion[]>([])
  const [availableVersions, setAvailableVersions] = useState<AvailableVersion[]>([])
  const [, setLoading] = useState(true)
  const [switching, setSwitching] = useState<string | null>(null)
  const [showReleasesModal, setShowReleasesModal] = useState(false)
  const [installingVersion, setInstallingVersion] = useState<AvailableVersion | null>(null)
  const [installStep, setInstallStep] = useState<string>('')
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean
    title: string
    message: string
    onConfirm: () => void
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  })

  const [infoModal, setInfoModal] = useState<{
    isOpen: boolean
    title: string
    message: string
  }>({
    isOpen: false,
    title: '',
    message: ''
  })

  const showInfo = (title: string, message: string): void =>
    setInfoModal({ isOpen: true, title, message })

  const fetchVersions = async (): Promise<void> => {
    setLoading(true)
    try {
      const [installed, available] = await Promise.all([
        window.api.getInstalledVersions(),
        window.api.getAvailableVersions()
      ])
      setVersions(installed)
      setAvailableVersions(available)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchVersions()

    // Listen for php.ini changes
    window.api.onPhpConfigApplied((data) => {
      showInfo(
        'Configuration Applied',
        `Changes in ${data.path} have been applied. Any running PHP processes were restarted.`
      )
    })
  }, [])

  const handleSwitch = async (id: string): Promise<void> => {
    setSwitching(id)
    try {
      await window.api.switchGlobal(id)
      await fetchVersions()
    } catch (err) {
      alert('Error switching version: ' + err)
    } finally {
      setSwitching(null)
    }
  }

  const handleInstall = async (v: AvailableVersion): Promise<void> => {
    setInstallingVersion(v)
    setInstallStep('Downloading ZIP from windows.php.net...')
    try {
      // Since we don't have streaming IPC yet, we simulate steps
      setTimeout(() => setInstallStep('Extracting files to C:\\PHPManager\\versions...'), 2000)
      setTimeout(() => setInstallStep('Setting up php.ini configuration...'), 4000)

      await window.api.installVersion({ url: v.url, id: v.id })
      setInstallStep('Installation complete!')
      await fetchVersions()
      setTimeout(() => {
        setInstallingVersion(null)
        setInstallStep('')
      }, 1000)
    } catch (err) {
      showInfo('Installation Failed', String(err))
      setInstallingVersion(null)
      setInstallStep('')
    }
  }

  const handleOpenTerminal = async (): Promise<void> => {
    if (activeVersion) {
      await window.api.openTerminal(activeVersion.path)
    } else {
      showInfo('No Active Version', 'Please switch to a PHP version before opening the terminal.')
    }
  }

  const activeVersion = versions.find((v) => v.installed && v.active)

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-text-main">System Dashboard</h2>
          <p className="text-text-muted mt-2 text-sm font-medium">
            Manage global PHP versions and environment status.
          </p>
        </div>
      </header>

      {/* Global Status Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 glass rounded-4xl p-8 relative overflow-hidden border-border bg-white dark:bg-white/5 shadow-xl shadow-black/5 dark:shadow-none">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <ShieldCheck className="w-20 h-20 text-indigo-500" />
          </div>

          <div className="relative z-10">
            <h3 className="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-6">
              Global System Status
            </h3>

            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
              <div className="text-5xl font-bold text-text-main tracking-tight">
                {versions.length > 0 ? 'Active' : 'Offline'}
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 text-emerald-400 rounded-xl text-xs font-bold border border-emerald-500/20 shadow-sm shadow-emerald-500/5">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                SYSTEM PATH READY
              </div>
            </div>

            <p className="text-text-muted text-sm leading-relaxed max-w-lg font-medium">
              Your system is currently using{' '}
              <span className="text-indigo-400 font-bold font-mono px-2 py-1 bg-indigo-500/10 rounded-md text-xs">
                C:\PHPManager\current
              </span>{' '}
              as the global PHP entry point.
            </p>

            <div className="flex flex-wrap gap-3 mt-8">
              <button
                onClick={handleOpenTerminal}
                className="flex items-center gap-2 px-6 py-3 bg-indigo-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/20 hover:-translate-y-0.5"
              >
                <Terminal className="w-4 h-4" />
                Test in Terminal
              </button>
              <button
                onClick={() => window.api.openEnvEditor()}
                className="flex items-center gap-2 px-6 py-3 bg-black/5 hover:bg-black/10 dark:bg-white/10 text-text-main rounded-xl font-bold transition-all border border-black/10 dark:border-white/10 hover:-translate-y-0.5"
              >
                <ExternalLink className="w-4 h-4" />
                System Variables
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 glass rounded-4xl p-8 relative overflow-hidden group hover:border-indigo-500/30 transition-all duration-500">
          <div className="absolute inset-0 bg-linear-to-br from-indigo-500/10 via-purple-500/5 to-transparent z-0" />
          <div className="absolute top-0 right-0 -mr-8 -mt-8 w-40 h-40 bg-indigo-500/20 blur-3xl rounded-full group-hover:bg-indigo-500/30 transition-colors duration-700" />

          <div className="relative z-10 h-full flex flex-col justify-between">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-white/5 border border-border flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 transition-transform duration-500">
                <Download className="w-6 h-6 text-indigo-400 group-hover:-translate-y-1 transition-transform duration-500" />
              </div>
              <h4 className="font-black text-2xl text-text-main tracking-tight mb-3">
                Quick Install
              </h4>
              <p className="text-text-muted text-sm font-medium leading-relaxed">
                Fetch and install the latest PHP versions directly from the official PHP.net
              </p>
            </div>

            <button
              onClick={() => setShowReleasesModal(true)}
              className="mt-8 flex items-center justify-between w-full p-4 bg-indigo-500 text-white rounded-2xl font-bold transition-all shadow-lg shadow-indigo-500/25 group-hover:shadow-indigo-500/40 hover:-translate-y-0.5"
            >
              <span>Browse Releases</span>
              <div className="w-8 h-8 rounded-xl bg-black/20 dark:bg-white/20 flex items-center justify-center group-hover:translate-x-1 transition-transform">
                <ArrowRight className="w-4 h-4" />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Installed Versions */}
      <section className="pt-4">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-2xl font-black text-text-main tracking-tight flex items-center gap-3">
            Installed Versions
            <span className="text-xs font-black text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
              {versions.length}
            </span>
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {versions.map((v) => (
            <motion.div
              layout
              key={v.id}
              className={cn(
                'glass rounded-2xl p-5 border transition-all duration-300 group',
                v.active
                  ? 'border-indigo-500/50 bg-indigo-500/5 shadow-lg shadow-indigo-500/5'
                  : 'border-black/5 hover:border-black/20 dark:border-white/20'
              )}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-black/10 dark:bg-slate-800 flex items-center justify-center font-bold text-text-muted group-hover:text-indigo-400 transition-colors">
                    {v.version.split('.')[0]}
                  </div>
                  <div>
                    <h4 className="font-bold text-text-main">PHP {v.version}</h4>
                    <div className="flex gap-2 mt-1">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/10 dark:bg-slate-800 text-text-muted font-bold uppercase">
                        {v.type}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/10 dark:bg-slate-800 text-text-muted font-bold uppercase">
                        {v.arch}
                      </span>
                    </div>
                  </div>
                </div>
                {v.active && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-indigo-500 dark:text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20">
                    ACTIVE
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-2 mt-4">
                <div className="flex gap-2">
                  <button
                    onClick={() => window.api.openPhpIni(v.path)}
                    className="flex-1 py-1.5 bg-black/5 hover:bg-black/10 dark:bg-white/10 text-text-muted rounded-lg text-[10px] font-bold transition-all border border-black/5 dark:border-white/5"
                  >
                    php.ini
                  </button>
                  <button
                    onClick={() => {
                      setConfirmModal({
                        isOpen: true,
                        title: 'Uninstall PHP',
                        message: `Are you sure you want to uninstall PHP ${v.version}? This will permanently remove all files and settings for this version.`,
                        onConfirm: async () => {
                          await window.api.uninstallPHP(v.id)
                          fetchVersions()
                        }
                      })
                    }}
                    className="flex-1 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-[10px] font-bold transition-all border border-red-500/10"
                  >
                    Uninstall
                  </button>
                </div>
                {!v.active && (
                  <button
                    onClick={() => handleSwitch(v.id)}
                    disabled={switching !== null}
                    className="w-full py-2 bg-indigo-500 text-white rounded-lg text-xs font-bold transition-all disabled:opacity-50"
                  >
                    {switching === v.id ? 'Switching...' : 'Switch Global'}
                  </button>
                )}
              </div>
            </motion.div>
          ))}

          {/* Empty State */}
          {/*versions.length === 0 && !loading && (
            <div className="col-span-full py-12 flex flex-col items-center justify-center border-2 border-dashed border-black/5 dark:border-white/5 rounded-3xl">
              <p className="text-text-muted mb-4">No PHP versions installed yet.</p>
              <div className="flex gap-3">
                {availableVersions.map((av) => (
                  <button
                    key={av.id}
                    onClick={() => handleInstall(av)}
                    disabled={loading}
                    className="px-4 py-2 bg-black/5 hover:bg-black/10 dark:bg-white/10 rounded-xl text-xs font-bold border border-black/10 dark:border-white/10 transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    <Download className="w-3 h-3" />
                    Install {av.version}
                  </button>
                ))}
              </div>
            </div>
          )*/}
        </div>
      </section>
      {/* Releases Modal */}
      {showReleasesModal &&
        createPortal(
          <div className="fixed inset-0 z-100 flex items-center justify-center p-6">
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowReleasesModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-2xl glass rounded-4xl p-8 relative z-10 border-indigo-500/20 max-h-[80vh] overflow-hidden flex flex-col"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold">Available PHP Releases</h3>
                <button
                  disabled={!!installingVersion}
                  onClick={() => setShowReleasesModal(false)}
                  className="p-2 hover:bg-black/5 dark:bg-white/5 rounded-full text-text-muted hover:text-text-main transition-colors disabled:opacity-50"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto pr-2">
                {installingVersion ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="w-20 h-20 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-6">
                      <Download className="w-10 h-10 text-indigo-400 animate-bounce" />
                    </div>
                    <h4 className="text-2xl font-bold text-text-main mb-2">
                      Installing PHP {installingVersion.version}
                    </h4>
                    <p className="text-text-muted mb-8 font-mono text-sm">{installStep}</p>
                    <div className="w-full max-w-md bg-black/5 dark:bg-white/5 h-2 rounded-full overflow-hidden relative">
                      <div className="absolute inset-y-0 left-0 bg-indigo-500 w-full animate-[shimmer_2s_infinite] origin-left" />
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {availableVersions.map((v) => {
                      const isInstalled = versions.some((iv) => iv.id === v.id)
                      return (
                        <div
                          key={v.id}
                          className="glass rounded-2xl p-4 border border-black/5 dark:border-white/5 flex items-center gap-6 group hover:border-indigo-500/30 hover:bg-black/5 dark:hover:bg-white/5 transition-all duration-300 relative overflow-hidden"
                        >
                          <div className="shrink-0 w-12 h-12 rounded-xl bg-black/10 dark:bg-slate-800 flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-lg shadow-black/10">
                            <span className="text-lg font-black text-text-muted group-hover:text-indigo-400">
                              {v.version.split('.')[0]}
                            </span>
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3">
                              <h4 className="font-bold text-lg text-text-main">PHP {v.version}</h4>
                              <div className="flex gap-1.5">
                                <span className="text-[9px] px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/5 text-text-muted font-bold uppercase tracking-wider border border-black/5 dark:border-white/5">
                                  {v.type}
                                </span>
                                <span className="text-[9px] px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/5 text-text-muted font-bold uppercase tracking-wider border border-black/5 dark:border-white/5">
                                  {v.arch}
                                </span>
                              </div>
                            </div>
                            <p className="text-xs text-text-muted mt-0.5 truncate">
                              Ready to install from official archives
                            </p>
                          </div>

                          <button
                            disabled={isInstalled || !!installingVersion}
                            onClick={() => handleInstall(v)}
                            className={cn(
                              'px-6 py-2 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 min-w-[140px]',
                              isInstalled
                                ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 cursor-default'
                                : 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 disabled:opacity-50'
                            )}
                          >
                            {isInstalled ? (
                              <>
                                <CheckCircle2 className="w-4 h-4" />
                                Installed
                              </>
                            ) : (
                              <>
                                <Download className="w-4 h-4" />
                                Install Now
                              </>
                            )}
                          </button>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              <p className="mt-6 text-xs text-text-muted text-center">
                Downloads are sourced directly from official Windows PHP archives.
              </p>
            </motion.div>
          </div>,
          document.body
        )}

      {/* Confirm Modal */}
      {confirmModal.isOpen &&
        createPortal(
          <div className="fixed inset-0 z-100 flex items-center justify-center p-6">
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
              onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="w-full max-w-sm glass rounded-3xl p-8 relative z-10 border-red-500/20 shadow-2xl shadow-red-500/5"
            >
              <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mb-6 mx-auto">
                <X className="w-8 h-8 text-red-400" />
              </div>

              <h3 className="text-xl font-bold text-text-main text-center mb-2">
                {confirmModal.title}
              </h3>
              <p className="text-text-muted text-center text-sm mb-8 leading-relaxed">
                {confirmModal.message}
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                  className="flex-1 py-3 bg-black/5 hover:bg-black/10 dark:bg-white/5 text-text-main rounded-xl font-bold transition-all border border-black/10 dark:border-white/10"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    confirmModal.onConfirm()
                    setConfirmModal({ ...confirmModal, isOpen: false })
                  }}
                  className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-red-500/20 hover:shadow-red-500/40"
                >
                  Uninstall
                </button>
              </div>
            </motion.div>
          </div>,
          document.body
        )}
      {/* Info Modal */}
      {infoModal.isOpen &&
        createPortal(
          <div className="fixed inset-0 z-100 flex items-center justify-center p-6">
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
              onClick={() => setInfoModal({ ...infoModal, isOpen: false })}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="w-full max-w-sm glass rounded-3xl p-8 relative z-10 border border-indigo-500/20 shadow-2xl shadow-indigo-500/5"
            >
              <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-6 mx-auto">
                <ShieldCheck className="w-8 h-8 text-indigo-400" />
              </div>
              <h3 className="text-xl font-bold text-text-main text-center mb-2">
                {infoModal.title}
              </h3>
              <p className="text-text-muted text-center text-sm mb-8 leading-relaxed">
                {infoModal.message}
              </p>
              <button
                onClick={() => setInfoModal({ ...infoModal, isOpen: false })}
                className="w-full py-3 bg-indigo-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40"
              >
                OK
              </button>
            </motion.div>
          </div>,
          document.body
        )}
    </div>
  )
}

function cn(...inputs: (string | boolean | undefined | null)[]): string {
  return inputs.filter(Boolean).join(' ')
}
