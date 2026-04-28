import { RabbitMQEventBus } from "../src/infrastructure/events/RabbitMQEventBus.js";

async function testConnection() {
  const eventBus = new RabbitMQEventBus();

  try {
    console.log("[Test] Intentando conectar a RabbitMQ...");
    await eventBus.connect();

    console.log("[Test] Conexión exitosa. Emitiendo evento de prueba...");
    eventBus.emit("test.event", { message: "Hola desde test-rabbitmq.ts", timestamp: new Date().toISOString() });

    console.log("[Test] Evento emitido. Esperando 2 segundos para procesar...");

    // Registrar listener para verificar recepción
    eventBus.on("test.event", (payload: unknown) => {
      console.log("[Test] Evento recibido:", payload);
    });

    await new Promise((resolve) => setTimeout(resolve, 2000));

    console.log("[Test] Cerrando conexión...");
    await eventBus.disconnect();
    console.log("[Test] Desconectado. Todo OK.");
    process.exit(0);
  } catch (err) {
    console.error("[Test] Error:", err);
    process.exit(1);
  }
}

testConnection();
