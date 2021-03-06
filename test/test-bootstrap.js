/*global Allat*/
module("Bootstrap");
test("global namespace", function() {
    ok(window.Allat, "Allat registered.");
});
test("global namespace methods", function() {
    ok(Allat.module.define, "It has method define.");
    ok(Allat.module.inject, "It has method inject.");
    ok(Allat.module.instantiate, "It has method instantiate.");
});
test("define and instantiate simple module", function() {
    var simpleModule;
    Allat.module.define("SimpleModule", {
        factory: function(base) {
            base.getName = function () {
                return this.name;
            };
            return base;
        }
    });
    simpleModule = Allat.module.instantiate("SimpleModule");
    ok(simpleModule.getName);
    equal(simpleModule.getName(), "SimpleModule", "Its a simpleModule");
});
test("inject a service", function () {
    var nameListingModule;
    Allat.module.define("NameService", {
        factory: function(nameService) {
            nameService.getNames = function () {
                this._fetchNames();
                return this.names;
            };
            nameService._fetchNames = function () {
                this.names = ["A", "B", "C"];
            };
            return nameService;
        },
        singleton: true
    });
    Allat.module.define("NameListingModule", {
        factory: function(module) {
            module.listNames = function () {
                return this.services.NameService.getNames();
            };
            return module;
        },
        dependencies: ["NameService"]
    });
    nameListingModule = Allat.module.instantiate("NameListingModule");
    deepEqual(nameListingModule.listNames() , ["A", "B", "C"], "NameService was properly injected");
    notDeepEqual(nameListingModule, Allat.module.instantiate("NameListingModule"), "Non singleton modules are different");
    equal(nameListingModule.services.NameService, Allat.module.instantiate("NameListingModule").services.NameService, "Has its service singleton");
});