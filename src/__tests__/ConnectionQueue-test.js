import { AbstractConnection } from "@dcos/connections";
import ConnectionQueue from "../ConnectionQueue.js";
import ConnectionQueueItem from "../ConnectionQueueItem.js";

jest.mock("@dcos/connections");

describe("ConnectionQueue", () => {
  let connection1 = null;
  let connection2 = null;
  let connection3 = null;
  let item1 = null;
  let item2 = null;
  let item3 = null;

  beforeEach(() => {
    connection1 = new AbstractConnection("http://example.com/1");
    connection2 = new AbstractConnection("http://example.com/2");
    connection3 = new AbstractConnection("http://example.com/3");
    item1 = new ConnectionQueueItem(connection1);
    item2 = new ConnectionQueueItem(connection2, 2);
    item3 = new ConnectionQueueItem(connection3, 3);
  });

  describe("#init", () => {
    it("initializes successfully", () => {
      expect(() => new ConnectionQueue()).not.toThrow();
    });

    it("has correct size after initialization (first)", () => {
      expect(new ConnectionQueue().size).toEqual(0);
    });

    it("is empty after initialization (size)", () => {
      expect(new ConnectionQueue().size).toEqual(0);
    });

    it("throws on initialization with invalid list", () => {
      expect(() => new ConnectionQueue("foobar")).toThrow();
    });
  });

  describe("#enqueue", () => {
    it("enqueues correctly (first)", () => {
      const queue = new ConnectionQueue().enqueue(item1);

      expect(queue.first()).toEqual(item1);
    });

    it("enqueues correctly (size)", () => {
      const queue = new ConnectionQueue().enqueue(item1);

      expect(queue.size).toEqual(1);
    });

    it("sorts connections by priority", () => {
      const queue = new ConnectionQueue().enqueue(item2).enqueue(item3);

      expect(queue.first()).toEqual(item2);
    });
  });

  describe("#dequeue", () => {
    describe("with existing connection", function() {
      it("dequeues correctly (first)", () => {
        const queue = new ConnectionQueue().enqueue(item1).dequeue(item1);

        expect(queue.first()).toBe(undefined);
      });

      it("dequeues correctly (size)", () => {
        const queue = new ConnectionQueue().enqueue(item1).dequeue(item1);

        expect(queue.size).toEqual(0);
      });
    });
    describe("with connection that doesn't exist", function() {
      it("doesn't do anything", () => {
        expect(() => new ConnectionQueue().dequeue(item1)).not.toThrow();
      });
    });
  });

  describe("#first", function() {
    it("returns first item of queue", function() {
      const queue = new ConnectionQueue()
        .enqueue(item1)
        .enqueue(item2)
        .enqueue(item3);
      const first = queue.first();

      expect(first.equals(item3)).toBe(true);
    });
    it("returns undefined when calling first on empty queue", function() {
      const queue = new ConnectionQueue();

      expect(queue.first()).toBe(undefined);
    });
  });

  describe("#shift", function() {
    it("returns a new queue without the first element", function() {
      let queue = new ConnectionQueue()
        .enqueue(item1)
        .enqueue(item2)
        .enqueue(item3);
      queue = queue.dequeue(queue.first());

      expect(queue.includes(item3)).toEqual(false);
    });
  });

  describe("#includes", () => {
    describe("with existing connection", function() {
      it("dequeues correctly (size)", () => {
        const queue = new ConnectionQueue().enqueue(item1);

        expect(queue.connections.includes(item1)).toEqual(true);
      });
    });

    describe("with connection that doesn't exist", function() {
      it("doesn't do anything", () => {
        expect(new ConnectionQueue().includes(item1)).toEqual(false);
      });
    });
  });
});
