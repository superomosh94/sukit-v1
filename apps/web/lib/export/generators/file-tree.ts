export class FileTree {
  private files: Map<string, string | Uint8Array> = new Map();

  add(path: string, content: string | Uint8Array): void {
    this.files.set(path, content);
  }

  get(path: string): string | Uint8Array | undefined {
    return this.files.get(path);
  }

  getAll(): Array<{ path: string; content: string | Uint8Array }> {
    return Array.from(this.files.entries()).map(([path, content]) => ({
      path,
      content,
    }));
  }

  has(path: string): boolean {
    return this.files.has(path);
  }

  remove(path: string): boolean {
    return this.files.delete(path);
  }

  get size(): number {
    return this.files.size;
  }

  totalBytes(): number {
    let total = 0;
    for (const content of this.files.values()) {
      if (typeof content === 'string') {
        total += Buffer.byteLength(content, 'utf-8');
      } else {
        total += content.byteLength;
      }
    }
    return total;
  }
}
