import Link from 'next/link'
import { useRouter } from 'next/router'
import type { ReactElement, ReactNode } from 'react'
import { BasicLayout } from './basic-layout'
import { useBlogContext } from './blog-context'
import { collectPostsAndNavs } from './utils/collect'
import getTags from './utils/get-tags'

export function PostsLayout({
  children
}: {
  children: ReactNode
}): ReactElement {
  const { config, opts } = useBlogContext()
  const { posts } = collectPostsAndNavs({ config, opts })
  const router = useRouter()
  const { type } = opts.frontMatter
  const tagName = type === 'tag' ? router.query.tag : null

  const postList = posts.map(post => {
    if (tagName) {
      const tags = getTags(post)
      if (!Array.isArray(tagName) && !tags.includes(tagName)) {
        return null
      }
    } else if (type === 'tag') {
      return null
    }

    const postTitle = post.frontMatter?.title || post.name
    const date: Date | null = post.frontMatter?.date
      ? new Date(post.frontMatter.date)
      : null
    const description = post.frontMatter?.description

    return (
      <div key={post.route} className="post-item nx-mb-16">
        <h2 className="nx-mt-0 nx-text-2xl">
          <Link href={post.route} passHref legacyBehavior>
            <a className="!nx-no-underline nx-font-bold">{postTitle}</a>
          </Link>
        </h2>
        {description && (
          <p className="nx-mb-2 dark:nx-text-gray-400 nx-text-gray-600 nx-italic">
            {description}
            {config.readMore && (
              <Link href={post.route} passHref legacyBehavior>
                <a className="nx-not-italic post-item-more nx-ml-2">{config.readMore}</a>
              </Link>
            )}
          </p>
        )}
        {date && (
          <time
            className="nx-text-sm dark:nx-text-gray-400 nx-text-gray-600"
            dateTime={date.toISOString()}
          >
            {date.toDateString()}
          </time>
        )}
      </div>
    )
  })
  return (
    <BasicLayout>
      {/* <MDXTheme>{children}</MDXTheme> */}
      {postList}
    </BasicLayout>
  )
}
