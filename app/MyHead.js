/*
<meta name="description" content="{% if page.summary %}{{ page.summary }}{% else %}{{ site.description }}{% endif %}">
{% if page.categories %}<meta name="keywords" content="{{ page.categories | join: ', ' }}">{% endif %}
<link rel="canonical" href="{{ page.url | replace:'index.html','' | prepend: site.baseurl | prepend: site.url }}">

<!-- Open Graph -->
<!-- From: https://github.com/mmistakes/hpstr-jekyll-theme/blob/master/_includes/head.html -->
<meta property="og:description" content="{% if page.summary %}{{ page.summary }}{% else %}{{ site.description }}{% endif %}">
<meta property="og:url" content="{{ page.url }}">
    */

export default function MyHead({ title }) {
  const fullTitle = (title ? `${title} / ` : "") + "Jordan Eldredge";
  return (
    <>
      <meta name="viewport" content="width=device-width" />
      <meta property="og:locale" content="en_US" />
      <meta name="author" content="Jordan Eldredge" />
      <meta property="og:site_name" content="Jordan Eldredge" />
      <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon" />
      <meta name="twitter:site" content="@captbaritone" />
      <meta name="twitter:creator" content="@captbaritone" />
      <link
        rel="alternate"
        type="application/rss+xml"
        href="/feed/rss.xml"
        title="RSS feed for jordaneldredge.com"
      />
      <title>{fullTitle}</title>
      <meta property="og:title" content={fullTitle} />
      <meta name="twitter:title" content={fullTitle} />
    </>
  );
}
