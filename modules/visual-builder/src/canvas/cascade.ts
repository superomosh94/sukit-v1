export interface CascadeGridConfig {
  columns: number;
  gap: number;
  maxWidth: number;
  containerPadding: number;
}

export interface CascadeColumn {
  id: string;
  gridCol: number;
  span: number;
  gridRow: number;
}

export function resolveCascadeColumns(
  columns: CascadeColumn[],
  config: CascadeGridConfig = {
    columns: 12,
    gap: 20,
    maxWidth: 1445,
    containerPadding: 30,
  }
): CascadeColumn[] {
  const sorted = [...columns].sort(
    (a, b) => a.gridRow - b.gridRow || a.gridCol - b.gridCol
  );
  const occupied = new Map<string, boolean>();

  const key = (row: number, col: number) => `${row}:${col}`;

  const isOccupied = (row: number, col: number, span: number): boolean => {
    for (let c = col; c < col + span; c++) {
      if (c > config.columns) return true;
      if (occupied.get(key(row, c))) return true;
    }
    return false;
  };

  const markOccupied = (row: number, col: number, span: number) => {
    for (let c = col; c < col + span; c++) {
      occupied.set(key(row, c), true);
    }
  };

  const resolved: CascadeColumn[] = [];

  for (const col of sorted) {
    let row = col.gridRow;
    let startCol = col.gridCol;

    while (isOccupied(row, startCol, col.span)) {
      startCol++;
      if (startCol + col.span > config.columns + 1) {
        startCol = 1;
        row++;
      }
    }

    markOccupied(row, startCol, col.span);
    resolved.push({ ...col, gridCol: startCol, gridRow: row });
  }

  return resolved;
}

export function getGridTemplate(
  columns: CascadeColumn[],
  config: CascadeGridConfig = {
    columns: 12,
    gap: 20,
    maxWidth: 1445,
    containerPadding: 30,
  }
): { gridTemplateColumns: string; gridTemplateRows: string } {
  if (columns.length === 0) {
    return {
      gridTemplateColumns: `repeat(${config.columns}, 1fr)`,
      gridTemplateRows: 'auto',
    };
  }

  const maxRow = Math.max(...columns.map((c) => c.gridRow));
  return {
    gridTemplateColumns: `repeat(${config.columns}, 1fr)`,
    gridTemplateRows: `repeat(${maxRow}, auto)`,
  };
}
