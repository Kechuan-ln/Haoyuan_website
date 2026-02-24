import { useState, useEffect } from 'react'
import {
  Save,
  RotateCcw,
  Plus,
  Trash2,
  Loader2,
  Users,
  Target,
  BarChart3,
  Columns3,
} from 'lucide-react'
import { ICON_MAP, getIcon } from '@/config/icon-map'
import { getTeamContent, updateTeamContent } from '@/services/team-content.service'
import type { TeamContent, TeamPillar, TeamDepartment, RaciRow, TeamStrength } from '@/types/team'

/* ---------- Default Content ---------- */

const DEFAULT_CONTENT: Omit<TeamContent, 'updatedAt'> = {
  pillars: [
    {
      title: '战略决策组',
      iconName: 'Target',
      colorTheme: 'navy',
      description: '公司战略规划与重大决策',
      subItems: ['企业发展战略规划', '重大项目决策审批', '资源统筹调配', '风险管控决策'],
    },
    {
      title: '职能管理中心',
      iconName: 'Settings',
      colorTheme: 'teal',
      description: '人力资源、财务、行政、市场等职能管理',
      subItems: ['人力资源管理', '财务核算与资金管理', '行政综合管理', '市场开拓与品牌建设'],
    },
    {
      title: '项目执行矩阵',
      iconName: 'GitBranch',
      colorTheme: 'gold',
      description: '项目团队矩阵式管理，灵活配置资源',
      subItems: ['项目经理负责制', '专业技术团队组建', '跨部门资源协调', '项目绩效考核评估'],
    },
  ],
  departments: [
    { iconName: 'DollarSign', name: '造价咨询部' },
    { iconName: 'FileText', name: '招标代理部' },
    { iconName: 'Shield', name: '工程监理部' },
    { iconName: 'Briefcase', name: '项目管理部' },
    { iconName: 'BarChart3', name: '技术咨询部' },
    { iconName: 'Building2', name: '综合管理部' },
  ],
  raciMatrix: [
    { task: '项目立项审批', strategy: 'A', function: 'C', project: 'R' },
    { task: '技术方案编制', strategy: 'I', function: 'C', project: 'R' },
    { task: '质量安全管控', strategy: 'I', function: 'A', project: 'R' },
    { task: '进度协调管理', strategy: 'I', function: 'C', project: 'R' },
    { task: '成本预算控制', strategy: 'A', function: 'R', project: 'C' },
    { task: '人员调配安排', strategy: 'I', function: 'R', project: 'C' },
  ],
  strengths: [
    {
      iconName: 'Users',
      title: '专业团队',
      description: '拥有一支由注册监理工程师、造价工程师、一级建造师等组成的专业技术团队',
    },
    {
      iconName: 'Award',
      title: '经验丰富',
      description: '团队成员平均拥有10年以上工程建设行业从业经验',
    },
    {
      iconName: 'Heart',
      title: '团队协作',
      description: '矩阵式管理模式确保各专业协同配合，高效交付',
    },
  ],
}

const ICON_NAMES = Object.keys(ICON_MAP)
const COLOR_THEMES: TeamPillar['colorTheme'][] = ['navy', 'teal', 'gold']
const RACI_VALUES = ['R', 'A', 'C', 'I']

/* ---------- Component ---------- */

