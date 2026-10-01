import { errorResponse, successResponse } from "@/lib/api";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const [featuredJobs, totalJobs, companies] = await Promise.all([
      prisma.job.findMany({
        take: 6,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          company: true,
          location: true,
          salary: true,
          type: true,
          createdAt: true,
          employer: { select: { name: true } },
        },
      }),
      prisma.job.count(),
      prisma.job.findMany({
        distinct: ["company"],
        select: { company: true },
      }),
    ]);

    return successResponse({
      stats: { totalJobs, totalCompanies: companies.length },
      featuredJobs,
    });
  } catch (err) {
    console.error("[API Error]:", err);
    return errorResponse("Error fetching public jobs");
  }
}