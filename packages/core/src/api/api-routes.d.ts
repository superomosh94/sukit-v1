import type { APIRoute, RequestHandler } from '../types';
export declare function createAPIRoutesAPI(): {
  get(path: string, handler: RequestHandler): void;
  post(path: string, handler: RequestHandler): void;
  put(path: string, handler: RequestHandler): void;
  delete(path: string, handler: RequestHandler): void;
  getRoute(path: string, method: string): APIRoute | undefined;
  getAll(): APIRoute[];
  handleRequest(
    req: Request,
    params: Record<string, string>
  ): Promise<Response | null>;
};
export type APIRoutesAPI = ReturnType<typeof createAPIRoutesAPI>;
