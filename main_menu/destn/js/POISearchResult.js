/**
 * POI检索结果
 * @COPYRIGHT Shanghai RaxTone-Tech Co.,Ltd.
 * @Title: searchResult.js
 * @Description: POI检索结果
 * @author chengpawang
 * @date 2012-4-24
 * @version V1.0
 * Modification History:
 */
GLOBAL.namespace('POISearchResult');
(function(Obj){
    //检索类型 byKeyword || byCenPoi
    Obj.searchType = "";
    //保存历史记录
    Obj.savePOISearchHistory=function(keyword){
        var historyArr = null;
        try{
            historyArr = JSON.parse(localStorage.getItem('Map_keywords'));
        } catch(e){
            historyArr = new Array() ;
            console.log("POI 查询关键字记录格式有误") ;
        }
        //删除重复的记录
        for(var i = 0 ; i < historyArr.length ; i++) {
            if(historyArr[i] == keyword){
                historyArr.splice(i,1);
            }
        }
        historyArr.unshift(keyword) ;
        historyArr.splice(5,5);
        localStorage.setItem('Map_keywords' , JSON.stringify(historyArr)) ;
    }
    /*
    *设置上一页和下一页跳转按钮
    */
    Obj.next_page = function() {
        var constant = GLOBAL.Constant , results_number = parent.window.GLOBAL.POISearchResult.data.count;//结果记录总数
        //如果不给 .index() 方法传递参数，那么返回值就是这个jQuery对象集合中最后一个元素相对于其同辈元素的位置。
        var first_display_tr = $('tr:not(.none):first').index();
        var len = $('tr').length;
        if(len <= constant.display_num )//结果只有一页，不能翻页
            return;

        //如果不是最后一页，就显示下六条查询结果
        if (first_display_tr < len - constant.display_num ) {
            $('tr').addClass('none');
            $('tr').slice(first_display_tr + constant.display_num, first_display_tr + constant.display_num * 2).removeClass('none');
            if (first_display_tr + constant.display_num * 2 >= results_number) {//全部结果都显示完毕，下一页才变灰
                $('#next_button').attr('src', '../../images/next_page_gray.png');
            }
        }

        //如果已经显示最后一页，执行下一次查询
        else {
            if (results_number - first_display_tr > constant.display_num ) {//还没有显示全部查询结果
                //实现查找结果页面点击最后一页时继续查询显示
                var batch = Math.floor(len/constant.search_num) + 1;//根据已显示的结果条数，确定要请求的页数
                parent.window.GLOBAL.POISearchResult.searchContext.batch = batch ;
                $("#aside_spinner").show() ;
                if(GLOBAL.POISearchResult.searchType == "byKeyword"){
                    parent.POISearchService.byKeywords(parent.window.GLOBAL.POISearchResult.searchContext) ;
                }else  if(GLOBAL.POISearchResult.searchType == "byCenPoi"){
                    parent.POISearchService.byCenPoi(parent.window.GLOBAL.POISearchResult.searchContext) ;
                }

            }
            //如果已经显示了全部查询结果
            else {
                console.log('last result page');
                $('#next_button').attr('src', '../../images/next_page_gray.png');
            }
        }
        //改变上一步按钮的ui
        $('#prev_button').attr('src', '../../images/previous_page.png');
    } ;

    /**
     * 上一页按钮事件处理
     */
    Obj.prev_page = function() {
        var constant = GLOBAL.Constant;
        var first_display_tr = $('tr:not(.none):first').index();
        var last_tr = $('tr:not(.none)').index();
        if (first_display_tr != 0) {
            console.log(last_tr);
            $('tr').addClass('none');
            $('tr').slice(first_display_tr - constant.display_num, first_display_tr).removeClass('none');
            if (first_display_tr == constant.display_num) {
                $('#prev_button').attr('src', '../../images/previous_page_gray.png');
            }
        }
        //改变下一步按钮的ui
        if(total){
            if(total > constant.display_num) {
                $('#next_button').attr('src', '../../images/next_page.png');
            }
        }
    } ;
    // 设置筛选按钮是否可点击
    Obj.query_second_key = function(key)  {
        var that = this;
        var xmlParser = {
            xml_dom : xml_dom,
            callback : function(xml) {
                if ($(xml).find('[name="' + key + '"]')) {
                    var $child = $(xml).find('[name="' + key + '"]').children('c3');
                    if ($child.length) {
                        $('#filter').show();
                        $('#filter').click(function() {
                            //$('#btn_toggle').hide();//隐藏翻页按钮
                            parent.window.GLOBAL.Event.NGIStateManager.goToNextState(GLOBAL.Constant.NGIStates.PoiSearchResultFilter,that.showPoiSearchResultFilterScreen);
                        });
                    } else {
                        console.info('choose button not clicked');
                        $('#filter').hide();
                    }
                } else {
                    $('#filter').hide();
                }
            }
        };
        parent.GLOBAL.Common.parseStr2Dom(xmlParser);
    } ;
    Obj.showPoiSearchResultFilterScreen=function(){
		$('<div id="filterResult" class="w800 h480" style="position:absolute;top:0px;"></div>').appendTo('body');
		$('#filterResult').load('choose.html',function(){
            if (-[1, ]) {
                var myScroll = DragClass.create('filterTable');
            }
        });

		return true;
	};
    /**
     * 关键字/周边查找成功时回调方法
     * @param data
     * @param searchType {String} 'byKeyword' || 'byCenPoi'
     * @returns {Boolean}
     */
    Obj.rsHandler = function(data,searchType){
        var constant = GLOBAL.Constant ,tableEle =  $('#searchTable'),tableClass="";
        $("#aside_spinner").hide() ;
        if(searchType=='byKeyword') tableClass = 'keywordsearch';
        else if(searchType=='byCenPoi') tableClass = 'cenpoisearch';
        tableEle.attr('class',tableClass);
        if (data.list) {
            this.searchType = searchType;
            total = data.list.length ;
            var poiList = data.list ;
            var item = null ;
            var len = $('tr').length;
            var  result='';
            var distance = 0;
            $('tr').addClass('none');//隐藏所有行

            var rows = "" , attributs="";
            for(var i = 0 ; i < poiList.length ; i++) {
                //一页显示constant.display_num条
                item = poiList[i] ;
                if(i >= constant.display_num) {
                    rows += "<tr class='none'>";
                }
                else
                    rows += "<tr>";

                attributs = "data-y='"+item.y+"' data-x='"+item.x+"' title='"+item.name+"' address='"+item.address+"' tel='"+item.tel+"'";
                rows += "<td " + attributs + " >" + (item.address ? item.name + ' [ ' + item.address + ' ]' : item.name) + "</td>";
                if(searchType=='byCenPoi'){//周边检索结果
                    distance = item.distance == ""?0:item.distance;
                    rows += "<td>" + Tab.unit_conversion(distance, 1)+ "</td>";
                }

                rows += "</tr>";
            }
            //向表格中追加查询结果
            tableEle.append(rows);
            if (data.list.length <= constant.display_num) {
                $('#next_button').attr('src', '../../images/next_page_gray.png');
            }
            else {
                $('#next_button').attr('src', '../../images/next_page.png');
            }
            
            //$('#btn_toggle').show();
        }
        return false;
    } ;
    /**
     * 在地图页面显示poi信息
     */
    Obj.showMapWithPoi = function() {
		if ($(this).attr('data-y')) {
			var config = {
				lat: $(this).attr('data-y'),
				lng: $(this).attr('data-x'),
				name: $(this).attr('title')||$(this).attr('myTitle'),
				address: $(this).attr('address'),
				tel: $(this).attr('tel')
			};
			GLOBAL.Common.savePoiData(config);
			if(typeof(parent.window.iframeObj) !='undefined'){
				var topWindow = parent.window;
				var retValue="返回周边搜索结果按钮";
		//		GLOBAL.layer.retMainPage.resultDisplay(config,topWindow,retValue)
				parent.window.GLOBAL.Event.NGIStateManager.goToNextState(GLOBAL.Constant.NGIStates.MapWithPoi,parent.window.GLOBAL.Event.NavScreenEvent.showSearchResultInMapScreen,config);
			}
		} else {
			return false;
		}
	};
})(GLOBAL.POISearchResult);

