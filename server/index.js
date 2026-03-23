import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import paymentRoutes from './routes/payment.js'
import orderRoutes   from './routes/orders.js'
import productRoutes from './routes/products.js'

dotenv.config()

const app = express()

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }))

app.use(express.json())

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/payment',  paymentRoutes)
app.use('/api/orders',   orderRoutes)
app.use('/api/products', productRoutes)

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ message: 'ShopSphere API is running ✅', version: '1.0.0' })
})

// ── Start server ──────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
})