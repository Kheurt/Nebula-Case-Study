import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { ConsoleSpanExporter, SimpleSpanProcessor } from '@opentelemetry/sdk-trace-node';

let sdk: NodeSDK | null = null;

/**
 * Initialise le SDK OpenTelemetry.
 * Utilise ConsoleSpanExporter uniquement si OTEL_ENABLE=true.
 * En production, configurer OTEL_EXPORTER_OTLP_ENDPOINT pour un vrai exporter.
 */
export function initOtel() {
  if (sdk) return;

  const enableConsole = process.env.OTEL_ENABLE === 'true';
  const spanProcessors = enableConsole
    ? [new SimpleSpanProcessor(new ConsoleSpanExporter())]
    : [];

  sdk = new NodeSDK({
    spanProcessors,
    instrumentations: [
      getNodeAutoInstrumentations({
        // Désactiver les instrumentations trop verbeuses en dev
        '@opentelemetry/instrumentation-undici': { enabled: enableConsole },
        '@opentelemetry/instrumentation-fs': { enabled: false },
      }),
    ],
    serviceName: process.env.OTEL_SERVICE_NAME ?? 'nebula-platform',
  });

  sdk.start();
}

export function shutdownOtel() {
  if (sdk) {
    sdk.shutdown().catch(console.error);
    sdk = null;
  }
}