/**
 * Zod com JIT desligado.
 * Por padrão o Zod 4 testa `new Function(...)` para acelerar validações; com a CSP aplicada
 * (sem 'unsafe-eval') isso gera violação e erro no console do navegador. O modo jitless
 * evita a sondagem, sem mudar nenhuma regra de validação.
 */
import { z } from "zod";

z.config({ jitless: true });

export { z };
