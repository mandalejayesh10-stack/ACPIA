import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import amqp from 'amqplib'

export interface BusEvent<T = unknown> {
  eventId: string
  topic: string
  timestamp: string
  traceId: string
  correlationId: string
  caseId: string
  source: {
    service: string
    version: string
  }
  payload: T
}

@Injectable()
export class EventBusService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(EventBusService.name)
  private connection?: amqp.ChannelModel
  private channel?: amqp.Channel

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    const url = this.configService.get<string>(
      'RABBITMQ_URL',
      'amqp://acpia_bus:acpia_rabbitmq_password_2026@localhost:5672'
    )

    try {
      this.connection = await amqp.connect(url)
      this.channel = await this.connection.createChannel()
      this.logger.log(`Connected to RabbitMQ Event Bus at ${url}`)

      await this.initializeExchanges()
    } catch (err) {
      this.logger.warn(`RabbitMQ standby mode active: ${(err as Error).message}`)
    }
  }

  async onModuleDestroy() {
    if (this.channel) {
      await this.channel.close()
    }
    if (this.connection) {
      await this.connection.close()
    }
  }

  /**
   * Initializes topic exchanges per EVENT_BUS.md
   */
  private async initializeExchanges(): Promise<void> {
    if (!this.channel) return
    try {
      const exchanges = ['acpia.agents', 'acpia.cases', 'acpia.evidence', 'acpia.pipeline']
      for (const exchange of exchanges) {
        await this.channel.assertExchange(exchange, 'topic', { durable: true })
      }

      // Assert Dead Letter Exchange per EVENT_BUS.md
      await this.channel.assertExchange('acpia.dlx', 'direct', { durable: true })

      this.logger.log('RabbitMQ topic exchanges and DLX initialized successfully')
    } catch (err) {
      this.logger.warn(`Exchange setup deferred: ${(err as Error).message}`)
    }
  }

  /**
   * Publish event envelope to RabbitMQ exchange
   */
  async publish<T>(
    exchange: string,
    topic: string,
    event: Omit<BusEvent<T>, 'eventId' | 'timestamp'>
  ): Promise<boolean> {
    if (!this.channel) {
      this.logger.warn(`Event bus in standby mode, event '${topic}' not dispatched`)
      return false
    }

    try {
      const fullEvent: BusEvent<T> = {
        ...event,
        eventId: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
      }

      const buffer = Buffer.from(JSON.stringify(fullEvent))
      return this.channel.publish(exchange, topic, buffer, {
        persistent: true,
        contentType: 'application/json',
      })
    } catch (err) {
      this.logger.error(`Failed to publish event to ${topic}: ${(err as Error).message}`)
      return false
    }
  }

  /**
   * Subscribe worker queue to a topic pattern
   */
  async subscribe<T>(
    exchange: string,
    queueName: string,
    topicPattern: string,
    handler: (event: BusEvent<T>) => Promise<void>
  ): Promise<void> {
    if (!this.channel) return

    try {
      await this.channel.assertQueue(queueName, { durable: true })
      await this.channel.bindQueue(queueName, exchange, topicPattern)

      await this.channel.consume(queueName, async (msg) => {
        if (!msg) return
        try {
          const content = msg.content.toString()
          const event = JSON.parse(content) as BusEvent<T>
          await handler(event)
          this.channel?.ack(msg)
        } catch (err) {
          this.logger.error(`Error processing message from ${queueName}: ${(err as Error).message}`)
          this.channel?.nack(msg, false, false) // Send to DLX
        }
      })

      this.logger.log(`Subscribed queue '${queueName}' to topic pattern '${topicPattern}'`)
    } catch (err) {
      this.logger.error(`Subscription failed for queue ${queueName}: ${(err as Error).message}`)
    }
  }
}
