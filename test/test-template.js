/*global Allat*/
module("TemplateSupport");
test("TemplateSupport exist", function() {
    var TemplateSupport = Allat.module.instantiate("TemplateSupport");
    ok(TemplateSupport.render);
    ok(TemplateSupport.addEngine);
    equal(TemplateSupport.getName(), "TemplateSupport", "Its a TemplateSupport");
});
test("TemplateSupport renders with SimpleTemplate", function () {
    var TemplateSupport = Allat.module.instantiate("TemplateSupport"),
        template = "Hi {name} {name}, I'm {name2}", data = {
            name: "Thomas", name2: "Thomas too"
        }, renderedTemplate;
    TemplateSupport.setEngine("SimpleTemplate");
    renderedTemplate = TemplateSupport.render(template, data);
    ok(renderedTemplate === "Hi Thomas Thomas, I'm Thomas too", "template processed well.");
});