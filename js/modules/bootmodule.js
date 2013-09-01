/*global root,Allat */
(function (Allat) {
    var $, prevHandler;
    if (root.jQuery) {
        $ = root.jQuery;
    } else {
        $ = function(callback) {
            prevHandler = root.onload;
            root.onload = function (e) {
                if (prevHandler) {
                    prevHandler(e);
                }
                if (callback) {
                    callback(e);
                }
            };
        };
    }
    Allat.module.define("BootModule", {
        factory: function (BootModule) {
            BootModule.init = function() {
                $(Allat.util.proxy(function () {
                    this.services.EventBus.fireEvent("load");
                }, this));
            };
            return BootModule;
        },
        dependencies: ["EventBus"],
        singleton: true
    });

    Allat.module.instantiate("BootModule");
}(Allat));