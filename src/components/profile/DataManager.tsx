import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Download, Upload, Trash2 } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export function DataManager() {
  const { exportData, importData, clearData } = useAuth()
  const fileRef = useRef<HTMLInputElement>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const handleExport = async () => {
    setBusy(true)
    setMessage(null)
    try {
      await exportData()
      setMessage('Exported! JSON file downloaded.')
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Export failed')
    }
    setBusy(false)
  }

  const handleImport = async (file: File) => {
    setBusy(true)
    setMessage(null)
    const err = await importData(file)
    setMessage(err ? err : 'Data imported successfully.')
    setBusy(false)
    if (fileRef.current) fileRef.current.value = ''
  }

  const handleLoadDemo = async () => {
    setBusy(true)
    setMessage(null)
    try {
      const res = await fetch('/demo-stats.json')
      if (!res.ok) throw new Error('Demo file not found')
      const payload = await res.json()
      const err = await importData(
        new File([JSON.stringify(payload)], 'demo-stats.json', {
          type: 'application/json',
        })
      )
      setMessage(err ? err : 'Demo stats loaded (3W / 2L / 1D).')
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Could not load demo')
    }
    setBusy(false)
  }

  const handleClear = async () => {
    if (
      !confirm(
        'Delete all local stats and match history? You can re-import a backup JSON file later.'
      )
    ) {
      return
    }
    setBusy(true)
    await clearData()
    setMessage('Local data cleared.')
    setBusy(false)
  }

  return (
    <section>
      <h2 className="mb-2 font-display text-lg font-bold">Local database</h2>
      <p className="mb-3 text-xs text-[var(--text-secondary)]">
        Stats are stored in your browser (IndexedDB). Export a JSON file to move
        data to another device or share with moderators — no internet required.
      </p>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={handleExport}
          className="glass flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition hover:bg-white/10 disabled:opacity-50"
        >
          <Download className="h-4 w-4 text-pulse-400" />
          Export JSON
        </button>

        <button
          type="button"
          disabled={busy}
          onClick={() => fileRef.current?.click()}
          className="glass flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition hover:bg-white/10 disabled:opacity-50"
        >
          <Upload className="h-4 w-4 text-neon-cyan" />
          Import JSON
        </button>

        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleImport(file)
          }}
        />

        <button
          type="button"
          disabled={busy}
          onClick={handleLoadDemo}
          className="glass flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition hover:bg-white/10 disabled:opacity-50"
        >
          Load demo
        </button>

        <button
          type="button"
          disabled={busy}
          onClick={handleClear}
          className="glass flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-red-400 transition hover:bg-red-500/10 disabled:opacity-50"
        >
          <Trash2 className="h-4 w-4" />
          Clear local
        </button>
      </div>

      {message && (
        <motion.p
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 text-xs text-[var(--text-secondary)]"
        >
          {message}
        </motion.p>
      )}
    </section>
  )
}
