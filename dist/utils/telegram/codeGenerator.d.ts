import { kami_cache } from "@alanfilho184/kami-lru-cache";
declare const cache: kami_cache;
declare function codeGenerator(telegramid: string): string;
export default codeGenerator;
export { cache };
