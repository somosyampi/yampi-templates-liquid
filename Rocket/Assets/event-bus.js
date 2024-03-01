let subscribers = {};

function subscribe(event, callback) {
  if (subscribers[event] === undefined) {
    subscribers[event] = [];
  }

  subscribers[event] = [...subscribers[event], callback];

  return function unsubscribe() {
    subscribers[event] = subscribers[event].filter((cb) => {
      return cb !== callback;
    });
  };
}

function publish(event, data) {
  if (subscribers[event]) {
    subscribers[event].forEach((callback) => {
      callback(data);
    });
  }
}
