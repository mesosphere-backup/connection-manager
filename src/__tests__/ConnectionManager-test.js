import { AbstractConnection, ConnectionEvent } from "@dcos/connections";
import ConnectionManagerClass from "../ConnectionManager.js";

jest.mock("@dcos/connections", () => {
  return {
    AbstractConnection: require("../__mocks__/AbstractConnection").default,
    ConnectionEvent: require("../__mocks__/ConnectionEvent").default
  };
});

jest.useFakeTimers();

describe("ConnectionManager", () => {
  let ConnectionManager = null;
  let connection1 = null;
  let connection2 = null;
  let connection3 = null;

  beforeEach(() => {
    ConnectionManager = new ConnectionManagerClass();
    connection1 = new AbstractConnection("http://example.com/1");
    connection2 = new AbstractConnection("http://example.com/2");
    connection3 = new AbstractConnection("http://example.com/3");
  });

  describe("#schedule", function() {
    it("starts first connection", () => {
      ConnectionManager.schedule(connection1);

      jest.advanceTimersByTime(1);

      expect(connection1.open).toHaveBeenCalled();
    });
  });
});
