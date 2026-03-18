import { useEffect } from 'react';
import { useLocation } from 'wouter';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  type?: string;
}

export function SEO({ 
  title = "Brilliano Portfolio | Technical Project Lead", 
  description = "Senior Frontend Developer and Technical Lead specializing in Next.js, React, and TypeScript. Building scalable and performant web applications.",
  image = "/opengraph.jpg",
  type = "website"
}: SEOProps) {
  const [location] = useLocation();
  const canonicalUrl = `${window.location.origin}${import.meta.env.BASE_URL}${location.replace(/^\//, '')}`;
  const fullImageUrl = `${window.location.origin}${import.meta.env.BASE_URL}${image.replace(/^\//, '')}`;

  useEffect(() => {
    // Update basic tags
    document.title = title;
    
    const updateMetaTag = (property: string, content: string, isProperty = false) => {
      let element = document.querySelector(isProperty ? `meta[property="${property}"]` : `meta[name="${property}"]`);
      if (!element) {
        element = document.createElement('meta');
        if (isProperty) element.setAttribute('property', property);
        else element.setAttribute('name', property);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    updateMetaTag('description', description);

    // Update Open Graph (Facebook/WhatsApp/Discord)
    updateMetaTag('og:title', title, true);
    updateMetaTag('og:description', description, true);
    updateMetaTag('og:url', canonicalUrl, true);
    updateMetaTag('og:image', fullImageUrl, true);
    updateMetaTag('og:type', type, true);

    // Update Twitter
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', title);
    updateMetaTag('twitter:description', description);
    updateMetaTag('twitter:image', fullImageUrl);

    // Update Canonical Link
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', canonicalUrl);

  }, [title, description, canonicalUrl, fullImageUrl, type]);

  return null;
}
