import type { ReactNode } from 'react'
import { BasicLayout } from './basic-layout'
import { useBlogContext } from './blog-context'
import { MDXTheme } from './mdx-theme'
import Meta from './meta'

export const ArticleLayout = ({ children }: { children: ReactNode }) => {
  const { config, opts } = useBlogContext()
  return (
    <BasicLayout>
      <Meta />
      <MDXTheme>
        <h1 className="nx-font-cardano nx-text-neutral-700 nx-text-3xl">{opts.title}</h1>
        {children}
        {config.postFooter}
        {config.comments}
      </MDXTheme>
    </BasicLayout>
  )
}
