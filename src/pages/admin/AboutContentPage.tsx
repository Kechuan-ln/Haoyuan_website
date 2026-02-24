import { useState, useEffect } from 'react'
import {
  Save,
  RotateCcw,
  Plus,
  Trash2,
  Loader2,
  Target,
  Award,
  Calendar,
} from 'lucide-react'
import { ICON_MAP, getIcon } from '@/config/icon-map'
import { getAboutContent, updateAboutContent } from '@/services/about-content.service'
import type { AboutContent, CoreValue, ThreePromise, Milestone } from '@/types/about'

/* ---------- Default Content ---------- */

const DEFAULT_CONTENT: Omit<AboutContent, 'updatedAt'> = {
  coreValues: [
    { title: '专精创新', iconName: 'Target', colorTheme: 'navy', description: '以专业技术为基础，持续创新服务模式，紧跟行业前沿发展，为客户提供最优解决方案。' },
    { title: '品质为诺', iconName: 'Award', colorTheme: 'gold', description: '坚守质量标准，以品质赢得信赖。每一个项目都以最高标准严格把控，绝不降低品质要求。' },
    { title: '诚协共进', iconName: 'Handshake', colorTheme: 'teal', description: '秉承诚信原则，协同合作共同发展。与客户、合作伙伴建立长期互信的合作关系。' },
    { title: '责任担当', iconName: 'Shield', colorTheme: 'navy', description: '对项目负责，对客户负责，对社会负责。将社会责任融入企业发展的每一个环节。' },
  ],
  threePromises: [
    {
      title: '文明工地典范', iconName: 'CheckCircle',
      description: '严格施工管理，打造文明安全施工环境，做到施工现场整洁有序、安全防护到位。',
      highlights: ['标准化施工流程', '安全文明管理', '环境保护措施'],
    },
    {
      title: '结构品质标杆', iconName: 'Award',
      description: '精益求精，确保工程结构质量达到行业标杆，每一道工序都经过严格检验验收。',
      highlights: ['工序质量验收', '材料严格把关', '结构安全检测'],
    },
    {
      title: '绿色建筑先锋', iconName: 'Leaf',
      description: '践行绿色理念，推动可持续建设发展，积极采用环保材料和节能技术。',
      highlights: ['环保材料应用', '节能技术推广', '绿色施工标准'],
    },
  ],
  milestones: [
    { year: '2021', event: '公司在深圳市光明区注册成立' },
    { year: '2022', event: '取得工程监理乙级资质，业务初具规模' },
    { year: '2023', event: '通过ISO三体系认证，服务能力全面提升' },
    { year: '2024', event: '获得AAA级信用等级，项目业绩突破50+' },
  ],
}

const ICON_NAMES = Object.keys(ICON_MAP)
const COLOR_THEMES: CoreValue['colorTheme'][] = ['navy', 'teal', 'gold']

/* ---------- Component ---------- */

