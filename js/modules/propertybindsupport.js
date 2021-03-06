/*global Allat */
(function (Allat) {
    Allat.module.define("PropertyBindSupport", {
        factory: function (propertyBindSupport) {
            propertyBindSupport.init = function() {
                var p = Allat.util.proxy;
                this.dictionary = {};
                this.parsePage();
                /*jslint unparam: true*/
                this.services.EventBus.subscribe("property.set", p(function (event, data) {
                    if (this.resolve(data.key)) {
                        this.update(data.key, data.value);
                    }
                }, this));
                /*jslint unparam: false*/
            };
            propertyBindSupport.parsePage = function () {
                var template, i, boundTo, key, p = Allat.util.proxy,
                    createChangeHandler = p(function(key, template) {
                        return p(function (e) {
                            var value = Allat.util.escape(e.target.value);
                            this.dictionary[key] = {
                                template: template,
                                boundTo: e.target,
                                value: value
                            };
                            template.innerHTML = value;
                            this.services.EventBus.fireEvent("property.updated", {
                                key: key,
                                value: value
                            });
                        }, this);
                    }, this);
                this.templates = document.getElementsByClassName("bind");
                for (i = 0; i < this.templates.length; i++) {
                    template = this.templates[i];
                    if (template.attributes["data-bind"]) {
                        key = template.attributes["data-bind"].value;
                        boundTo = document.getElementById(key);
                        boundTo.onchange = createChangeHandler(key, template);
                        boundTo.onkeyup = boundTo.onchange;
                        boundTo.onchange({
                            target: boundTo
                        });
                    }
                }
            };
            propertyBindSupport.resolve = function (key) {
                return this.dictionary[key].value;
            };
            propertyBindSupport.update = function (key, value) {
                this.dictionary[key].value = value;
                this.dictionary[key].boundTo.value = value;
                this.dictionary[key].boundTo.onchange({
                    target: this.dictionary[key].boundTo
                });
                return value;
            };
            return propertyBindSupport;
        },
        dependencies: ["EventBus"],
        singleton: true
    });
}(Allat));