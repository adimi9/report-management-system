import prisma from "./src/lib/prisma"

await prisma.user.createMany({
  data: [
    { email: "admin@servihub.com", role: "admin", name: "Admin User", password: "password" },
    { email: "user1@servihub.com", name: "User One", password: "password" },
  ],
})

await prisma.report.create({
  data: {
    type: "review",
    target_id: 101,
    reason: "Spam content",
    submitted_by: 2
  }
})