export default function AboutContentPage() {
  const [content, setContent] = useState<Omit<AboutContent, 'updatedAt'>>(() =>
    structuredClone(DEFAULT_CONTENT),
  )
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isSaved, setIsSaved] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const data = await getAboutContent()
        if (data) {
          setContent({
            coreValues: data.coreValues?.length ? data.coreValues : DEFAULT_CONTENT.coreValues,
            threePromises: data.threePromises?.length ? data.threePromises : DEFAULT_CONTENT.threePromises,
            milestones: data.milestones?.length ? data.milestones : DEFAULT_CONTENT.milestones,
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

  /* --- Core Value helpers --- */

  function updateCoreValue<K extends keyof CoreValue>(
    index: number,
    field: K,
    value: CoreValue[K],
  ) {
    setContent((prev) => {
      const coreValues = [...prev.coreValues]
      coreValues[index] = { ...coreValues[index], [field]: value }
      return { ...prev, coreValues }
    })
    setIsSaved(false)
  }

  function addCoreValue() {
    setContent((prev) => ({
      ...prev,
      coreValues: [...prev.coreValues, { title: '', iconName: 'Target', colorTheme: 'navy', description: '' }],
    }))
    setIsSaved(false)
  }

  function removeCoreValue(index: number) {
    setContent((prev) => ({
      ...prev,
      coreValues: prev.coreValues.filter((_, i) => i !== index),
    }))
    setIsSaved(false)
  }

  /* --- Three Promise helpers --- */

  function updatePromise<K extends keyof ThreePromise>(
    index: number,
    field: K,
    value: ThreePromise[K],
  ) {
    setContent((prev) => {
      const threePromises = [...prev.threePromises]
      threePromises[index] = { ...threePromises[index], [field]: value }
      return { ...prev, threePromises }
    })
    setIsSaved(false)
  }

  function updatePromiseHighlight(promiseIdx: number, hlIdx: number, value: string) {
    setContent((prev) => {
      const threePromises = [...prev.threePromises]
      const highlights = [...threePromises[promiseIdx].highlights]
      highlights[hlIdx] = value
      threePromises[promiseIdx] = { ...threePromises[promiseIdx], highlights }
      return { ...prev, threePromises }
    })
    setIsSaved(false)
  }

  function addPromiseHighlight(promiseIdx: number) {
    setContent((prev) => {
      const threePromises = [...prev.threePromises]
      threePromises[promiseIdx] = {
        ...threePromises[promiseIdx],
        highlights: [...threePromises[promiseIdx].highlights, ''],
      }
      return { ...prev, threePromises }
    })
    setIsSaved(false)
  }

  function removePromiseHighlight(promiseIdx: number, hlIdx: number) {
    setContent((prev) => {
      const threePromises = [...prev.threePromises]
      threePromises[promiseIdx] = {
        ...threePromises[promiseIdx],
        highlights: threePromises[promiseIdx].highlights.filter((_, i) => i !== hlIdx),
      }
      return { ...prev, threePromises }
    })
    setIsSaved(false)
  }

  function addPromise() {
    setContent((prev) => ({
      ...prev,
      threePromises: [...prev.threePromises, { title: '', iconName: 'CheckCircle', description: '', highlights: [] }],
    }))
    setIsSaved(false)
  }

  function removePromise(index: number) {
    setContent((prev) => ({
      ...prev,
      threePromises: prev.threePromises.filter((_, i) => i !== index),
    }))
    setIsSaved(false)
  }

  /* --- Milestone helpers --- */

  function updateMilestone<K extends keyof Milestone>(
    index: number,
    field: K,
    value: Milestone[K],
  ) {
    setContent((prev) => {
      const milestones = [...prev.milestones]
      milestones[index] = { ...milestones[index], [field]: value }
      return { ...prev, milestones }
    })
    setIsSaved(false)
  }

  function addMilestone() {
    setContent((prev) => ({
      ...prev,
      milestones: [...prev.milestones, { year: '', event: '' }],
    }))
    setIsSaved(false)
  }

  function removeMilestone(index: number) {
    setContent((prev) => ({
      ...prev,
      milestones: prev.milestones.filter((_, i) => i !== index),
    }))
    setIsSaved(false)
  }

  /* --- Save / Reset --- */

  async function handleSave() {
    setSaving(true)
    try {
      await updateAboutContent(content)
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
        <p className="text-sm text-text-secondary">加载关于页内容...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-24">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-text-primary">关于管理</h1>
            {isSaved && (
              <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                已保存
              </span>
            )}
          </div>
          <p className="text-sm text-text-secondary mt-1">
            管理关于页面的核心价值观、创优三承诺和发展历程内容
          </p>
        </div>
      </div>

      {/* Section A: 核心价值观 */}
      <div className="bg-white rounded-xl shadow-md border border-border p-6">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-navy" />
            <h2 className="text-lg font-bold text-navy">核心价值观</h2>
          </div>
          <button
            onClick={addCoreValue}
            className="inline-flex items-center gap-1.5 rounded-lg border border-navy/30 px-3 py-1.5 text-xs font-medium text-navy hover:bg-navy/5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            添加
          </button>
        </div>

        <div className="space-y-6">
          {content.coreValues.map((value, vIdx) => (
            <div
              key={vIdx}
              className="relative rounded-lg border border-border p-5 bg-bg-gray/30"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-navy">价值观 {vIdx + 1}</span>
                <button
                  onClick={() => removeCoreValue(vIdx)}
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
                    value={value.title}
                    onChange={(e) => updateCoreValue(vIdx, 'title', e.target.value)}
                    className="w-full rounded-lg border border-border px-4 py-2.5 text-sm focus:border-navy focus:ring-1 focus:ring-navy outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1.5">
                    图标
                  </label>
                  {renderIconSelect(value.iconName, (v) => updateCoreValue(vIdx, 'iconName', v))}
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1.5">
                    颜色主题
                  </label>
                  <select
                    value={value.colorTheme}
                    onChange={(e) => updateCoreValue(vIdx, 'colorTheme', e.target.value as CoreValue['colorTheme'])}
                    className="w-full rounded-lg border border-border px-4 py-2.5 text-sm focus:border-navy focus:ring-1 focus:ring-navy outline-none transition-colors"
                  >
                    {COLOR_THEMES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1.5">
                    描述
                  </label>
                  <textarea
                    rows={2}
                    value={value.description}
                    onChange={(e) => updateCoreValue(vIdx, 'description', e.target.value)}
                    className="w-full rounded-lg border border-border px-4 py-2.5 text-sm focus:border-navy focus:ring-1 focus:ring-navy outline-none transition-colors resize-y"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section B: 创优三承诺 */}
      <div className="bg-white rounded-xl shadow-md border border-border p-6">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-navy" />
            <h2 className="text-lg font-bold text-navy">创优三承诺</h2>
          </div>
          <button
            onClick={addPromise}
            className="inline-flex items-center gap-1.5 rounded-lg border border-navy/30 px-3 py-1.5 text-xs font-medium text-navy hover:bg-navy/5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            添加承诺
          </button>
        </div>

        <div className="space-y-6">
          {content.threePromises.map((promise, pIdx) => (
            <div
              key={pIdx}
              className="relative rounded-lg border border-border p-5 bg-bg-gray/30"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-navy">承诺 {pIdx + 1}</span>
                <button
                  onClick={() => removePromise(pIdx)}
                  className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 transition-colors"
                  title="删除"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  删除
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1.5">
                    标题
                  </label>
                  <input
                    type="text"
                    value={promise.title}
                    onChange={(e) => updatePromise(pIdx, 'title', e.target.value)}
                    className="w-full rounded-lg border border-border px-4 py-2.5 text-sm focus:border-navy focus:ring-1 focus:ring-navy outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1.5">
                    图标
                  </label>
                  {renderIconSelect(promise.iconName, (v) => updatePromise(pIdx, 'iconName', v))}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-text-primary mb-1.5">
                    描述
                  </label>
                  <textarea
                    rows={2}
                    value={promise.description}
                    onChange={(e) => updatePromise(pIdx, 'description', e.target.value)}
                    className="w-full rounded-lg border border-border px-4 py-2.5 text-sm focus:border-navy focus:ring-1 focus:ring-navy outline-none transition-colors resize-y"
                  />
                </div>
              </div>

              {/* Highlights */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  亮点
                </label>
                <div className="space-y-2">
                  {promise.highlights.map((hl, hIdx) => (
                    <div key={hIdx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={hl}
                        onChange={(e) => updatePromiseHighlight(pIdx, hIdx, e.target.value)}
                        className="flex-1 rounded-lg border border-border px-4 py-2 text-sm focus:border-navy focus:ring-1 focus:ring-navy outline-none transition-colors"
                        placeholder={`亮点 ${hIdx + 1}`}
                      />
                      <button
                        onClick={() => removePromiseHighlight(pIdx, hIdx)}
                        className="p-1.5 rounded-md text-red-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                        title="删除亮点"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => addPromiseHighlight(pIdx)}
                  className="mt-2 inline-flex items-center gap-1 text-xs text-navy hover:text-navy-dark transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  添加亮点
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section C: 发展历程 */}
      <div className="bg-white rounded-xl shadow-md border border-border p-6">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-navy" />
            <h2 className="text-lg font-bold text-navy">发展历程</h2>
          </div>
          <button
            onClick={addMilestone}
            className="inline-flex items-center gap-1.5 rounded-lg border border-navy/30 px-3 py-1.5 text-xs font-medium text-navy hover:bg-navy/5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            添加里程碑
          </button>
        </div>

        <div className="space-y-3">
          {content.milestones.map((milestone, mIdx) => (
            <div
              key={mIdx}
              className="flex items-center gap-3 rounded-lg border border-border p-3 bg-bg-gray/30"
            >
              <div className="w-24 shrink-0">
                <input
                  type="text"
                  value={milestone.year}
                  onChange={(e) => updateMilestone(mIdx, 'year', e.target.value)}
                  placeholder="年份"
                  className="w-full rounded-lg border border-border px-4 py-2 text-sm text-center font-medium focus:border-navy focus:ring-1 focus:ring-navy outline-none transition-colors"
                />
              </div>
              <input
                type="text"
                value={milestone.event}
                onChange={(e) => updateMilestone(mIdx, 'event', e.target.value)}
                placeholder="里程碑事件"
                className="flex-1 rounded-lg border border-border px-4 py-2 text-sm focus:border-navy focus:ring-1 focus:ring-navy outline-none transition-colors"
              />
              <button
                onClick={() => removeMilestone(mIdx)}
                className="p-1.5 rounded-md text-red-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                title="删除里程碑"
              >
                <Trash2 className="w-4 h-4" />
              </button>
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
