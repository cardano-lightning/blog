export default {
  footer: <p>Cardano Lightning</p>,
  head: ({ title, meta }) => (
    <>
      {meta.description && (
        <meta name="description" content={meta.description} />
      )}
      {meta.tag && <meta name="keywords" content={meta.tag} />}
      {meta.author && <meta name="author" content={meta.author} />}
      <link rel="icon" href="/favicon.ico" type="image/x-icon" />
    </>
  ),
  logos: {
    dark: {
      big: "/full-white.svg",
      small: "/half-white.svg"
    },
    light: {
      big: "/full.svg",
      small: "/half.svg"
    }
  },
  readMore: 'Read More →',
  postFooter: null,
  darkMode: true,
  navs: []
  //   {
  //     url: 'https://github.com/shuding/nextra',
  //     name: 'Nextra'
  //   }
  // ]
}
