/// JavaScript Document
$(function() {
    $('img[alt="返回按钮"]').live('click',function(){
        var _event = parent.GLOBAL.Event;
        var nextState = _event.NGIStateManager.getNextState();//获取返回的状态
        var backUrl = parent.GLOBAL.Constant.NGIStatesURL[nextState];
        _event.NGIStateManager.goToPreviousState(_event.NavScreenEvent.ShowPreviousScreen, {'backUrl': backUrl});
    });

	var arr = ['c1', 'c2', 'c3'], str = '';
	//根据传入的查询关键字使用ajax方式加载二级关键字
	function ajax_query(xml, key) {		
		$('#table2').empty();			
			$child = $(xml).find('[name=' + key + ']').children(arr[1]);
			for (var i = 0; i <$child.length; i++) {
				$('#table2').append('<tr><td></td></tr>');	
			}
			$child.each(function(i, n) {
				var second = $(this).attr('name');
				$($('#table2 td').get(i)).text(second);
			});
	}
	//初始化显示汽车二级查询关键字
	var config = {
		xml_dom: xml_dom,
		xml_file: 'classes.xml',
		callback: ajax_query,
		other: '汽车'
	} ; 
	parent.GLOBAL.Common.parseStr2Dom(config);
	$('#table1 td img[alt="汽车"]').attr('src',function(){
		return this.src.replace(/(\.png)$/,'_on$1');	
	});
	
	//ui
	// 绑定二级选项点击事件，点击后显示三级选项。注意:不能直接绑定img元素点击事件，可能和mousedown()方法冲突
	$('#table1 td img').on('click', function(e) {			
		var keyword = $(this).attr('alt');
		config.other = keyword;
		parent.GLOBAL.Common.parseStr2Dom(config);
		//显示按下效果的图片恢复正常状态
		//$('img[src$="_on.png"]').mousedown();
		//当前td内的图片显示按下效果。
		$('#table1 td img').each(function(index, element) {
            if(/on\.png$/.test(element.src)){
				element.src=element.src.replace(/_on(\.png)$/,'$1');
			}
        });
		$(this).attr('src',function(){
			return this.src.replace(/(\.png)$/,'_on$1');	
		});
		return false;
	});
	//绑定三级选项点击事件，迁移到搜索结果页面或提示无搜索结果
	$('#table2 td').live('click', function(e) {
		var search_type = $(this).text();
		parent.GLOBAL.Constant.poi_search_type = search_type;
		parent.window.GLOBAL.Event.NavScreenEvent.showPoiSearchResultScreen({type:search_type}); 
	});
	//设置无检索结果弹出框标题
	$('aside')
	.find('h3')
	.text(GLOBAL.Constant.prom_no_result);
	//绑定无检索结果弹出框确定按钮点击事件

//显示更多检索结果界面
function showMoreSearchResultScreen(){
    location.href = '../rim/search.html';
    return true;
}
    if (-[1, ]) {
        var myScroll = DragClass.create('table2');
    }
});