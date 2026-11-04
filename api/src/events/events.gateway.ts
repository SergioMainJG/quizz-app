import type { OnGatewayConnection } from "@nestjs/websockets";
import type { Socket } from "socket.io";

import { Logger } from "@nestjs/common";
import { MessageBody, SubscribeMessage, WebSocketGateway } from "@nestjs/websockets";

@WebSocketGateway({ cors: { origin: process.env.DOMAIN_ORIGIN ?? false } })
export class EventsGateway implements OnGatewayConnection {
  private readonly logger = new Logger(EventsGateway.name);

  handleConnection(client: Socket): void {
    this.logger.debug(`Client connected: ${client.id}`);
  }

  @SubscribeMessage("ping")
  ping(@MessageBody() data: unknown): { data: unknown; event: string } {
    return { data, event: "pong" };
  }
}
