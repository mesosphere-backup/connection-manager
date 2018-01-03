import { AbstractConnection, ConnectionEvent } from "@dcos/connections";
import ConnectionManagerClass from "../ConnectionManager.js";

jest.mock("@dcos/connections", () => {
  return {
    AbstractConnection: require("../__mocks__/AbstractConnection").default,
    ConnectionEvent: require("../__mocks__/ConnectionEvent").default
  };
});

describe("ConnectionManager", () => {
  let ConnectionManager = null;
  let connection1 = null;
  let connection2 = null;
  let connection3 = null;

  beforeEach(() => {
    ConnectionManager = new ConnectionManagerClass(2);
    connection1 = new AbstractConnection("http://example.com/1");
    connection2 = new AbstractConnection("http://example.com/2");
    connection3 = new AbstractConnection("http://example.com/3");
  });

  describe("#schedule", function () {
    it("does nothing when closed connection is scheduled", () => {
      connection1.state = AbstractConnection.CLOSED;

      expect(() => {
        ConnectionManager.schedule(connection1);
      }).not.toThrow();
    });

    it("doesn't open connections twice", () => {
      connection1.open();

      ConnectionManager.schedule(connection1);

      expect(connection1.open).toHaveBeenCalledTimes(1);
    });
  });
});
