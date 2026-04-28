import amqp from "amqplib";
import type { EventBus } from "../../domain/events/EventBus.js";
import { env } from "../../config/env.js";

type Handler = (payload: unknown) => void | Promise<void>;

export class RabbitMQEventBus implements EventBus {
  private connection?: Awaited<ReturnType<typeof amqp.connect>>;
  private channel?: amqp.Channel;
  private connected = false;
  private pendingHandlers: Array<{ event: string; handler: Handler }> = [];
  private pendingMessages: Array<{ event: string; payload: unknown }> = [];

  async connect(): Promise<void> {
    try {
      this.connection = await amqp.connect(env.RABBITMQ_URL);
      this.channel = await this.connection.createChannel();
      await this.channel.assertQueue("notifications", { durable: true });
      this.connected = true;
      console.log("[RabbitMQ] Conectado y queue 'notifications' lista");

      this.connection.on("error", (err: Error) => {
        console.error("[RabbitMQ] Connection error:", err.message);
        this.connected = false;
      });

      this.connection.on("close", () => {
        console.warn("[RabbitMQ] Connection closed");
        this.connected = false;
      });

      // Registrar handlers pendientes que llegaron antes de la conexión
      for (const { event, handler } of this.pendingHandlers) {
        this.registerConsumer(event, handler);
      }
      this.pendingHandlers = [];

      // Emitir mensajes pendientes
      for (const { event, payload } of this.pendingMessages) {
        this.publish(event, payload);
      }
      this.pendingMessages = [];
    } catch (err: unknown) {
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
    if (!this.channel || !this.connected) {
      this.pendingHandlers.push({ event, handler });
      return;
    }
    this.registerConsumer(event, handler);
  }

  private registerConsumer(event: string, handler: Handler): void {
    if (!this.channel) return;

    this.channel.consume("notifications", (msg: amqp.ConsumeMessage | null) => {
      if (!msg) return;

      (async () => {
        try {
          const content = JSON.parse(msg.content.toString());
          if (content.event === event) {
            await handler(content.payload);
          }
          this.channel!.ack(msg);
        } catch (err: unknown) {
          console.error("[RabbitMQ] Error procesando mensaje:", err);
          this.channel!.nack(msg, false, false); // descartar, no requeue
        }
      })();
    });
  }

  async disconnect(): Promise<void> {
    await this.channel?.close();
    await this.connection?.close();
    this.connected = false;
    console.log("[RabbitMQ] Desconectado");
  }
}