$(function(){
  $('img[alt="返回按钮"],img[alt="返回地图按钮"]').live('click',function(){
        parent.POISearchService.cancleRequest();//如果POI请求结果还未返回，则取消请求
        var _event = parent.GLOBAL.Event,nextState = _event.NGIStateManager.getNextState();//获取返回的状态
        var backUrl =parent.GLOBAL.Constant.NGIStatesURL[nextState];
        _event.NGIStateManager.goToPreviousState(_event.NavScreenEvent.ShowPreviousScreen, {'backUrl': backUrl});
    });
//绑定翻页按钮点击事件
	$('#next_button').click(GLOBAL.POISearchResult.next_page);
	$('#prev_button').click(GLOBAL.POISearchResult.prev_page);
    var poi_data = parent.window.GLOBAL.POISearchResult.data;
    var previousState = parent.GLOBAL.Event.NGIStateManager.getNextState();//取得前一个状态
	if(previousState == GLOBAL.Constant.NGIStates.PoiSearchByKeyword){
        $('h1:first').text('目的地检索结果');
        if(poi_data.list){//保存历史记录
            GLOBAL.POISearchResult.savePOISearchHistory(parent.window.GLOBAL.POISearchResult.keyword);
        }
		GLOBAL.POISearchResult.rsHandler(poi_data,'byKeyword');
		parent.window.GLOBAL.POISearchResult.type=null;
	}else{
		$('h1:first').text('周边检索结果');
		 //设置筛选按钮是否显示
		GLOBAL.POISearchResult.query_second_key(parent.window.GLOBAL.POISearchResult.type);
		GLOBAL.POISearchResult.rsHandler(poi_data,'byCenPoi');
		parent.window.GLOBAL.POISearchResult.keyword=null;
	}
	//parent.window.GLOBAL.POISearchResult.data=null;//by Xia Zhen, when return from “choose.html”, need data
	// 设置搜索结果点击事件，返回地图页面查询
	$('#searchTable td').die().live('click',GLOBAL.POISearchResult.showMapWithPoi);
});
			
