import { nocobaseListResource, nocobaseRequest, usesNocoBase } from "@/lib/nocobase";
import { prisma } from "@/lib/prisma";

export type PublicSiteProfile = {
  id: number;
  name: string;
  role: string;
  heroTitle: string;
  heroHighlight: string;
  introduction: string;
  statusText: string;
  aboutTitle: string;
  aboutParagraphOne: string;
  aboutParagraphTwo: string;
};

export async function getPublicSiteProfile(): Promise<PublicSiteProfile | null> {
  if (!usesNocoBase()) {
    return prisma.siteProfile.findUnique({ where: { id: 1 } });
  }

  const profiles = await nocobaseRequest<PublicSiteProfile[]>(
    nocobaseListResource("siteProfiles", {
      filter: JSON.stringify({ id: 1 }),
      pageSize: "1",
    }),
  );

  return profiles[0] ?? null;
}
