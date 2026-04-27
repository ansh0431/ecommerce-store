const express = require("express")
const router = express.Router()
const auth = require("../middleware/auth")
const { getAdminStats } = require("../controllers/adminController")

router.get("/stats", auth, getAdminStats)

module.exports = router
