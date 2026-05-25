import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return Response.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const url = new URL(request.url);
    const page = Math.max(1, parseInt(url.searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get("limit") || "20")));
    const search = url.searchParams.get("search") || "";
    const role = url.searchParams.get("role") || "";
    const status = url.searchParams.get("status") || "";
    const sortBy = url.searchParams.get("sortBy") || "createdAt";
    const sortOrder = url.searchParams.get("sortOrder") || "desc";

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { email: { contains: search, mode: "insensitive" } },
        { name: { contains: search, mode: "insensitive" } },
      ];
    }

    if (role === "admin" || role === "user") {
      where.role = role;
    }

    if (status === "active") {
      where.isActive = true;
    } else if (status === "inactive") {
      where.isActive = false;
    } else if (status === "verified") {
      where.isVerified = true;
    } else if (status === "unverified") {
      where.isVerified = false;
    }

    // Validate sort field to prevent injection
    const allowedSortFields = ["createdAt", "updatedAt", "email", "name", "role"];
    const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : "createdAt";
    const safeSortOrder = sortOrder === "asc" ? "asc" : "desc";

    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          role: true,
          isVerified: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          emailVerified: true,
          accounts: {
            select: { provider: true },
          },
          _count: {
            select: { sessions: true },
          },
        },
        skip,
        take: limit,
        orderBy: { [safeSortBy]: safeSortOrder },
      }),
      prisma.user.count({ where }),
    ]);

    return Response.json({
      users,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("[Admin Users GET] Error:", error);
    return Response.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}