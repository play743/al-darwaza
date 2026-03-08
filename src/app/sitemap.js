export default function sitemap() {
  return [
    {
      url: 'https://aldarwaza.online',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: 'https://aldarwaza.online/games/fak-alshafra',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ];
}