import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query

  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const product = await prisma.product.findUnique({ where: { id: Number(id) } })
    if (!product) return res.status(404).json({ error: 'Category not found' })

    const updated = await prisma.product.update({
      where: { id: Number(id) },
      data: { alwaysClosed: !product.alwaysClosed },
    })

    return res.status(200).json({ success: true, product: updated })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
