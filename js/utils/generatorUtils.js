// Task 1
export function* roundRobinGenerator(items) {
  let index = 0;
  while (true) {
    yield items[index];
    index = (index + 1) % items.length;
  }
}

export function* muscleGroupRecommender(items, excludeSet = new Set()) {
  const generator = roundRobinGenerator(items);
  while (true) {
    const candidate = generator.next().value;
    if (!excludeSet.has(candidate)) {
      yield candidate;
      excludeSet.add(candidate);

      if (excludeSet.size === items.length) {
        excludeSet.clear();
      }
    }
  }
}

export async function timeoutIterator(iterator, timeoutSeconds, processFn = console.log) {
  const start = Date.now();
  while ((Date.now() - start) / 1000 < timeoutSeconds) {
    const next = iterator.next();
    if (next.done) break;

    processFn(next.value);
    await new Promise((r) => setTimeout(r, 500)); 
  }
}