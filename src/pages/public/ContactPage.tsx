import { useState, useEffect, useRef } from 'react'
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  CheckCircle,
  Building2,
} from 'lucide-react'
import { COMPANY } from '@/config/constants'
import { getSiteSettings } from '@/services/site-settings.service'
import { submitContact } from '@/services/contacts.service'
import HeroSection from '@/components/shared/HeroSection'
import AnimatedSection from '@/components/shared/AnimatedSection'

interface ContactForm {
  name: string
  phone: string
  email: string
  company: string
  subject: string
  message: string
}

interface FormErrors {
  name?: string
  phone?: string
  subject?: string
  message?: string
}

const INITIAL_FORM: ContactForm = {
  name: '',
  phone: '',
  email: '',
  company: '',
  subject: '',
  message: '',
}

const AMAP_KEY = '5c929006a41b4bd38b879764ebdbbcfd'
// 深圳市光明区光明街道 approximate coordinates
const COMPANY_LNG = 113.93
const COMPANY_LAT = 22.77

const STAGGER_DELAYS = [0, 100, 200, 300, 400] as const

function AMapContainer() {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<unknown>(null)
  const [mapError, setMapError] = useState(false)

  useEffect(() => {
    // Avoid loading the script multiple times
    const existingScript = document.getElementById('amap-jsapi')

    function initMap() {
      const AMap = (window as unknown as Record<string, unknown>).AMap as {
        Map: new (
          el: HTMLElement,
          opts: Record<string, unknown>
        ) => Record<string, unknown>
        Marker: new (opts: Record<string, unknown>) => unknown
      } | undefined

      if (!AMap || !mapRef.current) {
        setMapError(true)
        return
      }

      try {
        const map = new AMap.Map(mapRef.current, {
          zoom: 15,
          center: [COMPANY_LNG, COMPANY_LAT],
          viewMode: '2D',
        })

        new AMap.Marker({
          position: [COMPANY_LNG, COMPANY_LAT],
          title: COMPANY.name,
          map,
        })

        mapInstanceRef.current = map
      } catch {
        setMapError(true)
      }
    }

    if (existingScript) {
      // Script already loaded or loading
      if ((window as unknown as Record<string, unknown>).AMap) {
        initMap()
      } else {
        existingScript.addEventListener('load', initMap)
        existingScript.addEventListener('error', () => setMapError(true))
      }
    } else {
      const script = document.createElement('script')
      script.id = 'amap-jsapi'
      script.src = `https://webapi.amap.com/maps?v=2.0&key=${AMAP_KEY}`
      script.async = true
      script.onload = initMap
      script.onerror = () => setMapError(true)
      document.head.appendChild(script)
    }

    return () => {
      // Destroy map instance on unmount to avoid memory leaks
      if (mapInstanceRef.current) {
        const instance = mapInstanceRef.current as { destroy?: () => void }
        instance.destroy?.()
        mapInstanceRef.current = null
      }
    }
  }, [])

  if (mapError) {
    return (
      <div className="aspect-video bg-bg-gray flex flex-col items-center justify-center gap-3">
        <div className="w-16 h-16 bg-navy/10 rounded-full flex items-center justify-center">
          <MapPin className="w-8 h-8 text-navy/40" />
        </div>
        <p className="text-text-muted text-sm">地图加载失败</p>
        <p className="text-text-muted text-xs">{COMPANY.address}</p>
      </div>
    )
  }

  return <div ref={mapRef} className="aspect-video w-full" />
}

