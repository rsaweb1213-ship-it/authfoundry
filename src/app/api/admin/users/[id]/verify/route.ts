import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return Response.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: params.id },
    });

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    if (!user.email) {
      return Response.json(
        { error: "Cannot verify user without email" },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: {
        isVerified: true,
        emailVerified: new Date(),
      },
      select: {
        id: true,
        email: true,
        isVerified: true,
        emailVerified: true,
      },
    });

    return Response.json({
      user: updatedUser,
      message: "User verified successfully",
    });
  } catch (error) {
    console.error("[Admin Verify User] Error:", error);
    return Response.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}