export default function TeamContentPage() {
  const [content, setContent] = useState<Omit<TeamContent, 'updatedAt'>>(() =>
    structuredClone(DEFAULT_CONTENT),
  )
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isSaved, setIsSaved] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const data = await getTeamContent()
        if (data) {
          setContent({
            pillars: data.pillars?.length ? data.pillars : DEFAULT_CONTENT.pillars,
            departments: data.departments?.length ? data.departments : DEFAULT_CONTENT.departments,
            raciMatrix: data.raciMatrix?.length ? data.raciMatrix : DEFAULT_CONTENT.raciMatrix,
            strengths: data.strengths?.length ? data.strengths : DEFAULT_CONTENT.strengths,
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

  /* --- Pillar helpers --- */

  function updatePillar<K extends keyof TeamPillar>(
    index: number,
    field: K,
    value: TeamPillar[K],
  ) {
    setContent((prev) => {
      const pillars = [...prev.pillars]
      pillars[index] = { ...pillars[index], [field]: value }
      return { ...prev, pillars }
    })
    setIsSaved(false)
  }

  function updatePillarSubItem(pillarIdx: number, itemIdx: number, value: string) {
    setContent((prev) => {
      const pillars = [...prev.pillars]
      const subItems = [...pillars[pillarIdx].subItems]
      subItems[itemIdx] = value
      pillars[pillarIdx] = { ...pillars[pillarIdx], subItems }
      return { ...prev, pillars }
    })
    setIsSaved(false)
  }

  function addPillarSubItem(pillarIdx: number) {
    setContent((prev) => {
      const pillars = [...prev.pillars]
      pillars[pillarIdx] = {
        ...pillars[pillarIdx],
        subItems: [...pillars[pillarIdx].subItems, ''],
      }
      return { ...prev, pillars }
    })
    setIsSaved(false)
  }

  function removePillarSubItem(pillarIdx: number, itemIdx: number) {
    setContent((prev) => {
      const pillars = [...prev.pillars]
      pillars[pillarIdx] = {
        ...pillars[pillarIdx],
        subItems: pillars[pillarIdx].subItems.filter((_, i) => i !== itemIdx),
      }
      return { ...prev, pillars }
    })
    setIsSaved(false)
  }

  /* --- Department helpers --- */

  function updateDepartment<K extends keyof TeamDepartment>(
    index: number,
    field: K,
    value: TeamDepartment[K],
  ) {
    setContent((prev) => {
      const departments = [...prev.departments]
      departments[index] = { ...departments[index], [field]: value }
      return { ...prev, departments }
    })
    setIsSaved(false)
  }

  function addDepartment() {
    setContent((prev) => ({
      ...prev,
      departments: [...prev.departments, { iconName: 'Building2', name: '' }],
    }))
    setIsSaved(false)
  }

  function removeDepartment(index: number) {
    setContent((prev) => ({
      ...prev,
      departments: prev.departments.filter((_, i) => i !== index),
    }))
    setIsSaved(false)
  }

  /* --- RACI helpers --- */

  function updateRaciRow<K extends keyof RaciRow>(
    index: number,
    field: K,
    value: RaciRow[K],
  ) {
    setContent((prev) => {
      const raciMatrix = [...prev.raciMatrix]
      raciMatrix[index] = { ...raciMatrix[index], [field]: value }
      return { ...prev, raciMatrix }
    })
    setIsSaved(false)
  }

  function addRaciRow() {
    setContent((prev) => ({
      ...prev,
      raciMatrix: [...prev.raciMatrix, { task: '', strategy: 'I', function: 'C', project: 'R' }],
    }))
    setIsSaved(false)
  }

  function removeRaciRow(index: number) {
    setContent((prev) => ({
      ...prev,
      raciMatrix: prev.raciMatrix.filter((_, i) => i !== index),
    }))
    setIsSaved(false)
  }

  /* --- Strength helpers --- */

  function updateStrength<K extends keyof TeamStrength>(
    index: number,
    field: K,
    value: TeamStrength[K],
  ) {
    setContent((prev) => {
      const strengths = [...prev.strengths]
      strengths[index] = { ...strengths[index], [field]: value }
      return { ...prev, strengths }
    })
    setIsSaved(false)
  }

  function addStrength() {
    setContent((prev) => ({
      ...prev,
      strengths: [...prev.strengths, { iconName: 'Users', title: '', description: '' }],
    }))
    setIsSaved(false)
  }

  function removeStrength(index: number) {
    setContent((prev) => ({
      ...prev,
      strengths: prev.strengths.filter((_, i) => i !== index),
    }))
    setIsSaved(false)
  }

  /* --- Save / Reset --- */

  async function handleSave() {
    setSaving(true)
    try {
      await updateTeamContent(content)
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
        <p className="text-sm text-text-secondary">加载团队内容...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-24">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-text-primary">团队管理</h1>
            {isSaved && (
              <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                已保存
              </span>
            )}
          </div>
          <p className="text-sm text-text-secondary mt-1">
            管理团队页面的组织架构、部门、RACI 矩阵和团队文化内容
          </p>
        </div>
      </div>

      {/* Section A: 三支柱管理体系 */}
      <div className="bg-white rounded-xl shadow-md border border-border p-6">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
          <Target className="w-5 h-5 text-navy" />
          <h2 className="text-lg font-bold text-navy">三支柱管理体系</h2>
        </div>

        <div className="space-y-6">
          {content.pillars.map((pillar, pIdx) => (
            <div
              key={pIdx}
              className="relative rounded-lg border border-border p-5 bg-bg-gray/30"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-navy">支柱 {pIdx + 1}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1.5">
                    标题
                  </label>
                  <input
                    type="text"
                    value={pillar.title}
                    onChange={(e) => updatePillar(pIdx, 'title', e.target.value)}
                    className="w-full rounded-lg border border-border px-4 py-2.5 text-sm focus:border-navy focus:ring-1 focus:ring-navy outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1.5">
                    图标
                  </label>
                  {renderIconSelect(pillar.iconName, (v) => updatePillar(pIdx, 'iconName', v))}
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1.5">
                    颜色主题
                  </label>
                  <select
                    value={pillar.colorTheme}
                    onChange={(e) => updatePillar(pIdx, 'colorTheme', e.target.value as TeamPillar['colorTheme'])}
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
                  <input
                    type="text"
                    value={pillar.description}
                    onChange={(e) => updatePillar(pIdx, 'description', e.target.value)}
                    className="w-full rounded-lg border border-border px-4 py-2.5 text-sm focus:border-navy focus:ring-1 focus:ring-navy outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Sub Items */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  子项目
                </label>
                <div className="space-y-2">
                  {pillar.subItems.map((item, sIdx) => (
                    <div key={sIdx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => updatePillarSubItem(pIdx, sIdx, e.target.value)}
                        className="flex-1 rounded-lg border border-border px-4 py-2 text-sm focus:border-navy focus:ring-1 focus:ring-navy outline-none transition-colors"
                        placeholder={`子项目 ${sIdx + 1}`}
                      />
                      <button
                        onClick={() => removePillarSubItem(pIdx, sIdx)}
                        className="p-1.5 rounded-md text-red-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                        title="删除子项目"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => addPillarSubItem(pIdx)}
                  className="mt-2 inline-flex items-center gap-1 text-xs text-navy hover:text-navy-dark transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  添加子项目
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section B: 职能部门 */}
      <div className="bg-white rounded-xl shadow-md border border-border p-6">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-navy" />
            <h2 className="text-lg font-bold text-navy">职能部门</h2>
          </div>
          <button
            onClick={addDepartment}
            className="inline-flex items-center gap-1.5 rounded-lg border border-navy/30 px-3 py-1.5 text-xs font-medium text-navy hover:bg-navy/5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            添加部门
          </button>
        </div>

        <div className="space-y-3">
          {content.departments.map((dept, dIdx) => (
            <div
              key={dIdx}
              className="flex items-center gap-3 rounded-lg border border-border p-3 bg-bg-gray/30"
            >
              <div className="w-40 shrink-0">
                {renderIconSelect(dept.iconName, (v) => updateDepartment(dIdx, 'iconName', v))}
              </div>
              <input
                type="text"
                value={dept.name}
                onChange={(e) => updateDepartment(dIdx, 'name', e.target.value)}
                placeholder="部门名称"
                className="flex-1 rounded-lg border border-border px-4 py-2 text-sm focus:border-navy focus:ring-1 focus:ring-navy outline-none transition-colors"
              />
              <button
                onClick={() => removeDepartment(dIdx)}
                className="p-1.5 rounded-md text-red-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                title="删除部门"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Section C: RACI 矩阵 */}
      <div className="bg-white rounded-xl shadow-md border border-border p-6">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <Columns3 className="w-5 h-5 text-navy" />
            <h2 className="text-lg font-bold text-navy">RACI 责任矩阵</h2>
          </div>
          <button
            onClick={addRaciRow}
            className="inline-flex items-center gap-1.5 rounded-lg border border-navy/30 px-3 py-1.5 text-xs font-medium text-navy hover:bg-navy/5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            添加行
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-navy/5">
                <th className="px-4 py-3 text-left font-semibold text-navy">工作任务</th>
                <th className="px-4 py-3 text-center font-semibold text-navy">战略决策组</th>
                <th className="px-4 py-3 text-center font-semibold text-navy">职能管理中心</th>
                <th className="px-4 py-3 text-center font-semibold text-navy">项目执行矩阵</th>
                <th className="px-4 py-3 text-center font-semibold text-navy w-16">操作</th>
              </tr>
            </thead>
            <tbody>
              {content.raciMatrix.map((row, rIdx) => (
                <tr key={rIdx} className="border-t border-border">
                  <td className="px-4 py-2">
                    <input
                      type="text"
                      value={row.task}
                      onChange={(e) => updateRaciRow(rIdx, 'task', e.target.value)}
                      placeholder="任务名称"
                      className="w-full rounded border border-border px-3 py-1.5 text-sm focus:border-navy focus:ring-1 focus:ring-navy outline-none transition-colors"
                    />
                  </td>
                  <td className="px-4 py-2 text-center">
                    <select
                      value={row.strategy}
                      onChange={(e) => updateRaciRow(rIdx, 'strategy', e.target.value)}
                      className="rounded border border-border px-2 py-1.5 text-sm text-center focus:border-navy focus:ring-1 focus:ring-navy outline-none"
                    >
                      {RACI_VALUES.map((v) => (
                        <option key={v} value={v}>{v}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-2 text-center">
                    <select
                      value={row.function}
                      onChange={(e) => updateRaciRow(rIdx, 'function', e.target.value)}
                      className="rounded border border-border px-2 py-1.5 text-sm text-center focus:border-navy focus:ring-1 focus:ring-navy outline-none"
                    >
                      {RACI_VALUES.map((v) => (
                        <option key={v} value={v}>{v}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-2 text-center">
                    <select
                      value={row.project}
                      onChange={(e) => updateRaciRow(rIdx, 'project', e.target.value)}
                      className="rounded border border-border px-2 py-1.5 text-sm text-center focus:border-navy focus:ring-1 focus:ring-navy outline-none"
                    >
                      {RACI_VALUES.map((v) => (
                        <option key={v} value={v}>{v}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-2 text-center">
                    <button
                      onClick={() => removeRaciRow(rIdx)}
                      className="p-1.5 rounded-md text-red-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                      title="删除行"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-text-muted mt-3">
          R = 执行 (Responsible)，A = 负责 (Accountable)，C = 咨询 (Consulted)，I = 知会 (Informed)
        </p>
      </div>

      {/* Section D: 团队文化 */}
      <div className="bg-white rounded-xl shadow-md border border-border p-6">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-navy" />
            <h2 className="text-lg font-bold text-navy">团队文化</h2>
          </div>
          <button
            onClick={addStrength}
            className="inline-flex items-center gap-1.5 rounded-lg border border-navy/30 px-3 py-1.5 text-xs font-medium text-navy hover:bg-navy/5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            添加
          </button>
        </div>

        <div className="space-y-4">
          {content.strengths.map((strength, sIdx) => (
            <div
              key={sIdx}
              className="relative rounded-lg border border-border p-5 bg-bg-gray/30"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-navy">团队优势 {sIdx + 1}</span>
                <button
                  onClick={() => removeStrength(sIdx)}
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
                    图标
                  </label>
                  {renderIconSelect(strength.iconName, (v) => updateStrength(sIdx, 'iconName', v))}
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1.5">
                    标题
                  </label>
                  <input
                    type="text"
                    value={strength.title}
                    onChange={(e) => updateStrength(sIdx, 'title', e.target.value)}
                    className="w-full rounded-lg border border-border px-4 py-2.5 text-sm focus:border-navy focus:ring-1 focus:ring-navy outline-none transition-colors"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-text-primary mb-1.5">
                    描述
                  </label>
                  <textarea
                    rows={2}
                    value={strength.description}
                    onChange={(e) => updateStrength(sIdx, 'description', e.target.value)}
                    className="w-full rounded-lg border border-border px-4 py-2.5 text-sm focus:border-navy focus:ring-1 focus:ring-navy outline-none transition-colors resize-y"
                  />
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
