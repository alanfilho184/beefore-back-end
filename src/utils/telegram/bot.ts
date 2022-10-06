import { Context, Telegraf } from "telegraf";

const bot = new Telegraf(`${process.env.BOT_TOKEN}`)

bot.command('sincronizar', (ctx: Context) => {
    ctx.replyWithMarkdownV2(`
*Para sincronizar esta conta do Telegram com sua conta Beefore, acesse o link abaixo e faça login com a conta que deseja sincronizar\\!*

[Clique aqui para ir para Beefore](beefore.netlify.app/sincronizar?code=${123})

*Seu código de sincronização é:*
*_${123}_*

*__Não compartilhe este código com ninguém__*
    `)
})

export default bot