/**
 * POI检索
 * @COPYRIGHT Shanghai RaxTone-Tech Co.,Ltd. 
 * @Title: POISearch.js 
 * @Description: POI检索
 * @author chengpawang
 * @date 2012-4-24
 * @version V1.0  
 * Modification History:  
 */
GLOBAL.namespace('POISearch');

$(function(){
    $('img[alt="返回按钮"],img[alt="返回地图按钮"]').live('click',function(){
        parent.POISearchService.cancleRequest();//如果POI请求结果还未返回，则取消请求
        var _event = parent.GLOBAL.Event;
        if($(this).attr('alt')=='返回地图按钮'){
            _event.NGIStateManager.returnToMapDirectly(_event.NavScreenEvent.showReturnToMapDirectlyScreen, {'backUrl': parent.GLOBAL.Constant.NGIStatesURL.Map});
        }
        else{
            var nextState = _event.NGIStateManager.getNextState();//获取返回的状态
            var backUrl =parent.GLOBAL.Constant.NGIStatesURL[nextState];
            _event.NGIStateManager.goToPreviousState(_event.NavScreenEvent.ShowPreviousScreen, {'backUrl': backUrl});
        }
    });
	try{
        var historyArr = JSON.parse(localStorage.getItem("Map_keywords"));
	}catch(e){
		console.log("GLOBAL.POISearch-->没有检索关键字历史记录") ;
		localStorage['Map_keywords'] = "[]";
	}
    GLOBAL.POISearch.showPOISearchHistory(historyArr) ;
	//绑定历史关键字点击事件
	$('td').bind('click' , function(){
		var keyword = $(this).text() ;
		if($.trim(keyword) != ''){
			$("#aside_spinner").show() ;	
			parent.window.GLOBAL.Event.NavScreenEvent.showPoiSearchResultScreen({keyword:keyword});
		}
	}) ;	
	//绑定检索按钮点击事件
	$('form').submit(function(e){
        e.preventDefault();
        var keyword = $('[type="search"]').val();
        if($.trim(keyword) == '') return false;
        $("#aside_spinner").show() ;
        parent.window.GLOBAL.Event.NavScreenEvent.showPoiSearchResultScreen({keyword:keyword});
	});
	
	//绑定城市按钮点击事件
	$('#region').click(function(){
		parent.window.GLOBAL.Event.NGIStateManager.goToNextState(GLOBAL.Constant.NGIStates.PoiSearchRegion,parent.window.GLOBAL.Event.NavScreenEvent.showPoiSearchRegionScreen);
	});
    //为输入框加入自动完成功能
    var city = $('#region').val(), autocompleteHelper = parent.GLOBAL.Common.AutoCompleteHelper(city);
    $('#keyword').autocomplete(autocompleteHelper);
}) ;

/**
 * 显示搜索的关键词历史
 * @param historyArr 关键词历史记录数组
 */
GLOBAL.POISearch.showPOISearchHistory = function(historyArr) {
	if (JSON.parse(localStorage['Map_keywords']).length >0) {
        $('#div_no_history').hide();
		var tr = null ;
        var str = '';
		$.each(historyArr , function(i, v) {
            str += '<tr><td>'+ v + '</td>';
            str += '<td><img src="images/images/delete.png" onclick="GLOBAL.POISearch.deletePOISearchHistory(' + i + ',this)"></td></tr>';
		});
        $('table').html(str);
	}else
        $('#div_no_history').show();
	
	//历史城市
	$('#region').val(localStorage['Map_search_area']);	
} ;

/**
 * 根据索引删除指定元素
 * @param index 索引号
 */
GLOBAL.POISearch.deletePOISearchHistory = function(index,obj){
	var count = 0 ;
	var tempArr = new Array() ;
	var historyArr = JSON.parse(localStorage['Map_keywords']);
	for(var i = 0 , length = historyArr.length ; i < length ; i++ ){
		if(i != index){
			tempArr[count] = historyArr[i] ;
			count++ ;
		}
	}
	//保存到本地存储
	localStorage['Map_keywords'] = JSON.stringify(tempArr) ;
	//清除原来的显示数据
   $(obj).parent().parent().remove();//删除指定行
	GLOBAL.POISearch.showPOISearchHistory(tempArr) ;
} ;

