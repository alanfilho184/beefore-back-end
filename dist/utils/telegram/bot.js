"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const telegraf_1 = require("telegraf");
const codeGenerator_1 = __importDefault(require("./codeGenerator"));
const bot = new telegraf_1.Telegraf(`${process.env.BOT_TOKEN}`);
bot.command('sincronizar', async (ctx) => {
    const code = await (0, codeGenerator_1.default)(`${ctx.chat?.id}` || '0');
    ctx.replyWithMarkdownV2(`
*Para sincronizar esta conta do Telegram com sua conta Beefore, acesse o link abaixo e faça login com a conta que deseja sincronizar\\!*

[Clique aqui para ir para Beefore](beefore.netlify.app/sincronizar?code=${code})

*Seu código de sincronização é:*
*_${code}_*

*__Não compartilhe este código com ninguém__*
    `);
});
exports.default = bot;
