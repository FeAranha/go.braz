import '@fastify/jwt';

declare module 'fastify' {
  interface FastifyRequest {
    jwtVerify<T = unknown>(): Promise<T>;
  }

  interface FastifyReply {
    jwtSign(payload: object, options?: import('@fastify/jwt').FastifySignOptions): Promise<string>;
  }
}