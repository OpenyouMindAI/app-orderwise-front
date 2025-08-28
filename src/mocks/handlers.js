import { rest } from 'msw'
import mockPromotionAPI from '../services/mockPromotionAPI.js'

export const handlers = [
  // GET promotions
  rest.get('https://api-orderwise.qbitsinc.com/api/promotions', async (req, res, ctx) => {
    console.log('--- MSW: Intercepted GET /api/promotions ---')

    const url = new URL(req.url)
    const branchOfficeId = url.searchParams.get('branch_office_id')

    console.log('Branch Office ID:', branchOfficeId)

    try {
      const result = await mockPromotionAPI.getPromotions()

      console.log('MSW: Found promotions:', result.data.length)
      console.log('Promotions:', result.data)
      console.log('-------------------------------------------------')

      return res(
        ctx.status(200),
        ctx.json(result.data)
      )
    } catch (error) {
      console.error('MSW: Error fetching promotions:', error)
      return res(
        ctx.status(500),
        ctx.json({ error: 'Internal server error' })
      )
    }
  }),

  // POST promotions
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

    try {
      const result = await mockPromotionAPI.createPromotion(body)

      if (result.success) {
        console.log('MSW: Promotion created:', result.data)
        console.log('-------------------------------------------------')

        return res(
          ctx.status(201),
          ctx.json(result.data)
        )
      } else {
        console.error('MSW: Failed to create promotion:', result.error)
        return res(
          ctx.status(400),
          ctx.json({ error: result.error })
        )
      }
    } catch (error) {
      console.error('MSW: Error creating promotion:', error)
      return res(
        ctx.status(500),
        ctx.json({ error: 'Internal server error' })
      )
    }
  }),

  // PUT promotions/:id - Update promotion
  rest.put('https://api-orderwise.qbitsinc.com/api/promotions/:id', async (req, res, ctx) => {
    const { id } = req.params
    const body = await req.json()

    console.log('--- MSW: Intercepted PUT /api/promotions/' + id + ' ---')
    console.log('Received Update Payload:', body)

    try {
      const result = await mockPromotionAPI.updatePromotion(id, body)

      if (result.success) {
        console.log('MSW: Promotion updated:', result.data)
        console.log('-------------------------------------------------')

        return res(
          ctx.status(200),
          ctx.json(result.data)
        )
      } else {
        console.error('MSW: Failed to update promotion:', result.error)
        return res(
          ctx.status(404),
          ctx.json({ error: result.error })
        )
      }
    } catch (error) {
      console.error('MSW: Error updating promotion:', error)
      return res(
        ctx.status(500),
        ctx.json({ error: 'Internal server error' })
      )
    }
  }),

  // DELETE promotions/:id - Delete promotion
  rest.delete('https://api-orderwise.qbitsinc.com/api/promotions/:id', async (req, res, ctx) => {
    const { id } = req.params

    console.log('--- MSW: Intercepted DELETE /api/promotions/' + id + ' ---')

    try {
      const result = await mockPromotionAPI.deletePromotion(id)

      if (result.success) {
        console.log('MSW: Promotion deleted successfully')
        console.log('-------------------------------------------------')

        return res(
          ctx.status(200),
          ctx.json({ message: result.message })
        )
      } else {
        console.error('MSW: Failed to delete promotion:', result.error)
        return res(
          ctx.status(404),
          ctx.json({ error: result.error })
        )
      }
    } catch (error) {
      console.error('MSW: Error deleting promotion:', error)
      return res(
        ctx.status(500),
        ctx.json({ error: 'Internal server error' })
      )
    }
  })
]
