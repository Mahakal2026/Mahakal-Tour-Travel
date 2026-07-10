import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://mahakaltourandtravels.com";
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

  const routes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/fleet`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/packages`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/fare-calculator`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  // Fetch vehicles dynamic detail routes
  try {
    const vehiclesRes = await fetch(`${apiUrl}/vehicles`).then((res) => res.json());
    const vehicles = vehiclesRes?.data || (Array.isArray(vehiclesRes) ? vehiclesRes : []);
    vehicles.forEach((vehicle: any) => {
      if (vehicle.isActive) {
        routes.push({
          url: `${baseUrl}/fleet/${vehicle._id}`,
          lastModified: new Date(),
          changeFrequency: "weekly",
          priority: 0.8,
        });
      }
    });
  } catch (err) {
    console.error("Sitemap vehicles fetch error:", err);
  }

  // Fetch packages dynamic detail routes
  try {
    const packagesRes = await fetch(`${apiUrl}/packages`).then((res) => res.json());
    const packages = packagesRes?.data || (Array.isArray(packagesRes) ? packagesRes : []);
    packages.forEach((pkg: any) => {
      if (pkg.isActive) {
        routes.push({
          url: `${baseUrl}/packages/${pkg._id}`,
          lastModified: new Date(),
          changeFrequency: "weekly",
          priority: 0.8,
        });
      }
    });
  } catch (err) {
    console.error("Sitemap packages fetch error:", err);
  }

  return routes;
}
