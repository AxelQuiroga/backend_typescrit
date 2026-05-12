import amqp from "amqplib";
import type { EventBus } from "../../domain/events/EventBus.js";
import { env } from "../../config/env.js";

type Handler = (payload: unknown) => void | Promise<void>;

export class RabbitMQEventBus implements EventBus {
  private connection?: Awaited<ReturnType<typeof amqp.connect>>;
  private channel?: amqp.Channel;
  private connected = false;
  private handlers = new Map<string, Handler[]>();
  private isSubscribed = false;
  private pendingMessages: Array<{ event: string; payload: unknown }> = [];

  async connect(): Promise<void> {
    try {
      this.connection = await amqp.connect(env.RABBITMQ_URL);
      this.channel = await this.connection.createChannel();
      
      // Aseguramos la cola compartida
      await this.channel.assertQueue("notifications", { durable: true });
      this.connected = true;
      console.log("[RabbitMQ] Conectado y listo para despachar");

      // Si ya se registraron handlers antes de conectar, arrancamos el worker
      if (this.handlers.size > 0) {
        this.startConsuming();
      }

      // Despachamos lo que quedó pendiente de enviar
      for (const { event, payload } of this.pendingMessages) {
        this.publish(event, payload);
      }
      this.pendingMessages = [];

      this.connection.on("error", (err) => {
        console.error("[RabbitMQ] Error de conexión:", err.message);
        this.connected = false;
        this.isSubscribed = false;
      });

    } catch (err) {
      console.error("[RabbitMQ] Error al conectar:", err);
      throw err;
    }
  }

  emit(event: string, payload: unknown): void {
    if (!this.channel || !this.connected) {
      this.pendingMessages.push({ event, payload });
      return;
    }
    this.publish(event, payload);
  }

  private publish(event: string, payload: unknown): void {
    if (!this.channel) return;
    const buffer = Buffer.from(JSON.stringify({ event, payload }));
    this.channel.sendToQueue("notifications", buffer, {
      persistent: true,
      deliveryMode: 2,
    });
  }

  on(event: string, handler: Handler): void {
    const eventHandlers = this.handlers.get(event) || [];
    eventHandlers.push(handler);
    this.handlers.set(event, eventHandlers);

    if (this.connected && !this.isSubscribed) {
      this.startConsuming();
    }
  }

  private async startConsuming() {
    if (this.isSubscribed || !this.channel) return;
    this.isSubscribed = true;

    console.log("[RabbitMQ] Worker de despacho iniciado");

    await this.channel.consume("notifications", async (msg) => {
      if (!msg) return;

      try {
        const content = JSON.parse(msg.content.toString());
        const targetHandlers = this.handlers.get(content.event);

        if (targetHandlers && targetHandlers.length > 0) {
          // Avisamos a todos los que estén escuchando este evento
          await Promise.all(targetHandlers.map(h => h(content.payload)));
        }

        this.channel!.ack(msg);
      } catch (err) {
        console.error("[RabbitMQ] Error en dispatcher:", err);
        this.channel!.nack(msg, false, false);
      }
    });
  }

  async disconnect(): Promise<void> {
    await this.channel?.close();
    await this.connection?.close();
    this.connected = false;
    this.isSubscribed = false;
    console.log("[RabbitMQ] Desconectado");
  }
}
