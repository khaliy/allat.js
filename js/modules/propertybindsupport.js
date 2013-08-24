/*global Allat */
(function (Allat) {
    Allat.module.define("PropertyBindSupport", function (PropertyBindSupport) {
        PropertyBindSupport.init = function() {
            var template, i, boundTo, key, p = Allat.util.proxy,
                createChangeHandler = p(function(key, template) {
                    return p(function (e) {
                        var value = e.target.value;
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
            this.dictionary = {};
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
            /*jslint unparam: true*/
            this.services.EventBus.subscribe("property.set", p(function (event, data) {
                if (this.resolve(data.key)) {
                    this.update(data.key, data.value);
                }
            }, this));
            /*jslint unparam: false*/
        };
        PropertyBindSupport.resolve = function (key) {
            return this.dictionary[key].value;
        };
        PropertyBindSupport.update = function (key, value) {
            this.dictionary[key].value = value;
            this.dictionary[key].boundTo.value = value;
            this.dictionary[key].boundTo.onchange({
                target: this.dictionary[key].boundTo
            });
            return value;
        };
        return PropertyBindSupport;
    }, ["EventBus"], true);
}(Allat));