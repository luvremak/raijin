// Task 4

export class BiDirectionalPriorityQueue {
  constructor() {
    this._items = [];
    this._counter = 0; 
  }

  enqueue(item, priority) {
    this._items.push({
      item,
      priority,
      insertedAt: this._counter++,
    });
  }

  _getHighestPriorityIndex() {
    if (this._items.length === 0) return -1;
    let maxPriority = this._items[0].priority;
    let maxIdx = 0;
    for (let i = 1; i < this._items.length; i++) {
      if (this._items[i].priority > maxPriority) {
        maxPriority = this._items[i].priority;
        maxIdx = i;
      }
    }
    return maxIdx;
  }

  _getLowestPriorityIndex() {
    if (this._items.length === 0) return -1;
    let minPriority = this._items[0].priority;
    let minIdx = 0;
    for (let i = 1; i < this._items.length; i++) {
      if (this._items[i].priority < minPriority) {
        minPriority = this._items[i].priority;
        minIdx = i;
      }
    }
    return minIdx;
  }

  _getOldestIndex() {
    if (this._items.length === 0) return -1;
    let minInsertedAt = this._items[0].insertedAt;
    let idx = 0;
    for (let i = 1; i < this._items.length; i++) {
      if (this._items[i].insertedAt < minInsertedAt) {
        minInsertedAt = this._items[i].insertedAt;
        idx = i;
      }
    }
    return idx;
  }

  _getNewestIndex() {
    if (this._items.length === 0) return -1;
    let maxInsertedAt = this._items[0].insertedAt;
    let idx = 0;
    for (let i = 1; i < this._items.length; i++) {
      if (this._items[i].insertedAt > maxInsertedAt) {
        maxInsertedAt = this._items[i].insertedAt;
        idx = i;
      }
    }
    return idx;
  }

  peek({ highest = false, lowest = false, oldest = false, newest = false } = {}) {
    if (this._items.length === 0) return null;
    let idx = -1;

    if (highest) {
      idx = this._getHighestPriorityIndex();
    } else if (lowest) {
      idx = this._getLowestPriorityIndex();
    } else if (oldest) {
      idx = this._getOldestIndex();
    } else if (newest) {
      idx = this._getNewestIndex();
    } else {
      idx = this._getNewestIndex();
    }

    if (idx === -1) return null;
    return this._items[idx].item;
  }

  dequeue({ highest = false, lowest = false, oldest = false, newest = false } = {}) {
    if (this._items.length === 0) return null;
    let idx = -1;

    if (highest) {
      idx = this._getHighestPriorityIndex();
    } else if (lowest) {
      idx = this._getLowestPriorityIndex();
    } else if (oldest) {
      idx = this._getOldestIndex();
    } else if (newest) {
      idx = this._getNewestIndex();
    } else {
      idx = this._getHighestPriorityIndex();
    }

    if (idx === -1) return null;

    const [removed] = this._items.splice(idx, 1);
    return removed.item;
  }

  size() {
    return this._items.length;
  }

  clear() {
    this._items = [];
    this._counter = 0;
  }

  toArray({ sortBy = "highest" } = {}) {
    let sorted = [...this._items];
    switch (sortBy) {
      case "highest":
        sorted.sort((a, b) => b.priority - a.priority || a.insertedAt - b.insertedAt);
        break;
      case "lowest":
        sorted.sort((a, b) => a.priority - b.priority || a.insertedAt - b.insertedAt);
        break;
      case "oldest":
        sorted.sort((a, b) => a.insertedAt - b.insertedAt);
        break;
      case "newest":
        sorted.sort((a, b) => b.insertedAt - a.insertedAt);
        break;
      default:
        sorted.sort((a, b) => b.priority - a.priority || a.insertedAt - b.insertedAt);
    }
    return sorted.map(x => x.item);
  }
}
