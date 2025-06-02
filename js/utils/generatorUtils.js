// Task 1

export function* roundRobinGenerator(items) {
  let index = 0;
  while (true) {
    yield items[index];
    index = (index + 1) % items.length;
  }
}

/**
 * @param {Array<string>} items
 * @param {Set<string>} excludeSet 
 */
export function* muscleGroupRecommender(items, excludeSet) {
  const generator = roundRobinGenerator(items);
  let exhausted = false;

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
