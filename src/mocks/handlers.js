import { rest } from 'msw'

export const handlers = [
  rest.post('https://api-orderwise.qbitsinc.com/api/promotions', async (req, res, ctx) => {
    const body = await req.json()

    console.log('--- MSW: Intercepted POST /api/promotions ---')
    console.log('Received Payload:', body)

    // Basic validation
    if (!body.name || typeof body.finalPrice === 'undefined') {
      console.error('MSW: Validation failed. Name or finalPrice missing.')
      return res(
        ctx.status(400),
        ctx.json({ error: 'Bad Request: Missing required fields.' })
      )
    }

    // Simulate a successful response
    const response = {
      ...body,
      id: `promo_${Date.now()}`,
      createdAt: new Date().toISOString()
    }

    console.log('MSW: Responding with:', response)
    console.log('-------------------------------------------------')

    return res(
      ctx.status(201),
      ctx.json(response)
    )
  })
]
