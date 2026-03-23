import express from 'express'
import { supabase } from '../supabase.js'
import { authenticate } from '../middleware/auth.js'

const router = express.Router()

router.post('/place-order', authenticate, async (req, res) => {
  try {
    const { items, shippingAddress, total } = req.body

    // Save order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id:          req.user.id,
        status:           'pending',
        total:            total,
        shipping_address: shippingAddress,
      })
      .select()
      .single()

    if (orderError) throw orderError

    // Save order items
    const orderItems = items.map(item => ({
      order_id:   order.id,
      product_id: item.id,
      quantity:   item.qty,
      price:      item.price,
    }))

    await supabase.from('order_items').insert(orderItems)

    // Clear cart
    await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', req.user.id)

    res.json({ success: true, orderId: order.id })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router