import { useState, useEffect } from 'react'
import {
  Save,
  RotateCcw,
  Plus,
  Trash2,
  Image,
  Globe,
  Building2,
  Phone,
  Mail,
  MapPin,
  Loader2,
} from 'lucide-react'
import type { HeroSlide } from '@/types/contact'
import { COMPANY } from '@/config/constants'
import { getSiteSettings, updateSiteSettings } from '@/services/site-settings.service'

/* ---------- Types ---------- */

interface SiteSettingsForm {
  companyName: string
  companyPhone: string
  companyEmail: string
  companyAddress: string
  companyDescription: string
  heroSlides: HeroSlide[]
  siteTitle: string
  siteDescription: string
  siteKeywords: string
}

/* ---------- Default Values ---------- */

const DEFAULT_SETTINGS: SiteSettingsForm = {
  companyName: COMPANY.name,
  companyPhone: COMPANY.phone,
  companyEmail: COMPANY.email,
  companyAddress: COMPANY.address,
  companyDescription:
    '广东全程创优建设技术有限公司是一家专注于工程造价咨询、招标代理、工程监理和项目管理的综合性工程咨询服务企业。公司秉承"全程创优 共创未来"的理念，致力于为客户提供专业、高效、优质的工程建设全过程咨询服务。',
  heroSlides: [
    {
      imageUrl: '',
      title: '全程跟踪 · 创造优质',
      subtitle: '专业工程咨询与管理服务',
      linkUrl: '',
    },
    {
      imageUrl: '',
      title: '二十年深耕',
      subtitle: '值得信赖的工程建设伙伴',
      linkUrl: '',
    },
  ],
  siteTitle: COMPANY.name,
  siteDescription: '专业工程造价、招标代理、工程监理、项目管理服务',
  siteKeywords: '工程造价,招标代理,工程监理,项目管理,深圳',
}

/* ---------- Component ---------- */

