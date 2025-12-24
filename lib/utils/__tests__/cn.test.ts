/**
 * cn工具函数测试
 */

import { cn } from "../cn";

describe("cn工具函数", () => {
  it("应该合并多个类名", () => {
    const result = cn("class1", "class2", "class3");
    expect(result).toContain("class1");
    expect(result).toContain("class2");
    expect(result).toContain("class3");
  });

  it("应该处理条件类名", () => {
    const result = cn("base", true && "conditional", false && "hidden");
    expect(result).toContain("base");
    expect(result).toContain("conditional");
    expect(result).not.toContain("hidden");
  });

  it("应该处理数组类名", () => {
    const result = cn(["class1", "class2"], "class3");
    expect(result).toContain("class1");
    expect(result).toContain("class2");
    expect(result).toContain("class3");
  });

  it("应该处理对象类名", () => {
    const result = cn({
      class1: true,
      class2: false,
      class3: true,
    });
    expect(result).toContain("class1");
    expect(result).not.toContain("class2");
    expect(result).toContain("class3");
  });

  it("应该处理Tailwind冲突类名", () => {
    // tailwind-merge 应该合并冲突的类名
    const result = cn("p-4", "p-6");
    // 应该只保留最后一个
    expect(result).toContain("p-6");
    expect(result).not.toContain("p-4");
  });

  it("应该处理空值和undefined", () => {
    const result = cn("base", null, undefined, "end");
    expect(result).toContain("base");
    expect(result).toContain("end");
  });
});

