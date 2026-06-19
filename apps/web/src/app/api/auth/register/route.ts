import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { db } from '@cct/db';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, name } = body;

    if (!email || !password || !name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 409 });
    }

    const hashedPassword = await hash(password, 12);

    const user = await db.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email,
          name,
          passwordHash: hashedPassword,
        },
      });

      // Create default workspace
      const slug = `${(name || 'workspace').toLowerCase().replace(/\s+/g, '-')}-${Math.random().toString(36).slice(2, 6)}`;
      const workspace = await tx.workspace.create({
        data: {
          name: `${name}'s Workspace`,
          slug,
          ownerId: newUser.id,
        },
      });

      // Add as workspace member
      await tx.workspaceMember.create({
        data: {
          workspaceId: workspace.id,
          userId: newUser.id,
          role: 'ADMIN',
          joinedAt: new Date(),
        },
      });

      // Create default notification prefs
      await tx.notificationPreference.create({
        data: {
          userId: newUser.id,
          workspaceId: workspace.id,
        },
      });

      return newUser;
    });

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