export default function ContactPage() {
  const [form, setForm] = useState<ContactForm>(INITIAL_FORM)
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Dynamic contact info from database (falls back to COMPANY constants)
  const [contactAddress, setContactAddress] = useState(COMPANY.address)
  const [contactPhone, setContactPhone] = useState(COMPANY.phone)
  const [contactEmail, setContactEmail] = useState(COMPANY.email)
  const [contactHours, setContactHours] = useState('周一至周五 9:00-18:00')

  useEffect(() => {
    getSiteSettings().then((s) => {
      if (!s) return
      if (s.companyAddress) setContactAddress(s.companyAddress)
      if (s.companyPhone) setContactPhone(s.companyPhone)
      if (s.companyEmail) setContactEmail(s.companyEmail)
      if (s.workingHours) setContactHours(s.workingHours)
    }).catch(() => { /* fallback already set */ })
  }, [])

  function validate(): FormErrors {
    const errs: FormErrors = {}
    if (!form.name.trim()) errs.name = '请输入您的姓名'
    if (!form.phone.trim()) {
      errs.phone = '请输入您的手机号'
    } else if (!/^1[3-9]\d{9}$/.test(form.phone.trim())) {
      errs.phone = '请输入正确的手机号码'
    }
    if (!form.subject.trim()) errs.subject = '请输入留言主题'
    if (!form.message.trim()) errs.message = '请输入留言内容'
    return errs
  }

  function handleChange(field: keyof ContactForm, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    setSubmitting(true)
    try {
      await submitContact(form)
      setSubmitted(true)
    } catch (err) {
      console.error('Failed to submit contact:', err)
    } finally {
      setSubmitting(false)
    }
  }

  function handleReset() {
    setForm(INITIAL_FORM)
    setErrors({})
    setSubmitted(false)
  }

  const contactInfoItems = [
    { icon: MapPin, label: '公司地址', value: contactAddress },
    { icon: Phone, label: '联系电话', value: contactPhone },
    { icon: Mail, label: '电子邮箱', value: contactEmail },
    { icon: Clock, label: '工作时间', value: contactHours },
  ]

  return (
    <div>
      {/* Hero Banner */}
      <HeroSection
        title="联系我们"
        subtitle="期待与您的合作，欢迎随时联系"
      />

      {/* Main Content */}
      <section className="py-20 sm:py-24 px-4 bg-bg-gray">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-10">
            {/* Left Column: Contact Info + Map */}
            <div className="space-y-8">
              {/* Contact Info Cards */}
              <div className="grid sm:grid-cols-2 gap-4">
                {contactInfoItems.map((info, i) => (
                  <AnimatedSection key={info.label} delay={STAGGER_DELAYS[i]}>
                    <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 border border-border">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-navy/10 rounded-xl flex items-center justify-center shrink-0">
                          <info.icon className="w-6 h-6 text-navy" />
                        </div>
                        <div>
                          <p className="text-sm text-text-muted mb-1">{info.label}</p>
                          <p className="font-semibold text-text-primary">{info.value}</p>
                        </div>
                      </div>
                    </div>
                  </AnimatedSection>
                ))}
              </div>

              {/* AMap 高德地图 */}
              <AnimatedSection variant="scale">
                <div className="bg-white rounded-xl border border-border shadow-md overflow-hidden">
                  <AMapContainer />
                </div>
              </AnimatedSection>
            </div>

            {/* Right Column: Contact Form */}
            <AnimatedSection variant="left" delay={200}>
              <div className="bg-white rounded-xl shadow-md border border-border p-8">
                {submitted ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6">
                      <CheckCircle className="w-10 h-10 text-green-500" />
                    </div>
                    <h3 className="text-2xl font-bold text-navy mb-3">提交成功</h3>
                    <p className="text-text-secondary mb-8 max-w-sm">
                      感谢您的留言，我们会尽快与您联系！
                    </p>
                    <button
                      onClick={handleReset}
                      className="inline-flex items-center gap-2 rounded-lg border-2 border-navy px-6 py-2.5 text-sm font-semibold text-navy transition-all hover:bg-navy hover:text-white"
                    >
                      继续留言
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="mb-8">
                      <h2 className="text-2xl font-bold text-navy mb-2">在线留言</h2>
                      <p className="text-text-secondary text-sm">
                        请填写以下表单，我们将尽快回复您
                      </p>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div className="grid sm:grid-cols-2 gap-5">
                        {/* 姓名 */}
                        <div>
                          <label className="block text-sm font-medium text-text-primary mb-1.5">
                            姓名 <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={form.name}
                            onChange={(e) => handleChange('name', e.target.value)}
                            placeholder="请输入您的姓名"
                            className={`w-full rounded-lg border px-4 py-2.5 text-sm outline-none transition-colors focus:border-navy focus:ring-1 focus:ring-navy ${
                              errors.name ? 'border-red-400 bg-red-50' : 'border-border bg-white'
                            }`}
                          />
                          {errors.name && (
                            <p className="mt-1 text-xs text-red-500">{errors.name}</p>
                          )}
                        </div>

                        {/* 手机号 */}
                        <div>
                          <label className="block text-sm font-medium text-text-primary mb-1.5">
                            手机号 <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="tel"
                            value={form.phone}
                            onChange={(e) => handleChange('phone', e.target.value)}
                            placeholder="请输入您的手机号"
                            className={`w-full rounded-lg border px-4 py-2.5 text-sm outline-none transition-colors focus:border-navy focus:ring-1 focus:ring-navy ${
                              errors.phone ? 'border-red-400 bg-red-50' : 'border-border bg-white'
                            }`}
                          />
                          {errors.phone && (
                            <p className="mt-1 text-xs text-red-500">{errors.phone}</p>
                          )}
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-5">
                        {/* 邮箱 */}
                        <div>
                          <label className="block text-sm font-medium text-text-primary mb-1.5">
                            邮箱
                          </label>
                          <input
                            type="email"
                            value={form.email}
                            onChange={(e) => handleChange('email', e.target.value)}
                            placeholder="请输入您的邮箱"
                            className="w-full rounded-lg border border-border bg-white px-4 py-2.5 text-sm outline-none transition-colors focus:border-navy focus:ring-1 focus:ring-navy"
                          />
                        </div>

                        {/* 公司名称 */}
                        <div>
                          <label className="block text-sm font-medium text-text-primary mb-1.5">
                            公司名称
                          </label>
                          <input
                            type="text"
                            value={form.company}
                            onChange={(e) => handleChange('company', e.target.value)}
                            placeholder="请输入您的公司名称"
                            className="w-full rounded-lg border border-border bg-white px-4 py-2.5 text-sm outline-none transition-colors focus:border-navy focus:ring-1 focus:ring-navy"
                          />
                        </div>
                      </div>

                      {/* 主题 */}
                      <div>
                        <label className="block text-sm font-medium text-text-primary mb-1.5">
                          主题 <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={form.subject}
                          onChange={(e) => handleChange('subject', e.target.value)}
                          placeholder="请输入留言主题"
                          className={`w-full rounded-lg border px-4 py-2.5 text-sm outline-none transition-colors focus:border-navy focus:ring-1 focus:ring-navy ${
                            errors.subject ? 'border-red-400 bg-red-50' : 'border-border bg-white'
                          }`}
                        />
                        {errors.subject && (
                          <p className="mt-1 text-xs text-red-500">{errors.subject}</p>
                        )}
                      </div>

                      {/* 留言内容 */}
                      <div>
                        <label className="block text-sm font-medium text-text-primary mb-1.5">
                          留言内容 <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          value={form.message}
                          onChange={(e) => handleChange('message', e.target.value)}
                          placeholder="请输入您的留言内容..."
                          rows={5}
                          className={`w-full rounded-lg border px-4 py-2.5 text-sm outline-none transition-colors focus:border-navy focus:ring-1 focus:ring-navy resize-none ${
                            errors.message ? 'border-red-400 bg-red-50' : 'border-border bg-white'
                          }`}
                        />
                        {errors.message && (
                          <p className="mt-1 text-xs text-red-500">{errors.message}</p>
                        )}
                      </div>

                      {/* Submit Button */}
                      <button
                        type="submit"
                        disabled={submitting}
                        className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-gold px-8 py-3 text-sm font-semibold text-navy transition-all hover:bg-gold-light hover:shadow-lg hover:shadow-gold/20 disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {submitting ? (
                          <>
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-navy border-t-transparent" />
                            提交中...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            提交留言
                          </>
                        )}
                      </button>
                    </form>
                  </>
                )}
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Bottom Info */}
      <section className="py-12 px-4 bg-white">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-3 bg-navy/5 rounded-full px-6 py-3">
            <Building2 className="w-5 h-5 text-navy" />
            <p className="text-text-secondary text-sm">
              您也可以直接拨打电话或发送邮件与我们联系
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
