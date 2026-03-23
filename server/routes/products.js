import express from 'express'
import { supabase } from '../supabase.js'
import { authenticate, adminGuard } from '../middleware/auth.js'

const router = express.Router()

// ── Get All Products (public) ─────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const { category, search, sort } = req.query

    let query = supabase.from('products').select('*')

    if (category) query = query.eq('category', category)
    if (search)   query = query.ilike('name', `%${search}%`)

    if (sort === 'price_low')  query = query.order('price', { ascending: true })
    if (sort === 'price_high') query = query.order('price', { ascending: false })
    if (sort === 'rating')     query = query.order('rating', { ascending: false })
    else                       query = query.order('created_at', { ascending: false })

    const { data, error } = await query
    if (error) throw error

    res.json({ products: data })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ── Get Single Product (public) ───────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', req.params.id)
      .single()

    if (error) throw error
    if (!data) return res.status(404).json({ error: 'Product not found' })

    res.json({ product: data })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ── Admin: Add Product ────────────────────────────────────────────────────────
router.post('/', authenticate, adminGuard, async (req, res) => {
  try {
    const { name, description, price, originalPrice, stock, category, images, badge, brand } = req.body

    if (!name || !price) {
      return res.status(400).json({ error: 'Name and price are required' })
    }

    const { data, error } = await supabase
      .from('products')
      .insert({
        name,
        description,
        price:          +price,
        original_price: +(originalPrice || price),
        stock:          +(stock || 0),
        category,
        images:         images || [],
        badge,
        brand,
        rating:         0,
        review_count:   0,
      })
      .select()
      .single()

    if (error) throw error

    res.json({ success: true, product: data })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ── Admin: Update Product ─────────────────────────────────────────────────────
router.put('/:id', authenticate, adminGuard, async (req, res) => {
  try {
    const { name, description, price, originalPrice, stock, category, images, badge, brand } = req.body

    const { data, error } = await supabase
      .from('products')
      .update({
        name,
        description,
        price:          +price,
        original_price: +(originalPrice || price),
        stock:          +(stock || 0),
        category,
        images,
        badge,
        brand,
      })
      .eq('id', req.params.id)
      .select()
      .single()

    if (error) throw error

    res.json({ success: true, product: data })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ── Admin: Delete Product ─────────────────────────────────────────────────────
router.delete('/:id', authenticate, adminGuard, async (req, res) => {
  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', req.params.id)

    if (error) throw error

    res.json({ success: true, message: 'Product deleted' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router