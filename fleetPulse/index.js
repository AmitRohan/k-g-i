const loadUI = () => {
    var confidentialJWT = ""
    var widget1 = document.getElementById('widget1');
    kruzr360DOM = new Kruzr360DOM(confidentialJWT);
    kruzr360DOM.loadWidgetWithIdInElement(1,widget1)
}

