import * as groqJs from "groq-js";
import { makeSafeQueryRunner } from "../../index";

type Datalake = Array<object>;

export const executeBuilder = makeSafeQueryRunner(
  async (query: string, datalake: Datalake, params = {}) =>
    await executeQuery(query, datalake, params)
);

export async function executeQuery(
  query: string,
  dataset: Datalake,
  params: Record<string, string>
): Promise<unknown> {
  try {
    const parsed = groqJs.parse(query, { params });
    const streamResult = await groqJs.evaluate(parsed, { dataset, params });
    const start = Date.now();
    const result = await streamResult.get();

    const INEFFICIENT_QUERY_THRESHOLD = 5_000;
    const elapsed = Date.now() - start;
    if (elapsed >= INEFFICIENT_QUERY_THRESHOLD) {
      // Issue a warning!
      console.warn(`
        [groq-handler] WARNING: this query took ${elapsed} ms to mock execute.
        This usually indicates an inefficient query, and you should consider improving it.
        ${
          query.includes("&&")
            ? "Instead of using [a && b], consider using [a][b] instead!"
            : ""
        }
        Inefficient query: \n${query}
    `);
    }
    return result;
  } catch (e) {
    const err = e as Error;
    if (err.message.includes("Syntax error in GROQ query at position ")) {
      throw new Error(
        `Syntax err for query: ${JSON.stringify(query)}\n${err.message}`
      );
    }
    throw err;
  }
}
