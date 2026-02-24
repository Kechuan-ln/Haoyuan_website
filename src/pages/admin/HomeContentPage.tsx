import { useState, useEffect } from 'react'
import {
  Save,
  RotateCcw,
  Plus,
  Trash2,
  Loader2,
  Home,
  ShieldCheck,
  BarChart3,
} from 'lucide-react'
import { ICON_MAP, getIcon } from '@/config/icon-map'
import { getHomeContent, updateHomeContent } from '@/services/home-content.service'
import type { HomeContent, BrandValue, ThreeNoWorry, HomeStat } from '@/types/home'

/* ---------- Default Content ---------- */

const DEFAULT_CONTENT: Omit<HomeContent, 'updatedAt'> = {
  brandValues: [
    { label: '专业', iconName: 'Target', description: '以精湛技术立身' },
    { label: '共赢', iconName: 'Handshake', description: '与客户共创价值' },
    { label: '责任', iconName: 'Shield', description: '对品质负责到底' },
    { label: '诚信', iconName: 'Heart', description: '以诚信赢得信赖' },
  ],
  threeNoWorries: [
    {
      title: '质量零事故',
      iconName: 'ShieldCheck',
      description: '严格把控工程质量，建立全过程质量管控体系，确保每一个环节都符合国家标准和行业规范。',
    },
    {
      title: '安全无隐患',
      iconName: 'HardHat',
      description: '贯彻安全生产责任制，落实安全防护措施，打造零隐患施工环境，保障人员与财产安全。',
    },
    {
      title: '进度可视化',
      iconName: 'BarChart3',
      description: '运用数字化管理工具，实时跟踪项目进度，让客户随时掌握工程动态，做到心中有数。',
    },
  ],
  stats: [
    { value: '50+', label: '项目经验', iconName: 'Briefcase' },
    { value: '100%', label: '合格率', iconName: 'CheckCircle' },
    { value: '5+', label: '业务领域', iconName: 'Award' },
    { value: '2021', label: '成立年份', iconName: 'Calendar' },
  ],
}

const ICON_NAMES = Object.keys(ICON_MAP)

/* ---------- Component ---------- */

