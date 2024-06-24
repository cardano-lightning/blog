export default {
  // Not sure why nx-mr-4 is not working and I was froced to use carazy style property
  footer:
    <div className="nx-flex nx-items-center nx-space-x-4">
      <a href="https://twitter.com/CardanoLightnin" class="hover:nx-text-blue-400" style={{"margin-right": "1rem"}}>
        <i className="fab fa-twitter fa-lg"></i>
      </a>
      <a href="https://github.com/cardano-lightning" class="hover:nx-text-gray-400">
        <i className="fab fa-github fa-lg"></i>
      </a>
    </div>,
  head: ({ title, meta }) => (
    <>
      {meta.description && (
        <meta name="description" content={meta.description} />
      )}
      {meta.tag && <meta name="keywords" content={meta.tag} />}
      {meta.author && <meta name="author" content={meta.author} />}
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" />
      <link rel="icon" href="/favicon.ico" type="image/x-icon" />
    </>
  ),
  logos: {
    dark: "/logo-white.svg",
    light: "/logo.svg",
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
