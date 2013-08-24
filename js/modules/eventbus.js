/*global Allat */
(function (Allat) {
    Allat.module.define("EventBus", function (EventBus) {

        EventBus.init = function () {
            this._subscribers = this.services.MapSupport.createMap();
        };
        /**
         * @param {String} event
         * @param {function} handler
         */
        EventBus.subscribe = function (event, handler) {
            this._subscribers.add(event, handler);
        };
        EventBus.unSubscribe = function (event, handler) {
            this._subscribers.remove(event, handler);
        };
        EventBus.fireEvent = function (event, data) {
            var handlers = this._subscribers.getValues(event), i;
            if (!handlers || !handlers.length) {
                return;
            }
            for (i = 0; i < handlers.length; i++) {
                if (handlers[i](event, data)) {
                    break;
                }
            }
        };
        return EventBus;
    }, ["MapSupport"], true);
}(Allat));