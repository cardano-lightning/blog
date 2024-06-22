import Head from 'next/head'
import type { ReactNode } from 'react'
import { useRef } from 'react'
import { useBlogContext } from './blog-context'
import { HeadingContext } from './mdx-theme'

import Image from 'next/image'
import ThemeSwitch from './theme-switch'
import Nav from './nav'
import { useTheme } from 'next-themes'

export const BasicLayout = ({ children }: { children: ReactNode }) => {
  const { config, opts } = useBlogContext()
  const title = `${opts.title}${config.titleSuffix || ''}`
  const ref = useRef<HTMLHeadingElement>(null)

  const { theme } = useTheme();

  let imageUrl = config.logos.light.big;
  let logoUrl = config.logos.light.small;
  if (theme === "dark") {
    imageUrl = config.logos.dark.big;
    logoUrl = config.logos.dark.small;
  }
  return (
    <section className="nx-mx-auto nx-max-w-3xl nx-px-4 sm:px-6 xl:nx-max-w-5xl xl:nx-px-0">
      <div className="nx-flex nx-h-screen nx-flex-col nx-justify-between nx-font-sans">
        <header className="nx-flex nx-items-center nx-justify-between nx-py-1">
          <div>
            <a aria-label="CARDANO LIGHTNING" href="/">
              <div className="nx-flex nx-items-center nx-justify-between nx-align-items-center">
                <div className="nx-mr-3 nx-h-14 nx-w-14 sm:nx-hidden nx-relative">
                  <Image src={ logoUrl } alt="CARDANO LIGHTNING" fill />
                </div>
<<<<<<< Updated upstream
                <div className="nx-hidden nx-mx-3 nx-h-14 nx-w-16 sm:nx-block nx-relative">
=======
                <div className="nx-hidden nx-mr-3 nx-h-14 nx-w-64 sm:nx-block nx-relative">
>>>>>>> Stashed changes
                  <Image src={ imageUrl } alt="CARDANO LIGHTNING" fill />
                </div>
              </div>
            </a>
          </div>
          <Nav />
        </header>
        <main className="nx-mb-auto">
          <article className="nx-prose max-md:nx-prose-sm dark:nx-prose-dark nx-pt-10 nx-max-w-3xl" dir="ltr"
          >
            <Head>
              <title>{title}</title>
              {config.head?.({ title, meta: opts.frontMatter })}
            </Head>
            <HeadingContext.Provider value={ref}>
              {opts.hasJsxInH1 ? <h1 ref={ref} /> : null}
              {opts.hasJsxInH1 ? null : <h1 className="nx-font-cardano nx-text-neutral-700">{opts.title}</h1>}
              {opts.frontMatter.description && <p className="nx-text-xl nx-text-gray-500 nx-italic">{opts.frontMatter.description}</p>}
              {children}
            </HeadingContext.Provider>
          </article>
        </main>
        <footer>
          <div className="nx-mt-16 nx-flex nx-flex-col nx-items-center">
            <div className="nx-mb-3 flex space-x-4">
            {config.footer}
            </div>
          </div>
        </footer>
      </div>
    </section>
  )
}
