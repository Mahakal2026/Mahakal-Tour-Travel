import { MetadataRoute } from "next";
import { VEHICLES, PACKAGES } from "@/lib/constants";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://mahakaltourandtravels.com";

  const routes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/admin`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.1,
    },
  ];

  // Vehicles static routes
  VEHICLES.forEach((vehicle) => {
    routes.push({
      url: `${baseUrl}/vehicles/${vehicle._id}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    });
  });

  // Packages static routes
  PACKAGES.forEach((pkg) => {
    routes.push({
      url: `${baseUrl}/packages/${pkg._id}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    });
  });

  return routes;
}
