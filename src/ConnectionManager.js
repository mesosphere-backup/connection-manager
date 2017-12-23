import { List } from "immutable";
import { AbstractConnection, ConnectionEvent } from "@dcos/connections";
import ConnectionQueueItem from "./ConnectionQueueItem";

export default class ConnectionManager {
  /**
   * Initializes an Instance of ConnectionManager
   *
   * @param {int} maxConnections – max open connections
   * @param {int} maxPriority – highest used priority
   */
  constructor(maxConnections = 6, maxPriority = 4) {
    if (maxPriority >= maxConnections) {
      throw new Error(`maxPriority has to be smaller, than maxConnections!`);
    }
    /**
     * Private Context
     *
     * @typedef {Object} ConnectionManager~Context
     */
    const context = {
      /**
       * @property {ConnectionManager} instance
       * @description Current connection manager instance
       * @name ConnectionManager~Context#instance
       */
      instance: this,

      /**
       * @property {ConnectionQueue} list
       * @description List of connections ordered by priority
       * @name ConnectionManager~Context#list
       */
      list: List(),

      /**
       * @property {ConnectionQueue} interval
       * @description Internal loop interval
       * @name ConnectionManager~Context#interval
       */
      interval: null,

      /**
       * Opens a Connection
       *
       * @param {AbstractConnection} connection
       */
      setupConnection(connection) {
        connection.open();
      },

      /**
       * This function is where the magic happens.
       */
      loop() {
        // store all open items
        let openList = context.list.filter(
          listItem => listItem.connection.state === AbstractConnection.OPEN
        );

        let waitingList = context.list
          .filter(
            listItem => listItem.connection.state === AbstractConnection.INIT
          )
          .sortBy(listItem => -1 * listItem.priority);

        // if there are free slots, start as much tasks as possible
        // this has to be a while because otherwise only one connection
        // per second would be opened when the tab is inactive.
        // see https://stackoverflow.com/questions/15871942/how-do-browsers-pause-change-javascript-when-tab-or-window-is-not-active
        while (
          waitingList.size &&
          maxPriority - waitingList.first().priority <
            maxConnections - openList.size
        ) {
          const waitingItem = waitingList.first();
          waitingList = waitingList.shift();
          context.setupConnection(waitingItem.connection);
          openList = openList.push(waitingItem);
        }

        // merge the lists again (this removes closed connections).
        context.list = openList.concat(waitingList);

        // still waiting items?
        if (waitingList.size > 0) {
          // https://www.immagic.com/eLibrary/ARCHIVES/GENERAL/NNG_US/N930101N.pdf
          context.interval = setTimeout(context.loop, 100);
        } else {
          context.interval = null;
        }
      },

      /**
       * schedules connection in loop
       *
       * @this ConnectionManager~Context
       * @param {AbstractConnection} connection – connection to queue
       * @param {Integer} [priority] – optional change of priority
       * @return {AbstractConnection} - the scheduled connection
       */
      schedule(connection, priority) {
        // create a new QueueItem to have the correct default priority
        const item = new ConnectionQueueItem(connection, priority);

        // if we got a (now) closed connection, nothing to do.
        if (connection.state === AbstractConnection.CLOSED) {
          return connection;
        }

        // add, sort and process
        context.list = context.list
          .filter(listItem => !listItem.equals(item))
          .push(item);

        // running loop? otherwise start it
        if (!context.interval) {
          context.interval = setTimeout(context.loop, 0);
        }

        // return the given connection for further use
        return connection;
      }
    };

    this.schedule = this.schedule.bind(context);
  }

  /**
   * This one only calls the "internal" schedule method
   *
   * @this ConnectionManager~Context
   * @param {AbstractConnection} connection – connection to queue
   * @param {Integer} [priority] – optional change of priority
   * @return {AbstractConnection} - the scheduled connection
   */
  schedule(connection, priority) {
    return this.schedule(connection, priority);
  }
}
