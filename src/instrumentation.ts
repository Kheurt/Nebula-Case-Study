import { initOtel } from '@/lib/otel';

/**
 * Next.js instrumentation hook — exécuté au démarrage du serveur.
 * Initialise OpenTelemetry avant tout autre code applicatif.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    initOtel();
  }
}
