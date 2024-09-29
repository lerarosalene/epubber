export function typeId(object: any) {
  const type = typeof object;
  switch (type) {
    case "bigint":
    case "boolean":
    case "number":
    case "string":
    case "symbol":
    case "undefined":
      return type;
    case "object":
      return Object.getPrototypeOf(type)?.constructor?.name ?? "object";
    case "function":
      return `function ${object.name}`;
    default:
      const _exhaustive: never = type;
      _exhaustive;
  }
}
