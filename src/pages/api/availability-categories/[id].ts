import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query

  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const category = await prisma.category.findUnique({ where: { id: Number(id) } })
    if (!category) return res.status(404).json({ error: 'Category not found' })

    const updated = await prisma.category.update({
      where: { id: Number(id) },
      data: { alwaysClosed: !category.alwaysClosed },
    })

    return res.status(200).json({ success: true, category: updated })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
