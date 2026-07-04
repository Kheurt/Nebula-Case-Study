import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { ConsoleSpanExporter } from '@opentelemetry/sdk-trace-node';

let sdk: NodeSDK | null = null;

/**
 * Initialise le SDK OpenTelemetry pour tracer les opérations critiques.
 * En production, remplacer ConsoleSpanExporter par un exporter OTLP/Jaeger.
 */
export function initOtel() {
  if (sdk) return;

  sdk = new NodeSDK({
    traceExporter: new ConsoleSpanExporter(),
    instrumentations: [getNodeAutoInstrumentations()],
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