"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
app.get('/healthcheck', (req, res) => {
    res.json({ 'status': 'healthy' });
});
app.listen(3000, () => { console.log('Started express server on port 3000.'); });
