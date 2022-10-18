"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cache = void 0;
const kami_lru_cache_1 = require("@alanfilho184/kami-lru-cache");
const database_1 = __importDefault(require("../../config/database"));
const luxon_1 = require("luxon");
const syncCode_controller_1 = __importDefault(require("../../controllers/syncCode.controller"));
const syncCodeController = new syncCode_controller_1.default(database_1.default);
const cache = new kami_lru_cache_1.kami_cache({ maxAge: 1000 * 60 * 10, rateOfVerifyAgedKeys: 1000 * 15, updateAgeOnGet: false });
exports.cache = cache;
syncCodeController.deleteAllExpired()
    .then(() => {
    syncCodeController.getAll()
        .then(codes => {
        codes.forEach((code) => {
            cache.set(code.code, {
                telegramid: code.telegramid,
                expiration: code.expiration
            });
        });
        cache.events.on('keySet', async (key) => {
            const codeInfo = cache.get(key);
            try {
                await syncCodeController.create({
                    code: key,
                    telegramid: codeInfo.telegramid,
                    expiration: codeInfo.expiration
                });
            }
            catch (err) { }
        });
        const deleteFromDb = async (key) => {
            await syncCodeController.deleteByCode(key);
        };
        cache.events.on('keyAutoDelete', deleteFromDb);
        cache.events.on('keyDelete', deleteFromDb);
    });
});
function codeGenerator(telegramid) {
    let code = "0";
    cache.map.forEach((jsonCodeInfo) => {
        const codeInfo = JSON.parse(jsonCodeInfo);
        if (codeInfo.content.telegramid == telegramid) {
            code = codeInfo.key;
            return code;
        }
    });
    if (code == "0") {
        do {
            code = Math.floor((Math.random() * 99999999)).toString();
        } while (cache.has(code));
        cache.set(code, {
            telegramid: telegramid,
            expiration: luxon_1.DateTime.fromMillis(luxon_1.DateTime.now().setZone('America/Fortaleza').toMillis() + 1000 * 60 * 10).setZone('America/Fortaleza').toISO()
        });
    }
    return code;
}
exports.default = codeGenerator;
