import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query

  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { open, close } = req.body

    if (!open || !close) {
      return res.status(400).json({ error: 'Missing fields' })
    }

    const updatedProduct = await prisma.product.update({
      where: { id: Number(id) }, // 👈 convert id to number if your Prisma model uses Int
      data: {
        openHour: open,
        closeHour: close,
      },
    })

    console.log(`✅ Updated category ${id} -> Open: ${open}, Close: ${close}`)

    return res.status(200).json({
      success: true,
      message: `Hours updated for category ${id}`,
      hours: { open, close },
      product: updatedProduct,
    })
  } catch (error) {
    console.error('❌ Error updating category hours:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
