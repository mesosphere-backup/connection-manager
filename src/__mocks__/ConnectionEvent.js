const OriginalConnectionEvent = require.requireActual("@dcos/connections")
  .ConnectionEvent;

const ConnectionEvent = jest.fn();

ConnectionEvent.OPEN = OriginalConnectionEvent.OPEN;
ConnectionEvent.DATA = OriginalConnectionEvent.DATA;
ConnectionEvent.ERROR = OriginalConnectionEvent.ERROR;
ConnectionEvent.COMPLETE = OriginalConnectionEvent.COMPLETE;
ConnectionEvent.ABORT = OriginalConnectionEvent.ABORT;

export default ConnectionEvent;
