// pages/api/update-user-details.js
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { floor, bellName, comment, userEmail } = req.body;

  if (!userEmail) {
    return res.status(400).json({ error: "Missing userEmail" });
  }

  try {
    const updatedUser = await prisma.user.update({ 
        where: { email: userEmail }, 
        data: { floor, bellName, comment } 
    });

    res.status(200).json({ success: true, user: updatedUser, message: "User details updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update user details" });
  }
}
