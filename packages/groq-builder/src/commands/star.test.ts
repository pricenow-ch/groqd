import { describe, it, expect } from "vitest";
import { SchemaConfig } from "../tests/schemas/nextjs-sanity-fe";
import { expectType } from "../tests/expectType";
import { InferResultType } from "../types/public-types";
import { createGroqBuilder } from "../index";
import { executeBuilder } from "../tests/mocks/executeQuery";
import { mock } from "../tests/mocks/nextjs-sanity-fe-mocks";

const q = createGroqBuilder<SchemaConfig>();

describe("star", () => {
  const star = q.star;

  it("should have the correct type, matching all documents", () => {
    expectType<InferResultType<typeof star>>().toStrictEqual<
      Array<SchemaConfig["documentTypes"]>
    >();
  });
  it("the query should be '*'", () => {
    expect(star).toMatchObject({
      query: "*",
    });
  });

  describe("execution", () => {
    it("should retrieve all documents", async () => {
      const data = mock.generateSeedData({});
      const result = await executeBuilder(q.star, data.datalake);

      // I mean, this should be sufficient, right?
      expect(result).toEqual(data.datalake);
    });
  });
});
