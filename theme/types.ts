/* eslint typescript-sort-keys/interface: error */
import type { PageOpts } from 'nextra'
import type { Components } from 'nextra/mdx'
import type { ReactNode } from 'react'

//  logo: {
//    dark: {
//      big: "/full-white.svg",
//      small: "/half-white.svg"
//    },
//    light: {
//      big: "/full.svg",
//      small: "/half.svg"
//    }
//  },
export interface NextraBlogTheme {
  comments?: ReactNode
  components?: Components
  darkMode?: boolean
  dateFormatter?: (date: Date) => string
  footer?: ReactNode
  head?: ({
    meta,
    title
  }: {
    meta: Record<string, any>
    title: string
  }) => ReactNode
  logos?: {
    dark: string,
    light: string
  },
  navs?: {
    name: string
    url: string
  }[]
  postFooter?: string
  readMore?: string
  title?: {
    prefix?: string,
    suffix?: string,
  }
}
// lets extend PageOpts<BlogFrontMatter> with subitles
export type BlogPageOpts = PageOpts<BlogFrontMatter> & { subtitle?: string }

export type BlogFrontMatter = {
  author?: string
  back?: string
  date?: string
  description?: string
  tag?: string | string[]
  title?: string
  type?: 'post' | 'page' | 'posts' | 'tag'
}

export interface LayoutProps {
  config: NextraBlogTheme
  opts: BlogPageOpts
}
