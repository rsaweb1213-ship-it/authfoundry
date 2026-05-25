import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
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
        accounts: {
          select: {
            provider: true,
          },
        },
      },
    });

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    return Response.json({ user });
  } catch (error) {
    console.error("[Profile GET] Error:", error);
    return Response.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, image } = body;

    const updateData: Record<string, string> = {};
    if (name !== undefined) {
      if (typeof name !== "string" || name.length > 100) {
        return Response.json(
          { error: "Name must be a string with at most 100 characters" },
          { status: 400 }
        );
      }
      updateData.name = name;
    }
    if (image !== undefined) {
      if (typeof image !== "string" || image.length > 500) {
        return Response.json(
          { error: "Invalid image URL" },
          { status: 400 }
        );
      }
      updateData.image = image;
    }

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        isVerified: true,
      },
    });

    return Response.json({ user });
  } catch (error) {
    console.error("[Profile PUT] Error:", error);
    return Response.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}