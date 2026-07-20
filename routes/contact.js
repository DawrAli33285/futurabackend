const express = require("express");
const router = express.Router();
const { contactUs } = require("../controllers/contact");

router.post("/", contactUs);

module.exports = router;