export default function SiteSettingsPage() {
  const [settings, setSettings] = useState<SiteSettingsForm>(() =>
    structuredClone(DEFAULT_SETTINGS),
  )
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isSaved, setIsSaved] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const data = await getSiteSettings()
        if (data) {
          setSettings({
            companyName: data.companyName || COMPANY.name,
            companyPhone: data.companyPhone || COMPANY.phone,
            companyEmail: data.companyEmail || COMPANY.email,
            companyAddress: data.companyAddress || COMPANY.address,
            companyDescription: data.companyDescription || DEFAULT_SETTINGS.companyDescription,
            heroSlides: data.heroSlides?.length ? data.heroSlides : DEFAULT_SETTINGS.heroSlides,
            siteTitle: data.siteTitle || COMPANY.name,
            siteDescription: data.siteDescription || DEFAULT_SETTINGS.siteDescription,
            siteKeywords: data.siteKeywords || DEFAULT_SETTINGS.siteKeywords,
          })
        }
      } catch {
        // Keep default values from COMPANY constant
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  function updateField<K extends keyof SiteSettingsForm>(
    field: K,
    value: SiteSettingsForm[K],
  ) {
    setSettings((prev) => ({ ...prev, [field]: value }))
    setIsSaved(false)
  }

  function updateSlide(index: number, field: keyof HeroSlide, value: string) {
    setSettings((prev) => {
      const slides = [...prev.heroSlides]
      slides[index] = { ...slides[index], [field]: value }
      return { ...prev, heroSlides: slides }
    })
    setIsSaved(false)
  }

  function addSlide() {
    setSettings((prev) => ({
      ...prev,
      heroSlides: [
        ...prev.heroSlides,
        { imageUrl: '', title: '', subtitle: '', linkUrl: '' },
      ],
    }))
    setIsSaved(false)
  }

  function removeSlide(index: number) {
    if (settings.heroSlides.length <= 1) {
      alert('至少保留一张轮播图')
      return
    }
    setSettings((prev) => ({
      ...prev,
      heroSlides: prev.heroSlides.filter((_, i) => i !== index),
    }))
    setIsSaved(false)
  }

  async function handleSave() {
    setSaving(true)
    try {
      await updateSiteSettings({
        companyName: settings.companyName,
        companyPhone: settings.companyPhone,
        companyEmail: settings.companyEmail,
        companyAddress: settings.companyAddress,
        companyDescription: settings.companyDescription,
        heroSlides: settings.heroSlides,
        siteTitle: settings.siteTitle,
        siteDescription: settings.siteDescription,
        siteKeywords: settings.siteKeywords,
      })
      setIsSaved(true)
      setTimeout(() => setIsSaved(false), 3000)
    } catch (err) {
      alert('保存失败: ' + (err instanceof Error ? err.message : '未知错误'))
    } finally {
      setSaving(false)
    }
  }

  function handleReset() {
    const confirmed = window.confirm('确定要重置所有设置为默认值吗？')
    if (confirmed) {
      setSettings(structuredClone(DEFAULT_SETTINGS))
      setIsSaved(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <Loader2 className="w-8 h-8 text-navy animate-spin mb-4" />
        <p className="text-sm text-text-secondary">加载站点设置...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-24">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-text-primary">站点设置</h1>
            {isSaved && (
              <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                已保存
              </span>
            )}
          </div>
          <p className="text-sm text-text-secondary mt-1">
            管理网站基本信息、轮播图和 SEO 配置
          </p>
        </div>
      </div>

      {/* Section A: 基本信息 */}
      <div className="bg-white rounded-xl shadow-md border border-border p-6">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
          <Building2 className="w-5 h-5 text-navy" />
          <h2 className="text-lg font-bold text-navy">基本信息</h2>
        </div>

        <div className="space-y-5">
          {/* Company Name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">
                公司名称
              </label>
              <input
                type="text"
                value={settings.companyName}
                onChange={(e) => updateField('companyName', e.target.value)}
                className="w-full rounded-lg border border-border px-4 py-2.5 text-sm focus:border-navy focus:ring-1 focus:ring-navy outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">
                <span className="inline-flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-text-muted" />
                  公司电话
                </span>
              </label>
              <input
                type="text"
                value={settings.companyPhone}
                onChange={(e) => updateField('companyPhone', e.target.value)}
                className="w-full rounded-lg border border-border px-4 py-2.5 text-sm focus:border-navy focus:ring-1 focus:ring-navy outline-none transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">
                <span className="inline-flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-text-muted" />
                  公司邮箱
                </span>
              </label>
              <input
                type="email"
                value={settings.companyEmail}
                onChange={(e) => updateField('companyEmail', e.target.value)}
                className="w-full rounded-lg border border-border px-4 py-2.5 text-sm focus:border-navy focus:ring-1 focus:ring-navy outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">
                <span className="inline-flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-text-muted" />
                  公司地址
                </span>
              </label>
              <input
                type="text"
                value={settings.companyAddress}
                onChange={(e) => updateField('companyAddress', e.target.value)}
                className="w-full rounded-lg border border-border px-4 py-2.5 text-sm focus:border-navy focus:ring-1 focus:ring-navy outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">
              公司简介
            </label>
            <textarea
              rows={4}
              value={settings.companyDescription}
              onChange={(e) => updateField('companyDescription', e.target.value)}
              className="w-full rounded-lg border border-border px-4 py-2.5 text-sm focus:border-navy focus:ring-1 focus:ring-navy outline-none transition-colors resize-y"
            />
          </div>
        </div>
      </div>

      {/* Section B: 首页轮播图管理 */}
      <div className="bg-white rounded-xl shadow-md border border-border p-6">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <Image className="w-5 h-5 text-navy" />
            <h2 className="text-lg font-bold text-navy">首页轮播图管理</h2>
          </div>
          <button
            onClick={addSlide}
            className="inline-flex items-center gap-1.5 rounded-lg border border-navy/30 px-3 py-1.5 text-xs font-medium text-navy hover:bg-navy/5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            添加轮播图
          </button>
        </div>

        <div className="space-y-6">
          {settings.heroSlides.map((slide, index) => (
            <div
              key={index}
              className="relative rounded-lg border border-border p-5 bg-bg-gray/30"
            >
              {/* Slide Header */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-navy">
                  轮播图 {index + 1}
                </span>
                <button
                  onClick={() => removeSlide(index)}
                  className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 transition-colors"
                  title="删除轮播图"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  删除
                </button>
              </div>

              {/* Slide Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1.5">
                    标题
                  </label>
                  <input
                    type="text"
                    value={slide.title}
                    onChange={(e) => updateSlide(index, 'title', e.target.value)}
                    placeholder="轮播图标题"
                    className="w-full rounded-lg border border-border px-4 py-2.5 text-sm placeholder:text-text-muted focus:border-navy focus:ring-1 focus:ring-navy outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1.5">
                    副标题
                  </label>
                  <input
                    type="text"
                    value={slide.subtitle}
                    onChange={(e) => updateSlide(index, 'subtitle', e.target.value)}
                    placeholder="轮播图副标题"
                    className="w-full rounded-lg border border-border px-4 py-2.5 text-sm placeholder:text-text-muted focus:border-navy focus:ring-1 focus:ring-navy outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1.5">
                    图片 URL
                  </label>
                  <input
                    type="text"
                    value={slide.imageUrl}
                    onChange={(e) => updateSlide(index, 'imageUrl', e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="w-full rounded-lg border border-border px-4 py-2.5 text-sm placeholder:text-text-muted focus:border-navy focus:ring-1 focus:ring-navy outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1.5">
                    链接 URL
                    <span className="text-text-muted font-normal ml-1">（可选）</span>
                  </label>
                  <input
                    type="text"
                    value={slide.linkUrl ?? ''}
                    onChange={(e) => updateSlide(index, 'linkUrl', e.target.value)}
                    placeholder="https://example.com/page"
                    className="w-full rounded-lg border border-border px-4 py-2.5 text-sm placeholder:text-text-muted focus:border-navy focus:ring-1 focus:ring-navy outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Slide Preview */}
              {(slide.title || slide.subtitle) && (
                <div className="mt-4 pt-3 border-t border-border/60">
                  <p className="text-xs text-text-muted mb-2">预览</p>
                  <div className="rounded-lg bg-navy/5 px-4 py-3">
                    {slide.title && (
                      <p className="text-sm font-bold text-navy">{slide.title}</p>
                    )}
                    {slide.subtitle && (
                      <p className="text-xs text-text-secondary mt-0.5">
                        {slide.subtitle}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Section C: SEO 设置 */}
      <div className="bg-white rounded-xl shadow-md border border-border p-6">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
          <Globe className="w-5 h-5 text-navy" />
          <h2 className="text-lg font-bold text-navy">SEO 设置</h2>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">
              网站标题
            </label>
            <input
              type="text"
              value={settings.siteTitle}
              onChange={(e) => updateField('siteTitle', e.target.value)}
              className="w-full rounded-lg border border-border px-4 py-2.5 text-sm focus:border-navy focus:ring-1 focus:ring-navy outline-none transition-colors"
            />
            <p className="text-xs text-text-muted mt-1">
              显示在浏览器标签页上的标题
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">
              网站描述
            </label>
            <textarea
              rows={3}
              value={settings.siteDescription}
              onChange={(e) => updateField('siteDescription', e.target.value)}
              className="w-full rounded-lg border border-border px-4 py-2.5 text-sm focus:border-navy focus:ring-1 focus:ring-navy outline-none transition-colors resize-y"
            />
            <p className="text-xs text-text-muted mt-1">
              搜索引擎结果中显示的网站描述（建议 150 字以内）
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">
              关键词
            </label>
            <input
              type="text"
              value={settings.siteKeywords}
              onChange={(e) => updateField('siteKeywords', e.target.value)}
              className="w-full rounded-lg border border-border px-4 py-2.5 text-sm focus:border-navy focus:ring-1 focus:ring-navy outline-none transition-colors"
            />
            <p className="text-xs text-text-muted mt-1">
              多个关键词用英文逗号分隔
            </p>
          </div>
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
