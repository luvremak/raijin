// Task 5
function asyncFilterCallback(array, callback, done) {
  const result = [];
  let index = 0;

  function processNext() {
    if (index >= array.length) {
      done(result);
      return;
    }

    callback(array[index], index, array, (include) => {
      if (include) result.push(array[index]);
      index++;
      setTimeout(processNext, 0); 
    });
  }

  processNext();
}

function asyncFilterPromise(array, asyncPredicate) {
  return Promise.all(array.map(async (item, index) => {
    const keep = await asyncPredicate(item, index, array);
    return keep ? item : undefined;
  })).then(results => results.filter(x => x !== undefined));
}

async function asyncFilterWithAbort(array, asyncPredicate, signal) {
  const results = [];

  for (let i = 0; i < array.length; i++) {
    if (signal?.aborted) throw new Error("Aborted");

    const keep = await asyncPredicate(array[i], i, array);
    if (keep) results.push(array[i]);
  }

  return results;
}

async function isEvenAsync(num) {
  await new Promise(r => setTimeout(r, 100)); 
  return num % 2 === 0;
}

async function runDemo() {
  const numbers = [1, 2, 3, 4, 5, 6];

  console.log("Running callback-based asyncFilter...");
  asyncFilterCallback(numbers, (num, idx, arr, done) => {
    setTimeout(() => done(num % 2 === 0), 50);
  }, result => {
    console.log("Callback-based result:", result);
  });

  console.log("Running promise-based asyncFilter...");
  const result = await asyncFilterPromise(numbers, isEvenAsync);
  console.log("Promise-based result:", result);

  console.log("Running abortable asyncFilter...");
  const controller = new AbortController();
  const signal = controller.signal;

  setTimeout(() => controller.abort(), 250); 

  try {
    const abortedResult = await asyncFilterWithAbort(numbers, isEvenAsync, signal);
    console.log("Abortable result:", abortedResult);
  } catch (err) {
    console.error("Abortable error:", err.message);
  }
}

runDemo();
