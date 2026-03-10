// server/index.js
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
dotenv.config()

const app = express()
app.use(cors({ origin: 'http://localhost:5173' }))  // React dev server
app.use(express.json())

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'ShopSphere API running ✅' })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))