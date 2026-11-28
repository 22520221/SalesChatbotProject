
const express = require("express");
const router = express.Router();

const policyController = require("../controllers/policyController");

// GET all policies
router.get("/", policyController.getAllPolicies);

// GET policy by ID
router.get("/:id", policyController.getPolicyById);

// POST create policy
router.post("/", policyController.createPolicy);

// PUT update policy
router.put("/:id", policyController.updatePolicy);

// DELETE soft delete policy
router.delete("/:id", policyController.deletePolicy);

module.exports = router;
