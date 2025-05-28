import localData from "../data/data.json";
import { Athlete } from "../types/athlete";

class IdGenerator {
  private currentId = 0;

  reset() {
    this.currentId = 0;
  }

  next(): number {
    return ++this.currentId;
  }
}

const idGenerator = new IdGenerator();

function attachId(data: Omit<Athlete, "id">[]): Athlete[] {
  return data.map((item) => ({
    ...item,
    id: idGenerator.next(),
  }));
}

export async function fetchData(): Promise<Athlete[]> {
  idGenerator.reset();
  return attachId(localData);
}

export async function fetchLargeData(): Promise<Athlete[]> {
  idGenerator.reset();

  const response = await fetch(
    "https://raw.githubusercontent.com/ag-grid/ag-grid-docs/master/src/olympicWinnersSmall.json"
  );

  if (!response.ok) {
    throw new Error("Failed to fetch remote data");
  }

  const data = (await response.json()) as Omit<Athlete, "id">[];
  return attachId(data);
}
