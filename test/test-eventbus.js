/*global Allat*/
module("EventBus");
test("EventBus exist", function() {
    var EventBus = Allat.module.instantiate("EventBus");
    ok(EventBus.subscribe);
    ok(EventBus.unSubscribe);
    ok(EventBus.fireEvent);
    equal(EventBus.getName(), "EventBus", "Its an EventBus");
});
test("Producer and Consumer", function () {
    Allat.module.define("Producer", function (Producer) {
        Producer.counter = 0;
        Producer.produce = function () {
            this.services.EventBus.fireEvent("counter", ++this.counter);
        };
        return Producer;
    },["EventBus"]);
    Allat.module.define("Consumer", function (Consumer) {
        Consumer.init = function () {
            this.services.EventBus.subscribe("counter", function (event, data) {
                Consumer.counter = data;
            });
        };
        return Consumer;
    },["EventBus"]);
    var Producer = Allat.module.instantiate("Producer"),
        Consumer = Allat.module.instantiate("Consumer");
    Producer.produce();
    ok(Consumer.counter === 1, "Consumer and Producer are in sync");
    Producer.produce();
    ok(Consumer.counter === 2, "Consumer and Producer are in sync");
});