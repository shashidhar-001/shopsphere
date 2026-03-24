import express from 'express'
import { supabase } from '../supabase.js'
import { authenticate, adminGuard } from '../middleware/auth.js'

const router = express.Router()

// ── Save Order after successful payment ───────────────────────────────────────
router.post('/save', authenticate, async (req, res) => {
  try {
    const { items, shippingAddress, paymentIntentId, total } = req.body

    // 1. Create the order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id:          req.user.id,
        status:           'pending',
        total:            total,
        shipping_address: shippingAddress,
        payment_intent_id: paymentIntentId,
      })
      .select()
      .single()

    if (orderError) throw orderError

    // 2. Save each order item
    const orderItems = items.map(item => ({
      order_id:   order.id,
      product_id: item.id,
      quantity:   item.qty,
      price:      item.price,
    }))

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)

    if (itemsError) throw itemsError

    // 3. Clear the user's cart from Supabase
    await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', req.user.id)

    res.json({
      success: true,
      orderId: order.id,
      message: 'Order saved successfully'
    })
  } catch (err) {
    console.error('Save order error:', err)
    res.status(500).json({ error: err.message })
  }
})

// ── Get User's Orders ─────────────────────────────────────────────────────────
router.get('/my-orders', authenticate, async (req, res) => {
  try {
    // Step 1 — Get orders
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false })

    if (ordersError) throw ordersError

    // Step 2 — Get order items for each order separately
    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        const { data: items, error: itemsError } = await supabase
          .from('order_items')
          .select('*')
          .eq('order_id', order.id)

        return {
          ...order,
          order_items: itemsError ? [] : items,
        }
      })
    )

    res.json({ orders: ordersWithItems })
  } catch (err) {
    console.error('Fetch orders error:', err)
    res.status(500).json({ error: err.message })
  }
})

// ── Get Single Order ──────────────────────────────────────────────────────────
router.get('/:orderId', authenticate, async (req, res) => {
  try {
    const { data: order, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          products (name, images, price, category)
        )
      `)
      .eq('id', req.params.orderId)
      .eq('user_id', req.user.id) // users can only see their own orders
      .single()

    if (error) throw error
    if (!order) return res.status(404).json({ error: 'Order not found' })

    res.json({ order })
  } catch (err) {
    console.error('Fetch order error:', err)
    res.status(500).json({ error: err.message })
  }
})

// ── Admin: Get All Orders ─────────────────────────────────────────────────────
router.get('/', authenticate, adminGuard, async (req, res) => {
  try {
    const { data: orders, error } = await supabase
      .from('orders')
      .select(`
        *,
        profiles (full_name),
        order_items (quantity, price)
      `)
      .order('created_at', { ascending: false })

    if (error) throw error

    res.json({ orders })
  } catch (err) {
    console.error('Admin fetch orders error:', err)
    res.status(500).json({ error: err.message })
  }
})

// ── Admin: Update Order Status ────────────────────────────────────────────────
router.patch('/:orderId/status', authenticate, adminGuard, async (req, res) => {
  try {
    const { status } = req.body
    const validStatuses = ['pending', 'shipped', 'delivered', 'cancelled']

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' })
    }

    const { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', req.params.orderId)
      .select()
      .single()

    if (error) throw error

    res.json({ success: true, order: data })
  } catch (err) {
    console.error('Update order status error:', err)
    res.status(500).json({ error: err.message })
  }
})

export default router