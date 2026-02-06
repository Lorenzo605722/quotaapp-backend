const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const salaries = await prisma.salary.findMany({
        orderBy: {
            createdAt: 'desc'
        }
    });
    console.log('Salaries found:', JSON.stringify(salaries, null, 2));
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
