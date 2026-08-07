import sanitize from 'sanitize-html'

export function sanitizeHtml(dirty: string): string {
  return sanitize(dirty, {
    allowedTags: [
      'h2', 'h3', 'h4', 'p', 'br', 'hr', 'strong', 'em', 'u', 's',
      'ul', 'ol', 'li', 'blockquote', 'a', 'img', 'iframe', 'figure', 'figcaption',
    ],
    allowedAttributes: {
      a: ['href', 'target', 'rel'],
      img: ['src', 'alt', 'width', 'height'],
      iframe: ['src', 'width', 'height', 'allow', 'allowfullscreen', 'frameborder'],
    },
    allowedSchemes: ['http', 'https', 'mailto', 'tel'],
    allowedIframeHostnames: ['www.youtube.com', 'youtube.com', 'www.youtube-nocookie.com'],
    transformTags: {
      a: sanitize.simpleTransform('a', { rel: 'noopener noreferrer' }),
    },
    // sanitize-html chỉ xoá thuộc tính `src` của iframe có tên miền lạ chứ
    // không xoá cả thẻ, để lại `<iframe></iframe>` rỗng — loại hẳn thẻ đó đi.
    exclusiveFilter: (frame) => frame.tag === 'iframe' && !frame.attribs.src,
  })
}
