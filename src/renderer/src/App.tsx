import { clsx, type ClassValue } from 'clsx'
import { AnimatePresence, motion } from 'framer-motion'
import { FolderCode, LayoutDashboard } from 'lucide-react'
import { useState, type JSX } from 'react'
import { twMerge } from 'tailwind-merge'
import logo from './assets/logo.png'
import Dashboard from './components/Dashboard'
import Projects from './components/Projects'
import ThemeToggle from './components/ThemeToggle'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

function App(): JSX.Element {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'projects'>('dashboard')

  const tabs: { id: 'dashboard' | 'projects'; label: string; icon: React.ComponentType<any> }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'projects', label: 'Projects', icon: FolderCode }
  ]

  return (
    <div className="flex h-screen w-full bg-background text-text-main overflow-hidden font-sans transition-colors duration-500">
      {/* Sidebar */}
      <aside className="w-72 border-r border-border bg-sidebar backdrop-blur-2xl flex flex-col z-20">
        <div className="p-8 flex-1">
          <div className="flex items-center gap-4 mb-12 px-2">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-500/20 relative group overflow-hidden bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10">
              <img
                src={logo}
                alt="TN Logo"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
            </div>
            <div className="flex-1">
              <h1 className="font-black text-xl leading-none tracking-tight bg-linear-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                PHP Manager
              </h1>
              <p className="text-[10px] font-bold text-indigo-500/80 uppercase tracking-widest mt-1">
                by Trung Nguyễn
              </p>
            </div>
          </div>

          <nav className="space-y-2">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-bold transition-all duration-300 relative group',
                    isActive
                      ? 'bg-indigo-500/10 text-indigo-500'
                      : 'text-text-muted hover:text-text-main hover:bg-black/5 dark:bg-white/5'
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 rounded-2xl border border-indigo-500/30 shadow-[inset_0_0_20px_rgba(99,102,241,0.1)]"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <tab.icon
                    className={cn(
                      'w-5 h-5 transition-transform duration-300 group-hover:scale-110',
                      isActive ? 'text-indigo-400' : 'text-text-muted'
                    )}
                  />
                  <span className="relative z-10">{tab.label}</span>
                  {isActive && (
                    <div className="absolute right-4 w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
                  )}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Footer */}
        <div className="p-8 mt-auto">
          <div className="flex flex-col items-end gap-3 opacity-70 hover:opacity-100 transition-opacity duration-300">
            <div className="flex gap-3">
              <a
                href="#"
                className="p-1.5 rounded-lg hover:bg-black/10 dark:bg-white/10 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-4 h-4 text-text-muted"
                >
                  <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.2c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                  <path d="M9 18c-4.51 2-5-2-7-2" />
                </svg>
              </a>
              <a
                href="#"
                className="p-1.5 rounded-lg hover:bg-black/10 dark:bg-white/10 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-4 h-4 text-text-muted"
                >
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                  <rect width="4" height="12" x="2" y="9" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
              </a>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-medium text-text-muted uppercase tracking-widest">
                Crafted with ❤️ by
              </p>
              <p className="text-xs font-bold text-text-muted tracking-tight">Trung Nguyễn</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-background relative transition-colors duration-500">
        <div className="absolute top-8 right-8 z-30">
          <ThemeToggle />
        </div>

        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02] pointer-events-none" />
        <div className="p-8 max-w-7xl mx-auto relative z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
              transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
            >
              {activeTab === 'dashboard' && <Dashboard />}
              {activeTab === 'projects' && <Projects />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}

export default App
