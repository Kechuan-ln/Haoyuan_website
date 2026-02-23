interface SEOHeadProps {
  title: string
  description: string
  path: string
  image?: string
}

const SITE_NAME = '广东全程创优建设技术有限公司'
const BASE_URL = 'https://haoyuan-web.web.app'
const DEFAULT_IMAGE = `${BASE_URL}/logo.svg`

export default function SEOHead({ title, description, path, image }: SEOHeadProps) {
  const fullTitle = `${title} | ${SITE_NAME}`
  const url = `${BASE_URL}${path}`
  const ogImage = image ?? DEFAULT_IMAGE

  return (
    <>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:type" content="website" />
      <meta property="og:locale" content="zh_CN" />
    </>
  )
}
