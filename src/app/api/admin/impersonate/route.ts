import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return Response.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return Response.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    if (userId === session.user.id) {
      return Response.json(
        { error: "You cannot impersonate yourself" },
        { status: 400 }
      );
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!targetUser) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    if (!targetUser.isActive) {
      return Response.json(
        { error: "Cannot impersonate a deactivated user" },
        { status: 400 }
      );
    }

    // Generate a temporary impersonation session token
    // The admin will use this to sign in as the user
    return Response.json({
      message: "Impersonation session created",
      user: {
        id: targetUser.id,
        name: targetUser.name,
        email: targetUser.email,
        role: targetUser.role,
      },
      // The frontend should redirect to the NextAuth signIn with impersonation
      // or the admin can use the session token directly
      // For now, return the target user info and let frontend handle the flow
      impersonationToken: Buffer.from(
        JSON.stringify({
          adminId: session.user.id,
          targetId: targetUser.id,
          exp: Date.now() + 30 * 60 * 1000, // 30 minutes
        })
      ).toString("base64"),
    });
  } catch (error) {
    console.error("[Admin Impersonate] Error:", error);
    return Response.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}