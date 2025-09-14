import prisma from '../../../../lib/prisma'; 
import bcrypt from 'bcryptjs';

export async function POST(req) {
  const { email, password, name } = await req.json();
  const hashedPassword = await bcrypt.hash(password, 10);

  // Check if the user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return new Response(JSON.stringify({ error: "User already exists" }), {
      status: 400,
    });
  }

  const user = await prisma.$transaction([
    prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    }),
  ]);
  
  const project = await prisma.project.findUnique({
    where: { id: 0 }
  });

  if (!project) {
    await prisma.project.create({
      data: {
        id: 0,
        name: 'Calendar',
      }
    });
    await prisma.tableProject.create({
      data: {
        name: 'Calendar table',
        project_id: 0,
        archive: false,
        // Other required fields
      }
    });
  }
  
  await prisma.userToProject.create({
    data: {
      user_id: user[0].id,
      project_id: 0,
      admin: true,
      is_pinned: true,
      position: '-1',
      favourite: true,
    },
  });

  const managementProject = await prisma.project.create({
    data: {
      name: 'Your Management project',
      defaultToUser: user[0].id
    },
  });

  await prisma.userToProject.create({
    data: {
      user_id: user[0].id,
      project_id: managementProject.id,
      admin: true,
      is_pinned: false,
      position: '1',
      favourite: false,
    },
  });

  const managementTable =await prisma.tableProject.create({
    data: {
      project_id: managementProject.id,
      name: 'Your Example Table',
      archive: false,
      position: '1',
    },
  });

  await prisma.tableToUser.create({
    data: {
      user_id: user[0].id,
      table_id: managementTable.id,
      admin: true,
      is_pinned: false,
      default: true,
    },
  });

  await prisma.tab.create({
    data: {
      table_id: managementTable.id,
      name: 'Your Exaple Tab',
      checking: false,
      archive: false,
      psoition: '1',
    },
  });

  return new Response(JSON.stringify(user), { status: 200 });
}
