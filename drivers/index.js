class Kruzr360DOM {
    constructor(jwt) { 
        this.jwt = jwt;
        this.kruzr360Networking = new Kruzr360Networking(jwt)
    }

    sampleContent = {
        title : "New",
        subTitle : "Addition",
        content : {
            labels : ["Total Trips","Distance in Kms","Drive Time in Hrs","Drivers","Vehicles"],
            values : [26,1811.70,11.03,27,null]
        }
    }

    loadWidgetWithIdInElement = (widgetId,rootElement) => {

        // this.kruzr360Networking.superWidgetDataFetcher(widgetId)

        var widgetDataResp = this.sampleContent
        // Create Card 
        var card = this.getCardUI(widgetDataResp);
        // Add Card to RootElement
        rootElement.appendChild(card)
    }


    getCardHead = (content) => {
        // Create Head & Body
        var cardHead = document.createElement('div');
        cardHead.classList = 'header'

        var cardTitle = document.createElement('h2');

        var cardTitleContent = document.createElement('strong');
        cardTitleContent.innerHTML = content.title;

        cardTitle.innerHTML = " " + content.subTitle

        // Add Title to Head
        cardTitle.prepend(cardTitleContent)
        cardHead.appendChild(cardTitle)
        return cardHead
    }


    getCardBody = (widgetData) => {
        // Create Head & Body
        var cardBody = document.createElement('div');
        cardBody.classList = 'body';

        var cardRow = document.createElement('div');
        cardRow.classList = 'row';


        //TextWidgetContent

        widgetData.content.labels.forEach( (label,pos) => {
            var cardCell = document.createElement('div');
            cardCell.classList = 'col-lg-4';

            var itemLabel = document.createElement('p');
            itemLabel.classList = 'card-content-label'

            var itemValue = document.createElement('p');
            itemValue.classList = 'card-content-value'


            itemLabel.innerHTML = label;
            itemValue.innerHTML = widgetData.content.values[pos] || '-';

            cardCell.appendChild(itemLabel)
            cardCell.appendChild(itemValue)

            cardRow.appendChild(cardCell)
        });

        cardBody.appendChild(cardRow)
        return cardBody
    }

    getCardUI = (widgetDataResp) => {
        // Create Card 
        var card = document.createElement('div');
        card.classList = 'card'

        // Create Head & Body
        var cardHead = this.getCardHead(widgetDataResp)
        var cardBody = this.getCardBody(widgetDataResp);

        // Add Head & Body To Card
        card.appendChild(cardHead)
        card.appendChild(cardBody)

        return card;
    }
}

class Kruzr360Networking {
    constructor(jwt){
        this.corsFix = ''
        this.basePath = this.corsFix + 'https://portal.kruzr.io/metrix_config/v1/metrixConfig';
        this.jwt = jwt;
    }



    doRequest = (method,url,authToken,body=null,callBack) => {
        let xhr = new XMLHttpRequest();
        xhr.open(method,url)

        xhr.setRequestHeader("Content-Type","application/json");
        xhr.setRequestHeader("Authorization",authToken);
        xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        xhr.setRequestHeader('Access-Control-Allow-Origin', '*');
        xhr.onload = () => {
            console.log(xhr);
            if(xhr.status === 200){
                let resp = JSON.parse(xhr.response);
                console.log(resp);
                callBack(resp,null);
            }else{
                callBack(null,true)
            }
        }

        xhr.onerror = (er) => {
            callBack(null,er)
        }
        xhr.send(body)
    }


    fetcDashboards = (callback) => {
        var auth = "Bearer " + this.jwt;
        var url = this.basePath + '/dashboard/';

        this.doRequest('GET',url,auth,null,callback)
    }

    fetchWidgets = (dashboardId) => {
        var auth = "Bearer " + this.jwt;
        var url = this.basePath + '/dashboard/' +  dashboardId + '/widget';;

        this.doRequest('GET',url,auth,null,callBack)
    }

    fetchWidgetData = (dashboardId,widgetId, startTime = '2021-09-05T00:00:00.000Z', endTime = '2021-11-05T00:00:00.000Z' , filter = []) => {

        const body = {
            'dashboardId': dashboardId,
            'startTime': startTime,
            'endTime': endTime,
            'periodical': 'WEEKLY',
            'filter': filter
        };

        var auth = "Bearer " + this.jwt;
        var url = this.basePath + '/dashboard/'  + dashboardId + '/widget/' + widgetId + '/metrics/data';

        this.doRequest('POST',url,auth,body,callBack)
    }

    superWidgetDataFetcher (widgetId,startTime = '2021-09-05T00:00:00.000Z', endTime = '2021-11-05T00:00:00.000Z' , filter = []) {
        this.fetcDashboards(( dashboardsResp , dashboardsErr) => {

            dashboardsResp.map( dashboard => {
                this.fetchWidgets(dashboard.dashboardId,startTime,endTime,filter,(widgetsResp,widgetsErr) => {
                    widgetsResp.map( widget => {
                        if(widget.widgetId == widgetId){
                            this.fetchWidgetData(dashboard.dashboardId,widget,startTime,endTime,filter, (widgetDataResp,widgetDataErr) => {
                                console.log(widgetDataResp,widgetDataErr)
                            })
                        }
                    })
                })
            })
        })    
    }
}