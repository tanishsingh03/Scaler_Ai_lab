const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create default admin user
  const user = await prisma.user.upsert({
    where: { username: 'aitanish' },
    update: {},
    create: {
      name: 'Tanish Singh',
      username: 'aitanish',
      email: 'tanish@example.com',
      timezone: 'Asia/Kolkata',
    },
  });

  console.log('✅ User created:', user.username);

  // Create sample event types
  const et1 = await prisma.eventType.upsert({
    where: { userId_slug: { userId: user.id, slug: '15-min' } },
    update: {},
    create: {
      userId: user.id,
      title: '15 Minute Meeting',
      slug: '15-min',
      duration: 15,
      description: 'A quick 15 minute sync call.',
      bufferBefore: 0,
      bufferAfter: 5,
    },
  });

  const et2 = await prisma.eventType.upsert({
    where: { userId_slug: { userId: user.id, slug: '30-min' } },
    update: {},
    create: {
      userId: user.id,
      title: '30 Minute Meeting',
      slug: '30-min',
      duration: 30,
      description: 'A standard 30-minute meeting for discussions.',
      bufferBefore: 0,
      bufferAfter: 10,
    },
  });

  console.log('✅ Event types created:', et1.slug, et2.slug);

  // Create default weekly availability (Monday - Friday, 9AM - 5PM)
  const weekdays = [1, 2, 3, 4, 5]; // Mon to Fri
  for (const day of weekdays) {
    await prisma.availability.upsert({
      where: { id: `avail-${user.id}-${day}` } ,
      update: {},
      create: {
        id: `avail-${user.id}-${day}`,
        userId: user.id,
        dayOfWeek: day,
        startTime: '09:00',
        endTime: '17:00',
      },
    });
  }

  console.log('✅ Availability seeded for Mon-Fri');

  // Seed a few past sample bookings
  const pastDate = new Date();
  pastDate.setDate(pastDate.getDate() - 5);
  pastDate.setHours(10, 0, 0, 0);

  await prisma.booking.create({
    data: {
      eventTypeId: et2.id,
      inviteeName: 'John Doe',
      inviteeEmail: 'john@example.com',
      startTime: pastDate,
      endTime: new Date(pastDate.getTime() + 30 * 60000),
      status: 'SCHEDULED',
    },
  });

  const upcomingDate = new Date();
  upcomingDate.setDate(upcomingDate.getDate() + 3);
  upcomingDate.setHours(14, 0, 0, 0);

  await prisma.booking.create({
    data: {
      eventTypeId: et1.id,
      inviteeName: 'Jane Smith',
      inviteeEmail: 'jane@example.com',
      startTime: upcomingDate,
      endTime: new Date(upcomingDate.getTime() + 15 * 60000),
      status: 'SCHEDULED',
    },
  });

  console.log('✅ Sample bookings created');
  console.log('🎉 Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