export default function HomeContentPage() {
  const [content, setContent] = useState<Omit<HomeContent, 'updatedAt'>>(() =>
    structuredClone(DEFAULT_CONTENT),
  )
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isSaved, setIsSaved] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const data = await getHomeContent()
        if (data) {
          setContent({
            brandValues: data.brandValues?.length ? data.brandValues : DEFAULT_CONTENT.brandValues,
            threeNoWorries: data.threeNoWorries?.length ? data.threeNoWorries : DEFAULT_CONTENT.threeNoWorries,
            stats: data.stats?.length ? data.stats : DEFAULT_CONTENT.stats,
          })
        }
      } catch {
        // Keep defaults
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  /* --- Brand Value helpers --- */

  function updateBrandValue<K extends keyof BrandValue>(
    index: number,
    field: K,
    value: BrandValue[K],
  ) {
    setContent((prev) => {
      const brandValues = [...prev.brandValues]
      brandValues[index] = { ...brandValues[index], [field]: value }
      return { ...prev, brandValues }
    })
    setIsSaved(false)
  }

  function addBrandValue() {
    setContent((prev) => ({
      ...prev,
      brandValues: [...prev.brandValues, { label: '', iconName: 'Target', description: '' }],
    }))
    setIsSaved(false)
  }

  function removeBrandValue(index: number) {
    setContent((prev) => ({
      ...prev,
      brandValues: prev.brandValues.filter((_, i) => i !== index),
    }))
    setIsSaved(false)
  }

  /* --- Three No Worries helpers --- */

  function updateNoWorry<K extends keyof ThreeNoWorry>(
    index: number,
    field: K,
    value: ThreeNoWorry[K],
  ) {
    setContent((prev) => {
      const threeNoWorries = [...prev.threeNoWorries]
      threeNoWorries[index] = { ...threeNoWorries[index], [field]: value }
      return { ...prev, threeNoWorries }
    })
    setIsSaved(false)
  }

  function addNoWorry() {
    setContent((prev) => ({
      ...prev,
      threeNoWorries: [...prev.threeNoWorries, { title: '', iconName: 'ShieldCheck', description: '' }],
    }))
    setIsSaved(false)
  }

  function removeNoWorry(index: number) {
    setContent((prev) => ({
      ...prev,
      threeNoWorries: prev.threeNoWorries.filter((_, i) => i !== index),
    }))
    setIsSaved(false)
  }

  /* --- Stats helpers --- */

  function updateStat<K extends keyof HomeStat>(
    index: number,
    field: K,
    value: HomeStat[K],
  ) {
    setContent((prev) => {
      const stats = [...prev.stats]
      stats[index] = { ...stats[index], [field]: value }
      return { ...prev, stats }
    })
    setIsSaved(false)
  }

  function addStat() {
    setContent((prev) => ({
      ...prev,
      stats: [...prev.stats, { value: '', label: '', iconName: 'Briefcase' }],
    }))
    setIsSaved(false)
  }

  function removeStat(index: number) {
    setContent((prev) => ({
      ...prev,
      stats: prev.stats.filter((_, i) => i !== index),
    }))
    setIsSaved(false)
  }

  /* --- Save / Reset --- */

  async function handleSave() {
    setSaving(true)
    try {
      await updateHomeContent(content)
      setIsSaved(true)
      setTimeout(() => setIsSaved(false), 3000)
    } catch (err) {
      alert('保存失败: ' + (err instanceof Error ? err.message : '未知错误'))
    } finally {
      setSaving(false)
    }
  }

  function handleReset() {
    const confirmed = window.confirm('确定要重置所有内容为默认值吗？')
    if (confirmed) {
      setContent(structuredClone(DEFAULT_CONTENT))
      setIsSaved(false)
    }
  }

  /* --- Render helpers --- */

  function renderIconSelect(value: string, onChange: (v: string) => void) {
    const Icon = getIcon(value)
    return (
      <div className="flex items-center gap-2">
        <Icon className="w-5 h-5 text-navy shrink-0" />
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 rounded-lg border border-border px-3 py-2 text-sm focus:border-navy focus:ring-1 focus:ring-navy outline-none transition-colors"
        >
          {ICON_NAMES.map((name) => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <Loader2 className="w-8 h-8 text-navy animate-spin mb-4" />
        <p className="text-sm text-text-secondary">加载首页内容...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-24">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-text-primary">首页管理</h1>
            {isSaved && (
              <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                已保存
              </span>
            )}
          </div>
          <p className="text-sm text-text-secondary mt-1">
            管理首页的品牌价值观、全程三无忧和数据统计内容
          </p>
        </div>
      </div>

      {/* Section A: 品牌价值观 */}
      <div className="bg-white rounded-xl shadow-md border border-border p-6">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <Home className="w-5 h-5 text-navy" />
            <h2 className="text-lg font-bold text-navy">品牌价值观</h2>
          </div>
          <button
            onClick={addBrandValue}
            className="inline-flex items-center gap-1.5 rounded-lg border border-navy/30 px-3 py-1.5 text-xs font-medium text-navy hover:bg-navy/5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            添加
          </button>
        </div>

        <div className="space-y-6">
          {content.brandValues.map((bv, idx) => (
            <div
              key={idx}
              className="relative rounded-lg border border-border p-5 bg-bg-gray/30"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-navy">价值观 {idx + 1}</span>
                <button
                  onClick={() => removeBrandValue(idx)}
                  className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 transition-colors"
                  title="删除"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  删除
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1.5">
                    标签
                  </label>
                  <input
                    type="text"
                    value={bv.label}
                    onChange={(e) => updateBrandValue(idx, 'label', e.target.value)}
                    className="w-full rounded-lg border border-border px-4 py-2.5 text-sm focus:border-navy focus:ring-1 focus:ring-navy outline-none transition-colors"
                    placeholder="如：专业"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1.5">
                    图标
                  </label>
                  {renderIconSelect(bv.iconName, (v) => updateBrandValue(idx, 'iconName', v))}
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1.5">
                    描述
                  </label>
                  <input
                    type="text"
                    value={bv.description}
                    onChange={(e) => updateBrandValue(idx, 'description', e.target.value)}
                    className="w-full rounded-lg border border-border px-4 py-2.5 text-sm focus:border-navy focus:ring-1 focus:ring-navy outline-none transition-colors"
                    placeholder="如：以精湛技术立身"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section B: 全程三无忧 */}
      <div className="bg-white rounded-xl shadow-md border border-border p-6">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-navy" />
            <h2 className="text-lg font-bold text-navy">全程三无忧</h2>
          </div>
          <button
            onClick={addNoWorry}
            className="inline-flex items-center gap-1.5 rounded-lg border border-navy/30 px-3 py-1.5 text-xs font-medium text-navy hover:bg-navy/5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            添加
          </button>
        </div>

        <div className="space-y-6">
          {content.threeNoWorries.map((nw, idx) => (
            <div
              key={idx}
              className="relative rounded-lg border border-border p-5 bg-bg-gray/30"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-navy">无忧项 {idx + 1}</span>
                <button
                  onClick={() => removeNoWorry(idx)}
                  className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 transition-colors"
                  title="删除"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  删除
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1.5">
                    标题
                  </label>
                  <input
                    type="text"
                    value={nw.title}
                    onChange={(e) => updateNoWorry(idx, 'title', e.target.value)}
                    className="w-full rounded-lg border border-border px-4 py-2.5 text-sm focus:border-navy focus:ring-1 focus:ring-navy outline-none transition-colors"
                    placeholder="如：质量零事故"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1.5">
                    图标
                  </label>
                  {renderIconSelect(nw.iconName, (v) => updateNoWorry(idx, 'iconName', v))}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-text-primary mb-1.5">
                    描述
                  </label>
                  <textarea
                    rows={3}
                    value={nw.description}
                    onChange={(e) => updateNoWorry(idx, 'description', e.target.value)}
                    className="w-full rounded-lg border border-border px-4 py-2.5 text-sm focus:border-navy focus:ring-1 focus:ring-navy outline-none transition-colors resize-y"
                    placeholder="详细描述..."
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section C: 数据统计 */}
      <div className="bg-white rounded-xl shadow-md border border-border p-6">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-navy" />
            <h2 className="text-lg font-bold text-navy">数据统计</h2>
          </div>
          <button
            onClick={addStat}
            className="inline-flex items-center gap-1.5 rounded-lg border border-navy/30 px-3 py-1.5 text-xs font-medium text-navy hover:bg-navy/5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            添加
          </button>
        </div>

        <div className="space-y-6">
          {content.stats.map((stat, idx) => (
            <div
              key={idx}
              className="relative rounded-lg border border-border p-5 bg-bg-gray/30"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-navy">统计项 {idx + 1}</span>
                <button
                  onClick={() => removeStat(idx)}
                  className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 transition-colors"
                  title="删除"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  删除
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1.5">
                    数值
                  </label>
                  <input
                    type="text"
                    value={stat.value}
                    onChange={(e) => updateStat(idx, 'value', e.target.value)}
                    className="w-full rounded-lg border border-border px-4 py-2.5 text-sm focus:border-navy focus:ring-1 focus:ring-navy outline-none transition-colors"
                    placeholder="如：50+"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1.5">
                    标签
                  </label>
                  <input
                    type="text"
                    value={stat.label}
                    onChange={(e) => updateStat(idx, 'label', e.target.value)}
                    className="w-full rounded-lg border border-border px-4 py-2.5 text-sm focus:border-navy focus:ring-1 focus:ring-navy outline-none transition-colors"
                    placeholder="如：项目经验"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1.5">
                    图标
                  </label>
                  {renderIconSelect(stat.iconName, (v) => updateStat(idx, 'iconName', v))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sticky Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-border shadow-lg">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-end gap-3">
          <button
            onClick={handleReset}
            disabled={saving}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-text-secondary hover:bg-bg-gray transition-colors disabled:opacity-50"
          >
            <RotateCcw className="w-4 h-4" />
            重置
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-1.5 rounded-lg bg-gold px-6 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-gold-dark transition-colors disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saving ? '保存中...' : '保存设置'}
          </button>
        </div>
      </div>
    </div>
  )
}
