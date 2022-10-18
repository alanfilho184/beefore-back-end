"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const verifyToken_middleware_1 = require("./verifyToken.middleware");
const router = express_1.default.Router();
router.use(verifyToken_middleware_1.verifyToken);
exports.default = router;
