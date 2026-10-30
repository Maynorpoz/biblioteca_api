import 'dotenv/config';
import { z } from 'zod';

const esquemaEnv = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z
    .string({ error: 'DATABASE_URL es obligatoria' })
    .regex(/^postgres(ql)?:\/\//, 'DATABASE_URL debe iniciar con postgres:// o postgresql://'),
});

const resultado = esquemaEnv.safeParse(process.env);

if (!resultado.success) {
  console.error('Variables de entorno inválidas:', z.flattenError(resultado.error).fieldErrors);
  process.exit(1);
}

export const env = resultado.data;
