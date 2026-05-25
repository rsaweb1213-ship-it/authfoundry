import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function GET(
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
    });

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    return Response.json({ user });
  } catch (error) {
    console.error("[Admin User GET] Error:", error);
    return Response.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
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

    const body = await request.json();
    const { name, email, role, isActive, password } = body;

    // Validate role
    if (role && !["user", "admin"].includes(role)) {
      return Response.json(
        { error: "Role must be 'user' or 'admin'" },
        { status: 400 }
      );
    }

    // Build update data
    const updateData: Record<string, any> = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) {
      if (typeof email !== "string" || !email.includes("@")) {
        return Response.json({ error: "Invalid email" }, { status: 400 });
      }
      // Check for duplicate email
      const existing = await prisma.user.findUnique({
        where: { email: email.toLowerCase().trim() },
      });
      if (existing && existing.id !== params.id) {
        return Response.json(
          { error: "Email already in use" },
          { status: 409 }
        );
      }
      updateData.email = email.toLowerCase().trim();
    }
    if (role !== undefined) updateData.role = role;
    if (isActive !== undefined) updateData.isActive = Boolean(isActive);
    if (password) {
      if (password.length < 8) {
        return Response.json(
          { error: "Password must be at least 8 characters" },
          { status: 400 }
        );
      }
      updateData.passwordHash = await bcrypt.hash(password, 12);
    }

    if (Object.keys(updateData).length === 0) {
      return Response.json(
        { error: "No fields to update" },
        { status: 400 }
      );
    }

    const user = await prisma.user.update({
      where: { id: params.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        isVerified: true,
        isActive: true,
        updatedAt: true,
      },
    });

    return Response.json({ user, message: "User updated successfully" });
  } catch (error) {
    console.error("[Admin User PUT] Error:", error);
    return Response.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    // Prevent admin from deleting themselves
    if (session.user.id === params.id) {
      return Response.json(
        { error: "You cannot delete your own account" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: params.id },
    });

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    // Delete all related records first
    await prisma.session.deleteMany({ where: { userId: params.id } });
    await prisma.account.deleteMany({ where: { userId: params.id } });
    await prisma.user.delete({ where: { id: params.id } });

    return Response.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("[Admin User DELETE] Error:", error);
    return Response.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}