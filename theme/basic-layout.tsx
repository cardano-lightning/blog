import Head from 'next/head'
import type { ReactNode } from 'react'
import { useRef } from 'react'
import { useBlogContext } from './blog-context'
import { HeadingContext } from './mdx-theme'

import Image from 'next/image'
import Nav from './nav'

export const BasicLayout = ({ children }: { children: ReactNode }) => {
  const { config, opts } = useBlogContext()
  const title = `${config?.title?.prefix || '' }${opts.title}${config?.title?.suffix || ''}`
  const ref = useRef<HTMLHeadingElement>(null)
  return (
    <section className="nx-mx-auto nx-max-w-3xl nx-px-4 sm:px-6 xl:nx-max-w-5xl xl:nx-px-0">
      <div className="nx-flex nx-h-screen nx-flex-col nx-justify-between nx-font-sans">
        <header className="nx-flex nx-items-center nx-justify-between nx-py-1">
          <div>
            <a aria-label="CARDANO LIGHTNING" href="/">
              <div className="nx-flex nx-items-start nx-justify-between nx-align-items-center">
                <div className="nx-mr-3 nx-h-14 nx-w-14 nx-relative">
                  {/* CSS is more reliable than theme checking like `if (theme === "dark") { logoUrl =.. } */}
                  <Image src={ config.logos.dark } alt="CARDANO LIGHTNING" fill className="nx-hidden dark:nx-block" />
                  <Image src={ config.logos.light } alt="CARDANO LIGHTNING" fill className="nx-block dark:nx-hidden" />
                </div>
              </div>
            </a>
          </div>
          <Nav />
        </header>
        <main className="nx-mb-auto">
          <article className="nx-prose max-md:nx-prose-sm dark:nx-prose-dark nx-pt-10 nx-max-w-3xl nx-pb-2" dir="ltr"
          >
            <Head>
              <title>{title}</title>
              {config.head?.({ title, meta: opts.frontMatter })}
            </Head>
            <HeadingContext.Provider value={ref}>
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
