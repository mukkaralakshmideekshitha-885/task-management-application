"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const taskController_1 = require("../controllers/taskController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// All task routes require authentication
router.use(auth_1.authenticateToken);
router.get('/', taskController_1.getTasks);
router.get('/stats', taskController_1.getTaskStats);
router.get('/:id', taskController_1.getTaskById);
router.post('/', taskController_1.createTask);
router.put('/:id', taskController_1.updateTask);
router.delete('/:id', taskController_1.deleteTask);
exports.default = router;
