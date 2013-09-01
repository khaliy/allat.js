/*global Allat,console */
(function (Allat) {
    Allat.module.define("PageWizard", {
        factory: function (page) {
            page.init = function () {
                var templates = document.getElementsByTagName("template"), p = Allat.util.proxy;
                Allat.util.makeArray(templates).forEach(function (elem) {
                    var templateText = elem.innerHTML, tag;
                    tag = document.createElement("span");
                    (p(function (p, tag, templateText) {
                        this.services.EventBus.subscribe("property.updated", p(function (event, data) {
                            var view = {};
                            view[data.key] = data.value;
                            tag.innerHTML = this.services.TemplateSupport.render(templateText, view);
                        }, this));
                    }, this)(p, tag, templateText));
                    elem.parentNode.appendChild(tag);
                    elem.parentNode.removeChild(elem);
                }, this);
            };
            return page;
        },
        dependencies: ["EventBus", "PropertyBindSupport", "TemplateSupport"],
        singleton: true
    });
    Allat.module.instantiate("PageWizard");
}(Allat));