import { prisma } from "@/lib/prisma.js";
import { Errors } from "@/utils/errors.js";

export function listMetiers() {
  return prisma.profession.findMany({ where: { actif: true }, orderBy: { nom: "asc" } });
}

export async function listBlog(skip: number, limit: number) {
  const where = { statut: "PUBLIE" as const };
  const [articles, total] = await Promise.all([
    prisma.articleBlog.findMany({
      where,
      orderBy: { datePublication: "desc" },
      skip,
      take: limit,
      select: {
        id: true,
        titre: true,
        slug: true,
        extrait: true,
        imageUrl: true,
        datePublication: true,
      },
    }),
    prisma.articleBlog.count({ where }),
  ]);
  return { articles, total };
}

export async function getBlogArticle(slug: string) {
  const article = await prisma.articleBlog.findFirst({ where: { slug, statut: "PUBLIE" } });
  if (!article) throw Errors.notFound("Article introuvable");
  return article;
}
