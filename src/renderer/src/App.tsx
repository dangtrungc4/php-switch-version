import { clsx, type ClassValue } from 'clsx'
import { AnimatePresence, motion } from 'framer-motion'
import { FolderCode, LayoutDashboard, type LucideIcon } from 'lucide-react'
import { useState, type JSX } from 'react'
import { twMerge } from 'tailwind-merge'
import logo from './assets/logo.png'
import Dashboard from './components/Dashboard'
import Projects from './components/Projects'

function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

function App(): JSX.Element {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'projects'>('dashboard')
  const [isCollapsed, setIsCollapsed] = useState(false)

  const tabs: { id: 'dashboard' | 'projects'; label: string; icon: LucideIcon }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'projects', label: 'Projects', icon: FolderCode }
  ]

  return (
    <div className="flex h-screen w-full bg-background text-text-main overflow-hidden font-sans transition-colors duration-500 overflow-x-hidden">
      {/* Sidebar */}
      <aside
        className={cn(
          'border-r border-border bg-sidebar backdrop-blur-2xl flex flex-col z-20 transition-all duration-500 ease-in-out relative shrink-0',
          isCollapsed ? 'w-20 md:w-24' : 'w-0 md:w-72 overflow-hidden md:overflow-visible'
        )}
      >
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-10 w-6 h-6 bg-indigo-500 text-white rounded-full flex items-center justify-center shadow-lg z-30 hover:scale-110 active:scale-95 transition-transform"
        >
          <motion.div animate={{ rotate: isCollapsed ? 180 : 0 }}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
          </motion.div>
        </button>

        <div
          className={cn(
            'flex-1 flex flex-col transition-all duration-500',
            isCollapsed ? 'p-4' : 'p-8'
          )}
        >
          <div
            className={cn('flex items-center gap-4 mb-12', isCollapsed ? 'justify-center' : 'px-2')}
          >
            <div className="w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-500/20 relative group overflow-hidden bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10">
              <img
                src={logo}
                alt="TN Logo"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
            </div>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex-1 whitespace-nowrap"
              >
                <h1 className="font-black text-xl leading-none tracking-tight bg-linear-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                  PHP Manager
                </h1>
                <p className="text-[10px] font-bold text-indigo-500/80 uppercase tracking-widest mt-1">
                  by Trung Nguyễn
                </p>
              </motion.div>
            )}
          </div>

          <nav className="space-y-2">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'w-full flex items-center gap-4 py-4 rounded-2xl text-sm font-bold transition-all duration-300 relative group',
                    isCollapsed ? 'justify-center px-0' : 'px-5',
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
                      'w-5 h-5 shrink-0 transition-transform duration-300 group-hover:scale-110',
                      isActive ? 'text-indigo-400' : 'text-text-muted'
                    )}
                  />
                  {!isCollapsed && (
                    <span className="relative z-10 whitespace-nowrap">{tab.label}</span>
                  )}
                  {isActive && !isCollapsed && (
                    <div className="absolute right-4 w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
                  )}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Footer */}
        <div className={cn('mt-auto transition-all duration-500', isCollapsed ? 'p-4' : 'p-8')}>
          <div
            className={cn(
              'flex flex-col gap-3 opacity-70 hover:opacity-100 transition-opacity duration-300',
              isCollapsed ? 'items-center' : 'items-end'
            )}
          >
            <div className={cn('flex gap-3', isCollapsed ? 'flex-col' : '')}>
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
            {!isCollapsed && (
              <div className="text-right">
                <p className="text-[10px] font-medium text-text-muted uppercase tracking-widest">
                  Crafted with ❤️ by
                </p>
                <p className="text-xs font-bold text-text-muted tracking-tight">Trung Nguyễn</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-background relative transition-colors duration-500 overflow-x-hidden">
        {!isCollapsed && (
          <button
            onClick={() => setIsCollapsed(true)}
            className="md:hidden fixed top-4 left-4 z-50 p-2 bg-indigo-500 text-white rounded-lg shadow-lg"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        )}
        {isCollapsed && (
          <button
            onClick={() => setIsCollapsed(false)}
            className="md:hidden fixed top-4 left-4 z-50 p-2 bg-indigo-500 text-white rounded-lg shadow-lg"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        )}

        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02] pointer-events-none" />
        <div className="p-3 md:p-8 max-w-7xl mx-auto relative z-10">
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
