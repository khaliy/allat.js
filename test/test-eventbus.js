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
    Allat.module.define("producer", {
        factory: function (producer) {
            producer.counter = 0;
            producer.produce = function () {
                this.services.EventBus.fireEvent("counter", ++this.counter);
            };
            return producer;
        },
        dependencies: ["EventBus"]
    });
    Allat.module.define("Consumer", {
        factory: function (consumer) {
            consumer.init = function () {
                this.services.EventBus.subscribe("counter", function (event, data) {
                    consumer.counter = data;
                });
            };
            return consumer;
        },
        dependencies: ["EventBus"]
    });
    var Producer = Allat.module.instantiate("Producer"),
        Consumer = Allat.module.instantiate("Consumer");
    Producer.produce();
    ok(Consumer.counter === 1, "Consumer and Producer are in sync");
    Producer.produce();
    ok(Consumer.counter === 2, "Consumer and Producer are in sync");
});