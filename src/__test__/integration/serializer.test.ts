import { serializeTodo, serializeTodos } from "../../utils/serializer";

describe("serializeTodo", () => {
  it("should convert BigInt id to string", () => {
    const todo = { id: BigInt(1), userId: BigInt(10), name: "Test" };
    const result = serializeTodo(todo);
    expect(result.id).toBe("1");
    expect(typeof result.id).toBe("string");
  });

  it("should convert BigInt userId to string", () => {
    const todo = { id: BigInt(1), userId: BigInt(10), name: "Test" };
    const result = serializeTodo(todo);
    expect(result.userId).toBe("10");
    expect(typeof result.userId).toBe("string");
  });

  it("should preserve other fields", () => {
    const todo = { id: BigInt(1), userId: BigInt(10), name: "Test", status: true };
    const result = serializeTodo(todo);
    expect(result.name).toBe("Test");
    expect(result.status).toBe(true);
  });
});

describe("serializeTodos", () => {
  it("should serialize array of todos", () => {
    const todos = [
      { id: BigInt(1), userId: BigInt(10), name: "A" },
      { id: BigInt(2), userId: BigInt(10), name: "B" },
    ];
    const result = serializeTodos(todos);
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe("1");
    expect(result[1].id).toBe("2");
  });

  it("should return empty array for empty input", () => {
    expect(serializeTodos([])).toEqual([]);
  });
});