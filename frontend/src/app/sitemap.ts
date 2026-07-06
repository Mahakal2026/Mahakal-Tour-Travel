import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://mahakaltourandtravels.com';

  // Base routes
  const routes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/admin`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.1,
    },
  ];

  try {
    // Fetch packages for dynamic sitemap paths
    const packagesRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/packages`);
    if (packagesRes.ok) {
      const packagesData = await packagesRes.json();
      const packages = packagesData.data || [];
      
      packages.forEach((pkg: any) => {
        if (pkg.isActive) {
          routes.push({
            url: `${baseUrl}/packages/${pkg._id}`,
            lastModified: new Date(pkg.updatedAt || new Date()),
            changeFrequency: 'weekly',
            priority: 0.8,
          });
        }
      });
    }

    // Fetch vehicles for dynamic sitemap paths
    const vehiclesRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/vehicles`);
    if (vehiclesRes.ok) {
      const vehiclesData = await vehiclesRes.json();
      const vehicles = vehiclesData.data || [];
      
      vehicles.forEach((vehicle: any) => {
        if (vehicle.isActive) {
          routes.push({
            url: `${baseUrl}/vehicles/${vehicle._id}`,
            lastModified: new Date(vehicle.updatedAt || new Date()),
            changeFrequency: 'weekly',
            priority: 0.8,
          });
        }
      });
    }
  } catch (error) {
    console.error('Sitemap generation failed:', error);
  }

  return routes;
}
