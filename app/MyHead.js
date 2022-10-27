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
      <title>{fullTitle}</title>
      <meta property="og:title" content={fullTitle} />
      <meta name="twitter:title" content={fullTitle} />
    </>
  );
}
