import { rest } from 'msw'

export const handlers = [
  // Handles a POST /api/promotions request
  rest.post('https://api-orderwise.qbitsinc.com/api/promotions', (req, res, ctx) => {
    // Log the request body to the console for debugging
    console.log('MSW: Received promotion data:', req.body)

    // Respond with a 201 status code (Created)
    // and return the posted data, adding a mock ID
    return res(
      ctx.status(201),
      ctx.json({
        ...req.body,
        id: `promo_${Date.now()}` // Simulate a database-generated ID
      })
    )
  })]
