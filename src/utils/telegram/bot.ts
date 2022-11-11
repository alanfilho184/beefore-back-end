import { Context, Telegraf } from 'telegraf'
import codeGenerator from './codeGenerator'

const bot = new Telegraf(`${process.env.BOT_TOKEN}`)

bot.command('sincronizar', async (ctx: Context) => {
    const code = await codeGenerator(`${ctx.chat?.id}` || '0')

    ctx.replyWithMarkdownV2(`
*Para sincronizar esta conta do Telegram com sua conta Beefore, acesse o link abaixo e faça login com a conta que deseja sincronizar\\!*

[Clique aqui para ir para Beefore](beefore.netlify.app/sincronizar?code=${code})

*Seu código de sincronização é:*
*_${code}_*

*__Não compartilhe este código com ninguém__*
    `)
})

export default bot
