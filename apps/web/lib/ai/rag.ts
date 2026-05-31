export interface Chunk {
  id: string;
  content: string;
  metadata: Record<string, unknown>;
}

export function chunkDocument(
  text: string,
  chunkSize: number = 1000,
  overlap: number = 200,
): Chunk[] {
  const chunks: Chunk[] = [];
  let start = 0;

  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    const content = text.slice(start, end);

    chunks.push({
      id: `chunk-${chunks.length}`,
      content,
      metadata: { start, end },
    });

    start += chunkSize - overlap;
  }

  return chunks;
}

export async function generateEmbeddings(
  texts: string[],
): Promise<number[][]> {
  const { getOpenAIClient } = await import("./client");
  const client = getOpenAIClient();

  const response = await client.embeddings.create({
    model: "text-embedding-3-small",
    input: texts,
  });

  return response.data.map((item) => item.embedding);
}

export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  const magnitude = Math.sqrt(normA) * Math.sqrt(normB);
  return magnitude === 0 ? 0 : dotProduct / magnitude;
}

export function findSimilarChunks(
  queryEmbedding: number[],
  chunkEmbeddings: Array<{ id: string; embedding: number[] }>,
  topK: number = 5,
): Array<{ id: string; score: number }> {
  const scored = chunkEmbeddings.map((item) => ({
    id: item.id,
    score: cosineSimilarity(queryEmbedding, item.embedding),
  }));

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topK);
}
