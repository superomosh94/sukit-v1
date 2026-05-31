type RequestOptions = {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
  params?: Record<string, string>;
};

type ApiResponse<T> = {
  data: T;
  error?: never;
} | {
  data?: never;
  error: { message: string; code: string; status: number };
};

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = "/api") {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    path: string,
    options: RequestOptions = {},
  ): Promise<T> {
    const { method = "GET", body, headers = {}, params } = options;

    let url = `${this.baseUrl}${path}`;
    if (params) {
      const searchParams = new URLSearchParams(params);
      url += `?${searchParams.toString()}`;
    }

    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const json: ApiResponse<T> = await response.json();

    if (!response.ok || json.error) {
      throw new Error(json.error?.message ?? "Request failed");
    }

    return json.data;
  }

  get<T>(path: string, params?: Record<string, string>) {
    return this.request<T>(path, { params });
  }

  post<T>(path: string, body?: unknown) {
    return this.request<T>(path, { method: "POST", body });
  }

  put<T>(path: string, body?: unknown) {
    return this.request<T>(path, { method: "PUT", body });
  }

  delete<T>(path: string) {
    return this.request<T>(path, { method: "DELETE" });
  }
}

export const api = new ApiClient();
