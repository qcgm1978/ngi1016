/// <reference path="jquery-1.7.1-min.js" />


////////////////////////////////////////// String /////////////////////////////////
jQuery.extend(String.prototype, {
        template: function(object)
        {
            var regex = /#{(.*?)}/g;
            return this.replace(regex, function(match, subMatch, index, source){
                return object[subMatch] || "";
            });
        }
    });    


////////////////////////////////////////// Function /////////////////////////////////
    jQuery.extend(Function.prototype, {
        proxy: function (context) {
            return jQuery.proxy(this, context);
        }
    });

////////////////////////////////////////// Class /////////////////////////////////
/**
@constructor 
**/
    var Class = {
    	create: function (classObj)
    	{
    		/// <summary>创建类的函数</summary>
    		/// <param name="classObj" type="object">用对象表示的类</param>
    		/// <returns type="object">类的实例，已经执行了类的构造函数</returns>
    		var args = jQuery.makeArray(arguments);
    		args.shift();
    		var tempclassObj = function (params)
    		{
    			this.initialize.apply(this, params);
    			this.initializeDOM.apply(this, params);
    			this.initializeEvent.apply(this, params);
    			this.pageLoad.apply(this, params);
    		};
    		classObj.initialize = classObj.initialize || jQuery.noop;
    		classObj.initializeDOM = classObj.initializeDOM || jQuery.noop;
    		classObj.initializeEvent = classObj.initializeEvent || jQuery.noop;
    		classObj.pageLoad = classObj.pageLoad || jQuery.noop;
    		classObj.dispose = classObj.dispose || jQuery.noop;
    		tempclassObj.prototype = classObj;
    		var result = new tempclassObj(args);
    		return result;
    	}
    }; 
