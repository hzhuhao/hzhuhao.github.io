/* ========================================================================
 * Bootstrap: affix.js v3.3.5
 * http://getbootstrap.com/javascript/#affix
 * ========================================================================
 * Copyright 2011-2015 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // AFFIX CLASS DEFINITION
  // ======================

  var Affix = function (element, options) {
    this.options = $.extend({}, Affix.DEFAULTS, options)

    this.$target = $(this.options.target)
      .on('scroll.bs.affix.data-api', $.proxy(this.checkPosition, this))
      .on('click.bs.affix.data-api',  $.proxy(this.checkPositionWithEventLoop, this))

    this.$element     = $(element)
    this.affixed      = null
    this.unpin        = null
    this.pinnedOffset = null

    this.checkPosition()
  }

  Affix.VERSION  = '3.3.5'

  Affix.RESET    = 'affix affix-top affix-bottom'

  Affix.DEFAULTS = {
    offset: 0,
    target: window
  }

  Affix.prototype.getState = function (scrollHeight, height, offsetTop, offsetBottom) {
    var scrollTop    = this.$target.scrollTop()
    var position     = this.$element.offset()
    var targetHeight = this.$target.height()

    if (offsetTop != null && this.affixed == 'top') return scrollTop < offsetTop ? 'top' : false

    if (this.affixed == 'bottom') {
      if (offsetTop != null) return (scrollTop + this.unpin <= position.top) ? false : 'bottom'
      return (scrollTop + targetHeight <= scrollHeight - offsetBottom) ? false : 'bottom'
    }

    var initializing   = this.affixed == null
    var colliderTop    = initializing ? scrollTop : position.top
    var colliderHeight = initializing ? targetHeight : height

    if (offsetTop != null && scrollTop <= offsetTop) return 'top'
    if (offsetBottom != null && (colliderTop + colliderHeight >= scrollHeight - offsetBottom)) return 'bottom'

    return false
  }

  Affix.prototype.getPinnedOffset = function () {
    if (this.pinnedOffset) return this.pinnedOffset
    this.$element.removeClass(Affix.RESET).addClass('affix')
    var scrollTop = this.$target.scrollTop()
    var position  = this.$element.offset()
    return (this.pinnedOffset = position.top - scrollTop)
  }

  Affix.prototype.checkPositionWithEventLoop = function () {
    setTimeout($.proxy(this.checkPosition, this), 1)
  }

  Affix.prototype.checkPosition = function () {
    if (!this.$element.is(':visible')) return

    var height       = this.$element.height()
    var offset       = this.options.offset
    var offsetTop    = offset.top
    var offsetBottom = offset.bottom
    var scrollHeight = Math.max($(document).height(), $(document.body).height())

    if (typeof offset != 'object')         offsetBottom = offsetTop = offset
    if (typeof offsetTop == 'function')    offsetTop    = offset.top(this.$element)
    if (typeof offsetBottom == 'function') offsetBottom = offset.bottom(this.$element)

    var affix = this.getState(scrollHeight, height, offsetTop, offsetBottom)

    if (this.affixed != affix) {
      if (this.unpin != null) this.$element.css('top', '')

      var affixType = 'affix' + (affix ? '-' + affix : '')
      var e         = $.Event(affixType + '.bs.affix')

      this.$element.trigger(e)

      if (e.isDefaultPrevented()) return

      this.affixed = affix
      this.unpin = affix == 'bottom' ? this.getPinnedOffset() : null

      this.$element
        .removeClass(Affix.RESET)
        .addClass(affixType)
        .trigger(affixType.replace('affix', 'affixed') + '.bs.affix')
    }

    if (affix == 'bottom') {
      this.$element.offset({
        top: scrollHeight - height - offsetBottom
      })
    }
  }


  // AFFIX PLUGIN DEFINITION
  // =======================

  function Plugin(option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.affix')
      var options = typeof option == 'object' && option

      if (!data) $this.data('bs.affix', (data = new Affix(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  var old = $.fn.affix

  $.fn.affix             = Plugin
  $.fn.affix.Constructor = Affix


  // AFFIX NO CONFLICT
  // =================

  $.fn.affix.noConflict = function () {
    $.fn.affix = old
    return this
  }


  // AFFIX DATA-API
  // ==============

  $(window).on('load', function () {
    $('[data-spy="affix"]').each(function () {
      var $spy = $(this)
      var data = $spy.data()

      data.offset = data.offset || {}

      if (data.offsetBottom != null) data.offset.bottom = data.offsetBottom
      if (data.offsetTop    != null) data.offset.top    = data.offsetTop

      Plugin.call($spy, data)
    })
  })

}(jQuery);

/* global instantsearch: true */
/*jshint camelcase: false */

$(document).ready(function () {
  var algoliaSettings = CONFIG.algolia;
  var isAlgoliaSettingsValid = algoliaSettings.applicationID &&
                               algoliaSettings.apiKey &&
                               algoliaSettings.indexName;

  if (!isAlgoliaSettingsValid) {
    window.console.error('Algolia Settings are invalid.');
    return;
  }

  var search = instantsearch({
    appId: algoliaSettings.applicationID,
    apiKey: algoliaSettings.apiKey,
    indexName: algoliaSettings.indexName,
    searchFunction: function (helper) {
      var searchInput = $('#algolia-search-input').find('input');

      if (searchInput.val()) {
        helper.search();
      }
    }
  });

  // Registering Widgets
  [
    instantsearch.widgets.searchBox({
      container: '#algolia-search-input',
      placeholder: algoliaSettings.labels.input_placeholder
    }),

    instantsearch.widgets.hits({
      container: '#algolia-hits',
      hitsPerPage: algoliaSettings.hits.per_page || 10,
      templates: {
        item: function (data) {
          var link = data.permalink ? data.permalink : (CONFIG.root + data.path);
          return (
            '<a href="' + link + '" class="algolia-hit-item-link">' +
              data._highlightResult.title.value +
            '</a>'
          );
        },
        empty: function (data) {
          return (
            '<div id="algolia-hits-empty">' +
              algoliaSettings.labels.hits_empty.replace(/\$\{query}/, data.query) +
            '</div>'
          );
        }
      },
      cssClasses: {
        item: 'algolia-hit-item'
      }
    }),

    instantsearch.widgets.stats({
      container: '#algolia-stats',
      templates: {
        body: function (data) {
          var stats = algoliaSettings.labels.hits_stats
                        .replace(/\$\{hits}/, data.nbHits)
                        .replace(/\$\{time}/, data.processingTimeMS);
          return (
            stats +
            '<span class="algolia-powered">' +
            '  <img src="' + CONFIG.root + 'images/algolia_logo.svg" alt="Algolia" />' +
            '</span>' +
            '<hr />'
          );
        }
      }
    }),

    instantsearch.widgets.pagination({
      container: '#algolia-pagination',
      scrollTo: false,
      showFirstLast: false,
      labels: {
        first: '<i class="fa fa-angle-double-left"></i>',
        last: '<i class="fa fa-angle-double-right"></i>',
        previous: '<i class="fa fa-angle-left"></i>',
        next: '<i class="fa fa-angle-right"></i>'
      },
      cssClasses: {
        root: 'pagination',
        item: 'pagination-item',
        link: 'page-number',
        active: 'current',
        disabled: 'disabled-item'
      }
    })
  ].forEach(search.addWidget, search);

  search.start();

  $('.popup-trigger').on('click', function(e) {
    e.stopPropagation();
    $('body')
      .append('<div class="search-popup-overlay algolia-pop-overlay"></div>')
      .css('overflow', 'hidden');
    $('.popup').toggle();
    $('#algolia-search-input').find('input').focus();
  });

  $('.popup-btn-close').click(function(){
    $('.popup').hide();
    $('.algolia-pop-overlay').remove();
    $('body').css('overflow', '');
  });

});

/* global NexT: true */

$(document).ready(function () {

  $(document).trigger('bootstrap:before');

  NexT.utils.isMobile() && window.FastClick.attach(document.body);

  NexT.utils.lazyLoadPostsImages();

  NexT.utils.registerESCKeyEvent();

  NexT.utils.registerBackToTop();

  $('.site-nav-toggle button').on('click', function () {
    var $siteNav = $('.site-nav');
    var ON_CLASS_NAME = 'site-nav-on';
    var isSiteNavOn = $siteNav.hasClass(ON_CLASS_NAME);
    var animateAction = isSiteNavOn ? 'slideUp' : 'slideDown';
    var animateCallback = isSiteNavOn ? 'removeClass' : 'addClass';

    $siteNav.stop()[animateAction]('fast', function () {
      $siteNav[animateCallback](ON_CLASS_NAME);
    });
  });


  CONFIG.fancybox && NexT.utils.wrapImageWithFancyBox();
  NexT.utils.embeddedVideoTransformer();
  NexT.utils.addActiveClassToMenuItem();


  // Define Motion Sequence.
  NexT.motion.integrator
    .add(NexT.motion.middleWares.logo)
    .add(NexT.motion.middleWares.menu)
    .add(NexT.motion.middleWares.postList)
    .add(NexT.motion.middleWares.sidebar);

  $(document).trigger('motion:before');

  // Bootstrap Motion.
  CONFIG.motion && NexT.motion.integrator.bootstrap();

  $(document).trigger('bootstrap:after');
});

/* global NexT: true */

$(document).ready(function () {

  // Create Base64 Object
  var Base64={_keyStr:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",encode:function(e){var t="";var n,r,i,s,o,u,a;var f=0;e=Base64._utf8_encode(e);while(f<e.length){n=e.charCodeAt(f++);r=e.charCodeAt(f++);i=e.charCodeAt(f++);s=n>>2;o=(n&3)<<4|r>>4;u=(r&15)<<2|i>>6;a=i&63;if(isNaN(r)){u=a=64}else if(isNaN(i)){a=64}t=t+this._keyStr.charAt(s)+this._keyStr.charAt(o)+this._keyStr.charAt(u)+this._keyStr.charAt(a)}return t},decode:function(e){var t="";var n,r,i;var s,o,u,a;var f=0;e=e.replace(/[^A-Za-z0-9+/=]/g,"");while(f<e.length){s=this._keyStr.indexOf(e.charAt(f++));o=this._keyStr.indexOf(e.charAt(f++));u=this._keyStr.indexOf(e.charAt(f++));a=this._keyStr.indexOf(e.charAt(f++));n=s<<2|o>>4;r=(o&15)<<4|u>>2;i=(u&3)<<6|a;t=t+String.fromCharCode(n);if(u!=64){t=t+String.fromCharCode(r)}if(a!=64){t=t+String.fromCharCode(i)}}t=Base64._utf8_decode(t);return t},_utf8_encode:function(e){e=e.replace(/rn/g,"n");var t="";for(var n=0;n<e.length;n++){var r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r)}else if(r>127&&r<2048){t+=String.fromCharCode(r>>6|192);t+=String.fromCharCode(r&63|128)}else{t+=String.fromCharCode(r>>12|224);t+=String.fromCharCode(r>>6&63|128);t+=String.fromCharCode(r&63|128)}}return t},_utf8_decode:function(e){var t="";var n=0;var r=c1=c2=0;while(n<e.length){r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r);n++}else if(r>191&&r<224){c2=e.charCodeAt(n+1);t+=String.fromCharCode((r&31)<<6|c2&63);n+=2}else{c2=e.charCodeAt(n+1);c3=e.charCodeAt(n+2);t+=String.fromCharCode((r&15)<<12|(c2&63)<<6|c3&63);n+=3}}return t}};

  $('.exturl').on('click', function () {
    var $exturl = $(this).attr('data-url');
    var $decurl = Base64.decode($exturl);
    window.open($decurl, '_blank');
    return false;
  });

});

/* global DUOSHUO: true */
/* jshint camelcase: false */

typeof DUOSHUO !== 'undefined' ?
  hookTemplate() :
  ($('#duoshuo-script')[0].onload = hookTemplate);


function hookTemplate() {
  var post = DUOSHUO.templates.post;

  DUOSHUO.templates.post = function (e, t) {
    var rs = post(e, t);
    var agent = e.post.agent;
    var userId = e.post.author.user_id;
    var admin = '';

    if (userId && (userId == CONFIG.duoshuo.userId)) {
      admin = '<span class="duoshuo-ua-admin">' + CONFIG.duoshuo.author + '</span>';
    }

    if (agent && /^Mozilla/.test(agent)) {
      rs = rs.replace(/<\/div><p>/, admin + getAgentInfo(agent) + '</div><p>');
    }

    return rs;
  };
}

function getAgentInfo(string) {
  $.ua.set(string);

  var UNKNOWN = 'Unknown';
  var sua = $.ua;
  var separator = isMobile() ? '<br><br>' : '<span class="duoshuo-ua-separator"></span>';
  var osName = sua.os.name || UNKNOWN;
  var osVersion = sua.os.version  || UNKNOWN;
  var browserName = sua.browser.name || UNKNOWN;
  var browserVersion = sua.browser.version || UNKNOWN;
  var iconMapping = {
    os: {
      android : 'android',
      linux   : 'linux',
      windows : 'windows',
      ios     : 'apple',
      'mac os': 'apple',
      unknown : 'desktop'
    },
    browser: {
      chrome   : 'chrome',
      chromium : 'chrome',
      firefox  : 'firefox',
      opera    : 'opera',
      safari   : 'safari',
      ie       : 'internet-explorer',
      wechat   : 'wechat',
      qq       : 'qq',
      unknown  : 'globe'
    }
  };
  var osIcon = iconMapping.os[osName.toLowerCase()];
  var browserIcon =  iconMapping.browser[getBrowserKey()];

  return separator +
    '<span class="duoshuo-ua-platform duoshuo-ua-platform-' + osName.toLowerCase() + '">' +
       '<i class="fa fa-' + osIcon + '"></i>' +
       osName + ' ' + osVersion +
    '</span>' + separator +
    '<span class="duoshuo-ua-browser duoshuo-ua-browser-' + browserName.toLowerCase() + '">' +
      '<i class="fa fa-' + browserIcon + '"></i>' +
      browserName + ' ' + browserVersion +
    '</span>';

  function getBrowserKey () {
    var key = browserName.toLowerCase();

    if (key.match(/WeChat/i)) {
      return 'wechat';
    }

    if (key.match(/QQBrowser/i)) {
      return 'qq';
    }

    return key;
  }

  function isMobile() {
    var userAgent = window.navigator.userAgent;

    var isiPad = userAgent.match(/iPad/i) !== null;
    var mobileUA = [
      'iphone', 'android', 'phone', 'mobile',
      'wap', 'netfront', 'x11', 'java', 'opera mobi',
      'opera mini', 'ucweb', 'windows ce', 'symbian',
      'symbianos', 'series', 'webos', 'sony',
      'blackberry', 'dopod', 'nokia', 'samsung',
      'palmsource', 'xda', 'pieplus', 'meizu',
      'midp' ,'cldc' , 'motorola', 'foma',
      'docomo', 'up.browser', 'up.link', 'blazer',
      'helio', 'hosin', 'huawei', 'novarra',
      'coolpad', 'webos', 'techfaith', 'palmsource',
      'alcatel', 'amoi', 'ktouch', 'nexian',
      'ericsson', 'philips', 'sagem', 'wellcom',
      'bunjalloo', 'maui', 'smartphone', 'iemobile',
      'spice', 'bird', 'zte-', 'longcos',
      'pantech', 'gionee', 'portalmmm', 'jig browser',
      'hiptop', 'benq', 'haier', '^lct',
      '320x320', '240x320', '176x220'
    ];
    var pattern = new RegExp(mobileUA.join('|'), 'i');

    return !isiPad && userAgent.match(pattern);
  }
}

/* global NexT: true */

$(document).ready(function () {
  NexT.motion = {};

  var sidebarToggleLines = {
    lines: [],
    push: function (line) {
      this.lines.push(line);
    },
    init: function () {
      this.lines.forEach(function (line) {
        line.init();
      });
    },
    arrow: function () {
      this.lines.forEach(function (line) {
        line.arrow();
      });
    },
    close: function () {
      this.lines.forEach(function (line) {
        line.close();
      });
    }
  };

  function SidebarToggleLine(settings) {
    this.el = $(settings.el);
    this.status = $.extend({}, {
      init: {
        width: '100%',
        opacity: 1,
        left: 0,
        rotateZ: 0,
        top: 0
      }
    }, settings.status);
  }

  SidebarToggleLine.prototype.init = function () {
    this.transform('init');
  };
  SidebarToggleLine.prototype.arrow = function () {
    this.transform('arrow');
  };
  SidebarToggleLine.prototype.close = function () {
    this.transform('close');
  };
  SidebarToggleLine.prototype.transform = function (status) {
    this.el.velocity('stop').velocity(this.status[status]);
  };

  var sidebarToggleLine1st = new SidebarToggleLine({
    el: '.sidebar-toggle-line-first',
    status: {
      arrow: {width: '50%', rotateZ: '-45deg', top: '2px'},
      close: {width: '100%', rotateZ: '-45deg', top: '5px'}
    }
  });
  var sidebarToggleLine2nd = new SidebarToggleLine({
    el: '.sidebar-toggle-line-middle',
    status: {
      arrow: {width: '90%'},
      close: {opacity: 0}
    }
  });
  var sidebarToggleLine3rd = new SidebarToggleLine({
    el: '.sidebar-toggle-line-last',
    status: {
      arrow: {width: '50%', rotateZ: '45deg', top: '-2px'},
      close: {width: '100%', rotateZ: '45deg', top: '-5px'}
    }
  });

  sidebarToggleLines.push(sidebarToggleLine1st);
  sidebarToggleLines.push(sidebarToggleLine2nd);
  sidebarToggleLines.push(sidebarToggleLine3rd);

  var SIDEBAR_WIDTH = '320px';
  var SIDEBAR_DISPLAY_DURATION = 200;

  var sidebarToggleMotion = {
    toggleEl: $('.sidebar-toggle'),
    sidebarEl: $('.sidebar'),
    isSidebarVisible: false,
    init: function () {
      this.toggleEl.on('click', this.clickHandler.bind(this));
      this.toggleEl.on('mouseenter', this.mouseEnterHandler.bind(this));
      this.toggleEl.on('mouseleave', this.mouseLeaveHandler.bind(this));

      $(document)
        .on('sidebar.isShowing', function () {
          NexT.utils.isDesktop() && $('body').velocity('stop').velocity(
            {paddingRight: SIDEBAR_WIDTH},
            SIDEBAR_DISPLAY_DURATION
          );
        })
        .on('sidebar.isHiding', function () {
        });
    },
    clickHandler: function () {
      this.isSidebarVisible ? this.hideSidebar() : this.showSidebar();
      this.isSidebarVisible = !this.isSidebarVisible;
    },
    mouseEnterHandler: function () {
      if (this.isSidebarVisible) {
        return;
      }
      sidebarToggleLines.arrow();
    },
    mouseLeaveHandler: function () {
      if (this.isSidebarVisible) {
        return;
      }
      sidebarToggleLines.init();
    },
    showSidebar: function () {
      var self = this;

      sidebarToggleLines.close();

      this.sidebarEl.velocity('stop').velocity({
          width: SIDEBAR_WIDTH
        }, {
          display: 'block',
          duration: SIDEBAR_DISPLAY_DURATION,
          begin: function () {
            $('.sidebar .motion-element').velocity(
              'transition.slideRightIn',
              {
                stagger: 50,
                drag: true,
                complete: function () {
                  self.sidebarEl.trigger('sidebar.motion.complete');
                }
              }
            );
          },
          complete: function () {
            self.sidebarEl.addClass('sidebar-active');
            self.sidebarEl.trigger('sidebar.didShow');
          }
        }
      );

      this.sidebarEl.trigger('sidebar.isShowing');
    },
    hideSidebar: function () {
      NexT.utils.isDesktop() && $('body').velocity('stop').velocity({paddingRight: 0});
      this.sidebarEl.find('.motion-element').velocity('stop').css('display', 'none');
      this.sidebarEl.velocity('stop').velocity({width: 0}, {display: 'none'});

      sidebarToggleLines.init();

      this.sidebarEl.removeClass('sidebar-active');
      this.sidebarEl.trigger('sidebar.isHiding');

      //在 post 页面下按下隐藏 sidebar 时如果当前选中的是“站点概览”，将 toc 去除 motion 效果
      //防止再次打开时会出现在“站点概览”下的 bug
      if (!!$('.post-toc-wrap')) {
        if ($('.site-overview').css('display') === 'block') {
          $('.post-toc-wrap').removeClass('motion-element');
        }
      }
    }
  };
  sidebarToggleMotion.init();

  NexT.motion.integrator = {
    queue: [],
    cursor: -1,
    add: function (fn) {
      this.queue.push(fn);
      return this;
    },
    next: function () {
      this.cursor++;
      var fn = this.queue[this.cursor];
      $.isFunction(fn) && fn(NexT.motion.integrator);
    },
    bootstrap: function () {
      this.next();
    }
  };

  NexT.motion.middleWares =  {
    logo: function (integrator) {
      var sequence = [];
      var $brand = $('.brand');
      var $title = $('.site-title');
      var $subtitle = $('.site-subtitle');
      var $logoLineTop = $('.logo-line-before i');
      var $logoLineBottom = $('.logo-line-after i');

      $brand.size() > 0 && sequence.push({
        e: $brand,
        p: {opacity: 1},
        o: {duration: 200}
      });

      NexT.utils.isMist() && hasElement([$logoLineTop, $logoLineBottom]) &&
      sequence.push(
        getMistLineSettings($logoLineTop, '100%'),
        getMistLineSettings($logoLineBottom, '-100%')
      );

      hasElement($title) && sequence.push({
        e: $title,
        p: {opacity: 1, top: 0},
        o: { duration: 200 }
      });

      hasElement($subtitle) && sequence.push({
        e: $subtitle,
        p: {opacity: 1, top: 0},
        o: {duration: 200}
      });

      if (sequence.length > 0) {
        sequence[sequence.length - 1].o.complete = function () {
          integrator.next();
        };
        $.Velocity.RunSequence(sequence);
      } else {
        integrator.next();
      }


      function getMistLineSettings (element, translateX) {
        return {
          e: $(element),
          p: {translateX: translateX},
          o: {
            duration: 500,
            sequenceQueue: false
          }
        };
      }

      /**
       * Check if $elements exist.
       * @param {jQuery|Array} $elements
       * @returns {boolean}
       */
      function hasElement ($elements) {
        $elements = Array.isArray($elements) ? $elements : [$elements];
        return $elements.every(function ($element) {
          return $.isFunction($element.size) && $element.size() > 0;
        });
      }
    },

    menu: function (integrator) {
      $('.menu-item').velocity('transition.slideDownIn', {
        display: null,
        duration: 200,
        complete: function () {
          integrator.next();
        }
      });
    },

    postList: function (integrator) {
      var $post = $('.post');
      var hasPost = $post.size() > 0;

      hasPost ? postMotion() : integrator.next();

      function postMotion () {
        var postMotionOptions = window.postMotionOptions || {
            stagger: 100,
            drag: true
          };
        postMotionOptions.complete = function () {
          integrator.next();
        };

        $post.velocity('transition.slideDownIn', postMotionOptions);
      }
    },

    sidebar: function (integrator) {
      if (CONFIG.sidebar.display === 'always') {
        NexT.utils.displaySidebar();
      }
      integrator.next();
    }
  };

});

/* global NexT: true */

$(document).ready(function () {

  initScrollSpy();
  NexT.utils.needAffix() && initAffix();
  initTOCDimension();

  function initScrollSpy () {
    var tocSelector = '.post-toc';
    var $tocElement = $(tocSelector);
    var activeCurrentSelector = '.active-current';

    $tocElement
      .on('activate.bs.scrollspy', function () {
        var $currentActiveElement = $(tocSelector + ' .active').last();

        removeCurrentActiveClass();
        $currentActiveElement.addClass('active-current');
      })
      .on('clear.bs.scrollspy', removeCurrentActiveClass);

    $('body').scrollspy({ target: tocSelector });

    function removeCurrentActiveClass () {
      $(tocSelector + ' ' + activeCurrentSelector)
        .removeClass(activeCurrentSelector.substring(1));
    }
  }

  // Sidebar float
  function initAffix () {
    var headerHeight = $('.header-inner').height();
    var footerOffset = parseInt($('.main').css('padding-bottom'), 10);

    /*jshint camelcase: false */
    var sidebarTop = (CONFIG.sidebar.offset_float === 0) ?
      headerHeight + CONFIG.sidebar.offset :
      headerHeight;
    /*jshint camelcase: true */

    $('.sidebar-inner').affix({
      offset: {
        top: sidebarTop,
        bottom: footerOffset
      }
    });

    $(document)
      .on('affixed.bs.affix', function () {
        updateTOCHeight(document.body.clientHeight - 100);
      });
  }

  function initTOCDimension () {
    var updateTOCHeightTimer;

    $(window).on('resize', function () {
      updateTOCHeightTimer && clearTimeout(updateTOCHeightTimer);

      updateTOCHeightTimer = setTimeout(function () {
        var tocWrapperHeight = document.body.clientHeight - 100;

        updateTOCHeight(tocWrapperHeight);
      }, 0);
    });

    // Initialize TOC Height.
    updateTOCHeight(document.body.clientHeight - 100);

    // Initialize TOC Width.
    var scrollbarWidth = NexT.utils.getScrollbarWidth();
    $('.post-toc').css('width', 'calc(100% + ' + scrollbarWidth + 'px)');
  }

  function updateTOCHeight (height) {
    height = height || 'auto';
    $('.post-toc').css('max-height', height);
  }

});

$(document).ready(function () {
  var html = $('html');
  var TAB_ANIMATE_DURATION = 200;
  var hasVelocity = $.isFunction(html.velocity);

  $('.sidebar-nav li').on('click', function () {
    var item = $(this);
    var activeTabClassName = 'sidebar-nav-active';
    var activePanelClassName = 'sidebar-panel-active';
    if (item.hasClass(activeTabClassName)) {
      return;
    }

    var currentTarget = $('.' + activePanelClassName);
    var target = $('.' + item.data('target'));

    hasVelocity ?
      currentTarget.velocity('transition.slideUpOut', TAB_ANIMATE_DURATION, function () {
        target
          .velocity('stop')
          .velocity('transition.slideDownIn', TAB_ANIMATE_DURATION)
          .addClass(activePanelClassName);
      }) :
      currentTarget.animate({ opacity: 0 }, TAB_ANIMATE_DURATION, function () {
        currentTarget.hide();
        target
          .stop()
          .css({'opacity': 0, 'display': 'block'})
          .animate({ opacity: 1 }, TAB_ANIMATE_DURATION, function () {
            currentTarget.removeClass(activePanelClassName);
            target.addClass(activePanelClassName);
          });
      });

    item.siblings().removeClass(activeTabClassName);
    item.addClass(activeTabClassName);
  });

  $('.post-toc a').on('click', function (e) {
    e.preventDefault();
    var targetSelector = NexT.utils.escapeSelector(this.getAttribute('href'));
    var offset = $(targetSelector).offset().top;

    hasVelocity ?
      html.velocity('stop').velocity('scroll', {
        offset: offset  + 'px',
        mobileHA: false
      }) :
      $('html, body').stop().animate({
        scrollTop: offset
      }, 500);
  });

  // Expand sidebar on post detail page by default, when post has a toc.
  NexT.motion.middleWares.sidebar = function () {
    var $tocContent = $('.post-toc-content');

    if (CONFIG.sidebar.display === 'post' || CONFIG.sidebar.display === 'always') {
      if ($tocContent.length > 0 && $tocContent.html().trim().length > 0) {
        NexT.utils.displaySidebar();
      }
    }
  };
});

/* ========================================================================
* Bootstrap: scrollspy.js v3.3.2
* http://getbootstrap.com/javascript/#scrollspy
* ========================================================================
* Copyright 2011-2015 Twitter, Inc.
* Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
* ======================================================================== */

/**
 * Custom by iissnan
 *
 * - Add a `clear.bs.scrollspy` event.
 * - Esacpe targets selector.
 */


+function ($) {
  'use strict';

  // SCROLLSPY CLASS DEFINITION
  // ==========================

  function ScrollSpy(element, options) {
    this.$body          = $(document.body)
    this.$scrollElement = $(element).is(document.body) ? $(window) : $(element)
    this.options        = $.extend({}, ScrollSpy.DEFAULTS, options)
    this.selector       = (this.options.target || '') + ' .nav li > a'
    this.offsets        = []
    this.targets        = []
    this.activeTarget   = null
    this.scrollHeight   = 0

    this.$scrollElement.on('scroll.bs.scrollspy', $.proxy(this.process, this))
    this.refresh()
    this.process()
  }

  ScrollSpy.VERSION  = '3.3.2'

  ScrollSpy.DEFAULTS = {
    offset: 10
  }

  ScrollSpy.prototype.getScrollHeight = function () {
    return this.$scrollElement[0].scrollHeight || Math.max(this.$body[0].scrollHeight, document.documentElement.scrollHeight)
  }

  ScrollSpy.prototype.refresh = function () {
    var that          = this
    var offsetMethod  = 'offset'
    var offsetBase    = 0

    this.offsets      = []
    this.targets      = []
    this.scrollHeight = this.getScrollHeight()

    if (!$.isWindow(this.$scrollElement[0])) {
      offsetMethod = 'position'
      offsetBase   = this.$scrollElement.scrollTop()
    }

    this.$body
      .find(this.selector)
      .map(function () {
        var $el   = $(this)
        var href  = $el.data('target') || $el.attr('href')
        var $href = /^#./.test(href) && $(NexT.utils.escapeSelector(href)) // Need to escape selector.

        return ($href
          && $href.length
          && $href.is(':visible')
          && [[$href[offsetMethod]().top + offsetBase, href]]) || null
      })
      .sort(function (a, b) { return a[0] - b[0] })
      .each(function () {
        that.offsets.push(this[0])
        that.targets.push(this[1])
      })


  }

  ScrollSpy.prototype.process = function () {
    var scrollTop    = this.$scrollElement.scrollTop() + this.options.offset
    var scrollHeight = this.getScrollHeight()
    var maxScroll    = this.options.offset + scrollHeight - this.$scrollElement.height()
    var offsets      = this.offsets
    var targets      = this.targets
    var activeTarget = this.activeTarget
    var i

    if (this.scrollHeight != scrollHeight) {
      this.refresh()
    }

    if (scrollTop >= maxScroll) {
      return activeTarget != (i = targets[targets.length - 1]) && this.activate(i)
    }

    if (activeTarget && scrollTop < offsets[0]) {
      $(this.selector).trigger('clear.bs.scrollspy')  // Add a custom event.
      this.activeTarget = null
      return this.clear()
    }

    for (i = offsets.length; i--;) {
      activeTarget != targets[i]
        && scrollTop >= offsets[i]
        && (!offsets[i + 1] || scrollTop <= offsets[i + 1])
        && this.activate(targets[i])
    }
  }

  ScrollSpy.prototype.activate = function (target) {
    this.activeTarget = target

    this.clear()

    var selector = this.selector +
      '[data-target="' + target + '"],' +
      this.selector + '[href="' + target + '"]'

    var active = $(selector)
      .parents('li')
      .addClass('active')

    if (active.parent('.dropdown-menu').length) {
      active = active
        .closest('li.dropdown')
        .addClass('active')
    }

    active.trigger('activate.bs.scrollspy')
  }

  ScrollSpy.prototype.clear = function () {
    $(this.selector)
      .parentsUntil(this.options.target, '.active')
      .removeClass('active')
  }


  // SCROLLSPY PLUGIN DEFINITION
  // ===========================

  function Plugin(option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.scrollspy')
      var options = typeof option == 'object' && option

      if (!data) $this.data('bs.scrollspy', (data = new ScrollSpy(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  var old = $.fn.scrollspy

  $.fn.scrollspy             = Plugin
  $.fn.scrollspy.Constructor = ScrollSpy


  // SCROLLSPY NO CONFLICT
  // =====================

  $.fn.scrollspy.noConflict = function () {
    $.fn.scrollspy = old
    return this
  }


  // SCROLLSPY DATA-API
  // ==================

  $(window).on('load.bs.scrollspy.data-api', function () {
    $('[data-spy="scroll"]').each(function () {
      var $spy = $(this)
      Plugin.call($spy, $spy.data())
    })
  })

}(jQuery);

/* global NexT: true */

NexT.utils = NexT.$u = {
  /**
   * Wrap images with fancybox support.
   */
  wrapImageWithFancyBox: function () {
    $('.content img')
      .not('[hidden]')
      .not('.group-picture img, .post-gallery img')
      .each(function () {
        var $image = $(this);
        var imageTitle = $image.attr('title');
        var $imageWrapLink = $image.parent('a');

        if ($imageWrapLink.size() < 1) {
          $imageWrapLink = $image.wrap('<a href="' + this.getAttribute('src') + '"></a>').parent('a');
        }

        $imageWrapLink.addClass('fancybox fancybox.image');
        $imageWrapLink.attr('rel', 'group');

        if (imageTitle) {
          $imageWrapLink.append('<p class="image-caption">' + imageTitle + '</p>');

          //make sure img title tag will show correctly in fancybox
          $imageWrapLink.attr('title', imageTitle);
        }
      });

    $('.fancybox').fancybox({
      helpers: {
        overlay: {
          locked: false
        }
      }
    });
  },

  lazyLoadPostsImages: function () {
    $('#posts').find('img').lazyload({
      placeholder: '/images/loading.gif',
      effect: 'fadeIn'
    });
  },

  registerESCKeyEvent: function () {
    $(document).on('keyup', function (event) {
      var shouldDismissSearchPopup = event.which === 27 &&
        $('.search-popup').is(':visible');
      if (shouldDismissSearchPopup) {
        $('.search-popup').hide();
        $('.search-popup-overlay').remove();
        $('body').css('overflow', '');
      }
    });
  },

  registerBackToTop: function () {
    var THRESHOLD = 50;
    var $top = $('.back-to-top');

    $(window).on('scroll', function () {
      $top.toggleClass('back-to-top-on', window.pageYOffset > THRESHOLD);

      var scrollTop = $(window).scrollTop();
      var docHeight = $(document).height();
      var winHeight = $(window).height();
      var scrollPercent = (scrollTop) / (docHeight - winHeight);
      var scrollPercentRounded = Math.round(scrollPercent*100);
      $('#scrollpercent>span').html(scrollPercentRounded);
    });

    $top.on('click', function () {
      $('body').velocity('scroll');
    });
  },

  /**
   * Transform embedded video to support responsive layout.
   * @see http://toddmotto.com/fluid-and-responsive-youtube-and-vimeo-videos-with-fluidvids-js/
   */
  embeddedVideoTransformer: function () {
    var $iframes = $('iframe');

    // Supported Players. Extend this if you need more players.
    var SUPPORTED_PLAYERS = [
      'www.youtube.com',
      'player.vimeo.com',
      'player.youku.com',
      'music.163.com',
      'www.tudou.com'
    ];
    var pattern = new RegExp( SUPPORTED_PLAYERS.join('|') );

    $iframes.each(function () {
      var iframe = this;
      var $iframe = $(this);
      var oldDimension = getDimension($iframe);
      var newDimension;

      if (this.src.search(pattern) > 0) {

        // Calculate the video ratio based on the iframe's w/h dimensions
        var videoRatio = getAspectRadio(oldDimension.width, oldDimension.height);

        // Replace the iframe's dimensions and position the iframe absolute
        // This is the trick to emulate the video ratio
        $iframe.width('100%').height('100%')
          .css({
            position: 'absolute',
            top: '0',
            left: '0'
          });


        // Wrap the iframe in a new <div> which uses a dynamically fetched padding-top property
        // based on the video's w/h dimensions
        var wrap = document.createElement('div');
        wrap.className = 'fluid-vids';
        wrap.style.position = 'relative';
        wrap.style.marginBottom = '20px';
        wrap.style.width = '100%';
        wrap.style.paddingTop = videoRatio + '%';

        // Add the iframe inside our newly created <div>
        var iframeParent = iframe.parentNode;
        iframeParent.insertBefore(wrap, iframe);
        wrap.appendChild(iframe);

        // Additional adjustments for 163 Music
        if (this.src.search('music.163.com') > 0) {
          newDimension = getDimension($iframe);
          var shouldRecalculateAspect = newDimension.width > oldDimension.width ||
                                        newDimension.height < oldDimension.height;

          // 163 Music Player has a fixed height, so we need to reset the aspect radio
          if (shouldRecalculateAspect) {
            wrap.style.paddingTop = getAspectRadio(newDimension.width, oldDimension.height) + '%';
          }
        }
      }
    });

    function getDimension($element) {
      return {
        width: $element.width(),
        height: $element.height()
      };
    }

    function getAspectRadio(width, height) {
      return height / width * 100;
    }
  },

  /**
   * Add `menu-item-active` class name to menu item
   * via comparing location.path with menu item's href.
   */
  addActiveClassToMenuItem: function () {
    var path = window.location.pathname;
    path = path === '/' ? path : path.substring(0, path.length - 1);
    $('.menu-item a[href="' + path + '"]').parent().addClass('menu-item-active');
  },

  hasMobileUA: function () {
    var nav = window.navigator;
    var ua = nav.userAgent;
    var pa = /iPad|iPhone|Android|Opera Mini|BlackBerry|webOS|UCWEB|Blazer|PSP|IEMobile|Symbian/g;

    return pa.test(ua);
  },

  isTablet: function () {
    return window.screen.width < 992 && window.screen.width > 767 && this.hasMobileUA();
  },

  isMobile: function () {
    return window.screen.width < 767 && this.hasMobileUA();
  },

  isDesktop: function () {
    return !this.isTablet() && !this.isMobile();
  },

  /**
   * Escape meta symbols in jQuery selectors.
   *
   * @param selector
   * @returns {string|void|XML|*}
   */
  escapeSelector: function (selector) {
    return selector.replace(/[!"$%&'()*+,.\/:;<=>?@[\\\]^`{|}~]/g, '\\$&');
  },

  displaySidebar: function () {
    if (!this.isDesktop() || this.isPisces()) {
      return;
    }
    $('.sidebar-toggle').trigger('click');
  },

  isMist: function () {
    return CONFIG.scheme === 'Mist';
  },

  isPisces: function () {
    return CONFIG.scheme === 'Pisces';
  },

  getScrollbarWidth: function () {
    var $div = $('<div />').addClass('scrollbar-measure').prependTo('body');
    var div = $div[0];
    var scrollbarWidth = div.offsetWidth - div.clientWidth;

    $div.remove();

    return scrollbarWidth;
  },

  /**
   * Affix behaviour for Sidebar.
   *
   * @returns {Boolean}
   */
  needAffix: function () {
    return this.isPisces();
  }
};

/*! instantsearch.js 1.5.0 | © Algolia Inc. and other contributors; Licensed MIT | github.com/algolia/instantsearch.js */
!function(e,t){"object"==typeof exports&&"object"==typeof module?module.exports=t():"function"==typeof define&&define.amd?define([],t):"object"==typeof exports?exports.instantsearch=t():e.instantsearch=t()}(this,function(){return function(e){function t(r){if(n[r])return n[r].exports;var o=n[r]={exports:{},id:r,loaded:!1};return e[r].call(o.exports,o,o.exports,t),o.loaded=!0,o.exports}var n={};return t.m=e,t.c=n,t.p="",t(0)}([function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{"default":e}}var o=n(1),i=r(o);e.exports=i["default"]},function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{"default":e}}Object.defineProperty(t,"__esModule",{value:!0}),n(2),n(3);var o=n(4),i=r(o),a=n(5),s=r(a),u=n(99),l=r(u),c=n(222),f=r(c),p=n(400),d=r(p),h=n(404),m=r(h),v=n(408),g=r(v),y=n(411),b=r(y),_=n(416),C=r(_),w=n(420),x=r(w),P=n(422),E=r(P),R=n(424),S=r(R),O=n(425),T=r(O),k=n(432),N=r(k),j=n(437),A=r(j),M=n(439),F=r(M),I=n(443),D=r(I),U=n(444),L=r(U),H=n(447),V=r(H),B=n(450),q=r(B),W=n(220),K=r(W),Q=(0,i["default"])(s["default"]);Q.widgets={clearAll:f["default"],currentRefinedValues:d["default"],hierarchicalMenu:m["default"],hits:g["default"],hitsPerPageSelector:b["default"],menu:C["default"],refinementList:x["default"],numericRefinementList:E["default"],numericSelector:S["default"],pagination:T["default"],priceRanges:N["default"],searchBox:A["default"],rangeSlider:F["default"],sortBySelector:D["default"],starRating:L["default"],stats:V["default"],toggle:q["default"]},Q.version=K["default"],Q.createQueryString=l["default"].url.getQueryStringFromState,t["default"]=Q},function(e,t){"use strict";Object.freeze||(Object.freeze=function(e){if(Object(e)!==e)throw new TypeError("Object.freeze can only be called on Objects.");return e})},function(e,t){"use strict";var n={};if(!Object.setPrototypeOf&&!n.__proto__){var r=Object.getPrototypeOf;Object.getPrototypeOf=function(e){return e.__proto__?e.__proto__:r.call(Object,e)}}},function(e,t){"use strict";function n(e){var t=function(){for(var t=arguments.length,n=Array(t),o=0;t>o;o++)n[o]=arguments[o];return new(r.apply(e,[null].concat(n)))};return t.__proto__=e,t.prototype=e.prototype,t}var r=Function.prototype.bind;e.exports=n},function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{"default":e}}function o(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function i(e,t){if(!e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!t||"object"!=typeof t&&"function"!=typeof t?e:t}function a(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function, not "+typeof t);e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),t&&(Object.setPrototypeOf?Object.setPrototypeOf(e,t):e.__proto__=t)}function s(){return"#"}function u(e,t){if(!t.getConfiguration)return e;var n=t.getConfiguration(e);return(0,y["default"])({},e,n,function(e,t){return Array.isArray(e)?(0,_["default"])(e,t):void 0})}Object.defineProperty(t,"__esModule",{value:!0});var l=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var r in n)Object.prototype.hasOwnProperty.call(n,r)&&(e[r]=n[r])}return e},c=function(){function e(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(t,n,r){return n&&e(t.prototype,n),r&&e(t,r),t}}(),f=n(6),p=r(f),d=n(99),h=r(d),m=n(15),v=r(m),g=n(80),y=r(g),b=n(217),_=r(b),C=n(45),w=r(C),x=n(89),P=n(219),E=r(P),R=n(220),S=r(R),O=n(221),T=r(O),k=function(e){function t(e){var n=e.appId,r=void 0===n?null:n,a=e.apiKey,s=void 0===a?null:a,u=e.indexName,c=void 0===u?null:u,f=e.numberLocale,d=e.searchParameters,h=void 0===d?{}:d,m=e.urlSync,v=void 0===m?null:m,g=e.searchFunction;o(this,t);var y=i(this,Object.getPrototypeOf(t).call(this));if(null===r||null===s||null===c){var b="\nUsage: instantsearch({\n  appId: 'my_application_id',\n  apiKey: 'my_search_api_key',\n  indexName: 'my_index_name'\n});";throw new Error(b)}var _=(0,p["default"])(r,s);return _.addAlgoliaAgent("instantsearch.js "+S["default"]),y.client=_,y.helper=null,y.indexName=c,y.searchParameters=l({},h,{index:c}),y.widgets=[],y.templatesConfig={helpers:(0,T["default"])({numberLocale:f}),compileOptions:{}},g&&(y._searchFunction=g),y.urlSync=v===!0?{}:v,y}return a(t,e),c(t,[{key:"addWidget",value:function(e){if(void 0===e.render&&void 0===e.init)throw new Error("Widget definition missing render or init method");this.widgets.push(e)}},{key:"start",value:function(){var e=this;if(!this.widgets)throw new Error("No widgets were added to instantsearch.js");if(this.urlSync){var t=(0,E["default"])(this.urlSync);this._createURL=t.createURL.bind(t),this._createAbsoluteURL=function(t){return e._createURL(t,{absolute:!0})},this._onHistoryChange=t.onHistoryChange.bind(t),this.widgets.push(t)}else this._createURL=s,this._createAbsoluteURL=s,this._onHistoryChange=function(){};this.searchParameters=this.widgets.reduce(u,this.searchParameters);var n=(0,h["default"])(this.client,this.searchParameters.index||this.indexName,this.searchParameters);this._searchFunction&&(this._originalHelperSearch=n.search.bind(n),n.search=this._wrappedSearch.bind(this)),this.helper=n,this._init(n.state,n),n.on("result",this._render.bind(this,n)),n.search()}},{key:"_wrappedSearch",value:function(){var e=(0,w["default"])(this.helper);e.search=this._originalHelperSearch,this._searchFunction(e)}},{key:"createURL",value:function(e){if(!this._createURL)throw new Error("You need to call start() before calling createURL()");return this._createURL(this.helper.state.setQueryParameters(e))}},{key:"_render",value:function(e,t,n){(0,v["default"])(this.widgets,function(r){r.render&&r.render({templatesConfig:this.templatesConfig,results:t,state:n,helper:e,createURL:this._createAbsoluteURL})},this),this.emit("render")}},{key:"_init",value:function(e,t){var n=this._onHistoryChange,r=this.templatesConfig;(0,v["default"])(this.widgets,function(o){o.init&&o.init({state:e,helper:t,templatesConfig:r,createURL:this._createAbsoluteURL,onHistoryChange:n})},this)}}]),t}(x.EventEmitter);t["default"]=k},function(e,t,n){"use strict";function r(e,t,i){var a=n(96),s=n(97);return i=a(i||{}),void 0===i.protocol&&(i.protocol=s()),i._ua=i._ua||r.ua,new o(e,t,i)}function o(){s.apply(this,arguments)}e.exports=r;var i=n(7),a=window.Promise||n(8).Promise,s=n(13),u=n(14),l=n(90),c=n(94),f=n(95);"development"==={NODE_ENV:"production"}.APP_ENV&&n(42).enable("algoliasearch*"),r.version=n(98),r.ua="Algolia for vanilla JavaScript "+r.version,r.initPlaces=f(r),window.__algolia={debug:n(42),algoliasearch:r};var p={hasXMLHttpRequest:"XMLHttpRequest"in window,hasXDomainRequest:"XDomainRequest"in window,cors:"withCredentials"in new XMLHttpRequest,timeout:"timeout"in new XMLHttpRequest};i(o,s),o.prototype._request=function(e,t){return new a(function(n,r){function o(){if(!c){p.timeout||clearTimeout(s);var e;try{e={body:JSON.parse(d.responseText),responseText:d.responseText,statusCode:d.status,headers:d.getAllResponseHeaders&&d.getAllResponseHeaders()||{}}}catch(t){e=new u.UnparsableJSON({more:d.responseText})}e instanceof u.UnparsableJSON?r(e):n(e)}}function i(e){c||(p.timeout||clearTimeout(s),r(new u.Network({more:e})))}function a(){p.timeout||(c=!0,d.abort()),r(new u.RequestTimeout)}if(!p.cors&&!p.hasXDomainRequest)return void r(new u.Network("CORS not supported"));e=l(e,t.headers);var s,c,f=t.body,d=p.cors?new XMLHttpRequest:new XDomainRequest;d instanceof XMLHttpRequest?d.open(t.method,e,!0):d.open(t.method,e),p.cors&&(f&&("POST"===t.method?d.setRequestHeader("content-type","application/x-www-form-urlencoded"):d.setRequestHeader("content-type","application/json")),d.setRequestHeader("accept","application/json")),d.onprogress=function(){},d.onload=o,d.onerror=i,p.timeout?(d.timeout=t.timeout,d.ontimeout=a):s=setTimeout(a,t.timeout),d.send(f)})},o.prototype._request.fallback=function(e,t){return e=l(e,t.headers),new a(function(n,r){c(e,t,function(e,t){return e?void r(e):void n(t)})})},o.prototype._promise={reject:function(e){return a.reject(e)},resolve:function(e){return a.resolve(e)},delay:function(e){return new a(function(t){setTimeout(t,e)})}}},function(e,t){"function"==typeof Object.create?e.exports=function(e,t){e.super_=t,e.prototype=Object.create(t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}})}:e.exports=function(e,t){e.super_=t;var n=function(){};n.prototype=t.prototype,e.prototype=new n,e.prototype.constructor=e}},function(e,t,n){var r;(function(e,o,i){(function(){"use strict";function a(e){return"function"==typeof e||"object"==typeof e&&null!==e}function s(e){return"function"==typeof e}function u(e){$=e}function l(e){X=e}function c(){return function(){e.nextTick(m)}}function f(){return function(){Q(m)}}function p(){var e=0,t=new ee(m),n=document.createTextNode("");return t.observe(n,{characterData:!0}),function(){n.data=e=++e%2}}function d(){var e=new MessageChannel;return e.port1.onmessage=m,function(){e.port2.postMessage(0)}}function h(){return function(){setTimeout(m,1)}}function m(){for(var e=0;G>e;e+=2){var t=re[e],n=re[e+1];t(n),re[e]=void 0,re[e+1]=void 0}G=0}function v(){try{var e=n(11);return Q=e.runOnLoop||e.runOnContext,f()}catch(t){return h()}}function g(e,t){var n=this,r=n._state;if(r===se&&!e||r===ue&&!t)return this;var o=new this.constructor(b),i=n._result;if(r){var a=arguments[r-1];X(function(){F(r,o,a,i)})}else N(n,o,e,t);return o}function y(e){var t=this;if(e&&"object"==typeof e&&e.constructor===t)return e;var n=new t(b);return S(n,e),n}function b(){}function _(){return new TypeError("You cannot resolve a promise with itself")}function C(){return new TypeError("A promises callback cannot return that same promise.")}function w(e){try{return e.then}catch(t){return le.error=t,le}}function x(e,t,n,r){try{e.call(t,n,r)}catch(o){return o}}function P(e,t,n){X(function(e){var r=!1,o=x(n,t,function(n){r||(r=!0,t!==n?S(e,n):T(e,n))},function(t){r||(r=!0,k(e,t))},"Settle: "+(e._label||" unknown promise"));!r&&o&&(r=!0,k(e,o))},e)}function E(e,t){t._state===se?T(e,t._result):t._state===ue?k(e,t._result):N(t,void 0,function(t){S(e,t)},function(t){k(e,t)})}function R(e,t,n){t.constructor===e.constructor&&n===oe&&constructor.resolve===ie?E(e,t):n===le?k(e,le.error):void 0===n?T(e,t):s(n)?P(e,t,n):T(e,t)}function S(e,t){e===t?k(e,_()):a(t)?R(e,t,w(t)):T(e,t)}function O(e){e._onerror&&e._onerror(e._result),j(e)}function T(e,t){e._state===ae&&(e._result=t,e._state=se,0!==e._subscribers.length&&X(j,e))}function k(e,t){e._state===ae&&(e._state=ue,e._result=t,X(O,e))}function N(e,t,n,r){var o=e._subscribers,i=o.length;e._onerror=null,o[i]=t,o[i+se]=n,o[i+ue]=r,0===i&&e._state&&X(j,e)}function j(e){var t=e._subscribers,n=e._state;if(0!==t.length){for(var r,o,i=e._result,a=0;a<t.length;a+=3)r=t[a],o=t[a+n],r?F(n,r,o,i):o(i);e._subscribers.length=0}}function A(){this.error=null}function M(e,t){try{return e(t)}catch(n){return ce.error=n,ce}}function F(e,t,n,r){var o,i,a,u,l=s(n);if(l){if(o=M(n,r),o===ce?(u=!0,i=o.error,o=null):a=!0,t===o)return void k(t,C())}else o=r,a=!0;t._state!==ae||(l&&a?S(t,o):u?k(t,i):e===se?T(t,o):e===ue&&k(t,o))}function I(e,t){try{t(function(t){S(e,t)},function(t){k(e,t)})}catch(n){k(e,n)}}function D(e){return new ve(this,e).promise}function U(e){function t(e){S(o,e)}function n(e){k(o,e)}var r=this,o=new r(b);if(!Y(e))return k(o,new TypeError("You must pass an array to race.")),o;for(var i=e.length,a=0;o._state===ae&&i>a;a++)N(r.resolve(e[a]),void 0,t,n);return o}function L(e){var t=this,n=new t(b);return k(n,e),n}function H(){throw new TypeError("You must pass a resolver function as the first argument to the promise constructor")}function V(){throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.")}function B(e){this._id=he++,this._state=void 0,this._result=void 0,this._subscribers=[],b!==e&&("function"!=typeof e&&H(),this instanceof B?I(this,e):V())}function q(e,t){this._instanceConstructor=e,this.promise=new e(b),Array.isArray(t)?(this._input=t,this.length=t.length,this._remaining=t.length,this._result=new Array(this.length),0===this.length?T(this.promise,this._result):(this.length=this.length||0,this._enumerate(),0===this._remaining&&T(this.promise,this._result))):k(this.promise,this._validationError())}function W(){var e;if("undefined"!=typeof o)e=o;else if("undefined"!=typeof self)e=self;else try{e=Function("return this")()}catch(t){throw new Error("polyfill failed because global object is unavailable in this environment")}var n=e.Promise;n&&"[object Promise]"===Object.prototype.toString.call(n.resolve())&&!n.cast||(e.Promise=me)}var K;K=Array.isArray?Array.isArray:function(e){return"[object Array]"===Object.prototype.toString.call(e)};var Q,$,z,Y=K,G=0,X=function(e,t){re[G]=e,re[G+1]=t,G+=2,2===G&&($?$(m):z())},J="undefined"!=typeof window?window:void 0,Z=J||{},ee=Z.MutationObserver||Z.WebKitMutationObserver,te="undefined"!=typeof e&&"[object process]"==={}.toString.call(e),ne="undefined"!=typeof Uint8ClampedArray&&"undefined"!=typeof importScripts&&"undefined"!=typeof MessageChannel,re=new Array(1e3);z=te?c():ee?p():ne?d():void 0===J?v():h();var oe=g,ie=y,ae=void 0,se=1,ue=2,le=new A,ce=new A,fe=D,pe=U,de=L,he=0,me=B;B.all=fe,B.race=pe,B.resolve=ie,B.reject=de,B._setScheduler=u,B._setAsap=l,B._asap=X,B.prototype={constructor:B,then:oe,"catch":function(e){return this.then(null,e)}};var ve=q;q.prototype._validationError=function(){return new Error("Array Methods must be provided an Array")},q.prototype._enumerate=function(){for(var e=this.length,t=this._input,n=0;this._state===ae&&e>n;n++)this._eachEntry(t[n],n)},q.prototype._eachEntry=function(e,t){var n=this._instanceConstructor,r=n.resolve;if(r===ie){var o=w(e);if(o===oe&&e._state!==ae)this._settledAt(e._state,t,e._result);else if("function"!=typeof o)this._remaining--,this._result[t]=e;else if(n===me){var i=new n(b);R(i,e,o),this._willSettleAt(i,t)}else this._willSettleAt(new n(function(t){t(e)}),t)}else this._willSettleAt(r(e),t)},q.prototype._settledAt=function(e,t,n){var r=this.promise;r._state===ae&&(this._remaining--,e===ue?k(r,n):this._result[t]=n),0===this._remaining&&T(r,this._result)},q.prototype._willSettleAt=function(e,t){var n=this;N(e,void 0,function(e){n._settledAt(se,t,e)},function(e){n._settledAt(ue,t,e)})};var ge=W,ye={Promise:me,polyfill:ge};n(12).amd?(r=function(){return ye}.call(t,n,t,i),!(void 0!==r&&(i.exports=r))):"undefined"!=typeof i&&i.exports?i.exports=ye:"undefined"!=typeof this&&(this.ES6Promise=ye),ge()}).call(this)}).call(t,n(9),function(){return this}(),n(10)(e))},function(e,t){function n(){l=!1,a.length?u=a.concat(u):c=-1,u.length&&r()}function r(){if(!l){var e=setTimeout(n);l=!0;for(var t=u.length;t;){for(a=u,u=[];++c<t;)a&&a[c].run();c=-1,t=u.length}a=null,l=!1,clearTimeout(e)}}function o(e,t){this.fun=e,this.array=t}function i(){}var a,s=e.exports={},u=[],l=!1,c=-1;s.nextTick=function(e){var t=new Array(arguments.length-1);if(arguments.length>1)for(var n=1;n<arguments.length;n++)t[n-1]=arguments[n];u.push(new o(e,t)),1!==u.length||l||setTimeout(r,0)},o.prototype.run=function(){this.fun.apply(null,this.array)},s.title="browser",s.browser=!0,s.env={},s.argv=[],s.version="",s.versions={},s.on=i,s.addListener=i,s.once=i,s.off=i,s.removeListener=i,s.removeAllListeners=i,s.emit=i,s.binding=function(e){throw new Error("process.binding is not supported")},s.cwd=function(){return"/"},s.chdir=function(e){throw new Error("process.chdir is not supported")},s.umask=function(){return 0}},function(e,t){e.exports=function(e){return e.webpackPolyfill||(e.deprecate=function(){},e.paths=[],e.children=[],e.webpackPolyfill=1),e}},function(e,t){},function(e,t){e.exports=function(){throw new Error("define cannot be used indirect")}},function(e,t,n){"use strict";function r(e,t,r){var i=n(42)("algoliasearch"),a=n(45),s=n(34),u=n(55),l="Usage: algoliasearch(applicationID, apiKey, opts)";if(!e)throw new c.AlgoliaSearchError("Please provide an application ID. "+l);if(!t)throw new c.AlgoliaSearchError("Please provide an API key. "+l);this.applicationID=e,this.apiKey=t;var f=[this.applicationID+"-1.algolianet.com",this.applicationID+"-2.algolianet.com",this.applicationID+"-3.algolianet.com"];this.hosts={read:[],write:[]},this.hostIndex={read:0,write:0},r=r||{};var p=r.protocol||"https:",d=void 0===r.timeout?2e3:r.timeout;if(/:$/.test(p)||(p+=":"),"http:"!==r.protocol&&"https:"!==r.protocol)throw new c.AlgoliaSearchError("protocol must be `http:` or `https:` (was `"+r.protocol+"`)");r.hosts?s(r.hosts)?(this.hosts.read=a(r.hosts),this.hosts.write=a(r.hosts)):(this.hosts.read=a(r.hosts.read),this.hosts.write=a(r.hosts.write)):(this.hosts.read=[this.applicationID+"-dsn.algolia.net"].concat(f),this.hosts.write=[this.applicationID+".algolia.net"].concat(f)),this.hosts.read=u(this.hosts.read,o(p)),this.hosts.write=u(this.hosts.write,o(p)),this.requestTimeout=d,this.extraHeaders=[],this.cache=r._cache||{},this._ua=r._ua,this._useCache=void 0===r._useCache||r._cache?!0:r._useCache,this._useFallback=void 0===r.useFallback?!0:r.useFallback,this._setTimeout=r._setTimeout,i("init done, %j",this)}function o(e){return function(t){return e+"//"+t.toLowerCase()}}function i(){var e="Not implemented in this environment.\nIf you feel this is a mistake, write to support@algolia.com";throw new c.AlgoliaSearchError(e)}function a(e,t){var n=e.toLowerCase().replace(".","").replace("()","");return"algoliasearch: `"+e+"` was replaced by `"+t+"`. Please see https://github.com/algolia/algoliasearch-client-js/wiki/Deprecated#"+n}function s(e,t){t(e,0)}function u(e,t){function n(){return r||(console.log(t),r=!0),e.apply(this,arguments)}var r=!1;return n}function l(e){if(void 0===Array.prototype.toJSON)return JSON.stringify(e);var t=Array.prototype.toJSON;delete Array.prototype.toJSON;var n=JSON.stringify(e);return Array.prototype.toJSON=t,n}e.exports=r;var c=n(14),f=n(41),p=500;r.prototype={deleteIndex:function(e,t){return this._jsonRequest({method:"DELETE",url:"/1/indexes/"+encodeURIComponent(e),hostType:"write",callback:t})},moveIndex:function(e,t,n){var r={operation:"move",destination:t};return this._jsonRequest({method:"POST",url:"/1/indexes/"+encodeURIComponent(e)+"/operation",body:r,hostType:"write",callback:n})},copyIndex:function(e,t,n){var r={operation:"copy",destination:t};return this._jsonRequest({method:"POST",url:"/1/indexes/"+encodeURIComponent(e)+"/operation",body:r,hostType:"write",callback:n})},getLogs:function(e,t,n){return 0===arguments.length||"function"==typeof e?(n=e,e=0,t=10):1!==arguments.length&&"function"!=typeof t||(n=t,t=10),this._jsonRequest({method:"GET",url:"/1/logs?offset="+e+"&length="+t,hostType:"read",callback:n})},listIndexes:function(e,t){var n="";return void 0===e||"function"==typeof e?t=e:n="?page="+e,this._jsonRequest({method:"GET",url:"/1/indexes"+n,hostType:"read",callback:t})},initIndex:function(e){return new this.Index(this,e)},listUserKeys:function(e){return this._jsonRequest({method:"GET",url:"/1/keys",hostType:"read",callback:e})},getUserKeyACL:function(e,t){return this._jsonRequest({method:"GET",url:"/1/keys/"+e,hostType:"read",callback:t})},deleteUserKey:function(e,t){return this._jsonRequest({method:"DELETE",url:"/1/keys/"+e,hostType:"write",callback:t})},addUserKey:function(e,t,r){var o=n(34),i="Usage: client.addUserKey(arrayOfAcls[, params, callback])";if(!o(e))throw new Error(i);1!==arguments.length&&"function"!=typeof t||(r=t,t=null);var a={acl:e};return t&&(a.validity=t.validity,a.maxQueriesPerIPPerHour=t.maxQueriesPerIPPerHour,a.maxHitsPerQuery=t.maxHitsPerQuery,a.indexes=t.indexes,a.description=t.description,t.queryParameters&&(a.queryParameters=this._getSearchParams(t.queryParameters,"")),a.referers=t.referers),this._jsonRequest({method:"POST",url:"/1/keys",body:a,hostType:"write",callback:r})},addUserKeyWithValidity:u(function(e,t,n){return this.addUserKey(e,t,n)},a("client.addUserKeyWithValidity()","client.addUserKey()")),updateUserKey:function(e,t,r,o){var i=n(34),a="Usage: client.updateUserKey(key, arrayOfAcls[, params, callback])";if(!i(t))throw new Error(a);2!==arguments.length&&"function"!=typeof r||(o=r,r=null);var s={acl:t};return r&&(s.validity=r.validity,s.maxQueriesPerIPPerHour=r.maxQueriesPerIPPerHour,s.maxHitsPerQuery=r.maxHitsPerQuery,s.indexes=r.indexes,s.description=r.description,r.queryParameters&&(s.queryParameters=this._getSearchParams(r.queryParameters,"")),s.referers=r.referers),this._jsonRequest({method:"PUT",url:"/1/keys/"+e,body:s,hostType:"write",callback:o})},setSecurityTags:function(e){if("[object Array]"===Object.prototype.toString.call(e)){for(var t=[],n=0;n<e.length;++n)if("[object Array]"===Object.prototype.toString.call(e[n])){for(var r=[],o=0;o<e[n].length;++o)r.push(e[n][o]);t.push("("+r.join(",")+")")}else t.push(e[n]);e=t.join(",")}this.securityTags=e},setUserToken:function(e){this.userToken=e},startQueriesBatch:u(function(){this._batch=[]},a("client.startQueriesBatch()","client.search()")),addQueryInBatch:u(function(e,t,n){this._batch.push({indexName:e,query:t,params:n})},a("client.addQueryInBatch()","client.search()")),clearCache:function(){this.cache={}},sendQueriesBatch:u(function(e){return this.search(this._batch,e)},a("client.sendQueriesBatch()","client.search()")),setRequestTimeout:function(e){e&&(this.requestTimeout=parseInt(e,10))},search:function(e,t){var r=n(34),o=n(55),i="Usage: client.search(arrayOfQueries[, callback])";if(!r(e))throw new Error(i);var a=this,s={requests:o(e,function(e){var t="";return void 0!==e.query&&(t+="query="+encodeURIComponent(e.query)),{indexName:e.indexName,params:a._getSearchParams(e.params,t)}})},u=o(s.requests,function(e,t){return t+"="+encodeURIComponent("/1/indexes/"+encodeURIComponent(e.indexName)+"?"+e.params)}).join("&");return this._jsonRequest({cache:this.cache,method:"POST",url:"/1/indexes/*/queries",body:s,hostType:"read",fallback:{method:"GET",url:"/1/indexes/*",body:{params:u}},callback:t})},batch:function(e,t){var r=n(34),o="Usage: client.batch(operations[, callback])";if(!r(e))throw new Error(o);return this._jsonRequest({method:"POST",url:"/1/indexes/*/batch",body:{requests:e},hostType:"write",callback:t})},destroy:i,enableRateLimitForward:i,disableRateLimitForward:i,useSecuredAPIKey:i,disableSecuredAPIKey:i,generateSecuredApiKey:i,Index:function(e,t){this.indexName=t,this.as=e,this.typeAheadArgs=null,this.typeAheadValueOption=null,this.cache={}},setExtraHeader:function(e,t){this.extraHeaders.push({name:e.toLowerCase(),value:t})},addAlgoliaAgent:function(e){this._ua+=";"+e},_jsonRequest:function(e){function t(n,s){function p(e){var t=e&&e.body&&e.body.message&&e.body.status||e.statusCode||e&&e.body&&200;i("received response: statusCode: %s, computed statusCode: %d, headers: %j",e.statusCode,t,e.headers);var n=200===t||201===t,r=!n&&4!==Math.floor(t/100)&&1!==Math.floor(t/100);if(u._useCache&&n&&a&&(a[g]=e.responseText),n)return e.body;if(r)return f+=1,v();var o=new c.AlgoliaSearchError(e.body&&e.body.message);return u._promise.reject(o)}function m(r){return i("error: %s, stack: %s",r.message,r.stack),r instanceof c.AlgoliaSearchError||(r=new c.Unknown(r&&r.message,r)),f+=1,r instanceof c.Unknown||r instanceof c.UnparsableJSON||f>=u.hosts[e.hostType].length&&(d||!h)?u._promise.reject(r):(u.hostIndex[e.hostType]=++u.hostIndex[e.hostType]%u.hosts[e.hostType].length,r instanceof c.RequestTimeout?v():(d||(f=1/0),t(n,s)))}function v(){return u.hostIndex[e.hostType]=++u.hostIndex[e.hostType]%u.hosts[e.hostType].length,s.timeout=u.requestTimeout*(f+1),t(n,s)}var g;if(u._useCache&&(g=e.url),u._useCache&&r&&(g+="_body_"+s.body),u._useCache&&a&&void 0!==a[g])return i("serving response from cache"),u._promise.resolve(JSON.parse(a[g]));if(f>=u.hosts[e.hostType].length)return!h||d?(i("could not get any response"),u._promise.reject(new c.AlgoliaSearchError("Cannot connect to the AlgoliaSearch API. Send an email to support@algolia.com to report and resolve the issue. Application id was: "+u.applicationID))):(i("switching to fallback"),f=0,s.method=e.fallback.method,s.url=e.fallback.url,s.jsonBody=e.fallback.body,s.jsonBody&&(s.body=l(s.jsonBody)),o=u._computeRequestHeaders(),s.timeout=u.requestTimeout*(f+1),u.hostIndex[e.hostType]=0,d=!0,t(u._request.fallback,s));var y=u.hosts[e.hostType][u.hostIndex[e.hostType]]+s.url,b={body:s.body,jsonBody:s.jsonBody,method:s.method,headers:o,timeout:s.timeout,debug:i};return i("method: %s, url: %s, headers: %j, timeout: %d",b.method,y,b.headers,b.timeout),n===u._request.fallback&&i("using fallback"),n.call(u,y,b).then(p,m)}var r,o,i=n(42)("algoliasearch:"+e.url),a=e.cache,u=this,f=0,d=!1,h=u._useFallback&&u._request.fallback&&e.fallback;this.apiKey.length>p&&void 0!==e.body&&void 0!==e.body.params?(e.body.apiKey=this.apiKey,o=this._computeRequestHeaders(!1)):o=this._computeRequestHeaders(),void 0!==e.body&&(r=l(e.body)),i("request start");var m=t(u._request,{url:e.url,method:e.method,body:r,jsonBody:e.body,timeout:u.requestTimeout*(f+1)});return e.callback?void m.then(function(t){s(function(){e.callback(null,t)},u._setTimeout||setTimeout)},function(t){s(function(){e.callback(t)},u._setTimeout||setTimeout)}):m},_getSearchParams:function(e,t){if(void 0===e||null===e)return t;for(var n in e)null!==n&&void 0!==e[n]&&e.hasOwnProperty(n)&&(t+=""===t?"":"&",t+=n+"="+encodeURIComponent("[object Array]"===Object.prototype.toString.call(e[n])?l(e[n]):e[n]));return t},_computeRequestHeaders:function(e){var t=n(15),r={"x-algolia-agent":this._ua,"x-algolia-application-id":this.applicationID};return e!==!1&&(r["x-algolia-api-key"]=this.apiKey),this.userToken&&(r["x-algolia-usertoken"]=this.userToken),this.securityTags&&(r["x-algolia-tagfilters"]=this.securityTags),this.extraHeaders&&t(this.extraHeaders,function(e){r[e.name]=e.value}),r}},r.prototype.Index.prototype={clearCache:function(){this.cache={}},addObject:function(e,t,n){var r=this;return 1!==arguments.length&&"function"!=typeof t||(n=t,t=void 0),this.as._jsonRequest({method:void 0!==t?"PUT":"POST",url:"/1/indexes/"+encodeURIComponent(r.indexName)+(void 0!==t?"/"+encodeURIComponent(t):""),body:e,hostType:"write",callback:n})},addObjects:function(e,t){var r=n(34),o="Usage: index.addObjects(arrayOfObjects[, callback])";if(!r(e))throw new Error(o);for(var i=this,a={requests:[]},s=0;s<e.length;++s){var u={action:"addObject",body:e[s]};a.requests.push(u)}return this.as._jsonRequest({method:"POST",url:"/1/indexes/"+encodeURIComponent(i.indexName)+"/batch",body:a,hostType:"write",callback:t})},getObject:function(e,t,n){var r=this;1!==arguments.length&&"function"!=typeof t||(n=t,t=void 0);var o="";if(void 0!==t){o="?attributes=";for(var i=0;i<t.length;++i)0!==i&&(o+=","),o+=t[i]}return this.as._jsonRequest({method:"GET",url:"/1/indexes/"+encodeURIComponent(r.indexName)+"/"+encodeURIComponent(e)+o,hostType:"read",callback:n})},getObjects:function(e,t,r){var o=n(34),i=n(55),a="Usage: index.getObjects(arrayOfObjectIDs[, callback])";if(!o(e))throw new Error(a);var s=this;1!==arguments.length&&"function"!=typeof t||(r=t,t=void 0);var u={requests:i(e,function(e){var n={indexName:s.indexName,objectID:e};return t&&(n.attributesToRetrieve=t.join(",")),n})};return this.as._jsonRequest({method:"POST",url:"/1/indexes/*/objects",hostType:"read",body:u,callback:r})},partialUpdateObject:function(e,t,n){1!==arguments.length&&"function"!=typeof t||(n=t,t=void 0);var r=this,o="/1/indexes/"+encodeURIComponent(r.indexName)+"/"+encodeURIComponent(e.objectID)+"/partial";return t===!1&&(o+="?createIfNotExists=false"),this.as._jsonRequest({method:"POST",url:o,body:e,hostType:"write",callback:n})},partialUpdateObjects:function(e,t){var r=n(34),o="Usage: index.partialUpdateObjects(arrayOfObjects[, callback])";if(!r(e))throw new Error(o);for(var i=this,a={requests:[]},s=0;s<e.length;++s){var u={action:"partialUpdateObject",objectID:e[s].objectID,body:e[s]};a.requests.push(u)}return this.as._jsonRequest({method:"POST",url:"/1/indexes/"+encodeURIComponent(i.indexName)+"/batch",body:a,hostType:"write",callback:t})},saveObject:function(e,t){var n=this;return this.as._jsonRequest({method:"PUT",url:"/1/indexes/"+encodeURIComponent(n.indexName)+"/"+encodeURIComponent(e.objectID),body:e,hostType:"write",callback:t})},saveObjects:function(e,t){var r=n(34),o="Usage: index.saveObjects(arrayOfObjects[, callback])";if(!r(e))throw new Error(o);for(var i=this,a={requests:[]},s=0;s<e.length;++s){var u={action:"updateObject",objectID:e[s].objectID,body:e[s]};a.requests.push(u)}return this.as._jsonRequest({method:"POST",url:"/1/indexes/"+encodeURIComponent(i.indexName)+"/batch",body:a,hostType:"write",callback:t})},deleteObject:function(e,t){if("function"==typeof e||"string"!=typeof e&&"number"!=typeof e){var n=new c.AlgoliaSearchError("Cannot delete an object without an objectID");return t=e,"function"==typeof t?t(n):this.as._promise.reject(n)}var r=this;return this.as._jsonRequest({method:"DELETE",url:"/1/indexes/"+encodeURIComponent(r.indexName)+"/"+encodeURIComponent(e),hostType:"write",callback:t})},deleteObjects:function(e,t){var r=n(34),o=n(55),i="Usage: index.deleteObjects(arrayOfObjectIDs[, callback])";if(!r(e))throw new Error(i);var a=this,s={requests:o(e,function(e){return{action:"deleteObject",objectID:e,body:{objectID:e}}})};return this.as._jsonRequest({method:"POST",url:"/1/indexes/"+encodeURIComponent(a.indexName)+"/batch",body:s,hostType:"write",callback:t})},deleteByQuery:function(e,t,r){function o(e){if(0===e.nbHits)return e;var t=f(e.hits,function(e){return e.objectID});return p.deleteObjects(t).then(i).then(a)}function i(e){return p.waitTask(e.taskID)}function a(){return p.deleteByQuery(e,t)}function u(){s(function(){r(null)},d._setTimeout||setTimeout)}function l(e){s(function(){r(e)},d._setTimeout||setTimeout)}var c=n(45),f=n(55),p=this,d=p.as;1===arguments.length||"function"==typeof t?(r=t,t={}):t=c(t),t.attributesToRetrieve="objectID",t.hitsPerPage=1e3,t.distinct=!1,this.clearCache();var h=this.search(e,t).then(o);return r?void h.then(u,l):h},search:f("query"),similarSearch:f("similarQuery"),browse:function(e,t,r){var o,i,a=n(80),s=this;0===arguments.length||1===arguments.length&&"function"==typeof arguments[0]?(o=0,r=arguments[0],e=void 0):"number"==typeof arguments[0]?(o=arguments[0],"number"==typeof arguments[1]?i=arguments[1]:"function"==typeof arguments[1]&&(r=arguments[1],i=void 0),e=void 0,t=void 0):"object"==typeof arguments[0]?("function"==typeof arguments[1]&&(r=arguments[1]),t=arguments[0],e=void 0):"string"==typeof arguments[0]&&"function"==typeof arguments[1]&&(r=arguments[1],t=void 0),t=a({},t||{},{page:o,hitsPerPage:i,query:e});var u=this.as._getSearchParams(t,"");return this.as._jsonRequest({method:"GET",url:"/1/indexes/"+encodeURIComponent(s.indexName)+"/browse?"+u,hostType:"read",callback:r})},browseFrom:function(e,t){return this.as._jsonRequest({method:"GET",url:"/1/indexes/"+encodeURIComponent(this.indexName)+"/browse?cursor="+encodeURIComponent(e),hostType:"read",callback:t})},browseAll:function(e,t){function r(e){if(!s._stopped){var t;t=void 0!==e?"cursor="+encodeURIComponent(e):c,u._jsonRequest({method:"GET",url:"/1/indexes/"+encodeURIComponent(l.indexName)+"/browse?"+t,hostType:"read",callback:o})}}function o(e,t){return s._stopped?void 0:e?void s._error(e):(s._result(t),void 0===t.cursor?void s._end():void r(t.cursor))}"object"==typeof e&&(t=e,e=void 0);var i=n(80),a=n(88),s=new a,u=this.as,l=this,c=u._getSearchParams(i({},t||{},{query:e}),"");return r(),s},ttAdapter:function(e){var t=this;return function(n,r,o){var i;i="function"==typeof o?o:r,t.search(n,e,function(e,t){return e?void i(e):void i(t.hits)})}},waitTask:function(e,t){function n(){return c._jsonRequest({method:"GET",hostType:"read",url:"/1/indexes/"+encodeURIComponent(l.indexName)+"/task/"+e
}).then(function(e){u++;var t=i*u*u;return t>a&&(t=a),"published"!==e.status?c._promise.delay(t).then(n):e})}function r(e){s(function(){t(null,e)},c._setTimeout||setTimeout)}function o(e){s(function(){t(e)},c._setTimeout||setTimeout)}var i=100,a=5e3,u=0,l=this,c=l.as,f=n();return t?void f.then(r,o):f},clearIndex:function(e){var t=this;return this.as._jsonRequest({method:"POST",url:"/1/indexes/"+encodeURIComponent(t.indexName)+"/clear",hostType:"write",callback:e})},getSettings:function(e){var t=this;return this.as._jsonRequest({method:"GET",url:"/1/indexes/"+encodeURIComponent(t.indexName)+"/settings",hostType:"read",callback:e})},setSettings:function(e,t){var n=this;return this.as._jsonRequest({method:"PUT",url:"/1/indexes/"+encodeURIComponent(n.indexName)+"/settings",hostType:"write",body:e,callback:t})},listUserKeys:function(e){var t=this;return this.as._jsonRequest({method:"GET",url:"/1/indexes/"+encodeURIComponent(t.indexName)+"/keys",hostType:"read",callback:e})},getUserKeyACL:function(e,t){var n=this;return this.as._jsonRequest({method:"GET",url:"/1/indexes/"+encodeURIComponent(n.indexName)+"/keys/"+e,hostType:"read",callback:t})},deleteUserKey:function(e,t){var n=this;return this.as._jsonRequest({method:"DELETE",url:"/1/indexes/"+encodeURIComponent(n.indexName)+"/keys/"+e,hostType:"write",callback:t})},addUserKey:function(e,t,r){var o=n(34),i="Usage: index.addUserKey(arrayOfAcls[, params, callback])";if(!o(e))throw new Error(i);1!==arguments.length&&"function"!=typeof t||(r=t,t=null);var a={acl:e};return t&&(a.validity=t.validity,a.maxQueriesPerIPPerHour=t.maxQueriesPerIPPerHour,a.maxHitsPerQuery=t.maxHitsPerQuery,a.description=t.description,t.queryParameters&&(a.queryParameters=this.as._getSearchParams(t.queryParameters,"")),a.referers=t.referers),this.as._jsonRequest({method:"POST",url:"/1/indexes/"+encodeURIComponent(this.indexName)+"/keys",body:a,hostType:"write",callback:r})},addUserKeyWithValidity:u(function(e,t,n){return this.addUserKey(e,t,n)},a("index.addUserKeyWithValidity()","index.addUserKey()")),updateUserKey:function(e,t,r,o){var i=n(34),a="Usage: index.updateUserKey(key, arrayOfAcls[, params, callback])";if(!i(t))throw new Error(a);2!==arguments.length&&"function"!=typeof r||(o=r,r=null);var s={acl:t};return r&&(s.validity=r.validity,s.maxQueriesPerIPPerHour=r.maxQueriesPerIPPerHour,s.maxHitsPerQuery=r.maxHitsPerQuery,s.description=r.description,r.queryParameters&&(s.queryParameters=this.as._getSearchParams(r.queryParameters,"")),s.referers=r.referers),this.as._jsonRequest({method:"PUT",url:"/1/indexes/"+encodeURIComponent(this.indexName)+"/keys/"+e,body:s,hostType:"write",callback:o})},_search:function(e,t,n){return this.as._jsonRequest({cache:this.cache,method:"POST",url:t||"/1/indexes/"+encodeURIComponent(this.indexName)+"/query",body:{params:e},hostType:"read",fallback:{method:"GET",url:"/1/indexes/"+encodeURIComponent(this.indexName),body:{params:e}},callback:n})},as:null,indexName:null,typeAheadArgs:null,typeAheadValueOption:null}},function(e,t,n){"use strict";function r(e,t){var r=n(15),o=this;"function"==typeof Error.captureStackTrace?Error.captureStackTrace(this,this.constructor):o.stack=(new Error).stack||"Cannot get a stacktrace, browser is too old",this.name=this.constructor.name,this.message=e||"Unknown error",t&&r(t,function(e,t){o[t]=e})}function o(e,t){function n(){var n=Array.prototype.slice.call(arguments,0);"string"!=typeof n[0]&&n.unshift(t),r.apply(this,n),this.name="AlgoliaSearch"+e+"Error"}return i(n,r),n}var i=n(7);i(r,Error),e.exports={AlgoliaSearchError:r,UnparsableJSON:o("UnparsableJSON","Could not parse the incoming response as JSON, see err.more for details"),RequestTimeout:o("RequestTimeout","Request timedout before getting a response"),Network:o("Network","Network issue, see err.more for details"),JSONPScriptFail:o("JSONPScriptFail","<script> was loaded but did not call our provided callback"),JSONPScriptError:o("JSONPScriptError","<script> unable to load due to an `error` event on it"),Unknown:o("Unknown","Unknown error occured")}},function(e,t,n){var r=n(16),o=n(17),i=n(38),a=i(r,o);e.exports=a},function(e,t){function n(e,t){for(var n=-1,r=e.length;++n<r&&t(e[n],n,e)!==!1;);return e}e.exports=n},function(e,t,n){var r=n(18),o=n(37),i=o(r);e.exports=i},function(e,t,n){function r(e,t){return o(e,t,i)}var o=n(19),i=n(23);e.exports=r},function(e,t,n){var r=n(20),o=r();e.exports=o},function(e,t,n){function r(e){return function(t,n,r){for(var i=o(t),a=r(t),s=a.length,u=e?s:-1;e?u--:++u<s;){var l=a[u];if(n(i[l],l,i)===!1)break}return t}}var o=n(21);e.exports=r},function(e,t,n){function r(e){return o(e)?e:Object(e)}var o=n(22);e.exports=r},function(e,t){function n(e){var t=typeof e;return!!e&&("object"==t||"function"==t)}e.exports=n},function(e,t,n){var r=n(24),o=n(28),i=n(22),a=n(32),s=r(Object,"keys"),u=s?function(e){var t=null==e?void 0:e.constructor;return"function"==typeof t&&t.prototype===e||"function"!=typeof e&&o(e)?a(e):i(e)?s(e):[]}:a;e.exports=u},function(e,t,n){function r(e,t){var n=null==e?void 0:e[t];return o(n)?n:void 0}var o=n(25);e.exports=r},function(e,t,n){function r(e){return null==e?!1:o(e)?c.test(u.call(e)):i(e)&&a.test(e)}var o=n(26),i=n(27),a=/^\[object .+?Constructor\]$/,s=Object.prototype,u=Function.prototype.toString,l=s.hasOwnProperty,c=RegExp("^"+u.call(l).replace(/[\\^$.*+?()[\]{}|]/g,"\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g,"$1.*?")+"$");e.exports=r},function(e,t,n){function r(e){return o(e)&&s.call(e)==i}var o=n(22),i="[object Function]",a=Object.prototype,s=a.toString;e.exports=r},function(e,t){function n(e){return!!e&&"object"==typeof e}e.exports=n},function(e,t,n){function r(e){return null!=e&&i(o(e))}var o=n(29),i=n(31);e.exports=r},function(e,t,n){var r=n(30),o=r("length");e.exports=o},function(e,t){function n(e){return function(t){return null==t?void 0:t[e]}}e.exports=n},function(e,t){function n(e){return"number"==typeof e&&e>-1&&e%1==0&&r>=e}var r=9007199254740991;e.exports=n},function(e,t,n){function r(e){for(var t=u(e),n=t.length,r=n&&e.length,l=!!r&&s(r)&&(i(e)||o(e)),f=-1,p=[];++f<n;){var d=t[f];(l&&a(d,r)||c.call(e,d))&&p.push(d)}return p}var o=n(33),i=n(34),a=n(35),s=n(31),u=n(36),l=Object.prototype,c=l.hasOwnProperty;e.exports=r},function(e,t,n){function r(e){return i(e)&&o(e)&&s.call(e,"callee")&&!u.call(e,"callee")}var o=n(28),i=n(27),a=Object.prototype,s=a.hasOwnProperty,u=a.propertyIsEnumerable;e.exports=r},function(e,t,n){var r=n(24),o=n(31),i=n(27),a="[object Array]",s=Object.prototype,u=s.toString,l=r(Array,"isArray"),c=l||function(e){return i(e)&&o(e.length)&&u.call(e)==a};e.exports=c},function(e,t){function n(e,t){return e="number"==typeof e||r.test(e)?+e:-1,t=null==t?o:t,e>-1&&e%1==0&&t>e}var r=/^\d+$/,o=9007199254740991;e.exports=n},function(e,t,n){function r(e){if(null==e)return[];u(e)||(e=Object(e));var t=e.length;t=t&&s(t)&&(i(e)||o(e))&&t||0;for(var n=e.constructor,r=-1,l="function"==typeof n&&n.prototype===e,f=Array(t),p=t>0;++r<t;)f[r]=r+"";for(var d in e)p&&a(d,t)||"constructor"==d&&(l||!c.call(e,d))||f.push(d);return f}var o=n(33),i=n(34),a=n(35),s=n(31),u=n(22),l=Object.prototype,c=l.hasOwnProperty;e.exports=r},function(e,t,n){function r(e,t){return function(n,r){var s=n?o(n):0;if(!i(s))return e(n,r);for(var u=t?s:-1,l=a(n);(t?u--:++u<s)&&r(l[u],u,l)!==!1;);return n}}var o=n(29),i=n(31),a=n(21);e.exports=r},function(e,t,n){function r(e,t){return function(n,r,a){return"function"==typeof r&&void 0===a&&i(n)?e(n,r):t(n,o(r,a,3))}}var o=n(39),i=n(34);e.exports=r},function(e,t,n){function r(e,t,n){if("function"!=typeof e)return o;if(void 0===t)return e;switch(n){case 1:return function(n){return e.call(t,n)};case 3:return function(n,r,o){return e.call(t,n,r,o)};case 4:return function(n,r,o,i){return e.call(t,n,r,o,i)};case 5:return function(n,r,o,i,a){return e.call(t,n,r,o,i,a)}}return function(){return e.apply(t,arguments)}}var o=n(40);e.exports=r},function(e,t){function n(e){return e}e.exports=n},function(e,t,n){function r(e,t){return function(n,r,i){if("function"==typeof n&&"object"==typeof r||"object"==typeof i)throw new o.AlgoliaSearchError("index.search usage is index.search(query, params, cb)");0===arguments.length||"function"==typeof n?(i=n,n=""):1!==arguments.length&&"function"!=typeof r||(i=r,r=void 0),"object"==typeof n&&null!==n?(r=n,n=void 0):void 0!==n&&null!==n||(n="");var a="";return void 0!==n&&(a+=e+"="+encodeURIComponent(n)),void 0!==r&&(a=this.as._getSearchParams(r,a)),this._search(a,t,i)}}e.exports=r;var o=n(14)},function(e,t,n){function r(){return"WebkitAppearance"in document.documentElement.style||window.console&&(console.firebug||console.exception&&console.table)||navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/)&&parseInt(RegExp.$1,10)>=31}function o(){var e=arguments,n=this.useColors;if(e[0]=(n?"%c":"")+this.namespace+(n?" %c":" ")+e[0]+(n?"%c ":" ")+"+"+t.humanize(this.diff),!n)return e;var r="color: "+this.color;e=[e[0],r,"color: inherit"].concat(Array.prototype.slice.call(e,1));var o=0,i=0;return e[0].replace(/%[a-z%]/g,function(e){"%%"!==e&&(o++,"%c"===e&&(i=o))}),e.splice(i,0,r),e}function i(){return"object"==typeof console&&console.log&&Function.prototype.apply.call(console.log,console,arguments)}function a(e){try{null==e?t.storage.removeItem("debug"):t.storage.debug=e}catch(n){}}function s(){var e;try{e=t.storage.debug}catch(n){}return e}function u(){try{return window.localStorage}catch(e){}}t=e.exports=n(43),t.log=i,t.formatArgs=o,t.save=a,t.load=s,t.useColors=r,t.storage="undefined"!=typeof chrome&&"undefined"!=typeof chrome.storage?chrome.storage.local:u(),t.colors=["lightseagreen","forestgreen","goldenrod","dodgerblue","darkorchid","crimson"],t.formatters.j=function(e){return JSON.stringify(e)},t.enable(s())},function(e,t,n){function r(){return t.colors[c++%t.colors.length]}function o(e){function n(){}function o(){var e=o,n=+new Date,i=n-(l||n);e.diff=i,e.prev=l,e.curr=n,l=n,null==e.useColors&&(e.useColors=t.useColors()),null==e.color&&e.useColors&&(e.color=r());var a=Array.prototype.slice.call(arguments);a[0]=t.coerce(a[0]),"string"!=typeof a[0]&&(a=["%o"].concat(a));var s=0;a[0]=a[0].replace(/%([a-z%])/g,function(n,r){if("%%"===n)return n;s++;var o=t.formatters[r];if("function"==typeof o){var i=a[s];n=o.call(e,i),a.splice(s,1),s--}return n}),"function"==typeof t.formatArgs&&(a=t.formatArgs.apply(e,a));var u=o.log||t.log||console.log.bind(console);u.apply(e,a)}n.enabled=!1,o.enabled=!0;var i=t.enabled(e)?o:n;return i.namespace=e,i}function i(e){t.save(e);for(var n=(e||"").split(/[\s,]+/),r=n.length,o=0;r>o;o++)n[o]&&(e=n[o].replace(/\*/g,".*?"),"-"===e[0]?t.skips.push(new RegExp("^"+e.substr(1)+"$")):t.names.push(new RegExp("^"+e+"$")))}function a(){t.enable("")}function s(e){var n,r;for(n=0,r=t.skips.length;r>n;n++)if(t.skips[n].test(e))return!1;for(n=0,r=t.names.length;r>n;n++)if(t.names[n].test(e))return!0;return!1}function u(e){return e instanceof Error?e.stack||e.message:e}t=e.exports=o,t.coerce=u,t.disable=a,t.enable=i,t.enabled=s,t.humanize=n(44),t.names=[],t.skips=[],t.formatters={};var l,c=0},function(e,t){function n(e){if(e=""+e,!(e.length>1e4)){var t=/^((?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|years?|yrs?|y)?$/i.exec(e);if(t){var n=parseFloat(t[1]),r=(t[2]||"ms").toLowerCase();switch(r){case"years":case"year":case"yrs":case"yr":case"y":return n*c;case"days":case"day":case"d":return n*l;case"hours":case"hour":case"hrs":case"hr":case"h":return n*u;case"minutes":case"minute":case"mins":case"min":case"m":return n*s;case"seconds":case"second":case"secs":case"sec":case"s":return n*a;case"milliseconds":case"millisecond":case"msecs":case"msec":case"ms":return n}}}}function r(e){return e>=l?Math.round(e/l)+"d":e>=u?Math.round(e/u)+"h":e>=s?Math.round(e/s)+"m":e>=a?Math.round(e/a)+"s":e+"ms"}function o(e){return i(e,l,"day")||i(e,u,"hour")||i(e,s,"minute")||i(e,a,"second")||e+" ms"}function i(e,t,n){return t>e?void 0:1.5*t>e?Math.floor(e/t)+" "+n:Math.ceil(e/t)+" "+n+"s"}var a=1e3,s=60*a,u=60*s,l=24*u,c=365.25*l;e.exports=function(e,t){return t=t||{},"string"==typeof e?n(e):t["long"]?o(e):r(e)}},function(e,t,n){function r(e,t,n,r){return t&&"boolean"!=typeof t&&a(e,t,n)?t=!1:"function"==typeof t&&(r=n,n=t,t=!1),"function"==typeof n?o(e,t,i(n,r,3)):o(e,t)}var o=n(46),i=n(39),a=n(54);e.exports=r},function(e,t,n){function r(e,t,n,h,m,v,g){var b;if(n&&(b=m?n(e,h,m):n(e)),void 0!==b)return b;if(!p(e))return e;var _=f(e);if(_){if(b=u(e),!t)return o(e,b)}else{var w=U.call(e),x=w==y;if(w!=C&&w!=d&&(!x||m))return I[w]?l(e,w,t):m?e:{};if(b=c(x?{}:e),!t)return a(b,e)}v||(v=[]),g||(g=[]);for(var P=v.length;P--;)if(v[P]==e)return g[P];return v.push(e),g.push(b),(_?i:s)(e,function(o,i){b[i]=r(o,t,n,i,e,v,g)}),b}var o=n(47),i=n(16),a=n(48),s=n(18),u=n(50),l=n(51),c=n(53),f=n(34),p=n(22),d="[object Arguments]",h="[object Array]",m="[object Boolean]",v="[object Date]",g="[object Error]",y="[object Function]",b="[object Map]",_="[object Number]",C="[object Object]",w="[object RegExp]",x="[object Set]",P="[object String]",E="[object WeakMap]",R="[object ArrayBuffer]",S="[object Float32Array]",O="[object Float64Array]",T="[object Int8Array]",k="[object Int16Array]",N="[object Int32Array]",j="[object Uint8Array]",A="[object Uint8ClampedArray]",M="[object Uint16Array]",F="[object Uint32Array]",I={};I[d]=I[h]=I[R]=I[m]=I[v]=I[S]=I[O]=I[T]=I[k]=I[N]=I[_]=I[C]=I[w]=I[P]=I[j]=I[A]=I[M]=I[F]=!0,I[g]=I[y]=I[b]=I[x]=I[E]=!1;var D=Object.prototype,U=D.toString;e.exports=r},function(e,t){function n(e,t){var n=-1,r=e.length;for(t||(t=Array(r));++n<r;)t[n]=e[n];return t}e.exports=n},function(e,t,n){function r(e,t){return null==t?e:o(t,i(t),e)}var o=n(49),i=n(23);e.exports=r},function(e,t){function n(e,t,n){n||(n={});for(var r=-1,o=t.length;++r<o;){var i=t[r];n[i]=e[i]}return n}e.exports=n},function(e,t){function n(e){var t=e.length,n=new e.constructor(t);return t&&"string"==typeof e[0]&&o.call(e,"index")&&(n.index=e.index,n.input=e.input),n}var r=Object.prototype,o=r.hasOwnProperty;e.exports=n},function(e,t,n){function r(e,t,n){var r=e.constructor;switch(t){case c:return o(e);case i:case a:return new r(+e);case f:case p:case d:case h:case m:case v:case g:case y:case b:var C=e.buffer;return new r(n?o(C):C,e.byteOffset,e.length);case s:case l:return new r(e);case u:var w=new r(e.source,_.exec(e));w.lastIndex=e.lastIndex}return w}var o=n(52),i="[object Boolean]",a="[object Date]",s="[object Number]",u="[object RegExp]",l="[object String]",c="[object ArrayBuffer]",f="[object Float32Array]",p="[object Float64Array]",d="[object Int8Array]",h="[object Int16Array]",m="[object Int32Array]",v="[object Uint8Array]",g="[object Uint8ClampedArray]",y="[object Uint16Array]",b="[object Uint32Array]",_=/\w*$/;e.exports=r},function(e,t){(function(t){function n(e){var t=new r(e.byteLength),n=new o(t);return n.set(new o(e)),t}var r=t.ArrayBuffer,o=t.Uint8Array;e.exports=n}).call(t,function(){return this}())},function(e,t){function n(e){var t=e.constructor;return"function"==typeof t&&t instanceof t||(t=Object),new t}e.exports=n},function(e,t,n){function r(e,t,n){if(!a(n))return!1;var r=typeof t;if("number"==r?o(n)&&i(t,n.length):"string"==r&&t in n){var s=n[t];return e===e?e===s:s!==s}return!1}var o=n(28),i=n(35),a=n(22);e.exports=r},function(e,t,n){function r(e,t,n){var r=s(e)?o:a;return t=i(t,n,3),r(e,t)}var o=n(56),i=n(57),a=n(79),s=n(34);e.exports=r},function(e,t){function n(e,t){for(var n=-1,r=e.length,o=Array(r);++n<r;)o[n]=t(e[n],n,e);return o}e.exports=n},function(e,t,n){function r(e,t,n){var r=typeof e;return"function"==r?void 0===t?e:a(e,t,n):null==e?s:"object"==r?o(e):void 0===t?u(e):i(e,t)}var o=n(58),i=n(70),a=n(39),s=n(40),u=n(77);e.exports=r},function(e,t,n){function r(e){var t=i(e);if(1==t.length&&t[0][2]){var n=t[0][0],r=t[0][1];return function(e){return null==e?!1:e[n]===r&&(void 0!==r||n in a(e))}}return function(e){return o(e,t)}}var o=n(59),i=n(67),a=n(21);e.exports=r},function(e,t,n){function r(e,t,n){var r=t.length,a=r,s=!n;if(null==e)return!a;for(e=i(e);r--;){var u=t[r];if(s&&u[2]?u[1]!==e[u[0]]:!(u[0]in e))return!1}for(;++r<a;){u=t[r];var l=u[0],c=e[l],f=u[1];if(s&&u[2]){if(void 0===c&&!(l in e))return!1}else{var p=n?n(c,f,l):void 0;if(!(void 0===p?o(f,c,n,!0):p))return!1}}return!0}var o=n(60),i=n(21);e.exports=r},function(e,t,n){function r(e,t,n,s,u,l){return e===t?!0:null==e||null==t||!i(e)&&!a(t)?e!==e&&t!==t:o(e,t,r,n,s,u,l)}var o=n(61),i=n(22),a=n(27);e.exports=r},function(e,t,n){function r(e,t,n,r,p,m,v){var g=s(e),y=s(t),b=c,_=c;g||(b=h.call(e),b==l?b=f:b!=f&&(g=u(e))),y||(_=h.call(t),_==l?_=f:_!=f&&(y=u(t)));var C=b==f,w=_==f,x=b==_;if(x&&!g&&!C)return i(e,t,b);if(!p){var P=C&&d.call(e,"__wrapped__"),E=w&&d.call(t,"__wrapped__");if(P||E)return n(P?e.value():e,E?t.value():t,r,p,m,v)}if(!x)return!1;m||(m=[]),v||(v=[]);for(var R=m.length;R--;)if(m[R]==e)return v[R]==t;m.push(e),v.push(t);var S=(g?o:a)(e,t,n,r,p,m,v);return m.pop(),v.pop(),S}var o=n(62),i=n(64),a=n(65),s=n(34),u=n(66),l="[object Arguments]",c="[object Array]",f="[object Object]",p=Object.prototype,d=p.hasOwnProperty,h=p.toString;e.exports=r},function(e,t,n){function r(e,t,n,r,i,a,s){var u=-1,l=e.length,c=t.length;if(l!=c&&!(i&&c>l))return!1;for(;++u<l;){var f=e[u],p=t[u],d=r?r(i?p:f,i?f:p,u):void 0;if(void 0!==d){if(d)continue;return!1}if(i){if(!o(t,function(e){return f===e||n(f,e,r,i,a,s)}))return!1}else if(f!==p&&!n(f,p,r,i,a,s))return!1}return!0}var o=n(63);e.exports=r},function(e,t){function n(e,t){for(var n=-1,r=e.length;++n<r;)if(t(e[n],n,e))return!0;return!1}e.exports=n},function(e,t){function n(e,t,n){switch(n){case r:case o:return+e==+t;case i:return e.name==t.name&&e.message==t.message;case a:return e!=+e?t!=+t:e==+t;case s:case u:return e==t+""}return!1}var r="[object Boolean]",o="[object Date]",i="[object Error]",a="[object Number]",s="[object RegExp]",u="[object String]";e.exports=n},function(e,t,n){function r(e,t,n,r,i,s,u){var l=o(e),c=l.length,f=o(t),p=f.length;if(c!=p&&!i)return!1;for(var d=c;d--;){var h=l[d];if(!(i?h in t:a.call(t,h)))return!1}for(var m=i;++d<c;){h=l[d];var v=e[h],g=t[h],y=r?r(i?g:v,i?v:g,h):void 0;if(!(void 0===y?n(v,g,r,i,s,u):y))return!1;m||(m="constructor"==h)}if(!m){var b=e.constructor,_=t.constructor;if(b!=_&&"constructor"in e&&"constructor"in t&&!("function"==typeof b&&b instanceof b&&"function"==typeof _&&_ instanceof _))return!1}return!0}var o=n(23),i=Object.prototype,a=i.hasOwnProperty;e.exports=r},function(e,t,n){function r(e){return i(e)&&o(e.length)&&!!T[N.call(e)]}var o=n(31),i=n(27),a="[object Arguments]",s="[object Array]",u="[object Boolean]",l="[object Date]",c="[object Error]",f="[object Function]",p="[object Map]",d="[object Number]",h="[object Object]",m="[object RegExp]",v="[object Set]",g="[object String]",y="[object WeakMap]",b="[object ArrayBuffer]",_="[object Float32Array]",C="[object Float64Array]",w="[object Int8Array]",x="[object Int16Array]",P="[object Int32Array]",E="[object Uint8Array]",R="[object Uint8ClampedArray]",S="[object Uint16Array]",O="[object Uint32Array]",T={};T[_]=T[C]=T[w]=T[x]=T[P]=T[E]=T[R]=T[S]=T[O]=!0,T[a]=T[s]=T[b]=T[u]=T[l]=T[c]=T[f]=T[p]=T[d]=T[h]=T[m]=T[v]=T[g]=T[y]=!1;var k=Object.prototype,N=k.toString;e.exports=r},function(e,t,n){function r(e){for(var t=i(e),n=t.length;n--;)t[n][2]=o(t[n][1]);return t}var o=n(68),i=n(69);e.exports=r},function(e,t,n){function r(e){return e===e&&!o(e)}var o=n(22);e.exports=r},function(e,t,n){function r(e){e=i(e);for(var t=-1,n=o(e),r=n.length,a=Array(r);++t<r;){var s=n[t];a[t]=[s,e[s]]}return a}var o=n(23),i=n(21);e.exports=r},function(e,t,n){function r(e,t){var n=s(e),r=u(e)&&l(t),d=e+"";return e=p(e),function(s){if(null==s)return!1;var u=d;if(s=f(s),(n||!r)&&!(u in s)){if(s=1==e.length?s:o(s,a(e,0,-1)),null==s)return!1;u=c(e),s=f(s)}return s[u]===t?void 0!==t||u in s:i(t,s[u],void 0,!0)}}var o=n(71),i=n(60),a=n(72),s=n(34),u=n(73),l=n(68),c=n(74),f=n(21),p=n(75);e.exports=r},function(e,t,n){function r(e,t,n){if(null!=e){void 0!==n&&n in o(e)&&(t=[n]);for(var r=0,i=t.length;null!=e&&i>r;)e=e[t[r++]];return r&&r==i?e:void 0}}var o=n(21);e.exports=r},function(e,t){function n(e,t,n){var r=-1,o=e.length;t=null==t?0:+t||0,0>t&&(t=-t>o?0:o+t),n=void 0===n||n>o?o:+n||0,0>n&&(n+=o),o=t>n?0:n-t>>>0,t>>>=0;for(var i=Array(o);++r<o;)i[r]=e[r+t];return i}e.exports=n},function(e,t,n){function r(e,t){var n=typeof e;if("string"==n&&s.test(e)||"number"==n)return!0;if(o(e))return!1;var r=!a.test(e);return r||null!=t&&e in i(t)}var o=n(34),i=n(21),a=/\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\n\\]|\\.)*?\1)\]/,s=/^\w*$/;e.exports=r},function(e,t){function n(e){var t=e?e.length:0;return t?e[t-1]:void 0}e.exports=n},function(e,t,n){function r(e){if(i(e))return e;var t=[];return o(e).replace(a,function(e,n,r,o){t.push(r?o.replace(s,"$1"):n||e)}),t}var o=n(76),i=n(34),a=/[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\n\\]|\\.)*?)\2)\]/g,s=/\\(\\)?/g;e.exports=r},function(e,t){function n(e){return null==e?"":e+""}e.exports=n},function(e,t,n){function r(e){return a(e)?o(e):i(e)}var o=n(30),i=n(78),a=n(73);e.exports=r},function(e,t,n){function r(e){var t=e+"";return e=i(e),function(n){return o(n,e,t)}}var o=n(71),i=n(75);e.exports=r},function(e,t,n){function r(e,t){var n=-1,r=i(e)?Array(e.length):[];return o(e,function(e,o,i){r[++n]=t(e,o,i)}),r}var o=n(17),i=n(28);e.exports=r},function(e,t,n){var r=n(81),o=n(86),i=o(r);e.exports=i},function(e,t,n){function r(e,t,n,p,d){if(!u(e))return e;var h=s(t)&&(a(t)||c(t)),m=h?void 0:f(t);return o(m||t,function(o,a){if(m&&(a=o,o=t[a]),l(o))p||(p=[]),d||(d=[]),i(e,t,a,r,n,p,d);else{var s=e[a],u=n?n(s,o,a,e,t):void 0,c=void 0===u;c&&(u=o),void 0===u&&(!h||a in e)||!c&&(u===u?u===s:s!==s)||(e[a]=u)}}),e}var o=n(16),i=n(82),a=n(34),s=n(28),u=n(22),l=n(27),c=n(66),f=n(23);e.exports=r},function(e,t,n){function r(e,t,n,r,f,p,d){for(var h=p.length,m=t[n];h--;)if(p[h]==m)return void(e[n]=d[h]);var v=e[n],g=f?f(v,m,n,e,t):void 0,y=void 0===g;y&&(g=m,s(m)&&(a(m)||l(m))?g=a(v)?v:s(v)?o(v):[]:u(m)||i(m)?g=i(v)?c(v):u(v)?v:{}:y=!1),p.push(m),d.push(g),y?e[n]=r(g,m,f,p,d):(g===g?g!==v:v===v)&&(e[n]=g)}var o=n(47),i=n(33),a=n(34),s=n(28),u=n(83),l=n(66),c=n(85);e.exports=r},function(e,t,n){function r(e){var t;if(!a(e)||c.call(e)!=s||i(e)||!l.call(e,"constructor")&&(t=e.constructor,"function"==typeof t&&!(t instanceof t)))return!1;var n;return o(e,function(e,t){n=t}),void 0===n||l.call(e,n)}var o=n(84),i=n(33),a=n(27),s="[object Object]",u=Object.prototype,l=u.hasOwnProperty,c=u.toString;e.exports=r},function(e,t,n){function r(e,t){return o(e,t,i)}var o=n(19),i=n(36);e.exports=r},function(e,t,n){function r(e){return o(e,i(e))}var o=n(49),i=n(36);e.exports=r},function(e,t,n){function r(e){return a(function(t,n){var r=-1,a=null==t?0:n.length,s=a>2?n[a-2]:void 0,u=a>2?n[2]:void 0,l=a>1?n[a-1]:void 0;for("function"==typeof s?(s=o(s,l,5),a-=2):(s="function"==typeof l?l:void 0,a-=s?1:0),u&&i(n[0],n[1],u)&&(s=3>a?void 0:s,a=1);++r<a;){var c=n[r];c&&e(t,c,s)}return t})}var o=n(39),i=n(54),a=n(87);e.exports=r},function(e,t){function n(e,t){if("function"!=typeof e)throw new TypeError(r);return t=o(void 0===t?e.length-1:+t||0,0),function(){for(var n=arguments,r=-1,i=o(n.length-t,0),a=Array(i);++r<i;)a[r]=n[t+r];switch(t){case 0:return e.call(this,a);case 1:return e.call(this,n[0],a);case 2:return e.call(this,n[0],n[1],a)}var s=Array(t+1);for(r=-1;++r<t;)s[r]=n[r];return s[t]=a,e.apply(this,s)}}var r="Expected a function",o=Math.max;e.exports=n},function(e,t,n){"use strict";function r(){}e.exports=r;var o=n(7),i=n(89).EventEmitter;o(r,i),r.prototype.stop=function(){this._stopped=!0,this._clean()},r.prototype._end=function(){this.emit("end"),this._clean()},r.prototype._error=function(e){this.emit("error",e),this._clean()},r.prototype._result=function(e){this.emit("result",e)},r.prototype._clean=function(){this.removeAllListeners("stop"),this.removeAllListeners("end"),this.removeAllListeners("error"),this.removeAllListeners("result")}},function(e,t){function n(){this._events=this._events||{},this._maxListeners=this._maxListeners||void 0}function r(e){return"function"==typeof e}function o(e){return"number"==typeof e}function i(e){return"object"==typeof e&&null!==e}function a(e){return void 0===e}e.exports=n,n.EventEmitter=n,n.prototype._events=void 0,n.prototype._maxListeners=void 0,n.defaultMaxListeners=10,n.prototype.setMaxListeners=function(e){if(!o(e)||0>e||isNaN(e))throw TypeError("n must be a positive number");return this._maxListeners=e,this},n.prototype.emit=function(e){var t,n,o,s,u,l;if(this._events||(this._events={}),"error"===e&&(!this._events.error||i(this._events.error)&&!this._events.error.length)){if(t=arguments[1],t instanceof Error)throw t;throw TypeError('Uncaught, unspecified "error" event.')}if(n=this._events[e],a(n))return!1;if(r(n))switch(arguments.length){case 1:n.call(this);break;case 2:n.call(this,arguments[1]);break;case 3:n.call(this,arguments[1],arguments[2]);break;default:s=Array.prototype.slice.call(arguments,1),n.apply(this,s)}else if(i(n))for(s=Array.prototype.slice.call(arguments,1),l=n.slice(),o=l.length,u=0;o>u;u++)l[u].apply(this,s);return!0},n.prototype.addListener=function(e,t){var o;if(!r(t))throw TypeError("listener must be a function");return this._events||(this._events={}),this._events.newListener&&this.emit("newListener",e,r(t.listener)?t.listener:t),this._events[e]?i(this._events[e])?this._events[e].push(t):this._events[e]=[this._events[e],t]:this._events[e]=t,i(this._events[e])&&!this._events[e].warned&&(o=a(this._maxListeners)?n.defaultMaxListeners:this._maxListeners,o&&o>0&&this._events[e].length>o&&(this._events[e].warned=!0,console.error("(node) warning: possible EventEmitter memory leak detected. %d listeners added. Use emitter.setMaxListeners() to increase limit.",this._events[e].length),"function"==typeof console.trace&&console.trace())),this},n.prototype.on=n.prototype.addListener,n.prototype.once=function(e,t){function n(){this.removeListener(e,n),o||(o=!0,t.apply(this,arguments))}if(!r(t))throw TypeError("listener must be a function");var o=!1;return n.listener=t,this.on(e,n),this},n.prototype.removeListener=function(e,t){var n,o,a,s;if(!r(t))throw TypeError("listener must be a function");if(!this._events||!this._events[e])return this;if(n=this._events[e],a=n.length,o=-1,n===t||r(n.listener)&&n.listener===t)delete this._events[e],this._events.removeListener&&this.emit("removeListener",e,t);else if(i(n)){for(s=a;s-- >0;)if(n[s]===t||n[s].listener&&n[s].listener===t){o=s;break}if(0>o)return this;1===n.length?(n.length=0,delete this._events[e]):n.splice(o,1),this._events.removeListener&&this.emit("removeListener",e,t)}return this},n.prototype.removeAllListeners=function(e){var t,n;if(!this._events)return this;if(!this._events.removeListener)return 0===arguments.length?this._events={}:this._events[e]&&delete this._events[e],this;if(0===arguments.length){for(t in this._events)"removeListener"!==t&&this.removeAllListeners(t);return this.removeAllListeners("removeListener"),this._events={},this}if(n=this._events[e],r(n))this.removeListener(e,n);else if(n)for(;n.length;)this.removeListener(e,n[n.length-1]);return delete this._events[e],this},n.prototype.listeners=function(e){var t;return t=this._events&&this._events[e]?r(this._events[e])?[this._events[e]]:this._events[e].slice():[]},n.prototype.listenerCount=function(e){if(this._events){var t=this._events[e];if(r(t))return 1;if(t)return t.length}return 0},n.listenerCount=function(e,t){return e.listenerCount(t)}},function(e,t,n){"use strict";function r(e,t){return e+=/\?/.test(e)?"&":"?",e+o.encode(t)}e.exports=r;var o=n(91)},function(e,t,n){"use strict";t.decode=t.parse=n(92),t.encode=t.stringify=n(93)},function(e,t){"use strict";function n(e,t){return Object.prototype.hasOwnProperty.call(e,t)}e.exports=function(e,t,r,o){t=t||"&",r=r||"=";var i={};if("string"!=typeof e||0===e.length)return i;var a=/\+/g;e=e.split(t);var s=1e3;o&&"number"==typeof o.maxKeys&&(s=o.maxKeys);var u=e.length;s>0&&u>s&&(u=s);for(var l=0;u>l;++l){var c,f,p,d,h=e[l].replace(a,"%20"),m=h.indexOf(r);m>=0?(c=h.substr(0,m),f=h.substr(m+1)):(c=h,f=""),p=decodeURIComponent(c),d=decodeURIComponent(f),n(i,p)?Array.isArray(i[p])?i[p].push(d):i[p]=[i[p],d]:i[p]=d}return i}},function(e,t){"use strict";var n=function(e){switch(typeof e){case"string":return e;case"boolean":return e?"true":"false";case"number":return isFinite(e)?e:"";default:return""}};e.exports=function(e,t,r,o){return t=t||"&",r=r||"=",null===e&&(e=void 0),"object"==typeof e?Object.keys(e).map(function(o){var i=encodeURIComponent(n(o))+r;return Array.isArray(e[o])?e[o].map(function(e){return i+encodeURIComponent(n(e))}).join(t):i+encodeURIComponent(n(e[o]))}).join(t):o?encodeURIComponent(n(o))+r+encodeURIComponent(n(e)):""}},function(e,t,n){"use strict";function r(e,t,n){function r(){t.debug("JSONP: success"),m||f||(m=!0,c||(t.debug("JSONP: Fail. Script loaded but did not call the callback"),s(),n(new o.JSONPScriptFail)))}function a(){"loaded"!==this.readyState&&"complete"!==this.readyState||r()}function s(){clearTimeout(v),d.onload=null,d.onreadystatechange=null,d.onerror=null,p.removeChild(d);try{delete window[h],delete window[h+"_loaded"]}catch(e){window[h]=null,window[h+"_loaded"]=null}}function u(){t.debug("JSONP: Script timeout"),f=!0,s(),n(new o.RequestTimeout)}function l(){t.debug("JSONP: Script error"),m||f||(s(),n(new o.JSONPScriptError))}if("GET"!==t.method)return void n(new Error("Method "+t.method+" "+e+" is not supported by JSONP."));t.debug("JSONP: start");var c=!1,f=!1;i+=1;var p=document.getElementsByTagName("head")[0],d=document.createElement("script"),h="algoliaJSONP_"+i,m=!1;window[h]=function(e){try{delete window[h]}catch(t){window[h]=void 0}f||(c=!0,s(),n(null,{body:e}))},e+="&callback="+h,t.jsonBody&&t.jsonBody.params&&(e+="&"+t.jsonBody.params);var v=setTimeout(u,t.timeout);d.onreadystatechange=a,d.onload=r,d.onerror=l,d.async=!0,d.defer=!0,d.src=e,p.appendChild(d)}e.exports=r;var o=n(14),i=0},function(e,t,n){function r(e){return function(t,r,i){var a=n(96);i=i&&a(i)||{},i.hosts=i.hosts||["places-dsn.algolia.net","places-1.algolianet.com","places-2.algolianet.com","places-3.algolianet.com"];var s=e(t,r,i),u=s.initIndex("places");return u.search=o("query","/1/places/query"),u}}e.exports=r;var o=n(41)},function(e,t,n){function r(e,t,n){return"function"==typeof t?o(e,!0,i(t,n,3)):o(e,!0)}var o=n(46),i=n(39);e.exports=r},function(e,t){"use strict";function n(){var e=window.document.location.protocol;return"http:"!==e&&"https:"!==e&&(e="http:"),e}e.exports=n},function(e,t){"use strict";e.exports="3.13.1"},function(e,t,n){"use strict";function r(e,t,n){return new o(e,t,n)}var o=n(100),i=n(101),a=n(173);r.version=n(216),r.AlgoliaSearchHelper=o,r.SearchParameters=i,r.SearchResults=a,r.url=n(206),e.exports=r},function(e,t,n){"use strict";function r(e,t,n){this.client=e;var r=n||{};r.index=t,this.state=a.make(r),this.lastResults=null,this._queryId=0,this._lastQueryIdReceived=-1}function o(e){if(0>e)throw new Error("Page requested below 0.");return this.state=this.state.setPage(e),this._change(),this}function i(){return this.state.page}var a=n(101),s=n(173),u=n(202),l=n(203),c=n(89),f=n(15),p=n(55),d=n(143),h=n(127),m=n(195),v=n(206);l.inherits(r,c.EventEmitter),r.prototype.search=function(){return this._search(),this},r.prototype.searchOnce=function(e,t){var n=this.state.setQueryParameters(e),r=u._getQueries(n.index,n);return t?this.client.search(r,function(e,r){t(e,new s(n,r),n)}):this.client.search(r).then(function(e){return{content:new s(n,e),state:n}})},r.prototype.setQuery=function(e){return this.state=this.state.setQuery(e),this._change(),this},r.prototype.clearRefinements=function(e){return this.state=this.state.clearRefinements(e),this._change(),this},r.prototype.clearTags=function(){return this.state=this.state.clearTags(),this._change(),this},r.prototype.addDisjunctiveFacetRefinement=function(e,t){return this.state=this.state.addDisjunctiveFacetRefinement(e,t),
this._change(),this},r.prototype.addDisjunctiveRefine=function(){return this.addDisjunctiveFacetRefinement.apply(this,arguments)},r.prototype.addNumericRefinement=function(e,t,n){return this.state=this.state.addNumericRefinement(e,t,n),this._change(),this},r.prototype.addFacetRefinement=function(e,t){return this.state=this.state.addFacetRefinement(e,t),this._change(),this},r.prototype.addRefine=function(){return this.addFacetRefinement.apply(this,arguments)},r.prototype.addFacetExclusion=function(e,t){return this.state=this.state.addExcludeRefinement(e,t),this._change(),this},r.prototype.addExclude=function(){return this.addFacetExclusion.apply(this,arguments)},r.prototype.addTag=function(e){return this.state=this.state.addTagRefinement(e),this._change(),this},r.prototype.removeNumericRefinement=function(e,t,n){return this.state=this.state.removeNumericRefinement(e,t,n),this._change(),this},r.prototype.removeDisjunctiveFacetRefinement=function(e,t){return this.state=this.state.removeDisjunctiveFacetRefinement(e,t),this._change(),this},r.prototype.removeDisjunctiveRefine=function(){return this.removeDisjunctiveFacetRefinement.apply(this,arguments)},r.prototype.removeFacetRefinement=function(e,t){return this.state=this.state.removeFacetRefinement(e,t),this._change(),this},r.prototype.removeRefine=function(){return this.removeFacetRefinement.apply(this,arguments)},r.prototype.removeFacetExclusion=function(e,t){return this.state=this.state.removeExcludeRefinement(e,t),this._change(),this},r.prototype.removeExclude=function(){return this.removeFacetExclusion.apply(this,arguments)},r.prototype.removeTag=function(e){return this.state=this.state.removeTagRefinement(e),this._change(),this},r.prototype.toggleFacetExclusion=function(e,t){return this.state=this.state.toggleExcludeFacetRefinement(e,t),this._change(),this},r.prototype.toggleExclude=function(){return this.toggleFacetExclusion.apply(this,arguments)},r.prototype.toggleRefinement=function(e,t){return this.state=this.state.toggleRefinement(e,t),this._change(),this},r.prototype.toggleRefine=function(){return this.toggleRefinement.apply(this,arguments)},r.prototype.toggleTag=function(e){return this.state=this.state.toggleTagRefinement(e),this._change(),this},r.prototype.nextPage=function(){return this.setPage(this.state.page+1)},r.prototype.previousPage=function(){return this.setPage(this.state.page-1)},r.prototype.setCurrentPage=o,r.prototype.setPage=o,r.prototype.setIndex=function(e){return this.state=this.state.setIndex(e),this._change(),this},r.prototype.setQueryParameter=function(e,t){var n=this.state.setQueryParameter(e,t);return this.state===n?this:(this.state=n,this._change(),this)},r.prototype.setState=function(e){return this.state=new a(e),this._change(),this},r.prototype.getState=function(e){return void 0===e?this.state:this.state.filter(e)},r.prototype.getStateAsQueryString=function(e){var t=e&&e.filters||["query","attribute:*"],n=this.getState(t);return v.getQueryStringFromState(n,e)},r.getConfigurationFromQueryString=v.getStateFromQueryString,r.getForeignConfigurationInQueryString=v.getUnrecognizedParametersInQueryString,r.prototype.setStateFromQueryString=function(e,t){var n=t&&t.triggerChange||!1,r=v.getStateFromQueryString(e,t),o=this.state.setQueryParameters(r);n?this.setState(o):this.overrideStateWithoutTriggeringChangeEvent(o)},r.prototype.overrideStateWithoutTriggeringChangeEvent=function(e){return this.state=new a(e),this},r.prototype.isRefined=function(e,t){if(this.state.isConjunctiveFacet(e))return this.state.isFacetRefined(e,t);if(this.state.isDisjunctiveFacet(e))return this.state.isDisjunctiveFacetRefined(e,t);throw new Error(e+" is not properly defined in this helper configuration(use the facets or disjunctiveFacets keys to configure it)")},r.prototype.hasRefinements=function(e){return h(this.state.getNumericRefinements(e))?this.state.isConjunctiveFacet(e)?this.state.isFacetRefined(e):this.state.isDisjunctiveFacet(e)?this.state.isDisjunctiveFacetRefined(e):this.state.isHierarchicalFacet(e)?this.state.isHierarchicalFacetRefined(e):!1:!0},r.prototype.isExcluded=function(e,t){return this.state.isExcludeRefined(e,t)},r.prototype.isDisjunctiveRefined=function(e,t){return this.state.isDisjunctiveFacetRefined(e,t)},r.prototype.hasTag=function(e){return this.state.isTagRefined(e)},r.prototype.isTagRefined=function(){return this.hasTagRefinements.apply(this,arguments)},r.prototype.getIndex=function(){return this.state.index},r.prototype.getCurrentPage=i,r.prototype.getPage=i,r.prototype.getTags=function(){return this.state.tagRefinements},r.prototype.getQueryParameter=function(e){return this.state.getQueryParameter(e)},r.prototype.getRefinements=function(e){var t=[];if(this.state.isConjunctiveFacet(e)){var n=this.state.getConjunctiveRefinements(e);f(n,function(e){t.push({value:e,type:"conjunctive"})});var r=this.state.getExcludeRefinements(e);f(r,function(e){t.push({value:e,type:"exclude"})})}else if(this.state.isDisjunctiveFacet(e)){var o=this.state.getDisjunctiveRefinements(e);f(o,function(e){t.push({value:e,type:"disjunctive"})})}var i=this.state.getNumericRefinements(e);return f(i,function(e,n){t.push({value:e,operator:n,type:"numeric"})}),t},r.prototype.getNumericRefinement=function(e,t){return this.state.getNumericRefinement(e,t)},r.prototype.getHierarchicalFacetBreadcrumb=function(e){return p(this.state.getHierarchicalRefinement(e)[0].split(this.state._getHierarchicalFacetSeparator(this.state.getHierarchicalFacetByName(e))),function(e){return m(e)})},r.prototype._search=function(){var e=this.state,t=u._getQueries(e.index,e);this.emit("search",e,this.lastResults),this.client.search(t,d(this._handleResponse,this,e,this._queryId++))},r.prototype._handleResponse=function(e,t,n,r){if(!(t<this._lastQueryIdReceived)){if(this._lastQueryIdReceived=t,n)return void this.emit("error",n);var o=this.lastResults=new s(e,r);this.emit("result",o,e)}},r.prototype.containsRefinement=function(e,t,n,r){return e||0!==t.length||0!==n.length||0!==r.length},r.prototype._hasDisjunctiveRefinements=function(e){return this.state.disjunctiveRefinements[e]&&this.state.disjunctiveRefinements[e].length>0},r.prototype._change=function(){this.emit("change",this.state,this.lastResults)},e.exports=r},function(e,t,n){"use strict";function r(e,t){return _(e,function(e){return v(e,t)})}function o(e){var t=e?o._parseNumbers(e):{};this.index=t.index||"",this.query=t.query||"",this.facets=t.facets||[],this.disjunctiveFacets=t.disjunctiveFacets||[],this.hierarchicalFacets=t.hierarchicalFacets||[],this.facetsRefinements=t.facetsRefinements||{},this.facetsExcludes=t.facetsExcludes||{},this.disjunctiveFacetsRefinements=t.disjunctiveFacetsRefinements||{},this.numericRefinements=t.numericRefinements||{},this.tagRefinements=t.tagRefinements||[],this.hierarchicalFacetsRefinements=t.hierarchicalFacetsRefinements||{},this.numericFilters=t.numericFilters,this.tagFilters=t.tagFilters,this.optionalTagFilters=t.optionalTagFilters,this.optionalFacetFilters=t.optionalFacetFilters,this.hitsPerPage=t.hitsPerPage,this.maxValuesPerFacet=t.maxValuesPerFacet,this.page=t.page||0,this.queryType=t.queryType,this.typoTolerance=t.typoTolerance,this.minWordSizefor1Typo=t.minWordSizefor1Typo,this.minWordSizefor2Typos=t.minWordSizefor2Typos,this.minProximity=t.minProximity,this.allowTyposOnNumericTokens=t.allowTyposOnNumericTokens,this.ignorePlurals=t.ignorePlurals,this.restrictSearchableAttributes=t.restrictSearchableAttributes,this.advancedSyntax=t.advancedSyntax,this.analytics=t.analytics,this.analyticsTags=t.analyticsTags,this.synonyms=t.synonyms,this.replaceSynonymsInHighlight=t.replaceSynonymsInHighlight,this.optionalWords=t.optionalWords,this.removeWordsIfNoResults=t.removeWordsIfNoResults,this.attributesToRetrieve=t.attributesToRetrieve,this.attributesToHighlight=t.attributesToHighlight,this.highlightPreTag=t.highlightPreTag,this.highlightPostTag=t.highlightPostTag,this.attributesToSnippet=t.attributesToSnippet,this.getRankingInfo=t.getRankingInfo,this.distinct=t.distinct,this.aroundLatLng=t.aroundLatLng,this.aroundLatLngViaIP=t.aroundLatLngViaIP,this.aroundRadius=t.aroundRadius,this.minimumAroundRadius=t.minimumAroundRadius,this.aroundPrecision=t.aroundPrecision,this.insideBoundingBox=t.insideBoundingBox,this.insidePolygon=t.insidePolygon,this.snippetEllipsisText=t.snippetEllipsisText,this.disableExactOnAttributes=t.disableExactOnAttributes,this.enableExactOnSingleWordQuery=t.enableExactOnSingleWordQuery,this.offset=t.offset,this.length=t.length,s(t,function(e,t){if(-1===o.PARAMETERS.indexOf(t)){this[t]=e;var n="Unknown SearchParameter: `"+t+"` (this might raise an error in the Algolia API)";E(n)}},this)}var i=n(23),a=n(102),s=n(109),u=n(15),l=n(111),c=n(55),f=n(114),p=n(118),d=n(124),h=n(34),m=n(127),v=n(129),g=n(130),y=n(128),b=n(26),_=n(131),C=n(135),w=n(136),x=n(80),P=n(141),E=n(142),R=n(169),S=n(171),O=n(172);o.PARAMETERS=i(new o),o._parseNumbers=function(e){var t={},n=["aroundPrecision","aroundRadius","getRankingInfo","minWordSizefor2Typos","minWordSizefor1Typo","page","maxValuesPerFacet","distinct","minimumAroundRadius","hitsPerPage","minProximity"];if(u(n,function(n){var r=e[n];y(r)&&(t[n]=parseFloat(e[n]))}),e.numericRefinements){var r={};u(e.numericRefinements,function(e,t){r[t]={},u(e,function(e,n){var o=c(e,function(e){return h(e)?c(e,function(e){return y(e)?parseFloat(e):e}):y(e)?parseFloat(e):e});r[t][n]=o})}),t.numericRefinements=r}return x({},e,t)},o.make=function(e){var t=new o(e);return u(e.hierarchicalFacets,function(e){if(e.rootPath){var n=t.getHierarchicalRefinement(e.name);n.length>0&&0!==n[0].indexOf(e.rootPath)&&(t=t.clearRefinements(e.name)),n=t.getHierarchicalRefinement(e.name),0===n.length&&(t=t.toggleHierarchicalFacetRefinement(e.name,e.rootPath))}}),P(t)},o.validate=function(e,t){var n=t||{},r=i(n),a=l(r,function(e){return-1===o.PARAMETERS.indexOf(e)});return 1===a.length?E("Unknown parameter "+a[0]+" (this might rise an error in the Algolia API)"):a.length>1&&E("Unknown parameters "+a.join(", ")+" (this might raise an error in the Algolia API)"),e.tagFilters&&n.tagRefinements&&n.tagRefinements.length>0?new Error("[Tags] Cannot switch from the managed tag API to the advanced API. It is probably an error, if it is really what you want, you should first clear the tags with clearTags method."):e.tagRefinements.length>0&&n.tagFilters?new Error("[Tags] Cannot switch from the advanced tag API to the managed API. It is probably an error, if it is not, you should first clear the tags with clearTags method."):e.numericFilters&&n.numericRefinements&&!m(n.numericRefinements)?new Error("[Numeric filters] Can't switch from the advanced to the managed API. It is probably an error, if this is really what you want, you have to first clear the numeric filters."):!m(e.numericRefinements)&&n.numericFilters?new Error("[Numeric filters] Can't switch from the managed API to the advanced. It is probably an error, if this is really what you want, you have to first clear the numeric filters."):null},o.prototype={constructor:o,clearRefinements:function(e){var t=O.clearRefinement;return this.setQueryParameters({page:0,numericRefinements:this._clearNumericRefinements(e),facetsRefinements:t(this.facetsRefinements,e,"conjunctiveFacet"),facetsExcludes:t(this.facetsExcludes,e,"exclude"),disjunctiveFacetsRefinements:t(this.disjunctiveFacetsRefinements,e,"disjunctiveFacet"),hierarchicalFacetsRefinements:t(this.hierarchicalFacetsRefinements,e,"hierarchicalFacet")})},clearTags:function(){return void 0===this.tagFilters&&0===this.tagRefinements.length?this:this.setQueryParameters({page:0,tagFilters:void 0,tagRefinements:[]})},setIndex:function(e){return e===this.index?this:this.setQueryParameters({index:e,page:0})},setQuery:function(e){return e===this.query?this:this.setQueryParameters({query:e,page:0})},setPage:function(e){return e===this.page?this:this.setQueryParameters({page:e})},setFacets:function(e){return this.setQueryParameters({facets:e})},setDisjunctiveFacets:function(e){return this.setQueryParameters({disjunctiveFacets:e})},setHitsPerPage:function(e){return this.hitsPerPage===e?this:this.setQueryParameters({hitsPerPage:e,page:0})},setTypoTolerance:function(e){return this.typoTolerance===e?this:this.setQueryParameters({typoTolerance:e,page:0})},addNumericRefinement:function(e,t,n){var r=R(n);if(this.isNumericRefined(e,t,r))return this;var o=x({},this.numericRefinements);return o[e]=x({},o[e]),o[e][t]?(o[e][t]=o[e][t].slice(),o[e][t].push(r)):o[e][t]=[r],this.setQueryParameters({page:0,numericRefinements:o})},getConjunctiveRefinements:function(e){if(!this.isConjunctiveFacet(e))throw new Error(e+" is not defined in the facets attribute of the helper configuration");return this.facetsRefinements[e]||[]},getDisjunctiveRefinements:function(e){if(!this.isDisjunctiveFacet(e))throw new Error(e+" is not defined in the disjunctiveFacets attribute of the helper configuration");return this.disjunctiveFacetsRefinements[e]||[]},getHierarchicalRefinement:function(e){return this.hierarchicalFacetsRefinements[e]||[]},getExcludeRefinements:function(e){if(!this.isConjunctiveFacet(e))throw new Error(e+" is not defined in the facets attribute of the helper configuration");return this.facetsExcludes[e]||[]},removeNumericRefinement:function(e,t,n){if(void 0!==n){var r=R(n);return this.isNumericRefined(e,t,r)?this.setQueryParameters({page:0,numericRefinements:this._clearNumericRefinements(function(n,o){return o===e&&n.op===t&&v(n.val,r)})}):this}return void 0!==t?this.isNumericRefined(e,t)?this.setQueryParameters({page:0,numericRefinements:this._clearNumericRefinements(function(n,r){return r===e&&n.op===t})}):this:this.isNumericRefined(e)?this.setQueryParameters({page:0,numericRefinements:this._clearNumericRefinements(function(t,n){return n===e})}):this},getNumericRefinements:function(e){return this.numericRefinements[e]||{}},getNumericRefinement:function(e,t){return this.numericRefinements[e]&&this.numericRefinements[e][t]},_clearNumericRefinements:function(e){return g(e)?{}:y(e)?p(this.numericRefinements,e):b(e)?f(this.numericRefinements,function(t,n,r){var o={};return u(n,function(t,n){var i=[];u(t,function(t){var o=e({val:t,op:n},r,"numeric");o||i.push(t)}),m(i)||(o[n]=i)}),m(o)||(t[r]=o),t},{}):void 0},addFacetRefinement:function(e,t){if(!this.isConjunctiveFacet(e))throw new Error(e+" is not defined in the facets attribute of the helper configuration");return O.isRefined(this.facetsRefinements,e,t)?this:this.setQueryParameters({page:0,facetsRefinements:O.addRefinement(this.facetsRefinements,e,t)})},addExcludeRefinement:function(e,t){if(!this.isConjunctiveFacet(e))throw new Error(e+" is not defined in the facets attribute of the helper configuration");return O.isRefined(this.facetsExcludes,e,t)?this:this.setQueryParameters({page:0,facetsExcludes:O.addRefinement(this.facetsExcludes,e,t)})},addDisjunctiveFacetRefinement:function(e,t){if(!this.isDisjunctiveFacet(e))throw new Error(e+" is not defined in the disjunctiveFacets attribute of the helper configuration");return O.isRefined(this.disjunctiveFacetsRefinements,e,t)?this:this.setQueryParameters({page:0,disjunctiveFacetsRefinements:O.addRefinement(this.disjunctiveFacetsRefinements,e,t)})},addTagRefinement:function(e){if(this.isTagRefined(e))return this;var t={page:0,tagRefinements:this.tagRefinements.concat(e)};return this.setQueryParameters(t)},removeFacetRefinement:function(e,t){if(!this.isConjunctiveFacet(e))throw new Error(e+" is not defined in the facets attribute of the helper configuration");return O.isRefined(this.facetsRefinements,e,t)?this.setQueryParameters({page:0,facetsRefinements:O.removeRefinement(this.facetsRefinements,e,t)}):this},removeExcludeRefinement:function(e,t){if(!this.isConjunctiveFacet(e))throw new Error(e+" is not defined in the facets attribute of the helper configuration");return O.isRefined(this.facetsExcludes,e,t)?this.setQueryParameters({page:0,facetsExcludes:O.removeRefinement(this.facetsExcludes,e,t)}):this},removeDisjunctiveFacetRefinement:function(e,t){if(!this.isDisjunctiveFacet(e))throw new Error(e+" is not defined in the disjunctiveFacets attribute of the helper configuration");return O.isRefined(this.disjunctiveFacetsRefinements,e,t)?this.setQueryParameters({page:0,disjunctiveFacetsRefinements:O.removeRefinement(this.disjunctiveFacetsRefinements,e,t)}):this},removeTagRefinement:function(e){if(!this.isTagRefined(e))return this;var t={page:0,tagRefinements:l(this.tagRefinements,function(t){return t!==e})};return this.setQueryParameters(t)},toggleRefinement:function(e,t){if(this.isHierarchicalFacet(e))return this.toggleHierarchicalFacetRefinement(e,t);if(this.isConjunctiveFacet(e))return this.toggleFacetRefinement(e,t);if(this.isDisjunctiveFacet(e))return this.toggleDisjunctiveFacetRefinement(e,t);throw new Error("Cannot refine the undeclared facet "+e+"; it should be added to the helper options facets, disjunctiveFacets or hierarchicalFacets")},toggleFacetRefinement:function(e,t){if(!this.isConjunctiveFacet(e))throw new Error(e+" is not defined in the facets attribute of the helper configuration");return this.setQueryParameters({page:0,facetsRefinements:O.toggleRefinement(this.facetsRefinements,e,t)})},toggleExcludeFacetRefinement:function(e,t){if(!this.isConjunctiveFacet(e))throw new Error(e+" is not defined in the facets attribute of the helper configuration");return this.setQueryParameters({page:0,facetsExcludes:O.toggleRefinement(this.facetsExcludes,e,t)})},toggleDisjunctiveFacetRefinement:function(e,t){if(!this.isDisjunctiveFacet(e))throw new Error(e+" is not defined in the disjunctiveFacets attribute of the helper configuration");return this.setQueryParameters({page:0,disjunctiveFacetsRefinements:O.toggleRefinement(this.disjunctiveFacetsRefinements,e,t)})},toggleHierarchicalFacetRefinement:function(e,t){if(!this.isHierarchicalFacet(e))throw new Error(e+" is not defined in the hierarchicalFacets attribute of the helper configuration");var n=this._getHierarchicalFacetSeparator(this.getHierarchicalFacetByName(e)),r={},o=void 0!==this.hierarchicalFacetsRefinements[e]&&this.hierarchicalFacetsRefinements[e].length>0&&(this.hierarchicalFacetsRefinements[e][0]===t||0===this.hierarchicalFacetsRefinements[e][0].indexOf(t+n));return o?-1===t.indexOf(n)?r[e]=[]:r[e]=[t.slice(0,t.lastIndexOf(n))]:r[e]=[t],this.setQueryParameters({page:0,hierarchicalFacetsRefinements:w({},r,this.hierarchicalFacetsRefinements)})},toggleTagRefinement:function(e){return this.isTagRefined(e)?this.removeTagRefinement(e):this.addTagRefinement(e)},isDisjunctiveFacet:function(e){return d(this.disjunctiveFacets,e)>-1},isHierarchicalFacet:function(e){return void 0!==this.getHierarchicalFacetByName(e)},isConjunctiveFacet:function(e){return d(this.facets,e)>-1},isFacetRefined:function(e,t){if(!this.isConjunctiveFacet(e))throw new Error(e+" is not defined in the facets attribute of the helper configuration");return O.isRefined(this.facetsRefinements,e,t)},isExcludeRefined:function(e,t){if(!this.isConjunctiveFacet(e))throw new Error(e+" is not defined in the facets attribute of the helper configuration");return O.isRefined(this.facetsExcludes,e,t)},isDisjunctiveFacetRefined:function(e,t){if(!this.isDisjunctiveFacet(e))throw new Error(e+" is not defined in the disjunctiveFacets attribute of the helper configuration");return O.isRefined(this.disjunctiveFacetsRefinements,e,t)},isHierarchicalFacetRefined:function(e,t){if(!this.isHierarchicalFacet(e))throw new Error(e+" is not defined in the hierarchicalFacets attribute of the helper configuration");var n=this.getHierarchicalRefinement(e);return t?-1!==d(n,t):n.length>0},isNumericRefined:function(e,t,n){if(g(n)&&g(t))return!!this.numericRefinements[e];var o=this.numericRefinements[e]&&!g(this.numericRefinements[e][t]);if(g(n)||!o)return o;var i=R(n),a=!g(r(this.numericRefinements[e][t],i));return o&&a},isTagRefined:function(e){return-1!==d(this.tagRefinements,e)},getRefinedDisjunctiveFacets:function(){var e=a(i(this.numericRefinements),this.disjunctiveFacets);return i(this.disjunctiveFacetsRefinements).concat(e).concat(this.getRefinedHierarchicalFacets())},getRefinedHierarchicalFacets:function(){return a(C(this.hierarchicalFacets,"name"),i(this.hierarchicalFacetsRefinements))},getUnrefinedDisjunctiveFacets:function(){var e=this.getRefinedDisjunctiveFacets();return l(this.disjunctiveFacets,function(t){return-1===d(e,t)})},managedParameters:["index","facets","disjunctiveFacets","facetsRefinements","facetsExcludes","disjunctiveFacetsRefinements","numericRefinements","tagRefinements","hierarchicalFacets","hierarchicalFacetsRefinements"],getQueryParams:function(){var e=this.managedParameters,t={};return s(this,function(n,r){-1===d(e,r)&&void 0!==n&&(t[r]=n)}),t},getQueryParameter:function(e){if(!this.hasOwnProperty(e))throw new Error("Parameter '"+e+"' is not an attribute of SearchParameters (http://algolia.github.io/algoliasearch-helper-js/docs/SearchParameters.html)");return this[e]},setQueryParameter:function(e,t){if(this[e]===t)return this;var n={};return n[e]=t,this.setQueryParameters(n)},setQueryParameters:function(e){var t=o.validate(this,e);if(t)throw t;var n=o._parseNumbers(e);return this.mutateMe(function(t){var r=i(e);return u(r,function(e){t[e]=n[e]}),t})},filter:function(e){return S(this,e)},mutateMe:function(e){var t=new this.constructor(this);return e(t,this),P(t)},_getHierarchicalFacetSortBy:function(e){return e.sortBy||["isRefined:desc","name:asc"]},_getHierarchicalFacetSeparator:function(e){return e.separator||" > "},_getHierarchicalRootPath:function(e){return e.rootPath||null},_getHierarchicalShowParentLevel:function(e){return"boolean"==typeof e.showParentLevel?e.showParentLevel:!0},getHierarchicalFacetByName:function(e){return _(this.hierarchicalFacets,{name:e})}},e.exports=o},function(e,t,n){var r=n(103),o=n(105),i=n(106),a=n(28),s=n(87),u=s(function(e){for(var t=e.length,n=t,s=Array(h),u=r,l=!0,c=[];n--;){var f=e[n]=a(f=e[n])?f:[];s[n]=l&&f.length>=120?i(n&&f):null}var p=e[0],d=-1,h=p?p.length:0,m=s[0];e:for(;++d<h;)if(f=p[d],(m?o(m,f):u(c,f,0))<0){for(var n=t;--n;){var v=s[n];if((v?o(v,f):u(e[n],f,0))<0)continue e}m&&m.push(f),c.push(f)}return c});e.exports=u},function(e,t,n){function r(e,t,n){if(t!==t)return o(e,n);for(var r=n-1,i=e.length;++r<i;)if(e[r]===t)return r;return-1}var o=n(104);e.exports=r},function(e,t){function n(e,t,n){for(var r=e.length,o=t+(n?0:-1);n?o--:++o<r;){var i=e[o];if(i!==i)return o}return-1}e.exports=n},function(e,t,n){function r(e,t){var n=e.data,r="string"==typeof t||o(t)?n.set.has(t):n.hash[t];return r?0:-1}var o=n(22);e.exports=r},function(e,t,n){(function(t){function r(e){return s&&a?new o(e):null}var o=n(107),i=n(24),a=i(t,"Set"),s=i(Object,"create");e.exports=r}).call(t,function(){return this}())},function(e,t,n){(function(t){function r(e){var t=e?e.length:0;for(this.data={hash:s(null),set:new a};t--;)this.push(e[t])}var o=n(108),i=n(24),a=i(t,"Set"),s=i(Object,"create");r.prototype.push=o,e.exports=r}).call(t,function(){return this}())},function(e,t,n){function r(e){var t=this.data;"string"==typeof e||o(e)?t.set.add(e):t.hash[e]=!0}var o=n(22);e.exports=r},function(e,t,n){var r=n(18),o=n(110),i=o(r);e.exports=i},function(e,t,n){function r(e){return function(t,n,r){return"function"==typeof n&&void 0===r||(n=o(n,r,3)),e(t,n)}}var o=n(39);e.exports=r},function(e,t,n){function r(e,t,n){var r=s(e)?o:a;return t=i(t,n,3),r(e,t)}var o=n(112),i=n(57),a=n(113),s=n(34);e.exports=r},function(e,t){function n(e,t){for(var n=-1,r=e.length,o=-1,i=[];++n<r;){var a=e[n];t(a,n,e)&&(i[++o]=a)}return i}e.exports=n},function(e,t,n){function r(e,t){var n=[];return o(e,function(e,r,o){t(e,r,o)&&n.push(e)}),n}var o=n(17);e.exports=r},function(e,t,n){var r=n(115),o=n(17),i=n(116),a=i(r,o);e.exports=a},function(e,t){function n(e,t,n,r){var o=-1,i=e.length;for(r&&i&&(n=e[++o]);++o<i;)n=t(n,e[o],o,e);return n}e.exports=n},function(e,t,n){function r(e,t){return function(n,r,s,u){var l=arguments.length<3;return"function"==typeof r&&void 0===u&&a(n)?e(n,r,s,l):i(n,o(r,u,4),s,l,t)}}var o=n(57),i=n(117),a=n(34);e.exports=r},function(e,t){function n(e,t,n,r,o){return o(e,function(e,o,i){n=r?(r=!1,e):t(n,e,o,i)}),n}e.exports=n},function(e,t,n){var r=n(56),o=n(119),i=n(120),a=n(39),s=n(36),u=n(122),l=n(123),c=n(87),f=c(function(e,t){if(null==e)return{};if("function"!=typeof t[0]){var t=r(i(t),String);return u(e,o(s(e),t))}var n=a(t[0],t[1],3);return l(e,function(e,t,r){return!n(e,t,r)})});e.exports=f},function(e,t,n){function r(e,t){var n=e?e.length:0,r=[];if(!n)return r;var u=-1,l=o,c=!0,f=c&&t.length>=s?a(t):null,p=t.length;f&&(l=i,c=!1,t=f);e:for(;++u<n;){var d=e[u];if(c&&d===d){for(var h=p;h--;)if(t[h]===d)continue e;r.push(d)}else l(t,d,0)<0&&r.push(d)}return r}var o=n(103),i=n(105),a=n(106),s=200;e.exports=r},function(e,t,n){function r(e,t,n,l){l||(l=[]);for(var c=-1,f=e.length;++c<f;){var p=e[c];u(p)&&s(p)&&(n||a(p)||i(p))?t?r(p,t,n,l):o(l,p):n||(l[l.length]=p)}return l}var o=n(121),i=n(33),a=n(34),s=n(28),u=n(27);e.exports=r},function(e,t){function n(e,t){for(var n=-1,r=t.length,o=e.length;++n<r;)e[o+n]=t[n];return e}e.exports=n},function(e,t,n){function r(e,t){e=o(e);for(var n=-1,r=t.length,i={};++n<r;){var a=t[n];a in e&&(i[a]=e[a])}return i}var o=n(21);e.exports=r},function(e,t,n){function r(e,t){var n={};return o(e,function(e,r,o){t(e,r,o)&&(n[r]=e)}),n}var o=n(84);e.exports=r},function(e,t,n){function r(e,t,n){var r=e?e.length:0;if(!r)return-1;if("number"==typeof n)n=0>n?a(r+n,0):n;else if(n){var s=i(e,t);return r>s&&(t===t?t===e[s]:e[s]!==e[s])?s:-1}return o(e,t,n||0)}var o=n(103),i=n(125),a=Math.max;e.exports=r},function(e,t,n){function r(e,t,n){var r=0,a=e?e.length:r;if("number"==typeof t&&t===t&&s>=a){for(;a>r;){var u=r+a>>>1,l=e[u];(n?t>=l:t>l)&&null!==l?r=u+1:a=u}return a}return o(e,t,i,n)}var o=n(126),i=n(40),a=4294967295,s=a>>>1;e.exports=r},function(e,t){function n(e,t,n,i){t=n(t);for(var s=0,u=e?e.length:0,l=t!==t,c=null===t,f=void 0===t;u>s;){var p=r((s+u)/2),d=n(e[p]),h=void 0!==d,m=d===d;if(l)var v=m||i;else v=c?m&&h&&(i||null!=d):f?m&&(i||h):null==d?!1:i?t>=d:t>d;v?s=p+1:u=p}return o(u,a)}var r=Math.floor,o=Math.min,i=4294967295,a=i-1;e.exports=n},function(e,t,n){function r(e){return null==e?!0:a(e)&&(i(e)||l(e)||o(e)||u(e)&&s(e.splice))?!e.length:!c(e).length}var o=n(33),i=n(34),a=n(28),s=n(26),u=n(27),l=n(128),c=n(23);e.exports=r},function(e,t,n){function r(e){return"string"==typeof e||o(e)&&s.call(e)==i}var o=n(27),i="[object String]",a=Object.prototype,s=a.toString;e.exports=r},function(e,t,n){function r(e,t,n,r){n="function"==typeof n?i(n,r,3):void 0;var a=n?n(e,t):void 0;return void 0===a?o(e,t,n):!!a}var o=n(60),i=n(39);e.exports=r},function(e,t){function n(e){return void 0===e}e.exports=n},function(e,t,n){var r=n(17),o=n(132),i=o(r);e.exports=i},function(e,t,n){function r(e,t){return function(n,r,u){if(r=o(r,u,3),s(n)){var l=a(n,r,t);return l>-1?n[l]:void 0}return i(n,r,e)}}var o=n(57),i=n(133),a=n(134),s=n(34);e.exports=r},function(e,t){function n(e,t,n,r){var o;return n(e,function(e,n,i){return t(e,n,i)?(o=r?n:e,!1):void 0}),o}e.exports=n},function(e,t){function n(e,t,n){for(var r=e.length,o=n?r:-1;n?o--:++o<r;)if(t(e[o],o,e))return o;return-1}e.exports=n},function(e,t,n){function r(e,t){return o(e,i(t))}var o=n(55),i=n(77);e.exports=r},function(e,t,n){var r=n(137),o=n(139),i=n(140),a=i(r,o);e.exports=a},function(e,t,n){var r=n(138),o=n(48),i=n(86),a=i(function(e,t,n){return n?r(e,t,n):o(e,t)});e.exports=a},function(e,t,n){function r(e,t,n){for(var r=-1,i=o(t),a=i.length;++r<a;){var s=i[r],u=e[s],l=n(u,t[s],s,e,t);(l===l?l===u:u!==u)&&(void 0!==u||s in e)||(e[s]=l)}return e}var o=n(23);e.exports=r},function(e,t){function n(e,t){return void 0===e?t:e}e.exports=n},function(e,t,n){function r(e,t){return o(function(n){var r=n[0];return null==r?r:(n.push(t),e.apply(void 0,n))})}var o=n(87);e.exports=r},function(e,t,n){"use strict";var r=n(15),o=n(40),i=n(22),a=function(e){return i(e)?(r(e,a),Object.isFrozen(e)||Object.freeze(e),e):e};e.exports=Object.freeze?a:o},function(e,t,n){"use strict";var r=n(143);try{var o;o="undefined"!=typeof window?window.console&&r(window.console.warn,console):r(console.warn,console);var i=function(e){var t=[];return function(n){-1===t.indexOf(n)&&(e(n),t.push(n))}}(o);e.exports=i}catch(a){e.exports=function(){}}},function(e,t,n){var r=n(144),o=n(164),i=n(87),a=1,s=32,u=i(function(e,t,n){var i=a;if(n.length){var l=o(n,u.placeholder);i|=s}return r(e,i,t,n,l)});u.placeholder={},e.exports=u},function(e,t,n){function r(e,t,n,r,g,y,b,_){var C=t&p;if(!C&&"function"!=typeof e)throw new TypeError(m);var w=r?r.length:0;if(w||(t&=~(d|h),r=g=void 0),w-=g?g.length:0,t&h){var x=r,P=g;r=g=void 0}var E=C?void 0:u(e),R=[e,t,n,r,g,x,P,y,b,_];if(E&&(l(R,E),t=R[1],_=R[9]),R[9]=null==_?C?0:e.length:v(_-w,0)||0,t==f)var S=i(R[0],R[2]);else S=t!=d&&t!=(f|d)||R[4].length?a.apply(void 0,R):s.apply(void 0,R);var O=E?o:c;return O(S,R)}var o=n(145),i=n(147),a=n(150),s=n(167),u=n(156),l=n(168),c=n(165),f=1,p=2,d=32,h=64,m="Expected a function",v=Math.max;e.exports=r},function(e,t,n){var r=n(40),o=n(146),i=o?function(e,t){return o.set(e,t),e}:r;e.exports=i},function(e,t,n){(function(t){var r=n(24),o=r(t,"WeakMap"),i=o&&new o;e.exports=i}).call(t,function(){return this}())},function(e,t,n){(function(t){function r(e,n){function r(){var o=this&&this!==t&&this instanceof r?i:e;return o.apply(n,arguments)}var i=o(e);return r}var o=n(148);e.exports=r}).call(t,function(){return this}())},function(e,t,n){function r(e){return function(){var t=arguments;switch(t.length){case 0:return new e;case 1:return new e(t[0]);case 2:return new e(t[0],t[1]);case 3:return new e(t[0],t[1],t[2]);case 4:return new e(t[0],t[1],t[2],t[3]);case 5:return new e(t[0],t[1],t[2],t[3],t[4]);case 6:return new e(t[0],t[1],t[2],t[3],t[4],t[5]);case 7:return new e(t[0],t[1],t[2],t[3],t[4],t[5],t[6])}var n=o(e.prototype),r=e.apply(n,t);return i(r)?r:n}}var o=n(149),i=n(22);e.exports=r},function(e,t,n){var r=n(22),o=function(){function e(){}return function(t){if(r(t)){e.prototype=t;var n=new e;e.prototype=void 0}return n||{}}}();e.exports=o},function(e,t,n){(function(t){function r(e,n,C,w,x,P,E,R,S,O){function T(){for(var h=arguments.length,m=h,v=Array(h);m--;)v[m]=arguments[m];if(w&&(v=i(v,w,x)),P&&(v=a(v,P,E)),A||F){var b=T.placeholder,D=c(v,b);if(h-=D.length,O>h){var U=R?o(R):void 0,L=_(O-h,0),H=A?D:void 0,V=A?void 0:D,B=A?v:void 0,q=A?void 0:v;n|=A?g:y,n&=~(A?y:g),M||(n&=~(p|d));var W=[e,n,C,B,H,q,V,U,S,L],K=r.apply(void 0,W);return u(e)&&f(K,W),K.placeholder=b,K}}var Q=N?C:this,$=j?Q[e]:e;return R&&(v=l(v,R)),k&&S<v.length&&(v.length=S),this&&this!==t&&this instanceof T&&($=I||s(e)),$.apply(Q,v)}var k=n&b,N=n&p,j=n&d,A=n&m,M=n&h,F=n&v,I=j?void 0:s(e);return T}var o=n(47),i=n(151),a=n(152),s=n(148),u=n(153),l=n(163),c=n(164),f=n(165),p=1,d=2,h=4,m=8,v=16,g=32,y=64,b=128,_=Math.max;e.exports=r}).call(t,function(){return this}())},function(e,t){function n(e,t,n){for(var o=n.length,i=-1,a=r(e.length-o,0),s=-1,u=t.length,l=Array(u+a);++s<u;)l[s]=t[s];for(;++i<o;)l[n[i]]=e[i];for(;a--;)l[s++]=e[i++];return l}var r=Math.max;e.exports=n},function(e,t){function n(e,t,n){for(var o=-1,i=n.length,a=-1,s=r(e.length-i,0),u=-1,l=t.length,c=Array(s+l);++a<s;)c[a]=e[a];for(var f=a;++u<l;)c[f+u]=t[u];for(;++o<i;)c[f+n[o]]=e[a++];return c}var r=Math.max;e.exports=n},function(e,t,n){function r(e){var t=a(e),n=s[t];if("function"!=typeof n||!(t in o.prototype))return!1;if(e===n)return!0;var r=i(n);return!!r&&e===r[0]}var o=n(154),i=n(156),a=n(158),s=n(160);e.exports=r},function(e,t,n){function r(e){this.__wrapped__=e,this.__actions__=[],this.__dir__=1,this.__filtered__=!1,this.__iteratees__=[],this.__takeCount__=a,this.__views__=[]}var o=n(149),i=n(155),a=Number.POSITIVE_INFINITY;r.prototype=o(i.prototype),r.prototype.constructor=r,e.exports=r},function(e,t){function n(){}e.exports=n},function(e,t,n){var r=n(146),o=n(157),i=r?function(e){return r.get(e)}:o;e.exports=i},function(e,t){function n(){}e.exports=n;
},function(e,t,n){function r(e){for(var t=e.name+"",n=o[t],r=n?n.length:0;r--;){var i=n[r],a=i.func;if(null==a||a==e)return i.name}return t}var o=n(159);e.exports=r},function(e,t){var n={};e.exports=n},function(e,t,n){function r(e){if(u(e)&&!s(e)&&!(e instanceof o)){if(e instanceof i)return e;if(f.call(e,"__chain__")&&f.call(e,"__wrapped__"))return l(e)}return new i(e)}var o=n(154),i=n(161),a=n(155),s=n(34),u=n(27),l=n(162),c=Object.prototype,f=c.hasOwnProperty;r.prototype=a.prototype,e.exports=r},function(e,t,n){function r(e,t,n){this.__wrapped__=e,this.__actions__=n||[],this.__chain__=!!t}var o=n(149),i=n(155);r.prototype=o(i.prototype),r.prototype.constructor=r,e.exports=r},function(e,t,n){function r(e){return e instanceof o?e.clone():new i(e.__wrapped__,e.__chain__,a(e.__actions__))}var o=n(154),i=n(161),a=n(47);e.exports=r},function(e,t,n){function r(e,t){for(var n=e.length,r=a(t.length,n),s=o(e);r--;){var u=t[r];e[r]=i(u,n)?s[u]:void 0}return e}var o=n(47),i=n(35),a=Math.min;e.exports=r},function(e,t){function n(e,t){for(var n=-1,o=e.length,i=-1,a=[];++n<o;)e[n]===t&&(e[n]=r,a[++i]=n);return a}var r="__lodash_placeholder__";e.exports=n},function(e,t,n){var r=n(145),o=n(166),i=150,a=16,s=function(){var e=0,t=0;return function(n,s){var u=o(),l=a-(u-t);if(t=u,l>0){if(++e>=i)return n}else e=0;return r(n,s)}}();e.exports=s},function(e,t,n){var r=n(24),o=r(Date,"now"),i=o||function(){return(new Date).getTime()};e.exports=i},function(e,t,n){(function(t){function r(e,n,r,a){function s(){for(var n=-1,o=arguments.length,i=-1,c=a.length,f=Array(c+o);++i<c;)f[i]=a[i];for(;o--;)f[i++]=arguments[++n];var p=this&&this!==t&&this instanceof s?l:e;return p.apply(u?r:this,f)}var u=n&i,l=o(e);return s}var o=n(148),i=1;e.exports=r}).call(t,function(){return this}())},function(e,t,n){function r(e,t){var n=e[1],r=t[1],m=n|r,v=f>m,g=r==f&&n==c||r==f&&n==p&&e[7].length<=t[8]||r==(f|p)&&n==c;if(!v&&!g)return e;r&u&&(e[2]=t[2],m|=n&u?0:l);var y=t[3];if(y){var b=e[3];e[3]=b?i(b,y,t[4]):o(y),e[4]=b?s(e[3],d):o(t[4])}return y=t[5],y&&(b=e[5],e[5]=b?a(b,y,t[6]):o(y),e[6]=b?s(e[5],d):o(t[6])),y=t[7],y&&(e[7]=o(y)),r&f&&(e[8]=null==e[8]?t[8]:h(e[8],t[8])),null==e[9]&&(e[9]=t[9]),e[0]=t[0],e[1]=m,e}var o=n(47),i=n(151),a=n(152),s=n(164),u=1,l=4,c=8,f=128,p=256,d="__lodash_placeholder__",h=Math.min;e.exports=r},function(e,t,n){"use strict";function r(e){if(a(e))return e;if(s(e))return parseFloat(e);if(i(e))return o(e,r);throw new Error("The value should be a number, a parseable string or an array of those.")}var o=n(55),i=n(34),a=n(170),s=n(128);e.exports=r},function(e,t,n){function r(e){return"number"==typeof e||o(e)&&s.call(e)==i}var o=n(27),i="[object Number]",a=Object.prototype,s=a.toString;e.exports=r},function(e,t,n){"use strict";function r(e,t){var n={},r=i(t,function(e){return-1!==e.indexOf("attribute:")}),l=a(r,function(e){return e.split(":")[1]});-1===u(l,"*")?o(l,function(t){e.isConjunctiveFacet(t)&&e.isFacetRefined(t)&&(n.facetsRefinements||(n.facetsRefinements={}),n.facetsRefinements[t]=e.facetsRefinements[t]),e.isDisjunctiveFacet(t)&&e.isDisjunctiveFacetRefined(t)&&(n.disjunctiveFacetsRefinements||(n.disjunctiveFacetsRefinements={}),n.disjunctiveFacetsRefinements[t]=e.disjunctiveFacetsRefinements[t]),e.isHierarchicalFacet(t)&&e.isHierarchicalFacetRefined(t)&&(n.hierarchicalFacetsRefinements||(n.hierarchicalFacetsRefinements={}),n.hierarchicalFacetsRefinements[t]=e.hierarchicalFacetsRefinements[t]);var r=e.getNumericRefinements(t);s(r)||(n.numericRefinements||(n.numericRefinements={}),n.numericRefinements[t]=e.numericRefinements[t])}):(s(e.numericRefinements)||(n.numericRefinements=e.numericRefinements),s(e.facetsRefinements)||(n.facetsRefinements=e.facetsRefinements),s(e.disjunctiveFacetsRefinements)||(n.disjunctiveFacetsRefinements=e.disjunctiveFacetsRefinements),s(e.hierarchicalFacetsRefinements)||(n.hierarchicalFacetsRefinements=e.hierarchicalFacetsRefinements));var c=i(t,function(e){return-1===e.indexOf("attribute:")});return o(c,function(t){n[t]=e[t]}),n}var o=n(15),i=n(111),a=n(55),s=n(127),u=n(124);e.exports=r},function(e,t,n){"use strict";var r=n(130),o=n(128),i=n(26),a=n(127),s=n(136),u=n(114),l=n(111),c=n(118),f={addRefinement:function(e,t,n){if(f.isRefined(e,t,n))return e;var r=""+n,o=e[t]?e[t].concat(r):[r],i={};return i[t]=o,s({},i,e)},removeRefinement:function(e,t,n){if(r(n))return f.clearRefinement(e,t);var o=""+n;return f.clearRefinement(e,function(e,n){return t===n&&o===e})},toggleRefinement:function(e,t,n){if(r(n))throw new Error("toggleRefinement should be used with a value");return f.isRefined(e,t,n)?f.removeRefinement(e,t,n):f.addRefinement(e,t,n)},clearRefinement:function(e,t,n){return r(t)?{}:o(t)?c(e,t):i(t)?u(e,function(e,r,o){var i=l(r,function(e){return!t(e,o,n)});return a(i)||(e[o]=i),e},{}):void 0},isRefined:function(e,t,o){var i=n(124),a=!!e[t]&&e[t].length>0;if(r(o)||!a)return a;var s=""+o;return-1!==i(e[t],s)}};e.exports=f},function(e,t,n){"use strict";function r(e){var t={};return f(e,function(e,n){t[e]=n}),t}function o(e,t,n){t&&t[n]&&(e.stats=t[n])}function i(e,t){return v(e,function(e){return g(e.attributes,t)})}function a(e,t){var n=t.results[0];this.query=n.query,this.parsedQuery=n.parsedQuery,this.hits=n.hits,this.index=n.index,this.hitsPerPage=n.hitsPerPage,this.nbHits=n.nbHits,this.nbPages=n.nbPages,this.page=n.page,this.processingTimeMS=m(t.results,"processingTimeMS"),this.aroundLatLng=n.aroundLatLng,this.automaticRadius=n.automaticRadius,this.serverUsed=n.serverUsed,this.timeoutCounts=n.timeoutCounts,this.timeoutHits=n.timeoutHits,this.disjunctiveFacets=[],this.hierarchicalFacets=y(e.hierarchicalFacets,function(){return[]}),this.facets=[];var a=e.getRefinedDisjunctiveFacets(),s=r(e.facets),u=r(e.disjunctiveFacets),l=1;f(n.facets,function(t,r){var a=i(e.hierarchicalFacets,r);if(a){var l=a.attributes.indexOf(r);this.hierarchicalFacets[h(e.hierarchicalFacets,{name:a.name})][l]={attribute:r,data:t,exhaustive:n.exhaustiveFacetsCount}}else{var c,f=-1!==d(e.disjunctiveFacets,r),p=-1!==d(e.facets,r);f&&(c=u[r],this.disjunctiveFacets[c]={name:r,data:t,exhaustive:n.exhaustiveFacetsCount},o(this.disjunctiveFacets[c],n.facets_stats,r)),p&&(c=s[r],this.facets[c]={name:r,data:t,exhaustive:n.exhaustiveFacetsCount},o(this.facets[c],n.facets_stats,r))}},this),this.hierarchicalFacets=p(this.hierarchicalFacets),f(a,function(r){var i=t.results[l],a=e.getHierarchicalFacetByName(r);f(i.facets,function(t,r){var s;if(a){s=h(e.hierarchicalFacets,{name:a.name});var l=h(this.hierarchicalFacets[s],{attribute:r});if(-1===l)return;this.hierarchicalFacets[s][l].data=C({},this.hierarchicalFacets[s][l].data,t)}else{s=u[r];var c=n.facets&&n.facets[r]||{};this.disjunctiveFacets[s]={name:r,data:_({},t,c),exhaustive:i.exhaustiveFacetsCount},o(this.disjunctiveFacets[s],i.facets_stats,r),e.disjunctiveFacetsRefinements[r]&&f(e.disjunctiveFacetsRefinements[r],function(t){!this.disjunctiveFacets[s].data[t]&&d(e.disjunctiveFacetsRefinements[r],t)>-1&&(this.disjunctiveFacets[s].data[t]=0)},this)}},this),l++},this),f(e.getRefinedHierarchicalFacets(),function(n){var r=e.getHierarchicalFacetByName(n),o=e._getHierarchicalFacetSeparator(r),i=e.getHierarchicalRefinement(n);if(!(0===i.length||i[0].split(o).length<2)){var a=t.results[l];f(a.facets,function(t,n){var a=h(e.hierarchicalFacets,{name:r.name}),s=h(this.hierarchicalFacets[a],{attribute:n});if(-1!==s){var u={};if(i.length>0){var l=i[0].split(o)[0];u[l]=this.hierarchicalFacets[a][s].data[l]}this.hierarchicalFacets[a][s].data=_(u,t,this.hierarchicalFacets[a][s].data)}},this),l++}},this),f(e.facetsExcludes,function(e,t){var r=s[t];this.facets[r]={name:t,data:n.facets[t],exhaustive:n.exhaustiveFacetsCount},f(e,function(e){this.facets[r]=this.facets[r]||{name:t},this.facets[r].data=this.facets[r].data||{},this.facets[r].data[e]=0},this)},this),this.hierarchicalFacets=y(this.hierarchicalFacets,S(e)),this.facets=p(this.facets),this.disjunctiveFacets=p(this.disjunctiveFacets),this._state=e}function s(e,t){var n={name:t};if(e._state.isConjunctiveFacet(t)){var r=v(e.facets,n);return r?y(r.data,function(n,r){return{name:r,count:n,isRefined:e._state.isFacetRefined(t,r)}}):[]}if(e._state.isDisjunctiveFacet(t)){var o=v(e.disjunctiveFacets,n);return o?y(o.data,function(n,r){return{name:r,count:n,isRefined:e._state.isDisjunctiveFacetRefined(t,r)}}):[]}return e._state.isHierarchicalFacet(t)?v(e.hierarchicalFacets,n):void 0}function u(e,t){if(!t.data||0===t.data.length)return t;var n=y(t.data,P(u,e)),r=e(n),o=C({},t,{data:r});return o}function l(e,t){return t.sort(e)}function c(e,t){var n=v(e,{name:t});return n&&n.stats}var f=n(15),p=n(174),d=n(124),h=n(175),m=n(177),v=n(131),g=n(184),y=n(55),b=n(185),_=n(136),C=n(80),w=n(34),x=n(26),P=n(190),E=n(192),R=n(193),S=n(194);a.prototype.getFacetByName=function(e){var t={name:e};return v(this.facets,t)||v(this.disjunctiveFacets,t)||v(this.hierarchicalFacets,t)},a.DEFAULT_SORT=["isRefined:desc","count:desc","name:asc"],a.prototype.getFacetValues=function(e,t){var n=s(this,e);if(!n)throw new Error(e+" is not a retrieved facet.");var r=_({},t,{sortBy:a.DEFAULT_SORT});if(w(r.sortBy)){var o=R(r.sortBy);return w(n)?b(n,o[0],o[1]):u(E(b,o[0],o[1]),n)}if(x(r.sortBy))return w(n)?n.sort(r.sortBy):u(P(l,r.sortBy),n);throw new Error("options.sortBy is optional but if defined it must be either an array of string (predicates) or a sorting function")},a.prototype.getFacetStats=function(e){if(this._state.isConjunctiveFacet(e))return c(this.facets,e);if(this._state.isDisjunctiveFacet(e))return c(this.disjunctiveFacets,e);throw new Error(e+" is not present in `facets` or `disjunctiveFacets`")},e.exports=a},function(e,t){function n(e){for(var t=-1,n=e?e.length:0,r=-1,o=[];++t<n;){var i=e[t];i&&(o[++r]=i)}return o}e.exports=n},function(e,t,n){var r=n(176),o=r();e.exports=o},function(e,t,n){function r(e){return function(t,n,r){return t&&t.length?(n=o(n,r,3),i(t,n,e)):-1}}var o=n(57),i=n(134);e.exports=r},function(e,t,n){e.exports=n(178)},function(e,t,n){function r(e,t,n){return n&&u(e,t,n)&&(t=void 0),t=i(t,n,3),1==t.length?o(s(e)?e:l(e),t):a(e,t)}var o=n(179),i=n(57),a=n(180),s=n(34),u=n(54),l=n(181);e.exports=r},function(e,t){function n(e,t){for(var n=e.length,r=0;n--;)r+=+t(e[n])||0;return r}e.exports=n},function(e,t,n){function r(e,t){var n=0;return o(e,function(e,r,o){n+=+t(e,r,o)||0}),n}var o=n(17);e.exports=r},function(e,t,n){function r(e){return null==e?[]:o(e)?i(e)?e:Object(e):a(e)}var o=n(28),i=n(22),a=n(182);e.exports=r},function(e,t,n){function r(e){return o(e,i(e))}var o=n(183),i=n(23);e.exports=r},function(e,t){function n(e,t){for(var n=-1,r=t.length,o=Array(r);++n<r;)o[n]=e[t[n]];return o}e.exports=n},function(e,t,n){function r(e,t,n,r){var p=e?i(e):0;return u(p)||(e=c(e),p=e.length),n="number"!=typeof n||r&&s(t,n,r)?0:0>n?f(p+n,0):n||0,"string"==typeof e||!a(e)&&l(e)?p>=n&&e.indexOf(t,n)>-1:!!p&&o(e,t,n)>-1}var o=n(103),i=n(29),a=n(34),s=n(54),u=n(31),l=n(128),c=n(182),f=Math.max;e.exports=r},function(e,t,n){function r(e,t,n,r){return null==e?[]:(r&&a(t,n,r)&&(n=void 0),i(t)||(t=null==t?[]:[t]),i(n)||(n=null==n?[]:[n]),o(e,t,n))}var o=n(186),i=n(34),a=n(54);e.exports=r},function(e,t,n){function r(e,t,n){var r=-1;t=o(t,function(e){return i(e)});var l=a(e,function(e){var n=o(t,function(t){return t(e)});return{criteria:n,index:++r,value:e}});return s(l,function(e,t){return u(e,t,n)})}var o=n(56),i=n(57),a=n(79),s=n(187),u=n(188);e.exports=r},function(e,t){function n(e,t){var n=e.length;for(e.sort(t);n--;)e[n]=e[n].value;return e}e.exports=n},function(e,t,n){function r(e,t,n){for(var r=-1,i=e.criteria,a=t.criteria,s=i.length,u=n.length;++r<s;){var l=o(i[r],a[r]);if(l){if(r>=u)return l;var c=n[r];return l*("asc"===c||c===!0?1:-1)}}return e.index-t.index}var o=n(189);e.exports=r},function(e,t){function n(e,t){if(e!==t){var n=null===e,r=void 0===e,o=e===e,i=null===t,a=void 0===t,s=t===t;if(e>t&&!i||!o||n&&!a&&s||r&&s)return 1;if(t>e&&!n||!s||i&&!r&&o||a&&o)return-1}return 0}e.exports=n},function(e,t,n){var r=n(191),o=32,i=r(o);i.placeholder={},e.exports=i},function(e,t,n){function r(e){var t=a(function(n,r){var a=i(r,t.placeholder);return o(n,e,void 0,r,a)});return t}var o=n(144),i=n(164),a=n(87);e.exports=r},function(e,t,n){var r=n(191),o=64,i=r(o);i.placeholder={},e.exports=i},function(e,t,n){"use strict";var r=n(114);e.exports=function(e){return r(e,function(e,t){var n=t.split(":");return e[0].push(n[0]),e[1].push(n[1]),e},[[],[]])}},function(e,t,n){"use strict";function r(e){return function(t,n){var r=e.hierarchicalFacets[n],i=e.hierarchicalFacetsRefinements[r.name]&&e.hierarchicalFacetsRefinements[r.name][0]||"",a=e._getHierarchicalFacetSeparator(r),s=e._getHierarchicalRootPath(r),u=e._getHierarchicalShowParentLevel(r),c=h(e._getHierarchicalFacetSortBy(r)),f=o(c,a,s,u,i),p=t;return s&&(p=t.slice(s.split(a).length)),l(p,f,{name:e.hierarchicalFacets[n].name,count:null,isRefined:!0,path:null,data:null})}}function o(e,t,n,r,o){return function(s,l,f){var h=s;if(f>0){var m=0;for(h=s;f>m;)h=h&&p(h.data,{isRefined:!0}),m++}if(h){var v=i(h.path||n,o,t,n,r);h.data=c(u(d(l.data,v),a(t,o)),e[0],e[1])}return s}}function i(e,t,n,r,o){return function(i,a){return!r||0===a.indexOf(r)&&r!==a?!r&&-1===a.indexOf(n)||r&&a.split(n).length-r.split(n).length===1||-1===a.indexOf(n)&&-1===t.indexOf(n)||0===t.indexOf(a)||0===a.indexOf(e+n)&&(o||0===a.indexOf(t)):!1}}function a(e,t){return function(n,r){return{name:f(s(r.split(e))),path:r,count:n,isRefined:t===r||0===t.indexOf(r+e),data:null}}}e.exports=r;var s=n(74),u=n(55),l=n(114),c=n(185),f=n(195),p=n(131),d=n(201),h=n(193)},function(e,t,n){function r(e,t,n){var r=e;return(e=o(e))?(n?s(r,t,n):null==t)?e.slice(u(e),l(e)+1):(t+="",e.slice(i(e,t),a(e,t)+1)):e}var o=n(76),i=n(196),a=n(197),s=n(54),u=n(198),l=n(200);e.exports=r},function(e,t){function n(e,t){for(var n=-1,r=e.length;++n<r&&t.indexOf(e.charAt(n))>-1;);return n}e.exports=n},function(e,t){function n(e,t){for(var n=e.length;n--&&t.indexOf(e.charAt(n))>-1;);return n}e.exports=n},function(e,t,n){function r(e){for(var t=-1,n=e.length;++t<n&&o(e.charCodeAt(t)););return t}var o=n(199);e.exports=r},function(e,t){function n(e){return 160>=e&&e>=9&&13>=e||32==e||160==e||5760==e||6158==e||e>=8192&&(8202>=e||8232==e||8233==e||8239==e||8287==e||12288==e||65279==e)}e.exports=n},function(e,t,n){function r(e){for(var t=e.length;t--&&o(e.charCodeAt(t)););return t}var o=n(199);e.exports=r},function(e,t,n){var r=n(120),o=n(39),i=n(122),a=n(123),s=n(87),u=s(function(e,t){return null==e?{}:"function"==typeof t[0]?a(e,o(t[0],t[1],3)):i(e,r(t))});e.exports=u},function(e,t,n){"use strict";var r=n(15),o=n(55),i=n(114),a=n(80),s=n(34),u={_getQueries:function(e,t){var n=[];return n.push({indexName:e,params:this._getHitsSearchParams(t)}),r(t.getRefinedDisjunctiveFacets(),function(r){n.push({indexName:e,params:this._getDisjunctiveFacetSearchParams(t,r)})},this),r(t.getRefinedHierarchicalFacets(),function(r){var o=t.getHierarchicalFacetByName(r),i=t.getHierarchicalRefinement(r);i.length>0&&i[0].split(t._getHierarchicalFacetSeparator(o)).length>1&&n.push({indexName:e,params:this._getDisjunctiveFacetSearchParams(t,r,!0)})},this),n},_getHitsSearchParams:function(e){var t=e.facets.concat(e.disjunctiveFacets).concat(this._getHitsHierarchicalFacetsAttributes(e)),n=this._getFacetFilters(e),r=this._getNumericFilters(e),o=this._getTagFilters(e),i={facets:t,tagFilters:o};return n.length>0&&(i.facetFilters=n),r.length>0&&(i.numericFilters=r),a(e.getQueryParams(),i)},_getDisjunctiveFacetSearchParams:function(e,t,n){var r=this._getFacetFilters(e,t,n),o=this._getNumericFilters(e,t),i=this._getTagFilters(e),s={hitsPerPage:1,page:0,attributesToRetrieve:[],attributesToHighlight:[],attributesToSnippet:[],tagFilters:i},u=e.getHierarchicalFacetByName(t);return u?s.facets=this._getDisjunctiveHierarchicalFacetAttribute(e,u,n):s.facets=t,o.length>0&&(s.numericFilters=o),r.length>0&&(s.facetFilters=r),a(e.getQueryParams(),s)},_getNumericFilters:function(e,t){if(e.numericFilters)return e.numericFilters;var n=[];return r(e.numericRefinements,function(e,i){r(e,function(e,a){t!==i&&r(e,function(e){if(s(e)){var t=o(e,function(e){return i+a+e});n.push(t)}else n.push(i+a+e)})})}),n},_getTagFilters:function(e){return e.tagFilters?e.tagFilters:e.tagRefinements.join(",")},_getFacetFilters:function(e,t,n){var o=[];return r(e.facetsRefinements,function(e,t){r(e,function(e){o.push(t+":"+e)})}),r(e.facetsExcludes,function(e,t){r(e,function(e){o.push(t+":-"+e)})}),r(e.disjunctiveFacetsRefinements,function(e,n){if(n!==t&&e&&0!==e.length){var i=[];r(e,function(e){i.push(n+":"+e)}),o.push(i)}}),r(e.hierarchicalFacetsRefinements,function(r,i){var a=r[0];if(void 0!==a){var s,u,l=e.getHierarchicalFacetByName(i),c=e._getHierarchicalFacetSeparator(l),f=e._getHierarchicalRootPath(l);if(t===i){if(-1===a.indexOf(c)||!f&&n===!0||f&&f.split(c).length===a.split(c).length)return;f?(u=f.split(c).length-1,a=f):(u=a.split(c).length-2,a=a.slice(0,a.lastIndexOf(c))),s=l.attributes[u]}else u=a.split(c).length-1,s=l.attributes[u];s&&o.push([s+":"+a])}}),o},_getHitsHierarchicalFacetsAttributes:function(e){var t=[];return i(e.hierarchicalFacets,function(t,n){var r=e.getHierarchicalRefinement(n.name)[0];if(!r)return t.push(n.attributes[0]),t;var o=r.split(e._getHierarchicalFacetSeparator(n)).length,i=n.attributes.slice(0,o+1);return t.concat(i)},t)},_getDisjunctiveHierarchicalFacetAttribute:function(e,t,n){var r=e._getHierarchicalFacetSeparator(t);if(n===!0){var o=e._getHierarchicalRootPath(t),i=0;return o&&(i=o.split(r).length),[t.attributes[i]]}var a=e.getHierarchicalRefinement(t.name)[0]||"",s=a.split(r).length-1;return t.attributes.slice(0,s+1)}};e.exports=u},function(e,t,n){(function(e,r){function o(e,n){var r={seen:[],stylize:a};return arguments.length>=3&&(r.depth=arguments[2]),arguments.length>=4&&(r.colors=arguments[3]),m(n)?r.showHidden=n:n&&t._extend(r,n),C(r.showHidden)&&(r.showHidden=!1),C(r.depth)&&(r.depth=2),C(r.colors)&&(r.colors=!1),C(r.customInspect)&&(r.customInspect=!0),r.colors&&(r.stylize=i),u(r,e,r.depth)}function i(e,t){var n=o.styles[t];return n?"["+o.colors[n][0]+"m"+e+"["+o.colors[n][1]+"m":e}function a(e,t){return e}function s(e){var t={};return e.forEach(function(e,n){t[e]=!0}),t}function u(e,n,r){if(e.customInspect&&n&&R(n.inspect)&&n.inspect!==t.inspect&&(!n.constructor||n.constructor.prototype!==n)){var o=n.inspect(r,e);return b(o)||(o=u(e,o,r)),o}var i=l(e,n);if(i)return i;var a=Object.keys(n),m=s(a);if(e.showHidden&&(a=Object.getOwnPropertyNames(n)),E(n)&&(a.indexOf("message")>=0||a.indexOf("description")>=0))return c(n);if(0===a.length){if(R(n)){var v=n.name?": "+n.name:"";return e.stylize("[Function"+v+"]","special")}if(w(n))return e.stylize(RegExp.prototype.toString.call(n),"regexp");if(P(n))return e.stylize(Date.prototype.toString.call(n),"date");if(E(n))return c(n)}var g="",y=!1,_=["{","}"];if(h(n)&&(y=!0,_=["[","]"]),R(n)){var C=n.name?": "+n.name:"";g=" [Function"+C+"]"}if(w(n)&&(g=" "+RegExp.prototype.toString.call(n)),P(n)&&(g=" "+Date.prototype.toUTCString.call(n)),E(n)&&(g=" "+c(n)),0===a.length&&(!y||0==n.length))return _[0]+g+_[1];if(0>r)return w(n)?e.stylize(RegExp.prototype.toString.call(n),"regexp"):e.stylize("[Object]","special");e.seen.push(n);var x;return x=y?f(e,n,r,m,a):a.map(function(t){return p(e,n,r,m,t,y)}),e.seen.pop(),d(x,g,_)}function l(e,t){if(C(t))return e.stylize("undefined","undefined");if(b(t)){var n="'"+JSON.stringify(t).replace(/^"|"$/g,"").replace(/'/g,"\\'").replace(/\\"/g,'"')+"'";return e.stylize(n,"string")}return y(t)?e.stylize(""+t,"number"):m(t)?e.stylize(""+t,"boolean"):v(t)?e.stylize("null","null"):void 0}function c(e){return"["+Error.prototype.toString.call(e)+"]"}function f(e,t,n,r,o){for(var i=[],a=0,s=t.length;s>a;++a)N(t,String(a))?i.push(p(e,t,n,r,String(a),!0)):i.push("");return o.forEach(function(o){o.match(/^\d+$/)||i.push(p(e,t,n,r,o,!0))}),i}function p(e,t,n,r,o,i){var a,s,l;if(l=Object.getOwnPropertyDescriptor(t,o)||{value:t[o]},l.get?s=l.set?e.stylize("[Getter/Setter]","special"):e.stylize("[Getter]","special"):l.set&&(s=e.stylize("[Setter]","special")),N(r,o)||(a="["+o+"]"),s||(e.seen.indexOf(l.value)<0?(s=v(n)?u(e,l.value,null):u(e,l.value,n-1),s.indexOf("\n")>-1&&(s=i?s.split("\n").map(function(e){return"  "+e}).join("\n").substr(2):"\n"+s.split("\n").map(function(e){return"   "+e}).join("\n"))):s=e.stylize("[Circular]","special")),C(a)){if(i&&o.match(/^\d+$/))return s;a=JSON.stringify(""+o),a.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)?(a=a.substr(1,a.length-2),a=e.stylize(a,"name")):(a=a.replace(/'/g,"\\'").replace(/\\"/g,'"').replace(/(^"|"$)/g,"'"),a=e.stylize(a,"string"))}return a+": "+s}function d(e,t,n){var r=0,o=e.reduce(function(e,t){return r++,t.indexOf("\n")>=0&&r++,e+t.replace(/\u001b\[\d\d?m/g,"").length+1},0);return o>60?n[0]+(""===t?"":t+"\n ")+" "+e.join(",\n  ")+" "+n[1]:n[0]+t+" "+e.join(", ")+" "+n[1]}function h(e){return Array.isArray(e)}function m(e){return"boolean"==typeof e}function v(e){return null===e}function g(e){return null==e}function y(e){return"number"==typeof e}function b(e){return"string"==typeof e}function _(e){return"symbol"==typeof e}function C(e){return void 0===e}function w(e){return x(e)&&"[object RegExp]"===O(e)}function x(e){return"object"==typeof e&&null!==e}function P(e){return x(e)&&"[object Date]"===O(e)}function E(e){return x(e)&&("[object Error]"===O(e)||e instanceof Error)}function R(e){return"function"==typeof e}function S(e){return null===e||"boolean"==typeof e||"number"==typeof e||"string"==typeof e||"symbol"==typeof e||"undefined"==typeof e}function O(e){return Object.prototype.toString.call(e)}function T(e){return 10>e?"0"+e.toString(10):e.toString(10)}function k(){var e=new Date,t=[T(e.getHours()),T(e.getMinutes()),T(e.getSeconds())].join(":");return[e.getDate(),F[e.getMonth()],t].join(" ")}function N(e,t){return Object.prototype.hasOwnProperty.call(e,t)}var j=/%[sdj%]/g;t.format=function(e){if(!b(e)){for(var t=[],n=0;n<arguments.length;n++)t.push(o(arguments[n]));return t.join(" ")}for(var n=1,r=arguments,i=r.length,a=String(e).replace(j,function(e){if("%%"===e)return"%";if(n>=i)return e;switch(e){case"%s":return String(r[n++]);case"%d":return Number(r[n++]);case"%j":try{return JSON.stringify(r[n++])}catch(t){return"[Circular]"}default:return e}}),s=r[n];i>n;s=r[++n])a+=v(s)||!x(s)?" "+s:" "+o(s);return a},t.deprecate=function(n,o){function i(){if(!a){if(r.throwDeprecation)throw new Error(o);r.traceDeprecation?console.trace(o):console.error(o),a=!0}return n.apply(this,arguments)}if(C(e.process))return function(){return t.deprecate(n,o).apply(this,arguments)};if(r.noDeprecation===!0)return n;var a=!1;return i};var A,M={};t.debuglog=function(e){if(C(A)&&(A={NODE_ENV:"production"}.NODE_DEBUG||""),e=e.toUpperCase(),!M[e])if(new RegExp("\\b"+e+"\\b","i").test(A)){var n=r.pid;M[e]=function(){var r=t.format.apply(t,arguments);console.error("%s %d: %s",e,n,r)}}else M[e]=function(){};return M[e]},t.inspect=o,o.colors={bold:[1,22],italic:[3,23],underline:[4,24],inverse:[7,27],white:[37,39],grey:[90,39],black:[30,39],blue:[34,39],cyan:[36,39],green:[32,39],magenta:[35,39],red:[31,39],yellow:[33,39]},o.styles={special:"cyan",number:"yellow","boolean":"yellow",undefined:"grey","null":"bold",string:"green",date:"magenta",regexp:"red"},t.isArray=h,t.isBoolean=m,t.isNull=v,t.isNullOrUndefined=g,t.isNumber=y,t.isString=b,t.isSymbol=_,t.isUndefined=C,t.isRegExp=w,t.isObject=x,t.isDate=P,t.isError=E,t.isFunction=R,t.isPrimitive=S,t.isBuffer=n(204);var F=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];t.log=function(){console.log("%s - %s",k(),t.format.apply(t,arguments))},t.inherits=n(205),t._extend=function(e,t){if(!t||!x(t))return e;for(var n=Object.keys(t),r=n.length;r--;)e[n[r]]=t[n[r]];return e}}).call(t,function(){return this}(),n(9))},function(e,t){e.exports=function(e){return e&&"object"==typeof e&&"function"==typeof e.copy&&"function"==typeof e.fill&&"function"==typeof e.readUInt8}},function(e,t){"function"==typeof Object.create?e.exports=function(e,t){e.super_=t,e.prototype=Object.create(t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}})}:e.exports=function(e,t){e.super_=t;var n=function(){};n.prototype=t.prototype,e.prototype=new n,e.prototype.constructor=e}},function(e,t,n){"use strict";function r(e){return m(e)?d(e,r):v(e)?f(e,r):h(e)?y(e):e}function o(e,t,n,r){if(null!==e&&(n=n.replace(e,""),r=r.replace(e,"")),n=t[n]||n,r=t[r]||r,-1!==_.indexOf(n)||-1!==_.indexOf(r)){if("q"===n)return-1;if("q"===r)return 1;var o=-1!==b.indexOf(n),i=-1!==b.indexOf(r);if(o&&!i)return 1;if(i&&!o)return-1}return n.localeCompare(r)}var i=n(207),a=n(101),s=n(209),u=n(143),l=n(15),c=n(201),f=n(55),p=n(213),d=n(215),h=n(128),m=n(83),v=n(34),g=n(208),y=n(211).encode,b=["dFR","fR","nR","hFR","tR"],_=i.ENCODED_PARAMETERS;t.getStateFromQueryString=function(e,t){var n=t&&t.prefix||"",r=t&&t.mapping||{},o=g(r),u=s.parse(e),l=new RegExp("^"+n),f=p(u,function(e,t){var r=n&&l.test(t),a=r?t.replace(l,""):t,s=i.decode(o[a]||a);return s||a}),d=a._parseNumbers(f);return c(d,a.PARAMETERS)},t.getUnrecognizedParametersInQueryString=function(e,t){var n=t&&t.prefix,r=t&&t.mapping||{},o=g(r),a={},u=s.parse(e);if(n){var c=new RegExp("^"+n);l(u,function(e,t){c.test(t)||(a[t]=e)})}else l(u,function(e,t){i.decode(o[t]||t)||(a[t]=e)});return a},t.getQueryStringFromState=function(e,t){var n=t&&t.moreAttributes,a=t&&t.prefix||"",l=t&&t.mapping||{},c=g(l),f=r(e),d=p(f,function(e,t){var n=i.encode(t);return a+(l[n]||n)}),h=""===a?null:new RegExp("^"+a),m=u(o,null,h,c);if(n){var v=s.stringify(d,{encode:!1,sort:m}),y=s.stringify(n,{encode:!1});return v?v+"&"+y:y}return s.stringify(d,{encode:!1,sort:m})}},function(e,t,n){"use strict";var r=n(208),o=n(23),i={advancedSyntax:"aS",allowTyposOnNumericTokens:"aTONT",analyticsTags:"aT",analytics:"a",aroundLatLngViaIP:"aLLVIP",aroundLatLng:"aLL",aroundPrecision:"aP",aroundRadius:"aR",attributesToHighlight:"aTH",attributesToRetrieve:"aTR",attributesToSnippet:"aTS",disjunctiveFacetsRefinements:"dFR",disjunctiveFacets:"dF",distinct:"d",facetsExcludes:"fE",facetsRefinements:"fR",facets:"f",getRankingInfo:"gRI",hierarchicalFacetsRefinements:"hFR",hierarchicalFacets:"hF",highlightPostTag:"hPoT",highlightPreTag:"hPrT",hitsPerPage:"hPP",ignorePlurals:"iP",index:"idx",insideBoundingBox:"iBB",insidePolygon:"iPg",length:"l",maxValuesPerFacet:"mVPF",minimumAroundRadius:"mAR",minProximity:"mP",minWordSizefor1Typo:"mWS1T",minWordSizefor2Typos:"mWS2T",numericFilters:"nF",numericRefinements:"nR",offset:"o",optionalWords:"oW",page:"p",queryType:"qT",query:"q",removeWordsIfNoResults:"rWINR",replaceSynonymsInHighlight:"rSIH",restrictSearchableAttributes:"rSA",synonyms:"s",tagFilters:"tF",tagRefinements:"tR",typoTolerance:"tT",optionalTagFilters:"oTF",optionalFacetFilters:"oFF",snippetEllipsisText:"sET",disableExactOnAttributes:"dEOA",enableExactOnSingleWordQuery:"eEOSWQ"},a=r(i);e.exports={ENCODED_PARAMETERS:o(a),decode:function(e){return a[e]},encode:function(e){return i[e]}}},function(e,t,n){function r(e,t,n){n&&o(e,t,n)&&(t=void 0);for(var r=-1,a=i(e),u=a.length,l={};++r<u;){var c=a[r],f=e[c];t?s.call(l,f)?l[f].push(c):l[f]=[c]:l[f]=c}return l}var o=n(54),i=n(23),a=Object.prototype,s=a.hasOwnProperty;e.exports=r},function(e,t,n){var r=n(210),o=n(212);e.exports={stringify:r,parse:o}},function(e,t,n){var r=n(211),o={delimiter:"&",arrayPrefixGenerators:{brackets:function(e,t){return e+"[]"},indices:function(e,t){return e+"["+t+"]"},repeat:function(e,t){return e}},strictNullHandling:!1,skipNulls:!1,encode:!0};o.stringify=function(e,t,n,i,a,s,u,l){if("function"==typeof u)e=u(t,e);else if(r.isBuffer(e))e=e.toString();else if(e instanceof Date)e=e.toISOString();else if(null===e){if(i)return s?r.encode(t):t;e=""}if("string"==typeof e||"number"==typeof e||"boolean"==typeof e)return s?[r.encode(t)+"="+r.encode(e)]:[t+"="+e];var c=[];if("undefined"==typeof e)return c;var f;if(Array.isArray(u))f=u;else{var p=Object.keys(e);f=l?p.sort(l):p}for(var d=0,h=f.length;h>d;++d){var m=f[d];a&&null===e[m]||(c=Array.isArray(e)?c.concat(o.stringify(e[m],n(t,m),n,i,a,s,u)):c.concat(o.stringify(e[m],t+"["+m+"]",n,i,a,s,u)))}return c},e.exports=function(e,t){t=t||{};var n,r,i="undefined"==typeof t.delimiter?o.delimiter:t.delimiter,a="boolean"==typeof t.strictNullHandling?t.strictNullHandling:o.strictNullHandling,s="boolean"==typeof t.skipNulls?t.skipNulls:o.skipNulls,u="boolean"==typeof t.encode?t.encode:o.encode,l="function"==typeof t.sort?t.sort:null;"function"==typeof t.filter?(r=t.filter,e=r("",e)):Array.isArray(t.filter)&&(n=r=t.filter);var c=[];if("object"!=typeof e||null===e)return"";var f;f=t.arrayFormat in o.arrayPrefixGenerators?t.arrayFormat:"indices"in t?t.indices?"indices":"repeat":"indices";var p=o.arrayPrefixGenerators[f];n||(n=Object.keys(e)),l&&n.sort(l);for(var d=0,h=n.length;h>d;++d){var m=n[d];s&&null===e[m]||(c=c.concat(o.stringify(e[m],m,p,a,s,u,r,l)))}return c.join(i)}},function(e,t){var n={};n.hexTable=new Array(256);for(var r=0;256>r;++r)n.hexTable[r]="%"+((16>r?"0":"")+r.toString(16)).toUpperCase();t.arrayToObject=function(e,t){for(var n=t.plainObjects?Object.create(null):{},r=0,o=e.length;o>r;++r)"undefined"!=typeof e[r]&&(n[r]=e[r]);return n},t.merge=function(e,n,r){if(!n)return e;if("object"!=typeof n)return Array.isArray(e)?e.push(n):"object"==typeof e?e[n]=!0:e=[e,n],e;if("object"!=typeof e)return e=[e].concat(n);Array.isArray(e)&&!Array.isArray(n)&&(e=t.arrayToObject(e,r));for(var o=Object.keys(n),i=0,a=o.length;a>i;++i){var s=o[i],u=n[s];Object.prototype.hasOwnProperty.call(e,s)?e[s]=t.merge(e[s],u,r):e[s]=u}return e},t.decode=function(e){try{return decodeURIComponent(e.replace(/\+/g," "))}catch(t){return e}},t.encode=function(e){if(0===e.length)return e;"string"!=typeof e&&(e=""+e);for(var t="",r=0,o=e.length;o>r;++r){var i=e.charCodeAt(r);45===i||46===i||95===i||126===i||i>=48&&57>=i||i>=65&&90>=i||i>=97&&122>=i?t+=e[r]:128>i?t+=n.hexTable[i]:2048>i?t+=n.hexTable[192|i>>6]+n.hexTable[128|63&i]:55296>i||i>=57344?t+=n.hexTable[224|i>>12]+n.hexTable[128|i>>6&63]+n.hexTable[128|63&i]:(++r,i=65536+((1023&i)<<10|1023&e.charCodeAt(r)),t+=n.hexTable[240|i>>18]+n.hexTable[128|i>>12&63]+n.hexTable[128|i>>6&63]+n.hexTable[128|63&i])}return t},t.compact=function(e,n){if("object"!=typeof e||null===e)return e;n=n||[];var r=n.indexOf(e);if(-1!==r)return n[r];if(n.push(e),Array.isArray(e)){for(var o=[],i=0,a=e.length;a>i;++i)"undefined"!=typeof e[i]&&o.push(e[i]);return o}var s=Object.keys(e);for(i=0,a=s.length;a>i;++i){var u=s[i];e[u]=t.compact(e[u],n)}return e},t.isRegExp=function(e){return"[object RegExp]"===Object.prototype.toString.call(e)},t.isBuffer=function(e){return null===e||"undefined"==typeof e?!1:!!(e.constructor&&e.constructor.isBuffer&&e.constructor.isBuffer(e))}},function(e,t,n){var r=n(211),o={delimiter:"&",depth:5,arrayLimit:20,parameterLimit:1e3,strictNullHandling:!1,plainObjects:!1,allowPrototypes:!1,allowDots:!1};o.parseValues=function(e,t){for(var n={},o=e.split(t.delimiter,t.parameterLimit===1/0?void 0:t.parameterLimit),i=0,a=o.length;a>i;++i){var s=o[i],u=-1===s.indexOf("]=")?s.indexOf("="):s.indexOf("]=")+1;if(-1===u)n[r.decode(s)]="",t.strictNullHandling&&(n[r.decode(s)]=null);else{var l=r.decode(s.slice(0,u)),c=r.decode(s.slice(u+1));Object.prototype.hasOwnProperty.call(n,l)?n[l]=[].concat(n[l]).concat(c):n[l]=c}}return n},o.parseObject=function(e,t,n){if(!e.length)return t;var r,i=e.shift();if("[]"===i)r=[],r=r.concat(o.parseObject(e,t,n));else{r=n.plainObjects?Object.create(null):{};var a="["===i[0]&&"]"===i[i.length-1]?i.slice(1,i.length-1):i,s=parseInt(a,10),u=""+s;!isNaN(s)&&i!==a&&u===a&&s>=0&&n.parseArrays&&s<=n.arrayLimit?(r=[],r[s]=o.parseObject(e,t,n)):r[a]=o.parseObject(e,t,n)}return r},o.parseKeys=function(e,t,n){if(e){n.allowDots&&(e=e.replace(/\.([^\.\[]+)/g,"[$1]"));var r=/^([^\[\]]*)/,i=/(\[[^\[\]]*\])/g,a=r.exec(e),s=[];if(a[1]){if(!n.plainObjects&&Object.prototype.hasOwnProperty(a[1])&&!n.allowPrototypes)return;s.push(a[1])}for(var u=0;null!==(a=i.exec(e))&&u<n.depth;)++u,
(n.plainObjects||!Object.prototype.hasOwnProperty(a[1].replace(/\[|\]/g,""))||n.allowPrototypes)&&s.push(a[1]);return a&&s.push("["+e.slice(a.index)+"]"),o.parseObject(s,t,n)}},e.exports=function(e,t){if(t=t||{},t.delimiter="string"==typeof t.delimiter||r.isRegExp(t.delimiter)?t.delimiter:o.delimiter,t.depth="number"==typeof t.depth?t.depth:o.depth,t.arrayLimit="number"==typeof t.arrayLimit?t.arrayLimit:o.arrayLimit,t.parseArrays=t.parseArrays!==!1,t.allowDots="boolean"==typeof t.allowDots?t.allowDots:o.allowDots,t.plainObjects="boolean"==typeof t.plainObjects?t.plainObjects:o.plainObjects,t.allowPrototypes="boolean"==typeof t.allowPrototypes?t.allowPrototypes:o.allowPrototypes,t.parameterLimit="number"==typeof t.parameterLimit?t.parameterLimit:o.parameterLimit,t.strictNullHandling="boolean"==typeof t.strictNullHandling?t.strictNullHandling:o.strictNullHandling,""===e||null===e||"undefined"==typeof e)return t.plainObjects?Object.create(null):{};for(var n="string"==typeof e?o.parseValues(e,t):e,i=t.plainObjects?Object.create(null):{},a=Object.keys(n),s=0,u=a.length;u>s;++s){var l=a[s],c=o.parseKeys(l,n[l],t);i=r.merge(i,c,t)}return r.compact(i)}},function(e,t,n){var r=n(214),o=r(!0);e.exports=o},function(e,t,n){function r(e){return function(t,n,r){var a={};return n=o(n,r,3),i(t,function(t,r,o){var i=n(t,r,o);r=e?i:r,t=e?t:i,a[r]=t}),a}}var o=n(57),i=n(18);e.exports=r},function(e,t,n){var r=n(214),o=r();e.exports=o},function(e,t){"use strict";e.exports="2.9.1"},function(e,t,n){var r=n(120),o=n(218),i=n(87),a=i(function(e){return o(r(e,!1,!0))});e.exports=a},function(e,t,n){function r(e,t){var n=-1,r=o,u=e.length,l=!0,c=l&&u>=s,f=c?a():null,p=[];f?(r=i,l=!1):(c=!1,f=t?[]:p);e:for(;++n<u;){var d=e[n],h=t?t(d,n,e):d;if(l&&d===d){for(var m=f.length;m--;)if(f[m]===h)continue e;t&&f.push(h),p.push(d)}else r(f,h,0)<0&&((t||c)&&f.push(h),p.push(d))}return p}var o=n(103),i=n(105),a=n(106),s=200;e.exports=r},function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{"default":e}}function o(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function i(e){var t=e;return function(){var e=Date.now(),n=e-t;return t=e,n}}function a(e){return s()+window.location.pathname+e}function s(){return window.location.protocol+"//"+window.location.hostname+(window.location.port?":"+window.location.port:"")}function u(){var e=arguments.length<=0||void 0===arguments[0]?{}:arguments[0],t=e.useHash||!1,n=t?x:P;return new E(n,e)}Object.defineProperty(t,"__esModule",{value:!0});var l=function(){function e(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(t,n,r){return n&&e(t.prototype,n),r&&e(t,r),t}}(),c=n(99),f=r(c),p=n(220),d=r(p),h=n(206),m=r(h),v=n(129),g=r(v),y=n(80),b=r(y),_=f["default"].AlgoliaSearchHelper,C=d["default"].split(".")[0],w=!0,x={character:"#",onpopstate:function(e){window.addEventListener("hashchange",e)},pushState:function(e){window.location.assign(a(this.createURL(e)))},replaceState:function(e){window.location.replace(a(this.createURL(e)))},createURL:function(e){return window.location.search+this.character+e},readUrl:function(){return window.location.hash.slice(1)}},P={character:"?",onpopstate:function(e){window.addEventListener("popstate",e)},pushState:function(e,t){var n=t.getHistoryState;window.history.pushState(n(),"",a(this.createURL(e)))},replaceState:function(e,t){var n=t.getHistoryState;window.history.replaceState(n(),"",a(this.createURL(e)))},createURL:function(e){return this.character+e+document.location.hash},readUrl:function(){return window.location.search.slice(1)}},E=function(){function e(t,n){o(this,e),this.urlUtils=t,this.originalConfig=null,this.timer=i(Date.now()),this.mapping=n.mapping||{},this.getHistoryState=n.getHistoryState||function(){return null},this.threshold=n.threshold||700,this.trackedParameters=n.trackedParameters||["query","attribute:*","index","page","hitsPerPage"]}return l(e,[{key:"getConfiguration",value:function(e){this.originalConfig=(0,f["default"])({},e.index,e).state;var t=this.urlUtils.readUrl(),n=_.getConfigurationFromQueryString(t,{mapping:this.mapping});return n}},{key:"render",value:function(e){var t=this,n=e.helper;w&&(w=!1,this.onHistoryChange(this.onPopState.bind(this,n)),n.on("change",function(e){return t.renderURLFromState(e)}))}},{key:"onPopState",value:function(e,t){var n=e.getState(this.trackedParameters),r=(0,b["default"])({},this.originalConfig,n);(0,g["default"])(r,t)||e.overrideStateWithoutTriggeringChangeEvent(t).search()}},{key:"renderURLFromState",value:function(e){var t=this.urlUtils.readUrl(),n=_.getForeignConfigurationInQueryString(t,{mapping:this.mapping});n.is_v=C;var r=m["default"].getQueryStringFromState(e.filter(this.trackedParameters),{moreAttributes:n,mapping:this.mapping});this.timer()<this.threshold?this.urlUtils.replaceState(r,{getHistoryState:this.getHistoryState}):this.urlUtils.pushState(r,{getHistoryState:this.getHistoryState})}},{key:"createURL",value:function(e,t){var n=t.absolute,r=this.urlUtils.readUrl(),o=e.filter(this.trackedParameters),i=f["default"].url.getUnrecognizedParametersInQueryString(r,{mapping:this.mapping});i.is_v=C;var s=this.urlUtils.createURL(f["default"].url.getQueryStringFromState(o,{mapping:this.mapping}));return n?a(s):s}},{key:"onHistoryChange",value:function(e){var t=this;this.urlUtils.onpopstate(function(){var n=t.urlUtils.readUrl(),r=_.getConfigurationFromQueryString(n,{mapping:t.mapping}),o=(0,b["default"])({},t.originalConfig,r);e(o)})}}]),e}();t["default"]=u},function(e,t){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t["default"]="1.5.0"},function(e,t){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t["default"]=function(e){var t=e.numberLocale;return{formatNumber:function(e,n){return Number(n(e)).toLocaleString(t)}}}},function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{"default":e}}function o(){var e=arguments.length<=0||void 0===arguments[0]?{}:arguments[0],t=e.container,n=e.templates,r=void 0===n?g["default"]:n,o=e.cssClasses,a=void 0===o?{}:o,s=e.collapsible,c=void 0===s?!1:s,p=e.autoHideContainer,h=void 0===p?!0:p;if(!t)throw new Error(C);var v=(0,l.getContainerNode)(t),y=(0,m["default"])(b["default"]);h===!0&&(y=(0,d["default"])(y));var w={root:(0,f["default"])(_(null),a.root),header:(0,f["default"])(_("header"),a.header),body:(0,f["default"])(_("body"),a.body),footer:(0,f["default"])(_("footer"),a.footer),link:(0,f["default"])(_("link"),a.link)};return{init:function(e){var t=e.helper,n=e.templatesConfig;this._clearRefinementsAndSearch=l.clearRefinementsAndSearch.bind(null,t),this._templateProps=(0,l.prepareTemplateProps)({defaultTemplates:g["default"],templatesConfig:n,templates:r})},render:function(e){var t=e.results,n=e.state,r=e.createURL,o=0!==(0,l.getRefinements)(t,n).length,a=r((0,l.clearRefinementsFromState)(n));u["default"].render(i(y,{clearAll:this._clearRefinementsAndSearch,collapsible:c,cssClasses:w,hasRefinements:o,shouldAutoHideContainer:!o,templateProps:this._templateProps,url:a}),v)}}}Object.defineProperty(t,"__esModule",{value:!0});var i=function(){var e="function"==typeof Symbol&&Symbol["for"]&&Symbol["for"]("react.element")||60103;return function(t,n,r,o){var i=t&&t.defaultProps,a=arguments.length-3;if(n||0===a||(n={}),n&&i)for(var s in i)void 0===n[s]&&(n[s]=i[s]);else n||(n=i||{});if(1===a)n.children=o;else if(a>1){for(var u=Array(a),l=0;a>l;l++)u[l]=arguments[l+3];n.children=u}return{$$typeof:e,type:t,key:void 0===r?null:""+r,ref:null,props:n,_owner:null}}}(),a=n(223),s=(r(a),n(254)),u=r(s),l=n(385),c=n(389),f=r(c),p=n(390),d=r(p),h=n(391),m=r(h),v=n(398),g=r(v),y=n(399),b=r(y),_=(0,l.bemHelper)("ais-clear-all"),C="Usage:\nclearAll({\n  container,\n  [ cssClasses.{root,header,body,footer,link}={} ],\n  [ templates.{header,link,footer}={header: '', link: 'Clear all', footer: ''} ],\n  [ autoHideContainer=true ],\n  [ collapsible=false ]\n})";t["default"]=o},function(e,t,n){(function(t){e.exports=t.React=n(224)}).call(t,function(){return this}())},function(e,t,n){"use strict";e.exports=n(225)},function(e,t,n){"use strict";var r=n(226),o=n(227),i=n(237),a=n(243),s=n(248),u=n(230),l=(n(249),n(251)),c=n(252),f=n(253),p=(n(232),u.createElement),d=u.createFactory,h=u.cloneElement,m=r,v={Children:{map:o.map,forEach:o.forEach,count:o.count,toArray:o.toArray,only:f},Component:i,createElement:p,cloneElement:h,isValidElement:u.isValidElement,PropTypes:l,createClass:a.createClass,createFactory:d,createMixin:function(e){return e},DOM:s,version:c,__spread:m};e.exports=v},function(e,t){"use strict";function n(e){if(null===e||void 0===e)throw new TypeError("Object.assign cannot be called with null or undefined");return Object(e)}var r=Object.prototype.hasOwnProperty,o=Object.prototype.propertyIsEnumerable;e.exports=Object.assign||function(e,t){for(var i,a,s=n(e),u=1;u<arguments.length;u++){i=Object(arguments[u]);for(var l in i)r.call(i,l)&&(s[l]=i[l]);if(Object.getOwnPropertySymbols){a=Object.getOwnPropertySymbols(i);for(var c=0;c<a.length;c++)o.call(i,a[c])&&(s[a[c]]=i[a[c]])}}return s}},function(e,t,n){"use strict";function r(e){return(""+e).replace(_,"$&/")}function o(e,t){this.func=e,this.context=t,this.count=0}function i(e,t,n){var r=e.func,o=e.context;r.call(o,t,e.count++)}function a(e,t,n){if(null==e)return e;var r=o.getPooled(t,n);g(e,i,r),o.release(r)}function s(e,t,n,r){this.result=e,this.keyPrefix=t,this.func=n,this.context=r,this.count=0}function u(e,t,n){var o=e.result,i=e.keyPrefix,a=e.func,s=e.context,u=a.call(s,t,e.count++);Array.isArray(u)?l(u,o,n,v.thatReturnsArgument):null!=u&&(m.isValidElement(u)&&(u=m.cloneAndReplaceKey(u,i+(!u.key||t&&t.key===u.key?"":r(u.key)+"/")+n)),o.push(u))}function l(e,t,n,o,i){var a="";null!=n&&(a=r(n)+"/");var l=s.getPooled(t,a,o,i);g(e,u,l),s.release(l)}function c(e,t,n){if(null==e)return e;var r=[];return l(e,r,null,t,n),r}function f(e,t,n){return null}function p(e,t){return g(e,f,null)}function d(e){var t=[];return l(e,t,null,v.thatReturnsArgument),t}var h=n(228),m=n(230),v=n(233),g=n(235),y=h.twoArgumentPooler,b=h.fourArgumentPooler,_=/\/+/g;o.prototype.destructor=function(){this.func=null,this.context=null,this.count=0},h.addPoolingTo(o,y),s.prototype.destructor=function(){this.result=null,this.keyPrefix=null,this.func=null,this.context=null,this.count=0},h.addPoolingTo(s,b);var C={forEach:a,map:c,mapIntoWithKeyPrefixInternal:l,count:p,toArray:d};e.exports=C},function(e,t,n){"use strict";var r=n(229),o=function(e){var t=this;if(t.instancePool.length){var n=t.instancePool.pop();return t.call(n,e),n}return new t(e)},i=function(e,t){var n=this;if(n.instancePool.length){var r=n.instancePool.pop();return n.call(r,e,t),r}return new n(e,t)},a=function(e,t,n){var r=this;if(r.instancePool.length){var o=r.instancePool.pop();return r.call(o,e,t,n),o}return new r(e,t,n)},s=function(e,t,n,r){var o=this;if(o.instancePool.length){var i=o.instancePool.pop();return o.call(i,e,t,n,r),i}return new o(e,t,n,r)},u=function(e,t,n,r,o){var i=this;if(i.instancePool.length){var a=i.instancePool.pop();return i.call(a,e,t,n,r,o),a}return new i(e,t,n,r,o)},l=function(e){var t=this;e instanceof t?void 0:r(!1),e.destructor(),t.instancePool.length<t.poolSize&&t.instancePool.push(e)},c=10,f=o,p=function(e,t){var n=e;return n.instancePool=[],n.getPooled=t||f,n.poolSize||(n.poolSize=c),n.release=l,n},d={addPoolingTo:p,oneArgumentPooler:o,twoArgumentPooler:i,threeArgumentPooler:a,fourArgumentPooler:s,fiveArgumentPooler:u};e.exports=d},function(e,t,n){"use strict";function r(e,t,n,r,o,i,a,s){if(!e){var u;if(void 0===t)u=new Error("Minified exception occurred; use the non-minified dev environment for the full error message and additional helpful warnings.");else{var l=[n,r,o,i,a,s],c=0;u=new Error(t.replace(/%s/g,function(){return l[c++]})),u.name="Invariant Violation"}throw u.framesToPop=1,u}}e.exports=r},function(e,t,n){"use strict";var r=n(226),o=n(231),i=(n(232),n(234),"function"==typeof Symbol&&Symbol["for"]&&Symbol["for"]("react.element")||60103),a={key:!0,ref:!0,__self:!0,__source:!0},s=function(e,t,n,r,o,a,s){var u={$$typeof:i,type:e,key:t,ref:n,props:s,_owner:a};return u};s.createElement=function(e,t,n){var r,i={},u=null,l=null,c=null,f=null;if(null!=t){l=void 0===t.ref?null:t.ref,u=void 0===t.key?null:""+t.key,c=void 0===t.__self?null:t.__self,f=void 0===t.__source?null:t.__source;for(r in t)t.hasOwnProperty(r)&&!a.hasOwnProperty(r)&&(i[r]=t[r])}var p=arguments.length-2;if(1===p)i.children=n;else if(p>1){for(var d=Array(p),h=0;p>h;h++)d[h]=arguments[h+2];i.children=d}if(e&&e.defaultProps){var m=e.defaultProps;for(r in m)void 0===i[r]&&(i[r]=m[r])}return s(e,u,l,c,f,o.current,i)},s.createFactory=function(e){var t=s.createElement.bind(null,e);return t.type=e,t},s.cloneAndReplaceKey=function(e,t){var n=s(e.type,t,e.ref,e._self,e._source,e._owner,e.props);return n},s.cloneElement=function(e,t,n){var i,u=r({},e.props),l=e.key,c=e.ref,f=e._self,p=e._source,d=e._owner;if(null!=t){void 0!==t.ref&&(c=t.ref,d=o.current),void 0!==t.key&&(l=""+t.key);var h;e.type&&e.type.defaultProps&&(h=e.type.defaultProps);for(i in t)t.hasOwnProperty(i)&&!a.hasOwnProperty(i)&&(void 0===t[i]&&void 0!==h?u[i]=h[i]:u[i]=t[i])}var m=arguments.length-2;if(1===m)u.children=n;else if(m>1){for(var v=Array(m),g=0;m>g;g++)v[g]=arguments[g+2];u.children=v}return s(e.type,l,c,f,p,d,u)},s.isValidElement=function(e){return"object"==typeof e&&null!==e&&e.$$typeof===i},e.exports=s},function(e,t){"use strict";var n={current:null};e.exports=n},function(e,t,n){"use strict";var r=n(233),o=r;e.exports=o},function(e,t){"use strict";function n(e){return function(){return e}}function r(){}r.thatReturns=n,r.thatReturnsFalse=n(!1),r.thatReturnsTrue=n(!0),r.thatReturnsNull=n(null),r.thatReturnsThis=function(){return this},r.thatReturnsArgument=function(e){return e},e.exports=r},function(e,t,n){"use strict";var r=!1;e.exports=r},function(e,t,n){"use strict";function r(e){return h[e]}function o(e,t){return e&&"object"==typeof e&&null!=e.key?a(e.key):t.toString(36)}function i(e){return(""+e).replace(m,r)}function a(e){return"$"+i(e)}function s(e,t,n,r){var i=typeof e;if("undefined"!==i&&"boolean"!==i||(e=null),null===e||"string"===i||"number"===i||l.isValidElement(e))return n(r,e,""===t?p+o(e,0):t),1;var u,h,m=0,v=""===t?p:t+d;if(Array.isArray(e))for(var g=0;g<e.length;g++)u=e[g],h=v+o(u,g),m+=s(u,h,n,r);else{var y=c(e);if(y){var b,_=y.call(e);if(y!==e.entries)for(var C=0;!(b=_.next()).done;)u=b.value,h=v+o(u,C++),m+=s(u,h,n,r);else for(;!(b=_.next()).done;){var w=b.value;w&&(u=w[1],h=v+a(w[0])+d+o(u,0),m+=s(u,h,n,r))}}else if("object"===i){String(e);f(!1)}}return m}function u(e,t,n){return null==e?0:s(e,"",t,n)}var l=(n(231),n(230)),c=n(236),f=n(229),p=(n(232),"."),d=":",h={"=":"=0",":":"=2"},m=/[=:]/g;e.exports=u},function(e,t){"use strict";function n(e){var t=e&&(r&&e[r]||e[o]);return"function"==typeof t?t:void 0}var r="function"==typeof Symbol&&Symbol.iterator,o="@@iterator";e.exports=n},function(e,t,n){"use strict";function r(e,t,n){this.props=e,this.context=t,this.refs=i,this.updater=n||o}var o=n(238),i=(n(239),n(234),n(242)),a=n(229);n(232);r.prototype.isReactComponent={},r.prototype.setState=function(e,t){"object"!=typeof e&&"function"!=typeof e&&null!=e?a(!1):void 0,this.updater.enqueueSetState(this,e),t&&this.updater.enqueueCallback(this,t,"setState")},r.prototype.forceUpdate=function(e){this.updater.enqueueForceUpdate(this),e&&this.updater.enqueueCallback(this,e,"forceUpdate")};e.exports=r},function(e,t,n){"use strict";function r(e,t){}var o=(n(232),{isMounted:function(e){return!1},enqueueCallback:function(e,t){},enqueueForceUpdate:function(e){r(e,"forceUpdate")},enqueueReplaceState:function(e,t){r(e,"replaceState")},enqueueSetState:function(e,t){r(e,"setState")}});e.exports=o},function(e,t,n){"use strict";var r=n(240);e.exports={debugTool:r}},function(e,t,n){"use strict";function r(e,t,n,r,o,i){}var o=n(241),i=(n(232),[]),a={addDevtool:function(e){i.push(e)},removeDevtool:function(e){for(var t=0;t<i.length;t++)i[t]===e&&(i.splice(t,1),t--)},onBeginProcessingChildContext:function(){r("onBeginProcessingChildContext")},onEndProcessingChildContext:function(){r("onEndProcessingChildContext")},onSetState:function(){r("onSetState")},onMountRootComponent:function(e){r("onMountRootComponent",e)},onMountComponent:function(e){r("onMountComponent",e)},onUpdateComponent:function(e){r("onUpdateComponent",e)},onUnmountComponent:function(e){r("onUnmountComponent",e)}};a.addDevtool(o),e.exports=a},function(e,t,n){"use strict";var r,o,i=(n(232),{onBeginProcessingChildContext:function(){r=!0},onEndProcessingChildContext:function(){r=!1},onSetState:function(){o()}});e.exports=i},function(e,t,n){"use strict";var r={};e.exports=r},function(e,t,n){"use strict";function r(e,t){var n=w.hasOwnProperty(t)?w[t]:null;P.hasOwnProperty(t)&&(n!==_.OVERRIDE_BASE?v(!1):void 0),e&&(n!==_.DEFINE_MANY&&n!==_.DEFINE_MANY_MERGED?v(!1):void 0)}function o(e,t){if(t){"function"==typeof t?v(!1):void 0,d.isValidElement(t)?v(!1):void 0;var n=e.prototype,o=n.__reactAutoBindPairs;t.hasOwnProperty(b)&&x.mixins(e,t.mixins);for(var i in t)if(t.hasOwnProperty(i)&&i!==b){var a=t[i],l=n.hasOwnProperty(i);if(r(l,i),x.hasOwnProperty(i))x[i](e,a);else{var c=w.hasOwnProperty(i),f="function"==typeof a,p=f&&!c&&!l&&t.autobind!==!1;if(p)o.push(i,a),n[i]=a;else if(l){var h=w[i];!c||h!==_.DEFINE_MANY_MERGED&&h!==_.DEFINE_MANY?v(!1):void 0,h===_.DEFINE_MANY_MERGED?n[i]=s(n[i],a):h===_.DEFINE_MANY&&(n[i]=u(n[i],a))}else n[i]=a}}}}function i(e,t){if(t)for(var n in t){var r=t[n];if(t.hasOwnProperty(n)){var o=n in x;o?v(!1):void 0;var i=n in e;i?v(!1):void 0,e[n]=r}}}function a(e,t){e&&t&&"object"==typeof e&&"object"==typeof t?void 0:v(!1);for(var n in t)t.hasOwnProperty(n)&&(void 0!==e[n]?v(!1):void 0,e[n]=t[n]);return e}function s(e,t){return function(){var n=e.apply(this,arguments),r=t.apply(this,arguments);if(null==n)return r;if(null==r)return n;var o={};return a(o,n),a(o,r),o}}function u(e,t){return function(){e.apply(this,arguments),t.apply(this,arguments)}}function l(e,t){var n=t.bind(e);return n}function c(e){for(var t=e.__reactAutoBindPairs,n=0;n<t.length;n+=2){var r=t[n],o=t[n+1];e[r]=l(e,o)}}var f=n(226),p=n(237),d=n(230),h=(n(244),n(246),n(238)),m=n(242),v=n(229),g=n(245),y=n(247),b=(n(232),y({mixins:null})),_=g({DEFINE_ONCE:null,DEFINE_MANY:null,OVERRIDE_BASE:null,DEFINE_MANY_MERGED:null}),C=[],w={mixins:_.DEFINE_MANY,statics:_.DEFINE_MANY,propTypes:_.DEFINE_MANY,contextTypes:_.DEFINE_MANY,childContextTypes:_.DEFINE_MANY,getDefaultProps:_.DEFINE_MANY_MERGED,getInitialState:_.DEFINE_MANY_MERGED,getChildContext:_.DEFINE_MANY_MERGED,render:_.DEFINE_ONCE,componentWillMount:_.DEFINE_MANY,componentDidMount:_.DEFINE_MANY,componentWillReceiveProps:_.DEFINE_MANY,shouldComponentUpdate:_.DEFINE_ONCE,componentWillUpdate:_.DEFINE_MANY,componentDidUpdate:_.DEFINE_MANY,componentWillUnmount:_.DEFINE_MANY,updateComponent:_.OVERRIDE_BASE},x={displayName:function(e,t){e.displayName=t},mixins:function(e,t){if(t)for(var n=0;n<t.length;n++)o(e,t[n])},childContextTypes:function(e,t){e.childContextTypes=f({},e.childContextTypes,t)},contextTypes:function(e,t){e.contextTypes=f({},e.contextTypes,t)},getDefaultProps:function(e,t){e.getDefaultProps?e.getDefaultProps=s(e.getDefaultProps,t):e.getDefaultProps=t},propTypes:function(e,t){e.propTypes=f({},e.propTypes,t)},statics:function(e,t){i(e,t)},autobind:function(){}},P={replaceState:function(e,t){this.updater.enqueueReplaceState(this,e),t&&this.updater.enqueueCallback(this,t,"replaceState")},isMounted:function(){return this.updater.isMounted(this)}},E=function(){};f(E.prototype,p.prototype,P);var R={createClass:function(e){var t=function(e,t,n){this.__reactAutoBindPairs.length&&c(this),this.props=e,this.context=t,this.refs=m,this.updater=n||h,this.state=null;var r=this.getInitialState?this.getInitialState():null;"object"!=typeof r||Array.isArray(r)?v(!1):void 0,this.state=r};t.prototype=new E,t.prototype.constructor=t,t.prototype.__reactAutoBindPairs=[],C.forEach(o.bind(null,t)),o(t,e),t.getDefaultProps&&(t.defaultProps=t.getDefaultProps()),t.prototype.render?void 0:v(!1);for(var n in w)t.prototype[n]||(t.prototype[n]=null);return t},injection:{injectMixin:function(e){C.push(e)}}};e.exports=R},function(e,t,n){"use strict";var r=n(245),o=r({prop:null,context:null,childContext:null});e.exports=o},function(e,t,n){"use strict";var r=n(229),o=function(e){var t,n={};e instanceof Object&&!Array.isArray(e)?void 0:r(!1);for(t in e)e.hasOwnProperty(t)&&(n[t]=t);return n};e.exports=o},function(e,t,n){"use strict";var r={};e.exports=r},function(e,t){"use strict";var n=function(e){var t;for(t in e)if(e.hasOwnProperty(t))return t;return null};e.exports=n},function(e,t,n){"use strict";function r(e){return o.createFactory(e)}var o=n(230),i=(n(249),n(250)),a=i({a:"a",abbr:"abbr",address:"address",area:"area",article:"article",aside:"aside",audio:"audio",b:"b",base:"base",bdi:"bdi",bdo:"bdo",big:"big",blockquote:"blockquote",body:"body",br:"br",button:"button",canvas:"canvas",caption:"caption",cite:"cite",code:"code",col:"col",colgroup:"colgroup",data:"data",datalist:"datalist",dd:"dd",del:"del",details:"details",dfn:"dfn",dialog:"dialog",div:"div",dl:"dl",dt:"dt",em:"em",embed:"embed",fieldset:"fieldset",figcaption:"figcaption",figure:"figure",footer:"footer",form:"form",h1:"h1",h2:"h2",h3:"h3",h4:"h4",h5:"h5",h6:"h6",head:"head",header:"header",hgroup:"hgroup",hr:"hr",html:"html",i:"i",iframe:"iframe",img:"img",input:"input",ins:"ins",kbd:"kbd",keygen:"keygen",label:"label",legend:"legend",li:"li",link:"link",main:"main",map:"map",mark:"mark",menu:"menu",menuitem:"menuitem",meta:"meta",meter:"meter",nav:"nav",noscript:"noscript",object:"object",ol:"ol",optgroup:"optgroup",option:"option",output:"output",p:"p",param:"param",picture:"picture",pre:"pre",progress:"progress",q:"q",rp:"rp",rt:"rt",ruby:"ruby",s:"s",samp:"samp",script:"script",section:"section",select:"select",small:"small",source:"source",span:"span",strong:"strong",style:"style",sub:"sub",summary:"summary",sup:"sup",table:"table",tbody:"tbody",td:"td",textarea:"textarea",tfoot:"tfoot",th:"th",thead:"thead",time:"time",title:"title",tr:"tr",track:"track",u:"u",ul:"ul","var":"var",video:"video",wbr:"wbr",circle:"circle",clipPath:"clipPath",defs:"defs",ellipse:"ellipse",g:"g",image:"image",line:"line",linearGradient:"linearGradient",mask:"mask",path:"path",pattern:"pattern",polygon:"polygon",polyline:"polyline",radialGradient:"radialGradient",rect:"rect",stop:"stop",svg:"svg",text:"text",tspan:"tspan"},r);e.exports=a},function(e,t,n){"use strict";function r(){if(f.current){var e=f.current.getName();if(e)return" Check the render method of `"+e+"`."}return""}function o(e,t){if(e._store&&!e._store.validated&&null==e.key){e._store.validated=!0;i("uniqueKey",e,t)}}function i(e,t,n){var o=r();if(!o){var i="string"==typeof n?n:n.displayName||n.name;i&&(o=" Check the top-level render call using <"+i+">.")}var a=h[e]||(h[e]={});if(a[o])return null;a[o]=!0;var s={parentOrOwner:o,url:" See https://fb.me/react-warning-keys for more information.",childOwner:null};return t&&t._owner&&t._owner!==f.current&&(s.childOwner=" It was passed a child from "+t._owner.getName()+"."),s}function a(e,t){if("object"==typeof e)if(Array.isArray(e))for(var n=0;n<e.length;n++){var r=e[n];l.isValidElement(r)&&o(r,t)}else if(l.isValidElement(e))e._store&&(e._store.validated=!0);else if(e){var i=p(e);if(i&&i!==e.entries)for(var a,s=i.call(e);!(a=s.next()).done;)l.isValidElement(a.value)&&o(a.value,t)}}function s(e,t,n,o){for(var i in t)if(t.hasOwnProperty(i)){var a;try{"function"!=typeof t[i]?d(!1):void 0,a=t[i](n,i,e,o)}catch(s){a=s}if(a instanceof Error&&!(a.message in m)){m[a.message]=!0;r()}}}function u(e){var t=e.type;if("function"==typeof t){var n=t.displayName||t.name;t.propTypes&&s(n,t.propTypes,e.props,c.prop),"function"==typeof t.getDefaultProps}}var l=n(230),c=n(244),f=(n(246),n(231)),p=(n(234),n(236)),d=n(229),h=(n(232),{}),m={},v={createElement:function(e,t,n){var r="string"==typeof e||"function"==typeof e,o=l.createElement.apply(this,arguments);if(null==o)return o;if(r)for(var i=2;i<arguments.length;i++)a(arguments[i],e);return u(o),o},createFactory:function(e){var t=v.createElement.bind(null,e);return t.type=e,t},cloneElement:function(e,t,n){for(var r=l.cloneElement.apply(this,arguments),o=2;o<arguments.length;o++)a(arguments[o],r.type);return u(r),r}};e.exports=v},function(e,t){"use strict";function n(e,t,n){if(!e)return null;var o={};for(var i in e)r.call(e,i)&&(o[i]=t.call(n,e[i],i,e));return o}var r=Object.prototype.hasOwnProperty;e.exports=n},function(e,t,n){"use strict";function r(e,t){return e===t?0!==e||1/e===1/t:e!==e&&t!==t}function o(e){function t(t,n,r,o,i,a){if(o=o||x,a=a||r,null==n[r]){var s=_[i];return t?new Error("Required "+s+" `"+a+"` was not specified in "+("`"+o+"`.")):null}return e(n,r,o,i,a)}var n=t.bind(null,!1);return n.isRequired=t.bind(null,!0),n}function i(e){function t(t,n,r,o,i){var a=t[n],s=v(a);if(s!==e){var u=_[o],l=g(a);return new Error("Invalid "+u+" `"+i+"` of type "+("`"+l+"` supplied to `"+r+"`, expected ")+("`"+e+"`."))}return null}return o(t)}function a(){return o(C.thatReturns(null))}function s(e){function t(t,n,r,o,i){if("function"!=typeof e)return new Error("Property `"+i+"` of component `"+r+"` has invalid PropType notation inside arrayOf.");var a=t[n];if(!Array.isArray(a)){var s=_[o],u=v(a);return new Error("Invalid "+s+" `"+i+"` of type "+("`"+u+"` supplied to `"+r+"`, expected an array."))}for(var l=0;l<a.length;l++){var c=e(a,l,r,o,i+"["+l+"]");if(c instanceof Error)return c}return null}return o(t)}function u(){function e(e,t,n,r,o){if(!b.isValidElement(e[t])){var i=_[r];return new Error("Invalid "+i+" `"+o+"` supplied to "+("`"+n+"`, expected a single ReactElement."))}return null}return o(e)}function l(e){function t(t,n,r,o,i){if(!(t[n]instanceof e)){var a=_[o],s=e.name||x,u=y(t[n]);return new Error("Invalid "+a+" `"+i+"` of type "+("`"+u+"` supplied to `"+r+"`, expected ")+("instance of `"+s+"`."))}return null}return o(t)}function c(e){function t(t,n,o,i,a){for(var s=t[n],u=0;u<e.length;u++)if(r(s,e[u]))return null;var l=_[i],c=JSON.stringify(e);return new Error("Invalid "+l+" `"+a+"` of value `"+s+"` "+("supplied to `"+o+"`, expected one of "+c+"."))}return o(Array.isArray(e)?t:function(){return new Error("Invalid argument supplied to oneOf, expected an instance of array.")})}function f(e){function t(t,n,r,o,i){if("function"!=typeof e)return new Error("Property `"+i+"` of component `"+r+"` has invalid PropType notation inside objectOf.");var a=t[n],s=v(a);if("object"!==s){var u=_[o];return new Error("Invalid "+u+" `"+i+"` of type "+("`"+s+"` supplied to `"+r+"`, expected an object."))}for(var l in a)if(a.hasOwnProperty(l)){var c=e(a,l,r,o,i+"."+l);if(c instanceof Error)return c}return null}return o(t)}function p(e){function t(t,n,r,o,i){for(var a=0;a<e.length;a++){var s=e[a];if(null==s(t,n,r,o,i))return null}var u=_[o];return new Error("Invalid "+u+" `"+i+"` supplied to "+("`"+r+"`."))}return o(Array.isArray(e)?t:function(){return new Error("Invalid argument supplied to oneOfType, expected an instance of array.")})}function d(){function e(e,t,n,r,o){if(!m(e[t])){var i=_[r];return new Error("Invalid "+i+" `"+o+"` supplied to "+("`"+n+"`, expected a ReactNode."))}return null}return o(e)}function h(e){function t(t,n,r,o,i){var a=t[n],s=v(a);if("object"!==s){var u=_[o];return new Error("Invalid "+u+" `"+i+"` of type `"+s+"` "+("supplied to `"+r+"`, expected `object`."))}for(var l in e){var c=e[l];if(c){var f=c(a,l,r,o,i+"."+l);if(f)return f}}return null}return o(t)}function m(e){switch(typeof e){case"number":case"string":case"undefined":return!0;case"boolean":return!e;case"object":if(Array.isArray(e))return e.every(m);if(null===e||b.isValidElement(e))return!0;var t=w(e);if(!t)return!1;var n,r=t.call(e);if(t!==e.entries){for(;!(n=r.next()).done;)if(!m(n.value))return!1}else for(;!(n=r.next()).done;){var o=n.value;if(o&&!m(o[1]))return!1}return!0;default:return!1}}function v(e){var t=typeof e;return Array.isArray(e)?"array":e instanceof RegExp?"object":t}function g(e){var t=v(e);if("object"===t){if(e instanceof Date)return"date";if(e instanceof RegExp)return"regexp"}return t}function y(e){return e.constructor&&e.constructor.name?e.constructor.name:x}var b=n(230),_=n(246),C=n(233),w=n(236),x="<<anonymous>>",P={array:i("array"),bool:i("boolean"),func:i("function"),number:i("number"),object:i("object"),string:i("string"),any:a(),arrayOf:s,element:u(),instanceOf:l,node:d(),objectOf:f,oneOf:c,oneOfType:p,shape:h};e.exports=P},function(e,t){"use strict";e.exports="15.0.1"},function(e,t,n){"use strict";function r(e){return o.isValidElement(e)?void 0:i(!1),e}var o=n(230),i=n(229);e.exports=r},function(e,t,n){(function(t){e.exports=t.ReactDOM=n(255)}).call(t,function(){return this}())},function(e,t,n){"use strict";e.exports=n(256)},function(e,t,n){"use strict";var r=n(257),o=n(260),i=n(377),a=n(280),s=n(281),u=n(277),l=n(252),c=n(382),f=n(383),p=n(384);n(232);o.inject();var d=a.measure("React","render",i.render),h={findDOMNode:c,render:d,unmountComponentAtNode:i.unmountComponentAtNode,version:l,unstable_batchedUpdates:u.batchedUpdates,unstable_renderSubtreeIntoContainer:p};"undefined"!=typeof __REACT_DEVTOOLS_GLOBAL_HOOK__&&"function"==typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.inject&&__REACT_DEVTOOLS_GLOBAL_HOOK__.inject({ComponentTree:{getClosestInstanceFromNode:r.getClosestInstanceFromNode,getNodeFromInstance:function(e){return e._renderedComponent&&(e=f(e)),e?r.getNodeFromInstance(e):null}},Mount:i,Reconciler:s});e.exports=h},function(e,t,n){"use strict";function r(e){for(var t;t=e._renderedComponent;)e=t;return e}function o(e,t){var n=r(e);n._nativeNode=t,t[m]=n}function i(e){var t=e._nativeNode;t&&(delete t[m],e._nativeNode=null)}function a(e,t){if(!(e._flags&h.hasCachedChildNodes)){var n=e._renderedChildren,i=t.firstChild;e:for(var a in n)if(n.hasOwnProperty(a)){var s=n[a],u=r(s)._domID;if(null!=u){for(;null!==i;i=i.nextSibling)if(1===i.nodeType&&i.getAttribute(d)===String(u)||8===i.nodeType&&i.nodeValue===" react-text: "+u+" "||8===i.nodeType&&i.nodeValue===" react-empty: "+u+" "){o(s,i);continue e}p(!1)}}e._flags|=h.hasCachedChildNodes}}function s(e){if(e[m])return e[m];for(var t=[];!e[m];){if(t.push(e),!e.parentNode)return null;e=e.parentNode}for(var n,r;e&&(r=e[m]);e=t.pop())n=r,t.length&&a(r,e);return n}function u(e){var t=s(e);return null!=t&&t._nativeNode===e?t:null}function l(e){if(void 0===e._nativeNode?p(!1):void 0,e._nativeNode)return e._nativeNode;for(var t=[];!e._nativeNode;)t.push(e),e._nativeParent?void 0:p(!1),e=e._nativeParent;for(;t.length;e=t.pop())a(e,e._nativeNode);return e._nativeNode}var c=n(258),f=n(259),p=n(229),d=c.ID_ATTRIBUTE_NAME,h=f,m="__reactInternalInstance$"+Math.random().toString(36).slice(2),v={getClosestInstanceFromNode:s,getInstanceFromNode:u,getNodeFromInstance:l,precacheChildNodes:a,precacheNode:o,uncacheNode:i};e.exports=v},function(e,t,n){"use strict";function r(e,t){return(e&t)===t}var o=n(229),i={MUST_USE_PROPERTY:1,HAS_SIDE_EFFECTS:2,HAS_BOOLEAN_VALUE:4,HAS_NUMERIC_VALUE:8,HAS_POSITIVE_NUMERIC_VALUE:24,HAS_OVERLOADED_BOOLEAN_VALUE:32,injectDOMPropertyConfig:function(e){var t=i,n=e.Properties||{},a=e.DOMAttributeNamespaces||{},u=e.DOMAttributeNames||{},l=e.DOMPropertyNames||{},c=e.DOMMutationMethods||{};e.isCustomAttribute&&s._isCustomAttributeFunctions.push(e.isCustomAttribute);for(var f in n){s.properties.hasOwnProperty(f)?o(!1):void 0;var p=f.toLowerCase(),d=n[f],h={attributeName:p,attributeNamespace:null,propertyName:f,mutationMethod:null,mustUseProperty:r(d,t.MUST_USE_PROPERTY),hasSideEffects:r(d,t.HAS_SIDE_EFFECTS),hasBooleanValue:r(d,t.HAS_BOOLEAN_VALUE),hasNumericValue:r(d,t.HAS_NUMERIC_VALUE),hasPositiveNumericValue:r(d,t.HAS_POSITIVE_NUMERIC_VALUE),hasOverloadedBooleanValue:r(d,t.HAS_OVERLOADED_BOOLEAN_VALUE)
};if(!h.mustUseProperty&&h.hasSideEffects?o(!1):void 0,h.hasBooleanValue+h.hasNumericValue+h.hasOverloadedBooleanValue<=1?void 0:o(!1),u.hasOwnProperty(f)){var m=u[f];h.attributeName=m}a.hasOwnProperty(f)&&(h.attributeNamespace=a[f]),l.hasOwnProperty(f)&&(h.propertyName=l[f]),c.hasOwnProperty(f)&&(h.mutationMethod=c[f]),s.properties[f]=h}}},a=":A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD",s={ID_ATTRIBUTE_NAME:"data-reactid",ROOT_ATTRIBUTE_NAME:"data-reactroot",ATTRIBUTE_NAME_START_CHAR:a,ATTRIBUTE_NAME_CHAR:a+"\\-.0-9\\uB7\\u0300-\\u036F\\u203F-\\u2040",properties:{},getPossibleStandardName:null,_isCustomAttributeFunctions:[],isCustomAttribute:function(e){for(var t=0;t<s._isCustomAttributeFunctions.length;t++){var n=s._isCustomAttributeFunctions[t];if(n(e))return!0}return!1},injection:i};e.exports=s},function(e,t){"use strict";var n={hasCachedChildNodes:1};e.exports=n},function(e,t,n){"use strict";function r(){if(!w){w=!0,g.EventEmitter.injectReactEventListener(v),g.EventPluginHub.injectEventPluginOrder(a),g.EventPluginUtils.injectComponentTree(f),g.EventPluginUtils.injectTreeTraversal(d),g.EventPluginHub.injectEventPluginsByName({SimpleEventPlugin:C,EnterLeaveEventPlugin:s,ChangeEventPlugin:i,SelectEventPlugin:_,BeforeInputEventPlugin:o}),g.NativeComponent.injectGenericComponentClass(c),g.NativeComponent.injectTextComponentClass(h),g.DOMProperty.injectDOMPropertyConfig(u),g.DOMProperty.injectDOMPropertyConfig(b),g.EmptyComponent.injectEmptyComponentFactory(function(e){return new p(e)}),g.Updates.injectReconcileTransaction(y),g.Updates.injectBatchingStrategy(m),g.Component.injectEnvironment(l)}}var o=n(261),i=n(276),a=n(288),s=n(289),u=(n(270),n(294)),l=n(295),c=n(308),f=n(257),p=n(348),d=n(349),h=n(350),m=n(351),v=n(352),g=n(355),y=n(356),b=n(364),_=n(365),C=n(366),w=!1;e.exports={inject:r}},function(e,t,n){"use strict";function r(){var e=window.opera;return"object"==typeof e&&"function"==typeof e.version&&parseInt(e.version(),10)<=12}function o(e){return(e.ctrlKey||e.altKey||e.metaKey)&&!(e.ctrlKey&&e.altKey)}function i(e){switch(e){case O.topCompositionStart:return T.compositionStart;case O.topCompositionEnd:return T.compositionEnd;case O.topCompositionUpdate:return T.compositionUpdate}}function a(e,t){return e===O.topKeyDown&&t.keyCode===C}function s(e,t){switch(e){case O.topKeyUp:return-1!==_.indexOf(t.keyCode);case O.topKeyDown:return t.keyCode!==C;case O.topKeyPress:case O.topMouseDown:case O.topBlur:return!0;default:return!1}}function u(e){var t=e.detail;return"object"==typeof t&&"data"in t?t.data:null}function l(e,t,n,r){var o,l;if(w?o=i(e):N?s(e,n)&&(o=T.compositionEnd):a(e,n)&&(o=T.compositionStart),!o)return null;E&&(N||o!==T.compositionStart?o===T.compositionEnd&&N&&(l=N.getData()):N=v.getPooled(r));var c=g.getPooled(o,t,n,r);if(l)c.data=l;else{var f=u(n);null!==f&&(c.data=f)}return h.accumulateTwoPhaseDispatches(c),c}function c(e,t){switch(e){case O.topCompositionEnd:return u(t);case O.topKeyPress:var n=t.which;return n!==R?null:(k=!0,S);case O.topTextInput:var r=t.data;return r===S&&k?null:r;default:return null}}function f(e,t){if(N){if(e===O.topCompositionEnd||s(e,t)){var n=N.getData();return v.release(N),N=null,n}return null}switch(e){case O.topPaste:return null;case O.topKeyPress:return t.which&&!o(t)?String.fromCharCode(t.which):null;case O.topCompositionEnd:return E?null:t.data;default:return null}}function p(e,t,n,r){var o;if(o=P?c(e,n):f(e,n),!o)return null;var i=y.getPooled(T.beforeInput,t,n,r);return i.data=o,h.accumulateTwoPhaseDispatches(i),i}var d=n(262),h=n(263),m=n(270),v=n(271),g=n(273),y=n(275),b=n(247),_=[9,13,27,32],C=229,w=m.canUseDOM&&"CompositionEvent"in window,x=null;m.canUseDOM&&"documentMode"in document&&(x=document.documentMode);var P=m.canUseDOM&&"TextEvent"in window&&!x&&!r(),E=m.canUseDOM&&(!w||x&&x>8&&11>=x),R=32,S=String.fromCharCode(R),O=d.topLevelTypes,T={beforeInput:{phasedRegistrationNames:{bubbled:b({onBeforeInput:null}),captured:b({onBeforeInputCapture:null})},dependencies:[O.topCompositionEnd,O.topKeyPress,O.topTextInput,O.topPaste]},compositionEnd:{phasedRegistrationNames:{bubbled:b({onCompositionEnd:null}),captured:b({onCompositionEndCapture:null})},dependencies:[O.topBlur,O.topCompositionEnd,O.topKeyDown,O.topKeyPress,O.topKeyUp,O.topMouseDown]},compositionStart:{phasedRegistrationNames:{bubbled:b({onCompositionStart:null}),captured:b({onCompositionStartCapture:null})},dependencies:[O.topBlur,O.topCompositionStart,O.topKeyDown,O.topKeyPress,O.topKeyUp,O.topMouseDown]},compositionUpdate:{phasedRegistrationNames:{bubbled:b({onCompositionUpdate:null}),captured:b({onCompositionUpdateCapture:null})},dependencies:[O.topBlur,O.topCompositionUpdate,O.topKeyDown,O.topKeyPress,O.topKeyUp,O.topMouseDown]}},k=!1,N=null,j={eventTypes:T,extractEvents:function(e,t,n,r){return[l(e,t,n,r),p(e,t,n,r)]}};e.exports=j},function(e,t,n){"use strict";var r=n(245),o=r({bubbled:null,captured:null}),i=r({topAbort:null,topAnimationEnd:null,topAnimationIteration:null,topAnimationStart:null,topBlur:null,topCanPlay:null,topCanPlayThrough:null,topChange:null,topClick:null,topCompositionEnd:null,topCompositionStart:null,topCompositionUpdate:null,topContextMenu:null,topCopy:null,topCut:null,topDoubleClick:null,topDrag:null,topDragEnd:null,topDragEnter:null,topDragExit:null,topDragLeave:null,topDragOver:null,topDragStart:null,topDrop:null,topDurationChange:null,topEmptied:null,topEncrypted:null,topEnded:null,topError:null,topFocus:null,topInput:null,topInvalid:null,topKeyDown:null,topKeyPress:null,topKeyUp:null,topLoad:null,topLoadedData:null,topLoadedMetadata:null,topLoadStart:null,topMouseDown:null,topMouseMove:null,topMouseOut:null,topMouseOver:null,topMouseUp:null,topPaste:null,topPause:null,topPlay:null,topPlaying:null,topProgress:null,topRateChange:null,topReset:null,topScroll:null,topSeeked:null,topSeeking:null,topSelectionChange:null,topStalled:null,topSubmit:null,topSuspend:null,topTextInput:null,topTimeUpdate:null,topTouchCancel:null,topTouchEnd:null,topTouchMove:null,topTouchStart:null,topTransitionEnd:null,topVolumeChange:null,topWaiting:null,topWheel:null}),a={topLevelTypes:i,PropagationPhases:o};e.exports=a},function(e,t,n){"use strict";function r(e,t,n){var r=t.dispatchConfig.phasedRegistrationNames[n];return b(e,r)}function o(e,t,n){var o=t?y.bubbled:y.captured,i=r(e,n,o);i&&(n._dispatchListeners=v(n._dispatchListeners,i),n._dispatchInstances=v(n._dispatchInstances,e))}function i(e){e&&e.dispatchConfig.phasedRegistrationNames&&m.traverseTwoPhase(e._targetInst,o,e)}function a(e){if(e&&e.dispatchConfig.phasedRegistrationNames){var t=e._targetInst,n=t?m.getParentInstance(t):null;m.traverseTwoPhase(n,o,e)}}function s(e,t,n){if(n&&n.dispatchConfig.registrationName){var r=n.dispatchConfig.registrationName,o=b(e,r);o&&(n._dispatchListeners=v(n._dispatchListeners,o),n._dispatchInstances=v(n._dispatchInstances,e))}}function u(e){e&&e.dispatchConfig.registrationName&&s(e._targetInst,null,e)}function l(e){g(e,i)}function c(e){g(e,a)}function f(e,t,n,r){m.traverseEnterLeave(n,r,s,e,t)}function p(e){g(e,u)}var d=n(262),h=n(264),m=n(266),v=n(268),g=n(269),y=(n(232),d.PropagationPhases),b=h.getListener,_={accumulateTwoPhaseDispatches:l,accumulateTwoPhaseDispatchesSkipTarget:c,accumulateDirectDispatches:p,accumulateEnterLeaveDispatches:f};e.exports=_},function(e,t,n){"use strict";var r=n(265),o=n(266),i=n(267),a=n(268),s=n(269),u=n(229),l={},c=null,f=function(e,t){e&&(o.executeDispatchesInOrder(e,t),e.isPersistent()||e.constructor.release(e))},p=function(e){return f(e,!0)},d=function(e){return f(e,!1)},h={injection:{injectEventPluginOrder:r.injectEventPluginOrder,injectEventPluginsByName:r.injectEventPluginsByName},putListener:function(e,t,n){"function"!=typeof n?u(!1):void 0;var o=l[t]||(l[t]={});o[e._rootNodeID]=n;var i=r.registrationNameModules[t];i&&i.didPutListener&&i.didPutListener(e,t,n)},getListener:function(e,t){var n=l[t];return n&&n[e._rootNodeID]},deleteListener:function(e,t){var n=r.registrationNameModules[t];n&&n.willDeleteListener&&n.willDeleteListener(e,t);var o=l[t];o&&delete o[e._rootNodeID]},deleteAllListeners:function(e){for(var t in l)if(l[t][e._rootNodeID]){var n=r.registrationNameModules[t];n&&n.willDeleteListener&&n.willDeleteListener(e,t),delete l[t][e._rootNodeID]}},extractEvents:function(e,t,n,o){for(var i,s=r.plugins,u=0;u<s.length;u++){var l=s[u];if(l){var c=l.extractEvents(e,t,n,o);c&&(i=a(i,c))}}return i},enqueueEvents:function(e){e&&(c=a(c,e))},processEventQueue:function(e){var t=c;c=null,e?s(t,p):s(t,d),c?u(!1):void 0,i.rethrowCaughtError()},__purge:function(){l={}},__getListenerBank:function(){return l}};e.exports=h},function(e,t,n){"use strict";function r(){if(s)for(var e in u){var t=u[e],n=s.indexOf(e);if(n>-1?void 0:a(!1),!l.plugins[n]){t.extractEvents?void 0:a(!1),l.plugins[n]=t;var r=t.eventTypes;for(var i in r)o(r[i],t,i)?void 0:a(!1)}}}function o(e,t,n){l.eventNameDispatchConfigs.hasOwnProperty(n)?a(!1):void 0,l.eventNameDispatchConfigs[n]=e;var r=e.phasedRegistrationNames;if(r){for(var o in r)if(r.hasOwnProperty(o)){var s=r[o];i(s,t,n)}return!0}return e.registrationName?(i(e.registrationName,t,n),!0):!1}function i(e,t,n){l.registrationNameModules[e]?a(!1):void 0,l.registrationNameModules[e]=t,l.registrationNameDependencies[e]=t.eventTypes[n].dependencies}var a=n(229),s=null,u={},l={plugins:[],eventNameDispatchConfigs:{},registrationNameModules:{},registrationNameDependencies:{},possibleRegistrationNames:null,injectEventPluginOrder:function(e){s?a(!1):void 0,s=Array.prototype.slice.call(e),r()},injectEventPluginsByName:function(e){var t=!1;for(var n in e)if(e.hasOwnProperty(n)){var o=e[n];u.hasOwnProperty(n)&&u[n]===o||(u[n]?a(!1):void 0,u[n]=o,t=!0)}t&&r()},getPluginModuleForEvent:function(e){var t=e.dispatchConfig;if(t.registrationName)return l.registrationNameModules[t.registrationName]||null;for(var n in t.phasedRegistrationNames)if(t.phasedRegistrationNames.hasOwnProperty(n)){var r=l.registrationNameModules[t.phasedRegistrationNames[n]];if(r)return r}return null},_resetEventPlugins:function(){s=null;for(var e in u)u.hasOwnProperty(e)&&delete u[e];l.plugins.length=0;var t=l.eventNameDispatchConfigs;for(var n in t)t.hasOwnProperty(n)&&delete t[n];var r=l.registrationNameModules;for(var o in r)r.hasOwnProperty(o)&&delete r[o]}};e.exports=l},function(e,t,n){"use strict";function r(e){return e===y.topMouseUp||e===y.topTouchEnd||e===y.topTouchCancel}function o(e){return e===y.topMouseMove||e===y.topTouchMove}function i(e){return e===y.topMouseDown||e===y.topTouchStart}function a(e,t,n,r){var o=e.type||"unknown-event";e.currentTarget=b.getNodeFromInstance(r),t?m.invokeGuardedCallbackWithCatch(o,n,e):m.invokeGuardedCallback(o,n,e),e.currentTarget=null}function s(e,t){var n=e._dispatchListeners,r=e._dispatchInstances;if(Array.isArray(n))for(var o=0;o<n.length&&!e.isPropagationStopped();o++)a(e,t,n[o],r[o]);else n&&a(e,t,n,r);e._dispatchListeners=null,e._dispatchInstances=null}function u(e){var t=e._dispatchListeners,n=e._dispatchInstances;if(Array.isArray(t)){for(var r=0;r<t.length&&!e.isPropagationStopped();r++)if(t[r](e,n[r]))return n[r]}else if(t&&t(e,n))return n;return null}function l(e){var t=u(e);return e._dispatchInstances=null,e._dispatchListeners=null,t}function c(e){var t=e._dispatchListeners,n=e._dispatchInstances;Array.isArray(t)?v(!1):void 0,e.currentTarget=b.getNodeFromInstance(n);var r=t?t(e):null;return e.currentTarget=null,e._dispatchListeners=null,e._dispatchInstances=null,r}function f(e){return!!e._dispatchListeners}var p,d,h=n(262),m=n(267),v=n(229),g=(n(232),{injectComponentTree:function(e){p=e},injectTreeTraversal:function(e){d=e}}),y=h.topLevelTypes,b={isEndish:r,isMoveish:o,isStartish:i,executeDirectDispatch:c,executeDispatchesInOrder:s,executeDispatchesInOrderStopAtTrue:l,hasDispatches:f,getInstanceFromNode:function(e){return p.getInstanceFromNode(e)},getNodeFromInstance:function(e){return p.getNodeFromInstance(e)},isAncestor:function(e,t){return d.isAncestor(e,t)},getLowestCommonAncestor:function(e,t){return d.getLowestCommonAncestor(e,t)},getParentInstance:function(e){return d.getParentInstance(e)},traverseTwoPhase:function(e,t,n){return d.traverseTwoPhase(e,t,n)},traverseEnterLeave:function(e,t,n,r,o){return d.traverseEnterLeave(e,t,n,r,o)},injection:g};e.exports=b},function(e,t,n){"use strict";function r(e,t,n,r){try{return t(n,r)}catch(i){return void(null===o&&(o=i))}}var o=null,i={invokeGuardedCallback:r,invokeGuardedCallbackWithCatch:r,rethrowCaughtError:function(){if(o){var e=o;throw o=null,e}}};e.exports=i},function(e,t,n){"use strict";function r(e,t){if(null==t?o(!1):void 0,null==e)return t;var n=Array.isArray(e),r=Array.isArray(t);return n&&r?(e.push.apply(e,t),e):n?(e.push(t),e):r?[e].concat(t):[e,t]}var o=n(229);e.exports=r},function(e,t){"use strict";var n=function(e,t,n){Array.isArray(e)?e.forEach(t,n):e&&t.call(n,e)};e.exports=n},function(e,t){"use strict";var n=!("undefined"==typeof window||!window.document||!window.document.createElement),r={canUseDOM:n,canUseWorkers:"undefined"!=typeof Worker,canUseEventListeners:n&&!(!window.addEventListener&&!window.attachEvent),canUseViewport:n&&!!window.screen,isInWorker:!n};e.exports=r},function(e,t,n){"use strict";function r(e){this._root=e,this._startText=this.getText(),this._fallbackText=null}var o=n(226),i=n(228),a=n(272);o(r.prototype,{destructor:function(){this._root=null,this._startText=null,this._fallbackText=null},getText:function(){return"value"in this._root?this._root.value:this._root[a()]},getData:function(){if(this._fallbackText)return this._fallbackText;var e,t,n=this._startText,r=n.length,o=this.getText(),i=o.length;for(e=0;r>e&&n[e]===o[e];e++);var a=r-e;for(t=1;a>=t&&n[r-t]===o[i-t];t++);var s=t>1?1-t:void 0;return this._fallbackText=o.slice(e,s),this._fallbackText}}),i.addPoolingTo(r),e.exports=r},function(e,t,n){"use strict";function r(){return!i&&o.canUseDOM&&(i="textContent"in document.documentElement?"textContent":"innerText"),i}var o=n(270),i=null;e.exports=r},function(e,t,n){"use strict";function r(e,t,n,r){return o.call(this,e,t,n,r)}var o=n(274),i={data:null};o.augmentClass(r,i),e.exports=r},function(e,t,n){"use strict";function r(e,t,n,r){this.dispatchConfig=e,this._targetInst=t,this.nativeEvent=n;var o=this.constructor.Interface;for(var i in o)if(o.hasOwnProperty(i)){var s=o[i];s?this[i]=s(n):"target"===i?this.target=r:this[i]=n[i]}var u=null!=n.defaultPrevented?n.defaultPrevented:n.returnValue===!1;return u?this.isDefaultPrevented=a.thatReturnsTrue:this.isDefaultPrevented=a.thatReturnsFalse,this.isPropagationStopped=a.thatReturnsFalse,this}var o=n(226),i=n(228),a=n(233),s=(n(232),"function"==typeof Proxy,["dispatchConfig","_targetInst","nativeEvent","isDefaultPrevented","isPropagationStopped","_dispatchListeners","_dispatchInstances"]),u={type:null,target:null,currentTarget:a.thatReturnsNull,eventPhase:null,bubbles:null,cancelable:null,timeStamp:function(e){return e.timeStamp||Date.now()},defaultPrevented:null,isTrusted:null};o(r.prototype,{preventDefault:function(){this.defaultPrevented=!0;var e=this.nativeEvent;e&&(e.preventDefault?e.preventDefault():e.returnValue=!1,this.isDefaultPrevented=a.thatReturnsTrue)},stopPropagation:function(){var e=this.nativeEvent;e&&(e.stopPropagation?e.stopPropagation():e.cancelBubble=!0,this.isPropagationStopped=a.thatReturnsTrue)},persist:function(){this.isPersistent=a.thatReturnsTrue},isPersistent:a.thatReturnsFalse,destructor:function(){var e=this.constructor.Interface;for(var t in e)this[t]=null;for(var n=0;n<s.length;n++)this[s[n]]=null}}),r.Interface=u,r.augmentClass=function(e,t){var n=this,r=function(){};r.prototype=n.prototype;var a=new r;o(a,e.prototype),e.prototype=a,e.prototype.constructor=e,e.Interface=o({},n.Interface,t),e.augmentClass=n.augmentClass,i.addPoolingTo(e,i.fourArgumentPooler)},i.addPoolingTo(r,i.fourArgumentPooler),e.exports=r},function(e,t,n){"use strict";function r(e,t,n,r){return o.call(this,e,t,n,r)}var o=n(274),i={data:null};o.augmentClass(r,i),e.exports=r},function(e,t,n){"use strict";function r(e){var t=e.nodeName&&e.nodeName.toLowerCase();return"select"===t||"input"===t&&"file"===e.type}function o(e){var t=P.getPooled(k.change,j,e,E(e));_.accumulateTwoPhaseDispatches(t),x.batchedUpdates(i,t)}function i(e){b.enqueueEvents(e),b.processEventQueue(!1)}function a(e,t){N=e,j=t,N.attachEvent("onchange",o)}function s(){N&&(N.detachEvent("onchange",o),N=null,j=null)}function u(e,t){return e===T.topChange?t:void 0}function l(e,t,n){e===T.topFocus?(s(),a(t,n)):e===T.topBlur&&s()}function c(e,t){N=e,j=t,A=e.value,M=Object.getOwnPropertyDescriptor(e.constructor.prototype,"value"),Object.defineProperty(N,"value",D),N.attachEvent?N.attachEvent("onpropertychange",p):N.addEventListener("propertychange",p,!1)}function f(){N&&(delete N.value,N.detachEvent?N.detachEvent("onpropertychange",p):N.removeEventListener("propertychange",p,!1),N=null,j=null,A=null,M=null)}function p(e){if("value"===e.propertyName){var t=e.srcElement.value;t!==A&&(A=t,o(e))}}function d(e,t){return e===T.topInput?t:void 0}function h(e,t,n){e===T.topFocus?(f(),c(t,n)):e===T.topBlur&&f()}function m(e,t){return e!==T.topSelectionChange&&e!==T.topKeyUp&&e!==T.topKeyDown||!N||N.value===A?void 0:(A=N.value,j)}function v(e){return e.nodeName&&"input"===e.nodeName.toLowerCase()&&("checkbox"===e.type||"radio"===e.type)}function g(e,t){return e===T.topClick?t:void 0}var y=n(262),b=n(264),_=n(263),C=n(270),w=n(257),x=n(277),P=n(274),E=n(285),R=n(286),S=n(287),O=n(247),T=y.topLevelTypes,k={change:{phasedRegistrationNames:{bubbled:O({onChange:null}),captured:O({onChangeCapture:null})},dependencies:[T.topBlur,T.topChange,T.topClick,T.topFocus,T.topInput,T.topKeyDown,T.topKeyUp,T.topSelectionChange]}},N=null,j=null,A=null,M=null,F=!1;C.canUseDOM&&(F=R("change")&&(!("documentMode"in document)||document.documentMode>8));var I=!1;C.canUseDOM&&(I=R("input")&&(!("documentMode"in document)||document.documentMode>11));var D={get:function(){return M.get.call(this)},set:function(e){A=""+e,M.set.call(this,e)}},U={eventTypes:k,extractEvents:function(e,t,n,o){var i,a,s=t?w.getNodeFromInstance(t):window;if(r(s)?F?i=u:a=l:S(s)?I?i=d:(i=m,a=h):v(s)&&(i=g),i){var c=i(e,t);if(c){var f=P.getPooled(k.change,c,n,o);return f.type="change",_.accumulateTwoPhaseDispatches(f),f}}a&&a(e,s,t)}};e.exports=U},function(e,t,n){"use strict";function r(){S.ReactReconcileTransaction&&C?void 0:g(!1)}function o(){this.reinitializeTransaction(),this.dirtyComponentsLength=null,this.callbackQueue=f.getPooled(),this.reconcileTransaction=S.ReactReconcileTransaction.getPooled(!0)}function i(e,t,n,o,i,a){r(),C.batchedUpdates(e,t,n,o,i,a)}function a(e,t){return e._mountOrder-t._mountOrder}function s(e){var t=e.dirtyComponentsLength;t!==y.length?g(!1):void 0,y.sort(a);for(var n=0;t>n;n++){var r=y[n],o=r._pendingCallbacks;r._pendingCallbacks=null;var i;if(d.logTopLevelRenders){var s=r;r._currentElement.props===r._renderedComponent._currentElement&&(s=r._renderedComponent),i="React update: "+s.getName(),console.time(i)}if(m.performUpdateIfNecessary(r,e.reconcileTransaction),i&&console.timeEnd(i),o)for(var u=0;u<o.length;u++)e.callbackQueue.enqueue(o[u],r.getPublicInstance())}}function u(e){return r(),C.isBatchingUpdates?void y.push(e):void C.batchedUpdates(u,e)}function l(e,t){C.isBatchingUpdates?void 0:g(!1),b.enqueue(e,t),_=!0}var c=n(226),f=n(278),p=n(228),d=n(279),h=n(280),m=n(281),v=n(284),g=n(229),y=[],b=f.getPooled(),_=!1,C=null,w={initialize:function(){this.dirtyComponentsLength=y.length},close:function(){this.dirtyComponentsLength!==y.length?(y.splice(0,this.dirtyComponentsLength),E()):y.length=0}},x={initialize:function(){this.callbackQueue.reset()},close:function(){this.callbackQueue.notifyAll()}},P=[w,x];c(o.prototype,v.Mixin,{getTransactionWrappers:function(){return P},destructor:function(){this.dirtyComponentsLength=null,f.release(this.callbackQueue),this.callbackQueue=null,S.ReactReconcileTransaction.release(this.reconcileTransaction),this.reconcileTransaction=null},perform:function(e,t,n){return v.Mixin.perform.call(this,this.reconcileTransaction.perform,this.reconcileTransaction,e,t,n)}}),p.addPoolingTo(o);var E=function(){for(;y.length||_;){if(y.length){var e=o.getPooled();e.perform(s,null,e),o.release(e)}if(_){_=!1;var t=b;b=f.getPooled(),t.notifyAll(),f.release(t)}}};E=h.measure("ReactUpdates","flushBatchedUpdates",E);var R={injectReconcileTransaction:function(e){e?void 0:g(!1),S.ReactReconcileTransaction=e},injectBatchingStrategy:function(e){e?void 0:g(!1),"function"!=typeof e.batchedUpdates?g(!1):void 0,"boolean"!=typeof e.isBatchingUpdates?g(!1):void 0,C=e}},S={ReactReconcileTransaction:null,batchedUpdates:i,enqueueUpdate:u,flushBatchedUpdates:E,injection:R,asap:l};e.exports=S},function(e,t,n){"use strict";function r(){this._callbacks=null,this._contexts=null}var o=n(226),i=n(228),a=n(229);o(r.prototype,{enqueue:function(e,t){this._callbacks=this._callbacks||[],this._contexts=this._contexts||[],this._callbacks.push(e),this._contexts.push(t)},notifyAll:function(){var e=this._callbacks,t=this._contexts;if(e){e.length!==t.length?a(!1):void 0,this._callbacks=null,this._contexts=null;for(var n=0;n<e.length;n++)e[n].call(t[n]);e.length=0,t.length=0}},checkpoint:function(){return this._callbacks?this._callbacks.length:0},rollback:function(e){this._callbacks&&(this._callbacks.length=e,this._contexts.length=e)},reset:function(){this._callbacks=null,this._contexts=null},destructor:function(){this.reset()}}),i.addPoolingTo(r),e.exports=r},function(e,t){"use strict";var n={logTopLevelRenders:!1};e.exports=n},function(e,t,n){"use strict";function r(e,t,n){return n}var o={enableMeasure:!1,storedMeasure:r,measureMethods:function(e,t,n){},measure:function(e,t,n){return n},injection:{injectMeasure:function(e){o.storedMeasure=e}}};e.exports=o},function(e,t,n){"use strict";function r(){o.attachRefs(this,this._currentElement)}var o=n(282),i=(n(239),{mountComponent:function(e,t,n,o,i){var a=e.mountComponent(t,n,o,i);return e._currentElement&&null!=e._currentElement.ref&&t.getReactMountReady().enqueue(r,e),a},getNativeNode:function(e){return e.getNativeNode()},unmountComponent:function(e,t){o.detachRefs(e,e._currentElement),e.unmountComponent(t)},receiveComponent:function(e,t,n,i){var a=e._currentElement;if(t!==a||i!==e._context){var s=o.shouldUpdateRefs(a,t);s&&o.detachRefs(e,a),e.receiveComponent(t,n,i),s&&e._currentElement&&null!=e._currentElement.ref&&n.getReactMountReady().enqueue(r,e)}},performUpdateIfNecessary:function(e,t){e.performUpdateIfNecessary(t)}});e.exports=i},function(e,t,n){"use strict";function r(e,t,n){"function"==typeof e?e(t.getPublicInstance()):i.addComponentAsRefTo(t,e,n)}function o(e,t,n){"function"==typeof e?e(null):i.removeComponentAsRefFrom(t,e,n)}var i=n(283),a={};a.attachRefs=function(e,t){if(null!==t&&t!==!1){var n=t.ref;null!=n&&r(n,e,t._owner)}},a.shouldUpdateRefs=function(e,t){var n=null===e||e===!1,r=null===t||t===!1;return n||r||t._owner!==e._owner||t.ref!==e.ref},a.detachRefs=function(e,t){if(null!==t&&t!==!1){var n=t.ref;null!=n&&o(n,e,t._owner)}},e.exports=a},function(e,t,n){"use strict";var r=n(229),o={isValidOwner:function(e){return!(!e||"function"!=typeof e.attachRef||"function"!=typeof e.detachRef)},addComponentAsRefTo:function(e,t,n){o.isValidOwner(n)?void 0:r(!1),n.attachRef(t,e)},removeComponentAsRefFrom:function(e,t,n){o.isValidOwner(n)?void 0:r(!1);var i=n.getPublicInstance();i&&i.refs[t]===e.getPublicInstance()&&n.detachRef(t)}};e.exports=o},function(e,t,n){"use strict";var r=n(229),o={reinitializeTransaction:function(){this.transactionWrappers=this.getTransactionWrappers(),this.wrapperInitData?this.wrapperInitData.length=0:this.wrapperInitData=[],this._isInTransaction=!1},_isInTransaction:!1,getTransactionWrappers:null,isInTransaction:function(){return!!this._isInTransaction},perform:function(e,t,n,o,i,a,s,u){this.isInTransaction()?r(!1):void 0;var l,c;try{this._isInTransaction=!0,l=!0,this.initializeAll(0),c=e.call(t,n,o,i,a,s,u),l=!1}finally{try{if(l)try{this.closeAll(0)}catch(f){}else this.closeAll(0)}finally{this._isInTransaction=!1}}return c},initializeAll:function(e){for(var t=this.transactionWrappers,n=e;n<t.length;n++){var r=t[n];try{this.wrapperInitData[n]=i.OBSERVED_ERROR,this.wrapperInitData[n]=r.initialize?r.initialize.call(this):null}finally{if(this.wrapperInitData[n]===i.OBSERVED_ERROR)try{this.initializeAll(n+1)}catch(o){}}}},closeAll:function(e){this.isInTransaction()?void 0:r(!1);for(var t=this.transactionWrappers,n=e;n<t.length;n++){var o,a=t[n],s=this.wrapperInitData[n];try{o=!0,s!==i.OBSERVED_ERROR&&a.close&&a.close.call(this,s),o=!1}finally{if(o)try{this.closeAll(n+1)}catch(u){}}}this.wrapperInitData.length=0}},i={Mixin:o,OBSERVED_ERROR:{}};e.exports=i},function(e,t){"use strict";function n(e){var t=e.target||e.srcElement||window;return t.correspondingUseElement&&(t=t.correspondingUseElement),3===t.nodeType?t.parentNode:t}e.exports=n},function(e,t,n){"use strict";function r(e,t){if(!i.canUseDOM||t&&!("addEventListener"in document))return!1;var n="on"+e,r=n in document;if(!r){var a=document.createElement("div");a.setAttribute(n,"return;"),r="function"==typeof a[n]}return!r&&o&&"wheel"===e&&(r=document.implementation.hasFeature("Events.wheel","3.0")),r}var o,i=n(270);i.canUseDOM&&(o=document.implementation&&document.implementation.hasFeature&&document.implementation.hasFeature("","")!==!0),e.exports=r},function(e,t){"use strict";function n(e){var t=e&&e.nodeName&&e.nodeName.toLowerCase();return t&&("input"===t&&r[e.type]||"textarea"===t)}var r={color:!0,date:!0,datetime:!0,"datetime-local":!0,email:!0,month:!0,number:!0,password:!0,range:!0,search:!0,tel:!0,text:!0,time:!0,url:!0,week:!0};e.exports=n},function(e,t,n){"use strict";var r=n(247),o=[r({ResponderEventPlugin:null}),r({SimpleEventPlugin:null}),r({TapEventPlugin:null}),r({EnterLeaveEventPlugin:null}),r({ChangeEventPlugin:null}),r({SelectEventPlugin:null}),r({BeforeInputEventPlugin:null})];e.exports=o},function(e,t,n){"use strict";var r=n(262),o=n(263),i=n(257),a=n(290),s=n(247),u=r.topLevelTypes,l={mouseEnter:{registrationName:s({onMouseEnter:null}),dependencies:[u.topMouseOut,u.topMouseOver]},mouseLeave:{registrationName:s({onMouseLeave:null}),dependencies:[u.topMouseOut,u.topMouseOver]}},c={eventTypes:l,extractEvents:function(e,t,n,r){if(e===u.topMouseOver&&(n.relatedTarget||n.fromElement))return null;if(e!==u.topMouseOut&&e!==u.topMouseOver)return null;var s;if(r.window===r)s=r;else{var c=r.ownerDocument;s=c?c.defaultView||c.parentWindow:window}var f,p;if(e===u.topMouseOut){f=t;var d=n.relatedTarget||n.toElement;p=d?i.getClosestInstanceFromNode(d):null}else f=null,p=t;if(f===p)return null;var h=null==f?s:i.getNodeFromInstance(f),m=null==p?s:i.getNodeFromInstance(p),v=a.getPooled(l.mouseLeave,f,n,r);v.type="mouseleave",v.target=h,v.relatedTarget=m;var g=a.getPooled(l.mouseEnter,p,n,r);return g.type="mouseenter",g.target=m,g.relatedTarget=h,o.accumulateEnterLeaveDispatches(v,g,f,p),[v,g]}};e.exports=c},function(e,t,n){"use strict";function r(e,t,n,r){return o.call(this,e,t,n,r)}var o=n(291),i=n(292),a=n(293),s={screenX:null,screenY:null,clientX:null,clientY:null,ctrlKey:null,shiftKey:null,altKey:null,metaKey:null,getModifierState:a,button:function(e){var t=e.button;return"which"in e?t:2===t?2:4===t?1:0},buttons:null,relatedTarget:function(e){return e.relatedTarget||(e.fromElement===e.srcElement?e.toElement:e.fromElement)},pageX:function(e){return"pageX"in e?e.pageX:e.clientX+i.currentScrollLeft},pageY:function(e){return"pageY"in e?e.pageY:e.clientY+i.currentScrollTop}};o.augmentClass(r,s),e.exports=r},function(e,t,n){"use strict";function r(e,t,n,r){return o.call(this,e,t,n,r)}var o=n(274),i=n(285),a={view:function(e){if(e.view)return e.view;var t=i(e);if(null!=t&&t.window===t)return t;var n=t.ownerDocument;return n?n.defaultView||n.parentWindow:window},detail:function(e){return e.detail||0}};o.augmentClass(r,a),e.exports=r},function(e,t){"use strict";var n={currentScrollLeft:0,currentScrollTop:0,refreshScrollValues:function(e){n.currentScrollLeft=e.x,n.currentScrollTop=e.y}};e.exports=n},function(e,t){"use strict";function n(e){var t=this,n=t.nativeEvent;if(n.getModifierState)return n.getModifierState(e);var r=o[e];return r?!!n[r]:!1}function r(e){return n}var o={Alt:"altKey",Control:"ctrlKey",Meta:"metaKey",Shift:"shiftKey"};e.exports=r},function(e,t,n){"use strict";var r=n(258),o=r.injection.MUST_USE_PROPERTY,i=r.injection.HAS_BOOLEAN_VALUE,a=r.injection.HAS_SIDE_EFFECTS,s=r.injection.HAS_NUMERIC_VALUE,u=r.injection.HAS_POSITIVE_NUMERIC_VALUE,l=r.injection.HAS_OVERLOADED_BOOLEAN_VALUE,c={isCustomAttribute:RegExp.prototype.test.bind(new RegExp("^(data|aria)-["+r.ATTRIBUTE_NAME_CHAR+"]*$")),Properties:{accept:0,acceptCharset:0,accessKey:0,action:0,allowFullScreen:i,allowTransparency:0,alt:0,async:i,autoComplete:0,autoPlay:i,capture:i,cellPadding:0,cellSpacing:0,charSet:0,challenge:0,checked:o|i,cite:0,classID:0,className:0,cols:u,colSpan:0,content:0,contentEditable:0,contextMenu:0,controls:i,coords:0,crossOrigin:0,data:0,dateTime:0,"default":i,defer:i,dir:0,disabled:i,download:l,draggable:0,encType:0,form:0,formAction:0,formEncType:0,formMethod:0,formNoValidate:i,formTarget:0,frameBorder:0,headers:0,height:0,hidden:i,high:0,href:0,hrefLang:0,htmlFor:0,httpEquiv:0,icon:0,id:0,inputMode:0,integrity:0,is:0,keyParams:0,keyType:0,kind:0,label:0,lang:0,list:0,loop:i,low:0,manifest:0,marginHeight:0,marginWidth:0,max:0,maxLength:0,media:0,mediaGroup:0,method:0,min:0,minLength:0,multiple:o|i,muted:o|i,name:0,nonce:0,noValidate:i,open:i,optimum:0,pattern:0,placeholder:0,poster:0,preload:0,profile:0,radioGroup:0,readOnly:i,rel:0,required:i,reversed:i,role:0,rows:u,rowSpan:s,sandbox:0,scope:0,scoped:i,scrolling:0,seamless:i,selected:o|i,shape:0,size:u,sizes:0,span:u,spellCheck:0,src:0,srcDoc:0,srcLang:0,srcSet:0,start:s,step:0,style:0,summary:0,tabIndex:0,target:0,title:0,type:0,useMap:0,value:o|a,width:0,wmode:0,wrap:0,about:0,datatype:0,inlist:0,prefix:0,property:0,resource:0,"typeof":0,vocab:0,autoCapitalize:0,autoCorrect:0,autoSave:0,color:0,itemProp:0,itemScope:i,itemType:0,itemID:0,itemRef:0,results:0,security:0,unselectable:0},DOMAttributeNames:{acceptCharset:"accept-charset",className:"class",htmlFor:"for",httpEquiv:"http-equiv"},DOMPropertyNames:{}};e.exports=c},function(e,t,n){"use strict";var r=n(296),o=n(307),i=n(280),a={processChildrenUpdates:o.dangerouslyProcessChildrenUpdates,replaceNodeWithMarkup:r.dangerouslyReplaceNodeWithMarkup,unmountIDFromEnvironment:function(e){}};i.measureMethods(a,"ReactComponentBrowserEnvironment",{replaceNodeWithMarkup:"replaceNodeWithMarkup"}),e.exports=a},function(e,t,n){"use strict";function r(e,t){return Array.isArray(t)&&(t=t[1]),t?t.nextSibling:e.firstChild}function o(e,t,n){c.insertTreeBefore(e,t,n)}function i(e,t,n){Array.isArray(t)?s(e,t[0],t[1],n):g(e,t,n)}function a(e,t){if(Array.isArray(t)){var n=t[1];t=t[0],u(e,t,n),e.removeChild(n)}e.removeChild(t)}function s(e,t,n,r){for(var o=t;;){var i=o.nextSibling;if(g(e,o,r),o===n)break;o=i}}function u(e,t,n){for(;;){var r=t.nextSibling;if(r===n)break;e.removeChild(r)}}function l(e,t,n){var r=e.parentNode,o=e.nextSibling;o===t?n&&g(r,document.createTextNode(n),o):n?(v(o,n),u(r,o,t)):u(r,e,t)}var c=n(297),f=n(302),p=n(306),d=n(280),h=n(298),m=n(301),v=n(299),g=h(function(e,t,n){e.insertBefore(t,n)}),y={dangerouslyReplaceNodeWithMarkup:f.dangerouslyReplaceNodeWithMarkup,replaceDelimitedText:l,processUpdates:function(e,t){for(var n=0;n<t.length;n++){var s=t[n];switch(s.type){case p.INSERT_MARKUP:o(e,s.content,r(e,s.afterNode));break;case p.MOVE_EXISTING:i(e,s.fromNode,r(e,s.afterNode));break;case p.SET_MARKUP:m(e,s.content);break;case p.TEXT_CONTENT:v(e,s.content);break;case p.REMOVE_NODE:a(e,s.fromNode)}}}};d.measureMethods(y,"DOMChildrenOperations",{replaceDelimitedText:"replaceDelimitedText"}),e.exports=y},function(e,t,n){
"use strict";function r(e){if(f){var t=e.node,n=e.children;if(n.length)for(var r=0;r<n.length;r++)p(t,n[r],null);else null!=e.html?t.innerHTML=e.html:null!=e.text&&c(t,e.text)}}function o(e,t){e.parentNode.replaceChild(t.node,e),r(t)}function i(e,t){f?e.children.push(t):e.node.appendChild(t.node)}function a(e,t){f?e.html=t:e.node.innerHTML=t}function s(e,t){f?e.text=t:c(e.node,t)}function u(e){return{node:e,children:[],html:null,text:null}}var l=n(298),c=n(299),f="undefined"!=typeof document&&"number"==typeof document.documentMode||"undefined"!=typeof navigator&&"string"==typeof navigator.userAgent&&/\bEdge\/\d/.test(navigator.userAgent),p=l(function(e,t,n){11===t.node.nodeType?(r(t),e.insertBefore(t.node,n)):(e.insertBefore(t.node,n),r(t))});u.insertTreeBefore=p,u.replaceChildWithTree=o,u.queueChild=i,u.queueHTML=a,u.queueText=s,e.exports=u},function(e,t){"use strict";var n=function(e){return"undefined"!=typeof MSApp&&MSApp.execUnsafeLocalFunction?function(t,n,r,o){MSApp.execUnsafeLocalFunction(function(){return e(t,n,r,o)})}:e};e.exports=n},function(e,t,n){"use strict";var r=n(270),o=n(300),i=n(301),a=function(e,t){e.textContent=t};r.canUseDOM&&("textContent"in document.documentElement||(a=function(e,t){i(e,o(t))})),e.exports=a},function(e,t){"use strict";function n(e){return o[e]}function r(e){return(""+e).replace(i,n)}var o={"&":"&amp;",">":"&gt;","<":"&lt;",'"':"&quot;","'":"&#x27;"},i=/[&><"']/g;e.exports=r},function(e,t,n){"use strict";var r=n(270),o=/^[ \r\n\t\f]/,i=/<(!--|link|noscript|meta|script|style)[ \r\n\t\f\/>]/,a=n(298),s=a(function(e,t){e.innerHTML=t});if(r.canUseDOM){var u=document.createElement("div");u.innerHTML=" ",""===u.innerHTML&&(s=function(e,t){if(e.parentNode&&e.parentNode.replaceChild(e,e),o.test(t)||"<"===t[0]&&i.test(t)){e.innerHTML=String.fromCharCode(65279)+t;var n=e.firstChild;1===n.data.length?e.removeChild(n):n.deleteData(0,1)}else e.innerHTML=t}),u=null}e.exports=s},function(e,t,n){"use strict";function r(e){return e.substring(1,e.indexOf(" "))}var o=n(297),i=n(270),a=n(303),s=n(233),u=n(305),l=n(229),c=/^(<[^ \/>]+)/,f="data-danger-index",p={dangerouslyRenderMarkup:function(e){i.canUseDOM?void 0:l(!1);for(var t,n={},o=0;o<e.length;o++)e[o]?void 0:l(!1),t=r(e[o]),t=u(t)?t:"*",n[t]=n[t]||[],n[t][o]=e[o];var p=[],d=0;for(t in n)if(n.hasOwnProperty(t)){var h,m=n[t];for(h in m)if(m.hasOwnProperty(h)){var v=m[h];m[h]=v.replace(c,"$1 "+f+'="'+h+'" ')}for(var g=a(m.join(""),s),y=0;y<g.length;++y){var b=g[y];b.hasAttribute&&b.hasAttribute(f)&&(h=+b.getAttribute(f),b.removeAttribute(f),p.hasOwnProperty(h)?l(!1):void 0,p[h]=b,d+=1)}}return d!==p.length?l(!1):void 0,p.length!==e.length?l(!1):void 0,p},dangerouslyReplaceNodeWithMarkup:function(e,t){if(i.canUseDOM?void 0:l(!1),t?void 0:l(!1),"HTML"===e.nodeName?l(!1):void 0,"string"==typeof t){var n=a(t,s)[0];e.parentNode.replaceChild(n,e)}else o.replaceChildWithTree(e,t)}};e.exports=p},function(e,t,n){"use strict";function r(e){var t=e.match(c);return t&&t[1].toLowerCase()}function o(e,t){var n=l;l?void 0:u(!1);var o=r(e),i=o&&s(o);if(i){n.innerHTML=i[1]+e+i[2];for(var c=i[0];c--;)n=n.lastChild}else n.innerHTML=e;var f=n.getElementsByTagName("script");f.length&&(t?void 0:u(!1),a(f).forEach(t));for(var p=Array.from(n.childNodes);n.lastChild;)n.removeChild(n.lastChild);return p}var i=n(270),a=n(304),s=n(305),u=n(229),l=i.canUseDOM?document.createElement("div"):null,c=/^\s*<(\w+)/;e.exports=o},function(e,t,n){"use strict";function r(e){var t=e.length;if(Array.isArray(e)||"object"!=typeof e&&"function"!=typeof e?a(!1):void 0,"number"!=typeof t?a(!1):void 0,0===t||t-1 in e?void 0:a(!1),"function"==typeof e.callee?a(!1):void 0,e.hasOwnProperty)try{return Array.prototype.slice.call(e)}catch(n){}for(var r=Array(t),o=0;t>o;o++)r[o]=e[o];return r}function o(e){return!!e&&("object"==typeof e||"function"==typeof e)&&"length"in e&&!("setInterval"in e)&&"number"!=typeof e.nodeType&&(Array.isArray(e)||"callee"in e||"item"in e)}function i(e){return o(e)?Array.isArray(e)?e.slice():r(e):[e]}var a=n(229);e.exports=i},function(e,t,n){"use strict";function r(e){return a?void 0:i(!1),p.hasOwnProperty(e)||(e="*"),s.hasOwnProperty(e)||("*"===e?a.innerHTML="<link />":a.innerHTML="<"+e+"></"+e+">",s[e]=!a.firstChild),s[e]?p[e]:null}var o=n(270),i=n(229),a=o.canUseDOM?document.createElement("div"):null,s={},u=[1,'<select multiple="true">',"</select>"],l=[1,"<table>","</table>"],c=[3,"<table><tbody><tr>","</tr></tbody></table>"],f=[1,'<svg xmlns="http://www.w3.org/2000/svg">',"</svg>"],p={"*":[1,"?<div>","</div>"],area:[1,"<map>","</map>"],col:[2,"<table><tbody></tbody><colgroup>","</colgroup></table>"],legend:[1,"<fieldset>","</fieldset>"],param:[1,"<object>","</object>"],tr:[2,"<table><tbody>","</tbody></table>"],optgroup:u,option:u,caption:l,colgroup:l,tbody:l,tfoot:l,thead:l,td:c,th:c},d=["circle","clipPath","defs","ellipse","g","image","line","linearGradient","mask","path","pattern","polygon","polyline","radialGradient","rect","stop","text","tspan"];d.forEach(function(e){p[e]=f,s[e]=!0}),e.exports=r},function(e,t,n){"use strict";var r=n(245),o=r({INSERT_MARKUP:null,MOVE_EXISTING:null,REMOVE_NODE:null,SET_MARKUP:null,TEXT_CONTENT:null});e.exports=o},function(e,t,n){"use strict";var r=n(296),o=n(257),i=n(280),a={dangerouslyProcessChildrenUpdates:function(e,t){var n=o.getNodeFromInstance(e);r.processUpdates(n,t)}};i.measureMethods(a,"ReactDOMIDOperations",{dangerouslyProcessChildrenUpdates:"dangerouslyProcessChildrenUpdates"}),e.exports=a},function(e,t,n){"use strict";function r(e,t){t&&(z[e._tag]&&(null!=t.children||null!=t.dangerouslySetInnerHTML?M(!1):void 0),null!=t.dangerouslySetInnerHTML&&(null!=t.children?M(!1):void 0,"object"==typeof t.dangerouslySetInnerHTML&&q in t.dangerouslySetInnerHTML?void 0:M(!1)),null!=t.style&&"object"!=typeof t.style?M(!1):void 0)}function o(e,t,n,r){var o=e._nativeContainerInfo,a=o._ownerDocument;a&&(L(t,a),r.getReactMountReady().enqueue(i,{inst:e,registrationName:t,listener:n}))}function i(){var e=this;_.putListener(e.inst,e.registrationName,e.listener)}function a(){var e=this;O.postMountWrapper(e)}function s(){var e=this;e._rootNodeID?void 0:M(!1);var t=U(e);switch(t?void 0:M(!1),e._tag){case"iframe":case"object":e._wrapperState.listeners=[w.trapBubbledEvent(b.topLevelTypes.topLoad,"load",t)];break;case"video":case"audio":e._wrapperState.listeners=[];for(var n in K)K.hasOwnProperty(n)&&e._wrapperState.listeners.push(w.trapBubbledEvent(b.topLevelTypes[n],K[n],t));break;case"img":e._wrapperState.listeners=[w.trapBubbledEvent(b.topLevelTypes.topError,"error",t),w.trapBubbledEvent(b.topLevelTypes.topLoad,"load",t)];break;case"form":e._wrapperState.listeners=[w.trapBubbledEvent(b.topLevelTypes.topReset,"reset",t),w.trapBubbledEvent(b.topLevelTypes.topSubmit,"submit",t)];break;case"input":case"select":case"textarea":e._wrapperState.listeners=[w.trapBubbledEvent(b.topLevelTypes.topInvalid,"invalid",t)]}}function u(){T.postUpdateWrapper(this)}function l(e){X.call(G,e)||(Y.test(e)?void 0:M(!1),G[e]=!0)}function c(e,t){return e.indexOf("-")>=0||null!=t.is}function f(e){var t=e.type;l(t),this._currentElement=e,this._tag=t.toLowerCase(),this._namespaceURI=null,this._renderedChildren=null,this._previousStyle=null,this._previousStyleCopy=null,this._nativeNode=null,this._nativeParent=null,this._rootNodeID=null,this._domID=null,this._nativeContainerInfo=null,this._wrapperState=null,this._topLevelWrapper=null,this._flags=0}var p=n(226),d=n(309),h=n(311),m=n(297),v=n(319),g=n(258),y=n(320),b=n(262),_=n(264),C=n(265),w=n(325),x=n(295),P=n(328),E=n(259),R=n(257),S=n(329),O=n(331),T=n(332),k=n(333),N=n(334),j=n(280),A=n(300),M=n(229),F=(n(286),n(247)),I=(n(346),n(347),n(232),E),D=_.deleteListener,U=R.getNodeFromInstance,L=w.listenTo,H=C.registrationNameModules,V={string:!0,number:!0},B=F({style:null}),q=F({__html:null}),W={children:null,dangerouslySetInnerHTML:null,suppressContentEditableWarning:null},K={topAbort:"abort",topCanPlay:"canplay",topCanPlayThrough:"canplaythrough",topDurationChange:"durationchange",topEmptied:"emptied",topEncrypted:"encrypted",topEnded:"ended",topError:"error",topLoadedData:"loadeddata",topLoadedMetadata:"loadedmetadata",topLoadStart:"loadstart",topPause:"pause",topPlay:"play",topPlaying:"playing",topProgress:"progress",topRateChange:"ratechange",topSeeked:"seeked",topSeeking:"seeking",topStalled:"stalled",topSuspend:"suspend",topTimeUpdate:"timeupdate",topVolumeChange:"volumechange",topWaiting:"waiting"},Q={area:!0,base:!0,br:!0,col:!0,embed:!0,hr:!0,img:!0,input:!0,keygen:!0,link:!0,meta:!0,param:!0,source:!0,track:!0,wbr:!0},$={listing:!0,pre:!0,textarea:!0},z=p({menuitem:!0},Q),Y=/^[a-zA-Z][a-zA-Z:_\.\-\d]*$/,G={},X={}.hasOwnProperty,J=1;f.displayName="ReactDOMComponent",f.Mixin={mountComponent:function(e,t,n,o){this._rootNodeID=J++,this._domID=n._idCounter++,this._nativeParent=t,this._nativeContainerInfo=n;var i=this._currentElement.props;switch(this._tag){case"iframe":case"object":case"img":case"form":case"video":case"audio":this._wrapperState={listeners:null},e.getReactMountReady().enqueue(s,this);break;case"button":i=P.getNativeProps(this,i,t);break;case"input":S.mountWrapper(this,i,t),i=S.getNativeProps(this,i),e.getReactMountReady().enqueue(s,this);break;case"option":O.mountWrapper(this,i,t),i=O.getNativeProps(this,i);break;case"select":T.mountWrapper(this,i,t),i=T.getNativeProps(this,i),e.getReactMountReady().enqueue(s,this);break;case"textarea":k.mountWrapper(this,i,t),i=k.getNativeProps(this,i),e.getReactMountReady().enqueue(s,this)}r(this,i);var u,l;null!=t?(u=t._namespaceURI,l=t._tag):n._tag&&(u=n._namespaceURI,l=n._tag),(null==u||u===v.svg&&"foreignobject"===l)&&(u=v.html),u===v.html&&("svg"===this._tag?u=v.svg:"math"===this._tag&&(u=v.mathml)),this._namespaceURI=u;var c;if(e.useCreateElement){var f,p=n._ownerDocument;if(u===v.html)if("script"===this._tag){var h=p.createElement("div"),g=this._currentElement.type;h.innerHTML="<"+g+"></"+g+">",f=h.removeChild(h.firstChild)}else f=p.createElement(this._currentElement.type);else f=p.createElementNS(u,this._currentElement.type);R.precacheNode(this,f),this._flags|=I.hasCachedChildNodes,this._nativeParent||y.setAttributeForRoot(f),this._updateDOMProperties(null,i,e);var b=m(f);this._createInitialChildren(e,i,o,b),c=b}else{var _=this._createOpenTagMarkupAndPutListeners(e,i),C=this._createContentMarkup(e,i,o);c=!C&&Q[this._tag]?_+"/>":_+">"+C+"</"+this._currentElement.type+">"}switch(this._tag){case"button":case"input":case"select":case"textarea":i.autoFocus&&e.getReactMountReady().enqueue(d.focusDOMComponent,this);break;case"option":e.getReactMountReady().enqueue(a,this)}return c},_createOpenTagMarkupAndPutListeners:function(e,t){var n="<"+this._currentElement.type;for(var r in t)if(t.hasOwnProperty(r)){var i=t[r];if(null!=i)if(H.hasOwnProperty(r))i&&o(this,r,i,e);else{r===B&&(i&&(i=this._previousStyleCopy=p({},t.style)),i=h.createMarkupForStyles(i,this));var a=null;null!=this._tag&&c(this._tag,t)?W.hasOwnProperty(r)||(a=y.createMarkupForCustomAttribute(r,i)):a=y.createMarkupForProperty(r,i),a&&(n+=" "+a)}}return e.renderToStaticMarkup?n:(this._nativeParent||(n+=" "+y.createMarkupForRoot()),n+=" "+y.createMarkupForID(this._domID))},_createContentMarkup:function(e,t,n){var r="",o=t.dangerouslySetInnerHTML;if(null!=o)null!=o.__html&&(r=o.__html);else{var i=V[typeof t.children]?t.children:null,a=null!=i?null:t.children;if(null!=i)r=A(i);else if(null!=a){var s=this.mountChildren(a,e,n);r=s.join("")}}return $[this._tag]&&"\n"===r.charAt(0)?"\n"+r:r},_createInitialChildren:function(e,t,n,r){var o=t.dangerouslySetInnerHTML;if(null!=o)null!=o.__html&&m.queueHTML(r,o.__html);else{var i=V[typeof t.children]?t.children:null,a=null!=i?null:t.children;if(null!=i)m.queueText(r,i);else if(null!=a)for(var s=this.mountChildren(a,e,n),u=0;u<s.length;u++)m.queueChild(r,s[u])}},receiveComponent:function(e,t,n){var r=this._currentElement;this._currentElement=e,this.updateComponent(t,r,e,n)},updateComponent:function(e,t,n,o){var i=t.props,a=this._currentElement.props;switch(this._tag){case"button":i=P.getNativeProps(this,i),a=P.getNativeProps(this,a);break;case"input":S.updateWrapper(this),i=S.getNativeProps(this,i),a=S.getNativeProps(this,a);break;case"option":i=O.getNativeProps(this,i),a=O.getNativeProps(this,a);break;case"select":i=T.getNativeProps(this,i),a=T.getNativeProps(this,a);break;case"textarea":k.updateWrapper(this),i=k.getNativeProps(this,i),a=k.getNativeProps(this,a)}r(this,a),this._updateDOMProperties(i,a,e),this._updateDOMChildren(i,a,e,o),"select"===this._tag&&e.getReactMountReady().enqueue(u,this)},_updateDOMProperties:function(e,t,n){var r,i,a;for(r in e)if(!t.hasOwnProperty(r)&&e.hasOwnProperty(r)&&null!=e[r])if(r===B){var s=this._previousStyleCopy;for(i in s)s.hasOwnProperty(i)&&(a=a||{},a[i]="");this._previousStyleCopy=null}else H.hasOwnProperty(r)?e[r]&&D(this,r):(g.properties[r]||g.isCustomAttribute(r))&&y.deleteValueForProperty(U(this),r);for(r in t){var u=t[r],l=r===B?this._previousStyleCopy:null!=e?e[r]:void 0;if(t.hasOwnProperty(r)&&u!==l&&(null!=u||null!=l))if(r===B)if(u?u=this._previousStyleCopy=p({},u):this._previousStyleCopy=null,l){for(i in l)!l.hasOwnProperty(i)||u&&u.hasOwnProperty(i)||(a=a||{},a[i]="");for(i in u)u.hasOwnProperty(i)&&l[i]!==u[i]&&(a=a||{},a[i]=u[i])}else a=u;else if(H.hasOwnProperty(r))u?o(this,r,u,n):l&&D(this,r);else if(c(this._tag,t))W.hasOwnProperty(r)||y.setValueForAttribute(U(this),r,u);else if(g.properties[r]||g.isCustomAttribute(r)){var f=U(this);null!=u?y.setValueForProperty(f,r,u):y.deleteValueForProperty(f,r)}}a&&h.setValueForStyles(U(this),a,this)},_updateDOMChildren:function(e,t,n,r){var o=V[typeof e.children]?e.children:null,i=V[typeof t.children]?t.children:null,a=e.dangerouslySetInnerHTML&&e.dangerouslySetInnerHTML.__html,s=t.dangerouslySetInnerHTML&&t.dangerouslySetInnerHTML.__html,u=null!=o?null:e.children,l=null!=i?null:t.children,c=null!=o||null!=a,f=null!=i||null!=s;null!=u&&null==l?this.updateChildren(null,n,r):c&&!f&&this.updateTextContent(""),null!=i?o!==i&&this.updateTextContent(""+i):null!=s?a!==s&&this.updateMarkup(""+s):null!=l&&this.updateChildren(l,n,r)},getNativeNode:function(){return U(this)},unmountComponent:function(e){switch(this._tag){case"iframe":case"object":case"img":case"form":case"video":case"audio":var t=this._wrapperState.listeners;if(t)for(var n=0;n<t.length;n++)t[n].remove();break;case"html":case"head":case"body":M(!1)}this.unmountChildren(e),R.uncacheNode(this),_.deleteAllListeners(this),x.unmountIDFromEnvironment(this._rootNodeID),this._rootNodeID=null,this._domID=null,this._wrapperState=null},getPublicInstance:function(){return U(this)}},j.measureMethods(f.Mixin,"ReactDOMComponent",{mountComponent:"mountComponent",receiveComponent:"receiveComponent"}),p(f.prototype,f.Mixin,N.Mixin),e.exports=f},function(e,t,n){"use strict";var r=n(257),o=n(310),i={focusDOMComponent:function(){o(r.getNodeFromInstance(this))}};e.exports=i},function(e,t){"use strict";function n(e){try{e.focus()}catch(t){}}e.exports=n},function(e,t,n){"use strict";var r=n(312),o=n(270),i=n(280),a=(n(313),n(315)),s=n(316),u=n(318),l=(n(232),u(function(e){return s(e)})),c=!1,f="cssFloat";if(o.canUseDOM){var p=document.createElement("div").style;try{p.font=""}catch(d){c=!0}void 0===document.documentElement.style.cssFloat&&(f="styleFloat")}var h={createMarkupForStyles:function(e,t){var n="";for(var r in e)if(e.hasOwnProperty(r)){var o=e[r];null!=o&&(n+=l(r)+":",n+=a(r,o,t)+";")}return n||null},setValueForStyles:function(e,t,n){var o=e.style;for(var i in t)if(t.hasOwnProperty(i)){var s=a(i,t[i],n);if("float"!==i&&"cssFloat"!==i||(i=f),s)o[i]=s;else{var u=c&&r.shorthandPropertyExpansions[i];if(u)for(var l in u)o[l]="";else o[i]=""}}}};i.measureMethods(h,"CSSPropertyOperations",{setValueForStyles:"setValueForStyles"}),e.exports=h},function(e,t){"use strict";function n(e,t){return e+t.charAt(0).toUpperCase()+t.substring(1)}var r={animationIterationCount:!0,borderImageOutset:!0,borderImageSlice:!0,borderImageWidth:!0,boxFlex:!0,boxFlexGroup:!0,boxOrdinalGroup:!0,columnCount:!0,flex:!0,flexGrow:!0,flexPositive:!0,flexShrink:!0,flexNegative:!0,flexOrder:!0,gridRow:!0,gridColumn:!0,fontWeight:!0,lineClamp:!0,lineHeight:!0,opacity:!0,order:!0,orphans:!0,tabSize:!0,widows:!0,zIndex:!0,zoom:!0,fillOpacity:!0,floodOpacity:!0,stopOpacity:!0,strokeDasharray:!0,strokeDashoffset:!0,strokeMiterlimit:!0,strokeOpacity:!0,strokeWidth:!0},o=["Webkit","ms","Moz","O"];Object.keys(r).forEach(function(e){o.forEach(function(t){r[n(t,e)]=r[e]})});var i={background:{backgroundAttachment:!0,backgroundColor:!0,backgroundImage:!0,backgroundPositionX:!0,backgroundPositionY:!0,backgroundRepeat:!0},backgroundPosition:{backgroundPositionX:!0,backgroundPositionY:!0},border:{borderWidth:!0,borderStyle:!0,borderColor:!0},borderBottom:{borderBottomWidth:!0,borderBottomStyle:!0,borderBottomColor:!0},borderLeft:{borderLeftWidth:!0,borderLeftStyle:!0,borderLeftColor:!0},borderRight:{borderRightWidth:!0,borderRightStyle:!0,borderRightColor:!0},borderTop:{borderTopWidth:!0,borderTopStyle:!0,borderTopColor:!0},font:{fontStyle:!0,fontVariant:!0,fontWeight:!0,fontSize:!0,lineHeight:!0,fontFamily:!0},outline:{outlineWidth:!0,outlineStyle:!0,outlineColor:!0}},a={isUnitlessNumber:r,shorthandPropertyExpansions:i};e.exports=a},function(e,t,n){"use strict";function r(e){return o(e.replace(i,"ms-"))}var o=n(314),i=/^-ms-/;e.exports=r},function(e,t){"use strict";function n(e){return e.replace(r,function(e,t){return t.toUpperCase()})}var r=/-(.)/g;e.exports=n},function(e,t,n){"use strict";function r(e,t,n){var r=null==t||"boolean"==typeof t||""===t;if(r)return"";var o=isNaN(t);if(o||0===t||i.hasOwnProperty(e)&&i[e])return""+t;if("string"==typeof t){t=t.trim()}return t+"px"}var o=n(312),i=(n(232),o.isUnitlessNumber);e.exports=r},function(e,t,n){"use strict";function r(e){return o(e).replace(i,"-ms-")}var o=n(317),i=/^ms-/;e.exports=r},function(e,t){"use strict";function n(e){return e.replace(r,"-$1").toLowerCase()}var r=/([A-Z])/g;e.exports=n},function(e,t){"use strict";function n(e){var t={};return function(n){return t.hasOwnProperty(n)||(t[n]=e.call(this,n)),t[n]}}e.exports=n},function(e,t){"use strict";var n={html:"http://www.w3.org/1999/xhtml",mathml:"http://www.w3.org/1998/Math/MathML",svg:"http://www.w3.org/2000/svg"};e.exports=n},function(e,t,n){"use strict";function r(e){return c.hasOwnProperty(e)?!0:l.hasOwnProperty(e)?!1:u.test(e)?(c[e]=!0,!0):(l[e]=!0,!1)}function o(e,t){return null==t||e.hasBooleanValue&&!t||e.hasNumericValue&&isNaN(t)||e.hasPositiveNumericValue&&1>t||e.hasOverloadedBooleanValue&&t===!1}var i=n(258),a=(n(321),n(280)),s=n(324),u=(n(232),new RegExp("^["+i.ATTRIBUTE_NAME_START_CHAR+"]["+i.ATTRIBUTE_NAME_CHAR+"]*$")),l={},c={},f={createMarkupForID:function(e){return i.ID_ATTRIBUTE_NAME+"="+s(e)},setAttributeForID:function(e,t){e.setAttribute(i.ID_ATTRIBUTE_NAME,t)},createMarkupForRoot:function(){return i.ROOT_ATTRIBUTE_NAME+'=""'},setAttributeForRoot:function(e){e.setAttribute(i.ROOT_ATTRIBUTE_NAME,"")},createMarkupForProperty:function(e,t){var n=i.properties.hasOwnProperty(e)?i.properties[e]:null;if(n){if(o(n,t))return"";var r=n.attributeName;return n.hasBooleanValue||n.hasOverloadedBooleanValue&&t===!0?r+'=""':r+"="+s(t)}return i.isCustomAttribute(e)?null==t?"":e+"="+s(t):null},createMarkupForCustomAttribute:function(e,t){return r(e)&&null!=t?e+"="+s(t):""},setValueForProperty:function(e,t,n){var r=i.properties.hasOwnProperty(t)?i.properties[t]:null;if(r){var a=r.mutationMethod;if(a)a(e,n);else if(o(r,n))this.deleteValueForProperty(e,t);else if(r.mustUseProperty){var s=r.propertyName;r.hasSideEffects&&""+e[s]==""+n||(e[s]=n)}else{var u=r.attributeName,l=r.attributeNamespace;l?e.setAttributeNS(l,u,""+n):r.hasBooleanValue||r.hasOverloadedBooleanValue&&n===!0?e.setAttribute(u,""):e.setAttribute(u,""+n)}}else i.isCustomAttribute(t)&&f.setValueForAttribute(e,t,n)},setValueForAttribute:function(e,t,n){r(t)&&(null==n?e.removeAttribute(t):e.setAttribute(t,""+n))},deleteValueForProperty:function(e,t){var n=i.properties.hasOwnProperty(t)?i.properties[t]:null;if(n){var r=n.mutationMethod;if(r)r(e,void 0);else if(n.mustUseProperty){var o=n.propertyName;n.hasBooleanValue?e[o]=!1:n.hasSideEffects&&""+e[o]==""||(e[o]="")}else e.removeAttribute(n.attributeName)}else i.isCustomAttribute(t)&&e.removeAttribute(t)}};a.measureMethods(f,"DOMPropertyOperations",{setValueForProperty:"setValueForProperty",setValueForAttribute:"setValueForAttribute",deleteValueForProperty:"deleteValueForProperty"}),e.exports=f},function(e,t,n){"use strict";var r=n(322);e.exports={debugTool:r}},function(e,t,n){"use strict";function r(e,t,n,r,o,i){}var o=n(323),i=(n(232),[]),a={addDevtool:function(e){i.push(e)},removeDevtool:function(e){for(var t=0;t<i.length;t++)i[t]===e&&(i.splice(t,1),t--)},onCreateMarkupForProperty:function(e,t){r("onCreateMarkupForProperty",e,t)},onSetValueForProperty:function(e,t,n){r("onSetValueForProperty",e,t,n)},onDeleteValueForProperty:function(e,t){r("onDeleteValueForProperty",e,t)}};a.addDevtool(o),e.exports=a},function(e,t,n){"use strict";var r,o=(n(258),n(265),n(232),{onCreateMarkupForProperty:function(e,t){r(e)},onSetValueForProperty:function(e,t,n){r(t)},onDeleteValueForProperty:function(e,t){r(t)}});e.exports=o},function(e,t,n){"use strict";function r(e){return'"'+o(e)+'"'}var o=n(300);e.exports=r},function(e,t,n){"use strict";function r(e){return Object.prototype.hasOwnProperty.call(e,v)||(e[v]=h++,p[e[v]]={}),p[e[v]]}var o,i=n(226),a=n(262),s=n(265),u=n(326),l=n(292),c=n(327),f=n(286),p={},d=!1,h=0,m={topAbort:"abort",topAnimationEnd:c("animationend")||"animationend",topAnimationIteration:c("animationiteration")||"animationiteration",topAnimationStart:c("animationstart")||"animationstart",topBlur:"blur",topCanPlay:"canplay",topCanPlayThrough:"canplaythrough",topChange:"change",topClick:"click",topCompositionEnd:"compositionend",topCompositionStart:"compositionstart",topCompositionUpdate:"compositionupdate",topContextMenu:"contextmenu",topCopy:"copy",topCut:"cut",topDoubleClick:"dblclick",topDrag:"drag",topDragEnd:"dragend",topDragEnter:"dragenter",topDragExit:"dragexit",topDragLeave:"dragleave",topDragOver:"dragover",topDragStart:"dragstart",topDrop:"drop",topDurationChange:"durationchange",topEmptied:"emptied",topEncrypted:"encrypted",topEnded:"ended",topError:"error",topFocus:"focus",topInput:"input",topKeyDown:"keydown",topKeyPress:"keypress",topKeyUp:"keyup",topLoadedData:"loadeddata",topLoadedMetadata:"loadedmetadata",topLoadStart:"loadstart",topMouseDown:"mousedown",topMouseMove:"mousemove",topMouseOut:"mouseout",topMouseOver:"mouseover",topMouseUp:"mouseup",topPaste:"paste",topPause:"pause",topPlay:"play",topPlaying:"playing",topProgress:"progress",topRateChange:"ratechange",topScroll:"scroll",topSeeked:"seeked",topSeeking:"seeking",topSelectionChange:"selectionchange",topStalled:"stalled",topSuspend:"suspend",topTextInput:"textInput",topTimeUpdate:"timeupdate",topTouchCancel:"touchcancel",topTouchEnd:"touchend",topTouchMove:"touchmove",topTouchStart:"touchstart",topTransitionEnd:c("transitionend")||"transitionend",topVolumeChange:"volumechange",topWaiting:"waiting",topWheel:"wheel"},v="_reactListenersID"+String(Math.random()).slice(2),g=i({},u,{ReactEventListener:null,injection:{injectReactEventListener:function(e){e.setHandleTopLevel(g.handleTopLevel),g.ReactEventListener=e}},setEnabled:function(e){g.ReactEventListener&&g.ReactEventListener.setEnabled(e)},isEnabled:function(){return!(!g.ReactEventListener||!g.ReactEventListener.isEnabled())},listenTo:function(e,t){for(var n=t,o=r(n),i=s.registrationNameDependencies[e],u=a.topLevelTypes,l=0;l<i.length;l++){var c=i[l];o.hasOwnProperty(c)&&o[c]||(c===u.topWheel?f("wheel")?g.ReactEventListener.trapBubbledEvent(u.topWheel,"wheel",n):f("mousewheel")?g.ReactEventListener.trapBubbledEvent(u.topWheel,"mousewheel",n):g.ReactEventListener.trapBubbledEvent(u.topWheel,"DOMMouseScroll",n):c===u.topScroll?f("scroll",!0)?g.ReactEventListener.trapCapturedEvent(u.topScroll,"scroll",n):g.ReactEventListener.trapBubbledEvent(u.topScroll,"scroll",g.ReactEventListener.WINDOW_HANDLE):c===u.topFocus||c===u.topBlur?(f("focus",!0)?(g.ReactEventListener.trapCapturedEvent(u.topFocus,"focus",n),g.ReactEventListener.trapCapturedEvent(u.topBlur,"blur",n)):f("focusin")&&(g.ReactEventListener.trapBubbledEvent(u.topFocus,"focusin",n),g.ReactEventListener.trapBubbledEvent(u.topBlur,"focusout",n)),o[u.topBlur]=!0,o[u.topFocus]=!0):m.hasOwnProperty(c)&&g.ReactEventListener.trapBubbledEvent(c,m[c],n),o[c]=!0)}},trapBubbledEvent:function(e,t,n){return g.ReactEventListener.trapBubbledEvent(e,t,n)},trapCapturedEvent:function(e,t,n){return g.ReactEventListener.trapCapturedEvent(e,t,n)},ensureScrollValueMonitoring:function(){if(void 0===o&&(o=document.createEvent&&"pageX"in document.createEvent("MouseEvent")),!o&&!d){var e=l.refreshScrollValues;g.ReactEventListener.monitorScrollValue(e),d=!0}}});e.exports=g},function(e,t,n){"use strict";function r(e){o.enqueueEvents(e),o.processEventQueue(!1)}var o=n(264),i={handleTopLevel:function(e,t,n,i){var a=o.extractEvents(e,t,n,i);r(a)}};e.exports=i},function(e,t,n){"use strict";function r(e,t){var n={};return n[e.toLowerCase()]=t.toLowerCase(),n["Webkit"+e]="webkit"+t,n["Moz"+e]="moz"+t,n["ms"+e]="MS"+t,n["O"+e]="o"+t.toLowerCase(),n}function o(e){if(s[e])return s[e];if(!a[e])return e;var t=a[e];for(var n in t)if(t.hasOwnProperty(n)&&n in u)return s[e]=t[n];return""}var i=n(270),a={animationend:r("Animation","AnimationEnd"),animationiteration:r("Animation","AnimationIteration"),animationstart:r("Animation","AnimationStart"),transitionend:r("Transition","TransitionEnd")},s={},u={};i.canUseDOM&&(u=document.createElement("div").style,"AnimationEvent"in window||(delete a.animationend.animation,delete a.animationiteration.animation,delete a.animationstart.animation),"TransitionEvent"in window||delete a.transitionend.transition),e.exports=o},function(e,t){"use strict";var n={onClick:!0,onDoubleClick:!0,onMouseDown:!0,onMouseMove:!0,onMouseUp:!0,onClickCapture:!0,onDoubleClickCapture:!0,onMouseDownCapture:!0,onMouseMoveCapture:!0,onMouseUpCapture:!0},r={getNativeProps:function(e,t){if(!t.disabled)return t;var r={};for(var o in t)t.hasOwnProperty(o)&&!n[o]&&(r[o]=t[o]);return r}};e.exports=r},function(e,t,n){"use strict";function r(){this._rootNodeID&&f.updateWrapper(this)}function o(e){var t=this._currentElement.props,n=s.executeOnChange(t,e);l.asap(r,this);var o=t.name;if("radio"===t.type&&null!=o){for(var i=u.getNodeFromInstance(this),a=i;a.parentNode;)a=a.parentNode;for(var f=a.querySelectorAll("input[name="+JSON.stringify(""+o)+'][type="radio"]'),p=0;p<f.length;p++){var d=f[p];if(d!==i&&d.form===i.form){var h=u.getInstanceFromNode(d);h?void 0:c(!1),l.asap(r,h)}}}return n}var i=n(226),a=n(320),s=n(330),u=n(257),l=n(277),c=n(229),f=(n(232),{getNativeProps:function(e,t){var n=s.getValue(t),r=s.getChecked(t),o=i({type:void 0},t,{defaultChecked:void 0,defaultValue:void 0,value:null!=n?n:e._wrapperState.initialValue,checked:null!=r?r:e._wrapperState.initialChecked,onChange:e._wrapperState.onChange});return o},mountWrapper:function(e,t){var n=t.defaultValue;e._wrapperState={initialChecked:t.defaultChecked||!1,initialValue:null!=n?n:null,listeners:null,onChange:o.bind(e)}},updateWrapper:function(e){var t=e._currentElement.props,n=t.checked;null!=n&&a.setValueForProperty(u.getNodeFromInstance(e),"checked",n||!1);var r=s.getValue(t);null!=r&&a.setValueForProperty(u.getNodeFromInstance(e),"value",""+r)}});e.exports=f},function(e,t,n){"use strict";function r(e){null!=e.checkedLink&&null!=e.valueLink?l(!1):void 0}function o(e){r(e),null!=e.value||null!=e.onChange?l(!1):void 0}function i(e){r(e),null!=e.checked||null!=e.onChange?l(!1):void 0}function a(e){if(e){var t=e.getName();if(t)return" Check the render method of `"+t+"`."}return""}var s=n(251),u=n(244),l=n(229),c=(n(232),{button:!0,checkbox:!0,image:!0,hidden:!0,radio:!0,reset:!0,submit:!0}),f={value:function(e,t,n){return!e[t]||c[e.type]||e.onChange||e.readOnly||e.disabled?null:new Error("You provided a `value` prop to a form field without an `onChange` handler. This will render a read-only field. If the field should be mutable use `defaultValue`. Otherwise, set either `onChange` or `readOnly`.")},checked:function(e,t,n){return!e[t]||e.onChange||e.readOnly||e.disabled?null:new Error("You provided a `checked` prop to a form field without an `onChange` handler. This will render a read-only field. If the field should be mutable use `defaultChecked`. Otherwise, set either `onChange` or `readOnly`.")},onChange:s.func},p={},d={checkPropTypes:function(e,t,n){for(var r in f){if(f.hasOwnProperty(r))var o=f[r](t,r,e,u.prop);if(o instanceof Error&&!(o.message in p)){p[o.message]=!0;a(n)}}},getValue:function(e){return e.valueLink?(o(e),e.valueLink.value):e.value},getChecked:function(e){return e.checkedLink?(i(e),e.checkedLink.value):e.checked},executeOnChange:function(e,t){return e.valueLink?(o(e),e.valueLink.requestChange(t.target.value)):e.checkedLink?(i(e),e.checkedLink.requestChange(t.target.checked)):e.onChange?e.onChange.call(void 0,t):void 0}};e.exports=d},function(e,t,n){"use strict";var r=n(226),o=n(227),i=n(257),a=n(332),s=(n(232),{mountWrapper:function(e,t,n){var r=null;null!=n&&"select"===n._tag&&(r=a.getSelectValueContext(n));var o=null;if(null!=r)if(o=!1,Array.isArray(r)){for(var i=0;i<r.length;i++)if(""+r[i]==""+t.value){o=!0;break}}else o=""+r==""+t.value;e._wrapperState={selected:o}},postMountWrapper:function(e){var t=e._currentElement.props;if(null!=t.value){var n=i.getNodeFromInstance(e);n.setAttribute("value",t.value)}},getNativeProps:function(e,t){var n=r({selected:void 0,children:void 0},t);null!=e._wrapperState.selected&&(n.selected=e._wrapperState.selected);var i="";return o.forEach(t.children,function(e){null!=e&&("string"!=typeof e&&"number"!=typeof e||(i+=e))}),i&&(n.children=i),n}});e.exports=s},function(e,t,n){"use strict";function r(){if(this._rootNodeID&&this._wrapperState.pendingUpdate){this._wrapperState.pendingUpdate=!1;var e=this._currentElement.props,t=s.getValue(e);null!=t&&o(this,Boolean(e.multiple),t)}}function o(e,t,n){var r,o,i=u.getNodeFromInstance(e).options;if(t){for(r={},o=0;o<n.length;o++)r[""+n[o]]=!0;for(o=0;o<i.length;o++){var a=r.hasOwnProperty(i[o].value);i[o].selected!==a&&(i[o].selected=a)}}else{for(r=""+n,o=0;o<i.length;o++)if(i[o].value===r)return void(i[o].selected=!0);i.length&&(i[0].selected=!0)}}function i(e){var t=this._currentElement.props,n=s.executeOnChange(t,e);return this._rootNodeID&&(this._wrapperState.pendingUpdate=!0),l.asap(r,this),n}var a=n(226),s=n(330),u=n(257),l=n(277),c=(n(232),!1),f={getNativeProps:function(e,t){return a({},t,{onChange:e._wrapperState.onChange,value:void 0})},mountWrapper:function(e,t){var n=s.getValue(t);e._wrapperState={pendingUpdate:!1,initialValue:null!=n?n:t.defaultValue,listeners:null,onChange:i.bind(e),wasMultiple:Boolean(t.multiple)},void 0===t.value||void 0===t.defaultValue||c||(c=!0)},getSelectValueContext:function(e){return e._wrapperState.initialValue},postUpdateWrapper:function(e){var t=e._currentElement.props;e._wrapperState.initialValue=void 0;var n=e._wrapperState.wasMultiple;e._wrapperState.wasMultiple=Boolean(t.multiple);var r=s.getValue(t);null!=r?(e._wrapperState.pendingUpdate=!1,o(e,Boolean(t.multiple),r)):n!==Boolean(t.multiple)&&(null!=t.defaultValue?o(e,Boolean(t.multiple),t.defaultValue):o(e,Boolean(t.multiple),t.multiple?[]:""))}};e.exports=f},function(e,t,n){"use strict";function r(){this._rootNodeID&&f.updateWrapper(this)}function o(e){var t=this._currentElement.props,n=s.executeOnChange(t,e);return l.asap(r,this),n}var i=n(226),a=n(320),s=n(330),u=n(257),l=n(277),c=n(229),f=(n(232),{getNativeProps:function(e,t){null!=t.dangerouslySetInnerHTML?c(!1):void 0;var n=i({},t,{defaultValue:void 0,value:void 0,children:e._wrapperState.initialValue,onChange:e._wrapperState.onChange});return n},mountWrapper:function(e,t){var n=t.defaultValue,r=t.children;
null!=r&&(null!=n?c(!1):void 0,Array.isArray(r)&&(r.length<=1?void 0:c(!1),r=r[0]),n=""+r),null==n&&(n="");var i=s.getValue(t);e._wrapperState={initialValue:""+(null!=i?i:n),listeners:null,onChange:o.bind(e)}},updateWrapper:function(e){var t=e._currentElement.props,n=s.getValue(t);null!=n&&a.setValueForProperty(u.getNodeFromInstance(e),"value",""+n)}});e.exports=f},function(e,t,n){"use strict";function r(e,t,n){return{type:f.INSERT_MARKUP,content:e,fromIndex:null,fromNode:null,toIndex:n,afterNode:t}}function o(e,t,n){return{type:f.MOVE_EXISTING,content:null,fromIndex:e._mountIndex,fromNode:p.getNativeNode(e),toIndex:n,afterNode:t}}function i(e,t){return{type:f.REMOVE_NODE,content:null,fromIndex:e._mountIndex,fromNode:t,toIndex:null,afterNode:null}}function a(e){return{type:f.SET_MARKUP,content:e,fromIndex:null,fromNode:null,toIndex:null,afterNode:null}}function s(e){return{type:f.TEXT_CONTENT,content:e,fromIndex:null,fromNode:null,toIndex:null,afterNode:null}}function u(e,t){return t&&(e=e||[],e.push(t)),e}function l(e,t){c.processChildrenUpdates(e,t)}var c=n(335),f=n(306),p=(n(231),n(281)),d=n(336),h=n(345),m=n(229),v={Mixin:{_reconcilerInstantiateChildren:function(e,t,n){return d.instantiateChildren(e,t,n)},_reconcilerUpdateChildren:function(e,t,n,r,o){var i;return i=h(t),d.updateChildren(e,i,n,r,o),i},mountChildren:function(e,t,n){var r=this._reconcilerInstantiateChildren(e,t,n);this._renderedChildren=r;var o=[],i=0;for(var a in r)if(r.hasOwnProperty(a)){var s=r[a],u=p.mountComponent(s,t,this,this._nativeContainerInfo,n);s._mountIndex=i++,o.push(u)}return o},updateTextContent:function(e){var t=this._renderedChildren;d.unmountChildren(t,!1);for(var n in t)t.hasOwnProperty(n)&&m(!1);var r=[s(e)];l(this,r)},updateMarkup:function(e){var t=this._renderedChildren;d.unmountChildren(t,!1);for(var n in t)t.hasOwnProperty(n)&&m(!1);var r=[a(e)];l(this,r)},updateChildren:function(e,t,n){this._updateChildren(e,t,n)},_updateChildren:function(e,t,n){var r=this._renderedChildren,o={},i=this._reconcilerUpdateChildren(r,e,o,t,n);if(i||r){var a,s=null,c=0,f=0,d=null;for(a in i)if(i.hasOwnProperty(a)){var h=r&&r[a],m=i[a];h===m?(s=u(s,this.moveChild(h,d,f,c)),c=Math.max(h._mountIndex,c),h._mountIndex=f):(h&&(c=Math.max(h._mountIndex,c)),s=u(s,this._mountChildAtIndex(m,d,f,t,n))),f++,d=p.getNativeNode(m)}for(a in o)o.hasOwnProperty(a)&&(s=u(s,this._unmountChild(r[a],o[a])));s&&l(this,s),this._renderedChildren=i}},unmountChildren:function(e){var t=this._renderedChildren;d.unmountChildren(t,e),this._renderedChildren=null},moveChild:function(e,t,n,r){return e._mountIndex<r?o(e,t,n):void 0},createChild:function(e,t,n){return r(n,t,e._mountIndex)},removeChild:function(e,t){return i(e,t)},_mountChildAtIndex:function(e,t,n,r,o){var i=p.mountComponent(e,r,this,this._nativeContainerInfo,o);return e._mountIndex=n,this.createChild(e,t,i)},_unmountChild:function(e,t){var n=this.removeChild(e,t);return e._mountIndex=null,n}}};e.exports=v},function(e,t,n){"use strict";var r=n(229),o=!1,i={unmountIDFromEnvironment:null,replaceNodeWithMarkup:null,processChildrenUpdates:null,injection:{injectEnvironment:function(e){o?r(!1):void 0,i.unmountIDFromEnvironment=e.unmountIDFromEnvironment,i.replaceNodeWithMarkup=e.replaceNodeWithMarkup,i.processChildrenUpdates=e.processChildrenUpdates,o=!0}}};e.exports=i},function(e,t,n){"use strict";function r(e,t,n){var r=void 0===e[n];null!=t&&r&&(e[n]=i(t))}var o=n(281),i=n(337),a=n(342),s=n(235),u=(n(232),{instantiateChildren:function(e,t,n){if(null==e)return null;var o={};return s(e,r,o),o},updateChildren:function(e,t,n,r,s){if(t||e){var u,l;for(u in t)if(t.hasOwnProperty(u)){l=e&&e[u];var c=l&&l._currentElement,f=t[u];if(null!=l&&a(c,f))o.receiveComponent(l,f,r,s),t[u]=l;else{l&&(n[u]=o.getNativeNode(l),o.unmountComponent(l,!1));var p=i(f);t[u]=p}}for(u in e)!e.hasOwnProperty(u)||t&&t.hasOwnProperty(u)||(l=e[u],n[u]=o.getNativeNode(l),o.unmountComponent(l,!1))}},unmountChildren:function(e,t){for(var n in e)if(e.hasOwnProperty(n)){var r=e[n];o.unmountComponent(r,t)}}});e.exports=u},function(e,t,n){"use strict";function r(e){return"function"==typeof e&&"undefined"!=typeof e.prototype&&"function"==typeof e.prototype.mountComponent&&"function"==typeof e.prototype.receiveComponent}function o(e){var t;if(null===e||e===!1)t=s.create(o);else if("object"==typeof e){var n=e;!n||"function"!=typeof n.type&&"string"!=typeof n.type?l(!1):void 0,t="string"==typeof n.type?u.createInternalComponent(n):r(n.type)?new n.type(n):new c(n)}else"string"==typeof e||"number"==typeof e?t=u.createInstanceForText(e):l(!1);return t._mountIndex=0,t._mountImage=null,t}var i=n(226),a=n(338),s=n(343),u=n(344),l=n(229),c=(n(232),function(e){this.construct(e)});i(c.prototype,a.Mixin,{_instantiateReactComponent:o}),e.exports=o},function(e,t,n){"use strict";function r(e){var t=e._currentElement._owner||null;if(t){var n=t.getName();if(n)return" Check the render method of `"+n+"`."}return""}function o(e){}function i(e,t){}var a=n(226),s=n(335),u=n(231),l=n(230),c=n(267),f=n(339),p=(n(239),n(340)),d=n(280),h=n(244),m=(n(246),n(281)),v=n(341),g=n(242),y=n(229),b=n(342);n(232);o.prototype.render=function(){var e=f.get(this)._currentElement.type,t=e(this.props,this.context,this.updater);return i(e,t),t};var _=1,C={construct:function(e){this._currentElement=e,this._rootNodeID=null,this._instance=null,this._nativeParent=null,this._nativeContainerInfo=null,this._pendingElement=null,this._pendingStateQueue=null,this._pendingReplaceState=!1,this._pendingForceUpdate=!1,this._renderedNodeType=null,this._renderedComponent=null,this._context=null,this._mountOrder=0,this._topLevelWrapper=null,this._pendingCallbacks=null},mountComponent:function(e,t,n,r){this._context=r,this._mountOrder=_++,this._nativeParent=t,this._nativeContainerInfo=n;var a,s,u=this._processProps(this._currentElement.props),c=this._processContext(r),p=this._currentElement.type;p.prototype&&p.prototype.isReactComponent?a=new p(u,c,v):(a=p(u,c,v),null!=a&&null!=a.render||(s=a,i(p,s),null===a||a===!1||l.isValidElement(a)?void 0:y(!1),a=new o(p)));a.props=u,a.context=c,a.refs=g,a.updater=v,this._instance=a,f.set(a,this);var d=a.state;void 0===d&&(a.state=d=null),"object"!=typeof d||Array.isArray(d)?y(!1):void 0,this._pendingStateQueue=null,this._pendingReplaceState=!1,this._pendingForceUpdate=!1;var h;return h=a.unstable_handleError?this.performInitialMountWithErrorHandling(s,t,n,e,r):this.performInitialMount(s,t,n,e,r),a.componentDidMount&&e.getReactMountReady().enqueue(a.componentDidMount,a),h},performInitialMountWithErrorHandling:function(e,t,n,r,o){var i,a=r.checkpoint();try{i=this.performInitialMount(e,t,n,r,o)}catch(s){r.rollback(a),this._instance.unstable_handleError(s),this._pendingStateQueue&&(this._instance.state=this._processPendingState(this._instance.props,this._instance.context)),a=r.checkpoint(),this._renderedComponent.unmountComponent(!0),r.rollback(a),i=this.performInitialMount(e,t,n,r,o)}return i},performInitialMount:function(e,t,n,r,o){var i=this._instance;i.componentWillMount&&(i.componentWillMount(),this._pendingStateQueue&&(i.state=this._processPendingState(i.props,i.context))),void 0===e&&(e=this._renderValidatedComponent()),this._renderedNodeType=p.getType(e),this._renderedComponent=this._instantiateReactComponent(e);var a=m.mountComponent(this._renderedComponent,r,t,n,this._processChildContext(o));return a},getNativeNode:function(){return m.getNativeNode(this._renderedComponent)},unmountComponent:function(e){if(this._renderedComponent){var t=this._instance;if(t.componentWillUnmount)if(e){var n=this.getName()+".componentWillUnmount()";c.invokeGuardedCallback(n,t.componentWillUnmount.bind(t))}else t.componentWillUnmount();this._renderedComponent&&(m.unmountComponent(this._renderedComponent,e),this._renderedNodeType=null,this._renderedComponent=null,this._instance=null),this._pendingStateQueue=null,this._pendingReplaceState=!1,this._pendingForceUpdate=!1,this._pendingCallbacks=null,this._pendingElement=null,this._context=null,this._rootNodeID=null,this._topLevelWrapper=null,f.remove(t)}},_maskContext:function(e){var t=this._currentElement.type,n=t.contextTypes;if(!n)return g;var r={};for(var o in n)r[o]=e[o];return r},_processContext:function(e){var t=this._maskContext(e);return t},_processChildContext:function(e){var t=this._currentElement.type,n=this._instance,r=n.getChildContext&&n.getChildContext();if(r){"object"!=typeof t.childContextTypes?y(!1):void 0;for(var o in r)o in t.childContextTypes?void 0:y(!1);return a({},e,r)}return e},_processProps:function(e){return e},_checkPropTypes:function(e,t,n){var o=this.getName();for(var i in e)if(e.hasOwnProperty(i)){var a;try{"function"!=typeof e[i]?y(!1):void 0,a=e[i](t,i,o,n)}catch(s){a=s}if(a instanceof Error){r(this);n===h.prop}}},receiveComponent:function(e,t,n){var r=this._currentElement,o=this._context;this._pendingElement=null,this.updateComponent(t,r,e,o,n)},performUpdateIfNecessary:function(e){null!=this._pendingElement&&m.receiveComponent(this,this._pendingElement,e,this._context),(null!==this._pendingStateQueue||this._pendingForceUpdate)&&this.updateComponent(e,this._currentElement,this._currentElement,this._context,this._context)},updateComponent:function(e,t,n,r,o){var i,a,s=this._instance,u=!1;this._context===o?i=s.context:(i=this._processContext(o),u=!0),t===n?a=n.props:(a=this._processProps(n.props),u=!0),u&&s.componentWillReceiveProps&&s.componentWillReceiveProps(a,i);var l=this._processPendingState(a,i),c=this._pendingForceUpdate||!s.shouldComponentUpdate||s.shouldComponentUpdate(a,l,i);c?(this._pendingForceUpdate=!1,this._performComponentUpdate(n,a,l,i,e,o)):(this._currentElement=n,this._context=o,s.props=a,s.state=l,s.context=i)},_processPendingState:function(e,t){var n=this._instance,r=this._pendingStateQueue,o=this._pendingReplaceState;if(this._pendingReplaceState=!1,this._pendingStateQueue=null,!r)return n.state;if(o&&1===r.length)return r[0];for(var i=a({},o?r[0]:n.state),s=o?1:0;s<r.length;s++){var u=r[s];a(i,"function"==typeof u?u.call(n,i,e,t):u)}return i},_performComponentUpdate:function(e,t,n,r,o,i){var a,s,u,l=this._instance,c=Boolean(l.componentDidUpdate);c&&(a=l.props,s=l.state,u=l.context),l.componentWillUpdate&&l.componentWillUpdate(t,n,r),this._currentElement=e,this._context=i,l.props=t,l.state=n,l.context=r,this._updateRenderedComponent(o,i),c&&o.getReactMountReady().enqueue(l.componentDidUpdate.bind(l,a,s,u),l)},_updateRenderedComponent:function(e,t){var n=this._renderedComponent,r=n._currentElement,o=this._renderValidatedComponent();if(b(r,o))m.receiveComponent(n,o,e,this._processChildContext(t));else{var i=m.getNativeNode(n);m.unmountComponent(n,!1),this._renderedNodeType=p.getType(o),this._renderedComponent=this._instantiateReactComponent(o);var a=m.mountComponent(this._renderedComponent,e,this._nativeParent,this._nativeContainerInfo,this._processChildContext(t));this._replaceNodeWithMarkup(i,a)}},_replaceNodeWithMarkup:function(e,t){s.replaceNodeWithMarkup(e,t)},_renderValidatedComponentWithoutOwnerOrContext:function(){var e=this._instance,t=e.render();return t},_renderValidatedComponent:function(){var e;u.current=this;try{e=this._renderValidatedComponentWithoutOwnerOrContext()}finally{u.current=null}return null===e||e===!1||l.isValidElement(e)?void 0:y(!1),e},attachRef:function(e,t){var n=this.getPublicInstance();null==n?y(!1):void 0;var r=t.getPublicInstance(),o=n.refs===g?n.refs={}:n.refs;o[e]=r},detachRef:function(e){var t=this.getPublicInstance().refs;delete t[e]},getName:function(){var e=this._currentElement.type,t=this._instance&&this._instance.constructor;return e.displayName||t&&t.displayName||e.name||t&&t.name||null},getPublicInstance:function(){var e=this._instance;return e instanceof o?null:e},_instantiateReactComponent:null};d.measureMethods(C,"ReactCompositeComponent",{mountComponent:"mountComponent",updateComponent:"updateComponent",_renderValidatedComponent:"_renderValidatedComponent"});var w={Mixin:C};e.exports=w},function(e,t){"use strict";var n={remove:function(e){e._reactInternalInstance=void 0},get:function(e){return e._reactInternalInstance},has:function(e){return void 0!==e._reactInternalInstance},set:function(e,t){e._reactInternalInstance=t}};e.exports=n},function(e,t,n){"use strict";var r=n(230),o=n(229),i={NATIVE:0,COMPOSITE:1,EMPTY:2,getType:function(e){return null===e||e===!1?i.EMPTY:r.isValidElement(e)?"function"==typeof e.type?i.COMPOSITE:i.NATIVE:void o(!1)}};e.exports=i},function(e,t,n){"use strict";function r(e){a.enqueueUpdate(e)}function o(e,t){var n=i.get(e);return n?n:null}var i=(n(231),n(339)),a=n(277),s=n(229),u=(n(232),{isMounted:function(e){var t=i.get(e);return t?!!t._renderedComponent:!1},enqueueCallback:function(e,t,n){u.validateCallback(t,n);var i=o(e);return i?(i._pendingCallbacks?i._pendingCallbacks.push(t):i._pendingCallbacks=[t],void r(i)):null},enqueueCallbackInternal:function(e,t){e._pendingCallbacks?e._pendingCallbacks.push(t):e._pendingCallbacks=[t],r(e)},enqueueForceUpdate:function(e){var t=o(e,"forceUpdate");t&&(t._pendingForceUpdate=!0,r(t))},enqueueReplaceState:function(e,t){var n=o(e,"replaceState");n&&(n._pendingStateQueue=[t],n._pendingReplaceState=!0,r(n))},enqueueSetState:function(e,t){var n=o(e,"setState");if(n){var i=n._pendingStateQueue||(n._pendingStateQueue=[]);i.push(t),r(n)}},enqueueElementInternal:function(e,t){e._pendingElement=t,r(e)},validateCallback:function(e,t){e&&"function"!=typeof e?s(!1):void 0}});e.exports=u},function(e,t){"use strict";function n(e,t){var n=null===e||e===!1,r=null===t||t===!1;if(n||r)return n===r;var o=typeof e,i=typeof t;return"string"===o||"number"===o?"string"===i||"number"===i:"object"===i&&e.type===t.type&&e.key===t.key}e.exports=n},function(e,t){"use strict";var n,r={injectEmptyComponentFactory:function(e){n=e}},o={create:function(e){return n(e)}};o.injection=r,e.exports=o},function(e,t,n){"use strict";function r(e){if("function"==typeof e.type)return e.type;var t=e.type,n=f[t];return null==n&&(f[t]=n=l(t)),n}function o(e){return c?void 0:u(!1),new c(e)}function i(e){return new p(e)}function a(e){return e instanceof p}var s=n(226),u=n(229),l=null,c=null,f={},p=null,d={injectGenericComponentClass:function(e){c=e},injectTextComponentClass:function(e){p=e},injectComponentClasses:function(e){s(f,e)}},h={getComponentClassForElement:r,createInternalComponent:o,createInstanceForText:i,isTextComponent:a,injection:d};e.exports=h},function(e,t,n){"use strict";function r(e,t,n){var r=e,o=void 0===r[n];o&&null!=t&&(r[n]=t)}function o(e){if(null==e)return e;var t={};return i(e,r,t),t}var i=n(235);n(232);e.exports=o},function(e,t){"use strict";function n(e,t){return e===t?0!==e||1/e===1/t:e!==e&&t!==t}function r(e,t){if(n(e,t))return!0;if("object"!=typeof e||null===e||"object"!=typeof t||null===t)return!1;var r=Object.keys(e),i=Object.keys(t);if(r.length!==i.length)return!1;for(var a=0;a<r.length;a++)if(!o.call(t,r[a])||!n(e[r[a]],t[r[a]]))return!1;return!0}var o=Object.prototype.hasOwnProperty;e.exports=r},function(e,t,n){"use strict";var r=(n(226),n(233)),o=(n(232),r);e.exports=o},function(e,t,n){"use strict";var r=n(226),o=n(297),i=n(257),a=function(e){this._currentElement=null,this._nativeNode=null,this._nativeParent=null,this._nativeContainerInfo=null,this._domID=null};r(a.prototype,{mountComponent:function(e,t,n,r){var a=n._idCounter++;this._domID=a,this._nativeParent=t,this._nativeContainerInfo=n;var s=" react-empty: "+this._domID+" ";if(e.useCreateElement){var u=n._ownerDocument,l=u.createComment(s);return i.precacheNode(this,l),o(l)}return e.renderToStaticMarkup?"":"<!--"+s+"-->"},receiveComponent:function(){},getNativeNode:function(){return i.getNodeFromInstance(this)},unmountComponent:function(){i.uncacheNode(this)}}),e.exports=a},function(e,t,n){"use strict";function r(e,t){"_nativeNode"in e?void 0:u(!1),"_nativeNode"in t?void 0:u(!1);for(var n=0,r=e;r;r=r._nativeParent)n++;for(var o=0,i=t;i;i=i._nativeParent)o++;for(;n-o>0;)e=e._nativeParent,n--;for(;o-n>0;)t=t._nativeParent,o--;for(var a=n;a--;){if(e===t)return e;e=e._nativeParent,t=t._nativeParent}return null}function o(e,t){"_nativeNode"in e?void 0:u(!1),"_nativeNode"in t?void 0:u(!1);for(;t;){if(t===e)return!0;t=t._nativeParent}return!1}function i(e){return"_nativeNode"in e?void 0:u(!1),e._nativeParent}function a(e,t,n){for(var r=[];e;)r.push(e),e=e._nativeParent;var o;for(o=r.length;o-- >0;)t(r[o],!1,n);for(o=0;o<r.length;o++)t(r[o],!0,n)}function s(e,t,n,o,i){for(var a=e&&t?r(e,t):null,s=[];e&&e!==a;)s.push(e),e=e._nativeParent;for(var u=[];t&&t!==a;)u.push(t),t=t._nativeParent;var l;for(l=0;l<s.length;l++)n(s[l],!0,o);for(l=u.length;l-- >0;)n(u[l],!1,i)}var u=n(229);e.exports={isAncestor:o,getLowestCommonAncestor:r,getParentInstance:i,traverseTwoPhase:a,traverseEnterLeave:s}},function(e,t,n){"use strict";var r=n(226),o=n(296),i=n(297),a=n(257),s=n(280),u=n(300),l=n(229),c=(n(347),function(e){this._currentElement=e,this._stringText=""+e,this._nativeNode=null,this._nativeParent=null,this._domID=null,this._mountIndex=0,this._closingComment=null,this._commentNodes=null});r(c.prototype,{mountComponent:function(e,t,n,r){var o=n._idCounter++,s=" react-text: "+o+" ",l=" /react-text ";if(this._domID=o,this._nativeParent=t,e.useCreateElement){var c=n._ownerDocument,f=c.createComment(s),p=c.createComment(l),d=i(c.createDocumentFragment());return i.queueChild(d,i(f)),this._stringText&&i.queueChild(d,i(c.createTextNode(this._stringText))),i.queueChild(d,i(p)),a.precacheNode(this,f),this._closingComment=p,d}var h=u(this._stringText);return e.renderToStaticMarkup?h:"<!--"+s+"-->"+h+"<!--"+l+"-->"},receiveComponent:function(e,t){if(e!==this._currentElement){this._currentElement=e;var n=""+e;if(n!==this._stringText){this._stringText=n;var r=this.getNativeNode();o.replaceDelimitedText(r[0],r[1],n)}}},getNativeNode:function(){var e=this._commentNodes;if(e)return e;if(!this._closingComment)for(var t=a.getNodeFromInstance(this),n=t.nextSibling;;){if(null==n?l(!1):void 0,8===n.nodeType&&" /react-text "===n.nodeValue){this._closingComment=n;break}n=n.nextSibling}return e=[this._nativeNode,this._closingComment],this._commentNodes=e,e},unmountComponent:function(){this._closingComment=null,this._commentNodes=null,a.uncacheNode(this)}}),s.measureMethods(c.prototype,"ReactDOMTextComponent",{mountComponent:"mountComponent",receiveComponent:"receiveComponent"}),e.exports=c},function(e,t,n){"use strict";function r(){this.reinitializeTransaction()}var o=n(226),i=n(277),a=n(284),s=n(233),u={initialize:s,close:function(){p.isBatchingUpdates=!1}},l={initialize:s,close:i.flushBatchedUpdates.bind(i)},c=[l,u];o(r.prototype,a.Mixin,{getTransactionWrappers:function(){return c}});var f=new r,p={isBatchingUpdates:!1,batchedUpdates:function(e,t,n,r,o,i){var a=p.isBatchingUpdates;p.isBatchingUpdates=!0,a?e(t,n,r,o,i):f.perform(e,null,t,n,r,o,i)}};e.exports=p},function(e,t,n){"use strict";function r(e){for(;e._nativeParent;)e=e._nativeParent;var t=f.getNodeFromInstance(e),n=t.parentNode;return f.getClosestInstanceFromNode(n)}function o(e,t){this.topLevelType=e,this.nativeEvent=t,this.ancestors=[]}function i(e){var t=d(e.nativeEvent),n=f.getClosestInstanceFromNode(t),o=n;do e.ancestors.push(o),o=o&&r(o);while(o);for(var i=0;i<e.ancestors.length;i++)n=e.ancestors[i],m._handleTopLevel(e.topLevelType,n,e.nativeEvent,d(e.nativeEvent))}function a(e){var t=h(window);e(t)}var s=n(226),u=n(353),l=n(270),c=n(228),f=n(257),p=n(277),d=n(285),h=n(354);s(o.prototype,{destructor:function(){this.topLevelType=null,this.nativeEvent=null,this.ancestors.length=0}}),c.addPoolingTo(o,c.twoArgumentPooler);var m={_enabled:!0,_handleTopLevel:null,WINDOW_HANDLE:l.canUseDOM?window:null,setHandleTopLevel:function(e){m._handleTopLevel=e},setEnabled:function(e){m._enabled=!!e},isEnabled:function(){return m._enabled},trapBubbledEvent:function(e,t,n){var r=n;return r?u.listen(r,t,m.dispatchEvent.bind(null,e)):null},trapCapturedEvent:function(e,t,n){var r=n;return r?u.capture(r,t,m.dispatchEvent.bind(null,e)):null},monitorScrollValue:function(e){var t=a.bind(null,e);u.listen(window,"scroll",t)},dispatchEvent:function(e,t){if(m._enabled){var n=o.getPooled(e,t);try{p.batchedUpdates(i,n)}finally{o.release(n)}}}};e.exports=m},function(e,t,n){"use strict";var r=n(233),o={listen:function(e,t,n){return e.addEventListener?(e.addEventListener(t,n,!1),{remove:function(){e.removeEventListener(t,n,!1)}}):e.attachEvent?(e.attachEvent("on"+t,n),{remove:function(){e.detachEvent("on"+t,n)}}):void 0},capture:function(e,t,n){return e.addEventListener?(e.addEventListener(t,n,!0),{remove:function(){e.removeEventListener(t,n,!0)}}):{remove:r}},registerDefault:function(){}};e.exports=o},function(e,t){"use strict";function n(e){return e===window?{x:window.pageXOffset||document.documentElement.scrollLeft,y:window.pageYOffset||document.documentElement.scrollTop}:{x:e.scrollLeft,y:e.scrollTop}}e.exports=n},function(e,t,n){"use strict";var r=n(258),o=n(264),i=n(266),a=n(335),s=n(243),u=n(343),l=n(325),c=n(344),f=n(280),p=n(277),d={Component:a.injection,Class:s.injection,DOMProperty:r.injection,EmptyComponent:u.injection,EventPluginHub:o.injection,EventPluginUtils:i.injection,EventEmitter:l.injection,NativeComponent:c.injection,Perf:f.injection,Updates:p.injection};e.exports=d},function(e,t,n){"use strict";function r(e){this.reinitializeTransaction(),this.renderToStaticMarkup=!1,this.reactMountReady=i.getPooled(null),this.useCreateElement=e}var o=n(226),i=n(278),a=n(228),s=n(325),u=n(357),l=n(284),c={initialize:u.getSelectionInformation,close:u.restoreSelection},f={initialize:function(){var e=s.isEnabled();return s.setEnabled(!1),e},close:function(e){s.setEnabled(e)}},p={initialize:function(){this.reactMountReady.reset()},close:function(){this.reactMountReady.notifyAll()}},d=[c,f,p],h={getTransactionWrappers:function(){return d},getReactMountReady:function(){return this.reactMountReady},checkpoint:function(){return this.reactMountReady.checkpoint()},rollback:function(e){this.reactMountReady.rollback(e)},destructor:function(){i.release(this.reactMountReady),this.reactMountReady=null}};o(r.prototype,l.Mixin,h),a.addPoolingTo(r),e.exports=r},function(e,t,n){"use strict";function r(e){return i(document.documentElement,e)}var o=n(358),i=n(360),a=n(310),s=n(363),u={hasSelectionCapabilities:function(e){var t=e&&e.nodeName&&e.nodeName.toLowerCase();return t&&("input"===t&&"text"===e.type||"textarea"===t||"true"===e.contentEditable)},getSelectionInformation:function(){var e=s();return{focusedElem:e,selectionRange:u.hasSelectionCapabilities(e)?u.getSelection(e):null}},restoreSelection:function(e){var t=s(),n=e.focusedElem,o=e.selectionRange;t!==n&&r(n)&&(u.hasSelectionCapabilities(n)&&u.setSelection(n,o),a(n))},getSelection:function(e){var t;if("selectionStart"in e)t={start:e.selectionStart,end:e.selectionEnd};else if(document.selection&&e.nodeName&&"input"===e.nodeName.toLowerCase()){var n=document.selection.createRange();n.parentElement()===e&&(t={start:-n.moveStart("character",-e.value.length),end:-n.moveEnd("character",-e.value.length)})}else t=o.getOffsets(e);return t||{start:0,end:0}},setSelection:function(e,t){var n=t.start,r=t.end;if(void 0===r&&(r=n),"selectionStart"in e)e.selectionStart=n,e.selectionEnd=Math.min(r,e.value.length);else if(document.selection&&e.nodeName&&"input"===e.nodeName.toLowerCase()){var i=e.createTextRange();i.collapse(!0),i.moveStart("character",n),i.moveEnd("character",r-n),i.select()}else o.setOffsets(e,t)}};e.exports=u},function(e,t,n){"use strict";function r(e,t,n,r){return e===n&&t===r}function o(e){var t=document.selection,n=t.createRange(),r=n.text.length,o=n.duplicate();o.moveToElementText(e),o.setEndPoint("EndToStart",n);var i=o.text.length,a=i+r;return{start:i,end:a}}function i(e){var t=window.getSelection&&window.getSelection();if(!t||0===t.rangeCount)return null;var n=t.anchorNode,o=t.anchorOffset,i=t.focusNode,a=t.focusOffset,s=t.getRangeAt(0);try{s.startContainer.nodeType,s.endContainer.nodeType}catch(u){return null}var l=r(t.anchorNode,t.anchorOffset,t.focusNode,t.focusOffset),c=l?0:s.toString().length,f=s.cloneRange();f.selectNodeContents(e),f.setEnd(s.startContainer,s.startOffset);var p=r(f.startContainer,f.startOffset,f.endContainer,f.endOffset),d=p?0:f.toString().length,h=d+c,m=document.createRange();m.setStart(n,o),m.setEnd(i,a);var v=m.collapsed;return{start:v?h:d,end:v?d:h}}function a(e,t){var n,r,o=document.selection.createRange().duplicate();void 0===t.end?(n=t.start,r=n):t.start>t.end?(n=t.end,r=t.start):(n=t.start,r=t.end),o.moveToElementText(e),o.moveStart("character",n),o.setEndPoint("EndToStart",o),o.moveEnd("character",r-n),o.select()}function s(e,t){if(window.getSelection){var n=window.getSelection(),r=e[c()].length,o=Math.min(t.start,r),i=void 0===t.end?o:Math.min(t.end,r);if(!n.extend&&o>i){var a=i;i=o,o=a}var s=l(e,o),u=l(e,i);if(s&&u){var f=document.createRange();f.setStart(s.node,s.offset),n.removeAllRanges(),o>i?(n.addRange(f),n.extend(u.node,u.offset)):(f.setEnd(u.node,u.offset),n.addRange(f))}}}var u=n(270),l=n(359),c=n(272),f=u.canUseDOM&&"selection"in document&&!("getSelection"in window),p={getOffsets:f?o:i,setOffsets:f?a:s};e.exports=p},function(e,t){"use strict";function n(e){for(;e&&e.firstChild;)e=e.firstChild;return e}function r(e){for(;e;){if(e.nextSibling)return e.nextSibling;e=e.parentNode}}function o(e,t){for(var o=n(e),i=0,a=0;o;){if(3===o.nodeType){if(a=i+o.textContent.length,t>=i&&a>=t)return{node:o,offset:t-i};i=a}o=n(r(o))}}e.exports=o},function(e,t,n){"use strict";function r(e,t){return e&&t?e===t?!0:o(e)?!1:o(t)?r(e,t.parentNode):e.contains?e.contains(t):e.compareDocumentPosition?!!(16&e.compareDocumentPosition(t)):!1:!1}var o=n(361);e.exports=r},function(e,t,n){"use strict";function r(e){return o(e)&&3==e.nodeType}var o=n(362);e.exports=r},function(e,t){"use strict";function n(e){return!(!e||!("function"==typeof Node?e instanceof Node:"object"==typeof e&&"number"==typeof e.nodeType&&"string"==typeof e.nodeName))}e.exports=n},function(e,t){"use strict";function n(){if("undefined"==typeof document)return null;try{return document.activeElement||document.body}catch(e){return document.body}}e.exports=n},function(e,t){"use strict";var n={xlink:"http://www.w3.org/1999/xlink",xml:"http://www.w3.org/XML/1998/namespace"},r={accentHeight:"accent-height",accumulate:0,additive:0,alignmentBaseline:"alignment-baseline",allowReorder:"allowReorder",alphabetic:0,amplitude:0,arabicForm:"arabic-form",ascent:0,attributeName:"attributeName",attributeType:"attributeType",autoReverse:"autoReverse",azimuth:0,baseFrequency:"baseFrequency",baseProfile:"baseProfile",baselineShift:"baseline-shift",bbox:0,begin:0,bias:0,by:0,calcMode:"calcMode",capHeight:"cap-height",clip:0,clipPath:"clip-path",clipRule:"clip-rule",clipPathUnits:"clipPathUnits",colorInterpolation:"color-interpolation",colorInterpolationFilters:"color-interpolation-filters",colorProfile:"color-profile",colorRendering:"color-rendering",contentScriptType:"contentScriptType",contentStyleType:"contentStyleType",cursor:0,cx:0,cy:0,d:0,decelerate:0,descent:0,diffuseConstant:"diffuseConstant",direction:0,display:0,divisor:0,dominantBaseline:"dominant-baseline",dur:0,dx:0,dy:0,edgeMode:"edgeMode",elevation:0,enableBackground:"enable-background",end:0,exponent:0,externalResourcesRequired:"externalResourcesRequired",fill:0,fillOpacity:"fill-opacity",fillRule:"fill-rule",filter:0,filterRes:"filterRes",filterUnits:"filterUnits",floodColor:"flood-color",floodOpacity:"flood-opacity",focusable:0,fontFamily:"font-family",fontSize:"font-size",fontSizeAdjust:"font-size-adjust",fontStretch:"font-stretch",fontStyle:"font-style",fontVariant:"font-variant",fontWeight:"font-weight",format:0,from:0,fx:0,fy:0,g1:0,g2:0,glyphName:"glyph-name",glyphOrientationHorizontal:"glyph-orientation-horizontal",glyphOrientationVertical:"glyph-orientation-vertical",glyphRef:"glyphRef",gradientTransform:"gradientTransform",gradientUnits:"gradientUnits",hanging:0,horizAdvX:"horiz-adv-x",horizOriginX:"horiz-origin-x",ideographic:0,imageRendering:"image-rendering","in":0,in2:0,intercept:0,k:0,k1:0,k2:0,k3:0,k4:0,kernelMatrix:"kernelMatrix",kernelUnitLength:"kernelUnitLength",kerning:0,keyPoints:"keyPoints",keySplines:"keySplines",keyTimes:"keyTimes",lengthAdjust:"lengthAdjust",letterSpacing:"letter-spacing",lightingColor:"lighting-color",limitingConeAngle:"limitingConeAngle",local:0,markerEnd:"marker-end",markerMid:"marker-mid",markerStart:"marker-start",markerHeight:"markerHeight",markerUnits:"markerUnits",markerWidth:"markerWidth",mask:0,maskContentUnits:"maskContentUnits",maskUnits:"maskUnits",mathematical:0,mode:0,numOctaves:"numOctaves",offset:0,opacity:0,operator:0,order:0,orient:0,orientation:0,origin:0,overflow:0,overlinePosition:"overline-position",overlineThickness:"overline-thickness",paintOrder:"paint-order",panose1:"panose-1",pathLength:"pathLength",patternContentUnits:"patternContentUnits",patternTransform:"patternTransform",patternUnits:"patternUnits",pointerEvents:"pointer-events",points:0,pointsAtX:"pointsAtX",pointsAtY:"pointsAtY",pointsAtZ:"pointsAtZ",preserveAlpha:"preserveAlpha",preserveAspectRatio:"preserveAspectRatio",primitiveUnits:"primitiveUnits",r:0,radius:0,refX:"refX",refY:"refY",renderingIntent:"rendering-intent",repeatCount:"repeatCount",repeatDur:"repeatDur",requiredExtensions:"requiredExtensions",requiredFeatures:"requiredFeatures",restart:0,result:0,rotate:0,rx:0,ry:0,scale:0,seed:0,shapeRendering:"shape-rendering",slope:0,spacing:0,specularConstant:"specularConstant",specularExponent:"specularExponent",speed:0,spreadMethod:"spreadMethod",startOffset:"startOffset",stdDeviation:"stdDeviation",stemh:0,stemv:0,stitchTiles:"stitchTiles",stopColor:"stop-color",stopOpacity:"stop-opacity",strikethroughPosition:"strikethrough-position",strikethroughThickness:"strikethrough-thickness",string:0,stroke:0,strokeDasharray:"stroke-dasharray",strokeDashoffset:"stroke-dashoffset",strokeLinecap:"stroke-linecap",strokeLinejoin:"stroke-linejoin",strokeMiterlimit:"stroke-miterlimit",strokeOpacity:"stroke-opacity",strokeWidth:"stroke-width",surfaceScale:"surfaceScale",systemLanguage:"systemLanguage",tableValues:"tableValues",targetX:"targetX",targetY:"targetY",textAnchor:"text-anchor",textDecoration:"text-decoration",textRendering:"text-rendering",textLength:"textLength",to:0,transform:0,u1:0,u2:0,underlinePosition:"underline-position",underlineThickness:"underline-thickness",unicode:0,unicodeBidi:"unicode-bidi",unicodeRange:"unicode-range",unitsPerEm:"units-per-em",vAlphabetic:"v-alphabetic",vHanging:"v-hanging",vIdeographic:"v-ideographic",vMathematical:"v-mathematical",values:0,vectorEffect:"vector-effect",version:0,vertAdvY:"vert-adv-y",vertOriginX:"vert-origin-x",vertOriginY:"vert-origin-y",viewBox:"viewBox",viewTarget:"viewTarget",visibility:0,widths:0,wordSpacing:"word-spacing",writingMode:"writing-mode",x:0,xHeight:"x-height",x1:0,x2:0,xChannelSelector:"xChannelSelector",xlinkActuate:"xlink:actuate",xlinkArcrole:"xlink:arcrole",xlinkHref:"xlink:href",xlinkRole:"xlink:role",xlinkShow:"xlink:show",xlinkTitle:"xlink:title",xlinkType:"xlink:type",xmlBase:"xml:base",xmlLang:"xml:lang",xmlSpace:"xml:space",y:0,y1:0,y2:0,yChannelSelector:"yChannelSelector",z:0,zoomAndPan:"zoomAndPan"},o={Properties:{},DOMAttributeNamespaces:{xlinkActuate:n.xlink,xlinkArcrole:n.xlink,xlinkHref:n.xlink,xlinkRole:n.xlink,xlinkShow:n.xlink,xlinkTitle:n.xlink,xlinkType:n.xlink,xmlBase:n.xml,xmlLang:n.xml,xmlSpace:n.xml},DOMAttributeNames:{}};Object.keys(r).map(function(e){o.Properties[e]=0,r[e]&&(o.DOMAttributeNames[e]=r[e])}),e.exports=o},function(e,t,n){"use strict";function r(e){if("selectionStart"in e&&l.hasSelectionCapabilities(e))return{start:e.selectionStart,end:e.selectionEnd};if(window.getSelection){var t=window.getSelection();return{anchorNode:t.anchorNode,anchorOffset:t.anchorOffset,focusNode:t.focusNode,focusOffset:t.focusOffset}}if(document.selection){var n=document.selection.createRange();return{parentElement:n.parentElement(),
text:n.text,top:n.boundingTop,left:n.boundingLeft}}}function o(e,t){if(C||null==y||y!==f())return null;var n=r(y);if(!_||!h(_,n)){_=n;var o=c.getPooled(g.select,b,e,t);return o.type="select",o.target=y,a.accumulateTwoPhaseDispatches(o),o}return null}var i=n(262),a=n(263),s=n(270),u=n(257),l=n(357),c=n(274),f=n(363),p=n(287),d=n(247),h=n(346),m=i.topLevelTypes,v=s.canUseDOM&&"documentMode"in document&&document.documentMode<=11,g={select:{phasedRegistrationNames:{bubbled:d({onSelect:null}),captured:d({onSelectCapture:null})},dependencies:[m.topBlur,m.topContextMenu,m.topFocus,m.topKeyDown,m.topMouseDown,m.topMouseUp,m.topSelectionChange]}},y=null,b=null,_=null,C=!1,w=!1,x=d({onSelect:null}),P={eventTypes:g,extractEvents:function(e,t,n,r){if(!w)return null;var i=t?u.getNodeFromInstance(t):window;switch(e){case m.topFocus:(p(i)||"true"===i.contentEditable)&&(y=i,b=t,_=null);break;case m.topBlur:y=null,b=null,_=null;break;case m.topMouseDown:C=!0;break;case m.topContextMenu:case m.topMouseUp:return C=!1,o(n,r);case m.topSelectionChange:if(v)break;case m.topKeyDown:case m.topKeyUp:return o(n,r)}return null},didPutListener:function(e,t,n){t===x&&(w=!0)}};e.exports=P},function(e,t,n){"use strict";var r=n(262),o=n(353),i=n(263),a=n(257),s=n(367),u=n(368),l=n(274),c=n(369),f=n(370),p=n(290),d=n(373),h=n(374),m=n(375),v=n(291),g=n(376),y=n(233),b=n(371),_=n(229),C=n(247),w=r.topLevelTypes,x={abort:{phasedRegistrationNames:{bubbled:C({onAbort:!0}),captured:C({onAbortCapture:!0})}},animationEnd:{phasedRegistrationNames:{bubbled:C({onAnimationEnd:!0}),captured:C({onAnimationEndCapture:!0})}},animationIteration:{phasedRegistrationNames:{bubbled:C({onAnimationIteration:!0}),captured:C({onAnimationIterationCapture:!0})}},animationStart:{phasedRegistrationNames:{bubbled:C({onAnimationStart:!0}),captured:C({onAnimationStartCapture:!0})}},blur:{phasedRegistrationNames:{bubbled:C({onBlur:!0}),captured:C({onBlurCapture:!0})}},canPlay:{phasedRegistrationNames:{bubbled:C({onCanPlay:!0}),captured:C({onCanPlayCapture:!0})}},canPlayThrough:{phasedRegistrationNames:{bubbled:C({onCanPlayThrough:!0}),captured:C({onCanPlayThroughCapture:!0})}},click:{phasedRegistrationNames:{bubbled:C({onClick:!0}),captured:C({onClickCapture:!0})}},contextMenu:{phasedRegistrationNames:{bubbled:C({onContextMenu:!0}),captured:C({onContextMenuCapture:!0})}},copy:{phasedRegistrationNames:{bubbled:C({onCopy:!0}),captured:C({onCopyCapture:!0})}},cut:{phasedRegistrationNames:{bubbled:C({onCut:!0}),captured:C({onCutCapture:!0})}},doubleClick:{phasedRegistrationNames:{bubbled:C({onDoubleClick:!0}),captured:C({onDoubleClickCapture:!0})}},drag:{phasedRegistrationNames:{bubbled:C({onDrag:!0}),captured:C({onDragCapture:!0})}},dragEnd:{phasedRegistrationNames:{bubbled:C({onDragEnd:!0}),captured:C({onDragEndCapture:!0})}},dragEnter:{phasedRegistrationNames:{bubbled:C({onDragEnter:!0}),captured:C({onDragEnterCapture:!0})}},dragExit:{phasedRegistrationNames:{bubbled:C({onDragExit:!0}),captured:C({onDragExitCapture:!0})}},dragLeave:{phasedRegistrationNames:{bubbled:C({onDragLeave:!0}),captured:C({onDragLeaveCapture:!0})}},dragOver:{phasedRegistrationNames:{bubbled:C({onDragOver:!0}),captured:C({onDragOverCapture:!0})}},dragStart:{phasedRegistrationNames:{bubbled:C({onDragStart:!0}),captured:C({onDragStartCapture:!0})}},drop:{phasedRegistrationNames:{bubbled:C({onDrop:!0}),captured:C({onDropCapture:!0})}},durationChange:{phasedRegistrationNames:{bubbled:C({onDurationChange:!0}),captured:C({onDurationChangeCapture:!0})}},emptied:{phasedRegistrationNames:{bubbled:C({onEmptied:!0}),captured:C({onEmptiedCapture:!0})}},encrypted:{phasedRegistrationNames:{bubbled:C({onEncrypted:!0}),captured:C({onEncryptedCapture:!0})}},ended:{phasedRegistrationNames:{bubbled:C({onEnded:!0}),captured:C({onEndedCapture:!0})}},error:{phasedRegistrationNames:{bubbled:C({onError:!0}),captured:C({onErrorCapture:!0})}},focus:{phasedRegistrationNames:{bubbled:C({onFocus:!0}),captured:C({onFocusCapture:!0})}},input:{phasedRegistrationNames:{bubbled:C({onInput:!0}),captured:C({onInputCapture:!0})}},invalid:{phasedRegistrationNames:{bubbled:C({onInvalid:!0}),captured:C({onInvalidCapture:!0})}},keyDown:{phasedRegistrationNames:{bubbled:C({onKeyDown:!0}),captured:C({onKeyDownCapture:!0})}},keyPress:{phasedRegistrationNames:{bubbled:C({onKeyPress:!0}),captured:C({onKeyPressCapture:!0})}},keyUp:{phasedRegistrationNames:{bubbled:C({onKeyUp:!0}),captured:C({onKeyUpCapture:!0})}},load:{phasedRegistrationNames:{bubbled:C({onLoad:!0}),captured:C({onLoadCapture:!0})}},loadedData:{phasedRegistrationNames:{bubbled:C({onLoadedData:!0}),captured:C({onLoadedDataCapture:!0})}},loadedMetadata:{phasedRegistrationNames:{bubbled:C({onLoadedMetadata:!0}),captured:C({onLoadedMetadataCapture:!0})}},loadStart:{phasedRegistrationNames:{bubbled:C({onLoadStart:!0}),captured:C({onLoadStartCapture:!0})}},mouseDown:{phasedRegistrationNames:{bubbled:C({onMouseDown:!0}),captured:C({onMouseDownCapture:!0})}},mouseMove:{phasedRegistrationNames:{bubbled:C({onMouseMove:!0}),captured:C({onMouseMoveCapture:!0})}},mouseOut:{phasedRegistrationNames:{bubbled:C({onMouseOut:!0}),captured:C({onMouseOutCapture:!0})}},mouseOver:{phasedRegistrationNames:{bubbled:C({onMouseOver:!0}),captured:C({onMouseOverCapture:!0})}},mouseUp:{phasedRegistrationNames:{bubbled:C({onMouseUp:!0}),captured:C({onMouseUpCapture:!0})}},paste:{phasedRegistrationNames:{bubbled:C({onPaste:!0}),captured:C({onPasteCapture:!0})}},pause:{phasedRegistrationNames:{bubbled:C({onPause:!0}),captured:C({onPauseCapture:!0})}},play:{phasedRegistrationNames:{bubbled:C({onPlay:!0}),captured:C({onPlayCapture:!0})}},playing:{phasedRegistrationNames:{bubbled:C({onPlaying:!0}),captured:C({onPlayingCapture:!0})}},progress:{phasedRegistrationNames:{bubbled:C({onProgress:!0}),captured:C({onProgressCapture:!0})}},rateChange:{phasedRegistrationNames:{bubbled:C({onRateChange:!0}),captured:C({onRateChangeCapture:!0})}},reset:{phasedRegistrationNames:{bubbled:C({onReset:!0}),captured:C({onResetCapture:!0})}},scroll:{phasedRegistrationNames:{bubbled:C({onScroll:!0}),captured:C({onScrollCapture:!0})}},seeked:{phasedRegistrationNames:{bubbled:C({onSeeked:!0}),captured:C({onSeekedCapture:!0})}},seeking:{phasedRegistrationNames:{bubbled:C({onSeeking:!0}),captured:C({onSeekingCapture:!0})}},stalled:{phasedRegistrationNames:{bubbled:C({onStalled:!0}),captured:C({onStalledCapture:!0})}},submit:{phasedRegistrationNames:{bubbled:C({onSubmit:!0}),captured:C({onSubmitCapture:!0})}},suspend:{phasedRegistrationNames:{bubbled:C({onSuspend:!0}),captured:C({onSuspendCapture:!0})}},timeUpdate:{phasedRegistrationNames:{bubbled:C({onTimeUpdate:!0}),captured:C({onTimeUpdateCapture:!0})}},touchCancel:{phasedRegistrationNames:{bubbled:C({onTouchCancel:!0}),captured:C({onTouchCancelCapture:!0})}},touchEnd:{phasedRegistrationNames:{bubbled:C({onTouchEnd:!0}),captured:C({onTouchEndCapture:!0})}},touchMove:{phasedRegistrationNames:{bubbled:C({onTouchMove:!0}),captured:C({onTouchMoveCapture:!0})}},touchStart:{phasedRegistrationNames:{bubbled:C({onTouchStart:!0}),captured:C({onTouchStartCapture:!0})}},transitionEnd:{phasedRegistrationNames:{bubbled:C({onTransitionEnd:!0}),captured:C({onTransitionEndCapture:!0})}},volumeChange:{phasedRegistrationNames:{bubbled:C({onVolumeChange:!0}),captured:C({onVolumeChangeCapture:!0})}},waiting:{phasedRegistrationNames:{bubbled:C({onWaiting:!0}),captured:C({onWaitingCapture:!0})}},wheel:{phasedRegistrationNames:{bubbled:C({onWheel:!0}),captured:C({onWheelCapture:!0})}}},P={topAbort:x.abort,topAnimationEnd:x.animationEnd,topAnimationIteration:x.animationIteration,topAnimationStart:x.animationStart,topBlur:x.blur,topCanPlay:x.canPlay,topCanPlayThrough:x.canPlayThrough,topClick:x.click,topContextMenu:x.contextMenu,topCopy:x.copy,topCut:x.cut,topDoubleClick:x.doubleClick,topDrag:x.drag,topDragEnd:x.dragEnd,topDragEnter:x.dragEnter,topDragExit:x.dragExit,topDragLeave:x.dragLeave,topDragOver:x.dragOver,topDragStart:x.dragStart,topDrop:x.drop,topDurationChange:x.durationChange,topEmptied:x.emptied,topEncrypted:x.encrypted,topEnded:x.ended,topError:x.error,topFocus:x.focus,topInput:x.input,topInvalid:x.invalid,topKeyDown:x.keyDown,topKeyPress:x.keyPress,topKeyUp:x.keyUp,topLoad:x.load,topLoadedData:x.loadedData,topLoadedMetadata:x.loadedMetadata,topLoadStart:x.loadStart,topMouseDown:x.mouseDown,topMouseMove:x.mouseMove,topMouseOut:x.mouseOut,topMouseOver:x.mouseOver,topMouseUp:x.mouseUp,topPaste:x.paste,topPause:x.pause,topPlay:x.play,topPlaying:x.playing,topProgress:x.progress,topRateChange:x.rateChange,topReset:x.reset,topScroll:x.scroll,topSeeked:x.seeked,topSeeking:x.seeking,topStalled:x.stalled,topSubmit:x.submit,topSuspend:x.suspend,topTimeUpdate:x.timeUpdate,topTouchCancel:x.touchCancel,topTouchEnd:x.touchEnd,topTouchMove:x.touchMove,topTouchStart:x.touchStart,topTransitionEnd:x.transitionEnd,topVolumeChange:x.volumeChange,topWaiting:x.waiting,topWheel:x.wheel};for(var E in P)P[E].dependencies=[E];var R=C({onClick:null}),S={},O={eventTypes:x,extractEvents:function(e,t,n,r){var o=P[e];if(!o)return null;var a;switch(e){case w.topAbort:case w.topCanPlay:case w.topCanPlayThrough:case w.topDurationChange:case w.topEmptied:case w.topEncrypted:case w.topEnded:case w.topError:case w.topInput:case w.topInvalid:case w.topLoad:case w.topLoadedData:case w.topLoadedMetadata:case w.topLoadStart:case w.topPause:case w.topPlay:case w.topPlaying:case w.topProgress:case w.topRateChange:case w.topReset:case w.topSeeked:case w.topSeeking:case w.topStalled:case w.topSubmit:case w.topSuspend:case w.topTimeUpdate:case w.topVolumeChange:case w.topWaiting:a=l;break;case w.topKeyPress:if(0===b(n))return null;case w.topKeyDown:case w.topKeyUp:a=f;break;case w.topBlur:case w.topFocus:a=c;break;case w.topClick:if(2===n.button)return null;case w.topContextMenu:case w.topDoubleClick:case w.topMouseDown:case w.topMouseMove:case w.topMouseOut:case w.topMouseOver:case w.topMouseUp:a=p;break;case w.topDrag:case w.topDragEnd:case w.topDragEnter:case w.topDragExit:case w.topDragLeave:case w.topDragOver:case w.topDragStart:case w.topDrop:a=d;break;case w.topTouchCancel:case w.topTouchEnd:case w.topTouchMove:case w.topTouchStart:a=h;break;case w.topAnimationEnd:case w.topAnimationIteration:case w.topAnimationStart:a=s;break;case w.topTransitionEnd:a=m;break;case w.topScroll:a=v;break;case w.topWheel:a=g;break;case w.topCopy:case w.topCut:case w.topPaste:a=u}a?void 0:_(!1);var y=a.getPooled(o,t,n,r);return i.accumulateTwoPhaseDispatches(y),y},didPutListener:function(e,t,n){if(t===R){var r=e._rootNodeID,i=a.getNodeFromInstance(e);S[r]||(S[r]=o.listen(i,"click",y))}},willDeleteListener:function(e,t){if(t===R){var n=e._rootNodeID;S[n].remove(),delete S[n]}}};e.exports=O},function(e,t,n){"use strict";function r(e,t,n,r){return o.call(this,e,t,n,r)}var o=n(274),i={animationName:null,elapsedTime:null,pseudoElement:null};o.augmentClass(r,i),e.exports=r},function(e,t,n){"use strict";function r(e,t,n,r){return o.call(this,e,t,n,r)}var o=n(274),i={clipboardData:function(e){return"clipboardData"in e?e.clipboardData:window.clipboardData}};o.augmentClass(r,i),e.exports=r},function(e,t,n){"use strict";function r(e,t,n,r){return o.call(this,e,t,n,r)}var o=n(291),i={relatedTarget:null};o.augmentClass(r,i),e.exports=r},function(e,t,n){"use strict";function r(e,t,n,r){return o.call(this,e,t,n,r)}var o=n(291),i=n(371),a=n(372),s=n(293),u={key:a,location:null,ctrlKey:null,shiftKey:null,altKey:null,metaKey:null,repeat:null,locale:null,getModifierState:s,charCode:function(e){return"keypress"===e.type?i(e):0},keyCode:function(e){return"keydown"===e.type||"keyup"===e.type?e.keyCode:0},which:function(e){return"keypress"===e.type?i(e):"keydown"===e.type||"keyup"===e.type?e.keyCode:0}};o.augmentClass(r,u),e.exports=r},function(e,t){"use strict";function n(e){var t,n=e.keyCode;return"charCode"in e?(t=e.charCode,0===t&&13===n&&(t=13)):t=n,t>=32||13===t?t:0}e.exports=n},function(e,t,n){"use strict";function r(e){if(e.key){var t=i[e.key]||e.key;if("Unidentified"!==t)return t}if("keypress"===e.type){var n=o(e);return 13===n?"Enter":String.fromCharCode(n)}return"keydown"===e.type||"keyup"===e.type?a[e.keyCode]||"Unidentified":""}var o=n(371),i={Esc:"Escape",Spacebar:" ",Left:"ArrowLeft",Up:"ArrowUp",Right:"ArrowRight",Down:"ArrowDown",Del:"Delete",Win:"OS",Menu:"ContextMenu",Apps:"ContextMenu",Scroll:"ScrollLock",MozPrintableKey:"Unidentified"},a={8:"Backspace",9:"Tab",12:"Clear",13:"Enter",16:"Shift",17:"Control",18:"Alt",19:"Pause",20:"CapsLock",27:"Escape",32:" ",33:"PageUp",34:"PageDown",35:"End",36:"Home",37:"ArrowLeft",38:"ArrowUp",39:"ArrowRight",40:"ArrowDown",45:"Insert",46:"Delete",112:"F1",113:"F2",114:"F3",115:"F4",116:"F5",117:"F6",118:"F7",119:"F8",120:"F9",121:"F10",122:"F11",123:"F12",144:"NumLock",145:"ScrollLock",224:"Meta"};e.exports=r},function(e,t,n){"use strict";function r(e,t,n,r){return o.call(this,e,t,n,r)}var o=n(290),i={dataTransfer:null};o.augmentClass(r,i),e.exports=r},function(e,t,n){"use strict";function r(e,t,n,r){return o.call(this,e,t,n,r)}var o=n(291),i=n(293),a={touches:null,targetTouches:null,changedTouches:null,altKey:null,metaKey:null,ctrlKey:null,shiftKey:null,getModifierState:i};o.augmentClass(r,a),e.exports=r},function(e,t,n){"use strict";function r(e,t,n,r){return o.call(this,e,t,n,r)}var o=n(274),i={propertyName:null,elapsedTime:null,pseudoElement:null};o.augmentClass(r,i),e.exports=r},function(e,t,n){"use strict";function r(e,t,n,r){return o.call(this,e,t,n,r)}var o=n(290),i={deltaX:function(e){return"deltaX"in e?e.deltaX:"wheelDeltaX"in e?-e.wheelDeltaX:0},deltaY:function(e){return"deltaY"in e?e.deltaY:"wheelDeltaY"in e?-e.wheelDeltaY:"wheelDelta"in e?-e.wheelDelta:0},deltaZ:null,deltaMode:null};o.augmentClass(r,i),e.exports=r},function(e,t,n){"use strict";function r(e,t){for(var n=Math.min(e.length,t.length),r=0;n>r;r++)if(e.charAt(r)!==t.charAt(r))return r;return e.length===t.length?-1:n}function o(e){return e?e.nodeType===A?e.documentElement:e.firstChild:null}function i(e){return e.getAttribute&&e.getAttribute(k)||""}function a(e,t,n,r,o){var i;if(b.logTopLevelRenders){var a=e._currentElement.props,s=a.type;i="React mount: "+("string"==typeof s?s:s.displayName||s.name),console.time(i)}var u=w.mountComponent(e,n,null,v(e,t),o);i&&console.timeEnd(i),e._renderedComponent._topLevelWrapper=e,U._mountImageIntoNode(u,t,e,r,n)}function s(e,t,n,r){var o=P.ReactReconcileTransaction.getPooled(!n&&g.useCreateElement);o.perform(a,null,e,t,o,n,r),P.ReactReconcileTransaction.release(o)}function u(e,t,n){for(w.unmountComponent(e,n),t.nodeType===A&&(t=t.documentElement);t.lastChild;)t.removeChild(t.lastChild)}function l(e){var t=o(e);if(t){var n=m.getInstanceFromNode(t);return!(!n||!n._nativeParent)}}function c(e){var t=o(e),n=t&&m.getInstanceFromNode(t);return n&&!n._nativeParent?n:null}function f(e){var t=c(e);return t?t._nativeContainerInfo._topLevelWrapper:null}var p=n(297),d=n(258),h=n(325),m=(n(231),n(257)),v=n(378),g=n(379),y=n(230),b=n(279),_=(n(239),n(380)),C=n(280),w=n(281),x=n(341),P=n(277),E=n(242),R=n(337),S=n(229),O=n(301),T=n(342),k=(n(232),d.ID_ATTRIBUTE_NAME),N=d.ROOT_ATTRIBUTE_NAME,j=1,A=9,M=11,F={},I=1,D=function(){this.rootID=I++};D.prototype.isReactComponent={},D.prototype.render=function(){return this.props};var U={TopLevelWrapper:D,_instancesByReactRootID:F,scrollMonitor:function(e,t){t()},_updateRootComponent:function(e,t,n,r){return U.scrollMonitor(n,function(){x.enqueueElementInternal(e,t),r&&x.enqueueCallbackInternal(e,r)}),e},_renderNewRootComponent:function(e,t,n,r){!t||t.nodeType!==j&&t.nodeType!==A&&t.nodeType!==M?S(!1):void 0,h.ensureScrollValueMonitoring();var o=R(e);P.batchedUpdates(s,o,t,n,r);var i=o._instance.rootID;return F[i]=o,o},renderSubtreeIntoContainer:function(e,t,n,r){return null==e||null==e._reactInternalInstance?S(!1):void 0,U._renderSubtreeIntoContainer(e,t,n,r)},_renderSubtreeIntoContainer:function(e,t,n,r){x.validateCallback(r,"ReactDOM.render"),y.isValidElement(t)?void 0:S(!1);var a=y(D,null,null,null,null,null,t),s=f(n);if(s){var u=s._currentElement,c=u.props;if(T(c,t)){var p=s._renderedComponent.getPublicInstance(),d=r&&function(){r.call(p)};return U._updateRootComponent(s,a,n,d),p}U.unmountComponentAtNode(n)}var h=o(n),m=h&&!!i(h),v=l(n),g=m&&!s&&!v,b=U._renderNewRootComponent(a,n,g,null!=e?e._reactInternalInstance._processChildContext(e._reactInternalInstance._context):E)._renderedComponent.getPublicInstance();return r&&r.call(b),b},render:function(e,t,n){return U._renderSubtreeIntoContainer(null,e,t,n)},unmountComponentAtNode:function(e){!e||e.nodeType!==j&&e.nodeType!==A&&e.nodeType!==M?S(!1):void 0;var t=f(e);if(!t){l(e),1===e.nodeType&&e.hasAttribute(N);return!1}return delete F[t._instance.rootID],P.batchedUpdates(u,t,e,!1),!0},_mountImageIntoNode:function(e,t,n,i,a){if(!t||t.nodeType!==j&&t.nodeType!==A&&t.nodeType!==M?S(!1):void 0,i){var s=o(t);if(_.canReuseMarkup(e,s))return void m.precacheNode(n,s);var u=s.getAttribute(_.CHECKSUM_ATTR_NAME);s.removeAttribute(_.CHECKSUM_ATTR_NAME);var l=s.outerHTML;s.setAttribute(_.CHECKSUM_ATTR_NAME,u);var c=e,f=r(c,l);" (client) "+c.substring(f-20,f+20)+"\n (server) "+l.substring(f-20,f+20);t.nodeType===A?S(!1):void 0}if(t.nodeType===A?S(!1):void 0,a.useCreateElement){for(;t.lastChild;)t.removeChild(t.lastChild);p.insertTreeBefore(t,e,null)}else O(t,e),m.precacheNode(n,t.firstChild)}};C.measureMethods(U,"ReactMount",{_renderNewRootComponent:"_renderNewRootComponent",_mountImageIntoNode:"_mountImageIntoNode"}),e.exports=U},function(e,t,n){"use strict";function r(e,t){var n={_topLevelWrapper:e,_idCounter:1,_ownerDocument:t?t.nodeType===o?t:t.ownerDocument:null,_tag:t?t.nodeName.toLowerCase():null,_namespaceURI:t?t.namespaceURI:null};return n}var o=(n(347),9);e.exports=r},function(e,t){"use strict";var n={useCreateElement:!0};e.exports=n},function(e,t,n){"use strict";var r=n(381),o=/\/?>/,i=/^<\!\-\-/,a={CHECKSUM_ATTR_NAME:"data-react-checksum",addChecksumToMarkup:function(e){var t=r(e);return i.test(e)?e:e.replace(o," "+a.CHECKSUM_ATTR_NAME+'="'+t+'"$&')},canReuseMarkup:function(e,t){var n=t.getAttribute(a.CHECKSUM_ATTR_NAME);n=n&&parseInt(n,10);var o=r(e);return o===n}};e.exports=a},function(e,t){"use strict";function n(e){for(var t=1,n=0,o=0,i=e.length,a=-4&i;a>o;){for(var s=Math.min(o+4096,a);s>o;o+=4)n+=(t+=e.charCodeAt(o))+(t+=e.charCodeAt(o+1))+(t+=e.charCodeAt(o+2))+(t+=e.charCodeAt(o+3));t%=r,n%=r}for(;i>o;o++)n+=t+=e.charCodeAt(o);return t%=r,n%=r,t|n<<16}var r=65521;e.exports=n},function(e,t,n){"use strict";function r(e){if(null==e)return null;if(1===e.nodeType)return e;var t=i.get(e);return t?(t=a(t),t?o.getNodeFromInstance(t):null):void s(("function"==typeof e.render,!1))}var o=(n(231),n(257)),i=n(339),a=n(383),s=n(229);n(232);e.exports=r},function(e,t,n){"use strict";function r(e){for(var t;(t=e._renderedNodeType)===o.COMPOSITE;)e=e._renderedComponent;return t===o.NATIVE?e._renderedComponent:t===o.EMPTY?null:void 0}var o=n(340);e.exports=r},function(e,t,n){"use strict";var r=n(377);e.exports=r.renderSubtreeIntoContainer},function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{"default":e}}function o(e){if(Array.isArray(e)){for(var t=0,n=Array(e.length);t<e.length;t++)n[t]=e[t];return n}return Array.from(e)}function i(e){var t="string"==typeof e,n=void 0;if(n=t?document.querySelector(e):e,!a(n)){var r="Container must be `string` or `HTMLElement`.";throw t&&(r+=" Unable to find "+e),new Error(r)}return n}function a(e){return e instanceof HTMLElement||!!e&&e.nodeType>0}function s(e){var t=1===e.button;return t||e.altKey||e.ctrlKey||e.metaKey||e.shiftKey}function u(e){return function(t,n){return t||n?t&&!n?e+"--"+t:t&&n?e+"--"+t+"__"+n:!t&&n?e+"__"+n:void 0:e}}function l(e){var t=e.transformData,n=e.defaultTemplates,r=e.templates,o=e.templatesConfig,i=c(n,r);return v({transformData:t,templatesConfig:o},i)}function c(){var e=arguments.length<=0||void 0===arguments[0]?{}:arguments[0],t=arguments.length<=1||void 0===arguments[1]?{}:arguments[1],n=(0,k["default"])([].concat(o((0,O["default"])(e)),o((0,O["default"])(t))));return(0,y["default"])(n,function(n,r){var o=e[r],i=t[r],a=void 0!==i&&i!==o;return n.templates[r]=a?i:o,n.useCustomCompileOptions[r]=a,n},{templates:{},useCustomCompileOptions:{}})}function f(e,t,n,r,o){var i={type:t,attributeName:n,name:r},a=(0,w["default"])(o,{name:n}),s=void 0;if("hierarchical"===t){var u=e.getHierarchicalFacetByName(n),l=r.split(u.separator);i.name=l[l.length-1];for(var c=0;void 0!==a&&c<l.length;++c)a=(0,w["default"])(a.data,{name:l[c]});s=(0,P["default"])(a,"count")}else s=(0,P["default"])(a,'data["'+i.name+'"]');var f=(0,P["default"])(a,"exhaustive");return void 0!==s&&(i.count=s),void 0!==f&&(i.exhaustive=f),i}function p(e,t){var n=[];return(0,_["default"])(t.facetsRefinements,function(r,o){(0,_["default"])(r,function(r){n.push(f(t,"facet",o,r,e.facets))})}),(0,_["default"])(t.facetsExcludes,function(e,t){(0,_["default"])(e,function(e){n.push({type:"exclude",attributeName:t,name:e,exclude:!0})})}),(0,_["default"])(t.disjunctiveFacetsRefinements,function(r,o){(0,_["default"])(r,function(r){n.push(f(t,"disjunctive",o,r,e.disjunctiveFacets))})}),(0,_["default"])(t.hierarchicalFacetsRefinements,function(r,o){(0,_["default"])(r,function(r){n.push(f(t,"hierarchical",o,r,e.hierarchicalFacets))})}),(0,_["default"])(t.numericRefinements,function(e,t){(0,_["default"])(e,function(e,r){(0,_["default"])(e,function(e){n.push({type:"numeric",attributeName:t,name:e+"",numericValue:e,operator:r})})})}),(0,_["default"])(t.tagRefinements,function(e){n.push({type:"tag",attributeName:"_tags",name:e})}),n}function d(e,t){return(0,R["default"])(t)?(e=e.clearTags(),e=e.clearRefinements()):((0,_["default"])(t,function(t){e="_tags"===t?e.clearTags():e.clearRefinements(t)}),e)}function h(e,t){e.setState(d(e.state,t)).search()}function m(e,t){return t?(0,j["default"])(t,function(t,n){return e+n}):void 0}Object.defineProperty(t,"__esModule",{value:!0}),t.prefixKeys=t.clearRefinementsAndSearch=t.clearRefinementsFromState=t.getRefinements=t.isDomElement=t.isSpecialClick=t.prepareTemplateProps=t.bemHelper=t.getContainerNode=void 0;var v=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var r in n)Object.prototype.hasOwnProperty.call(n,r)&&(e[r]=n[r])}return e},g=n(114),y=r(g),b=n(15),_=r(b),C=n(131),w=r(C),x=n(386),P=r(x),E=n(127),R=r(E),S=n(23),O=r(S),T=n(387),k=r(T),N=n(213),j=r(N);t.getContainerNode=i,t.bemHelper=u,t.prepareTemplateProps=l,t.isSpecialClick=s,t.isDomElement=a,t.getRefinements=p,t.clearRefinementsFromState=d,t.clearRefinementsAndSearch=h,t.prefixKeys=m},function(e,t,n){function r(e,t,n){var r=null==e?void 0:o(e,i(t),t+"");return void 0===r?n:r}var o=n(71),i=n(75);e.exports=r},function(e,t,n){function r(e,t,n,r){var u=e?e.length:0;return u?(null!=t&&"boolean"!=typeof t&&(r=n,n=a(e,t,r)?void 0:t,t=!1),n=null==n?n:o(n,r,3),t?s(e,n):i(e,n)):[]}var o=n(57),i=n(218),a=n(54),s=n(388);e.exports=r},function(e,t){function n(e,t){for(var n,r=-1,o=e.length,i=-1,a=[];++r<o;){var s=e[r],u=t?t(s,r,e):s;r&&n===u||(n=u,a[++i]=s)}return a}e.exports=n},function(e,t,n){var r,o;!function(){"use strict";function n(){for(var e=[],t=0;t<arguments.length;t++){var r=arguments[t];if(r){var o=typeof r;if("string"===o||"number"===o)e.push(r);else if(Array.isArray(r))e.push(n.apply(null,r));else if("object"===o)for(var a in r)i.call(r,a)&&r[a]&&e.push(a)}}return e.join(" ")}var i={}.hasOwnProperty;"undefined"!=typeof e&&e.exports?e.exports=n:(r=[],o=function(){return n}.apply(t,r),!(void 0!==o&&(e.exports=o)))}()},function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{"default":e}}function o(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function i(e,t){if(!e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!t||"object"!=typeof t&&"function"!=typeof t?e:t}function a(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function, not "+typeof t);e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),t&&(Object.setPrototypeOf?Object.setPrototypeOf(e,t):e.__proto__=t)}function s(e){var t=function(t){function n(){return o(this,n),i(this,Object.getPrototypeOf(n).apply(this,arguments))}return a(n,t),u(n,[{key:"componentDidMount",value:function(){this._hideOrShowContainer(this.props)}},{key:"componentWillReceiveProps",value:function(e){this.props.shouldAutoHideContainer!==e.shouldAutoHideContainer&&this._hideOrShowContainer(e)}},{key:"shouldComponentUpdate",value:function(e){return e.shouldAutoHideContainer===!1}},{key:"_hideOrShowContainer",value:function(e){var t=p["default"].findDOMNode(this).parentNode;t.style.display=e.shouldAutoHideContainer===!0?"none":""}},{key:"render",value:function(){return c["default"].createElement(e,this.props)}}]),n}(c["default"].Component);return t.displayName=e.name+"-AutoHide",t}Object.defineProperty(t,"__esModule",{value:!0});var u=function(){function e(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(t,n,r){return n&&e(t.prototype,n),r&&e(t,r),t}}(),l=n(223),c=r(l),f=n(254),p=r(f);t["default"]=s},function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{"default":e}}function o(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function i(e,t){if(!e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!t||"object"!=typeof t&&"function"!=typeof t?e:t}function a(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function, not "+typeof t);e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),t&&(Object.setPrototypeOf?Object.setPrototypeOf(e,t):e.__proto__=t)}function s(e){var t=function(t){function n(e){o(this,n);var t=i(this,Object.getPrototypeOf(n).call(this,e));return t.handleHeaderClick=t.handleHeaderClick.bind(t),t.state={collapsed:e.collapsible&&e.collapsible.collapsed},t._headerElement=t._getElement({type:"header",handleClick:e.collapsible?t.handleHeaderClick:null}),t._cssClasses={root:(0,h["default"])("ais-root",t.props.cssClasses.root),body:(0,h["default"])("ais-body",t.props.cssClasses.body)},t._footerElement=t._getElement({type:"footer"}),t}return a(n,t),c(n,[{key:"shouldComponentUpdate",value:function(e,t){return t.collapsed===!1||t!==this.state}},{key:"_getElement",value:function(e){var t=e.type,n=e.handleClick,r=void 0===n?null:n,o=this.props.templateProps.templates;if(!o||!o[t])return null;var i=(0,h["default"])(this.props.cssClasses[t],"ais-"+t);return p["default"].createElement(v["default"],l({},this.props.templateProps,{rootProps:{className:i,onClick:r},templateKey:t,transformData:null}))}},{key:"handleHeaderClick",value:function(){this.setState({collapsed:!this.state.collapsed})}},{key:"render",value:function(){var t=[this._cssClasses.root];this.props.collapsible&&t.push("ais-root__collapsible"),this.state.collapsed&&t.push("ais-root__collapsed");var n=l({},this._cssClasses,{root:(0,h["default"])(t)});return u("div",{className:n.root},void 0,this._headerElement,u("div",{className:n.body},void 0,p["default"].createElement(e,this.props)),this._footerElement)}}]),n}(p["default"].Component);return t.defaultProps={cssClasses:{},collapsible:!1},t.displayName=e.name+"-HeaderFooter",t}Object.defineProperty(t,"__esModule",{value:!0});var u=function(){var e="function"==typeof Symbol&&Symbol["for"]&&Symbol["for"]("react.element")||60103;return function(t,n,r,o){var i=t&&t.defaultProps,a=arguments.length-3;if(n||0===a||(n={}),n&&i)for(var s in i)void 0===n[s]&&(n[s]=i[s]);else n||(n=i||{});if(1===a)n.children=o;else if(a>1){for(var u=Array(a),l=0;a>l;l++)u[l]=arguments[l+3];n.children=u}return{$$typeof:e,type:t,key:void 0===r?null:""+r,ref:null,props:n,_owner:null}}}(),l=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var r in n)Object.prototype.hasOwnProperty.call(n,r)&&(e[r]=n[r])}return e},c=function(){function e(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(t,n,r){return n&&e(t.prototype,n),r&&e(t,r),t}}(),f=n(223),p=r(f),d=n(389),h=r(d),m=n(392),v=r(m);t["default"]=s},function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{"default":e}}function o(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function i(e,t){if(!e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!t||"object"!=typeof t&&"function"!=typeof t?e:t}function a(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function, not "+typeof t);e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),t&&(Object.setPrototypeOf?Object.setPrototypeOf(e,t):e.__proto__=t)}function s(e,t,n){if(!e)return n;var r=(0,y["default"])(n),o=void 0,i="undefined"==typeof e?"undefined":c(e);if("function"===i)o=e(r);else{if("object"!==i)throw new Error("transformData must be a function or an object, was "+i+" (key : "+t+")");o=e[t]?e[t](r):n}var a="undefined"==typeof o?"undefined":c(o),s="undefined"==typeof n?"undefined":c(n);if(a!==s)throw new Error("`transformData` must return a `"+s+"`, got `"+a+"`.");return o}function u(e){var t=e.templates,n=e.templateKey,r=e.compileOptions,o=e.helpers,i=e.data,a=t[n],s="undefined"==typeof a?"undefined":c(a),u="string"===s,p="function"===s;if(u||p){if(p)return a(i);var d=l(o,r,i),h=f({},i,{helpers:d});return w["default"].compile(a,r).render(h)}throw new Error("Template must be 'string' or 'function', was '"+s+"' (key: "+n+")")}function l(e,t,n){return(0,_["default"])(e,function(e){return(0,v["default"])(function(r){var o=this,i=function(e){return w["default"].compile(e,t).render(o)};return e.call(n,r,i)})})}Object.defineProperty(t,"__esModule",{value:!0});var c="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol?"symbol":typeof e},f=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var r in n)Object.prototype.hasOwnProperty.call(n,r)&&(e[r]=n[r])}return e},p=function(){function e(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(t,n,r){return n&&e(t.prototype,n),r&&e(t,r),t}}(),d=n(223),h=r(d),m=n(393),v=r(m),g=n(96),y=r(g),b=n(215),_=r(b),C=n(395),w=r(C),x=n(129),P=r(x),E=function(e){function t(e){return o(this,t),i(this,Object.getPrototypeOf(t).call(this,e))}return a(t,e),p(t,[{key:"shouldComponentUpdate",value:function(e){return!(0,P["default"])(this.props.data,e.data)||this.props.templateKey!==e.templateKey}},{key:"render",value:function(){var e=this.props.useCustomCompileOptions[this.props.templateKey],t=e?this.props.templatesConfig.compileOptions:{},n=u({templates:this.props.templates,templateKey:this.props.templateKey,compileOptions:t,helpers:this.props.templatesConfig.helpers,data:s(this.props.transformData,this.props.templateKey,this.props.data)});return null===n?null:h["default"].isValidElement(n)?h["default"].createElement("div",this.props.rootProps,n):h["default"].createElement("div",f({},this.props.rootProps,{dangerouslySetInnerHTML:{__html:n}}))}}]),t}(h["default"].Component);E.defaultProps={data:{},useCustomCompileOptions:{},templates:{},templatesConfig:{}},t["default"]=E},function(e,t,n){var r=n(394),o=8,i=r(o);i.placeholder={},e.exports=i},function(e,t,n){function r(e){function t(n,r,a){a&&i(n,r,a)&&(r=void 0);var s=o(n,e,void 0,void 0,void 0,void 0,void 0,r);
return s.placeholder=t.placeholder,s}return t}var o=n(144),i=n(54);e.exports=r},function(e,t,n){var r=n(396);r.Template=n(397).Template,r.template=r.Template,e.exports=r},function(e,t,n){!function(e){function t(e){"}"===e.n.substr(e.n.length-1)&&(e.n=e.n.substring(0,e.n.length-1))}function n(e){return e.trim?e.trim():e.replace(/^\s*|\s*$/g,"")}function r(e,t,n){if(t.charAt(n)!=e.charAt(0))return!1;for(var r=1,o=e.length;o>r;r++)if(t.charAt(n+r)!=e.charAt(r))return!1;return!0}function o(t,n,r,s){var u=[],l=null,c=null,f=null;for(c=r[r.length-1];t.length>0;){if(f=t.shift(),c&&"<"==c.tag&&!(f.tag in C))throw new Error("Illegal content in < super tag.");if(e.tags[f.tag]<=e.tags.$||i(f,s))r.push(f),f.nodes=o(t,f.tag,r,s);else{if("/"==f.tag){if(0===r.length)throw new Error("Closing tag without opener: /"+f.n);if(l=r.pop(),f.n!=l.n&&!a(f.n,l.n,s))throw new Error("Nesting error: "+l.n+" vs. "+f.n);return l.end=f.i,u}"\n"==f.tag&&(f.last=0==t.length||"\n"==t[0].tag)}u.push(f)}if(r.length>0)throw new Error("missing closing tag: "+r.pop().n);return u}function i(e,t){for(var n=0,r=t.length;r>n;n++)if(t[n].o==e.n)return e.tag="#",!0}function a(e,t,n){for(var r=0,o=n.length;o>r;r++)if(n[r].c==e&&n[r].o==t)return!0}function s(e){var t=[];for(var n in e)t.push('"'+l(n)+'": function(c,p,t,i) {'+e[n]+"}");return"{ "+t.join(",")+" }"}function u(e){var t=[];for(var n in e.partials)t.push('"'+l(n)+'":{name:"'+l(e.partials[n].name)+'", '+u(e.partials[n])+"}");return"partials: {"+t.join(",")+"}, subs: "+s(e.subs)}function l(e){return e.replace(y,"\\\\").replace(m,'\\"').replace(v,"\\n").replace(g,"\\r").replace(b,"\\u2028").replace(_,"\\u2029")}function c(e){return~e.indexOf(".")?"d":"f"}function f(e,t){var n="<"+(t.prefix||""),r=n+e.n+w++;return t.partials[r]={name:e.n,partials:{}},t.code+='t.b(t.rp("'+l(r)+'",c,p,"'+(e.indent||"")+'"));',r}function p(e,t){t.code+="t.b(t.t(t."+c(e.n)+'("'+l(e.n)+'",c,p,0)));'}function d(e){return"t.b("+e+");"}var h=/\S/,m=/\"/g,v=/\n/g,g=/\r/g,y=/\\/g,b=/\u2028/,_=/\u2029/;e.tags={"#":1,"^":2,"<":3,$:4,"/":5,"!":6,">":7,"=":8,_v:9,"{":10,"&":11,_t:12},e.scan=function(o,i){function a(){y.length>0&&(b.push({tag:"_t",text:new String(y)}),y="")}function s(){for(var t=!0,n=w;n<b.length;n++)if(t=e.tags[b[n].tag]<e.tags._v||"_t"==b[n].tag&&null===b[n].text.match(h),!t)return!1;return t}function u(e,t){if(a(),e&&s())for(var n,r=w;r<b.length;r++)b[r].text&&((n=b[r+1])&&">"==n.tag&&(n.indent=b[r].text.toString()),b.splice(r,1));else t||b.push({tag:"\n"});_=!1,w=b.length}function l(e,t){var r="="+P,o=e.indexOf(r,t),i=n(e.substring(e.indexOf("=",t)+1,o)).split(" ");return x=i[0],P=i[i.length-1],o+r.length-1}var c=o.length,f=0,p=1,d=2,m=f,v=null,g=null,y="",b=[],_=!1,C=0,w=0,x="{{",P="}}";for(i&&(i=i.split(" "),x=i[0],P=i[1]),C=0;c>C;C++)m==f?r(x,o,C)?(--C,a(),m=p):"\n"==o.charAt(C)?u(_):y+=o.charAt(C):m==p?(C+=x.length-1,g=e.tags[o.charAt(C+1)],v=g?o.charAt(C+1):"_v","="==v?(C=l(o,C),m=f):(g&&C++,m=d),_=C):r(P,o,C)?(b.push({tag:v,n:n(y),otag:x,ctag:P,i:"/"==v?_-x.length:C+P.length}),y="",C+=P.length-1,m=f,"{"==v&&("}}"==P?C++:t(b[b.length-1]))):y+=o.charAt(C);return u(_,!0),b};var C={_t:!0,"\n":!0,$:!0,"/":!0};e.stringify=function(t,n,r){return"{code: function (c,p,i) { "+e.wrapMain(t.code)+" },"+u(t)+"}"};var w=0;e.generate=function(t,n,r){w=0;var o={code:"",subs:{},partials:{}};return e.walk(t,o),r.asString?this.stringify(o,n,r):this.makeTemplate(o,n,r)},e.wrapMain=function(e){return'var t=this;t.b(i=i||"");'+e+"return t.fl();"},e.template=e.Template,e.makeTemplate=function(e,t,n){var r=this.makePartials(e);return r.code=new Function("c","p","i",this.wrapMain(e.code)),new this.template(r,t,this,n)},e.makePartials=function(e){var t,n={subs:{},partials:e.partials,name:e.name};for(t in n.partials)n.partials[t]=this.makePartials(n.partials[t]);for(t in e.subs)n.subs[t]=new Function("c","p","t","i",e.subs[t]);return n},e.codegen={"#":function(t,n){n.code+="if(t.s(t."+c(t.n)+'("'+l(t.n)+'",c,p,1),c,p,0,'+t.i+","+t.end+',"'+t.otag+" "+t.ctag+'")){t.rs(c,p,function(c,p,t){',e.walk(t.nodes,n),n.code+="});c.pop();}"},"^":function(t,n){n.code+="if(!t.s(t."+c(t.n)+'("'+l(t.n)+'",c,p,1),c,p,1,0,0,"")){',e.walk(t.nodes,n),n.code+="};"},">":f,"<":function(t,n){var r={partials:{},code:"",subs:{},inPartial:!0};e.walk(t.nodes,r);var o=n.partials[f(t,n)];o.subs=r.subs,o.partials=r.partials},$:function(t,n){var r={subs:{},code:"",partials:n.partials,prefix:t.n};e.walk(t.nodes,r),n.subs[t.n]=r.code,n.inPartial||(n.code+='t.sub("'+l(t.n)+'",c,p,i);')},"\n":function(e,t){t.code+=d('"\\n"'+(e.last?"":" + i"))},_v:function(e,t){t.code+="t.b(t.v(t."+c(e.n)+'("'+l(e.n)+'",c,p,0)));'},_t:function(e,t){t.code+=d('"'+l(e.text)+'"')},"{":p,"&":p},e.walk=function(t,n){for(var r,o=0,i=t.length;i>o;o++)r=e.codegen[t[o].tag],r&&r(t[o],n);return n},e.parse=function(e,t,n){return n=n||{},o(e,"",[],n.sectionTags||[])},e.cache={},e.cacheKey=function(e,t){return[e,!!t.asString,!!t.disableLambda,t.delimiters,!!t.modelGet].join("||")},e.compile=function(t,n){n=n||{};var r=e.cacheKey(t,n),o=this.cache[r];if(o){var i=o.partials;for(var a in i)delete i[a].instance;return o}return o=this.generate(this.parse(this.scan(t,n.delimiters),t,n),t,n),this.cache[r]=o}}(t)},function(e,t,n){!function(e){function t(e,t,n){var r;return t&&"object"==typeof t&&(void 0!==t[e]?r=t[e]:n&&t.get&&"function"==typeof t.get&&(r=t.get(e))),r}function n(e,t,n,r,o,i){function a(){}function s(){}a.prototype=e,s.prototype=e.subs;var u,l=new a;l.subs=new s,l.subsText={},l.buf="",r=r||{},l.stackSubs=r,l.subsText=i;for(u in t)r[u]||(r[u]=t[u]);for(u in r)l.subs[u]=r[u];o=o||{},l.stackPartials=o;for(u in n)o[u]||(o[u]=n[u]);for(u in o)l.partials[u]=o[u];return l}function r(e){return String(null===e||void 0===e?"":e)}function o(e){return e=r(e),c.test(e)?e.replace(i,"&amp;").replace(a,"&lt;").replace(s,"&gt;").replace(u,"&#39;").replace(l,"&quot;"):e}e.Template=function(e,t,n,r){e=e||{},this.r=e.code||this.r,this.c=n,this.options=r||{},this.text=t||"",this.partials=e.partials||{},this.subs=e.subs||{},this.buf=""},e.Template.prototype={r:function(e,t,n){return""},v:o,t:r,render:function(e,t,n){return this.ri([e],t||{},n)},ri:function(e,t,n){return this.r(e,t,n)},ep:function(e,t){var r=this.partials[e],o=t[r.name];if(r.instance&&r.base==o)return r.instance;if("string"==typeof o){if(!this.c)throw new Error("No compiler available.");o=this.c.compile(o,this.options)}if(!o)return null;if(this.partials[e].base=o,r.subs){t.stackText||(t.stackText={});for(key in r.subs)t.stackText[key]||(t.stackText[key]=void 0!==this.activeSub&&t.stackText[this.activeSub]?t.stackText[this.activeSub]:this.text);o=n(o,r.subs,r.partials,this.stackSubs,this.stackPartials,t.stackText)}return this.partials[e].instance=o,o},rp:function(e,t,n,r){var o=this.ep(e,n);return o?o.ri(t,n,r):""},rs:function(e,t,n){var r=e[e.length-1];if(!f(r))return void n(e,t,this);for(var o=0;o<r.length;o++)e.push(r[o]),n(e,t,this),e.pop()},s:function(e,t,n,r,o,i,a){var s;return f(e)&&0===e.length?!1:("function"==typeof e&&(e=this.ms(e,t,n,r,o,i,a)),s=!!e,!r&&s&&t&&t.push("object"==typeof e?e:t[t.length-1]),s)},d:function(e,n,r,o){var i,a=e.split("."),s=this.f(a[0],n,r,o),u=this.options.modelGet,l=null;if("."===e&&f(n[n.length-2]))s=n[n.length-1];else for(var c=1;c<a.length;c++)i=t(a[c],s,u),void 0!==i?(l=s,s=i):s="";return o&&!s?!1:(o||"function"!=typeof s||(n.push(l),s=this.mv(s,n,r),n.pop()),s)},f:function(e,n,r,o){for(var i=!1,a=null,s=!1,u=this.options.modelGet,l=n.length-1;l>=0;l--)if(a=n[l],i=t(e,a,u),void 0!==i){s=!0;break}return s?(o||"function"!=typeof i||(i=this.mv(i,n,r)),i):o?!1:""},ls:function(e,t,n,o,i){var a=this.options.delimiters;return this.options.delimiters=i,this.b(this.ct(r(e.call(t,o)),t,n)),this.options.delimiters=a,!1},ct:function(e,t,n){if(this.options.disableLambda)throw new Error("Lambda features disabled.");return this.c.compile(e,this.options).render(t,n)},b:function(e){this.buf+=e},fl:function(){var e=this.buf;return this.buf="",e},ms:function(e,t,n,r,o,i,a){var s,u=t[t.length-1],l=e.call(u);return"function"==typeof l?r?!0:(s=this.activeSub&&this.subsText&&this.subsText[this.activeSub]?this.subsText[this.activeSub]:this.text,this.ls(l,u,n,s.substring(o,i),a)):l},mv:function(e,t,n){var o=t[t.length-1],i=e.call(o);return"function"==typeof i?this.ct(r(i.call(o)),o,n):i},sub:function(e,t,n,r){var o=this.subs[e];o&&(this.activeSub=e,o(t,n,this,r),this.activeSub=!1)}};var i=/&/g,a=/</g,s=/>/g,u=/\'/g,l=/\"/g,c=/[&<>\"\']/,f=Array.isArray||function(e){return"[object Array]"===Object.prototype.toString.call(e)}}(t)},function(e,t){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t["default"]={header:"",link:"Clear all",footer:""}},function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{"default":e}}function o(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function i(e,t){if(!e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!t||"object"!=typeof t&&"function"!=typeof t?e:t}function a(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function, not "+typeof t);e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),t&&(Object.setPrototypeOf?Object.setPrototypeOf(e,t):e.__proto__=t)}Object.defineProperty(t,"__esModule",{value:!0});var s=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var r in n)Object.prototype.hasOwnProperty.call(n,r)&&(e[r]=n[r])}return e},u=function(){var e="function"==typeof Symbol&&Symbol["for"]&&Symbol["for"]("react.element")||60103;return function(t,n,r,o){var i=t&&t.defaultProps,a=arguments.length-3;if(n||0===a||(n={}),n&&i)for(var s in i)void 0===n[s]&&(n[s]=i[s]);else n||(n=i||{});if(1===a)n.children=o;else if(a>1){for(var u=Array(a),l=0;a>l;l++)u[l]=arguments[l+3];n.children=u}return{$$typeof:e,type:t,key:void 0===r?null:""+r,ref:null,props:n,_owner:null}}}(),l=function(){function e(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(t,n,r){return n&&e(t.prototype,n),r&&e(t,r),t}}(),c=n(223),f=r(c),p=n(392),d=r(p),h=n(385),m=function(e){function t(){return o(this,t),i(this,Object.getPrototypeOf(t).apply(this,arguments))}return a(t,e),l(t,[{key:"componentWillMount",value:function(){this.handleClick=this.handleClick.bind(this)}},{key:"shouldComponentUpdate",value:function(e){return this.props.url!==e.url||this.props.hasRefinements!==e.hasRefinements}},{key:"handleClick",value:function(e){(0,h.isSpecialClick)(e)||(e.preventDefault(),this.props.clearAll())}},{key:"render",value:function(){var e={hasRefinements:this.props.hasRefinements};return u("a",{className:this.props.cssClasses.link,href:this.props.url,onClick:this.handleClick},void 0,f["default"].createElement(d["default"],s({data:e,templateKey:"link"},this.props.templateProps)))}}]),t}(f["default"].Component);t["default"]=m},function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{"default":e}}function o(e){var t=e.container,n=e.attributes,r=void 0===n?[]:n,o=e.onlyListedAttributes,i=void 0===o?!1:o,a=e.clearAll,f=void 0===a?"before":a,p=e.templates,m=void 0===p?B["default"]:p,g=e.collapsible,b=void 0===g?!1:g,C=e.transformData,x=e.autoHideContainer,E=void 0===x?!0:x,S=e.cssClasses,T=void 0===S?{}:S,k=(0,P["default"])(r)&&(0,M["default"])(r,function(e,t){return e&&(0,R["default"])(t)&&(0,w["default"])(t.name)&&((0,y["default"])(t.label)||(0,w["default"])(t.label))&&((0,y["default"])(t.template)||(0,w["default"])(t.template)||(0,O["default"])(t.template))&&((0,y["default"])(t.transformData)||(0,O["default"])(t.transformData))},!0),N=["header","item","clearAll","footer"],A=(0,R["default"])(m)&&(0,M["default"])(m,function(e,t,n){return e&&-1!==N.indexOf(n)&&((0,w["default"])(t)||(0,O["default"])(t))},!0),F=["root","header","body","clearAll","list","item","link","count","footer"],I=(0,R["default"])(T)&&(0,M["default"])(T,function(e,t,n){return e&&-1!==F.indexOf(n)&&(0,w["default"])(t)||(0,P["default"])(t)},!0),D=!(((0,w["default"])(t)||(0,h.isDomElement)(t))&&(0,P["default"])(r)&&k&&(0,_["default"])(i)&&-1!==[!1,"before","after"].indexOf(f)&&(0,R["default"])(m)&&A&&((0,y["default"])(C)||(0,O["default"])(C))&&(0,_["default"])(E)&&I);if(D)throw new Error(Q);var L=(0,h.getContainerNode)(t),V=(0,U["default"])(W["default"]);E===!0&&(V=(0,H["default"])(V));var q=(0,j["default"])(r,function(e){return e.name}),$=i?q:[],z=(0,M["default"])(r,function(e,t){return e[t.name]=t,e},{});return{init:function(e){var t=e.helper;this._clearRefinementsAndSearch=h.clearRefinementsAndSearch.bind(null,t,$)},render:function(e){var t=e.results,n=e.helper,r=e.state,o=e.templatesConfig,a=e.createURL,p={root:(0,v["default"])(K(null),T.root),header:(0,v["default"])(K("header"),T.header),body:(0,v["default"])(K("body"),T.body),clearAll:(0,v["default"])(K("clear-all"),T.clearAll),list:(0,v["default"])(K("list"),T.list),item:(0,v["default"])(K("item"),T.item),link:(0,v["default"])(K("link"),T.link),count:(0,v["default"])(K("count"),T.count),footer:(0,v["default"])(K("footer"),T.footer)},g=(0,h.prepareTemplateProps)({defaultTemplates:B["default"],templatesConfig:o,templates:m}),y=a((0,h.clearRefinementsFromState)(r,$)),_=s(t,r,q,i),C=_.map(function(e){return a(u(r,e))}),w=_.map(function(e){return l.bind(null,n,e)}),x=0===_.length;d["default"].render(c(V,{attributes:z,clearAllClick:this._clearRefinementsAndSearch,clearAllPosition:f,clearAllURL:y,clearRefinementClicks:w,clearRefinementURLs:C,collapsible:b,cssClasses:p,refinements:_,shouldAutoHideContainer:x,templateProps:g}),L)}}}function i(e,t,n){var r=e.indexOf(n);return-1!==r?r:e.length+t.indexOf(n)}function a(e,t,n,r){var o=i(e,t,n.attributeName),a=i(e,t,r.attributeName);return o===a?n.name===r.name?0:n.name<r.name?-1:1:a>o?-1:1}function s(e,t,n,r){var o=(0,h.getRefinements)(e,t),i=(0,M["default"])(o,function(e,t){return-1===n.indexOf(t.attributeName)&&e.indexOf(-1===t.attributeName)&&e.push(t.attributeName),e},[]);return o=o.sort(a.bind(null,n,i)),r&&!(0,k["default"])(n)&&(o=(0,I["default"])(o,function(e){return-1!==n.indexOf(e.attributeName)})),o}function u(e,t){switch(t.type){case"facet":return e.removeFacetRefinement(t.attributeName,t.name);case"disjunctive":return e.removeDisjunctiveFacetRefinement(t.attributeName,t.name);case"hierarchical":return e.clearRefinements(t.attributeName);case"exclude":return e.removeExcludeRefinement(t.attributeName,t.name);case"numeric":return e.removeNumericRefinement(t.attributeName,t.operator,t.numericValue);case"tag":return e.removeTagRefinement(t.name);default:throw new Error("clearRefinement: type "+t.type+"isn't handled")}}function l(e,t){e.setState(u(e.state,t)).search()}Object.defineProperty(t,"__esModule",{value:!0});var c=function(){var e="function"==typeof Symbol&&Symbol["for"]&&Symbol["for"]("react.element")||60103;return function(t,n,r,o){var i=t&&t.defaultProps,a=arguments.length-3;if(n||0===a||(n={}),n&&i)for(var s in i)void 0===n[s]&&(n[s]=i[s]);else n||(n=i||{});if(1===a)n.children=o;else if(a>1){for(var u=Array(a),l=0;a>l;l++)u[l]=arguments[l+3];n.children=u}return{$$typeof:e,type:t,key:void 0===r?null:""+r,ref:null,props:n,_owner:null}}}(),f=n(223),p=(r(f),n(254)),d=r(p),h=n(385),m=n(389),v=r(m),g=n(130),y=r(g),b=n(401),_=r(b),C=n(128),w=r(C),x=n(34),P=r(x),E=n(83),R=r(E),S=n(26),O=r(S),T=n(127),k=r(T),N=n(55),j=r(N),A=n(114),M=r(A),F=n(111),I=r(F),D=n(391),U=r(D),L=n(390),H=r(L),V=n(402),B=r(V),q=n(403),W=r(q),K=(0,h.bemHelper)("ais-current-refined-values"),Q="Usage:\ncurrentRefinedValues({\n  container,\n  [ attributes: [{name[, label, template, transformData]}] ],\n  [ onlyListedAttributes = false ],\n  [ clearAll = 'before' ] // One of ['before', 'after', false]\n  [ templates.{header = '', item, clearAll, footer = ''} ],\n  [ transformData ],\n  [ autoHideContainer = true ],\n  [ cssClasses.{root, header, body, clearAll, list, item, link, count, footer} = {} ],\n  [ collapsible=false ]\n})";t["default"]=o},function(e,t,n){function r(e){return e===!0||e===!1||o(e)&&s.call(e)==i}var o=n(27),i="[object Boolean]",a=Object.prototype,s=a.toString;e.exports=r},function(e,t){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t["default"]={header:"",item:'{{#label}}{{label}}{{^operator}}:{{/operator}} {{/label}}{{#operator}}{{{displayOperator}}} {{/operator}}{{#exclude}}-{{/exclude}}{{name}} <span class="{{cssClasses.count}}">{{count}}</span>',clearAll:"Clear all",footer:""}},function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{"default":e}}function o(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function i(e,t){if(!e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!t||"object"!=typeof t&&"function"!=typeof t?e:t}function a(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function, not "+typeof t);e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),t&&(Object.setPrototypeOf?Object.setPrototypeOf(e,t):e.__proto__=t)}function s(e){var t={};return void 0!==e.template&&(t.templates={item:e.template}),void 0!==e.transformData&&(t.transformData=e.transformData),t}function u(e,t,n){var r=(0,C["default"])(t);return r.cssClasses=n,void 0!==e.label&&(r.label=e.label),void 0!==r.operator&&(r.displayOperator=r.operator,">="===r.operator&&(r.displayOperator="&ge;"),"<="===r.operator&&(r.displayOperator="&le;")),r}function l(e){return function(t){(0,g.isSpecialClick)(t)||(t.preventDefault(),e())}}Object.defineProperty(t,"__esModule",{value:!0});var c=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var r in n)Object.prototype.hasOwnProperty.call(n,r)&&(e[r]=n[r])}return e},f=function(){var e="function"==typeof Symbol&&Symbol["for"]&&Symbol["for"]("react.element")||60103;return function(t,n,r,o){var i=t&&t.defaultProps,a=arguments.length-3;if(n||0===a||(n={}),n&&i)for(var s in i)void 0===n[s]&&(n[s]=i[s]);else n||(n=i||{});if(1===a)n.children=o;else if(a>1){for(var u=Array(a),l=0;a>l;l++)u[l]=arguments[l+3];n.children=u}return{$$typeof:e,type:t,key:void 0===r?null:""+r,ref:null,props:n,_owner:null}}}(),p=function(){function e(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(t,n,r){return n&&e(t.prototype,n),r&&e(t,r),t}}(),d=n(223),h=r(d),m=n(392),v=r(m),g=n(385),y=n(55),b=r(y),_=n(96),C=r(_),w=n(129),x=r(w),P=function(e){function t(){return o(this,t),i(this,Object.getPrototypeOf(t).apply(this,arguments))}return a(t,e),p(t,[{key:"shouldComponentUpdate",value:function(e){return!(0,x["default"])(this.props.refinements,e.refinements)}},{key:"_clearAllElement",value:function(e,t){return t===e?f("a",{className:this.props.cssClasses.clearAll,href:this.props.clearAllURL,onClick:l(this.props.clearAllClick)},void 0,h["default"].createElement(v["default"],c({templateKey:"clearAll"},this.props.templateProps))):void 0}},{key:"_refinementElement",value:function(e,t){var n=this.props.attributes[e.attributeName]||{},r=u(n,e,this.props.cssClasses),o=s(n),i=e.attributeName+(e.operator?e.operator:":")+(e.exclude?e.exclude:"")+e.name;return f("div",{className:this.props.cssClasses.item},i,f("a",{className:this.props.cssClasses.link,href:this.props.clearRefinementURLs[t],onClick:l(this.props.clearRefinementClicks[t])},void 0,h["default"].createElement(v["default"],c({data:r,templateKey:"item"},this.props.templateProps,o))))}},{key:"render",value:function(){return f("div",{},void 0,this._clearAllElement("before",this.props.clearAllPosition),f("div",{className:this.props.cssClasses.list},void 0,(0,b["default"])(this.props.refinements,this._refinementElement,this)),this._clearAllElement("after",this.props.clearAllPosition))}}]),t}(h["default"].Component);t["default"]=P},function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{"default":e}}function o(){var e=arguments.length<=0||void 0===arguments[0]?{}:arguments[0],t=e.container,n=e.attributes,r=e.separator,o=void 0===r?" > ":r,a=e.rootPath,s=void 0===a?null:a,c=e.showParentLevel,p=void 0===c?!0:c,h=e.limit,v=void 0===h?10:h,y=e.sortBy,w=void 0===y?["name:asc"]:y,x=e.cssClasses,P=void 0===x?{}:x,E=e.autoHideContainer,R=void 0===E?!0:E,S=e.templates,O=void 0===S?g["default"]:S,T=e.collapsible,k=void 0===T?!1:T,N=e.transformData;if(!t||!n||!n.length)throw new Error(C);var j=(0,l.getContainerNode)(t),A=(0,m["default"])(b["default"]);R===!0&&(A=(0,d["default"])(A));var M=n[0],F={root:(0,f["default"])(_(null),P.root),header:(0,f["default"])(_("header"),P.header),body:(0,f["default"])(_("body"),P.body),footer:(0,f["default"])(_("footer"),P.footer),list:(0,f["default"])(_("list"),P.list),depth:_("list","lvl"),item:(0,f["default"])(_("item"),P.item),active:(0,f["default"])(_("item","active"),P.active),link:(0,f["default"])(_("link"),P.link),count:(0,f["default"])(_("count"),P.count)};return{getConfiguration:function(e){return{hierarchicalFacets:[{name:M,attributes:n,separator:o,rootPath:s,showParentLevel:p}],maxValuesPerFacet:void 0!==e.maxValuesPerFacet?Math.max(e.maxValuesPerFacet,v):v}},init:function(e){var t=e.helper,n=e.templatesConfig;this._toggleRefinement=function(e){return t.toggleRefinement(M,e).search()},this._templateProps=(0,l.prepareTemplateProps)({transformData:N,defaultTemplates:g["default"],templatesConfig:n,templates:O})},_prepareFacetValues:function(e,t){var n=this;return e.slice(0,v).map(function(e){return Array.isArray(e.data)&&(e.data=n._prepareFacetValues(e.data,t)),e})},render:function(e){function t(e){return o(r.toggleRefinement(M,e))}var n=e.results,r=e.state,o=e.createURL,a=n.getFacetValues(M,{sortBy:w}).data||[];a=this._prepareFacetValues(a,r),u["default"].render(i(A,{attributeNameKey:"path",collapsible:k,createURL:t,cssClasses:F,facetValues:a,shouldAutoHideContainer:0===a.length,templateProps:this._templateProps,toggleRefinement:this._toggleRefinement}),j)}}}Object.defineProperty(t,"__esModule",{value:!0});var i=function(){var e="function"==typeof Symbol&&Symbol["for"]&&Symbol["for"]("react.element")||60103;return function(t,n,r,o){var i=t&&t.defaultProps,a=arguments.length-3;if(n||0===a||(n={}),n&&i)for(var s in i)void 0===n[s]&&(n[s]=i[s]);else n||(n=i||{});if(1===a)n.children=o;else if(a>1){for(var u=Array(a),l=0;a>l;l++)u[l]=arguments[l+3];n.children=u}return{$$typeof:e,type:t,key:void 0===r?null:""+r,ref:null,props:n,_owner:null}}}(),a=n(223),s=(r(a),n(254)),u=r(s),l=n(385),c=n(389),f=r(c),p=n(390),d=r(p),h=n(391),m=r(h),v=n(405),g=r(v),y=n(406),b=r(y),_=(0,l.bemHelper)("ais-hierarchical-menu"),C="Usage:\nhierarchicalMenu({\n  container,\n  attributes,\n  [ separator=' > ' ],\n  [ rootPath ],\n  [ showParentLevel=true ],\n  [ limit=10 ],\n  [ sortBy=['name:asc'] ],\n  [ cssClasses.{root , header, body, footer, list, depth, item, active, link}={} ],\n  [ templates.{header, item, footer} ],\n  [ transformData ],\n  [ autoHideContainer=true ],\n  [ collapsible=false ]\n})";t["default"]=o},function(e,t){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t["default"]={header:"",item:'<a class="{{cssClasses.link}}" href="{{url}}">{{name}} <span class="{{cssClasses.count}}">{{#helpers.formatNumber}}{{count}}{{/helpers.formatNumber}}</span></a>',footer:""}},function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{"default":e}}function o(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function i(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function a(e,t){if(!e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!t||"object"!=typeof t&&"function"!=typeof t?e:t}function s(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function, not "+typeof t);e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),t&&(Object.setPrototypeOf?Object.setPrototypeOf(e,t):e.__proto__=t)}Object.defineProperty(t,"__esModule",{value:!0});var u=function(){var e="function"==typeof Symbol&&Symbol["for"]&&Symbol["for"]("react.element")||60103;return function(t,n,r,o){var i=t&&t.defaultProps,a=arguments.length-3;if(n||0===a||(n={}),n&&i)for(var s in i)void 0===n[s]&&(n[s]=i[s]);else n||(n=i||{});if(1===a)n.children=o;else if(a>1){for(var u=Array(a),l=0;a>l;l++)u[l]=arguments[l+3];n.children=u}return{$$typeof:e,type:t,key:void 0===r?null:""+r,ref:null,props:n,_owner:null}}}(),l=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var r in n)Object.prototype.hasOwnProperty.call(n,r)&&(e[r]=n[r])}return e},c=function(){function e(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(t,n,r){return n&&e(t.prototype,n),r&&e(t,r),t}}(),f=n(223),p=r(f),d=n(389),h=r(d),m=n(385),v=n(392),g=r(v),y=n(407),b=r(y),_=n(129),C=r(_),w=function(e){function t(e){i(this,t);var n=a(this,Object.getPrototypeOf(t).call(this,e));return n.state={isShowMoreOpen:!1},n.handleItemClick=n.handleItemClick.bind(n),n.handleClickShowMore=n.handleClickShowMore.bind(n),n}return s(t,e),c(t,[{key:"shouldComponentUpdate",value:function(e,t){return t!==this.state||!(0,C["default"])(this.props.facetValues,e.facetValues)}},{key:"refine",value:function(e,t){this.props.toggleRefinement(e,t)}},{key:"_generateFacetItem",value:function(e){var n=void 0,r=e.data&&e.data.length>0;r&&(n=p["default"].createElement(t,l({},this.props,{depth:this.props.depth+1,facetValues:e.data})));var i=this.props.createURL(e[this.props.attributeNameKey]),a=l({},e,{url:i,cssClasses:this.props.cssClasses}),s=(0,h["default"])(this.props.cssClasses.item,o({},this.props.cssClasses.active,e.isRefined)),c=e[this.props.attributeNameKey];return void 0!==e.isRefined&&(c+="/"+e.isRefined),void 0!==e.count&&(c+="/"+e.count),u(b["default"],{facetValueToRefine:e[this.props.attributeNameKey],handleClick:this.handleItemClick,isRefined:e.isRefined,itemClassName:s,subItems:n,templateData:a,templateKey:"item",templateProps:this.props.templateProps},c)}},{key:"handleItemClick",value:function(e){var t=e.facetValueToRefine,n=e.originalEvent,r=e.isRefined;if(!(0,m.isSpecialClick)(n)){if("INPUT"===n.target.tagName)return void this.refine(t,r);for(var o=n.target;o!==n.currentTarget;){if("LABEL"===o.tagName&&(o.querySelector('input[type="checkbox"]')||o.querySelector('input[type="radio"]')))return;"A"===o.tagName&&o.href&&n.preventDefault(),o=o.parentNode}n.stopPropagation(),this.refine(t,r)}}},{key:"handleClickShowMore",value:function(){var e=!this.state.isShowMoreOpen;this.setState({isShowMoreOpen:e})}},{key:"render",value:function(){var e=[this.props.cssClasses.list];this.props.cssClasses.depth&&e.push(""+this.props.cssClasses.depth+this.props.depth);var t=this.state.isShowMoreOpen?this.props.limitMax:this.props.limitMin,n=this.props.facetValues.slice(0,t),r=this.props.showMore===!0&&this.props.facetValues.length>n.length||this.state.isShowMoreOpen&&n.length>this.props.limitMin,o=r?p["default"].createElement(g["default"],l({rootProps:{onClick:this.handleClickShowMore},templateKey:"show-more-"+(this.state.isShowMoreOpen?"active":"inactive")},this.props.templateProps)):void 0;return u("div",{className:(0,h["default"])(e)},void 0,n.map(this._generateFacetItem,this),o)}}]),t}(p["default"].Component);w.defaultProps={cssClasses:{},depth:0,attributeNameKey:"name"},t["default"]=w},function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{"default":e}}function o(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function i(e,t){if(!e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!t||"object"!=typeof t&&"function"!=typeof t?e:t}function a(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function, not "+typeof t);e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),t&&(Object.setPrototypeOf?Object.setPrototypeOf(e,t):e.__proto__=t)}Object.defineProperty(t,"__esModule",{value:!0});var s=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var r in n)Object.prototype.hasOwnProperty.call(n,r)&&(e[r]=n[r])}return e},u=function(){var e="function"==typeof Symbol&&Symbol["for"]&&Symbol["for"]("react.element")||60103;return function(t,n,r,o){var i=t&&t.defaultProps,a=arguments.length-3;if(n||0===a||(n={}),n&&i)for(var s in i)void 0===n[s]&&(n[s]=i[s]);else n||(n=i||{});if(1===a)n.children=o;else if(a>1){for(var u=Array(a),l=0;a>l;l++)u[l]=arguments[l+3];n.children=u}return{$$typeof:e,type:t,key:void 0===r?null:""+r,ref:null,props:n,_owner:null}}}(),l=function(){function e(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(t,n,r){return n&&e(t.prototype,n),r&&e(t,r),t}}(),c=n(223),f=r(c),p=n(392),d=r(p),h=n(129),m=r(h),v=function(e){function t(){return o(this,t),i(this,Object.getPrototypeOf(t).apply(this,arguments))}return a(t,e),l(t,[{key:"componentWillMount",value:function(){this.handleClick=this.handleClick.bind(this)}},{key:"shouldComponentUpdate",value:function(e){return!(0,m["default"])(this.props,e)}},{key:"handleClick",value:function(e){this.props.handleClick({facetValueToRefine:this.props.facetValueToRefine,isRefined:this.props.isRefined,originalEvent:e})}},{key:"render",value:function(){return u("div",{className:this.props.itemClassName,onClick:this.handleClick},void 0,f["default"].createElement(d["default"],s({data:this.props.templateData,templateKey:this.props.templateKey},this.props.templateProps)),this.props.subItems)}}]),t}(f["default"].Component);t["default"]=v},function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{"default":e}}function o(){var e=arguments.length<=0||void 0===arguments[0]?{}:arguments[0],t=e.container,n=e.cssClasses,r=void 0===n?{}:n,o=e.templates,a=void 0===o?m["default"]:o,s=e.transformData,c=e.hitsPerPage,p=void 0===c?20:c;if(!t)throw new Error("Must provide a container."+g);if(a.item&&a.allItems)throw new Error("Must contain only allItems OR item template."+g);var h=(0,l.getContainerNode)(t),y={root:(0,f["default"])(v(null),r.root),item:(0,f["default"])(v("item"),r.item),empty:(0,f["default"])(v(null,"empty"),r.empty)};return{getConfiguration:function(){return{hitsPerPage:p}},init:function(e){var t=e.templatesConfig;this._templateProps=(0,l.prepareTemplateProps)({transformData:s,defaultTemplates:m["default"],templatesConfig:t,templates:a})},render:function(e){var t=e.results;u["default"].render(i(d["default"],{cssClasses:y,hits:t.hits,results:t,templateProps:this._templateProps}),h)}}}Object.defineProperty(t,"__esModule",{value:!0});var i=function(){var e="function"==typeof Symbol&&Symbol["for"]&&Symbol["for"]("react.element")||60103;return function(t,n,r,o){var i=t&&t.defaultProps,a=arguments.length-3;if(n||0===a||(n={}),n&&i)for(var s in i)void 0===n[s]&&(n[s]=i[s]);else n||(n=i||{});if(1===a)n.children=o;else if(a>1){for(var u=Array(a),l=0;a>l;l++)u[l]=arguments[l+3];n.children=u}return{$$typeof:e,type:t,key:void 0===r?null:""+r,ref:null,props:n,_owner:null}}}(),a=n(223),s=(r(a),n(254)),u=r(s),l=n(385),c=n(389),f=r(c),p=n(409),d=r(p),h=n(410),m=r(h),v=(0,l.bemHelper)("ais-hits"),g="\nUsage:\nhits({\n  container,\n  [ cssClasses.{root,empty,item}={} ],\n  [ templates.{empty,item} | templates.{empty, allItems} ],\n  [ transformData.{empty=identity,item=identity} | transformData.{empty, allItems} ],\n  [ hitsPerPage=20 ]\n})";
t["default"]=o},function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{"default":e}}function o(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function i(e,t){if(!e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!t||"object"!=typeof t&&"function"!=typeof t?e:t}function a(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function, not "+typeof t);e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),t&&(Object.setPrototypeOf?Object.setPrototypeOf(e,t):e.__proto__=t)}Object.defineProperty(t,"__esModule",{value:!0});var s=function(){var e="function"==typeof Symbol&&Symbol["for"]&&Symbol["for"]("react.element")||60103;return function(t,n,r,o){var i=t&&t.defaultProps,a=arguments.length-3;if(n||0===a||(n={}),n&&i)for(var s in i)void 0===n[s]&&(n[s]=i[s]);else n||(n=i||{});if(1===a)n.children=o;else if(a>1){for(var u=Array(a),l=0;a>l;l++)u[l]=arguments[l+3];n.children=u}return{$$typeof:e,type:t,key:void 0===r?null:""+r,ref:null,props:n,_owner:null}}}(),u=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var r in n)Object.prototype.hasOwnProperty.call(n,r)&&(e[r]=n[r])}return e},l=function(){function e(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(t,n,r){return n&&e(t.prototype,n),r&&e(t,r),t}}(),c=n(223),f=r(c),p=n(55),d=r(p),h=n(392),m=r(h),v=n(129),g=r(v),y=n(389),b=r(y),_=function(e){function t(){return o(this,t),i(this,Object.getPrototypeOf(t).apply(this,arguments))}return a(t,e),l(t,[{key:"shouldComponentUpdate",value:function(e){return 0===this.props.results.hits.length||this.props.results.hits.length!==e.results.hits.length||!(0,g["default"])(this.props.results.hits,e.results.hits)}},{key:"renderWithResults",value:function(){var e=this,t=(0,d["default"])(this.props.results.hits,function(t){return f["default"].createElement(m["default"],u({data:t,key:t.objectID,rootProps:{className:e.props.cssClasses.item},templateKey:"item"},e.props.templateProps))});return s("div",{className:this.props.cssClasses.root},void 0,t)}},{key:"renderAllResults",value:function(){return f["default"].createElement(m["default"],u({data:this.props.results,rootProps:{className:this.props.cssClasses.allItems},templateKey:"allItems"},this.props.templateProps))}},{key:"renderNoResults",value:function(){return f["default"].createElement(m["default"],u({data:this.props.results,rootProps:{className:(0,b["default"])(this.props.cssClasses.root,this.props.cssClasses.empty)},templateKey:"empty"},this.props.templateProps))}},{key:"render",value:function(){if(this.props.results.hits.length>0){var e=this.props.templateProps&&this.props.templateProps.templates&&this.props.templateProps.templates.allItems;return e?this.renderAllResults():this.renderWithResults()}return this.renderNoResults()}}]),t}(f["default"].Component);_.defaultProps={results:{hits:[]}},t["default"]=_},function(e,t){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t["default"]={empty:"No results",item:function(e){return JSON.stringify(e,null,2)}}},function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{"default":e}}function o(){var e=arguments.length<=0||void 0===arguments[0]?{}:arguments[0],t=e.container,n=e.options,r=e.cssClasses,o=void 0===r?{}:r,a=e.autoHideContainer,s=void 0===a?!1:a;if(!t||!n)throw new Error(b);var c=(0,l.getContainerNode)(t),p=g["default"];s===!0&&(p=(0,m["default"])(p));var h={root:(0,d["default"])(y(null),o.root),item:(0,d["default"])(y("item"),o.item)};return{init:function(e){var t=e.helper,r=e.state,o=(0,f["default"])(n,function(e){return+r.hitsPerPage===+e.value});o||(void 0===r.hitsPerPage?window.console&&window.console.log("[Warning][hitsPerPageSelector] hitsPerPage not defined. You should probably used a `hits` widget or set the value `hitsPerPage` using the searchParameters attribute of the instantsearch constructor."):window.console&&window.console.log("[Warning][hitsPerPageSelector] No option in `options` with `value: hitsPerPage` (hitsPerPage: "+r.hitsPerPage+")"),n=[{value:void 0,label:""}].concat(n)),this.setHitsPerPage=function(e){return t.setQueryParameter("hitsPerPage",+e).search()}},render:function(e){var t=e.state,r=e.results,o=t.hitsPerPage,a=0===r.nbHits;u["default"].render(i(p,{cssClasses:h,currentValue:o,options:n,setValue:this.setHitsPerPage,shouldAutoHideContainer:a}),c)}}}Object.defineProperty(t,"__esModule",{value:!0});var i=function(){var e="function"==typeof Symbol&&Symbol["for"]&&Symbol["for"]("react.element")||60103;return function(t,n,r,o){var i=t&&t.defaultProps,a=arguments.length-3;if(n||0===a||(n={}),n&&i)for(var s in i)void 0===n[s]&&(n[s]=i[s]);else n||(n=i||{});if(1===a)n.children=o;else if(a>1){for(var u=Array(a),l=0;a>l;l++)u[l]=arguments[l+3];n.children=u}return{$$typeof:e,type:t,key:void 0===r?null:""+r,ref:null,props:n,_owner:null}}}(),a=n(223),s=(r(a),n(254)),u=r(s),l=n(385),c=n(412),f=r(c),p=n(389),d=r(p),h=n(390),m=r(h),v=n(415),g=r(v),y=(0,l.bemHelper)("ais-hits-per-page-selector"),b="Usage:\nhitsPerPageSelector({\n  container,\n  options,\n  [ cssClasses.{root,item}={} ],\n  [ autoHideContainer=false ]\n})";t["default"]=o},function(e,t,n){e.exports=n(413)},function(e,t,n){function r(e,t,n){var r=s(e)?o:a;return n&&u(e,t,n)&&(t=void 0),"function"==typeof t&&void 0===n||(t=i(t,n,3)),r(e,t)}var o=n(63),i=n(57),a=n(414),s=n(34),u=n(54);e.exports=r},function(e,t,n){function r(e,t){var n;return o(e,function(e,r,o){return n=t(e,r,o),!n}),!!n}var o=n(17);e.exports=r},function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{"default":e}}function o(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function i(e,t){if(!e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!t||"object"!=typeof t&&"function"!=typeof t?e:t}function a(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function, not "+typeof t);e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),t&&(Object.setPrototypeOf?Object.setPrototypeOf(e,t):e.__proto__=t)}Object.defineProperty(t,"__esModule",{value:!0});var s=function(){var e="function"==typeof Symbol&&Symbol["for"]&&Symbol["for"]("react.element")||60103;return function(t,n,r,o){var i=t&&t.defaultProps,a=arguments.length-3;if(n||0===a||(n={}),n&&i)for(var s in i)void 0===n[s]&&(n[s]=i[s]);else n||(n=i||{});if(1===a)n.children=o;else if(a>1){for(var u=Array(a),l=0;a>l;l++)u[l]=arguments[l+3];n.children=u}return{$$typeof:e,type:t,key:void 0===r?null:""+r,ref:null,props:n,_owner:null}}}(),u=function(){function e(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(t,n,r){return n&&e(t.prototype,n),r&&e(t,r),t}}(),l=n(223),c=r(l),f=function(e){function t(){return o(this,t),i(this,Object.getPrototypeOf(t).apply(this,arguments))}return a(t,e),u(t,[{key:"componentWillMount",value:function(){this.handleChange=this.handleChange.bind(this)}},{key:"shouldComponentUpdate",value:function(){return!1}},{key:"handleChange",value:function(e){this.props.setValue(e.target.value)}},{key:"render",value:function(){var e=this,t=this.props,n=t.currentValue,r=t.options;return s("select",{className:this.props.cssClasses.root,defaultValue:n,onChange:this.handleChange},void 0,r.map(function(t){return s("option",{className:e.props.cssClasses.item,value:t.value},t.value,t.label)}))}}]),t}(c["default"].Component);t["default"]=f},function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{"default":e}}function o(){var e=arguments.length<=0||void 0===arguments[0]?{}:arguments[0],t=e.container,n=e.attributeName,r=e.sortBy,o=void 0===r?["count:desc","name:asc"]:r,s=e.limit,u=void 0===s?10:s,f=e.cssClasses,d=void 0===f?{}:f,m=e.templates,g=void 0===m?_["default"]:m,b=e.collapsible,C=void 0===b?!1:b,E=e.transformData,R=e.autoHideContainer,S=void 0===R?!0:R,O=e.showMore,T=void 0===O?!1:O,k=(0,y["default"])(T);if(k&&k.limit<u)throw new Error("showMore.limit configuration should be > than the limit in the main configuration");var N=k&&k.limit||u;if(!t||!n)throw new Error(P);var j=(0,c.getContainerNode)(t),A=(0,v["default"])(w["default"]);S===!0&&(A=(0,h["default"])(A));var M=n,F=k&&(0,c.prefixKeys)("show-more-",k.templates),I=F?a({},g,F):g,D={root:(0,p["default"])(x(null),d.root),header:(0,p["default"])(x("header"),d.header),body:(0,p["default"])(x("body"),d.body),footer:(0,p["default"])(x("footer"),d.footer),list:(0,p["default"])(x("list"),d.list),item:(0,p["default"])(x("item"),d.item),active:(0,p["default"])(x("item","active"),d.active),link:(0,p["default"])(x("link"),d.link),count:(0,p["default"])(x("count"),d.count)};return{getConfiguration:function(e){var t={hierarchicalFacets:[{name:M,attributes:[n]}]},r=e.maxValuesPerFacet||0;return t.maxValuesPerFacet=Math.max(r,N),t},init:function(e){var t=e.templatesConfig,n=e.helper,r=e.createURL;this._templateProps=(0,c.prepareTemplateProps)({transformData:E,defaultTemplates:_["default"],templatesConfig:t,templates:I}),this._createURL=function(e,t){return r(e.toggleRefinement(M,t))},this._toggleRefinement=function(e){return n.toggleRefinement(M,e).search()}},_prepareFacetValues:function(e,t){var n=this;return e.map(function(e){return e.url=n._createURL(t,e),e})},render:function(e){function t(e){return s(a.toggleRefinement(n,e))}var r=e.results,a=e.state,s=e.createURL,c=r.getFacetValues(M,{sortBy:o}).data||[];c=this._prepareFacetValues(c,a),l["default"].render(i(A,{collapsible:C,createURL:t,cssClasses:D,facetValues:c,limitMax:N,limitMin:u,shouldAutoHideContainer:0===c.length,showMore:null!==k,templateProps:this._templateProps,toggleRefinement:this._toggleRefinement}),j)}}}Object.defineProperty(t,"__esModule",{value:!0});var i=function(){var e="function"==typeof Symbol&&Symbol["for"]&&Symbol["for"]("react.element")||60103;return function(t,n,r,o){var i=t&&t.defaultProps,a=arguments.length-3;if(n||0===a||(n={}),n&&i)for(var s in i)void 0===n[s]&&(n[s]=i[s]);else n||(n=i||{});if(1===a)n.children=o;else if(a>1){for(var u=Array(a),l=0;a>l;l++)u[l]=arguments[l+3];n.children=u}return{$$typeof:e,type:t,key:void 0===r?null:""+r,ref:null,props:n,_owner:null}}}(),a=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var r in n)Object.prototype.hasOwnProperty.call(n,r)&&(e[r]=n[r])}return e},s=n(223),u=(r(s),n(254)),l=r(u),c=n(385),f=n(389),p=r(f),d=n(390),h=r(d),m=n(391),v=r(m),g=n(417),y=r(g),b=n(419),_=r(b),C=n(406),w=r(C),x=(0,c.bemHelper)("ais-menu"),P="Usage:\nmenu({\n  container,\n  attributeName,\n  [ sortBy=['count:desc', 'name:asc'] ],\n  [ limit=10 ],\n  [ cssClasses.{root,list,item} ],\n  [ templates.{header,item,footer} ],\n  [ transformData ],\n  [ autoHideContainer ],\n  [ showMore.{templates: {active, inactive}, limit} ],\n  [ collapsible=false ]\n})";t["default"]=o},function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{"default":e}}function o(e){if(!e)return null;if(e===!0)return u;var t=i({},e);return e.templates||(t.templates=u.templates),e.limit||(t.limit=u.limit),t}Object.defineProperty(t,"__esModule",{value:!0});var i=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var r in n)Object.prototype.hasOwnProperty.call(n,r)&&(e[r]=n[r])}return e};t["default"]=o;var a=n(418),s=r(a),u={templates:s["default"],limit:100}},function(e,t){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t["default"]={active:'<a class="ais-show-more ais-show-more__active">Show less</a>',inactive:'<a class="ais-show-more ais-show-more__inactive">Show more</a>'}},function(e,t){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t["default"]={header:"",item:'<a class="{{cssClasses.link}}" href="{{url}}">{{name}} <span class="{{cssClasses.count}}">{{#helpers.formatNumber}}{{count}}{{/helpers.formatNumber}}</span></a>',footer:""}},function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{"default":e}}function o(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function i(e){var t=e.container,n=e.attributeName,r=e.operator,i=void 0===r?"or":r,u=e.sortBy,l=void 0===u?["count:desc","name:asc"]:u,p=e.limit,h=void 0===p?10:p,v=e.cssClasses,y=void 0===v?{}:v,_=e.templates,w=void 0===_?C["default"]:_,R=e.collapsible,S=void 0===R?!1:R,O=e.transformData,T=e.autoHideContainer,k=void 0===T?!0:T,N=e.showMore,j=void 0===N?!1:N,A=(0,b["default"])(j);if(A&&A.limit<h)throw new Error("showMore.limit configuration should be > than the limit in the main configuration");var M=A&&A.limit||h,F=x["default"];if(!t||!n)throw new Error(E);F=(0,g["default"])(F),k===!0&&(F=(0,m["default"])(F));var I=(0,f.getContainerNode)(t);if(i&&(i=i.toLowerCase(),"and"!==i&&"or"!==i))throw new Error(E);var D=A&&(0,f.prefixKeys)("show-more-",A.templates),U=D?s({},w,D):w,L={root:(0,d["default"])(P(null),y.root),header:(0,d["default"])(P("header"),y.header),body:(0,d["default"])(P("body"),y.body),footer:(0,d["default"])(P("footer"),y.footer),list:(0,d["default"])(P("list"),y.list),item:(0,d["default"])(P("item"),y.item),active:(0,d["default"])(P("item","active"),y.active),label:(0,d["default"])(P("label"),y.label),checkbox:(0,d["default"])(P("checkbox"),y.checkbox),count:(0,d["default"])(P("count"),y.count)};return{getConfiguration:function(e){var t=o({},"and"===i?"facets":"disjunctiveFacets",[n]),r=e.maxValuesPerFacet||0;return t.maxValuesPerFacet=Math.max(r,M),t},init:function(e){var t=e.templatesConfig,r=e.helper;this._templateProps=(0,f.prepareTemplateProps)({transformData:O,defaultTemplates:C["default"],templatesConfig:t,templates:U}),this.toggleRefinement=function(e){return r.toggleRefinement(n,e).search()}},render:function(e){function t(e){return i(o.toggleRefinement(n,e))}var r=e.results,o=e.state,i=e.createURL,s=r.getFacetValues(n,{sortBy:l});c["default"].render(a(F,{collapsible:S,createURL:t,cssClasses:L,facetValues:s,limitMax:M,limitMin:h,shouldAutoHideContainer:0===s.length,showMore:null!==A,templateProps:this._templateProps,toggleRefinement:this.toggleRefinement}),I)}}}Object.defineProperty(t,"__esModule",{value:!0});var a=function(){var e="function"==typeof Symbol&&Symbol["for"]&&Symbol["for"]("react.element")||60103;return function(t,n,r,o){var i=t&&t.defaultProps,a=arguments.length-3;if(n||0===a||(n={}),n&&i)for(var s in i)void 0===n[s]&&(n[s]=i[s]);else n||(n=i||{});if(1===a)n.children=o;else if(a>1){for(var u=Array(a),l=0;a>l;l++)u[l]=arguments[l+3];n.children=u}return{$$typeof:e,type:t,key:void 0===r?null:""+r,ref:null,props:n,_owner:null}}}(),s=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var r in n)Object.prototype.hasOwnProperty.call(n,r)&&(e[r]=n[r])}return e},u=n(223),l=(r(u),n(254)),c=r(l),f=n(385),p=n(389),d=r(p),h=n(390),m=r(h),v=n(391),g=r(v),y=n(417),b=r(y),_=n(421),C=r(_),w=n(406),x=r(w),P=(0,f.bemHelper)("ais-refinement-list"),E="Usage:\nrefinementList({\n  container,\n  attributeName,\n  [ operator='or' ],\n  [ sortBy=['count:desc', 'name:asc'] ],\n  [ limit=10 ],\n  [ cssClasses.{root, header, body, footer, list, item, active, label, checkbox, count}],\n  [ templates.{header,item,footer} ],\n  [ transformData ],\n  [ autoHideContainer=true ],\n  [ collapsible=false ],\n  [ showMore.{templates: {active, inactive}, limit} ],\n  [ collapsible=false ]\n})";t["default"]=i},function(e,t){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t["default"]={header:"",item:'<label class="{{cssClasses.label}}">\n  <input type="checkbox" class="{{cssClasses.checkbox}}" value="{{name}}" {{#isRefined}}checked{{/isRefined}} />{{name}}\n  <span class="{{cssClasses.count}}">{{#helpers.formatNumber}}{{count}}{{/helpers.formatNumber}}</span>\n</label>',footer:""}},function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{"default":e}}function o(e){var t=e.container,n=e.attributeName,r=e.options,o=e.cssClasses,s=void 0===o?{}:o,l=e.templates,c=void 0===l?P["default"]:l,d=e.collapsible,m=void 0===d?!1:d,v=e.transformData,g=e.autoHideContainer,y=void 0===g?!0:g;if(!t||!n||!r)throw new Error(O);var b=(0,p.getContainerNode)(t),C=(0,w["default"])(R["default"]);y===!0&&(C=(0,_["default"])(C));var x={root:(0,h["default"])(S(null),s.root),header:(0,h["default"])(S("header"),s.header),body:(0,h["default"])(S("body"),s.body),footer:(0,h["default"])(S("footer"),s.footer),list:(0,h["default"])(S("list"),s.list),item:(0,h["default"])(S("item"),s.item),label:(0,h["default"])(S("label"),s.label),radio:(0,h["default"])(S("radio"),s.radio),active:(0,h["default"])(S("item","active"),s.active)};return{init:function(e){var t=e.templatesConfig,o=e.helper;this._templateProps=(0,p.prepareTemplateProps)({transformData:v,defaultTemplates:P["default"],templatesConfig:t,templates:c}),this._toggleRefinement=function(e){return o.setState(a(o.state,n,r,e)).search()}},render:function(e){function t(e){return l(a(s,n,r,e))}var o=e.results,s=e.state,l=e.createURL,c=r.map(function(e){return e.isRefined=i(s,n,e),e.attributeName=n,e});f["default"].render(u(C,{collapsible:m,createURL:t,cssClasses:x,facetValues:c,shouldAutoHideContainer:0===o.nbHits,templateProps:this._templateProps,toggleRefinement:this._toggleRefinement}),b)}}}function i(e,t,n){var r=e.getNumericRefinements(t);return void 0!==n.start&&void 0!==n.end&&n.start===n.end?s(r,"=",n.start):void 0!==n.start?s(r,">=",n.start):void 0!==n.end?s(r,"<=",n.end):void 0===n.start&&void 0===n.end?0===Object.keys(r).length:void 0}function a(e,t,n,r){var o=(0,v["default"])(n,{name:r}),a=e.getNumericRefinements(t);if(void 0===o.start&&void 0===o.end)return e.clearRefinements(t);if(i(e,t,o)||(e=e.clearRefinements(t)),void 0!==o.start&&void 0!==o.end){if(o.start>o.end)throw new Error("option.start should be > to option.end");if(o.start===o.end)return e=s(a,"=",o.start)?e.removeNumericRefinement(t,"=",o.start):e.addNumericRefinement(t,"=",o.start)}return void 0!==o.start&&(e=s(a,">=",o.start)?e.removeNumericRefinement(t,">=",o.start):e.addNumericRefinement(t,">=",o.start)),void 0!==o.end&&(e=s(a,"<=",o.end)?e.removeNumericRefinement(t,"<=",o.end):e.addNumericRefinement(t,"<=",o.end)),e}function s(e,t,n){var r=void 0!==e[t],o=(0,y["default"])(e[t],n);return r&&o}Object.defineProperty(t,"__esModule",{value:!0});var u=function(){var e="function"==typeof Symbol&&Symbol["for"]&&Symbol["for"]("react.element")||60103;return function(t,n,r,o){var i=t&&t.defaultProps,a=arguments.length-3;if(n||0===a||(n={}),n&&i)for(var s in i)void 0===n[s]&&(n[s]=i[s]);else n||(n=i||{});if(1===a)n.children=o;else if(a>1){for(var u=Array(a),l=0;a>l;l++)u[l]=arguments[l+3];n.children=u}return{$$typeof:e,type:t,key:void 0===r?null:""+r,ref:null,props:n,_owner:null}}}(),l=n(223),c=(r(l),n(254)),f=r(c),p=n(385),d=n(389),h=r(d),m=n(131),v=r(m),g=n(184),y=r(g),b=n(390),_=r(b),C=n(391),w=r(C),x=n(423),P=r(x),E=n(406),R=r(E),S=(0,p.bemHelper)("ais-refinement-list"),O="Usage:\nnumericRefinementList({\n  container,\n  attributeName,\n  options,\n  [ cssClasses.{root,header,body,footer,list,item,active,label,checkbox,count} ],\n  [ templates.{header,item,footer} ],\n  [ transformData ],\n  [ autoHideContainer ],\n  [ collapsible=false ]\n})";t["default"]=o},function(e,t){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t["default"]={header:"",item:'<label class="{{cssClasses.label}}">\n  <input type="radio" class="{{cssClasses.checkbox}}" name="{{attributeName}}" {{#isRefined}}checked{{/isRefined}} />{{name}}\n</label>',footer:""}},function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{"default":e}}function o(e){var t=e.container,n=e.operator,r=void 0===n?"=":n,o=e.attributeName,a=e.options,s=e.cssClasses,c=void 0===s?{}:s,p=e.autoHideContainer,h=void 0===p?!1:p,v=(0,l.getContainerNode)(t),b="Usage: numericSelector({container, attributeName, options[, cssClasses.{root,item}, autoHideContainer]})",_=g["default"];if(h===!0&&(_=(0,m["default"])(_)),!t||!a||0===a.length||!o)throw new Error(b);var C={root:(0,f["default"])(y(null),c.root),item:(0,f["default"])(y("item"),c.item)};return{init:function(e){var t=e.helper,n=this._getRefinedValue(t)||a[0].value;void 0!==n&&t.addNumericRefinement(o,r,n),this._refine=function(e){t.clearRefinements(o),void 0!==e&&t.addNumericRefinement(o,r,e),t.search()}},render:function(e){var t=e.helper,n=e.results;u["default"].render(i(_,{cssClasses:C,currentValue:this._getRefinedValue(t),options:a,setValue:this._refine,shouldAutoHideContainer:0===n.nbHits}),v)},_getRefinedValue:function(e){var t=e.getRefinements(o),n=(0,d["default"])(t,{operator:r});return n&&void 0!==n.value&&void 0!==n.value[0]?n.value[0]:void 0}}}Object.defineProperty(t,"__esModule",{value:!0});var i=function(){var e="function"==typeof Symbol&&Symbol["for"]&&Symbol["for"]("react.element")||60103;return function(t,n,r,o){var i=t&&t.defaultProps,a=arguments.length-3;if(n||0===a||(n={}),n&&i)for(var s in i)void 0===n[s]&&(n[s]=i[s]);else n||(n=i||{});if(1===a)n.children=o;else if(a>1){for(var u=Array(a),l=0;a>l;l++)u[l]=arguments[l+3];n.children=u}return{$$typeof:e,type:t,key:void 0===r?null:""+r,ref:null,props:n,_owner:null}}}(),a=n(223),s=(r(a),n(254)),u=r(s),l=n(385),c=n(389),f=r(c),p=n(131),d=r(p),h=n(390),m=r(h),v=n(415),g=r(v),y=(0,l.bemHelper)("ais-numeric-selector");t["default"]=o},function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{"default":e}}function o(){var e=arguments.length<=0||void 0===arguments[0]?{}:arguments[0],t=e.container,n=e.cssClasses,r=void 0===n?{}:n,o=e.labels,a=void 0===o?{}:o,s=e.maxPages,l=e.padding,f=void 0===l?3:l,h=e.showFirstLast,v=void 0===h?!0:h,C=e.autoHideContainer,w=void 0===C?!0:C,x=e.scrollTo,P=void 0===x?"body":x;if(!t)throw new Error(_);P===!0&&(P="body");var E=(0,d.getContainerNode)(t),R=P!==!1?(0,d.getContainerNode)(P):!1,S=g["default"];w===!0&&(S=(0,m["default"])(S));var O={root:(0,p["default"])(b(null),r.root),item:(0,p["default"])(b("item"),r.item),link:(0,p["default"])(b("link"),r.link),page:(0,p["default"])(b("item","page"),r.page),previous:(0,p["default"])(b("item","previous"),r.previous),next:(0,p["default"])(b("item","next"),r.next),first:(0,p["default"])(b("item","first"),r.first),last:(0,p["default"])(b("item","last"),r.last),active:(0,p["default"])(b("item","active"),r.active),disabled:(0,p["default"])(b("item","disabled"),r.disabled)};return a=(0,c["default"])(a,y),{init:function(e){var t=e.helper;this.setCurrentPage=function(e){t.setCurrentPage(e),R!==!1&&R.scrollIntoView(),t.search()}},getMaxPage:function(e){return void 0!==s?Math.min(s,e.nbPages):e.nbPages},render:function(e){var t=e.results,n=e.state,r=e.createURL;u["default"].render(i(S,{createURL:function(e){return r(n.setPage(e))},cssClasses:O,currentPage:t.page,labels:a,nbHits:t.nbHits,nbPages:this.getMaxPage(t),padding:f,setCurrentPage:this.setCurrentPage,shouldAutoHideContainer:0===t.nbHits,showFirstLast:v}),E)}}}Object.defineProperty(t,"__esModule",{value:!0});var i=function(){var e="function"==typeof Symbol&&Symbol["for"]&&Symbol["for"]("react.element")||60103;return function(t,n,r,o){var i=t&&t.defaultProps,a=arguments.length-3;if(n||0===a||(n={}),n&&i)for(var s in i)void 0===n[s]&&(n[s]=i[s]);else n||(n=i||{});if(1===a)n.children=o;else if(a>1){for(var u=Array(a),l=0;a>l;l++)u[l]=arguments[l+3];n.children=u}return{$$typeof:e,type:t,key:void 0===r?null:""+r,ref:null,props:n,_owner:null}}}(),a=n(223),s=(r(a),n(254)),u=r(s),l=n(136),c=r(l),f=n(389),p=r(f),d=n(385),h=n(390),m=r(h),v=n(426),g=r(v),y={previous:"‹",next:"›",first:"«",last:"»"},b=(0,d.bemHelper)("ais-pagination"),_="Usage:\npagination({\n  container,\n  [ cssClasses.{root,item,page,previous,next,first,last,active,disabled}={} ],\n  [ labels.{previous,next,first,last} ],\n  [ maxPages ],\n  [ padding=3 ],\n  [ showFirstLast=true ],\n  [ autoHideContainer=true ],\n  [ scrollTo='body' ]\n})";t["default"]=o},function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{"default":e}}function o(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function i(e,t){if(!e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!t||"object"!=typeof t&&"function"!=typeof t?e:t}function a(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function, not "+typeof t);e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),t&&(Object.setPrototypeOf?Object.setPrototypeOf(e,t):e.__proto__=t)}Object.defineProperty(t,"__esModule",{value:!0});var s=function(){var e="function"==typeof Symbol&&Symbol["for"]&&Symbol["for"]("react.element")||60103;return function(t,n,r,o){var i=t&&t.defaultProps,a=arguments.length-3;if(n||0===a||(n={}),n&&i)for(var s in i)void 0===n[s]&&(n[s]=i[s]);else n||(n=i||{});if(1===a)n.children=o;else if(a>1){for(var u=Array(a),l=0;a>l;l++)u[l]=arguments[l+3];n.children=u}return{$$typeof:e,type:t,key:void 0===r?null:""+r,ref:null,props:n,_owner:null}}}(),u=function(){function e(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(t,n,r){return n&&e(t.prototype,n),r&&e(t,r),t}}(),l=n(223),c=r(l),f=n(15),p=r(f),d=n(427),h=r(d),m=n(385),v=n(429),g=r(v),y=n(431),b=r(y),_=n(389),C=r(_),w=function(e){function t(e){o(this,t);var n=i(this,Object.getPrototypeOf(t).call(this,(0,h["default"])(e,t.defaultProps)));return n.handleClick=n.handleClick.bind(n),n}return a(t,e),u(t,[{key:"pageLink",value:function(e){var t=e.label,n=e.ariaLabel,r=e.pageNumber,o=e.additionalClassName,i=void 0===o?null:o,a=e.isDisabled,u=void 0===a?!1:a,l=e.isActive,c=void 0===l?!1:l,f=e.createURL,p={item:(0,C["default"])(this.props.cssClasses.item,i),link:(0,C["default"])(this.props.cssClasses.link)};u?p.item=(0,C["default"])(p.item,this.props.cssClasses.disabled):c&&(p.item=(0,C["default"])(p.item,this.props.cssClasses.active));var d=f&&!u?f(r):"#";return s(b["default"],{ariaLabel:n,cssClasses:p,handleClick:this.handleClick,isDisabled:u,label:t,pageNumber:r,url:d},t+r)}},{key:"previousPageLink",value:function(e,t){return this.pageLink({ariaLabel:"Previous",additionalClassName:this.props.cssClasses.previous,isDisabled:e.isFirstPage(),label:this.props.labels.previous,pageNumber:e.currentPage-1,createURL:t})}},{key:"nextPageLink",value:function(e,t){return this.pageLink({ariaLabel:"Next",additionalClassName:this.props.cssClasses.next,isDisabled:e.isLastPage(),label:this.props.labels.next,pageNumber:e.currentPage+1,createURL:t})}},{key:"firstPageLink",value:function(e,t){return this.pageLink({ariaLabel:"First",additionalClassName:this.props.cssClasses.first,isDisabled:e.isFirstPage(),label:this.props.labels.first,pageNumber:0,createURL:t})}},{key:"lastPageLink",value:function(e,t){return this.pageLink({ariaLabel:"Last",additionalClassName:this.props.cssClasses.last,isDisabled:e.isLastPage(),label:this.props.labels.last,pageNumber:e.total-1,createURL:t})}},{key:"pages",value:function n(e,t){var r=this,n=[];return(0,p["default"])(e.pages(),function(o){var i=o===e.currentPage;n.push(r.pageLink({ariaLabel:o+1,additionalClassName:r.props.cssClasses.page,isActive:i,label:o+1,pageNumber:o,createURL:t}))}),n}},{key:"handleClick",value:function(e,t){(0,m.isSpecialClick)(t)||(t.preventDefault(),this.props.setCurrentPage(e))}},{key:"render",value:function(){var e=new g["default"]({currentPage:this.props.currentPage,total:this.props.nbPages,padding:this.props.padding}),t=this.props.createURL;return s("ul",{className:this.props.cssClasses.root},void 0,this.props.showFirstLast?this.firstPageLink(e,t):null,this.previousPageLink(e,t),this.pages(e,t),this.nextPageLink(e,t),this.props.showFirstLast?this.lastPageLink(e,t):null)}}]),t}(c["default"].Component);w.defaultProps={nbHits:0,currentPage:0,nbPages:0},t["default"]=w},function(e,t,n){var r=n(140),o=n(80),i=n(428),a=r(o,i);e.exports=a},function(e,t,n){function r(e,t){return void 0===e?t:o(e,t,r)}var o=n(80);e.exports=r},function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{"default":e}}function o(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}Object.defineProperty(t,"__esModule",{value:!0});var i=function(){function e(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(t,n,r){return n&&e(t.prototype,n),r&&e(t,r),t}}(),a=n(430),s=r(a),u=function(){function e(t){o(this,e),this.currentPage=t.currentPage,this.total=t.total,this.padding=t.padding}return i(e,[{key:"pages",value:function(){var e=this.total,t=this.currentPage,n=this.padding,r=this.nbPagesDisplayed(n,e);if(r===e)return(0,s["default"])(0,e);var o=this.calculatePaddingLeft(t,n,e,r),i=r-o,a=t-o,u=t+i;return(0,s["default"])(a,u)}},{key:"nbPagesDisplayed",value:function(e,t){return Math.min(2*e+1,t)}},{key:"calculatePaddingLeft",value:function(e,t,n,r){return t>=e?e:e>=n-t?r-(n-e):t}},{key:"isLastPage",value:function(){return this.currentPage===this.total-1}},{key:"isFirstPage",value:function(){return 0===this.currentPage}}]),e}();t["default"]=u},function(e,t,n){function r(e,t,n){n&&o(e,t,n)&&(t=n=void 0),e=+e||0,n=null==n?1:+n||0,null==t?(t=e,e=0):t=+t||0;for(var r=-1,s=a(i((t-e)/(n||1)),0),u=Array(s);++r<s;)u[r]=e,e+=n;return u}var o=n(54),i=Math.ceil,a=Math.max;e.exports=r},function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{"default":e}}function o(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function i(e,t){if(!e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!t||"object"!=typeof t&&"function"!=typeof t?e:t}function a(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function, not "+typeof t);e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),t&&(Object.setPrototypeOf?Object.setPrototypeOf(e,t):e.__proto__=t)}Object.defineProperty(t,"__esModule",{value:!0});var s=function(){var e="function"==typeof Symbol&&Symbol["for"]&&Symbol["for"]("react.element")||60103;return function(t,n,r,o){var i=t&&t.defaultProps,a=arguments.length-3;if(n||0===a||(n={}),n&&i)for(var s in i)void 0===n[s]&&(n[s]=i[s]);else n||(n=i||{});if(1===a)n.children=o;else if(a>1){for(var u=Array(a),l=0;a>l;l++)u[l]=arguments[l+3];n.children=u}return{$$typeof:e,type:t,key:void 0===r?null:""+r,ref:null,props:n,_owner:null}}}(),u=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var r in n)Object.prototype.hasOwnProperty.call(n,r)&&(e[r]=n[r])}return e},l=function(){function e(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(t,n,r){return n&&e(t.prototype,n),r&&e(t,r),t}}(),c=n(223),f=r(c),p=n(129),d=r(p),h=function(e){function t(){return o(this,t),i(this,Object.getPrototypeOf(t).apply(this,arguments))}return a(t,e),l(t,[{key:"componentWillMount",value:function(){this.handleClick=this.handleClick.bind(this)}},{key:"shouldComponentUpdate",value:function(e){return!(0,d["default"])(this.props,e)}},{key:"handleClick",value:function(e){this.props.handleClick(this.props.pageNumber,e)}},{key:"render",value:function(){var e=this.props,t=e.cssClasses,n=e.label,r=e.ariaLabel,o=e.url,i=e.isDisabled,a="span",l={className:t.link,dangerouslySetInnerHTML:{__html:n}};i||(a="a",l=u({},l,{ariaLabel:r,href:o,
onClick:this.handleClick}));var c=f["default"].createElement(a,l);return s("li",{className:t.item},void 0,c)}}]),t}(f["default"].Component);t["default"]=h},function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{"default":e}}function o(){var e=arguments.length<=0||void 0===arguments[0]?{}:arguments[0],t=e.container,n=e.attributeName,r=e.cssClasses,o=void 0===r?{}:r,s=e.templates,u=void 0===s?h["default"]:s,f=e.collapsible,d=void 0===f?!1:f,m=e.labels,g=void 0===m?{}:m,b=e.currency,C=void 0===b?"$":b,E=e.autoHideContainer,R=void 0===E?!0:E;if(!t||!n)throw new Error(P);var S=(0,c.getContainerNode)(t),O=(0,y["default"])(w["default"]);R===!0&&(O=(0,v["default"])(O));var T=a({button:"Go",separator:"to"},g),k={root:(0,_["default"])(x(null),o.root),header:(0,_["default"])(x("header"),o.header),body:(0,_["default"])(x("body"),o.body),list:(0,_["default"])(x("list"),o.list),link:(0,_["default"])(x("link"),o.link),item:(0,_["default"])(x("item"),o.item),active:(0,_["default"])(x("item","active"),o.active),form:(0,_["default"])(x("form"),o.form),label:(0,_["default"])(x("label"),o.label),input:(0,_["default"])(x("input"),o.input),currency:(0,_["default"])(x("currency"),o.currency),button:(0,_["default"])(x("button"),o.button),separator:(0,_["default"])(x("separator"),o.separator),footer:(0,_["default"])(x("footer"),o.footer)};return void 0!==g.currency&&g.currency!==C&&(C=g.currency),{getConfiguration:function(){return{facets:[n]}},_generateRanges:function(e){var t=e.getFacetStats(n);return(0,p["default"])(t)},_extractRefinedRange:function(e){var t=e.getRefinements(n),r=void 0,o=void 0;return 0===t.length?[]:(t.forEach(function(e){-1!==e.operator.indexOf(">")?r=Math.floor(e.value[0]):-1!==e.operator.indexOf("<")&&(o=Math.ceil(e.value[0]))}),[{from:r,to:o,isRefined:!0}])},_refine:function(e,t,r){var o=this._extractRefinedRange(e);e.clearRefinements(n),0!==o.length&&o[0].from===t&&o[0].to===r||("undefined"!=typeof t&&e.addNumericRefinement(n,">=",Math.floor(t)),"undefined"!=typeof r&&e.addNumericRefinement(n,"<=",Math.ceil(r))),e.search()},init:function(e){var t=e.helper,n=e.templatesConfig;this._refine=this._refine.bind(this,t),this._templateProps=(0,c.prepareTemplateProps)({defaultTemplates:h["default"],templatesConfig:n,templates:u})},render:function(e){var t=e.results,r=e.helper,o=e.state,a=e.createURL,s=void 0;t.hits.length>0?(s=this._extractRefinedRange(r),0===s.length&&(s=this._generateRanges(t))):s=[],s.map(function(e){var t=o.clearRefinements(n);return e.isRefined||(void 0!==e.from&&(t=t.addNumericRefinement(n,">=",Math.floor(e.from))),void 0!==e.to&&(t=t.addNumericRefinement(n,"<=",Math.ceil(e.to)))),e.url=a(t),e}),l["default"].render(i(O,{collapsible:d,cssClasses:k,currency:C,facetValues:s,labels:T,refine:this._refine,shouldAutoHideContainer:0===s.length,templateProps:this._templateProps}),S)}}}Object.defineProperty(t,"__esModule",{value:!0});var i=function(){var e="function"==typeof Symbol&&Symbol["for"]&&Symbol["for"]("react.element")||60103;return function(t,n,r,o){var i=t&&t.defaultProps,a=arguments.length-3;if(n||0===a||(n={}),n&&i)for(var s in i)void 0===n[s]&&(n[s]=i[s]);else n||(n=i||{});if(1===a)n.children=o;else if(a>1){for(var u=Array(a),l=0;a>l;l++)u[l]=arguments[l+3];n.children=u}return{$$typeof:e,type:t,key:void 0===r?null:""+r,ref:null,props:n,_owner:null}}}(),a=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var r in n)Object.prototype.hasOwnProperty.call(n,r)&&(e[r]=n[r])}return e},s=n(223),u=(r(s),n(254)),l=r(u),c=n(385),f=n(433),p=r(f),d=n(434),h=r(d),m=n(390),v=r(m),g=n(391),y=r(g),b=n(389),_=r(b),C=n(435),w=r(C),x=(0,c.bemHelper)("ais-price-ranges"),P="Usage:\npriceRanges({\n  container,\n  attributeName,\n  [ currency=$ ],\n  [ cssClasses.{root,header,body,list,item,active,link,form,label,input,currency,separator,button,footer} ],\n  [ templates.{header,item,footer} ],\n  [ labels.{currency,separator,button} ],\n  [ autoHideContainer=true ],\n  [ collapsible=false ]\n})";t["default"]=o},function(e,t){"use strict";function n(e,t){var n=Math.round(e/t)*t;return 1>n&&(n=1),n}function r(e){var t=void 0;t=e.avg<100?1:e.avg<1e3?10:100;for(var r=n(Math.round(e.avg),t),o=Math.ceil(e.min),i=n(Math.floor(e.max),t);i>e.max;)i-=t;var a=void 0,s=void 0,u=[];if(o!==i){for(a=o,u.push({to:a});r>a;)s=u[u.length-1].to,a=n(s+(r-o)/3,t),s>=a&&(a=s+1),u.push({from:s,to:a});for(;i>a;)s=u[u.length-1].to,a=n(s+(i-r)/3,t),s>=a&&(a=s+1),u.push({from:s,to:a});1===u.length&&a!==r&&(u.push({from:a,to:r}),a=r),1===u.length?(u[0].from=e.min,u[0].to=e.max):delete u[u.length-1].to}return u}Object.defineProperty(t,"__esModule",{value:!0}),t["default"]=r},function(e,t){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t["default"]={header:"",item:"\n    {{#from}}\n      {{^to}}\n        &ge;\n      {{/to}}\n      {{currency}}{{from}}\n    {{/from}}\n    {{#to}}\n      {{#from}}\n        -\n      {{/from}}\n      {{^from}}\n        &le;\n      {{/from}}\n      {{to}}\n    {{/to}}\n  ",footer:""}},function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{"default":e}}function o(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function i(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function a(e,t){if(!e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!t||"object"!=typeof t&&"function"!=typeof t?e:t}function s(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function, not "+typeof t);e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),t&&(Object.setPrototypeOf?Object.setPrototypeOf(e,t):e.__proto__=t)}Object.defineProperty(t,"__esModule",{value:!0});var u=function(){var e="function"==typeof Symbol&&Symbol["for"]&&Symbol["for"]("react.element")||60103;return function(t,n,r,o){var i=t&&t.defaultProps,a=arguments.length-3;if(n||0===a||(n={}),n&&i)for(var s in i)void 0===n[s]&&(n[s]=i[s]);else n||(n=i||{});if(1===a)n.children=o;else if(a>1){for(var u=Array(a),l=0;a>l;l++)u[l]=arguments[l+3];n.children=u}return{$$typeof:e,type:t,key:void 0===r?null:""+r,ref:null,props:n,_owner:null}}}(),l=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var r in n)Object.prototype.hasOwnProperty.call(n,r)&&(e[r]=n[r])}return e},c=function(){function e(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(t,n,r){return n&&e(t.prototype,n),r&&e(t,r),t}}(),f=n(223),p=r(f),d=n(392),h=r(d),m=n(436),v=r(m),g=n(389),y=r(g),b=n(129),_=r(b),C=function(e){function t(){return i(this,t),a(this,Object.getPrototypeOf(t).apply(this,arguments))}return s(t,e),c(t,[{key:"componentWillMount",value:function(){this.refine=this.refine.bind(this),this.form=this.getForm()}},{key:"shouldComponentUpdate",value:function(e){return!(0,_["default"])(this.props.facetValues,e.facetValues)}},{key:"getForm",value:function(){var e=l({currency:this.props.currency},this.props.labels);return u(v["default"],{cssClasses:this.props.cssClasses,labels:e,refine:this.refine})}},{key:"getItemFromFacetValue",value:function(e){var t=(0,y["default"])(this.props.cssClasses.item,o({},this.props.cssClasses.active,e.isRefined)),n=e.from+"_"+e.to,r=this.refine.bind(this,e.from,e.to),i=l({currency:this.props.currency},e);return u("div",{className:t},n,u("a",{className:this.props.cssClasses.link,href:e.url,onClick:r},void 0,p["default"].createElement(h["default"],l({data:i,templateKey:"item"},this.props.templateProps))))}},{key:"refine",value:function(e,t,n){n.preventDefault(),this.props.refine(e,t)}},{key:"render",value:function(){var e=this;return u("div",{},void 0,u("div",{className:this.props.cssClasses.list},void 0,this.props.facetValues.map(function(t){return e.getItemFromFacetValue(t)})),this.form)}}]),t}(p["default"].Component);C.defaultProps={cssClasses:{}},t["default"]=C},function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{"default":e}}function o(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function i(e,t){if(!e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!t||"object"!=typeof t&&"function"!=typeof t?e:t}function a(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function, not "+typeof t);e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),t&&(Object.setPrototypeOf?Object.setPrototypeOf(e,t):e.__proto__=t)}Object.defineProperty(t,"__esModule",{value:!0});var s=function(){var e="function"==typeof Symbol&&Symbol["for"]&&Symbol["for"]("react.element")||60103;return function(t,n,r,o){var i=t&&t.defaultProps,a=arguments.length-3;if(n||0===a||(n={}),n&&i)for(var s in i)void 0===n[s]&&(n[s]=i[s]);else n||(n=i||{});if(1===a)n.children=o;else if(a>1){for(var u=Array(a),l=0;a>l;l++)u[l]=arguments[l+3];n.children=u}return{$$typeof:e,type:t,key:void 0===r?null:""+r,ref:null,props:n,_owner:null}}}(),u=function(){function e(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(t,n,r){return n&&e(t.prototype,n),r&&e(t,r),t}}(),l=n(223),c=r(l),f=function(e){function t(){return o(this,t),i(this,Object.getPrototypeOf(t).apply(this,arguments))}return a(t,e),u(t,[{key:"componentWillMount",value:function(){this.handleSubmit=this.handleSubmit.bind(this)}},{key:"shouldComponentUpdate",value:function(){return!1}},{key:"getInput",value:function(e){return s("label",{className:this.props.cssClasses.label},void 0,s("span",{className:this.props.cssClasses.currency},void 0,this.props.labels.currency," "),c["default"].createElement("input",{className:this.props.cssClasses.input,ref:e,type:"number"}))}},{key:"handleSubmit",value:function(e){var t=+this.refs.from.value||void 0,n=+this.refs.to.value||void 0;this.props.refine(t,n,e)}},{key:"render",value:function(){var e=this.getInput("from"),t=this.getInput("to"),n=this.handleSubmit;return c["default"].createElement("form",{className:this.props.cssClasses.form,onSubmit:n,ref:"form"},e,s("span",{className:this.props.cssClasses.separator},void 0," ",this.props.labels.separator," "),t,s("button",{className:this.props.cssClasses.button,type:"submit"},void 0,this.props.labels.button))}}]),t}(c["default"].Component);f.defaultProps={cssClasses:{},labels:{}},t["default"]=f},function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{"default":e}}function o(e){var t=e.container,n=e.placeholder,r=void 0===n?"":n,o=e.cssClasses,a=void 0===o?{}:o,c=e.poweredBy,f=void 0===c?!1:c,h=e.wrapInput,v=void 0===h?!0:h,y=e.autofocus,P=void 0===y?"auto":y,E=e.searchOnEnterKeyPressOnly,R=void 0===E?!1:E,S=e.queryHook,O=window.addEventListener?"input":"propertychange";if(!t)throw new Error(x);return t=(0,d.getContainerNode)(t),"boolean"!=typeof P&&(P="auto"),{getInput:function(){return"INPUT"===t.tagName?t:document.createElement("input")},wrapInput:function(e){var t=document.createElement("div"),n=(0,g["default"])(_(null),a.root).split(" ");return n.forEach(function(e){return t.classList.add(e)}),t.appendChild(e),t},addDefaultAttributesToInput:function(e,t){var n={autocapitalize:"off",autocomplete:"off",autocorrect:"off",placeholder:r,role:"textbox",spellcheck:"false",type:"text",value:t};(0,m["default"])(n,function(t,n){e.hasAttribute(n)||e.setAttribute(n,t)});var o=(0,g["default"])(_("input"),a.input).split(" ");o.forEach(function(t){return e.classList.add(t)})},addPoweredBy:function(e){var t=document.createElement("div");e.parentNode.insertBefore(t,e.nextSibling);var n={root:(0,g["default"])(_("powered-by"),a.poweredBy),link:_("powered-by-link")},r="https://www.algolia.com/?utm_source=instantsearch.js&utm_medium=website&"+("utm_content="+location.hostname+"&")+"utm_campaign=poweredby";p["default"].render(l(b["default"],{cssClasses:n,link:r}),t)},init:function(e){function n(e){return e!==a.state.query?S?void S(e,r):void r(e):void 0}function r(e){a.setQuery(e),a.search()}var o=e.state,a=e.helper,l=e.onHistoryChange,c="INPUT"===t.tagName,p=this._input=this.getInput();if(this.addDefaultAttributesToInput(p,o.query),R?i(p,"keyup",s(C,u(n))):(i(p,O,u(n)),("propertychange"===O||window.attachEvent)&&i(p,"keyup",s(w,u(n)))),c){var d=document.createElement("div");p.parentNode.insertBefore(d,p);var h=p.parentNode,m=v?this.wrapInput(p):p;h.replaceChild(m,d)}else{var g=v?this.wrapInput(p):p;t.appendChild(g)}f&&this.addPoweredBy(p),l(function(e){p.value=e.query||""}),(P===!0||"auto"===P&&""===a.state.query)&&p.focus()},render:function(e){var t=e.helper;document.activeElement!==this._input&&t.state.query!==this._input.value&&(this._input.value=t.state.query)}}}function i(e,t,n){e.addEventListener?e.addEventListener(t,n):e.attachEvent("on"+t,n)}function a(e){return(e.currentTarget?e.currentTarget:e.srcElement).value}function s(e,t){return function(n){return n.keyCode===e&&t(n)}}function u(e){return function(t){return e(a(t))}}Object.defineProperty(t,"__esModule",{value:!0});var l=function(){var e="function"==typeof Symbol&&Symbol["for"]&&Symbol["for"]("react.element")||60103;return function(t,n,r,o){var i=t&&t.defaultProps,a=arguments.length-3;if(n||0===a||(n={}),n&&i)for(var s in i)void 0===n[s]&&(n[s]=i[s]);else n||(n=i||{});if(1===a)n.children=o;else if(a>1){for(var u=Array(a),l=0;a>l;l++)u[l]=arguments[l+3];n.children=u}return{$$typeof:e,type:t,key:void 0===r?null:""+r,ref:null,props:n,_owner:null}}}(),c=n(223),f=(r(c),n(254)),p=r(f),d=n(385),h=n(15),m=r(h),v=n(389),g=r(v),y=n(438),b=r(y),_=(0,d.bemHelper)("ais-search-box"),C=13,w=8,x="Usage:\nsearchBox({\n  container,\n  [ placeholder ],\n  [ cssClasses.{input,poweredBy} ],\n  [ poweredBy ],\n  [ wrapInput ],\n  [ autofocus ],\n  [ searchOnEnterKeyPressOnly ],\n  [ queryHook ]\n})";t["default"]=o},function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{"default":e}}function o(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function i(e,t){if(!e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!t||"object"!=typeof t&&"function"!=typeof t?e:t}function a(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function, not "+typeof t);e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),t&&(Object.setPrototypeOf?Object.setPrototypeOf(e,t):e.__proto__=t)}Object.defineProperty(t,"__esModule",{value:!0});var s=function(){var e="function"==typeof Symbol&&Symbol["for"]&&Symbol["for"]("react.element")||60103;return function(t,n,r,o){var i=t&&t.defaultProps,a=arguments.length-3;if(n||0===a||(n={}),n&&i)for(var s in i)void 0===n[s]&&(n[s]=i[s]);else n||(n=i||{});if(1===a)n.children=o;else if(a>1){for(var u=Array(a),l=0;a>l;l++)u[l]=arguments[l+3];n.children=u}return{$$typeof:e,type:t,key:void 0===r?null:""+r,ref:null,props:n,_owner:null}}}(),u=function(){function e(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(t,n,r){return n&&e(t.prototype,n),r&&e(t,r),t}}(),l=n(223),c=r(l),f=function(e){function t(){return o(this,t),i(this,Object.getPrototypeOf(t).apply(this,arguments))}return a(t,e),u(t,[{key:"shouldComponentUpdate",value:function(){return!1}},{key:"render",value:function(){return s("div",{className:this.props.cssClasses.root},void 0,"Search by",s("a",{className:this.props.cssClasses.link,href:this.props.link,target:"_blank"},void 0,"Algolia"))}}]),t}(c["default"].Component);t["default"]=f},function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{"default":e}}function o(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function i(){var e=arguments.length<=0||void 0===arguments[0]?{}:arguments[0],t=e.container,n=e.attributeName,r=e.tooltips,i=void 0===r?!0:r,s=e.templates,u=void 0===s?w:s,f=e.collapsible,d=void 0===f?!1:f,m=e.cssClasses,g=void 0===m?{}:m,b=e.step,P=void 0===b?1:b,E=e.pips,R=void 0===E?!0:E,S=e.autoHideContainer,O=void 0===S?!0:S,T=e.min,k=e.max;if(!t||!n)throw new Error(x);var N=(0,c.getContainerNode)(t),j=(0,v["default"])(_["default"]);O===!0&&(j=(0,h["default"])(j));var A={root:(0,y["default"])(C(null),g.root),header:(0,y["default"])(C("header"),g.header),body:(0,y["default"])(C("body"),g.body),footer:(0,y["default"])(C("footer"),g.footer)};return{getConfiguration:function(e){var t={disjunctiveFacets:[n]};return void 0===T&&void 0===k||e&&(!e.numericRefinements||void 0!==e.numericRefinements[n])||(t.numericRefinements=o({},n,{}),void 0!==T&&(t.numericRefinements[n][">="]=[T]),void 0!==k&&(t.numericRefinements[n]["<="]=[k])),t},_getCurrentRefinement:function(e){var t=e.state.getNumericRefinement(n,">="),r=e.state.getNumericRefinement(n,"<=");return t=t&&t.length?t[0]:-(1/0),r=r&&r.length?r[0]:1/0,{min:t,max:r}},_refine:function(e,t,r){e.clearRefinements(n),r[0]>t.min&&e.addNumericRefinement(n,">=",r[0]),r[1]<t.max&&e.addNumericRefinement(n,"<=",r[1]),e.search()},init:function(e){var t=e.templatesConfig;this._templateProps=(0,c.prepareTemplateProps)({defaultTemplates:w,templatesConfig:t,templates:u})},render:function(e){var t=e.results,r=e.helper,o=(0,p["default"])(t.disjunctiveFacets,{name:n}),s=void 0;void 0!==T||void 0!==k?(s={},void 0!==T&&(s.min=T),void 0!==k&&(s.max=k)):s=void 0!==o&&void 0!==o.stats?o.stats:{min:null,max:null};var u=this._getCurrentRefinement(r);void 0!==i.format&&(i=[{to:i.format},{to:i.format}]),l["default"].render(a(j,{collapsible:d,cssClasses:A,onChange:this._refine.bind(this,r,s),pips:R,range:{min:Math.floor(s.min),max:Math.ceil(s.max)},shouldAutoHideContainer:s.min===s.max,start:[u.min,u.max],step:P,templateProps:this._templateProps,tooltips:i}),N)}}}Object.defineProperty(t,"__esModule",{value:!0});var a=function(){var e="function"==typeof Symbol&&Symbol["for"]&&Symbol["for"]("react.element")||60103;return function(t,n,r,o){var i=t&&t.defaultProps,a=arguments.length-3;if(n||0===a||(n={}),n&&i)for(var s in i)void 0===n[s]&&(n[s]=i[s]);else n||(n=i||{});if(1===a)n.children=o;else if(a>1){for(var u=Array(a),l=0;a>l;l++)u[l]=arguments[l+3];n.children=u}return{$$typeof:e,type:t,key:void 0===r?null:""+r,ref:null,props:n,_owner:null}}}(),s=n(223),u=(r(s),n(254)),l=r(u),c=n(385),f=n(131),p=r(f),d=n(390),h=r(d),m=n(391),v=r(m),g=n(389),y=r(g),b=n(440),_=r(b),C=(0,c.bemHelper)("ais-range-slider"),w={header:"",footer:""},x="Usage:\nrangeSlider({\n  container,\n  attributeName,\n  [ tooltips=true ],\n  [ templates.{header, footer} ],\n  [ cssClasses.{root, header, body, footer} ],\n  [ step=1 ],\n  [ pips=true ],\n  [ autoHideContainer=true ],\n  [ collapsible=false ],\n  [ min ],\n  [ max ]\n});\n";t["default"]=i},function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{"default":e}}function o(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function i(e,t){if(!e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!t||"object"!=typeof t&&"function"!=typeof t?e:t}function a(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function, not "+typeof t);e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),t&&(Object.setPrototypeOf?Object.setPrototypeOf(e,t):e.__proto__=t)}Object.defineProperty(t,"__esModule",{value:!0});var s=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var r in n)Object.prototype.hasOwnProperty.call(n,r)&&(e[r]=n[r])}return e},u=function(){function e(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(t,n,r){return n&&e(t.prototype,n),r&&e(t,r),t}}(),l=n(223),c=r(l),f=n(441),p=r(f),d=n(129),h=r(d),m="ais-range-slider--",v=function(e){function t(){return o(this,t),i(this,Object.getPrototypeOf(t).apply(this,arguments))}return a(t,e),u(t,[{key:"componentWillMount",value:function(){this.handleChange=this.handleChange.bind(this)}},{key:"shouldComponentUpdate",value:function(e){return!(0,h["default"])(this.props.range,e.range)||!(0,h["default"])(this.props.start,e.start)}},{key:"handleChange",value:function(e,t,n){this.props.onChange(n)}},{key:"render",value:function(){if(this.props.range.min===this.props.range.max)return null;var e=void 0;return e=this.props.pips===!1?void 0:this.props.pips===!0||"undefined"==typeof this.props.pips?{mode:"positions",density:3,values:[0,50,100],stepped:!0,format:{to:function(e){return Number(e).toLocaleString()}}}:this.props.pips,c["default"].createElement(p["default"],s({},this.props,{animate:!1,behaviour:"snap",connect:!0,cssPrefix:m,onChange:this.handleChange,pips:e}))}}]),t}(c["default"].Component);t["default"]=v},function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{"default":e}}function o(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function i(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function, not "+typeof t);e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),t&&(Object.setPrototypeOf?Object.setPrototypeOf(e,t):e.__proto__=t)}var a=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var r in n)Object.prototype.hasOwnProperty.call(n,r)&&(e[r]=n[r])}return e},s=function(){function e(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(t,n,r){return n&&e(t.prototype,n),r&&e(t,r),t}}(),u=function(e,t,n){for(var r=!0;r;){var o=e,i=t,a=n;r=!1,null===o&&(o=Function.prototype);var s=Object.getOwnPropertyDescriptor(o,i);if(void 0!==s){if("value"in s)return s.value;var u=s.get;if(void 0===u)return;return u.call(a)}var l=Object.getPrototypeOf(o);if(null===l)return;e=l,t=i,n=a,r=!0,s=l=void 0}},l=n(223),c=r(l),f=n(442),p=r(f),d=function(e){function t(){o(this,t),u(Object.getPrototypeOf(t.prototype),"constructor",this).apply(this,arguments)}return i(t,e),s(t,[{key:"componentDidMount",value:function(){this.props.disabled?this.sliderContainer.setAttribute("disabled",!0):this.sliderContainer.removeAttribute("disabled"),this.createSlider()}},{key:"componentDidUpdate",value:function(){this.props.disabled?this.sliderContainer.setAttribute("disabled",!0):this.sliderContainer.removeAttribute("disabled"),this.slider.destroy(),this.createSlider()}},{key:"componentWillUnmount",value:function(){this.slider.destroy()}},{key:"createSlider",value:function(){var e=this.slider=p["default"].create(this.sliderContainer,a({},this.props));this.props.onUpdate&&e.on("update",this.props.onUpdate),this.props.onChange&&e.on("change",this.props.onChange),this.props.onSlide&&e.on("slide",this.props.onSlide)}},{key:"render",value:function(){var e=this;return c["default"].createElement("div",{ref:function(t){e.sliderContainer=t}})}}]),t}(c["default"].Component);d.propTypes={animate:c["default"].PropTypes.bool,behaviour:c["default"].PropTypes.string,connect:c["default"].PropTypes.oneOfType([c["default"].PropTypes.oneOf(["lower","upper"]),c["default"].PropTypes.bool]),cssPrefix:c["default"].PropTypes.string,direction:c["default"].PropTypes.oneOf(["ltr","rtl"]),disabled:c["default"].PropTypes.bool,limit:c["default"].PropTypes.number,margin:c["default"].PropTypes.number,onChange:c["default"].PropTypes.func,onSlide:c["default"].PropTypes.func,onUpdate:c["default"].PropTypes.func,orientation:c["default"].PropTypes.oneOf(["horizontal","vertical"]),pips:c["default"].PropTypes.object,range:c["default"].PropTypes.object.isRequired,start:c["default"].PropTypes.arrayOf(c["default"].PropTypes.number).isRequired,step:c["default"].PropTypes.number,tooltips:c["default"].PropTypes.oneOfType([c["default"].PropTypes.bool,c["default"].PropTypes.arrayOf(c["default"].PropTypes.shape({to:c["default"].PropTypes.func}))])},e.exports=d},function(e,t,n){var r,o,i;!function(n){o=[],r=n,i="function"==typeof r?r.apply(t,o):r,!(void 0!==i&&(e.exports=i))}(function(){"use strict";function e(e){return e.filter(function(e){return this[e]?!1:this[e]=!0},{})}function t(e,t){return Math.round(e/t)*t}function n(e){var t=e.getBoundingClientRect(),n=e.ownerDocument,r=n.documentElement,o=p();return/webkit.*Chrome.*Mobile/i.test(navigator.userAgent)&&(o.x=0),{top:t.top+o.y-r.clientTop,left:t.left+o.x-r.clientLeft}}function r(e){return"number"==typeof e&&!isNaN(e)&&isFinite(e)}function o(e){var t=Math.pow(10,7);return Number((Math.round(e*t)/t).toFixed(7))}function i(e,t,n){l(e,t),setTimeout(function(){c(e,t)},n)}function a(e){return Math.max(Math.min(e,100),0)}function s(e){return Array.isArray(e)?e:[e]}function u(e){var t=e.split(".");return t.length>1?t[1].length:0}function l(e,t){e.classList?e.classList.add(t):e.className+=" "+t}function c(e,t){e.classList?e.classList.remove(t):e.className=e.className.replace(new RegExp("(^|\\b)"+t.split(" ").join("|")+"(\\b|$)","gi")," ")}function f(e,t){return e.classList?e.classList.contains(t):new RegExp("\\b"+t+"\\b").test(e.className)}function p(){var e=void 0!==window.pageXOffset,t="CSS1Compat"===(document.compatMode||""),n=e?window.pageXOffset:t?document.documentElement.scrollLeft:document.body.scrollLeft,r=e?window.pageYOffset:t?document.documentElement.scrollTop:document.body.scrollTop;return{x:n,y:r}}function d(e){e.stopPropagation()}function h(e){return function(t){return e+t}}function m(){W||(W=window.navigator.pointerEnabled?{start:"pointerdown",move:"pointermove",end:"pointerup"}:window.navigator.msPointerEnabled?{start:"MSPointerDown",move:"MSPointerMove",end:"MSPointerUp"}:{start:"mousedown touchstart",move:"mousemove touchmove",end:"mouseup touchend"})}function v(e,t){return 100/(t-e)}function g(e,t){return 100*t/(e[1]-e[0])}function y(e,t){return g(e,e[0]<0?t+Math.abs(e[0]):t-e[0])}function b(e,t){return t*(e[1]-e[0])/100+e[0]}function _(e,t){for(var n=1;e>=t[n];)n+=1;return n}function C(e,t,n){if(n>=e.slice(-1)[0])return 100;var r,o,i,a,s=_(n,e);return r=e[s-1],o=e[s],i=t[s-1],a=t[s],i+y([r,o],n)/v(i,a)}function w(e,t,n){if(n>=100)return e.slice(-1)[0];var r,o,i,a,s=_(n,t);return r=e[s-1],o=e[s],i=t[s-1],a=t[s],b([r,o],(n-i)*v(i,a))}function x(e,n,r,o){if(100===o)return o;var i,a,s=_(o,e);return r?(i=e[s-1],a=e[s],o-i>(a-i)/2?a:i):n[s-1]?e[s-1]+t(o-e[s-1],n[s-1]):o}function P(e,t,n){var o;if("number"==typeof t&&(t=[t]),"[object Array]"!==Object.prototype.toString.call(t))throw new Error("noUiSlider: 'range' contains invalid value.");if(o="min"===e?0:"max"===e?100:parseFloat(e),!r(o)||!r(t[0]))throw new Error("noUiSlider: 'range' value isn't numeric.");n.xPct.push(o),n.xVal.push(t[0]),o?n.xSteps.push(isNaN(t[1])?!1:t[1]):isNaN(t[1])||(n.xSteps[0]=t[1])}function E(e,t,n){return t?void(n.xSteps[e]=g([n.xVal[e],n.xVal[e+1]],t)/v(n.xPct[e],n.xPct[e+1])):!0}function R(e,t,n,r){this.xPct=[],this.xVal=[],this.xSteps=[r||!1],this.xNumSteps=[!1],this.snap=t,this.direction=n;var o,i=[];for(o in e)e.hasOwnProperty(o)&&i.push([e[o],o]);for(i.length&&"object"==typeof i[0][0]?i.sort(function(e,t){return e[0][0]-t[0][0]}):i.sort(function(e,t){return e[0]-t[0]}),o=0;o<i.length;o++)P(i[o][1],i[o][0],this);for(this.xNumSteps=this.xSteps.slice(0),o=0;o<this.xNumSteps.length;o++)E(o,this.xNumSteps[o],this)}function S(e,t){if(!r(t))throw new Error("noUiSlider: 'step' is not numeric.");e.singleStep=t}function O(e,t){if("object"!=typeof t||Array.isArray(t))throw new Error("noUiSlider: 'range' is not an object.");if(void 0===t.min||void 0===t.max)throw new Error("noUiSlider: Missing 'min' or 'max' in 'range'.");if(t.min===t.max)throw new Error("noUiSlider: 'range' 'min' and 'max' cannot be equal.");e.spectrum=new R(t,e.snap,e.dir,e.singleStep)}function T(e,t){if(t=s(t),!Array.isArray(t)||!t.length||t.length>2)throw new Error("noUiSlider: 'start' option is incorrect.");e.handles=t.length,e.start=t}function k(e,t){if(e.snap=t,"boolean"!=typeof t)throw new Error("noUiSlider: 'snap' option must be a boolean.")}function N(e,t){if(e.animate=t,"boolean"!=typeof t)throw new Error("noUiSlider: 'animate' option must be a boolean.")}function j(e,t){if("lower"===t&&1===e.handles)e.connect=1;else if("upper"===t&&1===e.handles)e.connect=2;else if(t===!0&&2===e.handles)e.connect=3;else{if(t!==!1)throw new Error("noUiSlider: 'connect' option doesn't match handle count.");e.connect=0}}function A(e,t){switch(t){case"horizontal":e.ort=0;break;case"vertical":e.ort=1;break;default:throw new Error("noUiSlider: 'orientation' option is invalid.")}}function M(e,t){if(!r(t))throw new Error("noUiSlider: 'margin' option must be numeric.");if(0!==t&&(e.margin=e.spectrum.getMargin(t),!e.margin))throw new Error("noUiSlider: 'margin' option is only supported on linear sliders.")}function F(e,t){if(!r(t))throw new Error("noUiSlider: 'limit' option must be numeric.");if(e.limit=e.spectrum.getMargin(t),!e.limit)throw new Error("noUiSlider: 'limit' option is only supported on linear sliders.")}function I(e,t){switch(t){case"ltr":e.dir=0;break;case"rtl":e.dir=1,e.connect=[0,2,1,3][e.connect];break;default:throw new Error("noUiSlider: 'direction' option was not recognized.")}}function D(e,t){if("string"!=typeof t)throw new Error("noUiSlider: 'behaviour' must be a string containing options.");var n=t.indexOf("tap")>=0,r=t.indexOf("drag")>=0,o=t.indexOf("fixed")>=0,i=t.indexOf("snap")>=0,a=t.indexOf("hover")>=0;if(r&&!e.connect)throw new Error("noUiSlider: 'drag' behaviour must be used with 'connect': true.");e.events={tap:n||i,drag:r,fixed:o,snap:i,hover:a}}function U(e,t){var n;if(t!==!1)if(t===!0)for(e.tooltips=[],n=0;n<e.handles;n++)e.tooltips.push(!0);else{if(e.tooltips=s(t),e.tooltips.length!==e.handles)throw new Error("noUiSlider: must pass a formatter for all handles.");e.tooltips.forEach(function(e){if("boolean"!=typeof e&&("object"!=typeof e||"function"!=typeof e.to))throw new Error("noUiSlider: 'tooltips' must be passed a formatter or 'false'.")})}}function L(e,t){if(e.format=t,"function"==typeof t.to&&"function"==typeof t.from)return!0;throw new Error("noUiSlider: 'format' requires 'to' and 'from' methods.")}function H(e,t){if(void 0!==t&&"string"!=typeof t)throw new Error("noUiSlider: 'cssPrefix' must be a string.");e.cssPrefix=t}function V(e){var t,n={margin:0,limit:0,animate:!0,format:Q};t={step:{r:!1,t:S},start:{r:!0,t:T},connect:{r:!0,t:j},direction:{r:!0,t:I},snap:{r:!1,t:k},animate:{r:!1,t:N},range:{r:!0,t:O},orientation:{r:!1,t:A},margin:{r:!1,t:M},limit:{r:!1,t:F},behaviour:{r:!0,t:D},format:{r:!1,t:L},tooltips:{r:!1,t:U},cssPrefix:{r:!1,t:H}};var r={connect:!1,direction:"ltr",behaviour:"tap",orientation:"horizontal"};return Object.keys(t).forEach(function(o){if(void 0===e[o]&&void 0===r[o]){if(t[o].r)throw new Error("noUiSlider: '"+o+"' is required.");return!0}t[o].t(n,void 0===e[o]?r[o]:e[o])}),n.pips=e.pips,n.style=n.ort?"top":"left",n}function B(t,r){function o(e,t,n){var r=e+t[0],o=e+t[1];return n?(0>r&&(o+=Math.abs(r)),o>100&&(r-=o-100),[a(r),a(o)]):[r,o]}function v(e,t){e.preventDefault();var n,r,o=0===e.type.indexOf("touch"),i=0===e.type.indexOf("mouse"),a=0===e.type.indexOf("pointer"),s=e;return 0===e.type.indexOf("MSPointer")&&(a=!0),o&&(n=e.changedTouches[0].pageX,r=e.changedTouches[0].pageY),t=t||p(),(i||a)&&(n=e.clientX+t.x,r=e.clientY+t.y),s.pageOffset=t,s.points=[n,r],s.cursor=i||a,s}function g(e,t){var n=document.createElement("div"),r=document.createElement("div"),o=["-lower","-upper"];
return e&&o.reverse(),l(r,oe[3]),l(r,oe[3]+o[t]),l(n,oe[2]),n.appendChild(r),n}function y(e,t,n){switch(e){case 1:l(t,oe[7]),l(n[0],oe[6]);break;case 3:l(n[1],oe[6]);case 2:l(n[0],oe[7]);case 0:l(t,oe[6])}}function b(e,t,n){var r,o=[];for(r=0;e>r;r+=1)o.push(n.appendChild(g(t,r)));return o}function _(e,t,n){l(n,oe[0]),l(n,oe[8+e]),l(n,oe[4+t]);var r=document.createElement("div");return l(r,oe[1]),n.appendChild(r),r}function C(e,t){if(!r.tooltips[t])return!1;var n=document.createElement("div");return n.className=oe[18],e.firstChild.appendChild(n)}function w(){r.dir&&r.tooltips.reverse();var e=X.map(C);r.dir&&(e.reverse(),r.tooltips.reverse()),$("update",function(t,n,o){e[n]&&(e[n].innerHTML=r.tooltips[n]===!0?t[n]:r.tooltips[n].to(o[n]))})}function x(e,t,n){if("range"===e||"steps"===e)return te.xVal;if("count"===e){var r,o=100/(t-1),i=0;for(t=[];(r=i++*o)<=100;)t.push(r);e="positions"}return"positions"===e?t.map(function(e){return te.fromStepping(n?te.getStep(e):e)}):"values"===e?n?t.map(function(e){return te.fromStepping(te.getStep(te.toStepping(e)))}):t:void 0}function P(t,n,r){function o(e,t){return(e+t).toFixed(7)/1}var i=te.direction,a={},s=te.xVal[0],u=te.xVal[te.xVal.length-1],l=!1,c=!1,f=0;return te.direction=0,r=e(r.slice().sort(function(e,t){return e-t})),r[0]!==s&&(r.unshift(s),l=!0),r[r.length-1]!==u&&(r.push(u),c=!0),r.forEach(function(e,i){var s,u,p,d,h,m,v,g,y,b,_=e,C=r[i+1];if("steps"===n&&(s=te.xNumSteps[i]),s||(s=C-_),_!==!1&&void 0!==C)for(u=_;C>=u;u=o(u,s)){for(d=te.toStepping(u),h=d-f,g=h/t,y=Math.round(g),b=h/y,p=1;y>=p;p+=1)m=f+p*b,a[m.toFixed(5)]=["x",0];v=r.indexOf(u)>-1?1:"steps"===n?2:0,!i&&l&&(v=0),u===C&&c||(a[d.toFixed(5)]=[u,v]),f=d}}),te.direction=i,a}function E(e,t,n){function o(e){return["-normal","-large","-sub"][e]}function i(e,t,n){return'class="'+t+" "+t+"-"+s+" "+t+o(n[1])+'" style="'+r.style+": "+e+'%"'}function a(e,r){te.direction&&(e=100-e),r[1]=r[1]&&t?t(r[0],r[1]):r[1],c+="<div "+i(e,oe[21],r)+"></div>",r[1]&&(c+="<div "+i(e,oe[22],r)+">"+n.to(r[0])+"</div>")}var s=["horizontal","vertical"][r.ort],u=document.createElement("div"),c="";return l(u,oe[20]),l(u,oe[20]+"-"+s),Object.keys(e).forEach(function(t){a(t,e[t])}),u.innerHTML=c,u}function R(e){var t=e.mode,n=e.density||1,r=e.filter||!1,o=e.values||!1,i=e.stepped||!1,a=x(t,o,i),s=P(n,t,a),u=e.format||{to:Math.round};return Z.appendChild(E(s,r,u))}function S(){var e=G.getBoundingClientRect(),t="offset"+["Width","Height"][r.ort];return 0===r.ort?e.width||G[t]:e.height||G[t]}function O(e,t,n){void 0!==t&&1!==r.handles&&(t=Math.abs(t-r.dir)),Object.keys(re).forEach(function(r){var o=r.split(".")[0];e===o&&re[r].forEach(function(e){e.call(J,s(B()),t,s(T(Array.prototype.slice.call(ne))),n||!1,ee)})})}function T(e){return 1===e.length?e[0]:r.dir?e.reverse():e}function k(e,t,n,o){var i=function(t){return Z.hasAttribute("disabled")?!1:f(Z,oe[14])?!1:(t=v(t,o.pageOffset),e===W.start&&void 0!==t.buttons&&t.buttons>1?!1:o.hover&&t.buttons?!1:(t.calcPoint=t.points[r.ort],void n(t,o)))},a=[];return e.split(" ").forEach(function(e){t.addEventListener(e,i,!1),a.push([e,i])}),a}function N(e,t){if(-1===navigator.appVersion.indexOf("MSIE 9")&&0===e.buttons&&0!==t.buttonsProperty)return j(e,t);var n,r,i=t.handles||X,a=!1,s=100*(e.calcPoint-t.start)/t.baseSize,u=i[0]===X[0]?0:1;if(n=o(s,t.positions,i.length>1),a=U(i[0],n[u],1===i.length),i.length>1){if(a=U(i[1],n[u?0:1],!1)||a)for(r=0;r<t.handles.length;r++)O("slide",r)}else a&&O("slide",u)}function j(e,t){var n=G.querySelector("."+oe[15]),r=t.handles[0]===X[0]?0:1;null!==n&&c(n,oe[15]),e.cursor&&(document.body.style.cursor="",document.body.removeEventListener("selectstart",document.body.noUiListener));var o=document.documentElement;o.noUiListeners.forEach(function(e){o.removeEventListener(e[0],e[1])}),c(Z,oe[12]),O("set",r),O("change",r),void 0!==t.handleNumber&&O("end",t.handleNumber)}function A(e,t){"mouseout"===e.type&&"HTML"===e.target.nodeName&&null===e.relatedTarget&&j(e,t)}function M(e,t){var n=document.documentElement;if(1===t.handles.length&&(l(t.handles[0].children[0],oe[15]),t.handles[0].hasAttribute("disabled")))return!1;e.preventDefault(),e.stopPropagation();var r=k(W.move,n,N,{start:e.calcPoint,baseSize:S(),pageOffset:e.pageOffset,handles:t.handles,handleNumber:t.handleNumber,buttonsProperty:e.buttons,positions:[ee[0],ee[X.length-1]]}),o=k(W.end,n,j,{handles:t.handles,handleNumber:t.handleNumber}),i=k("mouseout",n,A,{handles:t.handles,handleNumber:t.handleNumber});if(n.noUiListeners=r.concat(o,i),e.cursor){document.body.style.cursor=getComputedStyle(e.target).cursor,X.length>1&&l(Z,oe[12]);var a=function(){return!1};document.body.noUiListener=a,document.body.addEventListener("selectstart",a,!1)}void 0!==t.handleNumber&&O("start",t.handleNumber)}function F(e){var t,o,a=e.calcPoint,s=0;return e.stopPropagation(),X.forEach(function(e){s+=n(e)[r.style]}),t=s/2>a||1===X.length?0:1,X[t].hasAttribute("disabled")&&(t=t?0:1),a-=n(G)[r.style],o=100*a/S(),r.events.snap||i(Z,oe[14],300),X[t].hasAttribute("disabled")?!1:(U(X[t],o),O("slide",t,!0),O("set",t,!0),O("change",t,!0),void(r.events.snap&&M(e,{handles:[X[t]]})))}function I(e){var t=e.calcPoint-n(G)[r.style],o=te.getStep(100*t/S()),i=te.fromStepping(o);Object.keys(re).forEach(function(e){"hover"===e.split(".")[0]&&re[e].forEach(function(e){e.call(J,i)})})}function D(e){var t,n;if(!e.fixed)for(t=0;t<X.length;t+=1)k(W.start,X[t].children[0],M,{handles:[X[t]],handleNumber:t});if(e.tap&&k(W.start,G,F,{handles:X}),e.hover)for(k(W.move,G,I,{hover:!0}),t=0;t<X.length;t+=1)["mousemove MSPointerMove pointermove"].forEach(function(e){X[t].children[0].addEventListener(e,d,!1)});e.drag&&(n=[G.querySelector("."+oe[7])],l(n[0],oe[10]),e.fixed&&n.push(X[n[0]===X[0]?1:0].children[0]),n.forEach(function(e){k(W.start,e,M,{handles:X})}))}function U(e,t,n){var o=e!==X[0]?1:0,i=ee[0]+r.margin,s=ee[1]-r.margin,u=ee[0]+r.limit,f=ee[1]-r.limit;return X.length>1&&(t=o?Math.max(t,i):Math.min(t,s)),n!==!1&&r.limit&&X.length>1&&(t=o?Math.min(t,u):Math.max(t,f)),t=te.getStep(t),t=a(parseFloat(t.toFixed(7))),t===ee[o]?!1:(window.requestAnimationFrame?window.requestAnimationFrame(function(){e.style[r.style]=t+"%"}):e.style[r.style]=t+"%",e.previousSibling||(c(e,oe[17]),t>50&&l(e,oe[17])),ee[o]=t,ne[o]=te.fromStepping(t),O("update",o),!0)}function L(e,t){var n,o,i;for(r.limit&&(e+=1),n=0;e>n;n+=1)o=n%2,i=t[o],null!==i&&i!==!1&&("number"==typeof i&&(i=String(i)),i=r.format.from(i),(i===!1||isNaN(i)||U(X[o],te.toStepping(i),n===3-r.dir)===!1)&&O("update",o))}function H(e){var t,n,o=s(e);for(r.dir&&r.handles>1&&o.reverse(),r.animate&&-1!==ee[0]&&i(Z,oe[14],300),t=X.length>1?3:1,1===o.length&&(t=1),L(t,o),n=0;n<X.length;n++)null!==o[n]&&O("set",n)}function B(){var e,t=[];for(e=0;e<r.handles;e+=1)t[e]=r.format.to(ne[e]);return T(t)}function q(){for(oe.forEach(function(e){e&&c(Z,e)});Z.firstChild;)Z.removeChild(Z.firstChild);delete Z.noUiSlider}function Q(){var e=ee.map(function(e,t){var n=te.getApplicableStep(e),r=u(String(n[2])),o=ne[t],i=100===e?null:n[2],a=Number((o-n[2]).toFixed(r)),s=0===e?null:a>=n[1]?n[2]:n[0]||!1;return[s,i]});return T(e)}function $(e,t){re[e]=re[e]||[],re[e].push(t),"update"===e.split(".")[0]&&X.forEach(function(e,t){O("update",t)})}function z(e){var t=e.split(".")[0],n=e.substring(t.length);Object.keys(re).forEach(function(e){var r=e.split(".")[0],o=e.substring(r.length);t&&t!==r||n&&n!==o||delete re[e]})}function Y(e){var t,n=B(),o=V({start:[0,0],margin:e.margin,limit:e.limit,step:e.step,range:e.range,animate:e.animate,snap:void 0===e.snap?r.snap:e.snap});for(["margin","limit","step","range","animate"].forEach(function(t){void 0!==e[t]&&(r[t]=e[t])}),o.spectrum.direction=te.direction,te=o.spectrum,ee=[-1,-1],H(n),t=0;t<X.length;t++)O("update",t)}m();var G,X,J,Z=t,ee=[-1,-1],te=r.spectrum,ne=[],re={},oe=["target","base","origin","handle","horizontal","vertical","background","connect","ltr","rtl","draggable","","state-drag","","state-tap","active","","stacking","tooltip","","pips","marker","value"].map(h(r.cssPrefix||K));if(Z.noUiSlider)throw new Error("Slider was already initialized.");return G=_(r.dir,r.ort,Z),X=b(r.handles,r.dir,G),y(r.connect,Z,X),r.pips&&R(r.pips),r.tooltips&&w(),J={destroy:q,steps:Q,on:$,off:z,get:B,set:H,updateOptions:Y,options:r,target:Z,pips:R},D(r.events),J}function q(e,t){if(!e.nodeName)throw new Error("noUiSlider.create requires a single element.");var n=V(t,e),r=B(e,n);return r.set(n.start),e.noUiSlider=r,r}var W,K="noUi-";R.prototype.getMargin=function(e){return 2===this.xPct.length?g(this.xVal,e):!1},R.prototype.toStepping=function(e){return e=C(this.xVal,this.xPct,e),this.direction&&(e=100-e),e},R.prototype.fromStepping=function(e){return this.direction&&(e=100-e),o(w(this.xVal,this.xPct,e))},R.prototype.getStep=function(e){return this.direction&&(e=100-e),e=x(this.xPct,this.xSteps,this.snap,e),this.direction&&(e=100-e),e},R.prototype.getApplicableStep=function(e){var t=_(e,this.xPct),n=100===e?2:1;return[this.xNumSteps[t-2],this.xVal[t-n],this.xNumSteps[t-n]]},R.prototype.convert=function(e){return this.getStep(this.toStepping(e))};var Q={to:function(e){return void 0!==e&&e.toFixed(2)},from:Number};return{create:q}})},function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{"default":e}}function o(){var e=arguments.length<=0||void 0===arguments[0]?{}:arguments[0],t=e.container,n=e.indices,r=e.cssClasses,o=void 0===r?{}:r,a=e.autoHideContainer,s=void 0===a?!1:a;if(!t||!n)throw new Error(C);var l=(0,d.getContainerNode)(t),f=b["default"];s===!0&&(f=(0,g["default"])(f));var h=(0,p["default"])(n,function(e){return{label:e.label,value:e.name}}),v={root:(0,m["default"])(_(null),o.root),item:(0,m["default"])(_("item"),o.item)};return{init:function(e){var t=e.helper,r=t.getIndex(),o=-1!==(0,c["default"])(n,{name:r});if(!o)throw new Error("[sortBySelector]: Index "+r+" not present in `indices`");this.setIndex=function(e){return t.setIndex(e).search()}},render:function(e){var t=e.helper,n=e.results;u["default"].render(i(f,{cssClasses:v,currentValue:t.getIndex(),options:h,setValue:this.setIndex,shouldAutoHideContainer:0===n.nbHits}),l)}}}Object.defineProperty(t,"__esModule",{value:!0});var i=function(){var e="function"==typeof Symbol&&Symbol["for"]&&Symbol["for"]("react.element")||60103;return function(t,n,r,o){var i=t&&t.defaultProps,a=arguments.length-3;if(n||0===a||(n={}),n&&i)for(var s in i)void 0===n[s]&&(n[s]=i[s]);else n||(n=i||{});if(1===a)n.children=o;else if(a>1){for(var u=Array(a),l=0;a>l;l++)u[l]=arguments[l+3];n.children=u}return{$$typeof:e,type:t,key:void 0===r?null:""+r,ref:null,props:n,_owner:null}}}(),a=n(223),s=(r(a),n(254)),u=r(s),l=n(175),c=r(l),f=n(55),p=r(f),d=n(385),h=n(389),m=r(h),v=n(390),g=r(v),y=n(415),b=r(y),_=(0,d.bemHelper)("ais-sort-by-selector"),C="Usage:\nsortBySelector({\n  container,\n  indices,\n  [cssClasses.{root,item}={}],\n  [autoHideContainer=false]\n})";t["default"]=o},function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{"default":e}}function o(e){var t=e.container,n=e.attributeName,r=e.max,o=void 0===r?5:r,a=e.cssClasses,s=void 0===a?{}:a,c=e.labels,p=void 0===c?b["default"]:c,h=e.templates,v=void 0===h?g["default"]:h,y=e.collapsible,_=void 0===y?!1:y,P=e.transformData,E=e.autoHideContainer,R=void 0===E?!0:E,S=(0,l.getContainerNode)(t),O=(0,m["default"])(C["default"]);if(R===!0&&(O=(0,d["default"])(O)),!t||!n)throw new Error(x);var T={root:(0,f["default"])(w(null),s.root),header:(0,f["default"])(w("header"),s.header),body:(0,f["default"])(w("body"),s.body),footer:(0,f["default"])(w("footer"),s.footer),list:(0,f["default"])(w("list"),s.list),item:(0,f["default"])(w("item"),s.item),link:(0,f["default"])(w("link"),s.link),disabledLink:(0,f["default"])(w("link","disabled"),s.disabledLink),count:(0,f["default"])(w("count"),s.count),star:(0,f["default"])(w("star"),s.star),emptyStar:(0,f["default"])(w("star","empty"),s.emptyStar),active:(0,f["default"])(w("item","active"),s.active)};return{getConfiguration:function(){return{disjunctiveFacets:[n]}},init:function(e){var t=e.templatesConfig,n=e.helper;this._templateProps=(0,l.prepareTemplateProps)({transformData:P,defaultTemplates:g["default"],templatesConfig:t,templates:v}),this._toggleRefinement=this._toggleRefinement.bind(this,n)},render:function(e){function t(e){return l(s.toggleRefinement(n,e))}for(var r=e.helper,a=e.results,s=e.state,l=e.createURL,c=[],f={},d=o-1;d>=0;--d)f[d]=0;a.getFacetValues(n).forEach(function(e){var t=Math.round(e.name);if(t&&!(t>o-1))for(var n=t;n>=1;--n)f[n]+=e.count});for(var h=this._getRefinedStar(r),m=o-1;m>=1;--m){var v=f[m];if(!h||m===h||0!==v){for(var g=[],y=1;o>=y;++y)g.push(m>=y);c.push({stars:g,name:""+m,count:v,isRefined:h===m,labels:p})}}u["default"].render(i(O,{collapsible:_,createURL:t,cssClasses:T,facetValues:c,shouldAutoHideContainer:0===a.nbHits,templateProps:this._templateProps,toggleRefinement:this._toggleRefinement}),S)},_toggleRefinement:function(e,t){var r=this._getRefinedStar(e)===+t;if(e.clearRefinements(n),!r)for(var i=+t;o>=i;++i)e.addDisjunctiveFacetRefinement(n,i);e.search()},_getRefinedStar:function(e){var t=void 0,r=e.getRefinements(n);return r.forEach(function(e){(!t||+e.value<t)&&(t=+e.value)}),t}}}Object.defineProperty(t,"__esModule",{value:!0});var i=function(){var e="function"==typeof Symbol&&Symbol["for"]&&Symbol["for"]("react.element")||60103;return function(t,n,r,o){var i=t&&t.defaultProps,a=arguments.length-3;if(n||0===a||(n={}),n&&i)for(var s in i)void 0===n[s]&&(n[s]=i[s]);else n||(n=i||{});if(1===a)n.children=o;else if(a>1){for(var u=Array(a),l=0;a>l;l++)u[l]=arguments[l+3];n.children=u}return{$$typeof:e,type:t,key:void 0===r?null:""+r,ref:null,props:n,_owner:null}}}(),a=n(223),s=(r(a),n(254)),u=r(s),l=n(385),c=n(389),f=r(c),p=n(390),d=r(p),h=n(391),m=r(h),v=n(445),g=r(v),y=n(446),b=r(y),_=n(406),C=r(_),w=(0,l.bemHelper)("ais-star-rating"),x="Usage:\nstarRating({\n  container,\n  attributeName,\n  [ max=5 ],\n  [ cssClasses.{root,header,body,footer,list,item,active,link,disabledLink,star,emptyStar,count} ],\n  [ templates.{header,item,footer} ],\n  [ labels.{andUp} ],\n  [ transformData ],\n  [ autoHideContainer=true ],\n  [ collapsible=false ]\n})";t["default"]=o},function(e,t){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t["default"]={header:"",item:'<a class="{{cssClasses.link}}{{^count}} {{cssClasses.disabledLink}}{{/count}}" {{#count}}href="{{href}}"{{/count}}>\n  {{#stars}}<span class="{{#.}}{{cssClasses.star}}{{/.}}{{^.}}{{cssClasses.emptyStar}}{{/.}}"></span>{{/stars}}\n  {{labels.andUp}}\n  {{#count}}<span class="{{cssClasses.count}}">{{#helpers.formatNumber}}{{count}}{{/helpers.formatNumber}}</span>{{/count}}\n</a>',footer:""}},function(e,t){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t["default"]={andUp:"& Up"}},function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{"default":e}}function o(){var e=arguments.length<=0||void 0===arguments[0]?{}:arguments[0],t=e.container,n=e.cssClasses,r=void 0===n?{}:n,o=e.autoHideContainer,a=void 0===o?!0:o,s=e.templates,c=void 0===s?b["default"]:s,p=e.collapsible,h=void 0===p?!1:p,v=e.transformData;if(!t)throw new Error(C);var y=(0,l.getContainerNode)(t),w=(0,d["default"])(m["default"]);if(a===!0&&(w=(0,f["default"])(w)),!y)throw new Error(C);var x={body:(0,g["default"])(_("body"),r.body),footer:(0,g["default"])(_("footer"),r.footer),header:(0,g["default"])(_("header"),r.header),root:(0,g["default"])(_(null),r.root),time:(0,g["default"])(_("time"),r.time)};return{init:function(e){var t=e.templatesConfig;this._templateProps=(0,l.prepareTemplateProps)({transformData:v,defaultTemplates:b["default"],templatesConfig:t,templates:c})},render:function(e){var t=e.results;u["default"].render(i(w,{collapsible:h,cssClasses:x,hitsPerPage:t.hitsPerPage,nbHits:t.nbHits,nbPages:t.nbPages,page:t.page,processingTimeMS:t.processingTimeMS,query:t.query,shouldAutoHideContainer:0===t.nbHits,templateProps:this._templateProps}),y)}}}Object.defineProperty(t,"__esModule",{value:!0});var i=function(){var e="function"==typeof Symbol&&Symbol["for"]&&Symbol["for"]("react.element")||60103;return function(t,n,r,o){var i=t&&t.defaultProps,a=arguments.length-3;if(n||0===a||(n={}),n&&i)for(var s in i)void 0===n[s]&&(n[s]=i[s]);else n||(n=i||{});if(1===a)n.children=o;else if(a>1){for(var u=Array(a),l=0;a>l;l++)u[l]=arguments[l+3];n.children=u}return{$$typeof:e,type:t,key:void 0===r?null:""+r,ref:null,props:n,_owner:null}}}(),a=n(223),s=(r(a),n(254)),u=r(s),l=n(385),c=n(390),f=r(c),p=n(391),d=r(p),h=n(448),m=r(h),v=n(389),g=r(v),y=n(449),b=r(y),_=(0,l.bemHelper)("ais-stats"),C="Usage:\nstats({\n  container,\n  [ template ],\n  [ transformData ],\n  [ autoHideContainer]\n})";t["default"]=o},function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{"default":e}}function o(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function i(e,t){if(!e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!t||"object"!=typeof t&&"function"!=typeof t?e:t}function a(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function, not "+typeof t);e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),t&&(Object.setPrototypeOf?Object.setPrototypeOf(e,t):e.__proto__=t)}Object.defineProperty(t,"__esModule",{value:!0});var s=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var r in n)Object.prototype.hasOwnProperty.call(n,r)&&(e[r]=n[r])}return e},u=function(){function e(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(t,n,r){return n&&e(t.prototype,n),r&&e(t,r),t}}(),l=n(223),c=r(l),f=n(392),p=r(f),d=function(e){function t(){return o(this,t),i(this,Object.getPrototypeOf(t).apply(this,arguments))}return a(t,e),u(t,[{key:"shouldComponentUpdate",value:function(e){return this.props.nbHits!==e.hits||this.props.processingTimeMS!==e.processingTimeMS}},{key:"render",value:function(){var e={hasManyResults:this.props.nbHits>1,hasNoResults:0===this.props.nbHits,hasOneResult:1===this.props.nbHits,hitsPerPage:this.props.hitsPerPage,nbHits:this.props.nbHits,nbPages:this.props.nbPages,page:this.props.page,processingTimeMS:this.props.processingTimeMS,query:this.props.query,cssClasses:this.props.cssClasses};return c["default"].createElement(p["default"],s({data:e,templateKey:"body"},this.props.templateProps))}}]),t}(c["default"].Component);t["default"]=d},function(e,t){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t["default"]={header:"",body:'{{#hasNoResults}}No results{{/hasNoResults}}\n  {{#hasOneResult}}1 result{{/hasOneResult}}\n  {{#hasManyResults}}{{#helpers.formatNumber}}{{nbHits}}{{/helpers.formatNumber}} results{{/hasManyResults}}\n  <span class="{{cssClasses.time}}">found in {{processingTimeMS}}ms</span>',footer:""}},function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{"default":e}}function o(){var e=arguments.length<=0||void 0===arguments[0]?{}:arguments[0],t=e.container,n=e.attributeName,r=e.label,o=e.values,a=void 0===o?{on:!0,off:void 0}:o,u=e.templates,l=void 0===u?b["default"]:u,p=e.collapsible,h=void 0===p?!1:p,v=e.cssClasses,y=void 0===v?{}:v,_=e.transformData,P=e.autoHideContainer,E=void 0===P?!0:P,R=(0,f.getContainerNode)(t),S=(0,g["default"])(C["default"]);if(E===!0&&(S=(0,m["default"])(S)),!t||!n||!r)throw new Error(x);var O=void 0!==a.off,T={root:(0,d["default"])(w(null),y.root),header:(0,d["default"])(w("header"),y.header),body:(0,d["default"])(w("body"),y.body),footer:(0,d["default"])(w("footer"),y.footer),list:(0,d["default"])(w("list"),y.list),item:(0,d["default"])(w("item"),y.item),active:(0,d["default"])(w("item","active"),y.active),label:(0,d["default"])(w("label"),y.label),checkbox:(0,d["default"])(w("checkbox"),y.checkbox),count:(0,d["default"])(w("count"),y.count)};return{getConfiguration:function(){return{facets:[n]}},init:function(e){var t=e.state,r=e.helper,o=e.templatesConfig;if(this._templateProps=(0,f.prepareTemplateProps)({transformData:_,defaultTemplates:b["default"],templatesConfig:o,templates:l}),this.toggleRefinement=this.toggleRefinement.bind(this,r),void 0!==a.off){var i=t.isFacetRefined(n,a.on);i||r.addFacetRefinement(n,a.off)}},toggleRefinement:function(e,t,r){var o=a.on,i=a.off;r?(e.removeFacetRefinement(n,o),O&&e.addFacetRefinement(n,i)):(O&&e.removeFacetRefinement(n,i),e.addFacetRefinement(n,o)),e.search()},render:function(e){function t(){return f(l.toggleRefinement(n,p))}var o=e.helper,u=e.results,l=e.state,f=e.createURL,p=o.state.isFacetRefined(n,a.on),d=(0,s["default"])(u.getFacetValues(n),{name:p.toString()}),m={name:r,isRefined:p,count:d&&d.count||null};c["default"].render(i(S,{collapsible:h,createURL:t,cssClasses:T,facetValues:[m],shouldAutoHideContainer:0===u.nbHits,templateProps:this._templateProps,toggleRefinement:this.toggleRefinement}),R)}}}Object.defineProperty(t,"__esModule",{value:!0});var i=function(){var e="function"==typeof Symbol&&Symbol["for"]&&Symbol["for"]("react.element")||60103;return function(t,n,r,o){var i=t&&t.defaultProps,a=arguments.length-3;if(n||0===a||(n={}),n&&i)for(var s in i)void 0===n[s]&&(n[s]=i[s]);else n||(n=i||{});if(1===a)n.children=o;else if(a>1){for(var u=Array(a),l=0;a>l;l++)u[l]=arguments[l+3];n.children=u}return{$$typeof:e,type:t,key:void 0===r?null:""+r,ref:null,props:n,_owner:null}}}(),a=n(131),s=r(a),u=n(223),l=(r(u),n(254)),c=r(l),f=n(385),p=n(389),d=r(p),h=n(390),m=r(h),v=n(391),g=r(v),y=n(451),b=r(y),_=n(406),C=r(_),w=(0,f.bemHelper)("ais-toggle"),x="Usage:\ntoggle({\n  container,\n  attributeName,\n  label,\n  [ userValues={on: true, off: undefined} ],\n  [ cssClasses.{root,header,body,footer,list,item,active,label,checkbox,count} ],\n  [ templates.{header,item,footer} ],\n  [ transformData ],\n  [ autoHideContainer=true ],\n  [ collapsible=false ]\n})";t["default"]=o},function(e,t){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t["default"]={header:"",item:'<label class="{{cssClasses.label}}">\n  <input type="checkbox" class="{{cssClasses.checkbox}}" value="{{name}}" {{#isRefined}}checked{{/isRefined}} />{{name}}\n  <span class="{{cssClasses.count}}">{{#helpers.formatNumber}}{{count}}{{/helpers.formatNumber}}</span>\n</label>',footer:""}}])});
//# sourceMappingURL=instantsearch.min.js.map
!function(){function o(w,v,i){return w.getAttribute(v)||i}function j(i){return document.getElementsByTagName(i)}function l(){var i=j("script"),w=i.length,v=i[w-1];return{l:w,z:o(v,"zIndex",-1),o:o(v,"opacity",0.5),c:o(v,"color","0,0,0"),n:o(v,"count",99)}}function k(){r=u.width=window.innerWidth||document.documentElement.clientWidth||document.body.clientWidth,n=u.height=window.innerHeight||document.documentElement.clientHeight||document.body.clientHeight}function b(){e.clearRect(0,0,r,n);var w=[f].concat(t);var x,v,A,B,z,y;t.forEach(function(i){i.x+=i.xa,i.y+=i.ya,i.xa*=i.x>r||i.x<0?-1:1,i.ya*=i.y>n||i.y<0?-1:1,e.fillRect(i.x-0.5,i.y-0.5,1,1);for(v=0;v<w.length;v++){x=w[v];if(i!==x&&null!==x.x&&null!==x.y){B=i.x-x.x,z=i.y-x.y,y=B*B+z*z;y<x.max&&(x===f&&y>=x.max/2&&(i.x-=0.03*B,i.y-=0.03*z),A=(x.max-y)/x.max,e.beginPath(),e.lineWidth=A/2,e.strokeStyle="rgba("+s.c+","+(A+0.2)+")",e.moveTo(i.x,i.y),e.lineTo(x.x,x.y),e.stroke())}}w.splice(w.indexOf(i),1)}),m(b)}var u=document.createElement("canvas"),s=l(),c="c_n"+s.l,e=u.getContext("2d"),r,n,m=window.requestAnimationFrame||window.webkitRequestAnimationFrame||window.mozRequestAnimationFrame||window.oRequestAnimationFrame||window.msRequestAnimationFrame||function(i){window.setTimeout(i,1000/45)},a=Math.random,f={x:null,y:null,max:20000};u.id=c;u.style.cssText="position:fixed;top:0;left:0;z-index:"+s.z+";opacity:"+s.o;j("body")[0].appendChild(u);k(),window.onresize=k;window.onmousemove=function(i){i=i||window.event,f.x=i.clientX,f.y=i.clientY},window.onmouseout=function(){f.x=null,f.y=null};for(var t=[],p=0;s.n>p;p++){var h=a()*r,g=a()*n,q=2*a()-1,d=2*a()-1;t.push({x:h,y:g,xa:q,ya:d,max:6000})}setTimeout(function(){b()},100)}();
/*! jQuery v2.1.3 | (c) 2005, 2014 jQuery Foundation, Inc. | jquery.org/license */
!function(a,b){"object"==typeof module&&"object"==typeof module.exports?module.exports=a.document?b(a,!0):function(a){if(!a.document)throw new Error("jQuery requires a window with a document");return b(a)}:b(a)}("undefined"!=typeof window?window:this,function(a,b){var c=[],d=c.slice,e=c.concat,f=c.push,g=c.indexOf,h={},i=h.toString,j=h.hasOwnProperty,k={},l=a.document,m="2.1.3",n=function(a,b){return new n.fn.init(a,b)},o=/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,p=/^-ms-/,q=/-([\da-z])/gi,r=function(a,b){return b.toUpperCase()};n.fn=n.prototype={jquery:m,constructor:n,selector:"",length:0,toArray:function(){return d.call(this)},get:function(a){return null!=a?0>a?this[a+this.length]:this[a]:d.call(this)},pushStack:function(a){var b=n.merge(this.constructor(),a);return b.prevObject=this,b.context=this.context,b},each:function(a,b){return n.each(this,a,b)},map:function(a){return this.pushStack(n.map(this,function(b,c){return a.call(b,c,b)}))},slice:function(){return this.pushStack(d.apply(this,arguments))},first:function(){return this.eq(0)},last:function(){return this.eq(-1)},eq:function(a){var b=this.length,c=+a+(0>a?b:0);return this.pushStack(c>=0&&b>c?[this[c]]:[])},end:function(){return this.prevObject||this.constructor(null)},push:f,sort:c.sort,splice:c.splice},n.extend=n.fn.extend=function(){var a,b,c,d,e,f,g=arguments[0]||{},h=1,i=arguments.length,j=!1;for("boolean"==typeof g&&(j=g,g=arguments[h]||{},h++),"object"==typeof g||n.isFunction(g)||(g={}),h===i&&(g=this,h--);i>h;h++)if(null!=(a=arguments[h]))for(b in a)c=g[b],d=a[b],g!==d&&(j&&d&&(n.isPlainObject(d)||(e=n.isArray(d)))?(e?(e=!1,f=c&&n.isArray(c)?c:[]):f=c&&n.isPlainObject(c)?c:{},g[b]=n.extend(j,f,d)):void 0!==d&&(g[b]=d));return g},n.extend({expando:"jQuery"+(m+Math.random()).replace(/\D/g,""),isReady:!0,error:function(a){throw new Error(a)},noop:function(){},isFunction:function(a){return"function"===n.type(a)},isArray:Array.isArray,isWindow:function(a){return null!=a&&a===a.window},isNumeric:function(a){return!n.isArray(a)&&a-parseFloat(a)+1>=0},isPlainObject:function(a){return"object"!==n.type(a)||a.nodeType||n.isWindow(a)?!1:a.constructor&&!j.call(a.constructor.prototype,"isPrototypeOf")?!1:!0},isEmptyObject:function(a){var b;for(b in a)return!1;return!0},type:function(a){return null==a?a+"":"object"==typeof a||"function"==typeof a?h[i.call(a)]||"object":typeof a},globalEval:function(a){var b,c=eval;a=n.trim(a),a&&(1===a.indexOf("use strict")?(b=l.createElement("script"),b.text=a,l.head.appendChild(b).parentNode.removeChild(b)):c(a))},camelCase:function(a){return a.replace(p,"ms-").replace(q,r)},nodeName:function(a,b){return a.nodeName&&a.nodeName.toLowerCase()===b.toLowerCase()},each:function(a,b,c){var d,e=0,f=a.length,g=s(a);if(c){if(g){for(;f>e;e++)if(d=b.apply(a[e],c),d===!1)break}else for(e in a)if(d=b.apply(a[e],c),d===!1)break}else if(g){for(;f>e;e++)if(d=b.call(a[e],e,a[e]),d===!1)break}else for(e in a)if(d=b.call(a[e],e,a[e]),d===!1)break;return a},trim:function(a){return null==a?"":(a+"").replace(o,"")},makeArray:function(a,b){var c=b||[];return null!=a&&(s(Object(a))?n.merge(c,"string"==typeof a?[a]:a):f.call(c,a)),c},inArray:function(a,b,c){return null==b?-1:g.call(b,a,c)},merge:function(a,b){for(var c=+b.length,d=0,e=a.length;c>d;d++)a[e++]=b[d];return a.length=e,a},grep:function(a,b,c){for(var d,e=[],f=0,g=a.length,h=!c;g>f;f++)d=!b(a[f],f),d!==h&&e.push(a[f]);return e},map:function(a,b,c){var d,f=0,g=a.length,h=s(a),i=[];if(h)for(;g>f;f++)d=b(a[f],f,c),null!=d&&i.push(d);else for(f in a)d=b(a[f],f,c),null!=d&&i.push(d);return e.apply([],i)},guid:1,proxy:function(a,b){var c,e,f;return"string"==typeof b&&(c=a[b],b=a,a=c),n.isFunction(a)?(e=d.call(arguments,2),f=function(){return a.apply(b||this,e.concat(d.call(arguments)))},f.guid=a.guid=a.guid||n.guid++,f):void 0},now:Date.now,support:k}),n.each("Boolean Number String Function Array Date RegExp Object Error".split(" "),function(a,b){h["[object "+b+"]"]=b.toLowerCase()});function s(a){var b=a.length,c=n.type(a);return"function"===c||n.isWindow(a)?!1:1===a.nodeType&&b?!0:"array"===c||0===b||"number"==typeof b&&b>0&&b-1 in a}var t=function(a){var b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u="sizzle"+1*new Date,v=a.document,w=0,x=0,y=hb(),z=hb(),A=hb(),B=function(a,b){return a===b&&(l=!0),0},C=1<<31,D={}.hasOwnProperty,E=[],F=E.pop,G=E.push,H=E.push,I=E.slice,J=function(a,b){for(var c=0,d=a.length;d>c;c++)if(a[c]===b)return c;return-1},K="checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped",L="[\\x20\\t\\r\\n\\f]",M="(?:\\\\.|[\\w-]|[^\\x00-\\xa0])+",N=M.replace("w","w#"),O="\\["+L+"*("+M+")(?:"+L+"*([*^$|!~]?=)"+L+"*(?:'((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\"|("+N+"))|)"+L+"*\\]",P=":("+M+")(?:\\((('((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\")|((?:\\\\.|[^\\\\()[\\]]|"+O+")*)|.*)\\)|)",Q=new RegExp(L+"+","g"),R=new RegExp("^"+L+"+|((?:^|[^\\\\])(?:\\\\.)*)"+L+"+$","g"),S=new RegExp("^"+L+"*,"+L+"*"),T=new RegExp("^"+L+"*([>+~]|"+L+")"+L+"*"),U=new RegExp("="+L+"*([^\\]'\"]*?)"+L+"*\\]","g"),V=new RegExp(P),W=new RegExp("^"+N+"$"),X={ID:new RegExp("^#("+M+")"),CLASS:new RegExp("^\\.("+M+")"),TAG:new RegExp("^("+M.replace("w","w*")+")"),ATTR:new RegExp("^"+O),PSEUDO:new RegExp("^"+P),CHILD:new RegExp("^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\("+L+"*(even|odd|(([+-]|)(\\d*)n|)"+L+"*(?:([+-]|)"+L+"*(\\d+)|))"+L+"*\\)|)","i"),bool:new RegExp("^(?:"+K+")$","i"),needsContext:new RegExp("^"+L+"*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\("+L+"*((?:-\\d)?\\d*)"+L+"*\\)|)(?=[^-]|$)","i")},Y=/^(?:input|select|textarea|button)$/i,Z=/^h\d$/i,$=/^[^{]+\{\s*\[native \w/,_=/^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,ab=/[+~]/,bb=/'|\\/g,cb=new RegExp("\\\\([\\da-f]{1,6}"+L+"?|("+L+")|.)","ig"),db=function(a,b,c){var d="0x"+b-65536;return d!==d||c?b:0>d?String.fromCharCode(d+65536):String.fromCharCode(d>>10|55296,1023&d|56320)},eb=function(){m()};try{H.apply(E=I.call(v.childNodes),v.childNodes),E[v.childNodes.length].nodeType}catch(fb){H={apply:E.length?function(a,b){G.apply(a,I.call(b))}:function(a,b){var c=a.length,d=0;while(a[c++]=b[d++]);a.length=c-1}}}function gb(a,b,d,e){var f,h,j,k,l,o,r,s,w,x;if((b?b.ownerDocument||b:v)!==n&&m(b),b=b||n,d=d||[],k=b.nodeType,"string"!=typeof a||!a||1!==k&&9!==k&&11!==k)return d;if(!e&&p){if(11!==k&&(f=_.exec(a)))if(j=f[1]){if(9===k){if(h=b.getElementById(j),!h||!h.parentNode)return d;if(h.id===j)return d.push(h),d}else if(b.ownerDocument&&(h=b.ownerDocument.getElementById(j))&&t(b,h)&&h.id===j)return d.push(h),d}else{if(f[2])return H.apply(d,b.getElementsByTagName(a)),d;if((j=f[3])&&c.getElementsByClassName)return H.apply(d,b.getElementsByClassName(j)),d}if(c.qsa&&(!q||!q.test(a))){if(s=r=u,w=b,x=1!==k&&a,1===k&&"object"!==b.nodeName.toLowerCase()){o=g(a),(r=b.getAttribute("id"))?s=r.replace(bb,"\\$&"):b.setAttribute("id",s),s="[id='"+s+"'] ",l=o.length;while(l--)o[l]=s+rb(o[l]);w=ab.test(a)&&pb(b.parentNode)||b,x=o.join(",")}if(x)try{return H.apply(d,w.querySelectorAll(x)),d}catch(y){}finally{r||b.removeAttribute("id")}}}return i(a.replace(R,"$1"),b,d,e)}function hb(){var a=[];function b(c,e){return a.push(c+" ")>d.cacheLength&&delete b[a.shift()],b[c+" "]=e}return b}function ib(a){return a[u]=!0,a}function jb(a){var b=n.createElement("div");try{return!!a(b)}catch(c){return!1}finally{b.parentNode&&b.parentNode.removeChild(b),b=null}}function kb(a,b){var c=a.split("|"),e=a.length;while(e--)d.attrHandle[c[e]]=b}function lb(a,b){var c=b&&a,d=c&&1===a.nodeType&&1===b.nodeType&&(~b.sourceIndex||C)-(~a.sourceIndex||C);if(d)return d;if(c)while(c=c.nextSibling)if(c===b)return-1;return a?1:-1}function mb(a){return function(b){var c=b.nodeName.toLowerCase();return"input"===c&&b.type===a}}function nb(a){return function(b){var c=b.nodeName.toLowerCase();return("input"===c||"button"===c)&&b.type===a}}function ob(a){return ib(function(b){return b=+b,ib(function(c,d){var e,f=a([],c.length,b),g=f.length;while(g--)c[e=f[g]]&&(c[e]=!(d[e]=c[e]))})})}function pb(a){return a&&"undefined"!=typeof a.getElementsByTagName&&a}c=gb.support={},f=gb.isXML=function(a){var b=a&&(a.ownerDocument||a).documentElement;return b?"HTML"!==b.nodeName:!1},m=gb.setDocument=function(a){var b,e,g=a?a.ownerDocument||a:v;return g!==n&&9===g.nodeType&&g.documentElement?(n=g,o=g.documentElement,e=g.defaultView,e&&e!==e.top&&(e.addEventListener?e.addEventListener("unload",eb,!1):e.attachEvent&&e.attachEvent("onunload",eb)),p=!f(g),c.attributes=jb(function(a){return a.className="i",!a.getAttribute("className")}),c.getElementsByTagName=jb(function(a){return a.appendChild(g.createComment("")),!a.getElementsByTagName("*").length}),c.getElementsByClassName=$.test(g.getElementsByClassName),c.getById=jb(function(a){return o.appendChild(a).id=u,!g.getElementsByName||!g.getElementsByName(u).length}),c.getById?(d.find.ID=function(a,b){if("undefined"!=typeof b.getElementById&&p){var c=b.getElementById(a);return c&&c.parentNode?[c]:[]}},d.filter.ID=function(a){var b=a.replace(cb,db);return function(a){return a.getAttribute("id")===b}}):(delete d.find.ID,d.filter.ID=function(a){var b=a.replace(cb,db);return function(a){var c="undefined"!=typeof a.getAttributeNode&&a.getAttributeNode("id");return c&&c.value===b}}),d.find.TAG=c.getElementsByTagName?function(a,b){return"undefined"!=typeof b.getElementsByTagName?b.getElementsByTagName(a):c.qsa?b.querySelectorAll(a):void 0}:function(a,b){var c,d=[],e=0,f=b.getElementsByTagName(a);if("*"===a){while(c=f[e++])1===c.nodeType&&d.push(c);return d}return f},d.find.CLASS=c.getElementsByClassName&&function(a,b){return p?b.getElementsByClassName(a):void 0},r=[],q=[],(c.qsa=$.test(g.querySelectorAll))&&(jb(function(a){o.appendChild(a).innerHTML="<a id='"+u+"'></a><select id='"+u+"-\f]' msallowcapture=''><option selected=''></option></select>",a.querySelectorAll("[msallowcapture^='']").length&&q.push("[*^$]="+L+"*(?:''|\"\")"),a.querySelectorAll("[selected]").length||q.push("\\["+L+"*(?:value|"+K+")"),a.querySelectorAll("[id~="+u+"-]").length||q.push("~="),a.querySelectorAll(":checked").length||q.push(":checked"),a.querySelectorAll("a#"+u+"+*").length||q.push(".#.+[+~]")}),jb(function(a){var b=g.createElement("input");b.setAttribute("type","hidden"),a.appendChild(b).setAttribute("name","D"),a.querySelectorAll("[name=d]").length&&q.push("name"+L+"*[*^$|!~]?="),a.querySelectorAll(":enabled").length||q.push(":enabled",":disabled"),a.querySelectorAll("*,:x"),q.push(",.*:")})),(c.matchesSelector=$.test(s=o.matches||o.webkitMatchesSelector||o.mozMatchesSelector||o.oMatchesSelector||o.msMatchesSelector))&&jb(function(a){c.disconnectedMatch=s.call(a,"div"),s.call(a,"[s!='']:x"),r.push("!=",P)}),q=q.length&&new RegExp(q.join("|")),r=r.length&&new RegExp(r.join("|")),b=$.test(o.compareDocumentPosition),t=b||$.test(o.contains)?function(a,b){var c=9===a.nodeType?a.documentElement:a,d=b&&b.parentNode;return a===d||!(!d||1!==d.nodeType||!(c.contains?c.contains(d):a.compareDocumentPosition&&16&a.compareDocumentPosition(d)))}:function(a,b){if(b)while(b=b.parentNode)if(b===a)return!0;return!1},B=b?function(a,b){if(a===b)return l=!0,0;var d=!a.compareDocumentPosition-!b.compareDocumentPosition;return d?d:(d=(a.ownerDocument||a)===(b.ownerDocument||b)?a.compareDocumentPosition(b):1,1&d||!c.sortDetached&&b.compareDocumentPosition(a)===d?a===g||a.ownerDocument===v&&t(v,a)?-1:b===g||b.ownerDocument===v&&t(v,b)?1:k?J(k,a)-J(k,b):0:4&d?-1:1)}:function(a,b){if(a===b)return l=!0,0;var c,d=0,e=a.parentNode,f=b.parentNode,h=[a],i=[b];if(!e||!f)return a===g?-1:b===g?1:e?-1:f?1:k?J(k,a)-J(k,b):0;if(e===f)return lb(a,b);c=a;while(c=c.parentNode)h.unshift(c);c=b;while(c=c.parentNode)i.unshift(c);while(h[d]===i[d])d++;return d?lb(h[d],i[d]):h[d]===v?-1:i[d]===v?1:0},g):n},gb.matches=function(a,b){return gb(a,null,null,b)},gb.matchesSelector=function(a,b){if((a.ownerDocument||a)!==n&&m(a),b=b.replace(U,"='$1']"),!(!c.matchesSelector||!p||r&&r.test(b)||q&&q.test(b)))try{var d=s.call(a,b);if(d||c.disconnectedMatch||a.document&&11!==a.document.nodeType)return d}catch(e){}return gb(b,n,null,[a]).length>0},gb.contains=function(a,b){return(a.ownerDocument||a)!==n&&m(a),t(a,b)},gb.attr=function(a,b){(a.ownerDocument||a)!==n&&m(a);var e=d.attrHandle[b.toLowerCase()],f=e&&D.call(d.attrHandle,b.toLowerCase())?e(a,b,!p):void 0;return void 0!==f?f:c.attributes||!p?a.getAttribute(b):(f=a.getAttributeNode(b))&&f.specified?f.value:null},gb.error=function(a){throw new Error("Syntax error, unrecognized expression: "+a)},gb.uniqueSort=function(a){var b,d=[],e=0,f=0;if(l=!c.detectDuplicates,k=!c.sortStable&&a.slice(0),a.sort(B),l){while(b=a[f++])b===a[f]&&(e=d.push(f));while(e--)a.splice(d[e],1)}return k=null,a},e=gb.getText=function(a){var b,c="",d=0,f=a.nodeType;if(f){if(1===f||9===f||11===f){if("string"==typeof a.textContent)return a.textContent;for(a=a.firstChild;a;a=a.nextSibling)c+=e(a)}else if(3===f||4===f)return a.nodeValue}else while(b=a[d++])c+=e(b);return c},d=gb.selectors={cacheLength:50,createPseudo:ib,match:X,attrHandle:{},find:{},relative:{">":{dir:"parentNode",first:!0}," ":{dir:"parentNode"},"+":{dir:"previousSibling",first:!0},"~":{dir:"previousSibling"}},preFilter:{ATTR:function(a){return a[1]=a[1].replace(cb,db),a[3]=(a[3]||a[4]||a[5]||"").replace(cb,db),"~="===a[2]&&(a[3]=" "+a[3]+" "),a.slice(0,4)},CHILD:function(a){return a[1]=a[1].toLowerCase(),"nth"===a[1].slice(0,3)?(a[3]||gb.error(a[0]),a[4]=+(a[4]?a[5]+(a[6]||1):2*("even"===a[3]||"odd"===a[3])),a[5]=+(a[7]+a[8]||"odd"===a[3])):a[3]&&gb.error(a[0]),a},PSEUDO:function(a){var b,c=!a[6]&&a[2];return X.CHILD.test(a[0])?null:(a[3]?a[2]=a[4]||a[5]||"":c&&V.test(c)&&(b=g(c,!0))&&(b=c.indexOf(")",c.length-b)-c.length)&&(a[0]=a[0].slice(0,b),a[2]=c.slice(0,b)),a.slice(0,3))}},filter:{TAG:function(a){var b=a.replace(cb,db).toLowerCase();return"*"===a?function(){return!0}:function(a){return a.nodeName&&a.nodeName.toLowerCase()===b}},CLASS:function(a){var b=y[a+" "];return b||(b=new RegExp("(^|"+L+")"+a+"("+L+"|$)"))&&y(a,function(a){return b.test("string"==typeof a.className&&a.className||"undefined"!=typeof a.getAttribute&&a.getAttribute("class")||"")})},ATTR:function(a,b,c){return function(d){var e=gb.attr(d,a);return null==e?"!="===b:b?(e+="","="===b?e===c:"!="===b?e!==c:"^="===b?c&&0===e.indexOf(c):"*="===b?c&&e.indexOf(c)>-1:"$="===b?c&&e.slice(-c.length)===c:"~="===b?(" "+e.replace(Q," ")+" ").indexOf(c)>-1:"|="===b?e===c||e.slice(0,c.length+1)===c+"-":!1):!0}},CHILD:function(a,b,c,d,e){var f="nth"!==a.slice(0,3),g="last"!==a.slice(-4),h="of-type"===b;return 1===d&&0===e?function(a){return!!a.parentNode}:function(b,c,i){var j,k,l,m,n,o,p=f!==g?"nextSibling":"previousSibling",q=b.parentNode,r=h&&b.nodeName.toLowerCase(),s=!i&&!h;if(q){if(f){while(p){l=b;while(l=l[p])if(h?l.nodeName.toLowerCase()===r:1===l.nodeType)return!1;o=p="only"===a&&!o&&"nextSibling"}return!0}if(o=[g?q.firstChild:q.lastChild],g&&s){k=q[u]||(q[u]={}),j=k[a]||[],n=j[0]===w&&j[1],m=j[0]===w&&j[2],l=n&&q.childNodes[n];while(l=++n&&l&&l[p]||(m=n=0)||o.pop())if(1===l.nodeType&&++m&&l===b){k[a]=[w,n,m];break}}else if(s&&(j=(b[u]||(b[u]={}))[a])&&j[0]===w)m=j[1];else while(l=++n&&l&&l[p]||(m=n=0)||o.pop())if((h?l.nodeName.toLowerCase()===r:1===l.nodeType)&&++m&&(s&&((l[u]||(l[u]={}))[a]=[w,m]),l===b))break;return m-=e,m===d||m%d===0&&m/d>=0}}},PSEUDO:function(a,b){var c,e=d.pseudos[a]||d.setFilters[a.toLowerCase()]||gb.error("unsupported pseudo: "+a);return e[u]?e(b):e.length>1?(c=[a,a,"",b],d.setFilters.hasOwnProperty(a.toLowerCase())?ib(function(a,c){var d,f=e(a,b),g=f.length;while(g--)d=J(a,f[g]),a[d]=!(c[d]=f[g])}):function(a){return e(a,0,c)}):e}},pseudos:{not:ib(function(a){var b=[],c=[],d=h(a.replace(R,"$1"));return d[u]?ib(function(a,b,c,e){var f,g=d(a,null,e,[]),h=a.length;while(h--)(f=g[h])&&(a[h]=!(b[h]=f))}):function(a,e,f){return b[0]=a,d(b,null,f,c),b[0]=null,!c.pop()}}),has:ib(function(a){return function(b){return gb(a,b).length>0}}),contains:ib(function(a){return a=a.replace(cb,db),function(b){return(b.textContent||b.innerText||e(b)).indexOf(a)>-1}}),lang:ib(function(a){return W.test(a||"")||gb.error("unsupported lang: "+a),a=a.replace(cb,db).toLowerCase(),function(b){var c;do if(c=p?b.lang:b.getAttribute("xml:lang")||b.getAttribute("lang"))return c=c.toLowerCase(),c===a||0===c.indexOf(a+"-");while((b=b.parentNode)&&1===b.nodeType);return!1}}),target:function(b){var c=a.location&&a.location.hash;return c&&c.slice(1)===b.id},root:function(a){return a===o},focus:function(a){return a===n.activeElement&&(!n.hasFocus||n.hasFocus())&&!!(a.type||a.href||~a.tabIndex)},enabled:function(a){return a.disabled===!1},disabled:function(a){return a.disabled===!0},checked:function(a){var b=a.nodeName.toLowerCase();return"input"===b&&!!a.checked||"option"===b&&!!a.selected},selected:function(a){return a.parentNode&&a.parentNode.selectedIndex,a.selected===!0},empty:function(a){for(a=a.firstChild;a;a=a.nextSibling)if(a.nodeType<6)return!1;return!0},parent:function(a){return!d.pseudos.empty(a)},header:function(a){return Z.test(a.nodeName)},input:function(a){return Y.test(a.nodeName)},button:function(a){var b=a.nodeName.toLowerCase();return"input"===b&&"button"===a.type||"button"===b},text:function(a){var b;return"input"===a.nodeName.toLowerCase()&&"text"===a.type&&(null==(b=a.getAttribute("type"))||"text"===b.toLowerCase())},first:ob(function(){return[0]}),last:ob(function(a,b){return[b-1]}),eq:ob(function(a,b,c){return[0>c?c+b:c]}),even:ob(function(a,b){for(var c=0;b>c;c+=2)a.push(c);return a}),odd:ob(function(a,b){for(var c=1;b>c;c+=2)a.push(c);return a}),lt:ob(function(a,b,c){for(var d=0>c?c+b:c;--d>=0;)a.push(d);return a}),gt:ob(function(a,b,c){for(var d=0>c?c+b:c;++d<b;)a.push(d);return a})}},d.pseudos.nth=d.pseudos.eq;for(b in{radio:!0,checkbox:!0,file:!0,password:!0,image:!0})d.pseudos[b]=mb(b);for(b in{submit:!0,reset:!0})d.pseudos[b]=nb(b);function qb(){}qb.prototype=d.filters=d.pseudos,d.setFilters=new qb,g=gb.tokenize=function(a,b){var c,e,f,g,h,i,j,k=z[a+" "];if(k)return b?0:k.slice(0);h=a,i=[],j=d.preFilter;while(h){(!c||(e=S.exec(h)))&&(e&&(h=h.slice(e[0].length)||h),i.push(f=[])),c=!1,(e=T.exec(h))&&(c=e.shift(),f.push({value:c,type:e[0].replace(R," ")}),h=h.slice(c.length));for(g in d.filter)!(e=X[g].exec(h))||j[g]&&!(e=j[g](e))||(c=e.shift(),f.push({value:c,type:g,matches:e}),h=h.slice(c.length));if(!c)break}return b?h.length:h?gb.error(a):z(a,i).slice(0)};function rb(a){for(var b=0,c=a.length,d="";c>b;b++)d+=a[b].value;return d}function sb(a,b,c){var d=b.dir,e=c&&"parentNode"===d,f=x++;return b.first?function(b,c,f){while(b=b[d])if(1===b.nodeType||e)return a(b,c,f)}:function(b,c,g){var h,i,j=[w,f];if(g){while(b=b[d])if((1===b.nodeType||e)&&a(b,c,g))return!0}else while(b=b[d])if(1===b.nodeType||e){if(i=b[u]||(b[u]={}),(h=i[d])&&h[0]===w&&h[1]===f)return j[2]=h[2];if(i[d]=j,j[2]=a(b,c,g))return!0}}}function tb(a){return a.length>1?function(b,c,d){var e=a.length;while(e--)if(!a[e](b,c,d))return!1;return!0}:a[0]}function ub(a,b,c){for(var d=0,e=b.length;e>d;d++)gb(a,b[d],c);return c}function vb(a,b,c,d,e){for(var f,g=[],h=0,i=a.length,j=null!=b;i>h;h++)(f=a[h])&&(!c||c(f,d,e))&&(g.push(f),j&&b.push(h));return g}function wb(a,b,c,d,e,f){return d&&!d[u]&&(d=wb(d)),e&&!e[u]&&(e=wb(e,f)),ib(function(f,g,h,i){var j,k,l,m=[],n=[],o=g.length,p=f||ub(b||"*",h.nodeType?[h]:h,[]),q=!a||!f&&b?p:vb(p,m,a,h,i),r=c?e||(f?a:o||d)?[]:g:q;if(c&&c(q,r,h,i),d){j=vb(r,n),d(j,[],h,i),k=j.length;while(k--)(l=j[k])&&(r[n[k]]=!(q[n[k]]=l))}if(f){if(e||a){if(e){j=[],k=r.length;while(k--)(l=r[k])&&j.push(q[k]=l);e(null,r=[],j,i)}k=r.length;while(k--)(l=r[k])&&(j=e?J(f,l):m[k])>-1&&(f[j]=!(g[j]=l))}}else r=vb(r===g?r.splice(o,r.length):r),e?e(null,g,r,i):H.apply(g,r)})}function xb(a){for(var b,c,e,f=a.length,g=d.relative[a[0].type],h=g||d.relative[" "],i=g?1:0,k=sb(function(a){return a===b},h,!0),l=sb(function(a){return J(b,a)>-1},h,!0),m=[function(a,c,d){var e=!g&&(d||c!==j)||((b=c).nodeType?k(a,c,d):l(a,c,d));return b=null,e}];f>i;i++)if(c=d.relative[a[i].type])m=[sb(tb(m),c)];else{if(c=d.filter[a[i].type].apply(null,a[i].matches),c[u]){for(e=++i;f>e;e++)if(d.relative[a[e].type])break;return wb(i>1&&tb(m),i>1&&rb(a.slice(0,i-1).concat({value:" "===a[i-2].type?"*":""})).replace(R,"$1"),c,e>i&&xb(a.slice(i,e)),f>e&&xb(a=a.slice(e)),f>e&&rb(a))}m.push(c)}return tb(m)}function yb(a,b){var c=b.length>0,e=a.length>0,f=function(f,g,h,i,k){var l,m,o,p=0,q="0",r=f&&[],s=[],t=j,u=f||e&&d.find.TAG("*",k),v=w+=null==t?1:Math.random()||.1,x=u.length;for(k&&(j=g!==n&&g);q!==x&&null!=(l=u[q]);q++){if(e&&l){m=0;while(o=a[m++])if(o(l,g,h)){i.push(l);break}k&&(w=v)}c&&((l=!o&&l)&&p--,f&&r.push(l))}if(p+=q,c&&q!==p){m=0;while(o=b[m++])o(r,s,g,h);if(f){if(p>0)while(q--)r[q]||s[q]||(s[q]=F.call(i));s=vb(s)}H.apply(i,s),k&&!f&&s.length>0&&p+b.length>1&&gb.uniqueSort(i)}return k&&(w=v,j=t),r};return c?ib(f):f}return h=gb.compile=function(a,b){var c,d=[],e=[],f=A[a+" "];if(!f){b||(b=g(a)),c=b.length;while(c--)f=xb(b[c]),f[u]?d.push(f):e.push(f);f=A(a,yb(e,d)),f.selector=a}return f},i=gb.select=function(a,b,e,f){var i,j,k,l,m,n="function"==typeof a&&a,o=!f&&g(a=n.selector||a);if(e=e||[],1===o.length){if(j=o[0]=o[0].slice(0),j.length>2&&"ID"===(k=j[0]).type&&c.getById&&9===b.nodeType&&p&&d.relative[j[1].type]){if(b=(d.find.ID(k.matches[0].replace(cb,db),b)||[])[0],!b)return e;n&&(b=b.parentNode),a=a.slice(j.shift().value.length)}i=X.needsContext.test(a)?0:j.length;while(i--){if(k=j[i],d.relative[l=k.type])break;if((m=d.find[l])&&(f=m(k.matches[0].replace(cb,db),ab.test(j[0].type)&&pb(b.parentNode)||b))){if(j.splice(i,1),a=f.length&&rb(j),!a)return H.apply(e,f),e;break}}}return(n||h(a,o))(f,b,!p,e,ab.test(a)&&pb(b.parentNode)||b),e},c.sortStable=u.split("").sort(B).join("")===u,c.detectDuplicates=!!l,m(),c.sortDetached=jb(function(a){return 1&a.compareDocumentPosition(n.createElement("div"))}),jb(function(a){return a.innerHTML="<a href='#'></a>","#"===a.firstChild.getAttribute("href")})||kb("type|href|height|width",function(a,b,c){return c?void 0:a.getAttribute(b,"type"===b.toLowerCase()?1:2)}),c.attributes&&jb(function(a){return a.innerHTML="<input/>",a.firstChild.setAttribute("value",""),""===a.firstChild.getAttribute("value")})||kb("value",function(a,b,c){return c||"input"!==a.nodeName.toLowerCase()?void 0:a.defaultValue}),jb(function(a){return null==a.getAttribute("disabled")})||kb(K,function(a,b,c){var d;return c?void 0:a[b]===!0?b.toLowerCase():(d=a.getAttributeNode(b))&&d.specified?d.value:null}),gb}(a);n.find=t,n.expr=t.selectors,n.expr[":"]=n.expr.pseudos,n.unique=t.uniqueSort,n.text=t.getText,n.isXMLDoc=t.isXML,n.contains=t.contains;var u=n.expr.match.needsContext,v=/^<(\w+)\s*\/?>(?:<\/\1>|)$/,w=/^.[^:#\[\.,]*$/;function x(a,b,c){if(n.isFunction(b))return n.grep(a,function(a,d){return!!b.call(a,d,a)!==c});if(b.nodeType)return n.grep(a,function(a){return a===b!==c});if("string"==typeof b){if(w.test(b))return n.filter(b,a,c);b=n.filter(b,a)}return n.grep(a,function(a){return g.call(b,a)>=0!==c})}n.filter=function(a,b,c){var d=b[0];return c&&(a=":not("+a+")"),1===b.length&&1===d.nodeType?n.find.matchesSelector(d,a)?[d]:[]:n.find.matches(a,n.grep(b,function(a){return 1===a.nodeType}))},n.fn.extend({find:function(a){var b,c=this.length,d=[],e=this;if("string"!=typeof a)return this.pushStack(n(a).filter(function(){for(b=0;c>b;b++)if(n.contains(e[b],this))return!0}));for(b=0;c>b;b++)n.find(a,e[b],d);return d=this.pushStack(c>1?n.unique(d):d),d.selector=this.selector?this.selector+" "+a:a,d},filter:function(a){return this.pushStack(x(this,a||[],!1))},not:function(a){return this.pushStack(x(this,a||[],!0))},is:function(a){return!!x(this,"string"==typeof a&&u.test(a)?n(a):a||[],!1).length}});var y,z=/^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]*))$/,A=n.fn.init=function(a,b){var c,d;if(!a)return this;if("string"==typeof a){if(c="<"===a[0]&&">"===a[a.length-1]&&a.length>=3?[null,a,null]:z.exec(a),!c||!c[1]&&b)return!b||b.jquery?(b||y).find(a):this.constructor(b).find(a);if(c[1]){if(b=b instanceof n?b[0]:b,n.merge(this,n.parseHTML(c[1],b&&b.nodeType?b.ownerDocument||b:l,!0)),v.test(c[1])&&n.isPlainObject(b))for(c in b)n.isFunction(this[c])?this[c](b[c]):this.attr(c,b[c]);return this}return d=l.getElementById(c[2]),d&&d.parentNode&&(this.length=1,this[0]=d),this.context=l,this.selector=a,this}return a.nodeType?(this.context=this[0]=a,this.length=1,this):n.isFunction(a)?"undefined"!=typeof y.ready?y.ready(a):a(n):(void 0!==a.selector&&(this.selector=a.selector,this.context=a.context),n.makeArray(a,this))};A.prototype=n.fn,y=n(l);var B=/^(?:parents|prev(?:Until|All))/,C={children:!0,contents:!0,next:!0,prev:!0};n.extend({dir:function(a,b,c){var d=[],e=void 0!==c;while((a=a[b])&&9!==a.nodeType)if(1===a.nodeType){if(e&&n(a).is(c))break;d.push(a)}return d},sibling:function(a,b){for(var c=[];a;a=a.nextSibling)1===a.nodeType&&a!==b&&c.push(a);return c}}),n.fn.extend({has:function(a){var b=n(a,this),c=b.length;return this.filter(function(){for(var a=0;c>a;a++)if(n.contains(this,b[a]))return!0})},closest:function(a,b){for(var c,d=0,e=this.length,f=[],g=u.test(a)||"string"!=typeof a?n(a,b||this.context):0;e>d;d++)for(c=this[d];c&&c!==b;c=c.parentNode)if(c.nodeType<11&&(g?g.index(c)>-1:1===c.nodeType&&n.find.matchesSelector(c,a))){f.push(c);break}return this.pushStack(f.length>1?n.unique(f):f)},index:function(a){return a?"string"==typeof a?g.call(n(a),this[0]):g.call(this,a.jquery?a[0]:a):this[0]&&this[0].parentNode?this.first().prevAll().length:-1},add:function(a,b){return this.pushStack(n.unique(n.merge(this.get(),n(a,b))))},addBack:function(a){return this.add(null==a?this.prevObject:this.prevObject.filter(a))}});function D(a,b){while((a=a[b])&&1!==a.nodeType);return a}n.each({parent:function(a){var b=a.parentNode;return b&&11!==b.nodeType?b:null},parents:function(a){return n.dir(a,"parentNode")},parentsUntil:function(a,b,c){return n.dir(a,"parentNode",c)},next:function(a){return D(a,"nextSibling")},prev:function(a){return D(a,"previousSibling")},nextAll:function(a){return n.dir(a,"nextSibling")},prevAll:function(a){return n.dir(a,"previousSibling")},nextUntil:function(a,b,c){return n.dir(a,"nextSibling",c)},prevUntil:function(a,b,c){return n.dir(a,"previousSibling",c)},siblings:function(a){return n.sibling((a.parentNode||{}).firstChild,a)},children:function(a){return n.sibling(a.firstChild)},contents:function(a){return a.contentDocument||n.merge([],a.childNodes)}},function(a,b){n.fn[a]=function(c,d){var e=n.map(this,b,c);return"Until"!==a.slice(-5)&&(d=c),d&&"string"==typeof d&&(e=n.filter(d,e)),this.length>1&&(C[a]||n.unique(e),B.test(a)&&e.reverse()),this.pushStack(e)}});var E=/\S+/g,F={};function G(a){var b=F[a]={};return n.each(a.match(E)||[],function(a,c){b[c]=!0}),b}n.Callbacks=function(a){a="string"==typeof a?F[a]||G(a):n.extend({},a);var b,c,d,e,f,g,h=[],i=!a.once&&[],j=function(l){for(b=a.memory&&l,c=!0,g=e||0,e=0,f=h.length,d=!0;h&&f>g;g++)if(h[g].apply(l[0],l[1])===!1&&a.stopOnFalse){b=!1;break}d=!1,h&&(i?i.length&&j(i.shift()):b?h=[]:k.disable())},k={add:function(){if(h){var c=h.length;!function g(b){n.each(b,function(b,c){var d=n.type(c);"function"===d?a.unique&&k.has(c)||h.push(c):c&&c.length&&"string"!==d&&g(c)})}(arguments),d?f=h.length:b&&(e=c,j(b))}return this},remove:function(){return h&&n.each(arguments,function(a,b){var c;while((c=n.inArray(b,h,c))>-1)h.splice(c,1),d&&(f>=c&&f--,g>=c&&g--)}),this},has:function(a){return a?n.inArray(a,h)>-1:!(!h||!h.length)},empty:function(){return h=[],f=0,this},disable:function(){return h=i=b=void 0,this},disabled:function(){return!h},lock:function(){return i=void 0,b||k.disable(),this},locked:function(){return!i},fireWith:function(a,b){return!h||c&&!i||(b=b||[],b=[a,b.slice?b.slice():b],d?i.push(b):j(b)),this},fire:function(){return k.fireWith(this,arguments),this},fired:function(){return!!c}};return k},n.extend({Deferred:function(a){var b=[["resolve","done",n.Callbacks("once memory"),"resolved"],["reject","fail",n.Callbacks("once memory"),"rejected"],["notify","progress",n.Callbacks("memory")]],c="pending",d={state:function(){return c},always:function(){return e.done(arguments).fail(arguments),this},then:function(){var a=arguments;return n.Deferred(function(c){n.each(b,function(b,f){var g=n.isFunction(a[b])&&a[b];e[f[1]](function(){var a=g&&g.apply(this,arguments);a&&n.isFunction(a.promise)?a.promise().done(c.resolve).fail(c.reject).progress(c.notify):c[f[0]+"With"](this===d?c.promise():this,g?[a]:arguments)})}),a=null}).promise()},promise:function(a){return null!=a?n.extend(a,d):d}},e={};return d.pipe=d.then,n.each(b,function(a,f){var g=f[2],h=f[3];d[f[1]]=g.add,h&&g.add(function(){c=h},b[1^a][2].disable,b[2][2].lock),e[f[0]]=function(){return e[f[0]+"With"](this===e?d:this,arguments),this},e[f[0]+"With"]=g.fireWith}),d.promise(e),a&&a.call(e,e),e},when:function(a){var b=0,c=d.call(arguments),e=c.length,f=1!==e||a&&n.isFunction(a.promise)?e:0,g=1===f?a:n.Deferred(),h=function(a,b,c){return function(e){b[a]=this,c[a]=arguments.length>1?d.call(arguments):e,c===i?g.notifyWith(b,c):--f||g.resolveWith(b,c)}},i,j,k;if(e>1)for(i=new Array(e),j=new Array(e),k=new Array(e);e>b;b++)c[b]&&n.isFunction(c[b].promise)?c[b].promise().done(h(b,k,c)).fail(g.reject).progress(h(b,j,i)):--f;return f||g.resolveWith(k,c),g.promise()}});var H;n.fn.ready=function(a){return n.ready.promise().done(a),this},n.extend({isReady:!1,readyWait:1,holdReady:function(a){a?n.readyWait++:n.ready(!0)},ready:function(a){(a===!0?--n.readyWait:n.isReady)||(n.isReady=!0,a!==!0&&--n.readyWait>0||(H.resolveWith(l,[n]),n.fn.triggerHandler&&(n(l).triggerHandler("ready"),n(l).off("ready"))))}});function I(){l.removeEventListener("DOMContentLoaded",I,!1),a.removeEventListener("load",I,!1),n.ready()}n.ready.promise=function(b){return H||(H=n.Deferred(),"complete"===l.readyState?setTimeout(n.ready):(l.addEventListener("DOMContentLoaded",I,!1),a.addEventListener("load",I,!1))),H.promise(b)},n.ready.promise();var J=n.access=function(a,b,c,d,e,f,g){var h=0,i=a.length,j=null==c;if("object"===n.type(c)){e=!0;for(h in c)n.access(a,b,h,c[h],!0,f,g)}else if(void 0!==d&&(e=!0,n.isFunction(d)||(g=!0),j&&(g?(b.call(a,d),b=null):(j=b,b=function(a,b,c){return j.call(n(a),c)})),b))for(;i>h;h++)b(a[h],c,g?d:d.call(a[h],h,b(a[h],c)));return e?a:j?b.call(a):i?b(a[0],c):f};n.acceptData=function(a){return 1===a.nodeType||9===a.nodeType||!+a.nodeType};function K(){Object.defineProperty(this.cache={},0,{get:function(){return{}}}),this.expando=n.expando+K.uid++}K.uid=1,K.accepts=n.acceptData,K.prototype={key:function(a){if(!K.accepts(a))return 0;var b={},c=a[this.expando];if(!c){c=K.uid++;try{b[this.expando]={value:c},Object.defineProperties(a,b)}catch(d){b[this.expando]=c,n.extend(a,b)}}return this.cache[c]||(this.cache[c]={}),c},set:function(a,b,c){var d,e=this.key(a),f=this.cache[e];if("string"==typeof b)f[b]=c;else if(n.isEmptyObject(f))n.extend(this.cache[e],b);else for(d in b)f[d]=b[d];return f},get:function(a,b){var c=this.cache[this.key(a)];return void 0===b?c:c[b]},access:function(a,b,c){var d;return void 0===b||b&&"string"==typeof b&&void 0===c?(d=this.get(a,b),void 0!==d?d:this.get(a,n.camelCase(b))):(this.set(a,b,c),void 0!==c?c:b)},remove:function(a,b){var c,d,e,f=this.key(a),g=this.cache[f];if(void 0===b)this.cache[f]={};else{n.isArray(b)?d=b.concat(b.map(n.camelCase)):(e=n.camelCase(b),b in g?d=[b,e]:(d=e,d=d in g?[d]:d.match(E)||[])),c=d.length;while(c--)delete g[d[c]]}},hasData:function(a){return!n.isEmptyObject(this.cache[a[this.expando]]||{})},discard:function(a){a[this.expando]&&delete this.cache[a[this.expando]]}};var L=new K,M=new K,N=/^(?:\{[\w\W]*\}|\[[\w\W]*\])$/,O=/([A-Z])/g;function P(a,b,c){var d;if(void 0===c&&1===a.nodeType)if(d="data-"+b.replace(O,"-$1").toLowerCase(),c=a.getAttribute(d),"string"==typeof c){try{c="true"===c?!0:"false"===c?!1:"null"===c?null:+c+""===c?+c:N.test(c)?n.parseJSON(c):c}catch(e){}M.set(a,b,c)}else c=void 0;return c}n.extend({hasData:function(a){return M.hasData(a)||L.hasData(a)},data:function(a,b,c){return M.access(a,b,c)
},removeData:function(a,b){M.remove(a,b)},_data:function(a,b,c){return L.access(a,b,c)},_removeData:function(a,b){L.remove(a,b)}}),n.fn.extend({data:function(a,b){var c,d,e,f=this[0],g=f&&f.attributes;if(void 0===a){if(this.length&&(e=M.get(f),1===f.nodeType&&!L.get(f,"hasDataAttrs"))){c=g.length;while(c--)g[c]&&(d=g[c].name,0===d.indexOf("data-")&&(d=n.camelCase(d.slice(5)),P(f,d,e[d])));L.set(f,"hasDataAttrs",!0)}return e}return"object"==typeof a?this.each(function(){M.set(this,a)}):J(this,function(b){var c,d=n.camelCase(a);if(f&&void 0===b){if(c=M.get(f,a),void 0!==c)return c;if(c=M.get(f,d),void 0!==c)return c;if(c=P(f,d,void 0),void 0!==c)return c}else this.each(function(){var c=M.get(this,d);M.set(this,d,b),-1!==a.indexOf("-")&&void 0!==c&&M.set(this,a,b)})},null,b,arguments.length>1,null,!0)},removeData:function(a){return this.each(function(){M.remove(this,a)})}}),n.extend({queue:function(a,b,c){var d;return a?(b=(b||"fx")+"queue",d=L.get(a,b),c&&(!d||n.isArray(c)?d=L.access(a,b,n.makeArray(c)):d.push(c)),d||[]):void 0},dequeue:function(a,b){b=b||"fx";var c=n.queue(a,b),d=c.length,e=c.shift(),f=n._queueHooks(a,b),g=function(){n.dequeue(a,b)};"inprogress"===e&&(e=c.shift(),d--),e&&("fx"===b&&c.unshift("inprogress"),delete f.stop,e.call(a,g,f)),!d&&f&&f.empty.fire()},_queueHooks:function(a,b){var c=b+"queueHooks";return L.get(a,c)||L.access(a,c,{empty:n.Callbacks("once memory").add(function(){L.remove(a,[b+"queue",c])})})}}),n.fn.extend({queue:function(a,b){var c=2;return"string"!=typeof a&&(b=a,a="fx",c--),arguments.length<c?n.queue(this[0],a):void 0===b?this:this.each(function(){var c=n.queue(this,a,b);n._queueHooks(this,a),"fx"===a&&"inprogress"!==c[0]&&n.dequeue(this,a)})},dequeue:function(a){return this.each(function(){n.dequeue(this,a)})},clearQueue:function(a){return this.queue(a||"fx",[])},promise:function(a,b){var c,d=1,e=n.Deferred(),f=this,g=this.length,h=function(){--d||e.resolveWith(f,[f])};"string"!=typeof a&&(b=a,a=void 0),a=a||"fx";while(g--)c=L.get(f[g],a+"queueHooks"),c&&c.empty&&(d++,c.empty.add(h));return h(),e.promise(b)}});var Q=/[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/.source,R=["Top","Right","Bottom","Left"],S=function(a,b){return a=b||a,"none"===n.css(a,"display")||!n.contains(a.ownerDocument,a)},T=/^(?:checkbox|radio)$/i;!function(){var a=l.createDocumentFragment(),b=a.appendChild(l.createElement("div")),c=l.createElement("input");c.setAttribute("type","radio"),c.setAttribute("checked","checked"),c.setAttribute("name","t"),b.appendChild(c),k.checkClone=b.cloneNode(!0).cloneNode(!0).lastChild.checked,b.innerHTML="<textarea>x</textarea>",k.noCloneChecked=!!b.cloneNode(!0).lastChild.defaultValue}();var U="undefined";k.focusinBubbles="onfocusin"in a;var V=/^key/,W=/^(?:mouse|pointer|contextmenu)|click/,X=/^(?:focusinfocus|focusoutblur)$/,Y=/^([^.]*)(?:\.(.+)|)$/;function Z(){return!0}function $(){return!1}function _(){try{return l.activeElement}catch(a){}}n.event={global:{},add:function(a,b,c,d,e){var f,g,h,i,j,k,l,m,o,p,q,r=L.get(a);if(r){c.handler&&(f=c,c=f.handler,e=f.selector),c.guid||(c.guid=n.guid++),(i=r.events)||(i=r.events={}),(g=r.handle)||(g=r.handle=function(b){return typeof n!==U&&n.event.triggered!==b.type?n.event.dispatch.apply(a,arguments):void 0}),b=(b||"").match(E)||[""],j=b.length;while(j--)h=Y.exec(b[j])||[],o=q=h[1],p=(h[2]||"").split(".").sort(),o&&(l=n.event.special[o]||{},o=(e?l.delegateType:l.bindType)||o,l=n.event.special[o]||{},k=n.extend({type:o,origType:q,data:d,handler:c,guid:c.guid,selector:e,needsContext:e&&n.expr.match.needsContext.test(e),namespace:p.join(".")},f),(m=i[o])||(m=i[o]=[],m.delegateCount=0,l.setup&&l.setup.call(a,d,p,g)!==!1||a.addEventListener&&a.addEventListener(o,g,!1)),l.add&&(l.add.call(a,k),k.handler.guid||(k.handler.guid=c.guid)),e?m.splice(m.delegateCount++,0,k):m.push(k),n.event.global[o]=!0)}},remove:function(a,b,c,d,e){var f,g,h,i,j,k,l,m,o,p,q,r=L.hasData(a)&&L.get(a);if(r&&(i=r.events)){b=(b||"").match(E)||[""],j=b.length;while(j--)if(h=Y.exec(b[j])||[],o=q=h[1],p=(h[2]||"").split(".").sort(),o){l=n.event.special[o]||{},o=(d?l.delegateType:l.bindType)||o,m=i[o]||[],h=h[2]&&new RegExp("(^|\\.)"+p.join("\\.(?:.*\\.|)")+"(\\.|$)"),g=f=m.length;while(f--)k=m[f],!e&&q!==k.origType||c&&c.guid!==k.guid||h&&!h.test(k.namespace)||d&&d!==k.selector&&("**"!==d||!k.selector)||(m.splice(f,1),k.selector&&m.delegateCount--,l.remove&&l.remove.call(a,k));g&&!m.length&&(l.teardown&&l.teardown.call(a,p,r.handle)!==!1||n.removeEvent(a,o,r.handle),delete i[o])}else for(o in i)n.event.remove(a,o+b[j],c,d,!0);n.isEmptyObject(i)&&(delete r.handle,L.remove(a,"events"))}},trigger:function(b,c,d,e){var f,g,h,i,k,m,o,p=[d||l],q=j.call(b,"type")?b.type:b,r=j.call(b,"namespace")?b.namespace.split("."):[];if(g=h=d=d||l,3!==d.nodeType&&8!==d.nodeType&&!X.test(q+n.event.triggered)&&(q.indexOf(".")>=0&&(r=q.split("."),q=r.shift(),r.sort()),k=q.indexOf(":")<0&&"on"+q,b=b[n.expando]?b:new n.Event(q,"object"==typeof b&&b),b.isTrigger=e?2:3,b.namespace=r.join("."),b.namespace_re=b.namespace?new RegExp("(^|\\.)"+r.join("\\.(?:.*\\.|)")+"(\\.|$)"):null,b.result=void 0,b.target||(b.target=d),c=null==c?[b]:n.makeArray(c,[b]),o=n.event.special[q]||{},e||!o.trigger||o.trigger.apply(d,c)!==!1)){if(!e&&!o.noBubble&&!n.isWindow(d)){for(i=o.delegateType||q,X.test(i+q)||(g=g.parentNode);g;g=g.parentNode)p.push(g),h=g;h===(d.ownerDocument||l)&&p.push(h.defaultView||h.parentWindow||a)}f=0;while((g=p[f++])&&!b.isPropagationStopped())b.type=f>1?i:o.bindType||q,m=(L.get(g,"events")||{})[b.type]&&L.get(g,"handle"),m&&m.apply(g,c),m=k&&g[k],m&&m.apply&&n.acceptData(g)&&(b.result=m.apply(g,c),b.result===!1&&b.preventDefault());return b.type=q,e||b.isDefaultPrevented()||o._default&&o._default.apply(p.pop(),c)!==!1||!n.acceptData(d)||k&&n.isFunction(d[q])&&!n.isWindow(d)&&(h=d[k],h&&(d[k]=null),n.event.triggered=q,d[q](),n.event.triggered=void 0,h&&(d[k]=h)),b.result}},dispatch:function(a){a=n.event.fix(a);var b,c,e,f,g,h=[],i=d.call(arguments),j=(L.get(this,"events")||{})[a.type]||[],k=n.event.special[a.type]||{};if(i[0]=a,a.delegateTarget=this,!k.preDispatch||k.preDispatch.call(this,a)!==!1){h=n.event.handlers.call(this,a,j),b=0;while((f=h[b++])&&!a.isPropagationStopped()){a.currentTarget=f.elem,c=0;while((g=f.handlers[c++])&&!a.isImmediatePropagationStopped())(!a.namespace_re||a.namespace_re.test(g.namespace))&&(a.handleObj=g,a.data=g.data,e=((n.event.special[g.origType]||{}).handle||g.handler).apply(f.elem,i),void 0!==e&&(a.result=e)===!1&&(a.preventDefault(),a.stopPropagation()))}return k.postDispatch&&k.postDispatch.call(this,a),a.result}},handlers:function(a,b){var c,d,e,f,g=[],h=b.delegateCount,i=a.target;if(h&&i.nodeType&&(!a.button||"click"!==a.type))for(;i!==this;i=i.parentNode||this)if(i.disabled!==!0||"click"!==a.type){for(d=[],c=0;h>c;c++)f=b[c],e=f.selector+" ",void 0===d[e]&&(d[e]=f.needsContext?n(e,this).index(i)>=0:n.find(e,this,null,[i]).length),d[e]&&d.push(f);d.length&&g.push({elem:i,handlers:d})}return h<b.length&&g.push({elem:this,handlers:b.slice(h)}),g},props:"altKey bubbles cancelable ctrlKey currentTarget eventPhase metaKey relatedTarget shiftKey target timeStamp view which".split(" "),fixHooks:{},keyHooks:{props:"char charCode key keyCode".split(" "),filter:function(a,b){return null==a.which&&(a.which=null!=b.charCode?b.charCode:b.keyCode),a}},mouseHooks:{props:"button buttons clientX clientY offsetX offsetY pageX pageY screenX screenY toElement".split(" "),filter:function(a,b){var c,d,e,f=b.button;return null==a.pageX&&null!=b.clientX&&(c=a.target.ownerDocument||l,d=c.documentElement,e=c.body,a.pageX=b.clientX+(d&&d.scrollLeft||e&&e.scrollLeft||0)-(d&&d.clientLeft||e&&e.clientLeft||0),a.pageY=b.clientY+(d&&d.scrollTop||e&&e.scrollTop||0)-(d&&d.clientTop||e&&e.clientTop||0)),a.which||void 0===f||(a.which=1&f?1:2&f?3:4&f?2:0),a}},fix:function(a){if(a[n.expando])return a;var b,c,d,e=a.type,f=a,g=this.fixHooks[e];g||(this.fixHooks[e]=g=W.test(e)?this.mouseHooks:V.test(e)?this.keyHooks:{}),d=g.props?this.props.concat(g.props):this.props,a=new n.Event(f),b=d.length;while(b--)c=d[b],a[c]=f[c];return a.target||(a.target=l),3===a.target.nodeType&&(a.target=a.target.parentNode),g.filter?g.filter(a,f):a},special:{load:{noBubble:!0},focus:{trigger:function(){return this!==_()&&this.focus?(this.focus(),!1):void 0},delegateType:"focusin"},blur:{trigger:function(){return this===_()&&this.blur?(this.blur(),!1):void 0},delegateType:"focusout"},click:{trigger:function(){return"checkbox"===this.type&&this.click&&n.nodeName(this,"input")?(this.click(),!1):void 0},_default:function(a){return n.nodeName(a.target,"a")}},beforeunload:{postDispatch:function(a){void 0!==a.result&&a.originalEvent&&(a.originalEvent.returnValue=a.result)}}},simulate:function(a,b,c,d){var e=n.extend(new n.Event,c,{type:a,isSimulated:!0,originalEvent:{}});d?n.event.trigger(e,null,b):n.event.dispatch.call(b,e),e.isDefaultPrevented()&&c.preventDefault()}},n.removeEvent=function(a,b,c){a.removeEventListener&&a.removeEventListener(b,c,!1)},n.Event=function(a,b){return this instanceof n.Event?(a&&a.type?(this.originalEvent=a,this.type=a.type,this.isDefaultPrevented=a.defaultPrevented||void 0===a.defaultPrevented&&a.returnValue===!1?Z:$):this.type=a,b&&n.extend(this,b),this.timeStamp=a&&a.timeStamp||n.now(),void(this[n.expando]=!0)):new n.Event(a,b)},n.Event.prototype={isDefaultPrevented:$,isPropagationStopped:$,isImmediatePropagationStopped:$,preventDefault:function(){var a=this.originalEvent;this.isDefaultPrevented=Z,a&&a.preventDefault&&a.preventDefault()},stopPropagation:function(){var a=this.originalEvent;this.isPropagationStopped=Z,a&&a.stopPropagation&&a.stopPropagation()},stopImmediatePropagation:function(){var a=this.originalEvent;this.isImmediatePropagationStopped=Z,a&&a.stopImmediatePropagation&&a.stopImmediatePropagation(),this.stopPropagation()}},n.each({mouseenter:"mouseover",mouseleave:"mouseout",pointerenter:"pointerover",pointerleave:"pointerout"},function(a,b){n.event.special[a]={delegateType:b,bindType:b,handle:function(a){var c,d=this,e=a.relatedTarget,f=a.handleObj;return(!e||e!==d&&!n.contains(d,e))&&(a.type=f.origType,c=f.handler.apply(this,arguments),a.type=b),c}}}),k.focusinBubbles||n.each({focus:"focusin",blur:"focusout"},function(a,b){var c=function(a){n.event.simulate(b,a.target,n.event.fix(a),!0)};n.event.special[b]={setup:function(){var d=this.ownerDocument||this,e=L.access(d,b);e||d.addEventListener(a,c,!0),L.access(d,b,(e||0)+1)},teardown:function(){var d=this.ownerDocument||this,e=L.access(d,b)-1;e?L.access(d,b,e):(d.removeEventListener(a,c,!0),L.remove(d,b))}}}),n.fn.extend({on:function(a,b,c,d,e){var f,g;if("object"==typeof a){"string"!=typeof b&&(c=c||b,b=void 0);for(g in a)this.on(g,b,c,a[g],e);return this}if(null==c&&null==d?(d=b,c=b=void 0):null==d&&("string"==typeof b?(d=c,c=void 0):(d=c,c=b,b=void 0)),d===!1)d=$;else if(!d)return this;return 1===e&&(f=d,d=function(a){return n().off(a),f.apply(this,arguments)},d.guid=f.guid||(f.guid=n.guid++)),this.each(function(){n.event.add(this,a,d,c,b)})},one:function(a,b,c,d){return this.on(a,b,c,d,1)},off:function(a,b,c){var d,e;if(a&&a.preventDefault&&a.handleObj)return d=a.handleObj,n(a.delegateTarget).off(d.namespace?d.origType+"."+d.namespace:d.origType,d.selector,d.handler),this;if("object"==typeof a){for(e in a)this.off(e,b,a[e]);return this}return(b===!1||"function"==typeof b)&&(c=b,b=void 0),c===!1&&(c=$),this.each(function(){n.event.remove(this,a,c,b)})},trigger:function(a,b){return this.each(function(){n.event.trigger(a,b,this)})},triggerHandler:function(a,b){var c=this[0];return c?n.event.trigger(a,b,c,!0):void 0}});var ab=/<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi,bb=/<([\w:]+)/,cb=/<|&#?\w+;/,db=/<(?:script|style|link)/i,eb=/checked\s*(?:[^=]|=\s*.checked.)/i,fb=/^$|\/(?:java|ecma)script/i,gb=/^true\/(.*)/,hb=/^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g,ib={option:[1,"<select multiple='multiple'>","</select>"],thead:[1,"<table>","</table>"],col:[2,"<table><colgroup>","</colgroup></table>"],tr:[2,"<table><tbody>","</tbody></table>"],td:[3,"<table><tbody><tr>","</tr></tbody></table>"],_default:[0,"",""]};ib.optgroup=ib.option,ib.tbody=ib.tfoot=ib.colgroup=ib.caption=ib.thead,ib.th=ib.td;function jb(a,b){return n.nodeName(a,"table")&&n.nodeName(11!==b.nodeType?b:b.firstChild,"tr")?a.getElementsByTagName("tbody")[0]||a.appendChild(a.ownerDocument.createElement("tbody")):a}function kb(a){return a.type=(null!==a.getAttribute("type"))+"/"+a.type,a}function lb(a){var b=gb.exec(a.type);return b?a.type=b[1]:a.removeAttribute("type"),a}function mb(a,b){for(var c=0,d=a.length;d>c;c++)L.set(a[c],"globalEval",!b||L.get(b[c],"globalEval"))}function nb(a,b){var c,d,e,f,g,h,i,j;if(1===b.nodeType){if(L.hasData(a)&&(f=L.access(a),g=L.set(b,f),j=f.events)){delete g.handle,g.events={};for(e in j)for(c=0,d=j[e].length;d>c;c++)n.event.add(b,e,j[e][c])}M.hasData(a)&&(h=M.access(a),i=n.extend({},h),M.set(b,i))}}function ob(a,b){var c=a.getElementsByTagName?a.getElementsByTagName(b||"*"):a.querySelectorAll?a.querySelectorAll(b||"*"):[];return void 0===b||b&&n.nodeName(a,b)?n.merge([a],c):c}function pb(a,b){var c=b.nodeName.toLowerCase();"input"===c&&T.test(a.type)?b.checked=a.checked:("input"===c||"textarea"===c)&&(b.defaultValue=a.defaultValue)}n.extend({clone:function(a,b,c){var d,e,f,g,h=a.cloneNode(!0),i=n.contains(a.ownerDocument,a);if(!(k.noCloneChecked||1!==a.nodeType&&11!==a.nodeType||n.isXMLDoc(a)))for(g=ob(h),f=ob(a),d=0,e=f.length;e>d;d++)pb(f[d],g[d]);if(b)if(c)for(f=f||ob(a),g=g||ob(h),d=0,e=f.length;e>d;d++)nb(f[d],g[d]);else nb(a,h);return g=ob(h,"script"),g.length>0&&mb(g,!i&&ob(a,"script")),h},buildFragment:function(a,b,c,d){for(var e,f,g,h,i,j,k=b.createDocumentFragment(),l=[],m=0,o=a.length;o>m;m++)if(e=a[m],e||0===e)if("object"===n.type(e))n.merge(l,e.nodeType?[e]:e);else if(cb.test(e)){f=f||k.appendChild(b.createElement("div")),g=(bb.exec(e)||["",""])[1].toLowerCase(),h=ib[g]||ib._default,f.innerHTML=h[1]+e.replace(ab,"<$1></$2>")+h[2],j=h[0];while(j--)f=f.lastChild;n.merge(l,f.childNodes),f=k.firstChild,f.textContent=""}else l.push(b.createTextNode(e));k.textContent="",m=0;while(e=l[m++])if((!d||-1===n.inArray(e,d))&&(i=n.contains(e.ownerDocument,e),f=ob(k.appendChild(e),"script"),i&&mb(f),c)){j=0;while(e=f[j++])fb.test(e.type||"")&&c.push(e)}return k},cleanData:function(a){for(var b,c,d,e,f=n.event.special,g=0;void 0!==(c=a[g]);g++){if(n.acceptData(c)&&(e=c[L.expando],e&&(b=L.cache[e]))){if(b.events)for(d in b.events)f[d]?n.event.remove(c,d):n.removeEvent(c,d,b.handle);L.cache[e]&&delete L.cache[e]}delete M.cache[c[M.expando]]}}}),n.fn.extend({text:function(a){return J(this,function(a){return void 0===a?n.text(this):this.empty().each(function(){(1===this.nodeType||11===this.nodeType||9===this.nodeType)&&(this.textContent=a)})},null,a,arguments.length)},append:function(){return this.domManip(arguments,function(a){if(1===this.nodeType||11===this.nodeType||9===this.nodeType){var b=jb(this,a);b.appendChild(a)}})},prepend:function(){return this.domManip(arguments,function(a){if(1===this.nodeType||11===this.nodeType||9===this.nodeType){var b=jb(this,a);b.insertBefore(a,b.firstChild)}})},before:function(){return this.domManip(arguments,function(a){this.parentNode&&this.parentNode.insertBefore(a,this)})},after:function(){return this.domManip(arguments,function(a){this.parentNode&&this.parentNode.insertBefore(a,this.nextSibling)})},remove:function(a,b){for(var c,d=a?n.filter(a,this):this,e=0;null!=(c=d[e]);e++)b||1!==c.nodeType||n.cleanData(ob(c)),c.parentNode&&(b&&n.contains(c.ownerDocument,c)&&mb(ob(c,"script")),c.parentNode.removeChild(c));return this},empty:function(){for(var a,b=0;null!=(a=this[b]);b++)1===a.nodeType&&(n.cleanData(ob(a,!1)),a.textContent="");return this},clone:function(a,b){return a=null==a?!1:a,b=null==b?a:b,this.map(function(){return n.clone(this,a,b)})},html:function(a){return J(this,function(a){var b=this[0]||{},c=0,d=this.length;if(void 0===a&&1===b.nodeType)return b.innerHTML;if("string"==typeof a&&!db.test(a)&&!ib[(bb.exec(a)||["",""])[1].toLowerCase()]){a=a.replace(ab,"<$1></$2>");try{for(;d>c;c++)b=this[c]||{},1===b.nodeType&&(n.cleanData(ob(b,!1)),b.innerHTML=a);b=0}catch(e){}}b&&this.empty().append(a)},null,a,arguments.length)},replaceWith:function(){var a=arguments[0];return this.domManip(arguments,function(b){a=this.parentNode,n.cleanData(ob(this)),a&&a.replaceChild(b,this)}),a&&(a.length||a.nodeType)?this:this.remove()},detach:function(a){return this.remove(a,!0)},domManip:function(a,b){a=e.apply([],a);var c,d,f,g,h,i,j=0,l=this.length,m=this,o=l-1,p=a[0],q=n.isFunction(p);if(q||l>1&&"string"==typeof p&&!k.checkClone&&eb.test(p))return this.each(function(c){var d=m.eq(c);q&&(a[0]=p.call(this,c,d.html())),d.domManip(a,b)});if(l&&(c=n.buildFragment(a,this[0].ownerDocument,!1,this),d=c.firstChild,1===c.childNodes.length&&(c=d),d)){for(f=n.map(ob(c,"script"),kb),g=f.length;l>j;j++)h=c,j!==o&&(h=n.clone(h,!0,!0),g&&n.merge(f,ob(h,"script"))),b.call(this[j],h,j);if(g)for(i=f[f.length-1].ownerDocument,n.map(f,lb),j=0;g>j;j++)h=f[j],fb.test(h.type||"")&&!L.access(h,"globalEval")&&n.contains(i,h)&&(h.src?n._evalUrl&&n._evalUrl(h.src):n.globalEval(h.textContent.replace(hb,"")))}return this}}),n.each({appendTo:"append",prependTo:"prepend",insertBefore:"before",insertAfter:"after",replaceAll:"replaceWith"},function(a,b){n.fn[a]=function(a){for(var c,d=[],e=n(a),g=e.length-1,h=0;g>=h;h++)c=h===g?this:this.clone(!0),n(e[h])[b](c),f.apply(d,c.get());return this.pushStack(d)}});var qb,rb={};function sb(b,c){var d,e=n(c.createElement(b)).appendTo(c.body),f=a.getDefaultComputedStyle&&(d=a.getDefaultComputedStyle(e[0]))?d.display:n.css(e[0],"display");return e.detach(),f}function tb(a){var b=l,c=rb[a];return c||(c=sb(a,b),"none"!==c&&c||(qb=(qb||n("<iframe frameborder='0' width='0' height='0'/>")).appendTo(b.documentElement),b=qb[0].contentDocument,b.write(),b.close(),c=sb(a,b),qb.detach()),rb[a]=c),c}var ub=/^margin/,vb=new RegExp("^("+Q+")(?!px)[a-z%]+$","i"),wb=function(b){return b.ownerDocument.defaultView.opener?b.ownerDocument.defaultView.getComputedStyle(b,null):a.getComputedStyle(b,null)};function xb(a,b,c){var d,e,f,g,h=a.style;return c=c||wb(a),c&&(g=c.getPropertyValue(b)||c[b]),c&&(""!==g||n.contains(a.ownerDocument,a)||(g=n.style(a,b)),vb.test(g)&&ub.test(b)&&(d=h.width,e=h.minWidth,f=h.maxWidth,h.minWidth=h.maxWidth=h.width=g,g=c.width,h.width=d,h.minWidth=e,h.maxWidth=f)),void 0!==g?g+"":g}function yb(a,b){return{get:function(){return a()?void delete this.get:(this.get=b).apply(this,arguments)}}}!function(){var b,c,d=l.documentElement,e=l.createElement("div"),f=l.createElement("div");if(f.style){f.style.backgroundClip="content-box",f.cloneNode(!0).style.backgroundClip="",k.clearCloneStyle="content-box"===f.style.backgroundClip,e.style.cssText="border:0;width:0;height:0;top:0;left:-9999px;margin-top:1px;position:absolute",e.appendChild(f);function g(){f.style.cssText="-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box;display:block;margin-top:1%;top:1%;border:1px;padding:1px;width:4px;position:absolute",f.innerHTML="",d.appendChild(e);var g=a.getComputedStyle(f,null);b="1%"!==g.top,c="4px"===g.width,d.removeChild(e)}a.getComputedStyle&&n.extend(k,{pixelPosition:function(){return g(),b},boxSizingReliable:function(){return null==c&&g(),c},reliableMarginRight:function(){var b,c=f.appendChild(l.createElement("div"));return c.style.cssText=f.style.cssText="-webkit-box-sizing:content-box;-moz-box-sizing:content-box;box-sizing:content-box;display:block;margin:0;border:0;padding:0",c.style.marginRight=c.style.width="0",f.style.width="1px",d.appendChild(e),b=!parseFloat(a.getComputedStyle(c,null).marginRight),d.removeChild(e),f.removeChild(c),b}})}}(),n.swap=function(a,b,c,d){var e,f,g={};for(f in b)g[f]=a.style[f],a.style[f]=b[f];e=c.apply(a,d||[]);for(f in b)a.style[f]=g[f];return e};var zb=/^(none|table(?!-c[ea]).+)/,Ab=new RegExp("^("+Q+")(.*)$","i"),Bb=new RegExp("^([+-])=("+Q+")","i"),Cb={position:"absolute",visibility:"hidden",display:"block"},Db={letterSpacing:"0",fontWeight:"400"},Eb=["Webkit","O","Moz","ms"];function Fb(a,b){if(b in a)return b;var c=b[0].toUpperCase()+b.slice(1),d=b,e=Eb.length;while(e--)if(b=Eb[e]+c,b in a)return b;return d}function Gb(a,b,c){var d=Ab.exec(b);return d?Math.max(0,d[1]-(c||0))+(d[2]||"px"):b}function Hb(a,b,c,d,e){for(var f=c===(d?"border":"content")?4:"width"===b?1:0,g=0;4>f;f+=2)"margin"===c&&(g+=n.css(a,c+R[f],!0,e)),d?("content"===c&&(g-=n.css(a,"padding"+R[f],!0,e)),"margin"!==c&&(g-=n.css(a,"border"+R[f]+"Width",!0,e))):(g+=n.css(a,"padding"+R[f],!0,e),"padding"!==c&&(g+=n.css(a,"border"+R[f]+"Width",!0,e)));return g}function Ib(a,b,c){var d=!0,e="width"===b?a.offsetWidth:a.offsetHeight,f=wb(a),g="border-box"===n.css(a,"boxSizing",!1,f);if(0>=e||null==e){if(e=xb(a,b,f),(0>e||null==e)&&(e=a.style[b]),vb.test(e))return e;d=g&&(k.boxSizingReliable()||e===a.style[b]),e=parseFloat(e)||0}return e+Hb(a,b,c||(g?"border":"content"),d,f)+"px"}function Jb(a,b){for(var c,d,e,f=[],g=0,h=a.length;h>g;g++)d=a[g],d.style&&(f[g]=L.get(d,"olddisplay"),c=d.style.display,b?(f[g]||"none"!==c||(d.style.display=""),""===d.style.display&&S(d)&&(f[g]=L.access(d,"olddisplay",tb(d.nodeName)))):(e=S(d),"none"===c&&e||L.set(d,"olddisplay",e?c:n.css(d,"display"))));for(g=0;h>g;g++)d=a[g],d.style&&(b&&"none"!==d.style.display&&""!==d.style.display||(d.style.display=b?f[g]||"":"none"));return a}n.extend({cssHooks:{opacity:{get:function(a,b){if(b){var c=xb(a,"opacity");return""===c?"1":c}}}},cssNumber:{columnCount:!0,fillOpacity:!0,flexGrow:!0,flexShrink:!0,fontWeight:!0,lineHeight:!0,opacity:!0,order:!0,orphans:!0,widows:!0,zIndex:!0,zoom:!0},cssProps:{"float":"cssFloat"},style:function(a,b,c,d){if(a&&3!==a.nodeType&&8!==a.nodeType&&a.style){var e,f,g,h=n.camelCase(b),i=a.style;return b=n.cssProps[h]||(n.cssProps[h]=Fb(i,h)),g=n.cssHooks[b]||n.cssHooks[h],void 0===c?g&&"get"in g&&void 0!==(e=g.get(a,!1,d))?e:i[b]:(f=typeof c,"string"===f&&(e=Bb.exec(c))&&(c=(e[1]+1)*e[2]+parseFloat(n.css(a,b)),f="number"),null!=c&&c===c&&("number"!==f||n.cssNumber[h]||(c+="px"),k.clearCloneStyle||""!==c||0!==b.indexOf("background")||(i[b]="inherit"),g&&"set"in g&&void 0===(c=g.set(a,c,d))||(i[b]=c)),void 0)}},css:function(a,b,c,d){var e,f,g,h=n.camelCase(b);return b=n.cssProps[h]||(n.cssProps[h]=Fb(a.style,h)),g=n.cssHooks[b]||n.cssHooks[h],g&&"get"in g&&(e=g.get(a,!0,c)),void 0===e&&(e=xb(a,b,d)),"normal"===e&&b in Db&&(e=Db[b]),""===c||c?(f=parseFloat(e),c===!0||n.isNumeric(f)?f||0:e):e}}),n.each(["height","width"],function(a,b){n.cssHooks[b]={get:function(a,c,d){return c?zb.test(n.css(a,"display"))&&0===a.offsetWidth?n.swap(a,Cb,function(){return Ib(a,b,d)}):Ib(a,b,d):void 0},set:function(a,c,d){var e=d&&wb(a);return Gb(a,c,d?Hb(a,b,d,"border-box"===n.css(a,"boxSizing",!1,e),e):0)}}}),n.cssHooks.marginRight=yb(k.reliableMarginRight,function(a,b){return b?n.swap(a,{display:"inline-block"},xb,[a,"marginRight"]):void 0}),n.each({margin:"",padding:"",border:"Width"},function(a,b){n.cssHooks[a+b]={expand:function(c){for(var d=0,e={},f="string"==typeof c?c.split(" "):[c];4>d;d++)e[a+R[d]+b]=f[d]||f[d-2]||f[0];return e}},ub.test(a)||(n.cssHooks[a+b].set=Gb)}),n.fn.extend({css:function(a,b){return J(this,function(a,b,c){var d,e,f={},g=0;if(n.isArray(b)){for(d=wb(a),e=b.length;e>g;g++)f[b[g]]=n.css(a,b[g],!1,d);return f}return void 0!==c?n.style(a,b,c):n.css(a,b)},a,b,arguments.length>1)},show:function(){return Jb(this,!0)},hide:function(){return Jb(this)},toggle:function(a){return"boolean"==typeof a?a?this.show():this.hide():this.each(function(){S(this)?n(this).show():n(this).hide()})}});function Kb(a,b,c,d,e){return new Kb.prototype.init(a,b,c,d,e)}n.Tween=Kb,Kb.prototype={constructor:Kb,init:function(a,b,c,d,e,f){this.elem=a,this.prop=c,this.easing=e||"swing",this.options=b,this.start=this.now=this.cur(),this.end=d,this.unit=f||(n.cssNumber[c]?"":"px")},cur:function(){var a=Kb.propHooks[this.prop];return a&&a.get?a.get(this):Kb.propHooks._default.get(this)},run:function(a){var b,c=Kb.propHooks[this.prop];return this.pos=b=this.options.duration?n.easing[this.easing](a,this.options.duration*a,0,1,this.options.duration):a,this.now=(this.end-this.start)*b+this.start,this.options.step&&this.options.step.call(this.elem,this.now,this),c&&c.set?c.set(this):Kb.propHooks._default.set(this),this}},Kb.prototype.init.prototype=Kb.prototype,Kb.propHooks={_default:{get:function(a){var b;return null==a.elem[a.prop]||a.elem.style&&null!=a.elem.style[a.prop]?(b=n.css(a.elem,a.prop,""),b&&"auto"!==b?b:0):a.elem[a.prop]},set:function(a){n.fx.step[a.prop]?n.fx.step[a.prop](a):a.elem.style&&(null!=a.elem.style[n.cssProps[a.prop]]||n.cssHooks[a.prop])?n.style(a.elem,a.prop,a.now+a.unit):a.elem[a.prop]=a.now}}},Kb.propHooks.scrollTop=Kb.propHooks.scrollLeft={set:function(a){a.elem.nodeType&&a.elem.parentNode&&(a.elem[a.prop]=a.now)}},n.easing={linear:function(a){return a},swing:function(a){return.5-Math.cos(a*Math.PI)/2}},n.fx=Kb.prototype.init,n.fx.step={};var Lb,Mb,Nb=/^(?:toggle|show|hide)$/,Ob=new RegExp("^(?:([+-])=|)("+Q+")([a-z%]*)$","i"),Pb=/queueHooks$/,Qb=[Vb],Rb={"*":[function(a,b){var c=this.createTween(a,b),d=c.cur(),e=Ob.exec(b),f=e&&e[3]||(n.cssNumber[a]?"":"px"),g=(n.cssNumber[a]||"px"!==f&&+d)&&Ob.exec(n.css(c.elem,a)),h=1,i=20;if(g&&g[3]!==f){f=f||g[3],e=e||[],g=+d||1;do h=h||".5",g/=h,n.style(c.elem,a,g+f);while(h!==(h=c.cur()/d)&&1!==h&&--i)}return e&&(g=c.start=+g||+d||0,c.unit=f,c.end=e[1]?g+(e[1]+1)*e[2]:+e[2]),c}]};function Sb(){return setTimeout(function(){Lb=void 0}),Lb=n.now()}function Tb(a,b){var c,d=0,e={height:a};for(b=b?1:0;4>d;d+=2-b)c=R[d],e["margin"+c]=e["padding"+c]=a;return b&&(e.opacity=e.width=a),e}function Ub(a,b,c){for(var d,e=(Rb[b]||[]).concat(Rb["*"]),f=0,g=e.length;g>f;f++)if(d=e[f].call(c,b,a))return d}function Vb(a,b,c){var d,e,f,g,h,i,j,k,l=this,m={},o=a.style,p=a.nodeType&&S(a),q=L.get(a,"fxshow");c.queue||(h=n._queueHooks(a,"fx"),null==h.unqueued&&(h.unqueued=0,i=h.empty.fire,h.empty.fire=function(){h.unqueued||i()}),h.unqueued++,l.always(function(){l.always(function(){h.unqueued--,n.queue(a,"fx").length||h.empty.fire()})})),1===a.nodeType&&("height"in b||"width"in b)&&(c.overflow=[o.overflow,o.overflowX,o.overflowY],j=n.css(a,"display"),k="none"===j?L.get(a,"olddisplay")||tb(a.nodeName):j,"inline"===k&&"none"===n.css(a,"float")&&(o.display="inline-block")),c.overflow&&(o.overflow="hidden",l.always(function(){o.overflow=c.overflow[0],o.overflowX=c.overflow[1],o.overflowY=c.overflow[2]}));for(d in b)if(e=b[d],Nb.exec(e)){if(delete b[d],f=f||"toggle"===e,e===(p?"hide":"show")){if("show"!==e||!q||void 0===q[d])continue;p=!0}m[d]=q&&q[d]||n.style(a,d)}else j=void 0;if(n.isEmptyObject(m))"inline"===("none"===j?tb(a.nodeName):j)&&(o.display=j);else{q?"hidden"in q&&(p=q.hidden):q=L.access(a,"fxshow",{}),f&&(q.hidden=!p),p?n(a).show():l.done(function(){n(a).hide()}),l.done(function(){var b;L.remove(a,"fxshow");for(b in m)n.style(a,b,m[b])});for(d in m)g=Ub(p?q[d]:0,d,l),d in q||(q[d]=g.start,p&&(g.end=g.start,g.start="width"===d||"height"===d?1:0))}}function Wb(a,b){var c,d,e,f,g;for(c in a)if(d=n.camelCase(c),e=b[d],f=a[c],n.isArray(f)&&(e=f[1],f=a[c]=f[0]),c!==d&&(a[d]=f,delete a[c]),g=n.cssHooks[d],g&&"expand"in g){f=g.expand(f),delete a[d];for(c in f)c in a||(a[c]=f[c],b[c]=e)}else b[d]=e}function Xb(a,b,c){var d,e,f=0,g=Qb.length,h=n.Deferred().always(function(){delete i.elem}),i=function(){if(e)return!1;for(var b=Lb||Sb(),c=Math.max(0,j.startTime+j.duration-b),d=c/j.duration||0,f=1-d,g=0,i=j.tweens.length;i>g;g++)j.tweens[g].run(f);return h.notifyWith(a,[j,f,c]),1>f&&i?c:(h.resolveWith(a,[j]),!1)},j=h.promise({elem:a,props:n.extend({},b),opts:n.extend(!0,{specialEasing:{}},c),originalProperties:b,originalOptions:c,startTime:Lb||Sb(),duration:c.duration,tweens:[],createTween:function(b,c){var d=n.Tween(a,j.opts,b,c,j.opts.specialEasing[b]||j.opts.easing);return j.tweens.push(d),d},stop:function(b){var c=0,d=b?j.tweens.length:0;if(e)return this;for(e=!0;d>c;c++)j.tweens[c].run(1);return b?h.resolveWith(a,[j,b]):h.rejectWith(a,[j,b]),this}}),k=j.props;for(Wb(k,j.opts.specialEasing);g>f;f++)if(d=Qb[f].call(j,a,k,j.opts))return d;return n.map(k,Ub,j),n.isFunction(j.opts.start)&&j.opts.start.call(a,j),n.fx.timer(n.extend(i,{elem:a,anim:j,queue:j.opts.queue})),j.progress(j.opts.progress).done(j.opts.done,j.opts.complete).fail(j.opts.fail).always(j.opts.always)}n.Animation=n.extend(Xb,{tweener:function(a,b){n.isFunction(a)?(b=a,a=["*"]):a=a.split(" ");for(var c,d=0,e=a.length;e>d;d++)c=a[d],Rb[c]=Rb[c]||[],Rb[c].unshift(b)},prefilter:function(a,b){b?Qb.unshift(a):Qb.push(a)}}),n.speed=function(a,b,c){var d=a&&"object"==typeof a?n.extend({},a):{complete:c||!c&&b||n.isFunction(a)&&a,duration:a,easing:c&&b||b&&!n.isFunction(b)&&b};return d.duration=n.fx.off?0:"number"==typeof d.duration?d.duration:d.duration in n.fx.speeds?n.fx.speeds[d.duration]:n.fx.speeds._default,(null==d.queue||d.queue===!0)&&(d.queue="fx"),d.old=d.complete,d.complete=function(){n.isFunction(d.old)&&d.old.call(this),d.queue&&n.dequeue(this,d.queue)},d},n.fn.extend({fadeTo:function(a,b,c,d){return this.filter(S).css("opacity",0).show().end().animate({opacity:b},a,c,d)},animate:function(a,b,c,d){var e=n.isEmptyObject(a),f=n.speed(b,c,d),g=function(){var b=Xb(this,n.extend({},a),f);(e||L.get(this,"finish"))&&b.stop(!0)};return g.finish=g,e||f.queue===!1?this.each(g):this.queue(f.queue,g)},stop:function(a,b,c){var d=function(a){var b=a.stop;delete a.stop,b(c)};return"string"!=typeof a&&(c=b,b=a,a=void 0),b&&a!==!1&&this.queue(a||"fx",[]),this.each(function(){var b=!0,e=null!=a&&a+"queueHooks",f=n.timers,g=L.get(this);if(e)g[e]&&g[e].stop&&d(g[e]);else for(e in g)g[e]&&g[e].stop&&Pb.test(e)&&d(g[e]);for(e=f.length;e--;)f[e].elem!==this||null!=a&&f[e].queue!==a||(f[e].anim.stop(c),b=!1,f.splice(e,1));(b||!c)&&n.dequeue(this,a)})},finish:function(a){return a!==!1&&(a=a||"fx"),this.each(function(){var b,c=L.get(this),d=c[a+"queue"],e=c[a+"queueHooks"],f=n.timers,g=d?d.length:0;for(c.finish=!0,n.queue(this,a,[]),e&&e.stop&&e.stop.call(this,!0),b=f.length;b--;)f[b].elem===this&&f[b].queue===a&&(f[b].anim.stop(!0),f.splice(b,1));for(b=0;g>b;b++)d[b]&&d[b].finish&&d[b].finish.call(this);delete c.finish})}}),n.each(["toggle","show","hide"],function(a,b){var c=n.fn[b];n.fn[b]=function(a,d,e){return null==a||"boolean"==typeof a?c.apply(this,arguments):this.animate(Tb(b,!0),a,d,e)}}),n.each({slideDown:Tb("show"),slideUp:Tb("hide"),slideToggle:Tb("toggle"),fadeIn:{opacity:"show"},fadeOut:{opacity:"hide"},fadeToggle:{opacity:"toggle"}},function(a,b){n.fn[a]=function(a,c,d){return this.animate(b,a,c,d)}}),n.timers=[],n.fx.tick=function(){var a,b=0,c=n.timers;for(Lb=n.now();b<c.length;b++)a=c[b],a()||c[b]!==a||c.splice(b--,1);c.length||n.fx.stop(),Lb=void 0},n.fx.timer=function(a){n.timers.push(a),a()?n.fx.start():n.timers.pop()},n.fx.interval=13,n.fx.start=function(){Mb||(Mb=setInterval(n.fx.tick,n.fx.interval))},n.fx.stop=function(){clearInterval(Mb),Mb=null},n.fx.speeds={slow:600,fast:200,_default:400},n.fn.delay=function(a,b){return a=n.fx?n.fx.speeds[a]||a:a,b=b||"fx",this.queue(b,function(b,c){var d=setTimeout(b,a);c.stop=function(){clearTimeout(d)}})},function(){var a=l.createElement("input"),b=l.createElement("select"),c=b.appendChild(l.createElement("option"));a.type="checkbox",k.checkOn=""!==a.value,k.optSelected=c.selected,b.disabled=!0,k.optDisabled=!c.disabled,a=l.createElement("input"),a.value="t",a.type="radio",k.radioValue="t"===a.value}();var Yb,Zb,$b=n.expr.attrHandle;n.fn.extend({attr:function(a,b){return J(this,n.attr,a,b,arguments.length>1)},removeAttr:function(a){return this.each(function(){n.removeAttr(this,a)})}}),n.extend({attr:function(a,b,c){var d,e,f=a.nodeType;if(a&&3!==f&&8!==f&&2!==f)return typeof a.getAttribute===U?n.prop(a,b,c):(1===f&&n.isXMLDoc(a)||(b=b.toLowerCase(),d=n.attrHooks[b]||(n.expr.match.bool.test(b)?Zb:Yb)),void 0===c?d&&"get"in d&&null!==(e=d.get(a,b))?e:(e=n.find.attr(a,b),null==e?void 0:e):null!==c?d&&"set"in d&&void 0!==(e=d.set(a,c,b))?e:(a.setAttribute(b,c+""),c):void n.removeAttr(a,b))
},removeAttr:function(a,b){var c,d,e=0,f=b&&b.match(E);if(f&&1===a.nodeType)while(c=f[e++])d=n.propFix[c]||c,n.expr.match.bool.test(c)&&(a[d]=!1),a.removeAttribute(c)},attrHooks:{type:{set:function(a,b){if(!k.radioValue&&"radio"===b&&n.nodeName(a,"input")){var c=a.value;return a.setAttribute("type",b),c&&(a.value=c),b}}}}}),Zb={set:function(a,b,c){return b===!1?n.removeAttr(a,c):a.setAttribute(c,c),c}},n.each(n.expr.match.bool.source.match(/\w+/g),function(a,b){var c=$b[b]||n.find.attr;$b[b]=function(a,b,d){var e,f;return d||(f=$b[b],$b[b]=e,e=null!=c(a,b,d)?b.toLowerCase():null,$b[b]=f),e}});var _b=/^(?:input|select|textarea|button)$/i;n.fn.extend({prop:function(a,b){return J(this,n.prop,a,b,arguments.length>1)},removeProp:function(a){return this.each(function(){delete this[n.propFix[a]||a]})}}),n.extend({propFix:{"for":"htmlFor","class":"className"},prop:function(a,b,c){var d,e,f,g=a.nodeType;if(a&&3!==g&&8!==g&&2!==g)return f=1!==g||!n.isXMLDoc(a),f&&(b=n.propFix[b]||b,e=n.propHooks[b]),void 0!==c?e&&"set"in e&&void 0!==(d=e.set(a,c,b))?d:a[b]=c:e&&"get"in e&&null!==(d=e.get(a,b))?d:a[b]},propHooks:{tabIndex:{get:function(a){return a.hasAttribute("tabindex")||_b.test(a.nodeName)||a.href?a.tabIndex:-1}}}}),k.optSelected||(n.propHooks.selected={get:function(a){var b=a.parentNode;return b&&b.parentNode&&b.parentNode.selectedIndex,null}}),n.each(["tabIndex","readOnly","maxLength","cellSpacing","cellPadding","rowSpan","colSpan","useMap","frameBorder","contentEditable"],function(){n.propFix[this.toLowerCase()]=this});var ac=/[\t\r\n\f]/g;n.fn.extend({addClass:function(a){var b,c,d,e,f,g,h="string"==typeof a&&a,i=0,j=this.length;if(n.isFunction(a))return this.each(function(b){n(this).addClass(a.call(this,b,this.className))});if(h)for(b=(a||"").match(E)||[];j>i;i++)if(c=this[i],d=1===c.nodeType&&(c.className?(" "+c.className+" ").replace(ac," "):" ")){f=0;while(e=b[f++])d.indexOf(" "+e+" ")<0&&(d+=e+" ");g=n.trim(d),c.className!==g&&(c.className=g)}return this},removeClass:function(a){var b,c,d,e,f,g,h=0===arguments.length||"string"==typeof a&&a,i=0,j=this.length;if(n.isFunction(a))return this.each(function(b){n(this).removeClass(a.call(this,b,this.className))});if(h)for(b=(a||"").match(E)||[];j>i;i++)if(c=this[i],d=1===c.nodeType&&(c.className?(" "+c.className+" ").replace(ac," "):"")){f=0;while(e=b[f++])while(d.indexOf(" "+e+" ")>=0)d=d.replace(" "+e+" "," ");g=a?n.trim(d):"",c.className!==g&&(c.className=g)}return this},toggleClass:function(a,b){var c=typeof a;return"boolean"==typeof b&&"string"===c?b?this.addClass(a):this.removeClass(a):this.each(n.isFunction(a)?function(c){n(this).toggleClass(a.call(this,c,this.className,b),b)}:function(){if("string"===c){var b,d=0,e=n(this),f=a.match(E)||[];while(b=f[d++])e.hasClass(b)?e.removeClass(b):e.addClass(b)}else(c===U||"boolean"===c)&&(this.className&&L.set(this,"__className__",this.className),this.className=this.className||a===!1?"":L.get(this,"__className__")||"")})},hasClass:function(a){for(var b=" "+a+" ",c=0,d=this.length;d>c;c++)if(1===this[c].nodeType&&(" "+this[c].className+" ").replace(ac," ").indexOf(b)>=0)return!0;return!1}});var bc=/\r/g;n.fn.extend({val:function(a){var b,c,d,e=this[0];{if(arguments.length)return d=n.isFunction(a),this.each(function(c){var e;1===this.nodeType&&(e=d?a.call(this,c,n(this).val()):a,null==e?e="":"number"==typeof e?e+="":n.isArray(e)&&(e=n.map(e,function(a){return null==a?"":a+""})),b=n.valHooks[this.type]||n.valHooks[this.nodeName.toLowerCase()],b&&"set"in b&&void 0!==b.set(this,e,"value")||(this.value=e))});if(e)return b=n.valHooks[e.type]||n.valHooks[e.nodeName.toLowerCase()],b&&"get"in b&&void 0!==(c=b.get(e,"value"))?c:(c=e.value,"string"==typeof c?c.replace(bc,""):null==c?"":c)}}}),n.extend({valHooks:{option:{get:function(a){var b=n.find.attr(a,"value");return null!=b?b:n.trim(n.text(a))}},select:{get:function(a){for(var b,c,d=a.options,e=a.selectedIndex,f="select-one"===a.type||0>e,g=f?null:[],h=f?e+1:d.length,i=0>e?h:f?e:0;h>i;i++)if(c=d[i],!(!c.selected&&i!==e||(k.optDisabled?c.disabled:null!==c.getAttribute("disabled"))||c.parentNode.disabled&&n.nodeName(c.parentNode,"optgroup"))){if(b=n(c).val(),f)return b;g.push(b)}return g},set:function(a,b){var c,d,e=a.options,f=n.makeArray(b),g=e.length;while(g--)d=e[g],(d.selected=n.inArray(d.value,f)>=0)&&(c=!0);return c||(a.selectedIndex=-1),f}}}}),n.each(["radio","checkbox"],function(){n.valHooks[this]={set:function(a,b){return n.isArray(b)?a.checked=n.inArray(n(a).val(),b)>=0:void 0}},k.checkOn||(n.valHooks[this].get=function(a){return null===a.getAttribute("value")?"on":a.value})}),n.each("blur focus focusin focusout load resize scroll unload click dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave change select submit keydown keypress keyup error contextmenu".split(" "),function(a,b){n.fn[b]=function(a,c){return arguments.length>0?this.on(b,null,a,c):this.trigger(b)}}),n.fn.extend({hover:function(a,b){return this.mouseenter(a).mouseleave(b||a)},bind:function(a,b,c){return this.on(a,null,b,c)},unbind:function(a,b){return this.off(a,null,b)},delegate:function(a,b,c,d){return this.on(b,a,c,d)},undelegate:function(a,b,c){return 1===arguments.length?this.off(a,"**"):this.off(b,a||"**",c)}});var cc=n.now(),dc=/\?/;n.parseJSON=function(a){return JSON.parse(a+"")},n.parseXML=function(a){var b,c;if(!a||"string"!=typeof a)return null;try{c=new DOMParser,b=c.parseFromString(a,"text/xml")}catch(d){b=void 0}return(!b||b.getElementsByTagName("parsererror").length)&&n.error("Invalid XML: "+a),b};var ec=/#.*$/,fc=/([?&])_=[^&]*/,gc=/^(.*?):[ \t]*([^\r\n]*)$/gm,hc=/^(?:about|app|app-storage|.+-extension|file|res|widget):$/,ic=/^(?:GET|HEAD)$/,jc=/^\/\//,kc=/^([\w.+-]+:)(?:\/\/(?:[^\/?#]*@|)([^\/?#:]*)(?::(\d+)|)|)/,lc={},mc={},nc="*/".concat("*"),oc=a.location.href,pc=kc.exec(oc.toLowerCase())||[];function qc(a){return function(b,c){"string"!=typeof b&&(c=b,b="*");var d,e=0,f=b.toLowerCase().match(E)||[];if(n.isFunction(c))while(d=f[e++])"+"===d[0]?(d=d.slice(1)||"*",(a[d]=a[d]||[]).unshift(c)):(a[d]=a[d]||[]).push(c)}}function rc(a,b,c,d){var e={},f=a===mc;function g(h){var i;return e[h]=!0,n.each(a[h]||[],function(a,h){var j=h(b,c,d);return"string"!=typeof j||f||e[j]?f?!(i=j):void 0:(b.dataTypes.unshift(j),g(j),!1)}),i}return g(b.dataTypes[0])||!e["*"]&&g("*")}function sc(a,b){var c,d,e=n.ajaxSettings.flatOptions||{};for(c in b)void 0!==b[c]&&((e[c]?a:d||(d={}))[c]=b[c]);return d&&n.extend(!0,a,d),a}function tc(a,b,c){var d,e,f,g,h=a.contents,i=a.dataTypes;while("*"===i[0])i.shift(),void 0===d&&(d=a.mimeType||b.getResponseHeader("Content-Type"));if(d)for(e in h)if(h[e]&&h[e].test(d)){i.unshift(e);break}if(i[0]in c)f=i[0];else{for(e in c){if(!i[0]||a.converters[e+" "+i[0]]){f=e;break}g||(g=e)}f=f||g}return f?(f!==i[0]&&i.unshift(f),c[f]):void 0}function uc(a,b,c,d){var e,f,g,h,i,j={},k=a.dataTypes.slice();if(k[1])for(g in a.converters)j[g.toLowerCase()]=a.converters[g];f=k.shift();while(f)if(a.responseFields[f]&&(c[a.responseFields[f]]=b),!i&&d&&a.dataFilter&&(b=a.dataFilter(b,a.dataType)),i=f,f=k.shift())if("*"===f)f=i;else if("*"!==i&&i!==f){if(g=j[i+" "+f]||j["* "+f],!g)for(e in j)if(h=e.split(" "),h[1]===f&&(g=j[i+" "+h[0]]||j["* "+h[0]])){g===!0?g=j[e]:j[e]!==!0&&(f=h[0],k.unshift(h[1]));break}if(g!==!0)if(g&&a["throws"])b=g(b);else try{b=g(b)}catch(l){return{state:"parsererror",error:g?l:"No conversion from "+i+" to "+f}}}return{state:"success",data:b}}n.extend({active:0,lastModified:{},etag:{},ajaxSettings:{url:oc,type:"GET",isLocal:hc.test(pc[1]),global:!0,processData:!0,async:!0,contentType:"application/x-www-form-urlencoded; charset=UTF-8",accepts:{"*":nc,text:"text/plain",html:"text/html",xml:"application/xml, text/xml",json:"application/json, text/javascript"},contents:{xml:/xml/,html:/html/,json:/json/},responseFields:{xml:"responseXML",text:"responseText",json:"responseJSON"},converters:{"* text":String,"text html":!0,"text json":n.parseJSON,"text xml":n.parseXML},flatOptions:{url:!0,context:!0}},ajaxSetup:function(a,b){return b?sc(sc(a,n.ajaxSettings),b):sc(n.ajaxSettings,a)},ajaxPrefilter:qc(lc),ajaxTransport:qc(mc),ajax:function(a,b){"object"==typeof a&&(b=a,a=void 0),b=b||{};var c,d,e,f,g,h,i,j,k=n.ajaxSetup({},b),l=k.context||k,m=k.context&&(l.nodeType||l.jquery)?n(l):n.event,o=n.Deferred(),p=n.Callbacks("once memory"),q=k.statusCode||{},r={},s={},t=0,u="canceled",v={readyState:0,getResponseHeader:function(a){var b;if(2===t){if(!f){f={};while(b=gc.exec(e))f[b[1].toLowerCase()]=b[2]}b=f[a.toLowerCase()]}return null==b?null:b},getAllResponseHeaders:function(){return 2===t?e:null},setRequestHeader:function(a,b){var c=a.toLowerCase();return t||(a=s[c]=s[c]||a,r[a]=b),this},overrideMimeType:function(a){return t||(k.mimeType=a),this},statusCode:function(a){var b;if(a)if(2>t)for(b in a)q[b]=[q[b],a[b]];else v.always(a[v.status]);return this},abort:function(a){var b=a||u;return c&&c.abort(b),x(0,b),this}};if(o.promise(v).complete=p.add,v.success=v.done,v.error=v.fail,k.url=((a||k.url||oc)+"").replace(ec,"").replace(jc,pc[1]+"//"),k.type=b.method||b.type||k.method||k.type,k.dataTypes=n.trim(k.dataType||"*").toLowerCase().match(E)||[""],null==k.crossDomain&&(h=kc.exec(k.url.toLowerCase()),k.crossDomain=!(!h||h[1]===pc[1]&&h[2]===pc[2]&&(h[3]||("http:"===h[1]?"80":"443"))===(pc[3]||("http:"===pc[1]?"80":"443")))),k.data&&k.processData&&"string"!=typeof k.data&&(k.data=n.param(k.data,k.traditional)),rc(lc,k,b,v),2===t)return v;i=n.event&&k.global,i&&0===n.active++&&n.event.trigger("ajaxStart"),k.type=k.type.toUpperCase(),k.hasContent=!ic.test(k.type),d=k.url,k.hasContent||(k.data&&(d=k.url+=(dc.test(d)?"&":"?")+k.data,delete k.data),k.cache===!1&&(k.url=fc.test(d)?d.replace(fc,"$1_="+cc++):d+(dc.test(d)?"&":"?")+"_="+cc++)),k.ifModified&&(n.lastModified[d]&&v.setRequestHeader("If-Modified-Since",n.lastModified[d]),n.etag[d]&&v.setRequestHeader("If-None-Match",n.etag[d])),(k.data&&k.hasContent&&k.contentType!==!1||b.contentType)&&v.setRequestHeader("Content-Type",k.contentType),v.setRequestHeader("Accept",k.dataTypes[0]&&k.accepts[k.dataTypes[0]]?k.accepts[k.dataTypes[0]]+("*"!==k.dataTypes[0]?", "+nc+"; q=0.01":""):k.accepts["*"]);for(j in k.headers)v.setRequestHeader(j,k.headers[j]);if(k.beforeSend&&(k.beforeSend.call(l,v,k)===!1||2===t))return v.abort();u="abort";for(j in{success:1,error:1,complete:1})v[j](k[j]);if(c=rc(mc,k,b,v)){v.readyState=1,i&&m.trigger("ajaxSend",[v,k]),k.async&&k.timeout>0&&(g=setTimeout(function(){v.abort("timeout")},k.timeout));try{t=1,c.send(r,x)}catch(w){if(!(2>t))throw w;x(-1,w)}}else x(-1,"No Transport");function x(a,b,f,h){var j,r,s,u,w,x=b;2!==t&&(t=2,g&&clearTimeout(g),c=void 0,e=h||"",v.readyState=a>0?4:0,j=a>=200&&300>a||304===a,f&&(u=tc(k,v,f)),u=uc(k,u,v,j),j?(k.ifModified&&(w=v.getResponseHeader("Last-Modified"),w&&(n.lastModified[d]=w),w=v.getResponseHeader("etag"),w&&(n.etag[d]=w)),204===a||"HEAD"===k.type?x="nocontent":304===a?x="notmodified":(x=u.state,r=u.data,s=u.error,j=!s)):(s=x,(a||!x)&&(x="error",0>a&&(a=0))),v.status=a,v.statusText=(b||x)+"",j?o.resolveWith(l,[r,x,v]):o.rejectWith(l,[v,x,s]),v.statusCode(q),q=void 0,i&&m.trigger(j?"ajaxSuccess":"ajaxError",[v,k,j?r:s]),p.fireWith(l,[v,x]),i&&(m.trigger("ajaxComplete",[v,k]),--n.active||n.event.trigger("ajaxStop")))}return v},getJSON:function(a,b,c){return n.get(a,b,c,"json")},getScript:function(a,b){return n.get(a,void 0,b,"script")}}),n.each(["get","post"],function(a,b){n[b]=function(a,c,d,e){return n.isFunction(c)&&(e=e||d,d=c,c=void 0),n.ajax({url:a,type:b,dataType:e,data:c,success:d})}}),n._evalUrl=function(a){return n.ajax({url:a,type:"GET",dataType:"script",async:!1,global:!1,"throws":!0})},n.fn.extend({wrapAll:function(a){var b;return n.isFunction(a)?this.each(function(b){n(this).wrapAll(a.call(this,b))}):(this[0]&&(b=n(a,this[0].ownerDocument).eq(0).clone(!0),this[0].parentNode&&b.insertBefore(this[0]),b.map(function(){var a=this;while(a.firstElementChild)a=a.firstElementChild;return a}).append(this)),this)},wrapInner:function(a){return this.each(n.isFunction(a)?function(b){n(this).wrapInner(a.call(this,b))}:function(){var b=n(this),c=b.contents();c.length?c.wrapAll(a):b.append(a)})},wrap:function(a){var b=n.isFunction(a);return this.each(function(c){n(this).wrapAll(b?a.call(this,c):a)})},unwrap:function(){return this.parent().each(function(){n.nodeName(this,"body")||n(this).replaceWith(this.childNodes)}).end()}}),n.expr.filters.hidden=function(a){return a.offsetWidth<=0&&a.offsetHeight<=0},n.expr.filters.visible=function(a){return!n.expr.filters.hidden(a)};var vc=/%20/g,wc=/\[\]$/,xc=/\r?\n/g,yc=/^(?:submit|button|image|reset|file)$/i,zc=/^(?:input|select|textarea|keygen)/i;function Ac(a,b,c,d){var e;if(n.isArray(b))n.each(b,function(b,e){c||wc.test(a)?d(a,e):Ac(a+"["+("object"==typeof e?b:"")+"]",e,c,d)});else if(c||"object"!==n.type(b))d(a,b);else for(e in b)Ac(a+"["+e+"]",b[e],c,d)}n.param=function(a,b){var c,d=[],e=function(a,b){b=n.isFunction(b)?b():null==b?"":b,d[d.length]=encodeURIComponent(a)+"="+encodeURIComponent(b)};if(void 0===b&&(b=n.ajaxSettings&&n.ajaxSettings.traditional),n.isArray(a)||a.jquery&&!n.isPlainObject(a))n.each(a,function(){e(this.name,this.value)});else for(c in a)Ac(c,a[c],b,e);return d.join("&").replace(vc,"+")},n.fn.extend({serialize:function(){return n.param(this.serializeArray())},serializeArray:function(){return this.map(function(){var a=n.prop(this,"elements");return a?n.makeArray(a):this}).filter(function(){var a=this.type;return this.name&&!n(this).is(":disabled")&&zc.test(this.nodeName)&&!yc.test(a)&&(this.checked||!T.test(a))}).map(function(a,b){var c=n(this).val();return null==c?null:n.isArray(c)?n.map(c,function(a){return{name:b.name,value:a.replace(xc,"\r\n")}}):{name:b.name,value:c.replace(xc,"\r\n")}}).get()}}),n.ajaxSettings.xhr=function(){try{return new XMLHttpRequest}catch(a){}};var Bc=0,Cc={},Dc={0:200,1223:204},Ec=n.ajaxSettings.xhr();a.attachEvent&&a.attachEvent("onunload",function(){for(var a in Cc)Cc[a]()}),k.cors=!!Ec&&"withCredentials"in Ec,k.ajax=Ec=!!Ec,n.ajaxTransport(function(a){var b;return k.cors||Ec&&!a.crossDomain?{send:function(c,d){var e,f=a.xhr(),g=++Bc;if(f.open(a.type,a.url,a.async,a.username,a.password),a.xhrFields)for(e in a.xhrFields)f[e]=a.xhrFields[e];a.mimeType&&f.overrideMimeType&&f.overrideMimeType(a.mimeType),a.crossDomain||c["X-Requested-With"]||(c["X-Requested-With"]="XMLHttpRequest");for(e in c)f.setRequestHeader(e,c[e]);b=function(a){return function(){b&&(delete Cc[g],b=f.onload=f.onerror=null,"abort"===a?f.abort():"error"===a?d(f.status,f.statusText):d(Dc[f.status]||f.status,f.statusText,"string"==typeof f.responseText?{text:f.responseText}:void 0,f.getAllResponseHeaders()))}},f.onload=b(),f.onerror=b("error"),b=Cc[g]=b("abort");try{f.send(a.hasContent&&a.data||null)}catch(h){if(b)throw h}},abort:function(){b&&b()}}:void 0}),n.ajaxSetup({accepts:{script:"text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"},contents:{script:/(?:java|ecma)script/},converters:{"text script":function(a){return n.globalEval(a),a}}}),n.ajaxPrefilter("script",function(a){void 0===a.cache&&(a.cache=!1),a.crossDomain&&(a.type="GET")}),n.ajaxTransport("script",function(a){if(a.crossDomain){var b,c;return{send:function(d,e){b=n("<script>").prop({async:!0,charset:a.scriptCharset,src:a.url}).on("load error",c=function(a){b.remove(),c=null,a&&e("error"===a.type?404:200,a.type)}),l.head.appendChild(b[0])},abort:function(){c&&c()}}}});var Fc=[],Gc=/(=)\?(?=&|$)|\?\?/;n.ajaxSetup({jsonp:"callback",jsonpCallback:function(){var a=Fc.pop()||n.expando+"_"+cc++;return this[a]=!0,a}}),n.ajaxPrefilter("json jsonp",function(b,c,d){var e,f,g,h=b.jsonp!==!1&&(Gc.test(b.url)?"url":"string"==typeof b.data&&!(b.contentType||"").indexOf("application/x-www-form-urlencoded")&&Gc.test(b.data)&&"data");return h||"jsonp"===b.dataTypes[0]?(e=b.jsonpCallback=n.isFunction(b.jsonpCallback)?b.jsonpCallback():b.jsonpCallback,h?b[h]=b[h].replace(Gc,"$1"+e):b.jsonp!==!1&&(b.url+=(dc.test(b.url)?"&":"?")+b.jsonp+"="+e),b.converters["script json"]=function(){return g||n.error(e+" was not called"),g[0]},b.dataTypes[0]="json",f=a[e],a[e]=function(){g=arguments},d.always(function(){a[e]=f,b[e]&&(b.jsonpCallback=c.jsonpCallback,Fc.push(e)),g&&n.isFunction(f)&&f(g[0]),g=f=void 0}),"script"):void 0}),n.parseHTML=function(a,b,c){if(!a||"string"!=typeof a)return null;"boolean"==typeof b&&(c=b,b=!1),b=b||l;var d=v.exec(a),e=!c&&[];return d?[b.createElement(d[1])]:(d=n.buildFragment([a],b,e),e&&e.length&&n(e).remove(),n.merge([],d.childNodes))};var Hc=n.fn.load;n.fn.load=function(a,b,c){if("string"!=typeof a&&Hc)return Hc.apply(this,arguments);var d,e,f,g=this,h=a.indexOf(" ");return h>=0&&(d=n.trim(a.slice(h)),a=a.slice(0,h)),n.isFunction(b)?(c=b,b=void 0):b&&"object"==typeof b&&(e="POST"),g.length>0&&n.ajax({url:a,type:e,dataType:"html",data:b}).done(function(a){f=arguments,g.html(d?n("<div>").append(n.parseHTML(a)).find(d):a)}).complete(c&&function(a,b){g.each(c,f||[a.responseText,b,a])}),this},n.each(["ajaxStart","ajaxStop","ajaxComplete","ajaxError","ajaxSuccess","ajaxSend"],function(a,b){n.fn[b]=function(a){return this.on(b,a)}}),n.expr.filters.animated=function(a){return n.grep(n.timers,function(b){return a===b.elem}).length};var Ic=a.document.documentElement;function Jc(a){return n.isWindow(a)?a:9===a.nodeType&&a.defaultView}n.offset={setOffset:function(a,b,c){var d,e,f,g,h,i,j,k=n.css(a,"position"),l=n(a),m={};"static"===k&&(a.style.position="relative"),h=l.offset(),f=n.css(a,"top"),i=n.css(a,"left"),j=("absolute"===k||"fixed"===k)&&(f+i).indexOf("auto")>-1,j?(d=l.position(),g=d.top,e=d.left):(g=parseFloat(f)||0,e=parseFloat(i)||0),n.isFunction(b)&&(b=b.call(a,c,h)),null!=b.top&&(m.top=b.top-h.top+g),null!=b.left&&(m.left=b.left-h.left+e),"using"in b?b.using.call(a,m):l.css(m)}},n.fn.extend({offset:function(a){if(arguments.length)return void 0===a?this:this.each(function(b){n.offset.setOffset(this,a,b)});var b,c,d=this[0],e={top:0,left:0},f=d&&d.ownerDocument;if(f)return b=f.documentElement,n.contains(b,d)?(typeof d.getBoundingClientRect!==U&&(e=d.getBoundingClientRect()),c=Jc(f),{top:e.top+c.pageYOffset-b.clientTop,left:e.left+c.pageXOffset-b.clientLeft}):e},position:function(){if(this[0]){var a,b,c=this[0],d={top:0,left:0};return"fixed"===n.css(c,"position")?b=c.getBoundingClientRect():(a=this.offsetParent(),b=this.offset(),n.nodeName(a[0],"html")||(d=a.offset()),d.top+=n.css(a[0],"borderTopWidth",!0),d.left+=n.css(a[0],"borderLeftWidth",!0)),{top:b.top-d.top-n.css(c,"marginTop",!0),left:b.left-d.left-n.css(c,"marginLeft",!0)}}},offsetParent:function(){return this.map(function(){var a=this.offsetParent||Ic;while(a&&!n.nodeName(a,"html")&&"static"===n.css(a,"position"))a=a.offsetParent;return a||Ic})}}),n.each({scrollLeft:"pageXOffset",scrollTop:"pageYOffset"},function(b,c){var d="pageYOffset"===c;n.fn[b]=function(e){return J(this,function(b,e,f){var g=Jc(b);return void 0===f?g?g[c]:b[e]:void(g?g.scrollTo(d?a.pageXOffset:f,d?f:a.pageYOffset):b[e]=f)},b,e,arguments.length,null)}}),n.each(["top","left"],function(a,b){n.cssHooks[b]=yb(k.pixelPosition,function(a,c){return c?(c=xb(a,b),vb.test(c)?n(a).position()[b]+"px":c):void 0})}),n.each({Height:"height",Width:"width"},function(a,b){n.each({padding:"inner"+a,content:b,"":"outer"+a},function(c,d){n.fn[d]=function(d,e){var f=arguments.length&&(c||"boolean"!=typeof d),g=c||(d===!0||e===!0?"margin":"border");return J(this,function(b,c,d){var e;return n.isWindow(b)?b.document.documentElement["client"+a]:9===b.nodeType?(e=b.documentElement,Math.max(b.body["scroll"+a],e["scroll"+a],b.body["offset"+a],e["offset"+a],e["client"+a])):void 0===d?n.css(b,c,g):n.style(b,c,d,g)},b,f?d:void 0,f,null)}})}),n.fn.size=function(){return this.length},n.fn.andSelf=n.fn.addBack,"function"==typeof define&&define.amd&&define("jquery",[],function(){return n});var Kc=a.jQuery,Lc=a.$;return n.noConflict=function(b){return a.$===n&&(a.$=Lc),b&&a.jQuery===n&&(a.jQuery=Kc),n},typeof b===U&&(a.jQuery=a.$=n),n});

/*! VelocityJS.org (1.2.2). (C) 2014 Julian Shapiro. MIT @license: en.wikipedia.org/wiki/MIT_License */

/*************************
   Velocity jQuery Shim
*************************/

/*! VelocityJS.org jQuery Shim (1.0.1). (C) 2014 The jQuery Foundation. MIT @license: en.wikipedia.org/wiki/MIT_License. */

/* This file contains the jQuery functions that Velocity relies on, thereby removing Velocity's dependency on a full copy of jQuery, and allowing it to work in any environment. */
/* These shimmed functions are only used if jQuery isn't present. If both this shim and jQuery are loaded, Velocity defaults to jQuery proper. */
/* Browser support: Using this shim instead of jQuery proper removes support for IE8. */

;(function (window) {
    /***************
         Setup
    ***************/

    /* If jQuery is already loaded, there's no point in loading this shim. */
    if (window.jQuery) {
        return;
    }

    /* jQuery base. */
    var $ = function (selector, context) {
        return new $.fn.init(selector, context);
    };

    /********************
       Private Methods
    ********************/

    /* jQuery */
    $.isWindow = function (obj) {
        /* jshint eqeqeq: false */
        return obj != null && obj == obj.window;
    };

    /* jQuery */
    $.type = function (obj) {
        if (obj == null) {
            return obj + "";
        }

        return typeof obj === "object" || typeof obj === "function" ?
            class2type[toString.call(obj)] || "object" :
            typeof obj;
    };

    /* jQuery */
    $.isArray = Array.isArray || function (obj) {
        return $.type(obj) === "array";
    };

    /* jQuery */
    function isArraylike (obj) {
        var length = obj.length,
            type = $.type(obj);

        if (type === "function" || $.isWindow(obj)) {
            return false;
        }

        if (obj.nodeType === 1 && length) {
            return true;
        }

        return type === "array" || length === 0 || typeof length === "number" && length > 0 && (length - 1) in obj;
    }

    /***************
       $ Methods
    ***************/

    /* jQuery: Support removed for IE<9. */
    $.isPlainObject = function (obj) {
        var key;

        if (!obj || $.type(obj) !== "object" || obj.nodeType || $.isWindow(obj)) {
            return false;
        }

        try {
            if (obj.constructor &&
                !hasOwn.call(obj, "constructor") &&
                !hasOwn.call(obj.constructor.prototype, "isPrototypeOf")) {
                return false;
            }
        } catch (e) {
            return false;
        }

        for (key in obj) {}

        return key === undefined || hasOwn.call(obj, key);
    };

    /* jQuery */
    $.each = function(obj, callback, args) {
        var value,
            i = 0,
            length = obj.length,
            isArray = isArraylike(obj);

        if (args) {
            if (isArray) {
                for (; i < length; i++) {
                    value = callback.apply(obj[i], args);

                    if (value === false) {
                        break;
                    }
                }
            } else {
                for (i in obj) {
                    value = callback.apply(obj[i], args);

                    if (value === false) {
                        break;
                    }
                }
            }

        } else {
            if (isArray) {
                for (; i < length; i++) {
                    value = callback.call(obj[i], i, obj[i]);

                    if (value === false) {
                        break;
                    }
                }
            } else {
                for (i in obj) {
                    value = callback.call(obj[i], i, obj[i]);

                    if (value === false) {
                        break;
                    }
                }
            }
        }

        return obj;
    };

    /* Custom */
    $.data = function (node, key, value) {
        /* $.getData() */
        if (value === undefined) {
            var id = node[$.expando],
                store = id && cache[id];

            if (key === undefined) {
                return store;
            } else if (store) {
                if (key in store) {
                    return store[key];
                }
            }
        /* $.setData() */
        } else if (key !== undefined) {
            var id = node[$.expando] || (node[$.expando] = ++$.uuid);

            cache[id] = cache[id] || {};
            cache[id][key] = value;

            return value;
        }
    };

    /* Custom */
    $.removeData = function (node, keys) {
        var id = node[$.expando],
            store = id && cache[id];

        if (store) {
            $.each(keys, function(_, key) {
                delete store[key];
            });
        }
    };

    /* jQuery */
    $.extend = function () {
        var src, copyIsArray, copy, name, options, clone,
            target = arguments[0] || {},
            i = 1,
            length = arguments.length,
            deep = false;

        if (typeof target === "boolean") {
            deep = target;

            target = arguments[i] || {};
            i++;
        }

        if (typeof target !== "object" && $.type(target) !== "function") {
            target = {};
        }

        if (i === length) {
            target = this;
            i--;
        }

        for (; i < length; i++) {
            if ((options = arguments[i]) != null) {
                for (name in options) {
                    src = target[name];
                    copy = options[name];

                    if (target === copy) {
                        continue;
                    }

                    if (deep && copy && ($.isPlainObject(copy) || (copyIsArray = $.isArray(copy)))) {
                        if (copyIsArray) {
                            copyIsArray = false;
                            clone = src && $.isArray(src) ? src : [];

                        } else {
                            clone = src && $.isPlainObject(src) ? src : {};
                        }

                        target[name] = $.extend(deep, clone, copy);

                    } else if (copy !== undefined) {
                        target[name] = copy;
                    }
                }
            }
        }

        return target;
    };

    /* jQuery 1.4.3 */
    $.queue = function (elem, type, data) {
        function $makeArray (arr, results) {
            var ret = results || [];

            if (arr != null) {
                if (isArraylike(Object(arr))) {
                    /* $.merge */
                    (function(first, second) {
                        var len = +second.length,
                            j = 0,
                            i = first.length;

                        while (j < len) {
                            first[i++] = second[j++];
                        }

                        if (len !== len) {
                            while (second[j] !== undefined) {
                                first[i++] = second[j++];
                            }
                        }

                        first.length = i;

                        return first;
                    })(ret, typeof arr === "string" ? [arr] : arr);
                } else {
                    [].push.call(ret, arr);
                }
            }

            return ret;
        }

        if (!elem) {
            return;
        }

        type = (type || "fx") + "queue";

        var q = $.data(elem, type);

        if (!data) {
            return q || [];
        }

        if (!q || $.isArray(data)) {
            q = $.data(elem, type, $makeArray(data));
        } else {
            q.push(data);
        }

        return q;
    };

    /* jQuery 1.4.3 */
    $.dequeue = function (elems, type) {
        /* Custom: Embed element iteration. */
        $.each(elems.nodeType ? [ elems ] : elems, function(i, elem) {
            type = type || "fx";

            var queue = $.queue(elem, type),
                fn = queue.shift();

            if (fn === "inprogress") {
                fn = queue.shift();
            }

            if (fn) {
                if (type === "fx") {
                    queue.unshift("inprogress");
                }

                fn.call(elem, function() {
                    $.dequeue(elem, type);
                });
            }
        });
    };

    /******************
       $.fn Methods
    ******************/

    /* jQuery */
    $.fn = $.prototype = {
        init: function (selector) {
            /* Just return the element wrapped inside an array; don't proceed with the actual jQuery node wrapping process. */
            if (selector.nodeType) {
                this[0] = selector;

                return this;
            } else {
                throw new Error("Not a DOM node.");
            }
        },

        offset: function () {
            /* jQuery altered code: Dropped disconnected DOM node checking. */
            var box = this[0].getBoundingClientRect ? this[0].getBoundingClientRect() : { top: 0, left: 0 };

            return {
                top: box.top + (window.pageYOffset || document.scrollTop  || 0)  - (document.clientTop  || 0),
                left: box.left + (window.pageXOffset || document.scrollLeft  || 0) - (document.clientLeft || 0)
            };
        },

        position: function () {
            /* jQuery */
            function offsetParent() {
                var offsetParent = this.offsetParent || document;

                while (offsetParent && (!offsetParent.nodeType.toLowerCase === "html" && offsetParent.style.position === "static")) {
                    offsetParent = offsetParent.offsetParent;
                }

                return offsetParent || document;
            }

            /* Zepto */
            var elem = this[0],
                offsetParent = offsetParent.apply(elem),
                offset = this.offset(),
                parentOffset = /^(?:body|html)$/i.test(offsetParent.nodeName) ? { top: 0, left: 0 } : $(offsetParent).offset()

            offset.top -= parseFloat(elem.style.marginTop) || 0;
            offset.left -= parseFloat(elem.style.marginLeft) || 0;

            if (offsetParent.style) {
                parentOffset.top += parseFloat(offsetParent.style.borderTopWidth) || 0
                parentOffset.left += parseFloat(offsetParent.style.borderLeftWidth) || 0
            }

            return {
                top: offset.top - parentOffset.top,
                left: offset.left - parentOffset.left
            };
        }
    };

    /**********************
       Private Variables
    **********************/

    /* For $.data() */
    var cache = {};
    $.expando = "velocity" + (new Date().getTime());
    $.uuid = 0;

    /* For $.queue() */
    var class2type = {},
        hasOwn = class2type.hasOwnProperty,
        toString = class2type.toString;

    var types = "Boolean Number String Function Array Date RegExp Object Error".split(" ");
    for (var i = 0; i < types.length; i++) {
        class2type["[object " + types[i] + "]"] = types[i].toLowerCase();
    }

    /* Makes $(node) possible, without having to call init. */
    $.fn.init.prototype = $.fn;

    /* Globalize Velocity onto the window, and assign its Utilities property. */
    window.Velocity = { Utilities: $ };
})(window);

/******************
    Velocity.js
******************/

;(function (factory) {
    /* CommonJS module. */
    if (typeof module === "object" && typeof module.exports === "object") {
        module.exports = factory();
    /* AMD module. */
    } else if (typeof define === "function" && define.amd) {
        define(factory);
    /* Browser globals. */
    } else {
        factory();
    }
}(function() {
return function (global, window, document, undefined) {

    /***************
        Summary
    ***************/

    /*
    - CSS: CSS stack that works independently from the rest of Velocity.
    - animate(): Core animation method that iterates over the targeted elements and queues the incoming call onto each element individually.
      - Pre-Queueing: Prepare the element for animation by instantiating its data cache and processing the call's options.
      - Queueing: The logic that runs once the call has reached its point of execution in the element's $.queue() stack.
                  Most logic is placed here to avoid risking it becoming stale (if the element's properties have changed).
      - Pushing: Consolidation of the tween data followed by its push onto the global in-progress calls container.
    - tick(): The single requestAnimationFrame loop responsible for tweening all in-progress calls.
    - completeCall(): Handles the cleanup process for each Velocity call.
    */

    /*********************
       Helper Functions
    *********************/

    /* IE detection. Gist: https://gist.github.com/julianshapiro/9098609 */
    var IE = (function() {
        if (document.documentMode) {
            return document.documentMode;
        } else {
            for (var i = 7; i > 4; i--) {
                var div = document.createElement("div");

                div.innerHTML = "<!--[if IE " + i + "]><span></span><![endif]-->";

                if (div.getElementsByTagName("span").length) {
                    div = null;

                    return i;
                }
            }
        }

        return undefined;
    })();

    /* rAF shim. Gist: https://gist.github.com/julianshapiro/9497513 */
    var rAFShim = (function() {
        var timeLast = 0;

        return window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function(callback) {
            var timeCurrent = (new Date()).getTime(),
                timeDelta;

            /* Dynamically set delay on a per-tick basis to match 60fps. */
            /* Technique by Erik Moller. MIT license: https://gist.github.com/paulirish/1579671 */
            timeDelta = Math.max(0, 16 - (timeCurrent - timeLast));
            timeLast = timeCurrent + timeDelta;

            return setTimeout(function() { callback(timeCurrent + timeDelta); }, timeDelta);
        };
    })();

    /* Array compacting. Copyright Lo-Dash. MIT License: https://github.com/lodash/lodash/blob/master/LICENSE.txt */
    function compactSparseArray (array) {
        var index = -1,
            length = array ? array.length : 0,
            result = [];

        while (++index < length) {
            var value = array[index];

            if (value) {
                result.push(value);
            }
        }

        return result;
    }

    function sanitizeElements (elements) {
        /* Unwrap jQuery/Zepto objects. */
        if (Type.isWrapped(elements)) {
            elements = [].slice.call(elements);
        /* Wrap a single element in an array so that $.each() can iterate with the element instead of its node's children. */
        } else if (Type.isNode(elements)) {
            elements = [ elements ];
        }

        return elements;
    }

    var Type = {
        isString: function (variable) {
            return (typeof variable === "string");
        },
        isArray: Array.isArray || function (variable) {
            return Object.prototype.toString.call(variable) === "[object Array]";
        },
        isFunction: function (variable) {
            return Object.prototype.toString.call(variable) === "[object Function]";
        },
        isNode: function (variable) {
            return variable && variable.nodeType;
        },
        /* Copyright Martin Bohm. MIT License: https://gist.github.com/Tomalak/818a78a226a0738eaade */
        isNodeList: function (variable) {
            return typeof variable === "object" &&
                /^\[object (HTMLCollection|NodeList|Object)\]$/.test(Object.prototype.toString.call(variable)) &&
                variable.length !== undefined &&
                (variable.length === 0 || (typeof variable[0] === "object" && variable[0].nodeType > 0));
        },
        /* Determine if variable is a wrapped jQuery or Zepto element. */
        isWrapped: function (variable) {
            return variable && (variable.jquery || (window.Zepto && window.Zepto.zepto.isZ(variable)));
        },
        isSVG: function (variable) {
            return window.SVGElement && (variable instanceof window.SVGElement);
        },
        isEmptyObject: function (variable) {
            for (var name in variable) {
                return false;
            }

            return true;
        }
    };

    /*****************
       Dependencies
    *****************/

    var $,
        isJQuery = false;

    if (global.fn && global.fn.jquery) {
        $ = global;
        isJQuery = true;
    } else {
        $ = window.Velocity.Utilities;
    }

    if (IE <= 8 && !isJQuery) {
        throw new Error("Velocity: IE8 and below require jQuery to be loaded before Velocity.");
    } else if (IE <= 7) {
        /* Revert to jQuery's $.animate(), and lose Velocity's extra features. */
        jQuery.fn.velocity = jQuery.fn.animate;

        /* Now that $.fn.velocity is aliased, abort this Velocity declaration. */
        return;
    }

    /*****************
        Constants
    *****************/

    var DURATION_DEFAULT = 400,
        EASING_DEFAULT = "swing";

    /*************
        State
    *************/

    var Velocity = {
        /* Container for page-wide Velocity state data. */
        State: {
            /* Detect mobile devices to determine if mobileHA should be turned on. */
            isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
            /* The mobileHA option's behavior changes on older Android devices (Gingerbread, versions 2.3.3-2.3.7). */
            isAndroid: /Android/i.test(navigator.userAgent),
            isGingerbread: /Android 2\.3\.[3-7]/i.test(navigator.userAgent),
            isChrome: window.chrome,
            isFirefox: /Firefox/i.test(navigator.userAgent),
            /* Create a cached element for re-use when checking for CSS property prefixes. */
            prefixElement: document.createElement("div"),
            /* Cache every prefix match to avoid repeating lookups. */
            prefixMatches: {},
            /* Cache the anchor used for animating window scrolling. */
            scrollAnchor: null,
            /* Cache the browser-specific property names associated with the scroll anchor. */
            scrollPropertyLeft: null,
            scrollPropertyTop: null,
            /* Keep track of whether our RAF tick is running. */
            isTicking: false,
            /* Container for every in-progress call to Velocity. */
            calls: []
        },
        /* Velocity's custom CSS stack. Made global for unit testing. */
        CSS: { /* Defined below. */ },
        /* A shim of the jQuery utility functions used by Velocity -- provided by Velocity's optional jQuery shim. */
        Utilities: $,
        /* Container for the user's custom animation redirects that are referenced by name in place of the properties map argument. */
        Redirects: { /* Manually registered by the user. */ },
        Easings: { /* Defined below. */ },
        /* Attempt to use ES6 Promises by default. Users can override this with a third-party promises library. */
        Promise: window.Promise,
        /* Velocity option defaults, which can be overriden by the user. */
        defaults: {
            queue: "",
            duration: DURATION_DEFAULT,
            easing: EASING_DEFAULT,
            begin: undefined,
            complete: undefined,
            progress: undefined,
            display: undefined,
            visibility: undefined,
            loop: false,
            delay: false,
            mobileHA: true,
            /* Advanced: Set to false to prevent property values from being cached between consecutive Velocity-initiated chain calls. */
            _cacheValues: true
        },
        /* A design goal of Velocity is to cache data wherever possible in order to avoid DOM requerying. Accordingly, each element has a data cache. */
        init: function (element) {
            $.data(element, "velocity", {
                /* Store whether this is an SVG element, since its properties are retrieved and updated differently than standard HTML elements. */
                isSVG: Type.isSVG(element),
                /* Keep track of whether the element is currently being animated by Velocity.
                   This is used to ensure that property values are not transferred between non-consecutive (stale) calls. */
                isAnimating: false,
                /* A reference to the element's live computedStyle object. Learn more here: https://developer.mozilla.org/en/docs/Web/API/window.getComputedStyle */
                computedStyle: null,
                /* Tween data is cached for each animation on the element so that data can be passed across calls --
                   in particular, end values are used as subsequent start values in consecutive Velocity calls. */
                tweensContainer: null,
                /* The full root property values of each CSS hook being animated on this element are cached so that:
                   1) Concurrently-animating hooks sharing the same root can have their root values' merged into one while tweening.
                   2) Post-hook-injection root values can be transferred over to consecutively chained Velocity calls as starting root values. */
                rootPropertyValueCache: {},
                /* A cache for transform updates, which must be manually flushed via CSS.flushTransformCache(). */
                transformCache: {}
            });
        },
        /* A parallel to jQuery's $.css(), used for getting/setting Velocity's hooked CSS properties. */
        hook: null, /* Defined below. */
        /* Velocity-wide animation time remapping for testing purposes. */
        mock: false,
        version: { major: 1, minor: 2, patch: 2 },
        /* Set to 1 or 2 (most verbose) to output debug info to console. */
        debug: false
    };

    /* Retrieve the appropriate scroll anchor and property name for the browser: https://developer.mozilla.org/en-US/docs/Web/API/Window.scrollY */
    if (window.pageYOffset !== undefined) {
        Velocity.State.scrollAnchor = window;
        Velocity.State.scrollPropertyLeft = "pageXOffset";
        Velocity.State.scrollPropertyTop = "pageYOffset";
    } else {
        Velocity.State.scrollAnchor = document.documentElement || document.body.parentNode || document.body;
        Velocity.State.scrollPropertyLeft = "scrollLeft";
        Velocity.State.scrollPropertyTop = "scrollTop";
    }

    /* Shorthand alias for jQuery's $.data() utility. */
    function Data (element) {
        /* Hardcode a reference to the plugin name. */
        var response = $.data(element, "velocity");

        /* jQuery <=1.4.2 returns null instead of undefined when no match is found. We normalize this behavior. */
        return response === null ? undefined : response;
    };

    /**************
        Easing
    **************/

    /* Step easing generator. */
    function generateStep (steps) {
        return function (p) {
            return Math.round(p * steps) * (1 / steps);
        };
    }

    /* Bezier curve function generator. Copyright Gaetan Renaudeau. MIT License: http://en.wikipedia.org/wiki/MIT_License */
    function generateBezier (mX1, mY1, mX2, mY2) {
        var NEWTON_ITERATIONS = 4,
            NEWTON_MIN_SLOPE = 0.001,
            SUBDIVISION_PRECISION = 0.0000001,
            SUBDIVISION_MAX_ITERATIONS = 10,
            kSplineTableSize = 11,
            kSampleStepSize = 1.0 / (kSplineTableSize - 1.0),
            float32ArraySupported = "Float32Array" in window;

        /* Must contain four arguments. */
        if (arguments.length !== 4) {
            return false;
        }

        /* Arguments must be numbers. */
        for (var i = 0; i < 4; ++i) {
            if (typeof arguments[i] !== "number" || isNaN(arguments[i]) || !isFinite(arguments[i])) {
                return false;
            }
        }

        /* X values must be in the [0, 1] range. */
        mX1 = Math.min(mX1, 1);
        mX2 = Math.min(mX2, 1);
        mX1 = Math.max(mX1, 0);
        mX2 = Math.max(mX2, 0);

        var mSampleValues = float32ArraySupported ? new Float32Array(kSplineTableSize) : new Array(kSplineTableSize);

        function A (aA1, aA2) { return 1.0 - 3.0 * aA2 + 3.0 * aA1; }
        function B (aA1, aA2) { return 3.0 * aA2 - 6.0 * aA1; }
        function C (aA1)      { return 3.0 * aA1; }

        function calcBezier (aT, aA1, aA2) {
            return ((A(aA1, aA2)*aT + B(aA1, aA2))*aT + C(aA1))*aT;
        }

        function getSlope (aT, aA1, aA2) {
            return 3.0 * A(aA1, aA2)*aT*aT + 2.0 * B(aA1, aA2) * aT + C(aA1);
        }

        function newtonRaphsonIterate (aX, aGuessT) {
            for (var i = 0; i < NEWTON_ITERATIONS; ++i) {
                var currentSlope = getSlope(aGuessT, mX1, mX2);

                if (currentSlope === 0.0) return aGuessT;

                var currentX = calcBezier(aGuessT, mX1, mX2) - aX;
                aGuessT -= currentX / currentSlope;
            }

            return aGuessT;
        }

        function calcSampleValues () {
            for (var i = 0; i < kSplineTableSize; ++i) {
                mSampleValues[i] = calcBezier(i * kSampleStepSize, mX1, mX2);
            }
        }

        function binarySubdivide (aX, aA, aB) {
            var currentX, currentT, i = 0;

            do {
                currentT = aA + (aB - aA) / 2.0;
                currentX = calcBezier(currentT, mX1, mX2) - aX;
                if (currentX > 0.0) {
                  aB = currentT;
                } else {
                  aA = currentT;
                }
            } while (Math.abs(currentX) > SUBDIVISION_PRECISION && ++i < SUBDIVISION_MAX_ITERATIONS);

            return currentT;
        }

        function getTForX (aX) {
            var intervalStart = 0.0,
                currentSample = 1,
                lastSample = kSplineTableSize - 1;

            for (; currentSample != lastSample && mSampleValues[currentSample] <= aX; ++currentSample) {
                intervalStart += kSampleStepSize;
            }

            --currentSample;

            var dist = (aX - mSampleValues[currentSample]) / (mSampleValues[currentSample+1] - mSampleValues[currentSample]),
                guessForT = intervalStart + dist * kSampleStepSize,
                initialSlope = getSlope(guessForT, mX1, mX2);

            if (initialSlope >= NEWTON_MIN_SLOPE) {
                return newtonRaphsonIterate(aX, guessForT);
            } else if (initialSlope == 0.0) {
                return guessForT;
            } else {
                return binarySubdivide(aX, intervalStart, intervalStart + kSampleStepSize);
            }
        }

        var _precomputed = false;

        function precompute() {
            _precomputed = true;
            if (mX1 != mY1 || mX2 != mY2) calcSampleValues();
        }

        var f = function (aX) {
            if (!_precomputed) precompute();
            if (mX1 === mY1 && mX2 === mY2) return aX;
            if (aX === 0) return 0;
            if (aX === 1) return 1;

            return calcBezier(getTForX(aX), mY1, mY2);
        };

        f.getControlPoints = function() { return [{ x: mX1, y: mY1 }, { x: mX2, y: mY2 }]; };

        var str = "generateBezier(" + [mX1, mY1, mX2, mY2] + ")";
        f.toString = function () { return str; };

        return f;
    }

    /* Runge-Kutta spring physics function generator. Adapted from Framer.js, copyright Koen Bok. MIT License: http://en.wikipedia.org/wiki/MIT_License */
    /* Given a tension, friction, and duration, a simulation at 60FPS will first run without a defined duration in order to calculate the full path. A second pass
       then adjusts the time delta -- using the relation between actual time and duration -- to calculate the path for the duration-constrained animation. */
    var generateSpringRK4 = (function () {
        function springAccelerationForState (state) {
            return (-state.tension * state.x) - (state.friction * state.v);
        }

        function springEvaluateStateWithDerivative (initialState, dt, derivative) {
            var state = {
                x: initialState.x + derivative.dx * dt,
                v: initialState.v + derivative.dv * dt,
                tension: initialState.tension,
                friction: initialState.friction
            };

            return { dx: state.v, dv: springAccelerationForState(state) };
        }

        function springIntegrateState (state, dt) {
            var a = {
                    dx: state.v,
                    dv: springAccelerationForState(state)
                },
                b = springEvaluateStateWithDerivative(state, dt * 0.5, a),
                c = springEvaluateStateWithDerivative(state, dt * 0.5, b),
                d = springEvaluateStateWithDerivative(state, dt, c),
                dxdt = 1.0 / 6.0 * (a.dx + 2.0 * (b.dx + c.dx) + d.dx),
                dvdt = 1.0 / 6.0 * (a.dv + 2.0 * (b.dv + c.dv) + d.dv);

            state.x = state.x + dxdt * dt;
            state.v = state.v + dvdt * dt;

            return state;
        }

        return function springRK4Factory (tension, friction, duration) {

            var initState = {
                    x: -1,
                    v: 0,
                    tension: null,
                    friction: null
                },
                path = [0],
                time_lapsed = 0,
                tolerance = 1 / 10000,
                DT = 16 / 1000,
                have_duration, dt, last_state;

            tension = parseFloat(tension) || 500;
            friction = parseFloat(friction) || 20;
            duration = duration || null;

            initState.tension = tension;
            initState.friction = friction;

            have_duration = duration !== null;

            /* Calculate the actual time it takes for this animation to complete with the provided conditions. */
            if (have_duration) {
                /* Run the simulation without a duration. */
                time_lapsed = springRK4Factory(tension, friction);
                /* Compute the adjusted time delta. */
                dt = time_lapsed / duration * DT;
            } else {
                dt = DT;
            }

            while (true) {
                /* Next/step function .*/
                last_state = springIntegrateState(last_state || initState, dt);
                /* Store the position. */
                path.push(1 + last_state.x);
                time_lapsed += 16;
                /* If the change threshold is reached, break. */
                if (!(Math.abs(last_state.x) > tolerance && Math.abs(last_state.v) > tolerance)) {
                    break;
                }
            }

            /* If duration is not defined, return the actual time required for completing this animation. Otherwise, return a closure that holds the
               computed path and returns a snapshot of the position according to a given percentComplete. */
            return !have_duration ? time_lapsed : function(percentComplete) { return path[ (percentComplete * (path.length - 1)) | 0 ]; };
        };
    }());

    /* jQuery easings. */
    Velocity.Easings = {
        linear: function(p) { return p; },
        swing: function(p) { return 0.5 - Math.cos( p * Math.PI ) / 2 },
        /* Bonus "spring" easing, which is a less exaggerated version of easeInOutElastic. */
        spring: function(p) { return 1 - (Math.cos(p * 4.5 * Math.PI) * Math.exp(-p * 6)); }
    };

    /* CSS3 and Robert Penner easings. */
    $.each(
        [
            [ "ease", [ 0.25, 0.1, 0.25, 1.0 ] ],
            [ "ease-in", [ 0.42, 0.0, 1.00, 1.0 ] ],
            [ "ease-out", [ 0.00, 0.0, 0.58, 1.0 ] ],
            [ "ease-in-out", [ 0.42, 0.0, 0.58, 1.0 ] ],
            [ "easeInSine", [ 0.47, 0, 0.745, 0.715 ] ],
            [ "easeOutSine", [ 0.39, 0.575, 0.565, 1 ] ],
            [ "easeInOutSine", [ 0.445, 0.05, 0.55, 0.95 ] ],
            [ "easeInQuad", [ 0.55, 0.085, 0.68, 0.53 ] ],
            [ "easeOutQuad", [ 0.25, 0.46, 0.45, 0.94 ] ],
            [ "easeInOutQuad", [ 0.455, 0.03, 0.515, 0.955 ] ],
            [ "easeInCubic", [ 0.55, 0.055, 0.675, 0.19 ] ],
            [ "easeOutCubic", [ 0.215, 0.61, 0.355, 1 ] ],
            [ "easeInOutCubic", [ 0.645, 0.045, 0.355, 1 ] ],
            [ "easeInQuart", [ 0.895, 0.03, 0.685, 0.22 ] ],
            [ "easeOutQuart", [ 0.165, 0.84, 0.44, 1 ] ],
            [ "easeInOutQuart", [ 0.77, 0, 0.175, 1 ] ],
            [ "easeInQuint", [ 0.755, 0.05, 0.855, 0.06 ] ],
            [ "easeOutQuint", [ 0.23, 1, 0.32, 1 ] ],
            [ "easeInOutQuint", [ 0.86, 0, 0.07, 1 ] ],
            [ "easeInExpo", [ 0.95, 0.05, 0.795, 0.035 ] ],
            [ "easeOutExpo", [ 0.19, 1, 0.22, 1 ] ],
            [ "easeInOutExpo", [ 1, 0, 0, 1 ] ],
            [ "easeInCirc", [ 0.6, 0.04, 0.98, 0.335 ] ],
            [ "easeOutCirc", [ 0.075, 0.82, 0.165, 1 ] ],
            [ "easeInOutCirc", [ 0.785, 0.135, 0.15, 0.86 ] ]
        ], function(i, easingArray) {
            Velocity.Easings[easingArray[0]] = generateBezier.apply(null, easingArray[1]);
        });

    /* Determine the appropriate easing type given an easing input. */
    function getEasing(value, duration) {
        var easing = value;

        /* The easing option can either be a string that references a pre-registered easing,
           or it can be a two-/four-item array of integers to be converted into a bezier/spring function. */
        if (Type.isString(value)) {
            /* Ensure that the easing has been assigned to jQuery's Velocity.Easings object. */
            if (!Velocity.Easings[value]) {
                easing = false;
            }
        } else if (Type.isArray(value) && value.length === 1) {
            easing = generateStep.apply(null, value);
        } else if (Type.isArray(value) && value.length === 2) {
            /* springRK4 must be passed the animation's duration. */
            /* Note: If the springRK4 array contains non-numbers, generateSpringRK4() returns an easing
               function generated with default tension and friction values. */
            easing = generateSpringRK4.apply(null, value.concat([ duration ]));
        } else if (Type.isArray(value) && value.length === 4) {
            /* Note: If the bezier array contains non-numbers, generateBezier() returns false. */
            easing = generateBezier.apply(null, value);
        } else {
            easing = false;
        }

        /* Revert to the Velocity-wide default easing type, or fall back to "swing" (which is also jQuery's default)
           if the Velocity-wide default has been incorrectly modified. */
        if (easing === false) {
            if (Velocity.Easings[Velocity.defaults.easing]) {
                easing = Velocity.defaults.easing;
            } else {
                easing = EASING_DEFAULT;
            }
        }

        return easing;
    }

    /*****************
        CSS Stack
    *****************/

    /* The CSS object is a highly condensed and performant CSS stack that fully replaces jQuery's.
       It handles the validation, getting, and setting of both standard CSS properties and CSS property hooks. */
    /* Note: A "CSS" shorthand is aliased so that our code is easier to read. */
    var CSS = Velocity.CSS = {

        /*************
            RegEx
        *************/

        RegEx: {
            isHex: /^#([A-f\d]{3}){1,2}$/i,
            /* Unwrap a property value's surrounding text, e.g. "rgba(4, 3, 2, 1)" ==> "4, 3, 2, 1" and "rect(4px 3px 2px 1px)" ==> "4px 3px 2px 1px". */
            valueUnwrap: /^[A-z]+\((.*)\)$/i,
            wrappedValueAlreadyExtracted: /[0-9.]+ [0-9.]+ [0-9.]+( [0-9.]+)?/,
            /* Split a multi-value property into an array of subvalues, e.g. "rgba(4, 3, 2, 1) 4px 3px 2px 1px" ==> [ "rgba(4, 3, 2, 1)", "4px", "3px", "2px", "1px" ]. */
            valueSplit: /([A-z]+\(.+\))|(([A-z0-9#-.]+?)(?=\s|$))/ig
        },

        /************
            Lists
        ************/

        Lists: {
            colors: [ "fill", "stroke", "stopColor", "color", "backgroundColor", "borderColor", "borderTopColor", "borderRightColor", "borderBottomColor", "borderLeftColor", "outlineColor" ],
            transformsBase: [ "translateX", "translateY", "scale", "scaleX", "scaleY", "skewX", "skewY", "rotateZ" ],
            transforms3D: [ "transformPerspective", "translateZ", "scaleZ", "rotateX", "rotateY" ]
        },

        /************
            Hooks
        ************/

        /* Hooks allow a subproperty (e.g. "boxShadowBlur") of a compound-value CSS property
           (e.g. "boxShadow: X Y Blur Spread Color") to be animated as if it were a discrete property. */
        /* Note: Beyond enabling fine-grained property animation, hooking is necessary since Velocity only
           tweens properties with single numeric values; unlike CSS transitions, Velocity does not interpolate compound-values. */
        Hooks: {
            /********************
                Registration
            ********************/

            /* Templates are a concise way of indicating which subproperties must be individually registered for each compound-value CSS property. */
            /* Each template consists of the compound-value's base name, its constituent subproperty names, and those subproperties' default values. */
            templates: {
                "textShadow": [ "Color X Y Blur", "black 0px 0px 0px" ],
                "boxShadow": [ "Color X Y Blur Spread", "black 0px 0px 0px 0px" ],
                "clip": [ "Top Right Bottom Left", "0px 0px 0px 0px" ],
                "backgroundPosition": [ "X Y", "0% 0%" ],
                "transformOrigin": [ "X Y Z", "50% 50% 0px" ],
                "perspectiveOrigin": [ "X Y", "50% 50%" ]
            },

            /* A "registered" hook is one that has been converted from its template form into a live,
               tweenable property. It contains data to associate it with its root property. */
            registered: {
                /* Note: A registered hook looks like this ==> textShadowBlur: [ "textShadow", 3 ],
                   which consists of the subproperty's name, the associated root property's name,
                   and the subproperty's position in the root's value. */
            },
            /* Convert the templates into individual hooks then append them to the registered object above. */
            register: function () {
                /* Color hooks registration: Colors are defaulted to white -- as opposed to black -- since colors that are
                   currently set to "transparent" default to their respective template below when color-animated,
                   and white is typically a closer match to transparent than black is. An exception is made for text ("color"),
                   which is almost always set closer to black than white. */
                for (var i = 0; i < CSS.Lists.colors.length; i++) {
                    var rgbComponents = (CSS.Lists.colors[i] === "color") ? "0 0 0 1" : "255 255 255 1";
                    CSS.Hooks.templates[CSS.Lists.colors[i]] = [ "Red Green Blue Alpha", rgbComponents ];
                }

                var rootProperty,
                    hookTemplate,
                    hookNames;

                /* In IE, color values inside compound-value properties are positioned at the end the value instead of at the beginning.
                   Thus, we re-arrange the templates accordingly. */
                if (IE) {
                    for (rootProperty in CSS.Hooks.templates) {
                        hookTemplate = CSS.Hooks.templates[rootProperty];
                        hookNames = hookTemplate[0].split(" ");

                        var defaultValues = hookTemplate[1].match(CSS.RegEx.valueSplit);

                        if (hookNames[0] === "Color") {
                            /* Reposition both the hook's name and its default value to the end of their respective strings. */
                            hookNames.push(hookNames.shift());
                            defaultValues.push(defaultValues.shift());

                            /* Replace the existing template for the hook's root property. */
                            CSS.Hooks.templates[rootProperty] = [ hookNames.join(" "), defaultValues.join(" ") ];
                        }
                    }
                }

                /* Hook registration. */
                for (rootProperty in CSS.Hooks.templates) {
                    hookTemplate = CSS.Hooks.templates[rootProperty];
                    hookNames = hookTemplate[0].split(" ");

                    for (var i in hookNames) {
                        var fullHookName = rootProperty + hookNames[i],
                            hookPosition = i;

                        /* For each hook, register its full name (e.g. textShadowBlur) with its root property (e.g. textShadow)
                           and the hook's position in its template's default value string. */
                        CSS.Hooks.registered[fullHookName] = [ rootProperty, hookPosition ];
                    }
                }
            },

            /*****************************
               Injection and Extraction
            *****************************/

            /* Look up the root property associated with the hook (e.g. return "textShadow" for "textShadowBlur"). */
            /* Since a hook cannot be set directly (the browser won't recognize it), style updating for hooks is routed through the hook's root property. */
            getRoot: function (property) {
                var hookData = CSS.Hooks.registered[property];

                if (hookData) {
                    return hookData[0];
                } else {
                    /* If there was no hook match, return the property name untouched. */
                    return property;
                }
            },
            /* Convert any rootPropertyValue, null or otherwise, into a space-delimited list of hook values so that
               the targeted hook can be injected or extracted at its standard position. */
            cleanRootPropertyValue: function(rootProperty, rootPropertyValue) {
                /* If the rootPropertyValue is wrapped with "rgb()", "clip()", etc., remove the wrapping to normalize the value before manipulation. */
                if (CSS.RegEx.valueUnwrap.test(rootPropertyValue)) {
                    rootPropertyValue = rootPropertyValue.match(CSS.RegEx.valueUnwrap)[1];
                }

                /* If rootPropertyValue is a CSS null-value (from which there's inherently no hook value to extract),
                   default to the root's default value as defined in CSS.Hooks.templates. */
                /* Note: CSS null-values include "none", "auto", and "transparent". They must be converted into their
                   zero-values (e.g. textShadow: "none" ==> textShadow: "0px 0px 0px black") for hook manipulation to proceed. */
                if (CSS.Values.isCSSNullValue(rootPropertyValue)) {
                    rootPropertyValue = CSS.Hooks.templates[rootProperty][1];
                }

                return rootPropertyValue;
            },
            /* Extracted the hook's value from its root property's value. This is used to get the starting value of an animating hook. */
            extractValue: function (fullHookName, rootPropertyValue) {
                var hookData = CSS.Hooks.registered[fullHookName];

                if (hookData) {
                    var hookRoot = hookData[0],
                        hookPosition = hookData[1];

                    rootPropertyValue = CSS.Hooks.cleanRootPropertyValue(hookRoot, rootPropertyValue);

                    /* Split rootPropertyValue into its constituent hook values then grab the desired hook at its standard position. */
                    return rootPropertyValue.toString().match(CSS.RegEx.valueSplit)[hookPosition];
                } else {
                    /* If the provided fullHookName isn't a registered hook, return the rootPropertyValue that was passed in. */
                    return rootPropertyValue;
                }
            },
            /* Inject the hook's value into its root property's value. This is used to piece back together the root property
               once Velocity has updated one of its individually hooked values through tweening. */
            injectValue: function (fullHookName, hookValue, rootPropertyValue) {
                var hookData = CSS.Hooks.registered[fullHookName];

                if (hookData) {
                    var hookRoot = hookData[0],
                        hookPosition = hookData[1],
                        rootPropertyValueParts,
                        rootPropertyValueUpdated;

                    rootPropertyValue = CSS.Hooks.cleanRootPropertyValue(hookRoot, rootPropertyValue);

                    /* Split rootPropertyValue into its individual hook values, replace the targeted value with hookValue,
                       then reconstruct the rootPropertyValue string. */
                    rootPropertyValueParts = rootPropertyValue.toString().match(CSS.RegEx.valueSplit);
                    rootPropertyValueParts[hookPosition] = hookValue;
                    rootPropertyValueUpdated = rootPropertyValueParts.join(" ");

                    return rootPropertyValueUpdated;
                } else {
                    /* If the provided fullHookName isn't a registered hook, return the rootPropertyValue that was passed in. */
                    return rootPropertyValue;
                }
            }
        },

        /*******************
           Normalizations
        *******************/

        /* Normalizations standardize CSS property manipulation by pollyfilling browser-specific implementations (e.g. opacity)
           and reformatting special properties (e.g. clip, rgba) to look like standard ones. */
        Normalizations: {
            /* Normalizations are passed a normalization target (either the property's name, its extracted value, or its injected value),
               the targeted element (which may need to be queried), and the targeted property value. */
            registered: {
                clip: function (type, element, propertyValue) {
                    switch (type) {
                        case "name":
                            return "clip";
                        /* Clip needs to be unwrapped and stripped of its commas during extraction. */
                        case "extract":
                            var extracted;

                            /* If Velocity also extracted this value, skip extraction. */
                            if (CSS.RegEx.wrappedValueAlreadyExtracted.test(propertyValue)) {
                                extracted = propertyValue;
                            } else {
                                /* Remove the "rect()" wrapper. */
                                extracted = propertyValue.toString().match(CSS.RegEx.valueUnwrap);

                                /* Strip off commas. */
                                extracted = extracted ? extracted[1].replace(/,(\s+)?/g, " ") : propertyValue;
                            }

                            return extracted;
                        /* Clip needs to be re-wrapped during injection. */
                        case "inject":
                            return "rect(" + propertyValue + ")";
                    }
                },

                blur: function(type, element, propertyValue) {
                    switch (type) {
                        case "name":
                            return Velocity.State.isFirefox ? "filter" : "-webkit-filter";
                        case "extract":
                            var extracted = parseFloat(propertyValue);

                            /* If extracted is NaN, meaning the value isn't already extracted. */
                            if (!(extracted || extracted === 0)) {
                                var blurComponent = propertyValue.toString().match(/blur\(([0-9]+[A-z]+)\)/i);

                                /* If the filter string had a blur component, return just the blur value and unit type. */
                                if (blurComponent) {
                                    extracted = blurComponent[1];
                                /* If the component doesn't exist, default blur to 0. */
                                } else {
                                    extracted = 0;
                                }
                            }

                            return extracted;
                        /* Blur needs to be re-wrapped during injection. */
                        case "inject":
                            /* For the blur effect to be fully de-applied, it needs to be set to "none" instead of 0. */
                            if (!parseFloat(propertyValue)) {
                                return "none";
                            } else {
                                return "blur(" + propertyValue + ")";
                            }
                    }
                },

                /* <=IE8 do not support the standard opacity property. They use filter:alpha(opacity=INT) instead. */
                opacity: function (type, element, propertyValue) {
                    if (IE <= 8) {
                        switch (type) {
                            case "name":
                                return "filter";
                            case "extract":
                                /* <=IE8 return a "filter" value of "alpha(opacity=\d{1,3})".
                                   Extract the value and convert it to a decimal value to match the standard CSS opacity property's formatting. */
                                var extracted = propertyValue.toString().match(/alpha\(opacity=(.*)\)/i);

                                if (extracted) {
                                    /* Convert to decimal value. */
                                    propertyValue = extracted[1] / 100;
                                } else {
                                    /* When extracting opacity, default to 1 since a null value means opacity hasn't been set. */
                                    propertyValue = 1;
                                }

                                return propertyValue;
                            case "inject":
                                /* Opacified elements are required to have their zoom property set to a non-zero value. */
                                element.style.zoom = 1;

                                /* Setting the filter property on elements with certain font property combinations can result in a
                                   highly unappealing ultra-bolding effect. There's no way to remedy this throughout a tween, but dropping the
                                   value altogether (when opacity hits 1) at leasts ensures that the glitch is gone post-tweening. */
                                if (parseFloat(propertyValue) >= 1) {
                                    return "";
                                } else {
                                  /* As per the filter property's spec, convert the decimal value to a whole number and wrap the value. */
                                  return "alpha(opacity=" + parseInt(parseFloat(propertyValue) * 100, 10) + ")";
                                }
                        }
                    /* With all other browsers, normalization is not required; return the same values that were passed in. */
                    } else {
                        switch (type) {
                            case "name":
                                return "opacity";
                            case "extract":
                                return propertyValue;
                            case "inject":
                                return propertyValue;
                        }
                    }
                }
            },

            /*****************************
                Batched Registrations
            *****************************/

            /* Note: Batched normalizations extend the CSS.Normalizations.registered object. */
            register: function () {

                /*****************
                    Transforms
                *****************/

                /* Transforms are the subproperties contained by the CSS "transform" property. Transforms must undergo normalization
                   so that they can be referenced in a properties map by their individual names. */
                /* Note: When transforms are "set", they are actually assigned to a per-element transformCache. When all transform
                   setting is complete complete, CSS.flushTransformCache() must be manually called to flush the values to the DOM.
                   Transform setting is batched in this way to improve performance: the transform style only needs to be updated
                   once when multiple transform subproperties are being animated simultaneously. */
                /* Note: IE9 and Android Gingerbread have support for 2D -- but not 3D -- transforms. Since animating unsupported
                   transform properties results in the browser ignoring the *entire* transform string, we prevent these 3D values
                   from being normalized for these browsers so that tweening skips these properties altogether
                   (since it will ignore them as being unsupported by the browser.) */
                if (!(IE <= 9) && !Velocity.State.isGingerbread) {
                    /* Note: Since the standalone CSS "perspective" property and the CSS transform "perspective" subproperty
                    share the same name, the latter is given a unique token within Velocity: "transformPerspective". */
                    CSS.Lists.transformsBase = CSS.Lists.transformsBase.concat(CSS.Lists.transforms3D);
                }

                for (var i = 0; i < CSS.Lists.transformsBase.length; i++) {
                    /* Wrap the dynamically generated normalization function in a new scope so that transformName's value is
                    paired with its respective function. (Otherwise, all functions would take the final for loop's transformName.) */
                    (function() {
                        var transformName = CSS.Lists.transformsBase[i];

                        CSS.Normalizations.registered[transformName] = function (type, element, propertyValue) {
                            switch (type) {
                                /* The normalized property name is the parent "transform" property -- the property that is actually set in CSS. */
                                case "name":
                                    return "transform";
                                /* Transform values are cached onto a per-element transformCache object. */
                                case "extract":
                                    /* If this transform has yet to be assigned a value, return its null value. */
                                    if (Data(element) === undefined || Data(element).transformCache[transformName] === undefined) {
                                        /* Scale CSS.Lists.transformsBase default to 1 whereas all other transform properties default to 0. */
                                        return /^scale/i.test(transformName) ? 1 : 0;
                                    /* When transform values are set, they are wrapped in parentheses as per the CSS spec.
                                       Thus, when extracting their values (for tween calculations), we strip off the parentheses. */
                                    } else {
                                        return Data(element).transformCache[transformName].replace(/[()]/g, "");
                                    }
                                case "inject":
                                    var invalid = false;

                                    /* If an individual transform property contains an unsupported unit type, the browser ignores the *entire* transform property.
                                       Thus, protect users from themselves by skipping setting for transform values supplied with invalid unit types. */
                                    /* Switch on the base transform type; ignore the axis by removing the last letter from the transform's name. */
                                    switch (transformName.substr(0, transformName.length - 1)) {
                                        /* Whitelist unit types for each transform. */
                                        case "translate":
                                            invalid = !/(%|px|em|rem|vw|vh|\d)$/i.test(propertyValue);
                                            break;
                                        /* Since an axis-free "scale" property is supported as well, a little hack is used here to detect it by chopping off its last letter. */
                                        case "scal":
                                        case "scale":
                                            /* Chrome on Android has a bug in which scaled elements blur if their initial scale
                                               value is below 1 (which can happen with forcefeeding). Thus, we detect a yet-unset scale property
                                               and ensure that its first value is always 1. More info: http://stackoverflow.com/questions/10417890/css3-animations-with-transform-causes-blurred-elements-on-webkit/10417962#10417962 */
                                            if (Velocity.State.isAndroid && Data(element).transformCache[transformName] === undefined && propertyValue < 1) {
                                                propertyValue = 1;
                                            }

                                            invalid = !/(\d)$/i.test(propertyValue);
                                            break;
                                        case "skew":
                                            invalid = !/(deg|\d)$/i.test(propertyValue);
                                            break;
                                        case "rotate":
                                            invalid = !/(deg|\d)$/i.test(propertyValue);
                                            break;
                                    }

                                    if (!invalid) {
                                        /* As per the CSS spec, wrap the value in parentheses. */
                                        Data(element).transformCache[transformName] = "(" + propertyValue + ")";
                                    }

                                    /* Although the value is set on the transformCache object, return the newly-updated value for the calling code to process as normal. */
                                    return Data(element).transformCache[transformName];
                            }
                        };
                    })();
                }

                /*************
                    Colors
                *************/

                /* Since Velocity only animates a single numeric value per property, color animation is achieved by hooking the individual RGBA components of CSS color properties.
                   Accordingly, color values must be normalized (e.g. "#ff0000", "red", and "rgb(255, 0, 0)" ==> "255 0 0 1") so that their components can be injected/extracted by CSS.Hooks logic. */
                for (var i = 0; i < CSS.Lists.colors.length; i++) {
                    /* Wrap the dynamically generated normalization function in a new scope so that colorName's value is paired with its respective function.
                       (Otherwise, all functions would take the final for loop's colorName.) */
                    (function () {
                        var colorName = CSS.Lists.colors[i];

                        /* Note: In IE<=8, which support rgb but not rgba, color properties are reverted to rgb by stripping off the alpha component. */
                        CSS.Normalizations.registered[colorName] = function(type, element, propertyValue) {
                            switch (type) {
                                case "name":
                                    return colorName;
                                /* Convert all color values into the rgb format. (Old IE can return hex values and color names instead of rgb/rgba.) */
                                case "extract":
                                    var extracted;

                                    /* If the color is already in its hookable form (e.g. "255 255 255 1") due to having been previously extracted, skip extraction. */
                                    if (CSS.RegEx.wrappedValueAlreadyExtracted.test(propertyValue)) {
                                        extracted = propertyValue;
                                    } else {
                                        var converted,
                                            colorNames = {
                                                black: "rgb(0, 0, 0)",
                                                blue: "rgb(0, 0, 255)",
                                                gray: "rgb(128, 128, 128)",
                                                green: "rgb(0, 128, 0)",
                                                red: "rgb(255, 0, 0)",
                                                white: "rgb(255, 255, 255)"
                                            };

                                        /* Convert color names to rgb. */
                                        if (/^[A-z]+$/i.test(propertyValue)) {
                                            if (colorNames[propertyValue] !== undefined) {
                                                converted = colorNames[propertyValue]
                                            } else {
                                                /* If an unmatched color name is provided, default to black. */
                                                converted = colorNames.black;
                                            }
                                        /* Convert hex values to rgb. */
                                        } else if (CSS.RegEx.isHex.test(propertyValue)) {
                                            converted = "rgb(" + CSS.Values.hexToRgb(propertyValue).join(" ") + ")";
                                        /* If the provided color doesn't match any of the accepted color formats, default to black. */
                                        } else if (!(/^rgba?\(/i.test(propertyValue))) {
                                            converted = colorNames.black;
                                        }

                                        /* Remove the surrounding "rgb/rgba()" string then replace commas with spaces and strip
                                           repeated spaces (in case the value included spaces to begin with). */
                                        extracted = (converted || propertyValue).toString().match(CSS.RegEx.valueUnwrap)[1].replace(/,(\s+)?/g, " ");
                                    }

                                    /* So long as this isn't <=IE8, add a fourth (alpha) component if it's missing and default it to 1 (visible). */
                                    if (!(IE <= 8) && extracted.split(" ").length === 3) {
                                        extracted += " 1";
                                    }

                                    return extracted;
                                case "inject":
                                    /* If this is IE<=8 and an alpha component exists, strip it off. */
                                    if (IE <= 8) {
                                        if (propertyValue.split(" ").length === 4) {
                                            propertyValue = propertyValue.split(/\s+/).slice(0, 3).join(" ");
                                        }
                                    /* Otherwise, add a fourth (alpha) component if it's missing and default it to 1 (visible). */
                                    } else if (propertyValue.split(" ").length === 3) {
                                        propertyValue += " 1";
                                    }

                                    /* Re-insert the browser-appropriate wrapper("rgb/rgba()"), insert commas, and strip off decimal units
                                       on all values but the fourth (R, G, and B only accept whole numbers). */
                                    return (IE <= 8 ? "rgb" : "rgba") + "(" + propertyValue.replace(/\s+/g, ",").replace(/\.(\d)+(?=,)/g, "") + ")";
                            }
                        };
                    })();
                }
            }
        },

        /************************
           CSS Property Names
        ************************/

        Names: {
            /* Camelcase a property name into its JavaScript notation (e.g. "background-color" ==> "backgroundColor").
               Camelcasing is used to normalize property names between and across calls. */
            camelCase: function (property) {
                return property.replace(/-(\w)/g, function (match, subMatch) {
                    return subMatch.toUpperCase();
                });
            },

            /* For SVG elements, some properties (namely, dimensional ones) are GET/SET via the element's HTML attributes (instead of via CSS styles). */
            SVGAttribute: function (property) {
                var SVGAttributes = "width|height|x|y|cx|cy|r|rx|ry|x1|x2|y1|y2";

                /* Certain browsers require an SVG transform to be applied as an attribute. (Otherwise, application via CSS is preferable due to 3D support.) */
                if (IE || (Velocity.State.isAndroid && !Velocity.State.isChrome)) {
                    SVGAttributes += "|transform";
                }

                return new RegExp("^(" + SVGAttributes + ")$", "i").test(property);
            },

            /* Determine whether a property should be set with a vendor prefix. */
            /* If a prefixed version of the property exists, return it. Otherwise, return the original property name.
               If the property is not at all supported by the browser, return a false flag. */
            prefixCheck: function (property) {
                /* If this property has already been checked, return the cached value. */
                if (Velocity.State.prefixMatches[property]) {
                    return [ Velocity.State.prefixMatches[property], true ];
                } else {
                    var vendors = [ "", "Webkit", "Moz", "ms", "O" ];

                    for (var i = 0, vendorsLength = vendors.length; i < vendorsLength; i++) {
                        var propertyPrefixed;

                        if (i === 0) {
                            propertyPrefixed = property;
                        } else {
                            /* Capitalize the first letter of the property to conform to JavaScript vendor prefix notation (e.g. webkitFilter). */
                            propertyPrefixed = vendors[i] + property.replace(/^\w/, function(match) { return match.toUpperCase(); });
                        }

                        /* Check if the browser supports this property as prefixed. */
                        if (Type.isString(Velocity.State.prefixElement.style[propertyPrefixed])) {
                            /* Cache the match. */
                            Velocity.State.prefixMatches[property] = propertyPrefixed;

                            return [ propertyPrefixed, true ];
                        }
                    }

                    /* If the browser doesn't support this property in any form, include a false flag so that the caller can decide how to proceed. */
                    return [ property, false ];
                }
            }
        },

        /************************
           CSS Property Values
        ************************/

        Values: {
            /* Hex to RGB conversion. Copyright Tim Down: http://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb */
            hexToRgb: function (hex) {
                var shortformRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i,
                    longformRegex = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i,
                    rgbParts;

                hex = hex.replace(shortformRegex, function (m, r, g, b) {
                    return r + r + g + g + b + b;
                });

                rgbParts = longformRegex.exec(hex);

                return rgbParts ? [ parseInt(rgbParts[1], 16), parseInt(rgbParts[2], 16), parseInt(rgbParts[3], 16) ] : [ 0, 0, 0 ];
            },

            isCSSNullValue: function (value) {
                /* The browser defaults CSS values that have not been set to either 0 or one of several possible null-value strings.
                   Thus, we check for both falsiness and these special strings. */
                /* Null-value checking is performed to default the special strings to 0 (for the sake of tweening) or their hook
                   templates as defined as CSS.Hooks (for the sake of hook injection/extraction). */
                /* Note: Chrome returns "rgba(0, 0, 0, 0)" for an undefined color whereas IE returns "transparent". */
                return (value == 0 || /^(none|auto|transparent|(rgba\(0, ?0, ?0, ?0\)))$/i.test(value));
            },

            /* Retrieve a property's default unit type. Used for assigning a unit type when one is not supplied by the user. */
            getUnitType: function (property) {
                if (/^(rotate|skew)/i.test(property)) {
                    return "deg";
                } else if (/(^(scale|scaleX|scaleY|scaleZ|alpha|flexGrow|flexHeight|zIndex|fontWeight)$)|((opacity|red|green|blue|alpha)$)/i.test(property)) {
                    /* The above properties are unitless. */
                    return "";
                } else {
                    /* Default to px for all other properties. */
                    return "px";
                }
            },

            /* HTML elements default to an associated display type when they're not set to display:none. */
            /* Note: This function is used for correctly setting the non-"none" display value in certain Velocity redirects, such as fadeIn/Out. */
            getDisplayType: function (element) {
                var tagName = element && element.tagName.toString().toLowerCase();

                if (/^(b|big|i|small|tt|abbr|acronym|cite|code|dfn|em|kbd|strong|samp|var|a|bdo|br|img|map|object|q|script|span|sub|sup|button|input|label|select|textarea)$/i.test(tagName)) {
                    return "inline";
                } else if (/^(li)$/i.test(tagName)) {
                    return "list-item";
                } else if (/^(tr)$/i.test(tagName)) {
                    return "table-row";
                } else if (/^(table)$/i.test(tagName)) {
                    return "table";
                } else if (/^(tbody)$/i.test(tagName)) {
                    return "table-row-group";
                /* Default to "block" when no match is found. */
                } else {
                    return "block";
                }
            },

            /* The class add/remove functions are used to temporarily apply a "velocity-animating" class to elements while they're animating. */
            addClass: function (element, className) {
                if (element.classList) {
                    element.classList.add(className);
                } else {
                    element.className += (element.className.length ? " " : "") + className;
                }
            },

            removeClass: function (element, className) {
                if (element.classList) {
                    element.classList.remove(className);
                } else {
                    element.className = element.className.toString().replace(new RegExp("(^|\\s)" + className.split(" ").join("|") + "(\\s|$)", "gi"), " ");
                }
            }
        },

        /****************************
           Style Getting & Setting
        ****************************/

        /* The singular getPropertyValue, which routes the logic for all normalizations, hooks, and standard CSS properties. */
        getPropertyValue: function (element, property, rootPropertyValue, forceStyleLookup) {
            /* Get an element's computed property value. */
            /* Note: Retrieving the value of a CSS property cannot simply be performed by checking an element's
               style attribute (which only reflects user-defined values). Instead, the browser must be queried for a property's
               *computed* value. You can read more about getComputedStyle here: https://developer.mozilla.org/en/docs/Web/API/window.getComputedStyle */
            function computePropertyValue (element, property) {
                /* When box-sizing isn't set to border-box, height and width style values are incorrectly computed when an
                   element's scrollbars are visible (which expands the element's dimensions). Thus, we defer to the more accurate
                   offsetHeight/Width property, which includes the total dimensions for interior, border, padding, and scrollbar.
                   We subtract border and padding to get the sum of interior + scrollbar. */
                var computedValue = 0;

                /* IE<=8 doesn't support window.getComputedStyle, thus we defer to jQuery, which has an extensive array
                   of hacks to accurately retrieve IE8 property values. Re-implementing that logic here is not worth bloating the
                   codebase for a dying browser. The performance repercussions of using jQuery here are minimal since
                   Velocity is optimized to rarely (and sometimes never) query the DOM. Further, the $.css() codepath isn't that slow. */
                if (IE <= 8) {
                    computedValue = $.css(element, property); /* GET */
                /* All other browsers support getComputedStyle. The returned live object reference is cached onto its
                   associated element so that it does not need to be refetched upon every GET. */
                } else {
                    /* Browsers do not return height and width values for elements that are set to display:"none". Thus, we temporarily
                       toggle display to the element type's default value. */
                    var toggleDisplay = false;

                    if (/^(width|height)$/.test(property) && CSS.getPropertyValue(element, "display") === 0) {
                        toggleDisplay = true;
                        CSS.setPropertyValue(element, "display", CSS.Values.getDisplayType(element));
                    }

                    function revertDisplay () {
                        if (toggleDisplay) {
                            CSS.setPropertyValue(element, "display", "none");
                        }
                    }

                    if (!forceStyleLookup) {
                        if (property === "height" && CSS.getPropertyValue(element, "boxSizing").toString().toLowerCase() !== "border-box") {
                            var contentBoxHeight = element.offsetHeight - (parseFloat(CSS.getPropertyValue(element, "borderTopWidth")) || 0) - (parseFloat(CSS.getPropertyValue(element, "borderBottomWidth")) || 0) - (parseFloat(CSS.getPropertyValue(element, "paddingTop")) || 0) - (parseFloat(CSS.getPropertyValue(element, "paddingBottom")) || 0);
                            revertDisplay();

                            return contentBoxHeight;
                        } else if (property === "width" && CSS.getPropertyValue(element, "boxSizing").toString().toLowerCase() !== "border-box") {
                            var contentBoxWidth = element.offsetWidth - (parseFloat(CSS.getPropertyValue(element, "borderLeftWidth")) || 0) - (parseFloat(CSS.getPropertyValue(element, "borderRightWidth")) || 0) - (parseFloat(CSS.getPropertyValue(element, "paddingLeft")) || 0) - (parseFloat(CSS.getPropertyValue(element, "paddingRight")) || 0);
                            revertDisplay();

                            return contentBoxWidth;
                        }
                    }

                    var computedStyle;

                    /* For elements that Velocity hasn't been called on directly (e.g. when Velocity queries the DOM on behalf
                       of a parent of an element its animating), perform a direct getComputedStyle lookup since the object isn't cached. */
                    if (Data(element) === undefined) {
                        computedStyle = window.getComputedStyle(element, null); /* GET */
                    /* If the computedStyle object has yet to be cached, do so now. */
                    } else if (!Data(element).computedStyle) {
                        computedStyle = Data(element).computedStyle = window.getComputedStyle(element, null); /* GET */
                    /* If computedStyle is cached, use it. */
                    } else {
                        computedStyle = Data(element).computedStyle;
                    }

                    /* IE and Firefox do not return a value for the generic borderColor -- they only return individual values for each border side's color.
                       Also, in all browsers, when border colors aren't all the same, a compound value is returned that Velocity isn't setup to parse.
                       So, as a polyfill for querying individual border side colors, we just return the top border's color and animate all borders from that value. */
                    if (property === "borderColor") {
                        property = "borderTopColor";
                    }

                    /* IE9 has a bug in which the "filter" property must be accessed from computedStyle using the getPropertyValue method
                       instead of a direct property lookup. The getPropertyValue method is slower than a direct lookup, which is why we avoid it by default. */
                    if (IE === 9 && property === "filter") {
                        computedValue = computedStyle.getPropertyValue(property); /* GET */
                    } else {
                        computedValue = computedStyle[property];
                    }

                    /* Fall back to the property's style value (if defined) when computedValue returns nothing,
                       which can happen when the element hasn't been painted. */
                    if (computedValue === "" || computedValue === null) {
                        computedValue = element.style[property];
                    }

                    revertDisplay();
                }

                /* For top, right, bottom, and left (TRBL) values that are set to "auto" on elements of "fixed" or "absolute" position,
                   defer to jQuery for converting "auto" to a numeric value. (For elements with a "static" or "relative" position, "auto" has the same
                   effect as being set to 0, so no conversion is necessary.) */
                /* An example of why numeric conversion is necessary: When an element with "position:absolute" has an untouched "left"
                   property, which reverts to "auto", left's value is 0 relative to its parent element, but is often non-zero relative
                   to its *containing* (not parent) element, which is the nearest "position:relative" ancestor or the viewport (and always the viewport in the case of "position:fixed"). */
                if (computedValue === "auto" && /^(top|right|bottom|left)$/i.test(property)) {
                    var position = computePropertyValue(element, "position"); /* GET */

                    /* For absolute positioning, jQuery's $.position() only returns values for top and left;
                       right and bottom will have their "auto" value reverted to 0. */
                    /* Note: A jQuery object must be created here since jQuery doesn't have a low-level alias for $.position().
                       Not a big deal since we're currently in a GET batch anyway. */
                    if (position === "fixed" || (position === "absolute" && /top|left/i.test(property))) {
                        /* Note: jQuery strips the pixel unit from its returned values; we re-add it here to conform with computePropertyValue's behavior. */
                        computedValue = $(element).position()[property] + "px"; /* GET */
                    }
                }

                return computedValue;
            }

            var propertyValue;

            /* If this is a hooked property (e.g. "clipLeft" instead of the root property of "clip"),
               extract the hook's value from a normalized rootPropertyValue using CSS.Hooks.extractValue(). */
            if (CSS.Hooks.registered[property]) {
                var hook = property,
                    hookRoot = CSS.Hooks.getRoot(hook);

                /* If a cached rootPropertyValue wasn't passed in (which Velocity always attempts to do in order to avoid requerying the DOM),
                   query the DOM for the root property's value. */
                if (rootPropertyValue === undefined) {
                    /* Since the browser is now being directly queried, use the official post-prefixing property name for this lookup. */
                    rootPropertyValue = CSS.getPropertyValue(element, CSS.Names.prefixCheck(hookRoot)[0]); /* GET */
                }

                /* If this root has a normalization registered, peform the associated normalization extraction. */
                if (CSS.Normalizations.registered[hookRoot]) {
                    rootPropertyValue = CSS.Normalizations.registered[hookRoot]("extract", element, rootPropertyValue);
                }

                /* Extract the hook's value. */
                propertyValue = CSS.Hooks.extractValue(hook, rootPropertyValue);

            /* If this is a normalized property (e.g. "opacity" becomes "filter" in <=IE8) or "translateX" becomes "transform"),
               normalize the property's name and value, and handle the special case of transforms. */
            /* Note: Normalizing a property is mutually exclusive from hooking a property since hook-extracted values are strictly
               numerical and therefore do not require normalization extraction. */
            } else if (CSS.Normalizations.registered[property]) {
                var normalizedPropertyName,
                    normalizedPropertyValue;

                normalizedPropertyName = CSS.Normalizations.registered[property]("name", element);

                /* Transform values are calculated via normalization extraction (see below), which checks against the element's transformCache.
                   At no point do transform GETs ever actually query the DOM; initial stylesheet values are never processed.
                   This is because parsing 3D transform matrices is not always accurate and would bloat our codebase;
                   thus, normalization extraction defaults initial transform values to their zero-values (e.g. 1 for scaleX and 0 for translateX). */
                if (normalizedPropertyName !== "transform") {
                    normalizedPropertyValue = computePropertyValue(element, CSS.Names.prefixCheck(normalizedPropertyName)[0]); /* GET */

                    /* If the value is a CSS null-value and this property has a hook template, use that zero-value template so that hooks can be extracted from it. */
                    if (CSS.Values.isCSSNullValue(normalizedPropertyValue) && CSS.Hooks.templates[property]) {
                        normalizedPropertyValue = CSS.Hooks.templates[property][1];
                    }
                }

                propertyValue = CSS.Normalizations.registered[property]("extract", element, normalizedPropertyValue);
            }

            /* If a (numeric) value wasn't produced via hook extraction or normalization, query the DOM. */
            if (!/^[\d-]/.test(propertyValue)) {
                /* For SVG elements, dimensional properties (which SVGAttribute() detects) are tweened via
                   their HTML attribute values instead of their CSS style values. */
                if (Data(element) && Data(element).isSVG && CSS.Names.SVGAttribute(property)) {
                    /* Since the height/width attribute values must be set manually, they don't reflect computed values.
                       Thus, we use use getBBox() to ensure we always get values for elements with undefined height/width attributes. */
                    if (/^(height|width)$/i.test(property)) {
                        /* Firefox throws an error if .getBBox() is called on an SVG that isn't attached to the DOM. */
                        try {
                            propertyValue = element.getBBox()[property];
                        } catch (error) {
                            propertyValue = 0;
                        }
                    /* Otherwise, access the attribute value directly. */
                    } else {
                        propertyValue = element.getAttribute(property);
                    }
                } else {
                    propertyValue = computePropertyValue(element, CSS.Names.prefixCheck(property)[0]); /* GET */
                }
            }

            /* Since property lookups are for animation purposes (which entails computing the numeric delta between start and end values),
               convert CSS null-values to an integer of value 0. */
            if (CSS.Values.isCSSNullValue(propertyValue)) {
                propertyValue = 0;
            }

            if (Velocity.debug >= 2) console.log("Get " + property + ": " + propertyValue);

            return propertyValue;
        },

        /* The singular setPropertyValue, which routes the logic for all normalizations, hooks, and standard CSS properties. */
        setPropertyValue: function(element, property, propertyValue, rootPropertyValue, scrollData) {
            var propertyName = property;

            /* In order to be subjected to call options and element queueing, scroll animation is routed through Velocity as if it were a standard CSS property. */
            if (property === "scroll") {
                /* If a container option is present, scroll the container instead of the browser window. */
                if (scrollData.container) {
                    scrollData.container["scroll" + scrollData.direction] = propertyValue;
                /* Otherwise, Velocity defaults to scrolling the browser window. */
                } else {
                    if (scrollData.direction === "Left") {
                        window.scrollTo(propertyValue, scrollData.alternateValue);
                    } else {
                        window.scrollTo(scrollData.alternateValue, propertyValue);
                    }
                }
            } else {
                /* Transforms (translateX, rotateZ, etc.) are applied to a per-element transformCache object, which is manually flushed via flushTransformCache().
                   Thus, for now, we merely cache transforms being SET. */
                if (CSS.Normalizations.registered[property] && CSS.Normalizations.registered[property]("name", element) === "transform") {
                    /* Perform a normalization injection. */
                    /* Note: The normalization logic handles the transformCache updating. */
                    CSS.Normalizations.registered[property]("inject", element, propertyValue);

                    propertyName = "transform";
                    propertyValue = Data(element).transformCache[property];
                } else {
                    /* Inject hooks. */
                    if (CSS.Hooks.registered[property]) {
                        var hookName = property,
                            hookRoot = CSS.Hooks.getRoot(property);

                        /* If a cached rootPropertyValue was not provided, query the DOM for the hookRoot's current value. */
                        rootPropertyValue = rootPropertyValue || CSS.getPropertyValue(element, hookRoot); /* GET */

                        propertyValue = CSS.Hooks.injectValue(hookName, propertyValue, rootPropertyValue);
                        property = hookRoot;
                    }

                    /* Normalize names and values. */
                    if (CSS.Normalizations.registered[property]) {
                        propertyValue = CSS.Normalizations.registered[property]("inject", element, propertyValue);
                        property = CSS.Normalizations.registered[property]("name", element);
                    }

                    /* Assign the appropriate vendor prefix before performing an official style update. */
                    propertyName = CSS.Names.prefixCheck(property)[0];

                    /* A try/catch is used for IE<=8, which throws an error when "invalid" CSS values are set, e.g. a negative width.
                       Try/catch is avoided for other browsers since it incurs a performance overhead. */
                    if (IE <= 8) {
                        try {
                            element.style[propertyName] = propertyValue;
                        } catch (error) { if (Velocity.debug) console.log("Browser does not support [" + propertyValue + "] for [" + propertyName + "]"); }
                    /* SVG elements have their dimensional properties (width, height, x, y, cx, etc.) applied directly as attributes instead of as styles. */
                    /* Note: IE8 does not support SVG elements, so it's okay that we skip it for SVG animation. */
                    } else if (Data(element) && Data(element).isSVG && CSS.Names.SVGAttribute(property)) {
                        /* Note: For SVG attributes, vendor-prefixed property names are never used. */
                        /* Note: Not all CSS properties can be animated via attributes, but the browser won't throw an error for unsupported properties. */
                        element.setAttribute(property, propertyValue);
                    } else {
                        element.style[propertyName] = propertyValue;
                    }

                    if (Velocity.debug >= 2) console.log("Set " + property + " (" + propertyName + "): " + propertyValue);
                }
            }

            /* Return the normalized property name and value in case the caller wants to know how these values were modified before being applied to the DOM. */
            return [ propertyName, propertyValue ];
        },

        /* To increase performance by batching transform updates into a single SET, transforms are not directly applied to an element until flushTransformCache() is called. */
        /* Note: Velocity applies transform properties in the same order that they are chronogically introduced to the element's CSS styles. */
        flushTransformCache: function(element) {
            var transformString = "";

            /* Certain browsers require that SVG transforms be applied as an attribute. However, the SVG transform attribute takes a modified version of CSS's transform string
               (units are dropped and, except for skewX/Y, subproperties are merged into their master property -- e.g. scaleX and scaleY are merged into scale(X Y). */
            if ((IE || (Velocity.State.isAndroid && !Velocity.State.isChrome)) && Data(element).isSVG) {
                /* Since transform values are stored in their parentheses-wrapped form, we use a helper function to strip out their numeric values.
                   Further, SVG transform properties only take unitless (representing pixels) values, so it's okay that parseFloat() strips the unit suffixed to the float value. */
                function getTransformFloat (transformProperty) {
                    return parseFloat(CSS.getPropertyValue(element, transformProperty));
                }

                /* Create an object to organize all the transforms that we'll apply to the SVG element. To keep the logic simple,
                   we process *all* transform properties -- even those that may not be explicitly applied (since they default to their zero-values anyway). */
                var SVGTransforms = {
                    translate: [ getTransformFloat("translateX"), getTransformFloat("translateY") ],
                    skewX: [ getTransformFloat("skewX") ], skewY: [ getTransformFloat("skewY") ],
                    /* If the scale property is set (non-1), use that value for the scaleX and scaleY values
                       (this behavior mimics the result of animating all these properties at once on HTML elements). */
                    scale: getTransformFloat("scale") !== 1 ? [ getTransformFloat("scale"), getTransformFloat("scale") ] : [ getTransformFloat("scaleX"), getTransformFloat("scaleY") ],
                    /* Note: SVG's rotate transform takes three values: rotation degrees followed by the X and Y values
                       defining the rotation's origin point. We ignore the origin values (default them to 0). */
                    rotate: [ getTransformFloat("rotateZ"), 0, 0 ]
                };

                /* Iterate through the transform properties in the user-defined property map order.
                   (This mimics the behavior of non-SVG transform animation.) */
                $.each(Data(element).transformCache, function(transformName) {
                    /* Except for with skewX/Y, revert the axis-specific transform subproperties to their axis-free master
                       properties so that they match up with SVG's accepted transform properties. */
                    if (/^translate/i.test(transformName)) {
                        transformName = "translate";
                    } else if (/^scale/i.test(transformName)) {
                        transformName = "scale";
                    } else if (/^rotate/i.test(transformName)) {
                        transformName = "rotate";
                    }

                    /* Check that we haven't yet deleted the property from the SVGTransforms container. */
                    if (SVGTransforms[transformName]) {
                        /* Append the transform property in the SVG-supported transform format. As per the spec, surround the space-delimited values in parentheses. */
                        transformString += transformName + "(" + SVGTransforms[transformName].join(" ") + ")" + " ";

                        /* After processing an SVG transform property, delete it from the SVGTransforms container so we don't
                           re-insert the same master property if we encounter another one of its axis-specific properties. */
                        delete SVGTransforms[transformName];
                    }
                });
            } else {
                var transformValue,
                    perspective;

                /* Transform properties are stored as members of the transformCache object. Concatenate all the members into a string. */
                $.each(Data(element).transformCache, function(transformName) {
                    transformValue = Data(element).transformCache[transformName];

                    /* Transform's perspective subproperty must be set first in order to take effect. Store it temporarily. */
                    if (transformName === "transformPerspective") {
                        perspective = transformValue;
                        return true;
                    }

                    /* IE9 only supports one rotation type, rotateZ, which it refers to as "rotate". */
                    if (IE === 9 && transformName === "rotateZ") {
                        transformName = "rotate";
                    }

                    transformString += transformName + transformValue + " ";
                });

                /* If present, set the perspective subproperty first. */
                if (perspective) {
                    transformString = "perspective" + perspective + " " + transformString;
                }
            }

            CSS.setPropertyValue(element, "transform", transformString);
        }
    };

    /* Register hooks and normalizations. */
    CSS.Hooks.register();
    CSS.Normalizations.register();

    /* Allow hook setting in the same fashion as jQuery's $.css(). */
    Velocity.hook = function (elements, arg2, arg3) {
        var value = undefined;

        elements = sanitizeElements(elements);

        $.each(elements, function(i, element) {
            /* Initialize Velocity's per-element data cache if this element hasn't previously been animated. */
            if (Data(element) === undefined) {
                Velocity.init(element);
            }

            /* Get property value. If an element set was passed in, only return the value for the first element. */
            if (arg3 === undefined) {
                if (value === undefined) {
                    value = Velocity.CSS.getPropertyValue(element, arg2);
                }
            /* Set property value. */
            } else {
                /* sPV returns an array of the normalized propertyName/propertyValue pair used to update the DOM. */
                var adjustedSet = Velocity.CSS.setPropertyValue(element, arg2, arg3);

                /* Transform properties don't automatically set. They have to be flushed to the DOM. */
                if (adjustedSet[0] === "transform") {
                    Velocity.CSS.flushTransformCache(element);
                }

                value = adjustedSet;
            }
        });

        return value;
    };

    /*****************
        Animation
    *****************/

    var animate = function() {

        /******************
            Call Chain
        ******************/

        /* Logic for determining what to return to the call stack when exiting out of Velocity. */
        function getChain () {
            /* If we are using the utility function, attempt to return this call's promise. If no promise library was detected,
               default to null instead of returning the targeted elements so that utility function's return value is standardized. */
            if (isUtility) {
                return promiseData.promise || null;
            /* Otherwise, if we're using $.fn, return the jQuery-/Zepto-wrapped element set. */
            } else {
                return elementsWrapped;
            }
        }

        /*************************
           Arguments Assignment
        *************************/

        /* To allow for expressive CoffeeScript code, Velocity supports an alternative syntax in which "elements" (or "e"), "properties" (or "p"), and "options" (or "o")
           objects are defined on a container object that's passed in as Velocity's sole argument. */
        /* Note: Some browsers automatically populate arguments with a "properties" object. We detect it by checking for its default "names" property. */
        var syntacticSugar = (arguments[0] && (arguments[0].p || (($.isPlainObject(arguments[0].properties) && !arguments[0].properties.names) || Type.isString(arguments[0].properties)))),
            /* Whether Velocity was called via the utility function (as opposed to on a jQuery/Zepto object). */
            isUtility,
            /* When Velocity is called via the utility function ($.Velocity()/Velocity()), elements are explicitly
               passed in as the first parameter. Thus, argument positioning varies. We normalize them here. */
            elementsWrapped,
            argumentIndex;

        var elements,
            propertiesMap,
            options;

        /* Detect jQuery/Zepto elements being animated via the $.fn method. */
        if (Type.isWrapped(this)) {
            isUtility = false;

            argumentIndex = 0;
            elements = this;
            elementsWrapped = this;
        /* Otherwise, raw elements are being animated via the utility function. */
        } else {
            isUtility = true;

            argumentIndex = 1;
            elements = syntacticSugar ? (arguments[0].elements || arguments[0].e) : arguments[0];
        }

        elements = sanitizeElements(elements);

        if (!elements) {
            return;
        }

        if (syntacticSugar) {
            propertiesMap = arguments[0].properties || arguments[0].p;
            options = arguments[0].options || arguments[0].o;
        } else {
            propertiesMap = arguments[argumentIndex];
            options = arguments[argumentIndex + 1];
        }

        /* The length of the element set (in the form of a nodeList or an array of elements) is defaulted to 1 in case a
           single raw DOM element is passed in (which doesn't contain a length property). */
        var elementsLength = elements.length,
            elementsIndex = 0;

        /***************************
            Argument Overloading
        ***************************/

        /* Support is included for jQuery's argument overloading: $.animate(propertyMap [, duration] [, easing] [, complete]).
           Overloading is detected by checking for the absence of an object being passed into options. */
        /* Note: The stop and finish actions do not accept animation options, and are therefore excluded from this check. */
        if (!/^(stop|finish)$/i.test(propertiesMap) && !$.isPlainObject(options)) {
            /* The utility function shifts all arguments one position to the right, so we adjust for that offset. */
            var startingArgumentPosition = argumentIndex + 1;

            options = {};

            /* Iterate through all options arguments */
            for (var i = startingArgumentPosition; i < arguments.length; i++) {
                /* Treat a number as a duration. Parse it out. */
                /* Note: The following RegEx will return true if passed an array with a number as its first item.
                   Thus, arrays are skipped from this check. */
                if (!Type.isArray(arguments[i]) && (/^(fast|normal|slow)$/i.test(arguments[i]) || /^\d/.test(arguments[i]))) {
                    options.duration = arguments[i];
                /* Treat strings and arrays as easings. */
                } else if (Type.isString(arguments[i]) || Type.isArray(arguments[i])) {
                    options.easing = arguments[i];
                /* Treat a function as a complete callback. */
                } else if (Type.isFunction(arguments[i])) {
                    options.complete = arguments[i];
                }
            }
        }

        /***************
            Promises
        ***************/

        var promiseData = {
                promise: null,
                resolver: null,
                rejecter: null
            };

        /* If this call was made via the utility function (which is the default method of invocation when jQuery/Zepto are not being used), and if
           promise support was detected, create a promise object for this call and store references to its resolver and rejecter methods. The resolve
           method is used when a call completes naturally or is prematurely stopped by the user. In both cases, completeCall() handles the associated
           call cleanup and promise resolving logic. The reject method is used when an invalid set of arguments is passed into a Velocity call. */
        /* Note: Velocity employs a call-based queueing architecture, which means that stopping an animating element actually stops the full call that
           triggered it -- not that one element exclusively. Similarly, there is one promise per call, and all elements targeted by a Velocity call are
           grouped together for the purposes of resolving and rejecting a promise. */
        if (isUtility && Velocity.Promise) {
            promiseData.promise = new Velocity.Promise(function (resolve, reject) {
                promiseData.resolver = resolve;
                promiseData.rejecter = reject;
            });
        }

        /*********************
           Action Detection
        *********************/

        /* Velocity's behavior is categorized into "actions": Elements can either be specially scrolled into view,
           or they can be started, stopped, or reversed. If a literal or referenced properties map is passed in as Velocity's
           first argument, the associated action is "start". Alternatively, "scroll", "reverse", or "stop" can be passed in instead of a properties map. */
        var action;

        switch (propertiesMap) {
            case "scroll":
                action = "scroll";
                break;

            case "reverse":
                action = "reverse";
                break;

            case "finish":
            case "stop":
                /*******************
                    Action: Stop
                *******************/

                /* Clear the currently-active delay on each targeted element. */
                $.each(elements, function(i, element) {
                    if (Data(element) && Data(element).delayTimer) {
                        /* Stop the timer from triggering its cached next() function. */
                        clearTimeout(Data(element).delayTimer.setTimeout);

                        /* Manually call the next() function so that the subsequent queue items can progress. */
                        if (Data(element).delayTimer.next) {
                            Data(element).delayTimer.next();
                        }

                        delete Data(element).delayTimer;
                    }
                });

                var callsToStop = [];

                /* When the stop action is triggered, the elements' currently active call is immediately stopped. The active call might have
                   been applied to multiple elements, in which case all of the call's elements will be stopped. When an element
                   is stopped, the next item in its animation queue is immediately triggered. */
                /* An additional argument may be passed in to clear an element's remaining queued calls. Either true (which defaults to the "fx" queue)
                   or a custom queue string can be passed in. */
                /* Note: The stop command runs prior to Velocity's Queueing phase since its behavior is intended to take effect *immediately*,
                   regardless of the element's current queue state. */

                /* Iterate through every active call. */
                $.each(Velocity.State.calls, function(i, activeCall) {
                    /* Inactive calls are set to false by the logic inside completeCall(). Skip them. */
                    if (activeCall) {
                        /* Iterate through the active call's targeted elements. */
                        $.each(activeCall[1], function(k, activeElement) {
                            /* If true was passed in as a secondary argument, clear absolutely all calls on this element. Otherwise, only
                               clear calls associated with the relevant queue. */
                            /* Call stopping logic works as follows:
                               - options === true --> stop current default queue calls (and queue:false calls), including remaining queued ones.
                               - options === undefined --> stop current queue:"" call and all queue:false calls.
                               - options === false --> stop only queue:false calls.
                               - options === "custom" --> stop current queue:"custom" call, including remaining queued ones (there is no functionality to only clear the currently-running queue:"custom" call). */
                            var queueName = (options === undefined) ? "" : options;

                            if (queueName !== true && (activeCall[2].queue !== queueName) && !(options === undefined && activeCall[2].queue === false)) {
                                return true;
                            }

                            /* Iterate through the calls targeted by the stop command. */
                            $.each(elements, function(l, element) {                                
                                /* Check that this call was applied to the target element. */
                                if (element === activeElement) {
                                    /* Optionally clear the remaining queued calls. */
                                    if (options === true || Type.isString(options)) {
                                        /* Iterate through the items in the element's queue. */
                                        $.each($.queue(element, Type.isString(options) ? options : ""), function(_, item) {
                                            /* The queue array can contain an "inprogress" string, which we skip. */
                                            if (Type.isFunction(item)) {
                                                /* Pass the item's callback a flag indicating that we want to abort from the queue call.
                                                   (Specifically, the queue will resolve the call's associated promise then abort.)  */
                                                item(null, true);
                                            }
                                        });

                                        /* Clearing the $.queue() array is achieved by resetting it to []. */
                                        $.queue(element, Type.isString(options) ? options : "", []);
                                    }

                                    if (propertiesMap === "stop") {
                                        /* Since "reverse" uses cached start values (the previous call's endValues), these values must be
                                           changed to reflect the final value that the elements were actually tweened to. */
                                        /* Note: If only queue:false animations are currently running on an element, it won't have a tweensContainer
                                           object. Also, queue:false animations can't be reversed. */
                                        if (Data(element) && Data(element).tweensContainer && queueName !== false) {
                                            $.each(Data(element).tweensContainer, function(m, activeTween) {
                                                activeTween.endValue = activeTween.currentValue;
                                            });
                                        }

                                        callsToStop.push(i);
                                    } else if (propertiesMap === "finish") {
                                        /* To get active tweens to finish immediately, we forcefully shorten their durations to 1ms so that
                                        they finish upon the next rAf tick then proceed with normal call completion logic. */
                                        activeCall[2].duration = 1;
                                    }
                                }
                            });
                        });
                    }
                });

                /* Prematurely call completeCall() on each matched active call. Pass an additional flag for "stop" to indicate
                   that the complete callback and display:none setting should be skipped since we're completing prematurely. */
                if (propertiesMap === "stop") {
                    $.each(callsToStop, function(i, j) {
                        completeCall(j, true);
                    });

                    if (promiseData.promise) {
                        /* Immediately resolve the promise associated with this stop call since stop runs synchronously. */
                        promiseData.resolver(elements);
                    }
                }

                /* Since we're stopping, and not proceeding with queueing, exit out of Velocity. */
                return getChain();

            default:
                /* Treat a non-empty plain object as a literal properties map. */
                if ($.isPlainObject(propertiesMap) && !Type.isEmptyObject(propertiesMap)) {
                    action = "start";

                /****************
                    Redirects
                ****************/

                /* Check if a string matches a registered redirect (see Redirects above). */
                } else if (Type.isString(propertiesMap) && Velocity.Redirects[propertiesMap]) {
                    var opts = $.extend({}, options),
                        durationOriginal = opts.duration,
                        delayOriginal = opts.delay || 0;

                    /* If the backwards option was passed in, reverse the element set so that elements animate from the last to the first. */
                    if (opts.backwards === true) {
                        elements = $.extend(true, [], elements).reverse();
                    }

                    /* Individually trigger the redirect for each element in the set to prevent users from having to handle iteration logic in their redirect. */
                    $.each(elements, function(elementIndex, element) {
                        /* If the stagger option was passed in, successively delay each element by the stagger value (in ms). Retain the original delay value. */
                        if (parseFloat(opts.stagger)) {
                            opts.delay = delayOriginal + (parseFloat(opts.stagger) * elementIndex);
                        } else if (Type.isFunction(opts.stagger)) {
                            opts.delay = delayOriginal + opts.stagger.call(element, elementIndex, elementsLength);
                        }

                        /* If the drag option was passed in, successively increase/decrease (depending on the presense of opts.backwards)
                           the duration of each element's animation, using floors to prevent producing very short durations. */
                        if (opts.drag) {
                            /* Default the duration of UI pack effects (callouts and transitions) to 1000ms instead of the usual default duration of 400ms. */
                            opts.duration = parseFloat(durationOriginal) || (/^(callout|transition)/.test(propertiesMap) ? 1000 : DURATION_DEFAULT);

                            /* For each element, take the greater duration of: A) animation completion percentage relative to the original duration,
                               B) 75% of the original duration, or C) a 200ms fallback (in case duration is already set to a low value).
                               The end result is a baseline of 75% of the redirect's duration that increases/decreases as the end of the element set is approached. */
                            opts.duration = Math.max(opts.duration * (opts.backwards ? 1 - elementIndex/elementsLength : (elementIndex + 1) / elementsLength), opts.duration * 0.75, 200);
                        }

                        /* Pass in the call's opts object so that the redirect can optionally extend it. It defaults to an empty object instead of null to
                           reduce the opts checking logic required inside the redirect. */
                        Velocity.Redirects[propertiesMap].call(element, element, opts || {}, elementIndex, elementsLength, elements, promiseData.promise ? promiseData : undefined);
                    });

                    /* Since the animation logic resides within the redirect's own code, abort the remainder of this call.
                       (The performance overhead up to this point is virtually non-existant.) */
                    /* Note: The jQuery call chain is kept intact by returning the complete element set. */
                    return getChain();
                } else {
                    var abortError = "Velocity: First argument (" + propertiesMap + ") was not a property map, a known action, or a registered redirect. Aborting.";

                    if (promiseData.promise) {
                        promiseData.rejecter(new Error(abortError));
                    } else {
                        console.log(abortError);
                    }

                    return getChain();
                }
        }

        /**************************
            Call-Wide Variables
        **************************/

        /* A container for CSS unit conversion ratios (e.g. %, rem, and em ==> px) that is used to cache ratios across all elements
           being animated in a single Velocity call. Calculating unit ratios necessitates DOM querying and updating, and is therefore
           avoided (via caching) wherever possible. This container is call-wide instead of page-wide to avoid the risk of using stale
           conversion metrics across Velocity animations that are not immediately consecutively chained. */
        var callUnitConversionData = {
                lastParent: null,
                lastPosition: null,
                lastFontSize: null,
                lastPercentToPxWidth: null,
                lastPercentToPxHeight: null,
                lastEmToPx: null,
                remToPx: null,
                vwToPx: null,
                vhToPx: null
            };

        /* A container for all the ensuing tween data and metadata associated with this call. This container gets pushed to the page-wide
           Velocity.State.calls array that is processed during animation ticking. */
        var call = [];

        /************************
           Element Processing
        ************************/

        /* Element processing consists of three parts -- data processing that cannot go stale and data processing that *can* go stale (i.e. third-party style modifications):
           1) Pre-Queueing: Element-wide variables, including the element's data storage, are instantiated. Call options are prepared. If triggered, the Stop action is executed.
           2) Queueing: The logic that runs once this call has reached its point of execution in the element's $.queue() stack. Most logic is placed here to avoid risking it becoming stale.
           3) Pushing: Consolidation of the tween data followed by its push onto the global in-progress calls container.
        */

        function processElement () {

            /*************************
               Part I: Pre-Queueing
            *************************/

            /***************************
               Element-Wide Variables
            ***************************/

            var element = this,
                /* The runtime opts object is the extension of the current call's options and Velocity's page-wide option defaults. */
                opts = $.extend({}, Velocity.defaults, options),
                /* A container for the processed data associated with each property in the propertyMap.
                   (Each property in the map produces its own "tween".) */
                tweensContainer = {},
                elementUnitConversionData;

            /******************
               Element Init
            ******************/

            if (Data(element) === undefined) {
                Velocity.init(element);
            }

            /******************
               Option: Delay
            ******************/

            /* Since queue:false doesn't respect the item's existing queue, we avoid injecting its delay here (it's set later on). */
            /* Note: Velocity rolls its own delay function since jQuery doesn't have a utility alias for $.fn.delay()
               (and thus requires jQuery element creation, which we avoid since its overhead includes DOM querying). */
            if (parseFloat(opts.delay) && opts.queue !== false) {
                $.queue(element, opts.queue, function(next) {
                    /* This is a flag used to indicate to the upcoming completeCall() function that this queue entry was initiated by Velocity. See completeCall() for further details. */
                    Velocity.velocityQueueEntryFlag = true;

                    /* The ensuing queue item (which is assigned to the "next" argument that $.queue() automatically passes in) will be triggered after a setTimeout delay.
                       The setTimeout is stored so that it can be subjected to clearTimeout() if this animation is prematurely stopped via Velocity's "stop" command. */
                    Data(element).delayTimer = {
                        setTimeout: setTimeout(next, parseFloat(opts.delay)),
                        next: next
                    };
                });
            }

            /*********************
               Option: Duration
            *********************/

            /* Support for jQuery's named durations. */
            switch (opts.duration.toString().toLowerCase()) {
                case "fast":
                    opts.duration = 200;
                    break;

                case "normal":
                    opts.duration = DURATION_DEFAULT;
                    break;

                case "slow":
                    opts.duration = 600;
                    break;

                default:
                    /* Remove the potential "ms" suffix and default to 1 if the user is attempting to set a duration of 0 (in order to produce an immediate style change). */
                    opts.duration = parseFloat(opts.duration) || 1;
            }

            /************************
               Global Option: Mock
            ************************/

            if (Velocity.mock !== false) {
                /* In mock mode, all animations are forced to 1ms so that they occur immediately upon the next rAF tick.
                   Alternatively, a multiplier can be passed in to time remap all delays and durations. */
                if (Velocity.mock === true) {
                    opts.duration = opts.delay = 1;
                } else {
                    opts.duration *= parseFloat(Velocity.mock) || 1;
                    opts.delay *= parseFloat(Velocity.mock) || 1;
                }
            }

            /*******************
               Option: Easing
            *******************/

            opts.easing = getEasing(opts.easing, opts.duration);

            /**********************
               Option: Callbacks
            **********************/

            /* Callbacks must functions. Otherwise, default to null. */
            if (opts.begin && !Type.isFunction(opts.begin)) {
                opts.begin = null;
            }

            if (opts.progress && !Type.isFunction(opts.progress)) {
                opts.progress = null;
            }

            if (opts.complete && !Type.isFunction(opts.complete)) {
                opts.complete = null;
            }

            /*********************************
               Option: Display & Visibility
            *********************************/

            /* Refer to Velocity's documentation (VelocityJS.org/#displayAndVisibility) for a description of the display and visibility options' behavior. */
            /* Note: We strictly check for undefined instead of falsiness because display accepts an empty string value. */
            if (opts.display !== undefined && opts.display !== null) {
                opts.display = opts.display.toString().toLowerCase();

                /* Users can pass in a special "auto" value to instruct Velocity to set the element to its default display value. */
                if (opts.display === "auto") {
                    opts.display = Velocity.CSS.Values.getDisplayType(element);
                }
            }

            if (opts.visibility !== undefined && opts.visibility !== null) {
                opts.visibility = opts.visibility.toString().toLowerCase();
            }

            /**********************
               Option: mobileHA
            **********************/

            /* When set to true, and if this is a mobile device, mobileHA automatically enables hardware acceleration (via a null transform hack)
               on animating elements. HA is removed from the element at the completion of its animation. */
            /* Note: Android Gingerbread doesn't support HA. If a null transform hack (mobileHA) is in fact set, it will prevent other tranform subproperties from taking effect. */
            /* Note: You can read more about the use of mobileHA in Velocity's documentation: VelocityJS.org/#mobileHA. */
            opts.mobileHA = (opts.mobileHA && Velocity.State.isMobile && !Velocity.State.isGingerbread);

            /***********************
               Part II: Queueing
            ***********************/

            /* When a set of elements is targeted by a Velocity call, the set is broken up and each element has the current Velocity call individually queued onto it.
               In this way, each element's existing queue is respected; some elements may already be animating and accordingly should not have this current Velocity call triggered immediately. */
            /* In each queue, tween data is processed for each animating property then pushed onto the call-wide calls array. When the last element in the set has had its tweens processed,
               the call array is pushed to Velocity.State.calls for live processing by the requestAnimationFrame tick. */
            function buildQueue (next) {

                /*******************
                   Option: Begin
                *******************/

                /* The begin callback is fired once per call -- not once per elemenet -- and is passed the full raw DOM element set as both its context and its first argument. */
                if (opts.begin && elementsIndex === 0) {
                    /* We throw callbacks in a setTimeout so that thrown errors don't halt the execution of Velocity itself. */
                    try {
                        opts.begin.call(elements, elements);
                    } catch (error) {
                        setTimeout(function() { throw error; }, 1);
                    }
                }

                /*****************************************
                   Tween Data Construction (for Scroll)
                *****************************************/

                /* Note: In order to be subjected to chaining and animation options, scroll's tweening is routed through Velocity as if it were a standard CSS property animation. */
                if (action === "scroll") {
                    /* The scroll action uniquely takes an optional "offset" option -- specified in pixels -- that offsets the targeted scroll position. */
                    var scrollDirection = (/^x$/i.test(opts.axis) ? "Left" : "Top"),
                        scrollOffset = parseFloat(opts.offset) || 0,
                        scrollPositionCurrent,
                        scrollPositionCurrentAlternate,
                        scrollPositionEnd;

                    /* Scroll also uniquely takes an optional "container" option, which indicates the parent element that should be scrolled --
                       as opposed to the browser window itself. This is useful for scrolling toward an element that's inside an overflowing parent element. */
                    if (opts.container) {
                        /* Ensure that either a jQuery object or a raw DOM element was passed in. */
                        if (Type.isWrapped(opts.container) || Type.isNode(opts.container)) {
                            /* Extract the raw DOM element from the jQuery wrapper. */
                            opts.container = opts.container[0] || opts.container;
                            /* Note: Unlike other properties in Velocity, the browser's scroll position is never cached since it so frequently changes
                               (due to the user's natural interaction with the page). */
                            scrollPositionCurrent = opts.container["scroll" + scrollDirection]; /* GET */

                            /* $.position() values are relative to the container's currently viewable area (without taking into account the container's true dimensions
                               -- say, for example, if the container was not overflowing). Thus, the scroll end value is the sum of the child element's position *and*
                               the scroll container's current scroll position. */
                            scrollPositionEnd = (scrollPositionCurrent + $(element).position()[scrollDirection.toLowerCase()]) + scrollOffset; /* GET */
                        /* If a value other than a jQuery object or a raw DOM element was passed in, default to null so that this option is ignored. */
                        } else {
                            opts.container = null;
                        }
                    } else {
                        /* If the window itself is being scrolled -- not a containing element -- perform a live scroll position lookup using
                           the appropriate cached property names (which differ based on browser type). */
                        scrollPositionCurrent = Velocity.State.scrollAnchor[Velocity.State["scrollProperty" + scrollDirection]]; /* GET */
                        /* When scrolling the browser window, cache the alternate axis's current value since window.scrollTo() doesn't let us change only one value at a time. */
                        scrollPositionCurrentAlternate = Velocity.State.scrollAnchor[Velocity.State["scrollProperty" + (scrollDirection === "Left" ? "Top" : "Left")]]; /* GET */

                        /* Unlike $.position(), $.offset() values are relative to the browser window's true dimensions -- not merely its currently viewable area --
                           and therefore end values do not need to be compounded onto current values. */
                        scrollPositionEnd = $(element).offset()[scrollDirection.toLowerCase()] + scrollOffset; /* GET */
                    }

                    /* Since there's only one format that scroll's associated tweensContainer can take, we create it manually. */
                    tweensContainer = {
                        scroll: {
                            rootPropertyValue: false,
                            startValue: scrollPositionCurrent,
                            currentValue: scrollPositionCurrent,
                            endValue: scrollPositionEnd,
                            unitType: "",
                            easing: opts.easing,
                            scrollData: {
                                container: opts.container,
                                direction: scrollDirection,
                                alternateValue: scrollPositionCurrentAlternate
                            }
                        },
                        element: element
                    };

                    if (Velocity.debug) console.log("tweensContainer (scroll): ", tweensContainer.scroll, element);

                /******************************************
                   Tween Data Construction (for Reverse)
                ******************************************/

                /* Reverse acts like a "start" action in that a property map is animated toward. The only difference is
                   that the property map used for reverse is the inverse of the map used in the previous call. Thus, we manipulate
                   the previous call to construct our new map: use the previous map's end values as our new map's start values. Copy over all other data. */
                /* Note: Reverse can be directly called via the "reverse" parameter, or it can be indirectly triggered via the loop option. (Loops are composed of multiple reverses.) */
                /* Note: Reverse calls do not need to be consecutively chained onto a currently-animating element in order to operate on cached values;
                   there is no harm to reverse being called on a potentially stale data cache since reverse's behavior is simply defined
                   as reverting to the element's values as they were prior to the previous *Velocity* call. */
                } else if (action === "reverse") {
                    /* Abort if there is no prior animation data to reverse to. */
                    if (!Data(element).tweensContainer) {
                        /* Dequeue the element so that this queue entry releases itself immediately, allowing subsequent queue entries to run. */
                        $.dequeue(element, opts.queue);

                        return;
                    } else {
                        /*********************
                           Options Parsing
                        *********************/

                        /* If the element was hidden via the display option in the previous call,
                           revert display to "auto" prior to reversal so that the element is visible again. */
                        if (Data(element).opts.display === "none") {
                            Data(element).opts.display = "auto";
                        }

                        if (Data(element).opts.visibility === "hidden") {
                            Data(element).opts.visibility = "visible";
                        }

                        /* If the loop option was set in the previous call, disable it so that "reverse" calls aren't recursively generated.
                           Further, remove the previous call's callback options; typically, users do not want these to be refired. */
                        Data(element).opts.loop = false;
                        Data(element).opts.begin = null;
                        Data(element).opts.complete = null;

                        /* Since we're extending an opts object that has already been extended with the defaults options object,
                           we remove non-explicitly-defined properties that are auto-assigned values. */
                        if (!options.easing) {
                            delete opts.easing;
                        }

                        if (!options.duration) {
                            delete opts.duration;
                        }

                        /* The opts object used for reversal is an extension of the options object optionally passed into this
                           reverse call plus the options used in the previous Velocity call. */
                        opts = $.extend({}, Data(element).opts, opts);

                        /*************************************
                           Tweens Container Reconstruction
                        *************************************/

                        /* Create a deepy copy (indicated via the true flag) of the previous call's tweensContainer. */
                        var lastTweensContainer = $.extend(true, {}, Data(element).tweensContainer);

                        /* Manipulate the previous tweensContainer by replacing its end values and currentValues with its start values. */
                        for (var lastTween in lastTweensContainer) {
                            /* In addition to tween data, tweensContainers contain an element property that we ignore here. */
                            if (lastTween !== "element") {
                                var lastStartValue = lastTweensContainer[lastTween].startValue;

                                lastTweensContainer[lastTween].startValue = lastTweensContainer[lastTween].currentValue = lastTweensContainer[lastTween].endValue;
                                lastTweensContainer[lastTween].endValue = lastStartValue;

                                /* Easing is the only option that embeds into the individual tween data (since it can be defined on a per-property basis).
                                   Accordingly, every property's easing value must be updated when an options object is passed in with a reverse call.
                                   The side effect of this extensibility is that all per-property easing values are forcefully reset to the new value. */
                                if (!Type.isEmptyObject(options)) {
                                    lastTweensContainer[lastTween].easing = opts.easing;
                                }

                                if (Velocity.debug) console.log("reverse tweensContainer (" + lastTween + "): " + JSON.stringify(lastTweensContainer[lastTween]), element);
                            }
                        }

                        tweensContainer = lastTweensContainer;
                    }

                /*****************************************
                   Tween Data Construction (for Start)
                *****************************************/

                } else if (action === "start") {

                    /*************************
                        Value Transferring
                    *************************/

                    /* If this queue entry follows a previous Velocity-initiated queue entry *and* if this entry was created
                       while the element was in the process of being animated by Velocity, then this current call is safe to use
                       the end values from the prior call as its start values. Velocity attempts to perform this value transfer
                       process whenever possible in order to avoid requerying the DOM. */
                    /* If values aren't transferred from a prior call and start values were not forcefed by the user (more on this below),
                       then the DOM is queried for the element's current values as a last resort. */
                    /* Note: Conversely, animation reversal (and looping) *always* perform inter-call value transfers; they never requery the DOM. */
                    var lastTweensContainer;

                    /* The per-element isAnimating flag is used to indicate whether it's safe (i.e. the data isn't stale)
                       to transfer over end values to use as start values. If it's set to true and there is a previous
                       Velocity call to pull values from, do so. */
                    if (Data(element).tweensContainer && Data(element).isAnimating === true) {
                        lastTweensContainer = Data(element).tweensContainer;
                    }

                    /***************************
                       Tween Data Calculation
                    ***************************/

                    /* This function parses property data and defaults endValue, easing, and startValue as appropriate. */
                    /* Property map values can either take the form of 1) a single value representing the end value,
                       or 2) an array in the form of [ endValue, [, easing] [, startValue] ].
                       The optional third parameter is a forcefed startValue to be used instead of querying the DOM for
                       the element's current value. Read Velocity's docmentation to learn more about forcefeeding: VelocityJS.org/#forcefeeding */
                    function parsePropertyValue (valueData, skipResolvingEasing) {
                        var endValue = undefined,
                            easing = undefined,
                            startValue = undefined;

                        /* Handle the array format, which can be structured as one of three potential overloads:
                           A) [ endValue, easing, startValue ], B) [ endValue, easing ], or C) [ endValue, startValue ] */
                        if (Type.isArray(valueData)) {
                            /* endValue is always the first item in the array. Don't bother validating endValue's value now
                               since the ensuing property cycling logic does that. */
                            endValue = valueData[0];

                            /* Two-item array format: If the second item is a number, function, or hex string, treat it as a
                               start value since easings can only be non-hex strings or arrays. */
                            if ((!Type.isArray(valueData[1]) && /^[\d-]/.test(valueData[1])) || Type.isFunction(valueData[1]) || CSS.RegEx.isHex.test(valueData[1])) {
                                startValue = valueData[1];
                            /* Two or three-item array: If the second item is a non-hex string or an array, treat it as an easing. */
                            } else if ((Type.isString(valueData[1]) && !CSS.RegEx.isHex.test(valueData[1])) || Type.isArray(valueData[1])) {
                                easing = skipResolvingEasing ? valueData[1] : getEasing(valueData[1], opts.duration);

                                /* Don't bother validating startValue's value now since the ensuing property cycling logic inherently does that. */
                                if (valueData[2] !== undefined) {
                                    startValue = valueData[2];
                                }
                            }
                        /* Handle the single-value format. */
                        } else {
                            endValue = valueData;
                        }

                        /* Default to the call's easing if a per-property easing type was not defined. */
                        if (!skipResolvingEasing) {
                            easing = easing || opts.easing;
                        }

                        /* If functions were passed in as values, pass the function the current element as its context,
                           plus the element's index and the element set's size as arguments. Then, assign the returned value. */
                        if (Type.isFunction(endValue)) {
                            endValue = endValue.call(element, elementsIndex, elementsLength);
                        }

                        if (Type.isFunction(startValue)) {
                            startValue = startValue.call(element, elementsIndex, elementsLength);
                        }

                        /* Allow startValue to be left as undefined to indicate to the ensuing code that its value was not forcefed. */
                        return [ endValue || 0, easing, startValue ];
                    }

                    /* Cycle through each property in the map, looking for shorthand color properties (e.g. "color" as opposed to "colorRed"). Inject the corresponding
                       colorRed, colorGreen, and colorBlue RGB component tweens into the propertiesMap (which Velocity understands) and remove the shorthand property. */
                    $.each(propertiesMap, function(property, value) {
                        /* Find shorthand color properties that have been passed a hex string. */
                        if (RegExp("^" + CSS.Lists.colors.join("$|^") + "$").test(property)) {
                            /* Parse the value data for each shorthand. */
                            var valueData = parsePropertyValue(value, true),
                                endValue = valueData[0],
                                easing = valueData[1],
                                startValue = valueData[2];

                            if (CSS.RegEx.isHex.test(endValue)) {
                                /* Convert the hex strings into their RGB component arrays. */
                                var colorComponents = [ "Red", "Green", "Blue" ],
                                    endValueRGB = CSS.Values.hexToRgb(endValue),
                                    startValueRGB = startValue ? CSS.Values.hexToRgb(startValue) : undefined;

                                /* Inject the RGB component tweens into propertiesMap. */
                                for (var i = 0; i < colorComponents.length; i++) {
                                    var dataArray = [ endValueRGB[i] ];

                                    if (easing) {
                                        dataArray.push(easing);
                                    }

                                    if (startValueRGB !== undefined) {
                                        dataArray.push(startValueRGB[i]);
                                    }

                                    propertiesMap[property + colorComponents[i]] = dataArray;
                                }

                                /* Remove the intermediary shorthand property entry now that we've processed it. */
                                delete propertiesMap[property];
                            }
                        }
                    });

                    /* Create a tween out of each property, and append its associated data to tweensContainer. */
                    for (var property in propertiesMap) {

                        /**************************
                           Start Value Sourcing
                        **************************/

                        /* Parse out endValue, easing, and startValue from the property's data. */
                        var valueData = parsePropertyValue(propertiesMap[property]),
                            endValue = valueData[0],
                            easing = valueData[1],
                            startValue = valueData[2];

                        /* Now that the original property name's format has been used for the parsePropertyValue() lookup above,
                           we force the property to its camelCase styling to normalize it for manipulation. */
                        property = CSS.Names.camelCase(property);

                        /* In case this property is a hook, there are circumstances where we will intend to work on the hook's root property and not the hooked subproperty. */
                        var rootProperty = CSS.Hooks.getRoot(property),
                            rootPropertyValue = false;

                        /* Other than for the dummy tween property, properties that are not supported by the browser (and do not have an associated normalization) will
                           inherently produce no style changes when set, so they are skipped in order to decrease animation tick overhead.
                           Property support is determined via prefixCheck(), which returns a false flag when no supported is detected. */
                        /* Note: Since SVG elements have some of their properties directly applied as HTML attributes,
                           there is no way to check for their explicit browser support, and so we skip skip this check for them. */
                        if (!Data(element).isSVG && rootProperty !== "tween" && CSS.Names.prefixCheck(rootProperty)[1] === false && CSS.Normalizations.registered[rootProperty] === undefined) {
                            if (Velocity.debug) console.log("Skipping [" + rootProperty + "] due to a lack of browser support.");

                            continue;
                        }

                        /* If the display option is being set to a non-"none" (e.g. "block") and opacity (filter on IE<=8) is being
                           animated to an endValue of non-zero, the user's intention is to fade in from invisible, thus we forcefeed opacity
                           a startValue of 0 if its startValue hasn't already been sourced by value transferring or prior forcefeeding. */
                        if (((opts.display !== undefined && opts.display !== null && opts.display !== "none") || (opts.visibility !== undefined && opts.visibility !== "hidden")) && /opacity|filter/.test(property) && !startValue && endValue !== 0) {
                            startValue = 0;
                        }

                        /* If values have been transferred from the previous Velocity call, extract the endValue and rootPropertyValue
                           for all of the current call's properties that were *also* animated in the previous call. */
                        /* Note: Value transferring can optionally be disabled by the user via the _cacheValues option. */
                        if (opts._cacheValues && lastTweensContainer && lastTweensContainer[property]) {
                            if (startValue === undefined) {
                                startValue = lastTweensContainer[property].endValue + lastTweensContainer[property].unitType;
                            }

                            /* The previous call's rootPropertyValue is extracted from the element's data cache since that's the
                               instance of rootPropertyValue that gets freshly updated by the tweening process, whereas the rootPropertyValue
                               attached to the incoming lastTweensContainer is equal to the root property's value prior to any tweening. */
                            rootPropertyValue = Data(element).rootPropertyValueCache[rootProperty];
                        /* If values were not transferred from a previous Velocity call, query the DOM as needed. */
                        } else {
                            /* Handle hooked properties. */
                            if (CSS.Hooks.registered[property]) {
                               if (startValue === undefined) {
                                    rootPropertyValue = CSS.getPropertyValue(element, rootProperty); /* GET */
                                    /* Note: The following getPropertyValue() call does not actually trigger a DOM query;
                                       getPropertyValue() will extract the hook from rootPropertyValue. */
                                    startValue = CSS.getPropertyValue(element, property, rootPropertyValue);
                                /* If startValue is already defined via forcefeeding, do not query the DOM for the root property's value;
                                   just grab rootProperty's zero-value template from CSS.Hooks. This overwrites the element's actual
                                   root property value (if one is set), but this is acceptable since the primary reason users forcefeed is
                                   to avoid DOM queries, and thus we likewise avoid querying the DOM for the root property's value. */
                                } else {
                                    /* Grab this hook's zero-value template, e.g. "0px 0px 0px black". */
                                    rootPropertyValue = CSS.Hooks.templates[rootProperty][1];
                                }
                            /* Handle non-hooked properties that haven't already been defined via forcefeeding. */
                            } else if (startValue === undefined) {
                                startValue = CSS.getPropertyValue(element, property); /* GET */
                            }
                        }

                        /**************************
                           Value Data Extraction
                        **************************/

                        var separatedValue,
                            endValueUnitType,
                            startValueUnitType,
                            operator = false;

                        /* Separates a property value into its numeric value and its unit type. */
                        function separateValue (property, value) {
                            var unitType,
                                numericValue;

                            numericValue = (value || "0")
                                .toString()
                                .toLowerCase()
                                /* Match the unit type at the end of the value. */
                                .replace(/[%A-z]+$/, function(match) {
                                    /* Grab the unit type. */
                                    unitType = match;

                                    /* Strip the unit type off of value. */
                                    return "";
                                });

                            /* If no unit type was supplied, assign one that is appropriate for this property (e.g. "deg" for rotateZ or "px" for width). */
                            if (!unitType) {
                                unitType = CSS.Values.getUnitType(property);
                            }

                            return [ numericValue, unitType ];
                        }

                        /* Separate startValue. */
                        separatedValue = separateValue(property, startValue);
                        startValue = separatedValue[0];
                        startValueUnitType = separatedValue[1];

                        /* Separate endValue, and extract a value operator (e.g. "+=", "-=") if one exists. */
                        separatedValue = separateValue(property, endValue);
                        endValue = separatedValue[0].replace(/^([+-\/*])=/, function(match, subMatch) {
                            operator = subMatch;

                            /* Strip the operator off of the value. */
                            return "";
                        });
                        endValueUnitType = separatedValue[1];

                        /* Parse float values from endValue and startValue. Default to 0 if NaN is returned. */
                        startValue = parseFloat(startValue) || 0;
                        endValue = parseFloat(endValue) || 0;

                        /***************************************
                           Property-Specific Value Conversion
                        ***************************************/

                        /* Custom support for properties that don't actually accept the % unit type, but where pollyfilling is trivial and relatively foolproof. */
                        if (endValueUnitType === "%") {
                            /* A %-value fontSize/lineHeight is relative to the parent's fontSize (as opposed to the parent's dimensions),
                               which is identical to the em unit's behavior, so we piggyback off of that. */
                            if (/^(fontSize|lineHeight)$/.test(property)) {
                                /* Convert % into an em decimal value. */
                                endValue = endValue / 100;
                                endValueUnitType = "em";
                            /* For scaleX and scaleY, convert the value into its decimal format and strip off the unit type. */
                            } else if (/^scale/.test(property)) {
                                endValue = endValue / 100;
                                endValueUnitType = "";
                            /* For RGB components, take the defined percentage of 255 and strip off the unit type. */
                            } else if (/(Red|Green|Blue)$/i.test(property)) {
                                endValue = (endValue / 100) * 255;
                                endValueUnitType = "";
                            }
                        }

                        /***************************
                           Unit Ratio Calculation
                        ***************************/

                        /* When queried, the browser returns (most) CSS property values in pixels. Therefore, if an endValue with a unit type of
                           %, em, or rem is animated toward, startValue must be converted from pixels into the same unit type as endValue in order
                           for value manipulation logic (increment/decrement) to proceed. Further, if the startValue was forcefed or transferred
                           from a previous call, startValue may also not be in pixels. Unit conversion logic therefore consists of two steps:
                           1) Calculating the ratio of %/em/rem/vh/vw relative to pixels
                           2) Converting startValue into the same unit of measurement as endValue based on these ratios. */
                        /* Unit conversion ratios are calculated by inserting a sibling node next to the target node, copying over its position property,
                           setting values with the target unit type then comparing the returned pixel value. */
                        /* Note: Even if only one of these unit types is being animated, all unit ratios are calculated at once since the overhead
                           of batching the SETs and GETs together upfront outweights the potential overhead
                           of layout thrashing caused by re-querying for uncalculated ratios for subsequently-processed properties. */
                        /* Todo: Shift this logic into the calls' first tick instance so that it's synced with RAF. */
                        function calculateUnitRatios () {

                            /************************
                                Same Ratio Checks
                            ************************/

                            /* The properties below are used to determine whether the element differs sufficiently from this call's
                               previously iterated element to also differ in its unit conversion ratios. If the properties match up with those
                               of the prior element, the prior element's conversion ratios are used. Like most optimizations in Velocity,
                               this is done to minimize DOM querying. */
                            var sameRatioIndicators = {
                                    myParent: element.parentNode || document.body, /* GET */
                                    position: CSS.getPropertyValue(element, "position"), /* GET */
                                    fontSize: CSS.getPropertyValue(element, "fontSize") /* GET */
                                },
                                /* Determine if the same % ratio can be used. % is based on the element's position value and its parent's width and height dimensions. */
                                samePercentRatio = ((sameRatioIndicators.position === callUnitConversionData.lastPosition) && (sameRatioIndicators.myParent === callUnitConversionData.lastParent)),
                                /* Determine if the same em ratio can be used. em is relative to the element's fontSize. */
                                sameEmRatio = (sameRatioIndicators.fontSize === callUnitConversionData.lastFontSize);

                            /* Store these ratio indicators call-wide for the next element to compare against. */
                            callUnitConversionData.lastParent = sameRatioIndicators.myParent;
                            callUnitConversionData.lastPosition = sameRatioIndicators.position;
                            callUnitConversionData.lastFontSize = sameRatioIndicators.fontSize;

                            /***************************
                               Element-Specific Units
                            ***************************/

                            /* Note: IE8 rounds to the nearest pixel when returning CSS values, thus we perform conversions using a measurement
                               of 100 (instead of 1) to give our ratios a precision of at least 2 decimal values. */
                            var measurement = 100,
                                unitRatios = {};

                            if (!sameEmRatio || !samePercentRatio) {
                                var dummy = Data(element).isSVG ? document.createElementNS("http://www.w3.org/2000/svg", "rect") : document.createElement("div");

                                Velocity.init(dummy);
                                sameRatioIndicators.myParent.appendChild(dummy);

                                /* To accurately and consistently calculate conversion ratios, the element's cascaded overflow and box-sizing are stripped.
                                   Similarly, since width/height can be artificially constrained by their min-/max- equivalents, these are controlled for as well. */
                                /* Note: Overflow must be also be controlled for per-axis since the overflow property overwrites its per-axis values. */
                                $.each([ "overflow", "overflowX", "overflowY" ], function(i, property) {
                                    Velocity.CSS.setPropertyValue(dummy, property, "hidden");
                                });
                                Velocity.CSS.setPropertyValue(dummy, "position", sameRatioIndicators.position);
                                Velocity.CSS.setPropertyValue(dummy, "fontSize", sameRatioIndicators.fontSize);
                                Velocity.CSS.setPropertyValue(dummy, "boxSizing", "content-box");

                                /* width and height act as our proxy properties for measuring the horizontal and vertical % ratios. */
                                $.each([ "minWidth", "maxWidth", "width", "minHeight", "maxHeight", "height" ], function(i, property) {
                                    Velocity.CSS.setPropertyValue(dummy, property, measurement + "%");
                                });
                                /* paddingLeft arbitrarily acts as our proxy property for the em ratio. */
                                Velocity.CSS.setPropertyValue(dummy, "paddingLeft", measurement + "em");

                                /* Divide the returned value by the measurement to get the ratio between 1% and 1px. Default to 1 since working with 0 can produce Infinite. */
                                unitRatios.percentToPxWidth = callUnitConversionData.lastPercentToPxWidth = (parseFloat(CSS.getPropertyValue(dummy, "width", null, true)) || 1) / measurement; /* GET */
                                unitRatios.percentToPxHeight = callUnitConversionData.lastPercentToPxHeight = (parseFloat(CSS.getPropertyValue(dummy, "height", null, true)) || 1) / measurement; /* GET */
                                unitRatios.emToPx = callUnitConversionData.lastEmToPx = (parseFloat(CSS.getPropertyValue(dummy, "paddingLeft")) || 1) / measurement; /* GET */

                                sameRatioIndicators.myParent.removeChild(dummy);
                            } else {
                                unitRatios.emToPx = callUnitConversionData.lastEmToPx;
                                unitRatios.percentToPxWidth = callUnitConversionData.lastPercentToPxWidth;
                                unitRatios.percentToPxHeight = callUnitConversionData.lastPercentToPxHeight;
                            }

                            /***************************
                               Element-Agnostic Units
                            ***************************/

                            /* Whereas % and em ratios are determined on a per-element basis, the rem unit only needs to be checked
                               once per call since it's exclusively dependant upon document.body's fontSize. If this is the first time
                               that calculateUnitRatios() is being run during this call, remToPx will still be set to its default value of null,
                               so we calculate it now. */
                            if (callUnitConversionData.remToPx === null) {
                                /* Default to browsers' default fontSize of 16px in the case of 0. */
                                callUnitConversionData.remToPx = parseFloat(CSS.getPropertyValue(document.body, "fontSize")) || 16; /* GET */
                            }

                            /* Similarly, viewport units are %-relative to the window's inner dimensions. */
                            if (callUnitConversionData.vwToPx === null) {
                                callUnitConversionData.vwToPx = parseFloat(window.innerWidth) / 100; /* GET */
                                callUnitConversionData.vhToPx = parseFloat(window.innerHeight) / 100; /* GET */
                            }

                            unitRatios.remToPx = callUnitConversionData.remToPx;
                            unitRatios.vwToPx = callUnitConversionData.vwToPx;
                            unitRatios.vhToPx = callUnitConversionData.vhToPx;

                            if (Velocity.debug >= 1) console.log("Unit ratios: " + JSON.stringify(unitRatios), element);

                            return unitRatios;
                        }

                        /********************
                           Unit Conversion
                        ********************/

                        /* The * and / operators, which are not passed in with an associated unit, inherently use startValue's unit. Skip value and unit conversion. */
                        if (/[\/*]/.test(operator)) {
                            endValueUnitType = startValueUnitType;
                        /* If startValue and endValue differ in unit type, convert startValue into the same unit type as endValue so that if endValueUnitType
                           is a relative unit (%, em, rem), the values set during tweening will continue to be accurately relative even if the metrics they depend
                           on are dynamically changing during the course of the animation. Conversely, if we always normalized into px and used px for setting values, the px ratio
                           would become stale if the original unit being animated toward was relative and the underlying metrics change during the animation. */
                        /* Since 0 is 0 in any unit type, no conversion is necessary when startValue is 0 -- we just start at 0 with endValueUnitType. */
                        } else if ((startValueUnitType !== endValueUnitType) && startValue !== 0) {
                            /* Unit conversion is also skipped when endValue is 0, but *startValueUnitType* must be used for tween values to remain accurate. */
                            /* Note: Skipping unit conversion here means that if endValueUnitType was originally a relative unit, the animation won't relatively
                               match the underlying metrics if they change, but this is acceptable since we're animating toward invisibility instead of toward visibility,
                               which remains past the point of the animation's completion. */
                            if (endValue === 0) {
                                endValueUnitType = startValueUnitType;
                            } else {
                                /* By this point, we cannot avoid unit conversion (it's undesirable since it causes layout thrashing).
                                   If we haven't already, we trigger calculateUnitRatios(), which runs once per element per call. */
                                elementUnitConversionData = elementUnitConversionData || calculateUnitRatios();

                                /* The following RegEx matches CSS properties that have their % values measured relative to the x-axis. */
                                /* Note: W3C spec mandates that all of margin and padding's properties (even top and bottom) are %-relative to the *width* of the parent element. */
                                var axis = (/margin|padding|left|right|width|text|word|letter/i.test(property) || /X$/.test(property) || property === "x") ? "x" : "y";

                                /* In order to avoid generating n^2 bespoke conversion functions, unit conversion is a two-step process:
                                   1) Convert startValue into pixels. 2) Convert this new pixel value into endValue's unit type. */
                                switch (startValueUnitType) {
                                    case "%":
                                        /* Note: translateX and translateY are the only properties that are %-relative to an element's own dimensions -- not its parent's dimensions.
                                           Velocity does not include a special conversion process to account for this behavior. Therefore, animating translateX/Y from a % value
                                           to a non-% value will produce an incorrect start value. Fortunately, this sort of cross-unit conversion is rarely done by users in practice. */
                                        startValue *= (axis === "x" ? elementUnitConversionData.percentToPxWidth : elementUnitConversionData.percentToPxHeight);
                                        break;

                                    case "px":
                                        /* px acts as our midpoint in the unit conversion process; do nothing. */
                                        break;

                                    default:
                                        startValue *= elementUnitConversionData[startValueUnitType + "ToPx"];
                                }

                                /* Invert the px ratios to convert into to the target unit. */
                                switch (endValueUnitType) {
                                    case "%":
                                        startValue *= 1 / (axis === "x" ? elementUnitConversionData.percentToPxWidth : elementUnitConversionData.percentToPxHeight);
                                        break;

                                    case "px":
                                        /* startValue is already in px, do nothing; we're done. */
                                        break;

                                    default:
                                        startValue *= 1 / elementUnitConversionData[endValueUnitType + "ToPx"];
                                }
                            }
                        }

                        /*********************
                           Relative Values
                        *********************/

                        /* Operator logic must be performed last since it requires unit-normalized start and end values. */
                        /* Note: Relative *percent values* do not behave how most people think; while one would expect "+=50%"
                           to increase the property 1.5x its current value, it in fact increases the percent units in absolute terms:
                           50 points is added on top of the current % value. */
                        switch (operator) {
                            case "+":
                                endValue = startValue + endValue;
                                break;

                            case "-":
                                endValue = startValue - endValue;
                                break;

                            case "*":
                                endValue = startValue * endValue;
                                break;

                            case "/":
                                endValue = startValue / endValue;
                                break;
                        }

                        /**************************
                           tweensContainer Push
                        **************************/

                        /* Construct the per-property tween object, and push it to the element's tweensContainer. */
                        tweensContainer[property] = {
                            rootPropertyValue: rootPropertyValue,
                            startValue: startValue,
                            currentValue: startValue,
                            endValue: endValue,
                            unitType: endValueUnitType,
                            easing: easing
                        };

                        if (Velocity.debug) console.log("tweensContainer (" + property + "): " + JSON.stringify(tweensContainer[property]), element);
                    }

                    /* Along with its property data, store a reference to the element itself onto tweensContainer. */
                    tweensContainer.element = element;
                }

                /*****************
                    Call Push
                *****************/

                /* Note: tweensContainer can be empty if all of the properties in this call's property map were skipped due to not
                   being supported by the browser. The element property is used for checking that the tweensContainer has been appended to. */
                if (tweensContainer.element) {
                    /* Apply the "velocity-animating" indicator class. */
                    CSS.Values.addClass(element, "velocity-animating");

                    /* The call array houses the tweensContainers for each element being animated in the current call. */
                    call.push(tweensContainer);

                    /* Store the tweensContainer and options if we're working on the default effects queue, so that they can be used by the reverse command. */
                    if (opts.queue === "") {
                        Data(element).tweensContainer = tweensContainer;
                        Data(element).opts = opts;
                    }

                    /* Switch on the element's animating flag. */
                    Data(element).isAnimating = true;

                    /* Once the final element in this call's element set has been processed, push the call array onto
                       Velocity.State.calls for the animation tick to immediately begin processing. */
                    if (elementsIndex === elementsLength - 1) {
                        /* Add the current call plus its associated metadata (the element set and the call's options) onto the global call container.
                           Anything on this call container is subjected to tick() processing. */
                        Velocity.State.calls.push([ call, elements, opts, null, promiseData.resolver ]);

                        /* If the animation tick isn't running, start it. (Velocity shuts it off when there are no active calls to process.) */
                        if (Velocity.State.isTicking === false) {
                            Velocity.State.isTicking = true;

                            /* Start the tick loop. */
                            tick();
                        }
                    } else {
                        elementsIndex++;
                    }
                }
            }

            /* When the queue option is set to false, the call skips the element's queue and fires immediately. */
            if (opts.queue === false) {
                /* Since this buildQueue call doesn't respect the element's existing queue (which is where a delay option would have been appended),
                   we manually inject the delay property here with an explicit setTimeout. */
                if (opts.delay) {
                    setTimeout(buildQueue, opts.delay);
                } else {
                    buildQueue();
                }
            /* Otherwise, the call undergoes element queueing as normal. */
            /* Note: To interoperate with jQuery, Velocity uses jQuery's own $.queue() stack for queuing logic. */
            } else {
                $.queue(element, opts.queue, function(next, clearQueue) {
                    /* If the clearQueue flag was passed in by the stop command, resolve this call's promise. (Promises can only be resolved once,
                       so it's fine if this is repeatedly triggered for each element in the associated call.) */
                    if (clearQueue === true) {
                        if (promiseData.promise) {
                            promiseData.resolver(elements);
                        }

                        /* Do not continue with animation queueing. */
                        return true;
                    }

                    /* This flag indicates to the upcoming completeCall() function that this queue entry was initiated by Velocity.
                       See completeCall() for further details. */
                    Velocity.velocityQueueEntryFlag = true;

                    buildQueue(next);
                });
            }

            /*********************
                Auto-Dequeuing
            *********************/

            /* As per jQuery's $.queue() behavior, to fire the first non-custom-queue entry on an element, the element
               must be dequeued if its queue stack consists *solely* of the current call. (This can be determined by checking
               for the "inprogress" item that jQuery prepends to active queue stack arrays.) Regardless, whenever the element's
               queue is further appended with additional items -- including $.delay()'s or even $.animate() calls, the queue's
               first entry is automatically fired. This behavior contrasts that of custom queues, which never auto-fire. */
            /* Note: When an element set is being subjected to a non-parallel Velocity call, the animation will not begin until
               each one of the elements in the set has reached the end of its individually pre-existing queue chain. */
            /* Note: Unfortunately, most people don't fully grasp jQuery's powerful, yet quirky, $.queue() function.
               Lean more here: http://stackoverflow.com/questions/1058158/can-somebody-explain-jquery-queue-to-me */
            if ((opts.queue === "" || opts.queue === "fx") && $.queue(element)[0] !== "inprogress") {
                $.dequeue(element);
            }
        }

        /**************************
           Element Set Iteration
        **************************/

        /* If the "nodeType" property exists on the elements variable, we're animating a single element.
           Place it in an array so that $.each() can iterate over it. */
        $.each(elements, function(i, element) {
            /* Ensure each element in a set has a nodeType (is a real element) to avoid throwing errors. */
            if (Type.isNode(element)) {
                processElement.call(element);
            }
        });

        /******************
           Option: Loop
        ******************/

        /* The loop option accepts an integer indicating how many times the element should loop between the values in the
           current call's properties map and the element's property values prior to this call. */
        /* Note: The loop option's logic is performed here -- after element processing -- because the current call needs
           to undergo its queue insertion prior to the loop option generating its series of constituent "reverse" calls,
           which chain after the current call. Two reverse calls (two "alternations") constitute one loop. */
        var opts = $.extend({}, Velocity.defaults, options),
            reverseCallsCount;

        opts.loop = parseInt(opts.loop);
        reverseCallsCount = (opts.loop * 2) - 1;

        if (opts.loop) {
            /* Double the loop count to convert it into its appropriate number of "reverse" calls.
               Subtract 1 from the resulting value since the current call is included in the total alternation count. */
            for (var x = 0; x < reverseCallsCount; x++) {
                /* Since the logic for the reverse action occurs inside Queueing and therefore this call's options object
                   isn't parsed until then as well, the current call's delay option must be explicitly passed into the reverse
                   call so that the delay logic that occurs inside *Pre-Queueing* can process it. */
                var reverseOptions = {
                    delay: opts.delay,
                    progress: opts.progress
                };

                /* If a complete callback was passed into this call, transfer it to the loop redirect's final "reverse" call
                   so that it's triggered when the entire redirect is complete (and not when the very first animation is complete). */
                if (x === reverseCallsCount - 1) {
                    reverseOptions.display = opts.display;
                    reverseOptions.visibility = opts.visibility;
                    reverseOptions.complete = opts.complete;
                }

                animate(elements, "reverse", reverseOptions);
            }
        }

        /***************
            Chaining
        ***************/

        /* Return the elements back to the call chain, with wrapped elements taking precedence in case Velocity was called via the $.fn. extension. */
        return getChain();
    };

    /* Turn Velocity into the animation function, extended with the pre-existing Velocity object. */
    Velocity = $.extend(animate, Velocity);
    /* For legacy support, also expose the literal animate method. */
    Velocity.animate = animate;

    /**************
        Timing
    **************/

    /* Ticker function. */
    var ticker = window.requestAnimationFrame || rAFShim;

    /* Inactive browser tabs pause rAF, which results in all active animations immediately sprinting to their completion states when the tab refocuses.
       To get around this, we dynamically switch rAF to setTimeout (which the browser *doesn't* pause) when the tab loses focus. We skip this for mobile
       devices to avoid wasting battery power on inactive tabs. */
    /* Note: Tab focus detection doesn't work on older versions of IE, but that's okay since they don't support rAF to begin with. */
    if (!Velocity.State.isMobile && document.hidden !== undefined) {
        document.addEventListener("visibilitychange", function() {
            /* Reassign the rAF function (which the global tick() function uses) based on the tab's focus state. */
            if (document.hidden) {
                ticker = function(callback) {
                    /* The tick function needs a truthy first argument in order to pass its internal timestamp check. */
                    return setTimeout(function() { callback(true) }, 16);
                };

                /* The rAF loop has been paused by the browser, so we manually restart the tick. */
                tick();
            } else {
                ticker = window.requestAnimationFrame || rAFShim;
            }
        });
    }

    /************
        Tick
    ************/

    /* Note: All calls to Velocity are pushed to the Velocity.State.calls array, which is fully iterated through upon each tick. */
    function tick (timestamp) {
        /* An empty timestamp argument indicates that this is the first tick occurence since ticking was turned on.
           We leverage this metadata to fully ignore the first tick pass since RAF's initial pass is fired whenever
           the browser's next tick sync time occurs, which results in the first elements subjected to Velocity
           calls being animated out of sync with any elements animated immediately thereafter. In short, we ignore
           the first RAF tick pass so that elements being immediately consecutively animated -- instead of simultaneously animated
           by the same Velocity call -- are properly batched into the same initial RAF tick and consequently remain in sync thereafter. */
        if (timestamp) {
            /* We ignore RAF's high resolution timestamp since it can be significantly offset when the browser is
               under high stress; we opt for choppiness over allowing the browser to drop huge chunks of frames. */
            var timeCurrent = (new Date).getTime();

            /********************
               Call Iteration
            ********************/

            var callsLength = Velocity.State.calls.length;

            /* To speed up iterating over this array, it is compacted (falsey items -- calls that have completed -- are removed)
               when its length has ballooned to a point that can impact tick performance. This only becomes necessary when animation
               has been continuous with many elements over a long period of time; whenever all active calls are completed, completeCall() clears Velocity.State.calls. */
            if (callsLength > 10000) {
                Velocity.State.calls = compactSparseArray(Velocity.State.calls);
            }

            /* Iterate through each active call. */
            for (var i = 0; i < callsLength; i++) {
                /* When a Velocity call is completed, its Velocity.State.calls entry is set to false. Continue on to the next call. */
                if (!Velocity.State.calls[i]) {
                    continue;
                }

                /************************
                   Call-Wide Variables
                ************************/

                var callContainer = Velocity.State.calls[i],
                    call = callContainer[0],
                    opts = callContainer[2],
                    timeStart = callContainer[3],
                    firstTick = !!timeStart,
                    tweenDummyValue = null;

                /* If timeStart is undefined, then this is the first time that this call has been processed by tick().
                   We assign timeStart now so that its value is as close to the real animation start time as possible.
                   (Conversely, had timeStart been defined when this call was added to Velocity.State.calls, the delay
                   between that time and now would cause the first few frames of the tween to be skipped since
                   percentComplete is calculated relative to timeStart.) */
                /* Further, subtract 16ms (the approximate resolution of RAF) from the current time value so that the
                   first tick iteration isn't wasted by animating at 0% tween completion, which would produce the
                   same style value as the element's current value. */
                if (!timeStart) {
                    timeStart = Velocity.State.calls[i][3] = timeCurrent - 16;
                }

                /* The tween's completion percentage is relative to the tween's start time, not the tween's start value
                   (which would result in unpredictable tween durations since JavaScript's timers are not particularly accurate).
                   Accordingly, we ensure that percentComplete does not exceed 1. */
                var percentComplete = Math.min((timeCurrent - timeStart) / opts.duration, 1);

                /**********************
                   Element Iteration
                **********************/

                /* For every call, iterate through each of the elements in its set. */
                for (var j = 0, callLength = call.length; j < callLength; j++) {
                    var tweensContainer = call[j],
                        element = tweensContainer.element;

                    /* Check to see if this element has been deleted midway through the animation by checking for the
                       continued existence of its data cache. If it's gone, skip animating this element. */
                    if (!Data(element)) {
                        continue;
                    }

                    var transformPropertyExists = false;

                    /**********************************
                       Display & Visibility Toggling
                    **********************************/

                    /* If the display option is set to non-"none", set it upfront so that the element can become visible before tweening begins.
                       (Otherwise, display's "none" value is set in completeCall() once the animation has completed.) */
                    if (opts.display !== undefined && opts.display !== null && opts.display !== "none") {
                        if (opts.display === "flex") {
                            var flexValues = [ "-webkit-box", "-moz-box", "-ms-flexbox", "-webkit-flex" ];

                            $.each(flexValues, function(i, flexValue) {
                                CSS.setPropertyValue(element, "display", flexValue);
                            });
                        }

                        CSS.setPropertyValue(element, "display", opts.display);
                    }

                    /* Same goes with the visibility option, but its "none" equivalent is "hidden". */
                    if (opts.visibility !== undefined && opts.visibility !== "hidden") {
                        CSS.setPropertyValue(element, "visibility", opts.visibility);
                    }

                    /************************
                       Property Iteration
                    ************************/

                    /* For every element, iterate through each property. */
                    for (var property in tweensContainer) {
                        /* Note: In addition to property tween data, tweensContainer contains a reference to its associated element. */
                        if (property !== "element") {
                            var tween = tweensContainer[property],
                                currentValue,
                                /* Easing can either be a pre-genereated function or a string that references a pre-registered easing
                                   on the Velocity.Easings object. In either case, return the appropriate easing *function*. */
                                easing = Type.isString(tween.easing) ? Velocity.Easings[tween.easing] : tween.easing;

                            /******************************
                               Current Value Calculation
                            ******************************/

                            /* If this is the last tick pass (if we've reached 100% completion for this tween),
                               ensure that currentValue is explicitly set to its target endValue so that it's not subjected to any rounding. */
                            if (percentComplete === 1) {
                                currentValue = tween.endValue;
                            /* Otherwise, calculate currentValue based on the current delta from startValue. */
                            } else {
                                var tweenDelta = tween.endValue - tween.startValue;
                                currentValue = tween.startValue + (tweenDelta * easing(percentComplete, opts, tweenDelta));

                                /* If no value change is occurring, don't proceed with DOM updating. */
                                if (!firstTick && (currentValue === tween.currentValue)) {
                                    continue;
                                }
                            }

                            tween.currentValue = currentValue;

                            /* If we're tweening a fake 'tween' property in order to log transition values, update the one-per-call variable so that
                               it can be passed into the progress callback. */ 
                            if (property === "tween") {
                                tweenDummyValue = currentValue;
                            } else {
                                /******************
                                   Hooks: Part I
                                ******************/

                                /* For hooked properties, the newly-updated rootPropertyValueCache is cached onto the element so that it can be used
                                   for subsequent hooks in this call that are associated with the same root property. If we didn't cache the updated
                                   rootPropertyValue, each subsequent update to the root property in this tick pass would reset the previous hook's
                                   updates to rootPropertyValue prior to injection. A nice performance byproduct of rootPropertyValue caching is that
                                   subsequently chained animations using the same hookRoot but a different hook can use this cached rootPropertyValue. */
                                if (CSS.Hooks.registered[property]) {
                                    var hookRoot = CSS.Hooks.getRoot(property),
                                        rootPropertyValueCache = Data(element).rootPropertyValueCache[hookRoot];

                                    if (rootPropertyValueCache) {
                                        tween.rootPropertyValue = rootPropertyValueCache;
                                    }
                                }

                                /*****************
                                    DOM Update
                                *****************/

                                /* setPropertyValue() returns an array of the property name and property value post any normalization that may have been performed. */
                                /* Note: To solve an IE<=8 positioning bug, the unit type is dropped when setting a property value of 0. */
                                var adjustedSetData = CSS.setPropertyValue(element, /* SET */
                                                                           property,
                                                                           tween.currentValue + (parseFloat(currentValue) === 0 ? "" : tween.unitType),
                                                                           tween.rootPropertyValue,
                                                                           tween.scrollData);

                                /*******************
                                   Hooks: Part II
                                *******************/

                                /* Now that we have the hook's updated rootPropertyValue (the post-processed value provided by adjustedSetData), cache it onto the element. */
                                if (CSS.Hooks.registered[property]) {
                                    /* Since adjustedSetData contains normalized data ready for DOM updating, the rootPropertyValue needs to be re-extracted from its normalized form. ?? */
                                    if (CSS.Normalizations.registered[hookRoot]) {
                                        Data(element).rootPropertyValueCache[hookRoot] = CSS.Normalizations.registered[hookRoot]("extract", null, adjustedSetData[1]);
                                    } else {
                                        Data(element).rootPropertyValueCache[hookRoot] = adjustedSetData[1];
                                    }
                                }

                                /***************
                                   Transforms
                                ***************/

                                /* Flag whether a transform property is being animated so that flushTransformCache() can be triggered once this tick pass is complete. */
                                if (adjustedSetData[0] === "transform") {
                                    transformPropertyExists = true;
                                }

                            }
                        }
                    }

                    /****************
                        mobileHA
                    ****************/

                    /* If mobileHA is enabled, set the translate3d transform to null to force hardware acceleration.
                       It's safe to override this property since Velocity doesn't actually support its animation (hooks are used in its place). */
                    if (opts.mobileHA) {
                        /* Don't set the null transform hack if we've already done so. */
                        if (Data(element).transformCache.translate3d === undefined) {
                            /* All entries on the transformCache object are later concatenated into a single transform string via flushTransformCache(). */
                            Data(element).transformCache.translate3d = "(0px, 0px, 0px)";

                            transformPropertyExists = true;
                        }
                    }

                    if (transformPropertyExists) {
                        CSS.flushTransformCache(element);
                    }
                }

                /* The non-"none" display value is only applied to an element once -- when its associated call is first ticked through.
                   Accordingly, it's set to false so that it isn't re-processed by this call in the next tick. */
                if (opts.display !== undefined && opts.display !== "none") {
                    Velocity.State.calls[i][2].display = false;
                }
                if (opts.visibility !== undefined && opts.visibility !== "hidden") {
                    Velocity.State.calls[i][2].visibility = false;
                }

                /* Pass the elements and the timing data (percentComplete, msRemaining, timeStart, tweenDummyValue) into the progress callback. */
                if (opts.progress) {
                    opts.progress.call(callContainer[1],
                                       callContainer[1],
                                       percentComplete,
                                       Math.max(0, (timeStart + opts.duration) - timeCurrent),
                                       timeStart,
                                       tweenDummyValue);
                }

                /* If this call has finished tweening, pass its index to completeCall() to handle call cleanup. */
                if (percentComplete === 1) {
                    completeCall(i);
                }
            }
        }

        /* Note: completeCall() sets the isTicking flag to false when the last call on Velocity.State.calls has completed. */
        if (Velocity.State.isTicking) {
            ticker(tick);
        }
    }

    /**********************
        Call Completion
    **********************/

    /* Note: Unlike tick(), which processes all active calls at once, call completion is handled on a per-call basis. */
    function completeCall (callIndex, isStopped) {
        /* Ensure the call exists. */
        if (!Velocity.State.calls[callIndex]) {
            return false;
        }

        /* Pull the metadata from the call. */
        var call = Velocity.State.calls[callIndex][0],
            elements = Velocity.State.calls[callIndex][1],
            opts = Velocity.State.calls[callIndex][2],
            resolver = Velocity.State.calls[callIndex][4];

        var remainingCallsExist = false;

        /*************************
           Element Finalization
        *************************/

        for (var i = 0, callLength = call.length; i < callLength; i++) {
            var element = call[i].element;

            /* If the user set display to "none" (intending to hide the element), set it now that the animation has completed. */
            /* Note: display:none isn't set when calls are manually stopped (via Velocity("stop"). */
            /* Note: Display gets ignored with "reverse" calls and infinite loops, since this behavior would be undesirable. */
            if (!isStopped && !opts.loop) {
                if (opts.display === "none") {
                    CSS.setPropertyValue(element, "display", opts.display);
                }

                if (opts.visibility === "hidden") {
                    CSS.setPropertyValue(element, "visibility", opts.visibility);
                }
            }

            /* If the element's queue is empty (if only the "inprogress" item is left at position 0) or if its queue is about to run
               a non-Velocity-initiated entry, turn off the isAnimating flag. A non-Velocity-initiatied queue entry's logic might alter
               an element's CSS values and thereby cause Velocity's cached value data to go stale. To detect if a queue entry was initiated by Velocity,
               we check for the existence of our special Velocity.queueEntryFlag declaration, which minifiers won't rename since the flag
               is assigned to jQuery's global $ object and thus exists out of Velocity's own scope. */
            if (opts.loop !== true && ($.queue(element)[1] === undefined || !/\.velocityQueueEntryFlag/i.test($.queue(element)[1]))) {
                /* The element may have been deleted. Ensure that its data cache still exists before acting on it. */
                if (Data(element)) {
                    Data(element).isAnimating = false;
                    /* Clear the element's rootPropertyValueCache, which will become stale. */
                    Data(element).rootPropertyValueCache = {};

                    var transformHAPropertyExists = false;
                    /* If any 3D transform subproperty is at its default value (regardless of unit type), remove it. */
                    $.each(CSS.Lists.transforms3D, function(i, transformName) {
                        var defaultValue = /^scale/.test(transformName) ? 1 : 0,
                            currentValue = Data(element).transformCache[transformName];

                        if (Data(element).transformCache[transformName] !== undefined && new RegExp("^\\(" + defaultValue + "[^.]").test(currentValue)) {
                            transformHAPropertyExists = true;

                            delete Data(element).transformCache[transformName];
                        }
                    });

                    /* Mobile devices have hardware acceleration removed at the end of the animation in order to avoid hogging the GPU's memory. */
                    if (opts.mobileHA) {
                        transformHAPropertyExists = true;
                        delete Data(element).transformCache.translate3d;
                    }

                    /* Flush the subproperty removals to the DOM. */
                    if (transformHAPropertyExists) {
                        CSS.flushTransformCache(element);
                    }

                    /* Remove the "velocity-animating" indicator class. */
                    CSS.Values.removeClass(element, "velocity-animating");
                }
            }

            /*********************
               Option: Complete
            *********************/

            /* Complete is fired once per call (not once per element) and is passed the full raw DOM element set as both its context and its first argument. */
            /* Note: Callbacks aren't fired when calls are manually stopped (via Velocity("stop"). */
            if (!isStopped && opts.complete && !opts.loop && (i === callLength - 1)) {
                /* We throw callbacks in a setTimeout so that thrown errors don't halt the execution of Velocity itself. */
                try {
                    opts.complete.call(elements, elements);
                } catch (error) {
                    setTimeout(function() { throw error; }, 1);
                }
            }

            /**********************
               Promise Resolving
            **********************/

            /* Note: Infinite loops don't return promises. */
            if (resolver && opts.loop !== true) {
                resolver(elements);
            }

            /****************************
               Option: Loop (Infinite)
            ****************************/

            if (Data(element) && opts.loop === true && !isStopped) {
                /* If a rotateX/Y/Z property is being animated to 360 deg with loop:true, swap tween start/end values to enable
                   continuous iterative rotation looping. (Otherise, the element would just rotate back and forth.) */
                $.each(Data(element).tweensContainer, function(propertyName, tweenContainer) {
                    if (/^rotate/.test(propertyName) && parseFloat(tweenContainer.endValue) === 360) {
                        tweenContainer.endValue = 0;
                        tweenContainer.startValue = 360;
                    }

                    if (/^backgroundPosition/.test(propertyName) && parseFloat(tweenContainer.endValue) === 100 && tweenContainer.unitType === "%") {
                        tweenContainer.endValue = 0;
                        tweenContainer.startValue = 100;
                    }
                });

                Velocity(element, "reverse", { loop: true, delay: opts.delay });
            }

            /***************
               Dequeueing
            ***************/

            /* Fire the next call in the queue so long as this call's queue wasn't set to false (to trigger a parallel animation),
               which would have already caused the next call to fire. Note: Even if the end of the animation queue has been reached,
               $.dequeue() must still be called in order to completely clear jQuery's animation queue. */
            if (opts.queue !== false) {
                $.dequeue(element, opts.queue);
            }
        }

        /************************
           Calls Array Cleanup
        ************************/

        /* Since this call is complete, set it to false so that the rAF tick skips it. This array is later compacted via compactSparseArray().
          (For performance reasons, the call is set to false instead of being deleted from the array: http://www.html5rocks.com/en/tutorials/speed/v8/) */
        Velocity.State.calls[callIndex] = false;

        /* Iterate through the calls array to determine if this was the final in-progress animation.
           If so, set a flag to end ticking and clear the calls array. */
        for (var j = 0, callsLength = Velocity.State.calls.length; j < callsLength; j++) {
            if (Velocity.State.calls[j] !== false) {
                remainingCallsExist = true;

                break;
            }
        }

        if (remainingCallsExist === false) {
            /* tick() will detect this flag upon its next iteration and subsequently turn itself off. */
            Velocity.State.isTicking = false;

            /* Clear the calls array so that its length is reset. */
            delete Velocity.State.calls;
            Velocity.State.calls = [];
        }
    }

    /******************
        Frameworks
    ******************/

    /* Both jQuery and Zepto allow their $.fn object to be extended to allow wrapped elements to be subjected to plugin calls.
       If either framework is loaded, register a "velocity" extension pointing to Velocity's core animate() method.  Velocity
       also registers itself onto a global container (window.jQuery || window.Zepto || window) so that certain features are
       accessible beyond just a per-element scope. This master object contains an .animate() method, which is later assigned to $.fn
       (if jQuery or Zepto are present). Accordingly, Velocity can both act on wrapped DOM elements and stand alone for targeting raw DOM elements. */
    global.Velocity = Velocity;

    if (global !== window) {
        /* Assign the element function to Velocity's core animate() method. */
        global.fn.velocity = animate;
        /* Assign the object function's defaults to Velocity's global defaults object. */
        global.fn.velocity.defaults = Velocity.defaults;
    }

    /***********************
       Packaged Redirects
    ***********************/

    /* slideUp, slideDown */
    $.each([ "Down", "Up" ], function(i, direction) {
        Velocity.Redirects["slide" + direction] = function (element, options, elementsIndex, elementsSize, elements, promiseData) {
            var opts = $.extend({}, options),
                begin = opts.begin,
                complete = opts.complete,
                computedValues = { height: "", marginTop: "", marginBottom: "", paddingTop: "", paddingBottom: "" },
                inlineValues = {};

            if (opts.display === undefined) {
                /* Show the element before slideDown begins and hide the element after slideUp completes. */
                /* Note: Inline elements cannot have dimensions animated, so they're reverted to inline-block. */
                opts.display = (direction === "Down" ? (Velocity.CSS.Values.getDisplayType(element) === "inline" ? "inline-block" : "block") : "none");
            }

            opts.begin = function() {
                /* If the user passed in a begin callback, fire it now. */
                begin && begin.call(elements, elements);

                /* Cache the elements' original vertical dimensional property values so that we can animate back to them. */
                for (var property in computedValues) {
                    inlineValues[property] = element.style[property];

                    /* For slideDown, use forcefeeding to animate all vertical properties from 0. For slideUp,
                       use forcefeeding to start from computed values and animate down to 0. */
                    var propertyValue = Velocity.CSS.getPropertyValue(element, property);
                    computedValues[property] = (direction === "Down") ? [ propertyValue, 0 ] : [ 0, propertyValue ];
                }

                /* Force vertical overflow content to clip so that sliding works as expected. */
                inlineValues.overflow = element.style.overflow;
                element.style.overflow = "hidden";
            }

            opts.complete = function() {
                /* Reset element to its pre-slide inline values once its slide animation is complete. */
                for (var property in inlineValues) {
                    element.style[property] = inlineValues[property];
                }

                /* If the user passed in a complete callback, fire it now. */
                complete && complete.call(elements, elements);
                promiseData && promiseData.resolver(elements);
            };

            Velocity(element, computedValues, opts);
        };
    });

    /* fadeIn, fadeOut */
    $.each([ "In", "Out" ], function(i, direction) {
        Velocity.Redirects["fade" + direction] = function (element, options, elementsIndex, elementsSize, elements, promiseData) {
            var opts = $.extend({}, options),
                propertiesMap = { opacity: (direction === "In") ? 1 : 0 },
                originalComplete = opts.complete;

            /* Since redirects are triggered individually for each element in the animated set, avoid repeatedly triggering
               callbacks by firing them only when the final element has been reached. */
            if (elementsIndex !== elementsSize - 1) {
                opts.complete = opts.begin = null;
            } else {
                opts.complete = function() {
                    if (originalComplete) {
                        originalComplete.call(elements, elements);
                    }

                    promiseData && promiseData.resolver(elements);
                }
            }

            /* If a display was passed in, use it. Otherwise, default to "none" for fadeOut or the element-specific default for fadeIn. */
            /* Note: We allow users to pass in "null" to skip display setting altogether. */
            if (opts.display === undefined) {
                opts.display = (direction === "In" ? "auto" : "none");
            }

            Velocity(this, propertiesMap, opts);
        };
    });

    return Velocity;
}((window.jQuery || window.Zepto || window), window, document);
}));

/******************
   Known Issues
******************/

/* The CSS spec mandates that the translateX/Y/Z transforms are %-relative to the element itself -- not its parent.
Velocity, however, doesn't make this distinction. Thus, converting to or from the % unit with these subproperties
will produce an inaccurate conversion value. The same issue exists with the cx/cy attributes of SVG circles and ellipses. */
/*! VelocityJS.org (1.2.2). (C) 2014 Julian Shapiro. MIT @license: en.wikipedia.org/wiki/MIT_License */
/*! VelocityJS.org jQuery Shim (1.0.1). (C) 2014 The jQuery Foundation. MIT @license: en.wikipedia.org/wiki/MIT_License. */
!function(e){function t(e){var t=e.length,r=$.type(e);return"function"===r||$.isWindow(e)?!1:1===e.nodeType&&t?!0:"array"===r||0===t||"number"==typeof t&&t>0&&t-1 in e}if(!e.jQuery){var $=function(e,t){return new $.fn.init(e,t)};$.isWindow=function(e){return null!=e&&e==e.window},$.type=function(e){return null==e?e+"":"object"==typeof e||"function"==typeof e?a[o.call(e)]||"object":typeof e},$.isArray=Array.isArray||function(e){return"array"===$.type(e)},$.isPlainObject=function(e){var t;if(!e||"object"!==$.type(e)||e.nodeType||$.isWindow(e))return!1;try{if(e.constructor&&!n.call(e,"constructor")&&!n.call(e.constructor.prototype,"isPrototypeOf"))return!1}catch(r){return!1}for(t in e);return void 0===t||n.call(e,t)},$.each=function(e,r,a){var n,o=0,i=e.length,s=t(e);if(a){if(s)for(;i>o&&(n=r.apply(e[o],a),n!==!1);o++);else for(o in e)if(n=r.apply(e[o],a),n===!1)break}else if(s)for(;i>o&&(n=r.call(e[o],o,e[o]),n!==!1);o++);else for(o in e)if(n=r.call(e[o],o,e[o]),n===!1)break;return e},$.data=function(e,t,a){if(void 0===a){var n=e[$.expando],o=n&&r[n];if(void 0===t)return o;if(o&&t in o)return o[t]}else if(void 0!==t){var n=e[$.expando]||(e[$.expando]=++$.uuid);return r[n]=r[n]||{},r[n][t]=a,a}},$.removeData=function(e,t){var a=e[$.expando],n=a&&r[a];n&&$.each(t,function(e,t){delete n[t]})},$.extend=function(){var e,t,r,a,n,o,i=arguments[0]||{},s=1,l=arguments.length,u=!1;for("boolean"==typeof i&&(u=i,i=arguments[s]||{},s++),"object"!=typeof i&&"function"!==$.type(i)&&(i={}),s===l&&(i=this,s--);l>s;s++)if(null!=(n=arguments[s]))for(a in n)e=i[a],r=n[a],i!==r&&(u&&r&&($.isPlainObject(r)||(t=$.isArray(r)))?(t?(t=!1,o=e&&$.isArray(e)?e:[]):o=e&&$.isPlainObject(e)?e:{},i[a]=$.extend(u,o,r)):void 0!==r&&(i[a]=r));return i},$.queue=function(e,r,a){function n(e,r){var a=r||[];return null!=e&&(t(Object(e))?!function(e,t){for(var r=+t.length,a=0,n=e.length;r>a;)e[n++]=t[a++];if(r!==r)for(;void 0!==t[a];)e[n++]=t[a++];return e.length=n,e}(a,"string"==typeof e?[e]:e):[].push.call(a,e)),a}if(e){r=(r||"fx")+"queue";var o=$.data(e,r);return a?(!o||$.isArray(a)?o=$.data(e,r,n(a)):o.push(a),o):o||[]}},$.dequeue=function(e,t){$.each(e.nodeType?[e]:e,function(e,r){t=t||"fx";var a=$.queue(r,t),n=a.shift();"inprogress"===n&&(n=a.shift()),n&&("fx"===t&&a.unshift("inprogress"),n.call(r,function(){$.dequeue(r,t)}))})},$.fn=$.prototype={init:function(e){if(e.nodeType)return this[0]=e,this;throw new Error("Not a DOM node.")},offset:function(){var t=this[0].getBoundingClientRect?this[0].getBoundingClientRect():{top:0,left:0};return{top:t.top+(e.pageYOffset||document.scrollTop||0)-(document.clientTop||0),left:t.left+(e.pageXOffset||document.scrollLeft||0)-(document.clientLeft||0)}},position:function(){function e(){for(var e=this.offsetParent||document;e&&"html"===!e.nodeType.toLowerCase&&"static"===e.style.position;)e=e.offsetParent;return e||document}var t=this[0],e=e.apply(t),r=this.offset(),a=/^(?:body|html)$/i.test(e.nodeName)?{top:0,left:0}:$(e).offset();return r.top-=parseFloat(t.style.marginTop)||0,r.left-=parseFloat(t.style.marginLeft)||0,e.style&&(a.top+=parseFloat(e.style.borderTopWidth)||0,a.left+=parseFloat(e.style.borderLeftWidth)||0),{top:r.top-a.top,left:r.left-a.left}}};var r={};$.expando="velocity"+(new Date).getTime(),$.uuid=0;for(var a={},n=a.hasOwnProperty,o=a.toString,i="Boolean Number String Function Array Date RegExp Object Error".split(" "),s=0;s<i.length;s++)a["[object "+i[s]+"]"]=i[s].toLowerCase();$.fn.init.prototype=$.fn,e.Velocity={Utilities:$}}}(window),function(e){"object"==typeof module&&"object"==typeof module.exports?module.exports=e():"function"==typeof define&&define.amd?define(e):e()}(function(){return function(e,t,r,a){function n(e){for(var t=-1,r=e?e.length:0,a=[];++t<r;){var n=e[t];n&&a.push(n)}return a}function o(e){return g.isWrapped(e)?e=[].slice.call(e):g.isNode(e)&&(e=[e]),e}function i(e){var t=$.data(e,"velocity");return null===t?a:t}function s(e){return function(t){return Math.round(t*e)*(1/e)}}function l(e,r,a,n){function o(e,t){return 1-3*t+3*e}function i(e,t){return 3*t-6*e}function s(e){return 3*e}function l(e,t,r){return((o(t,r)*e+i(t,r))*e+s(t))*e}function u(e,t,r){return 3*o(t,r)*e*e+2*i(t,r)*e+s(t)}function c(t,r){for(var n=0;m>n;++n){var o=u(r,e,a);if(0===o)return r;var i=l(r,e,a)-t;r-=i/o}return r}function p(){for(var t=0;b>t;++t)w[t]=l(t*x,e,a)}function f(t,r,n){var o,i,s=0;do i=r+(n-r)/2,o=l(i,e,a)-t,o>0?n=i:r=i;while(Math.abs(o)>h&&++s<v);return i}function d(t){for(var r=0,n=1,o=b-1;n!=o&&w[n]<=t;++n)r+=x;--n;var i=(t-w[n])/(w[n+1]-w[n]),s=r+i*x,l=u(s,e,a);return l>=y?c(t,s):0==l?s:f(t,r,r+x)}function g(){V=!0,(e!=r||a!=n)&&p()}var m=4,y=.001,h=1e-7,v=10,b=11,x=1/(b-1),S="Float32Array"in t;if(4!==arguments.length)return!1;for(var P=0;4>P;++P)if("number"!=typeof arguments[P]||isNaN(arguments[P])||!isFinite(arguments[P]))return!1;e=Math.min(e,1),a=Math.min(a,1),e=Math.max(e,0),a=Math.max(a,0);var w=S?new Float32Array(b):new Array(b),V=!1,C=function(t){return V||g(),e===r&&a===n?t:0===t?0:1===t?1:l(d(t),r,n)};C.getControlPoints=function(){return[{x:e,y:r},{x:a,y:n}]};var T="generateBezier("+[e,r,a,n]+")";return C.toString=function(){return T},C}function u(e,t){var r=e;return g.isString(e)?v.Easings[e]||(r=!1):r=g.isArray(e)&&1===e.length?s.apply(null,e):g.isArray(e)&&2===e.length?b.apply(null,e.concat([t])):g.isArray(e)&&4===e.length?l.apply(null,e):!1,r===!1&&(r=v.Easings[v.defaults.easing]?v.defaults.easing:h),r}function c(e){if(e){var t=(new Date).getTime(),r=v.State.calls.length;r>1e4&&(v.State.calls=n(v.State.calls));for(var o=0;r>o;o++)if(v.State.calls[o]){var s=v.State.calls[o],l=s[0],u=s[2],f=s[3],d=!!f,m=null;f||(f=v.State.calls[o][3]=t-16);for(var y=Math.min((t-f)/u.duration,1),h=0,b=l.length;b>h;h++){var S=l[h],w=S.element;if(i(w)){var V=!1;if(u.display!==a&&null!==u.display&&"none"!==u.display){if("flex"===u.display){var C=["-webkit-box","-moz-box","-ms-flexbox","-webkit-flex"];$.each(C,function(e,t){x.setPropertyValue(w,"display",t)})}x.setPropertyValue(w,"display",u.display)}u.visibility!==a&&"hidden"!==u.visibility&&x.setPropertyValue(w,"visibility",u.visibility);for(var T in S)if("element"!==T){var k=S[T],A,F=g.isString(k.easing)?v.Easings[k.easing]:k.easing;if(1===y)A=k.endValue;else{var E=k.endValue-k.startValue;if(A=k.startValue+E*F(y,u,E),!d&&A===k.currentValue)continue}if(k.currentValue=A,"tween"===T)m=A;else{if(x.Hooks.registered[T]){var j=x.Hooks.getRoot(T),H=i(w).rootPropertyValueCache[j];H&&(k.rootPropertyValue=H)}var N=x.setPropertyValue(w,T,k.currentValue+(0===parseFloat(A)?"":k.unitType),k.rootPropertyValue,k.scrollData);x.Hooks.registered[T]&&(i(w).rootPropertyValueCache[j]=x.Normalizations.registered[j]?x.Normalizations.registered[j]("extract",null,N[1]):N[1]),"transform"===N[0]&&(V=!0)}}u.mobileHA&&i(w).transformCache.translate3d===a&&(i(w).transformCache.translate3d="(0px, 0px, 0px)",V=!0),V&&x.flushTransformCache(w)}}u.display!==a&&"none"!==u.display&&(v.State.calls[o][2].display=!1),u.visibility!==a&&"hidden"!==u.visibility&&(v.State.calls[o][2].visibility=!1),u.progress&&u.progress.call(s[1],s[1],y,Math.max(0,f+u.duration-t),f,m),1===y&&p(o)}}v.State.isTicking&&P(c)}function p(e,t){if(!v.State.calls[e])return!1;for(var r=v.State.calls[e][0],n=v.State.calls[e][1],o=v.State.calls[e][2],s=v.State.calls[e][4],l=!1,u=0,c=r.length;c>u;u++){var p=r[u].element;if(t||o.loop||("none"===o.display&&x.setPropertyValue(p,"display",o.display),"hidden"===o.visibility&&x.setPropertyValue(p,"visibility",o.visibility)),o.loop!==!0&&($.queue(p)[1]===a||!/\.velocityQueueEntryFlag/i.test($.queue(p)[1]))&&i(p)){i(p).isAnimating=!1,i(p).rootPropertyValueCache={};var f=!1;$.each(x.Lists.transforms3D,function(e,t){var r=/^scale/.test(t)?1:0,n=i(p).transformCache[t];i(p).transformCache[t]!==a&&new RegExp("^\\("+r+"[^.]").test(n)&&(f=!0,delete i(p).transformCache[t])}),o.mobileHA&&(f=!0,delete i(p).transformCache.translate3d),f&&x.flushTransformCache(p),x.Values.removeClass(p,"velocity-animating")}if(!t&&o.complete&&!o.loop&&u===c-1)try{o.complete.call(n,n)}catch(d){setTimeout(function(){throw d},1)}s&&o.loop!==!0&&s(n),i(p)&&o.loop===!0&&!t&&($.each(i(p).tweensContainer,function(e,t){/^rotate/.test(e)&&360===parseFloat(t.endValue)&&(t.endValue=0,t.startValue=360),/^backgroundPosition/.test(e)&&100===parseFloat(t.endValue)&&"%"===t.unitType&&(t.endValue=0,t.startValue=100)}),v(p,"reverse",{loop:!0,delay:o.delay})),o.queue!==!1&&$.dequeue(p,o.queue)}v.State.calls[e]=!1;for(var g=0,m=v.State.calls.length;m>g;g++)if(v.State.calls[g]!==!1){l=!0;break}l===!1&&(v.State.isTicking=!1,delete v.State.calls,v.State.calls=[])}var f=function(){if(r.documentMode)return r.documentMode;for(var e=7;e>4;e--){var t=r.createElement("div");if(t.innerHTML="<!--[if IE "+e+"]><span></span><![endif]-->",t.getElementsByTagName("span").length)return t=null,e}return a}(),d=function(){var e=0;return t.webkitRequestAnimationFrame||t.mozRequestAnimationFrame||function(t){var r=(new Date).getTime(),a;return a=Math.max(0,16-(r-e)),e=r+a,setTimeout(function(){t(r+a)},a)}}(),g={isString:function(e){return"string"==typeof e},isArray:Array.isArray||function(e){return"[object Array]"===Object.prototype.toString.call(e)},isFunction:function(e){return"[object Function]"===Object.prototype.toString.call(e)},isNode:function(e){return e&&e.nodeType},isNodeList:function(e){return"object"==typeof e&&/^\[object (HTMLCollection|NodeList|Object)\]$/.test(Object.prototype.toString.call(e))&&e.length!==a&&(0===e.length||"object"==typeof e[0]&&e[0].nodeType>0)},isWrapped:function(e){return e&&(e.jquery||t.Zepto&&t.Zepto.zepto.isZ(e))},isSVG:function(e){return t.SVGElement&&e instanceof t.SVGElement},isEmptyObject:function(e){for(var t in e)return!1;return!0}},$,m=!1;if(e.fn&&e.fn.jquery?($=e,m=!0):$=t.Velocity.Utilities,8>=f&&!m)throw new Error("Velocity: IE8 and below require jQuery to be loaded before Velocity.");if(7>=f)return void(jQuery.fn.velocity=jQuery.fn.animate);var y=400,h="swing",v={State:{isMobile:/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),isAndroid:/Android/i.test(navigator.userAgent),isGingerbread:/Android 2\.3\.[3-7]/i.test(navigator.userAgent),isChrome:t.chrome,isFirefox:/Firefox/i.test(navigator.userAgent),prefixElement:r.createElement("div"),prefixMatches:{},scrollAnchor:null,scrollPropertyLeft:null,scrollPropertyTop:null,isTicking:!1,calls:[]},CSS:{},Utilities:$,Redirects:{},Easings:{},Promise:t.Promise,defaults:{queue:"",duration:y,easing:h,begin:a,complete:a,progress:a,display:a,visibility:a,loop:!1,delay:!1,mobileHA:!0,_cacheValues:!0},init:function(e){$.data(e,"velocity",{isSVG:g.isSVG(e),isAnimating:!1,computedStyle:null,tweensContainer:null,rootPropertyValueCache:{},transformCache:{}})},hook:null,mock:!1,version:{major:1,minor:2,patch:2},debug:!1};t.pageYOffset!==a?(v.State.scrollAnchor=t,v.State.scrollPropertyLeft="pageXOffset",v.State.scrollPropertyTop="pageYOffset"):(v.State.scrollAnchor=r.documentElement||r.body.parentNode||r.body,v.State.scrollPropertyLeft="scrollLeft",v.State.scrollPropertyTop="scrollTop");var b=function(){function e(e){return-e.tension*e.x-e.friction*e.v}function t(t,r,a){var n={x:t.x+a.dx*r,v:t.v+a.dv*r,tension:t.tension,friction:t.friction};return{dx:n.v,dv:e(n)}}function r(r,a){var n={dx:r.v,dv:e(r)},o=t(r,.5*a,n),i=t(r,.5*a,o),s=t(r,a,i),l=1/6*(n.dx+2*(o.dx+i.dx)+s.dx),u=1/6*(n.dv+2*(o.dv+i.dv)+s.dv);return r.x=r.x+l*a,r.v=r.v+u*a,r}return function a(e,t,n){var o={x:-1,v:0,tension:null,friction:null},i=[0],s=0,l=1e-4,u=.016,c,p,f;for(e=parseFloat(e)||500,t=parseFloat(t)||20,n=n||null,o.tension=e,o.friction=t,c=null!==n,c?(s=a(e,t),p=s/n*u):p=u;;)if(f=r(f||o,p),i.push(1+f.x),s+=16,!(Math.abs(f.x)>l&&Math.abs(f.v)>l))break;return c?function(e){return i[e*(i.length-1)|0]}:s}}();v.Easings={linear:function(e){return e},swing:function(e){return.5-Math.cos(e*Math.PI)/2},spring:function(e){return 1-Math.cos(4.5*e*Math.PI)*Math.exp(6*-e)}},$.each([["ease",[.25,.1,.25,1]],["ease-in",[.42,0,1,1]],["ease-out",[0,0,.58,1]],["ease-in-out",[.42,0,.58,1]],["easeInSine",[.47,0,.745,.715]],["easeOutSine",[.39,.575,.565,1]],["easeInOutSine",[.445,.05,.55,.95]],["easeInQuad",[.55,.085,.68,.53]],["easeOutQuad",[.25,.46,.45,.94]],["easeInOutQuad",[.455,.03,.515,.955]],["easeInCubic",[.55,.055,.675,.19]],["easeOutCubic",[.215,.61,.355,1]],["easeInOutCubic",[.645,.045,.355,1]],["easeInQuart",[.895,.03,.685,.22]],["easeOutQuart",[.165,.84,.44,1]],["easeInOutQuart",[.77,0,.175,1]],["easeInQuint",[.755,.05,.855,.06]],["easeOutQuint",[.23,1,.32,1]],["easeInOutQuint",[.86,0,.07,1]],["easeInExpo",[.95,.05,.795,.035]],["easeOutExpo",[.19,1,.22,1]],["easeInOutExpo",[1,0,0,1]],["easeInCirc",[.6,.04,.98,.335]],["easeOutCirc",[.075,.82,.165,1]],["easeInOutCirc",[.785,.135,.15,.86]]],function(e,t){v.Easings[t[0]]=l.apply(null,t[1])});var x=v.CSS={RegEx:{isHex:/^#([A-f\d]{3}){1,2}$/i,valueUnwrap:/^[A-z]+\((.*)\)$/i,wrappedValueAlreadyExtracted:/[0-9.]+ [0-9.]+ [0-9.]+( [0-9.]+)?/,valueSplit:/([A-z]+\(.+\))|(([A-z0-9#-.]+?)(?=\s|$))/gi},Lists:{colors:["fill","stroke","stopColor","color","backgroundColor","borderColor","borderTopColor","borderRightColor","borderBottomColor","borderLeftColor","outlineColor"],transformsBase:["translateX","translateY","scale","scaleX","scaleY","skewX","skewY","rotateZ"],transforms3D:["transformPerspective","translateZ","scaleZ","rotateX","rotateY"]},Hooks:{templates:{textShadow:["Color X Y Blur","black 0px 0px 0px"],boxShadow:["Color X Y Blur Spread","black 0px 0px 0px 0px"],clip:["Top Right Bottom Left","0px 0px 0px 0px"],backgroundPosition:["X Y","0% 0%"],transformOrigin:["X Y Z","50% 50% 0px"],perspectiveOrigin:["X Y","50% 50%"]},registered:{},register:function(){for(var e=0;e<x.Lists.colors.length;e++){var t="color"===x.Lists.colors[e]?"0 0 0 1":"255 255 255 1";x.Hooks.templates[x.Lists.colors[e]]=["Red Green Blue Alpha",t]}var r,a,n;if(f)for(r in x.Hooks.templates){a=x.Hooks.templates[r],n=a[0].split(" ");var o=a[1].match(x.RegEx.valueSplit);"Color"===n[0]&&(n.push(n.shift()),o.push(o.shift()),x.Hooks.templates[r]=[n.join(" "),o.join(" ")])}for(r in x.Hooks.templates){a=x.Hooks.templates[r],n=a[0].split(" ");for(var e in n){var i=r+n[e],s=e;x.Hooks.registered[i]=[r,s]}}},getRoot:function(e){var t=x.Hooks.registered[e];return t?t[0]:e},cleanRootPropertyValue:function(e,t){return x.RegEx.valueUnwrap.test(t)&&(t=t.match(x.RegEx.valueUnwrap)[1]),x.Values.isCSSNullValue(t)&&(t=x.Hooks.templates[e][1]),t},extractValue:function(e,t){var r=x.Hooks.registered[e];if(r){var a=r[0],n=r[1];return t=x.Hooks.cleanRootPropertyValue(a,t),t.toString().match(x.RegEx.valueSplit)[n]}return t},injectValue:function(e,t,r){var a=x.Hooks.registered[e];if(a){var n=a[0],o=a[1],i,s;return r=x.Hooks.cleanRootPropertyValue(n,r),i=r.toString().match(x.RegEx.valueSplit),i[o]=t,s=i.join(" ")}return r}},Normalizations:{registered:{clip:function(e,t,r){switch(e){case"name":return"clip";case"extract":var a;return x.RegEx.wrappedValueAlreadyExtracted.test(r)?a=r:(a=r.toString().match(x.RegEx.valueUnwrap),a=a?a[1].replace(/,(\s+)?/g," "):r),a;case"inject":return"rect("+r+")"}},blur:function(e,t,r){switch(e){case"name":return v.State.isFirefox?"filter":"-webkit-filter";case"extract":var a=parseFloat(r);if(!a&&0!==a){var n=r.toString().match(/blur\(([0-9]+[A-z]+)\)/i);a=n?n[1]:0}return a;case"inject":return parseFloat(r)?"blur("+r+")":"none"}},opacity:function(e,t,r){if(8>=f)switch(e){case"name":return"filter";case"extract":var a=r.toString().match(/alpha\(opacity=(.*)\)/i);return r=a?a[1]/100:1;case"inject":return t.style.zoom=1,parseFloat(r)>=1?"":"alpha(opacity="+parseInt(100*parseFloat(r),10)+")"}else switch(e){case"name":return"opacity";case"extract":return r;case"inject":return r}}},register:function(){9>=f||v.State.isGingerbread||(x.Lists.transformsBase=x.Lists.transformsBase.concat(x.Lists.transforms3D));for(var e=0;e<x.Lists.transformsBase.length;e++)!function(){var t=x.Lists.transformsBase[e];x.Normalizations.registered[t]=function(e,r,n){switch(e){case"name":return"transform";case"extract":return i(r)===a||i(r).transformCache[t]===a?/^scale/i.test(t)?1:0:i(r).transformCache[t].replace(/[()]/g,"");case"inject":var o=!1;switch(t.substr(0,t.length-1)){case"translate":o=!/(%|px|em|rem|vw|vh|\d)$/i.test(n);break;case"scal":case"scale":v.State.isAndroid&&i(r).transformCache[t]===a&&1>n&&(n=1),o=!/(\d)$/i.test(n);break;case"skew":o=!/(deg|\d)$/i.test(n);break;case"rotate":o=!/(deg|\d)$/i.test(n)}return o||(i(r).transformCache[t]="("+n+")"),i(r).transformCache[t]}}}();for(var e=0;e<x.Lists.colors.length;e++)!function(){var t=x.Lists.colors[e];x.Normalizations.registered[t]=function(e,r,n){switch(e){case"name":return t;case"extract":var o;if(x.RegEx.wrappedValueAlreadyExtracted.test(n))o=n;else{var i,s={black:"rgb(0, 0, 0)",blue:"rgb(0, 0, 255)",gray:"rgb(128, 128, 128)",green:"rgb(0, 128, 0)",red:"rgb(255, 0, 0)",white:"rgb(255, 255, 255)"};/^[A-z]+$/i.test(n)?i=s[n]!==a?s[n]:s.black:x.RegEx.isHex.test(n)?i="rgb("+x.Values.hexToRgb(n).join(" ")+")":/^rgba?\(/i.test(n)||(i=s.black),o=(i||n).toString().match(x.RegEx.valueUnwrap)[1].replace(/,(\s+)?/g," ")}return 8>=f||3!==o.split(" ").length||(o+=" 1"),o;case"inject":return 8>=f?4===n.split(" ").length&&(n=n.split(/\s+/).slice(0,3).join(" ")):3===n.split(" ").length&&(n+=" 1"),(8>=f?"rgb":"rgba")+"("+n.replace(/\s+/g,",").replace(/\.(\d)+(?=,)/g,"")+")"}}}()}},Names:{camelCase:function(e){return e.replace(/-(\w)/g,function(e,t){return t.toUpperCase()})},SVGAttribute:function(e){var t="width|height|x|y|cx|cy|r|rx|ry|x1|x2|y1|y2";return(f||v.State.isAndroid&&!v.State.isChrome)&&(t+="|transform"),new RegExp("^("+t+")$","i").test(e)},prefixCheck:function(e){if(v.State.prefixMatches[e])return[v.State.prefixMatches[e],!0];for(var t=["","Webkit","Moz","ms","O"],r=0,a=t.length;a>r;r++){var n;if(n=0===r?e:t[r]+e.replace(/^\w/,function(e){return e.toUpperCase()}),g.isString(v.State.prefixElement.style[n]))return v.State.prefixMatches[e]=n,[n,!0]}return[e,!1]}},Values:{hexToRgb:function(e){var t=/^#?([a-f\d])([a-f\d])([a-f\d])$/i,r=/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i,a;return e=e.replace(t,function(e,t,r,a){return t+t+r+r+a+a}),a=r.exec(e),a?[parseInt(a[1],16),parseInt(a[2],16),parseInt(a[3],16)]:[0,0,0]},isCSSNullValue:function(e){return 0==e||/^(none|auto|transparent|(rgba\(0, ?0, ?0, ?0\)))$/i.test(e)},getUnitType:function(e){return/^(rotate|skew)/i.test(e)?"deg":/(^(scale|scaleX|scaleY|scaleZ|alpha|flexGrow|flexHeight|zIndex|fontWeight)$)|((opacity|red|green|blue|alpha)$)/i.test(e)?"":"px"},getDisplayType:function(e){var t=e&&e.tagName.toString().toLowerCase();return/^(b|big|i|small|tt|abbr|acronym|cite|code|dfn|em|kbd|strong|samp|var|a|bdo|br|img|map|object|q|script|span|sub|sup|button|input|label|select|textarea)$/i.test(t)?"inline":/^(li)$/i.test(t)?"list-item":/^(tr)$/i.test(t)?"table-row":/^(table)$/i.test(t)?"table":/^(tbody)$/i.test(t)?"table-row-group":"block"},addClass:function(e,t){e.classList?e.classList.add(t):e.className+=(e.className.length?" ":"")+t},removeClass:function(e,t){e.classList?e.classList.remove(t):e.className=e.className.toString().replace(new RegExp("(^|\\s)"+t.split(" ").join("|")+"(\\s|$)","gi")," ")}},getPropertyValue:function(e,r,n,o){function s(e,r){function n(){u&&x.setPropertyValue(e,"display","none")}var l=0;if(8>=f)l=$.css(e,r);else{var u=!1;if(/^(width|height)$/.test(r)&&0===x.getPropertyValue(e,"display")&&(u=!0,x.setPropertyValue(e,"display",x.Values.getDisplayType(e))),!o){if("height"===r&&"border-box"!==x.getPropertyValue(e,"boxSizing").toString().toLowerCase()){var c=e.offsetHeight-(parseFloat(x.getPropertyValue(e,"borderTopWidth"))||0)-(parseFloat(x.getPropertyValue(e,"borderBottomWidth"))||0)-(parseFloat(x.getPropertyValue(e,"paddingTop"))||0)-(parseFloat(x.getPropertyValue(e,"paddingBottom"))||0);return n(),c}if("width"===r&&"border-box"!==x.getPropertyValue(e,"boxSizing").toString().toLowerCase()){var p=e.offsetWidth-(parseFloat(x.getPropertyValue(e,"borderLeftWidth"))||0)-(parseFloat(x.getPropertyValue(e,"borderRightWidth"))||0)-(parseFloat(x.getPropertyValue(e,"paddingLeft"))||0)-(parseFloat(x.getPropertyValue(e,"paddingRight"))||0);return n(),p}}var d;d=i(e)===a?t.getComputedStyle(e,null):i(e).computedStyle?i(e).computedStyle:i(e).computedStyle=t.getComputedStyle(e,null),"borderColor"===r&&(r="borderTopColor"),l=9===f&&"filter"===r?d.getPropertyValue(r):d[r],(""===l||null===l)&&(l=e.style[r]),n()}if("auto"===l&&/^(top|right|bottom|left)$/i.test(r)){var g=s(e,"position");("fixed"===g||"absolute"===g&&/top|left/i.test(r))&&(l=$(e).position()[r]+"px")}return l}var l;if(x.Hooks.registered[r]){var u=r,c=x.Hooks.getRoot(u);n===a&&(n=x.getPropertyValue(e,x.Names.prefixCheck(c)[0])),x.Normalizations.registered[c]&&(n=x.Normalizations.registered[c]("extract",e,n)),l=x.Hooks.extractValue(u,n)}else if(x.Normalizations.registered[r]){var p,d;p=x.Normalizations.registered[r]("name",e),"transform"!==p&&(d=s(e,x.Names.prefixCheck(p)[0]),x.Values.isCSSNullValue(d)&&x.Hooks.templates[r]&&(d=x.Hooks.templates[r][1])),l=x.Normalizations.registered[r]("extract",e,d)}if(!/^[\d-]/.test(l))if(i(e)&&i(e).isSVG&&x.Names.SVGAttribute(r))if(/^(height|width)$/i.test(r))try{l=e.getBBox()[r]}catch(g){l=0}else l=e.getAttribute(r);else l=s(e,x.Names.prefixCheck(r)[0]);return x.Values.isCSSNullValue(l)&&(l=0),v.debug>=2&&console.log("Get "+r+": "+l),l},setPropertyValue:function(e,r,a,n,o){var s=r;if("scroll"===r)o.container?o.container["scroll"+o.direction]=a:"Left"===o.direction?t.scrollTo(a,o.alternateValue):t.scrollTo(o.alternateValue,a);else if(x.Normalizations.registered[r]&&"transform"===x.Normalizations.registered[r]("name",e))x.Normalizations.registered[r]("inject",e,a),s="transform",a=i(e).transformCache[r];else{if(x.Hooks.registered[r]){var l=r,u=x.Hooks.getRoot(r);n=n||x.getPropertyValue(e,u),a=x.Hooks.injectValue(l,a,n),r=u}if(x.Normalizations.registered[r]&&(a=x.Normalizations.registered[r]("inject",e,a),r=x.Normalizations.registered[r]("name",e)),s=x.Names.prefixCheck(r)[0],8>=f)try{e.style[s]=a}catch(c){v.debug&&console.log("Browser does not support ["+a+"] for ["+s+"]")}else i(e)&&i(e).isSVG&&x.Names.SVGAttribute(r)?e.setAttribute(r,a):e.style[s]=a;v.debug>=2&&console.log("Set "+r+" ("+s+"): "+a)}return[s,a]},flushTransformCache:function(e){function t(t){return parseFloat(x.getPropertyValue(e,t))}var r="";if((f||v.State.isAndroid&&!v.State.isChrome)&&i(e).isSVG){var a={translate:[t("translateX"),t("translateY")],skewX:[t("skewX")],skewY:[t("skewY")],scale:1!==t("scale")?[t("scale"),t("scale")]:[t("scaleX"),t("scaleY")],rotate:[t("rotateZ"),0,0]};$.each(i(e).transformCache,function(e){/^translate/i.test(e)?e="translate":/^scale/i.test(e)?e="scale":/^rotate/i.test(e)&&(e="rotate"),a[e]&&(r+=e+"("+a[e].join(" ")+") ",delete a[e])})}else{var n,o;$.each(i(e).transformCache,function(t){return n=i(e).transformCache[t],"transformPerspective"===t?(o=n,!0):(9===f&&"rotateZ"===t&&(t="rotate"),void(r+=t+n+" "))}),o&&(r="perspective"+o+" "+r)}x.setPropertyValue(e,"transform",r)}};x.Hooks.register(),x.Normalizations.register(),v.hook=function(e,t,r){var n=a;return e=o(e),$.each(e,function(e,o){if(i(o)===a&&v.init(o),r===a)n===a&&(n=v.CSS.getPropertyValue(o,t));else{var s=v.CSS.setPropertyValue(o,t,r);"transform"===s[0]&&v.CSS.flushTransformCache(o),n=s}}),n};var S=function(){function e(){return l?T.promise||null:f}function n(){function e(e){function p(e,t){var r=a,i=a,s=a;return g.isArray(e)?(r=e[0],!g.isArray(e[1])&&/^[\d-]/.test(e[1])||g.isFunction(e[1])||x.RegEx.isHex.test(e[1])?s=e[1]:(g.isString(e[1])&&!x.RegEx.isHex.test(e[1])||g.isArray(e[1]))&&(i=t?e[1]:u(e[1],o.duration),e[2]!==a&&(s=e[2]))):r=e,t||(i=i||o.easing),g.isFunction(r)&&(r=r.call(n,w,P)),g.isFunction(s)&&(s=s.call(n,w,P)),[r||0,i,s]}function f(e,t){var r,a;return a=(t||"0").toString().toLowerCase().replace(/[%A-z]+$/,function(e){return r=e,""}),r||(r=x.Values.getUnitType(e)),[a,r]}function d(){var e={myParent:n.parentNode||r.body,position:x.getPropertyValue(n,"position"),fontSize:x.getPropertyValue(n,"fontSize")},a=e.position===N.lastPosition&&e.myParent===N.lastParent,o=e.fontSize===N.lastFontSize;N.lastParent=e.myParent,N.lastPosition=e.position,N.lastFontSize=e.fontSize;var s=100,l={};if(o&&a)l.emToPx=N.lastEmToPx,l.percentToPxWidth=N.lastPercentToPxWidth,l.percentToPxHeight=N.lastPercentToPxHeight;else{var u=i(n).isSVG?r.createElementNS("http://www.w3.org/2000/svg","rect"):r.createElement("div");v.init(u),e.myParent.appendChild(u),$.each(["overflow","overflowX","overflowY"],function(e,t){v.CSS.setPropertyValue(u,t,"hidden")}),v.CSS.setPropertyValue(u,"position",e.position),v.CSS.setPropertyValue(u,"fontSize",e.fontSize),v.CSS.setPropertyValue(u,"boxSizing","content-box"),$.each(["minWidth","maxWidth","width","minHeight","maxHeight","height"],function(e,t){v.CSS.setPropertyValue(u,t,s+"%")}),v.CSS.setPropertyValue(u,"paddingLeft",s+"em"),l.percentToPxWidth=N.lastPercentToPxWidth=(parseFloat(x.getPropertyValue(u,"width",null,!0))||1)/s,l.percentToPxHeight=N.lastPercentToPxHeight=(parseFloat(x.getPropertyValue(u,"height",null,!0))||1)/s,l.emToPx=N.lastEmToPx=(parseFloat(x.getPropertyValue(u,"paddingLeft"))||1)/s,e.myParent.removeChild(u)}return null===N.remToPx&&(N.remToPx=parseFloat(x.getPropertyValue(r.body,"fontSize"))||16),null===N.vwToPx&&(N.vwToPx=parseFloat(t.innerWidth)/100,N.vhToPx=parseFloat(t.innerHeight)/100),l.remToPx=N.remToPx,l.vwToPx=N.vwToPx,l.vhToPx=N.vhToPx,v.debug>=1&&console.log("Unit ratios: "+JSON.stringify(l),n),l}if(o.begin&&0===w)try{o.begin.call(m,m)}catch(y){setTimeout(function(){throw y},1)}if("scroll"===k){var S=/^x$/i.test(o.axis)?"Left":"Top",V=parseFloat(o.offset)||0,C,A,F;o.container?g.isWrapped(o.container)||g.isNode(o.container)?(o.container=o.container[0]||o.container,C=o.container["scroll"+S],F=C+$(n).position()[S.toLowerCase()]+V):o.container=null:(C=v.State.scrollAnchor[v.State["scrollProperty"+S]],A=v.State.scrollAnchor[v.State["scrollProperty"+("Left"===S?"Top":"Left")]],F=$(n).offset()[S.toLowerCase()]+V),s={scroll:{rootPropertyValue:!1,startValue:C,currentValue:C,endValue:F,unitType:"",easing:o.easing,scrollData:{container:o.container,direction:S,alternateValue:A}},element:n},v.debug&&console.log("tweensContainer (scroll): ",s.scroll,n)}else if("reverse"===k){if(!i(n).tweensContainer)return void $.dequeue(n,o.queue);"none"===i(n).opts.display&&(i(n).opts.display="auto"),"hidden"===i(n).opts.visibility&&(i(n).opts.visibility="visible"),i(n).opts.loop=!1,i(n).opts.begin=null,i(n).opts.complete=null,b.easing||delete o.easing,b.duration||delete o.duration,o=$.extend({},i(n).opts,o);var E=$.extend(!0,{},i(n).tweensContainer);for(var j in E)if("element"!==j){var H=E[j].startValue;E[j].startValue=E[j].currentValue=E[j].endValue,E[j].endValue=H,g.isEmptyObject(b)||(E[j].easing=o.easing),v.debug&&console.log("reverse tweensContainer ("+j+"): "+JSON.stringify(E[j]),n)}s=E}else if("start"===k){var E;i(n).tweensContainer&&i(n).isAnimating===!0&&(E=i(n).tweensContainer),$.each(h,function(e,t){if(RegExp("^"+x.Lists.colors.join("$|^")+"$").test(e)){var r=p(t,!0),n=r[0],o=r[1],i=r[2];if(x.RegEx.isHex.test(n)){for(var s=["Red","Green","Blue"],l=x.Values.hexToRgb(n),u=i?x.Values.hexToRgb(i):a,c=0;c<s.length;c++){var f=[l[c]];o&&f.push(o),u!==a&&f.push(u[c]),h[e+s[c]]=f}delete h[e]}}});for(var R in h){var O=p(h[R]),z=O[0],q=O[1],M=O[2];R=x.Names.camelCase(R);var I=x.Hooks.getRoot(R),B=!1;if(i(n).isSVG||"tween"===I||x.Names.prefixCheck(I)[1]!==!1||x.Normalizations.registered[I]!==a){(o.display!==a&&null!==o.display&&"none"!==o.display||o.visibility!==a&&"hidden"!==o.visibility)&&/opacity|filter/.test(R)&&!M&&0!==z&&(M=0),o._cacheValues&&E&&E[R]?(M===a&&(M=E[R].endValue+E[R].unitType),B=i(n).rootPropertyValueCache[I]):x.Hooks.registered[R]?M===a?(B=x.getPropertyValue(n,I),M=x.getPropertyValue(n,R,B)):B=x.Hooks.templates[I][1]:M===a&&(M=x.getPropertyValue(n,R));var W,G,D,X=!1;if(W=f(R,M),M=W[0],D=W[1],W=f(R,z),z=W[0].replace(/^([+-\/*])=/,function(e,t){return X=t,""}),G=W[1],M=parseFloat(M)||0,z=parseFloat(z)||0,"%"===G&&(/^(fontSize|lineHeight)$/.test(R)?(z/=100,G="em"):/^scale/.test(R)?(z/=100,G=""):/(Red|Green|Blue)$/i.test(R)&&(z=z/100*255,G="")),/[\/*]/.test(X))G=D;else if(D!==G&&0!==M)if(0===z)G=D;else{l=l||d();var Y=/margin|padding|left|right|width|text|word|letter/i.test(R)||/X$/.test(R)||"x"===R?"x":"y";switch(D){case"%":M*="x"===Y?l.percentToPxWidth:l.percentToPxHeight;break;case"px":break;default:M*=l[D+"ToPx"]}switch(G){case"%":M*=1/("x"===Y?l.percentToPxWidth:l.percentToPxHeight);break;case"px":break;default:M*=1/l[G+"ToPx"]}}switch(X){case"+":z=M+z;break;case"-":z=M-z;break;case"*":z=M*z;break;case"/":z=M/z}s[R]={rootPropertyValue:B,startValue:M,currentValue:M,endValue:z,unitType:G,easing:q},v.debug&&console.log("tweensContainer ("+R+"): "+JSON.stringify(s[R]),n)}else v.debug&&console.log("Skipping ["+I+"] due to a lack of browser support.")}s.element=n}s.element&&(x.Values.addClass(n,"velocity-animating"),L.push(s),""===o.queue&&(i(n).tweensContainer=s,i(n).opts=o),i(n).isAnimating=!0,w===P-1?(v.State.calls.push([L,m,o,null,T.resolver]),v.State.isTicking===!1&&(v.State.isTicking=!0,c())):w++)}var n=this,o=$.extend({},v.defaults,b),s={},l;switch(i(n)===a&&v.init(n),parseFloat(o.delay)&&o.queue!==!1&&$.queue(n,o.queue,function(e){v.velocityQueueEntryFlag=!0,i(n).delayTimer={setTimeout:setTimeout(e,parseFloat(o.delay)),next:e}}),o.duration.toString().toLowerCase()){case"fast":o.duration=200;break;case"normal":o.duration=y;break;case"slow":o.duration=600;break;default:o.duration=parseFloat(o.duration)||1}v.mock!==!1&&(v.mock===!0?o.duration=o.delay=1:(o.duration*=parseFloat(v.mock)||1,o.delay*=parseFloat(v.mock)||1)),o.easing=u(o.easing,o.duration),o.begin&&!g.isFunction(o.begin)&&(o.begin=null),o.progress&&!g.isFunction(o.progress)&&(o.progress=null),o.complete&&!g.isFunction(o.complete)&&(o.complete=null),o.display!==a&&null!==o.display&&(o.display=o.display.toString().toLowerCase(),"auto"===o.display&&(o.display=v.CSS.Values.getDisplayType(n))),o.visibility!==a&&null!==o.visibility&&(o.visibility=o.visibility.toString().toLowerCase()),o.mobileHA=o.mobileHA&&v.State.isMobile&&!v.State.isGingerbread,o.queue===!1?o.delay?setTimeout(e,o.delay):e():$.queue(n,o.queue,function(t,r){return r===!0?(T.promise&&T.resolver(m),!0):(v.velocityQueueEntryFlag=!0,void e(t))}),""!==o.queue&&"fx"!==o.queue||"inprogress"===$.queue(n)[0]||$.dequeue(n)}var s=arguments[0]&&(arguments[0].p||$.isPlainObject(arguments[0].properties)&&!arguments[0].properties.names||g.isString(arguments[0].properties)),l,f,d,m,h,b;if(g.isWrapped(this)?(l=!1,d=0,m=this,f=this):(l=!0,d=1,m=s?arguments[0].elements||arguments[0].e:arguments[0]),m=o(m)){s?(h=arguments[0].properties||arguments[0].p,b=arguments[0].options||arguments[0].o):(h=arguments[d],b=arguments[d+1]);var P=m.length,w=0;if(!/^(stop|finish)$/i.test(h)&&!$.isPlainObject(b)){var V=d+1;b={};for(var C=V;C<arguments.length;C++)g.isArray(arguments[C])||!/^(fast|normal|slow)$/i.test(arguments[C])&&!/^\d/.test(arguments[C])?g.isString(arguments[C])||g.isArray(arguments[C])?b.easing=arguments[C]:g.isFunction(arguments[C])&&(b.complete=arguments[C]):b.duration=arguments[C]}var T={promise:null,resolver:null,rejecter:null};l&&v.Promise&&(T.promise=new v.Promise(function(e,t){T.resolver=e,T.rejecter=t}));var k;switch(h){case"scroll":k="scroll";break;case"reverse":k="reverse";break;case"finish":case"stop":$.each(m,function(e,t){i(t)&&i(t).delayTimer&&(clearTimeout(i(t).delayTimer.setTimeout),i(t).delayTimer.next&&i(t).delayTimer.next(),delete i(t).delayTimer)});var A=[];return $.each(v.State.calls,function(e,t){t&&$.each(t[1],function(r,n){var o=b===a?"":b;return o===!0||t[2].queue===o||b===a&&t[2].queue===!1?void $.each(m,function(r,a){a===n&&((b===!0||g.isString(b))&&($.each($.queue(a,g.isString(b)?b:""),function(e,t){g.isFunction(t)&&t(null,!0)}),$.queue(a,g.isString(b)?b:"",[])),"stop"===h?(i(a)&&i(a).tweensContainer&&o!==!1&&$.each(i(a).tweensContainer,function(e,t){t.endValue=t.currentValue
}),A.push(e)):"finish"===h&&(t[2].duration=1))}):!0})}),"stop"===h&&($.each(A,function(e,t){p(t,!0)}),T.promise&&T.resolver(m)),e();default:if(!$.isPlainObject(h)||g.isEmptyObject(h)){if(g.isString(h)&&v.Redirects[h]){var F=$.extend({},b),E=F.duration,j=F.delay||0;return F.backwards===!0&&(m=$.extend(!0,[],m).reverse()),$.each(m,function(e,t){parseFloat(F.stagger)?F.delay=j+parseFloat(F.stagger)*e:g.isFunction(F.stagger)&&(F.delay=j+F.stagger.call(t,e,P)),F.drag&&(F.duration=parseFloat(E)||(/^(callout|transition)/.test(h)?1e3:y),F.duration=Math.max(F.duration*(F.backwards?1-e/P:(e+1)/P),.75*F.duration,200)),v.Redirects[h].call(t,t,F||{},e,P,m,T.promise?T:a)}),e()}var H="Velocity: First argument ("+h+") was not a property map, a known action, or a registered redirect. Aborting.";return T.promise?T.rejecter(new Error(H)):console.log(H),e()}k="start"}var N={lastParent:null,lastPosition:null,lastFontSize:null,lastPercentToPxWidth:null,lastPercentToPxHeight:null,lastEmToPx:null,remToPx:null,vwToPx:null,vhToPx:null},L=[];$.each(m,function(e,t){g.isNode(t)&&n.call(t)});var F=$.extend({},v.defaults,b),R;if(F.loop=parseInt(F.loop),R=2*F.loop-1,F.loop)for(var O=0;R>O;O++){var z={delay:F.delay,progress:F.progress};O===R-1&&(z.display=F.display,z.visibility=F.visibility,z.complete=F.complete),S(m,"reverse",z)}return e()}};v=$.extend(S,v),v.animate=S;var P=t.requestAnimationFrame||d;return v.State.isMobile||r.hidden===a||r.addEventListener("visibilitychange",function(){r.hidden?(P=function(e){return setTimeout(function(){e(!0)},16)},c()):P=t.requestAnimationFrame||d}),e.Velocity=v,e!==t&&(e.fn.velocity=S,e.fn.velocity.defaults=v.defaults),$.each(["Down","Up"],function(e,t){v.Redirects["slide"+t]=function(e,r,n,o,i,s){var l=$.extend({},r),u=l.begin,c=l.complete,p={height:"",marginTop:"",marginBottom:"",paddingTop:"",paddingBottom:""},f={};l.display===a&&(l.display="Down"===t?"inline"===v.CSS.Values.getDisplayType(e)?"inline-block":"block":"none"),l.begin=function(){u&&u.call(i,i);for(var r in p){f[r]=e.style[r];var a=v.CSS.getPropertyValue(e,r);p[r]="Down"===t?[a,0]:[0,a]}f.overflow=e.style.overflow,e.style.overflow="hidden"},l.complete=function(){for(var t in f)e.style[t]=f[t];c&&c.call(i,i),s&&s.resolver(i)},v(e,p,l)}}),$.each(["In","Out"],function(e,t){v.Redirects["fade"+t]=function(e,r,n,o,i,s){var l=$.extend({},r),u={opacity:"In"===t?1:0},c=l.complete;l.complete=n!==o-1?l.begin=null:function(){c&&c.call(i,i),s&&s.resolver(i)},l.display===a&&(l.display="In"===t?"auto":"none"),v(this,u,l)}}),v}(window.jQuery||window.Zepto||window,window,document)});
/**********************
   Velocity UI Pack
**********************/

/* VelocityJS.org UI Pack (5.0.4). (C) 2014 Julian Shapiro. MIT @license: en.wikipedia.org/wiki/MIT_License. Portions copyright Daniel Eden, Christian Pucci. */

;(function (factory) {
    /* CommonJS module. */
    if (typeof require === "function" && typeof exports === "object" ) {
        module.exports = factory();
    /* AMD module. */
    } else if (typeof define === "function" && define.amd) {
        define([ "velocity" ], factory);
    /* Browser globals. */
    } else {
        factory();
    }
}(function() {
return function (global, window, document, undefined) {

    /*************
        Checks
    *************/

    if (!global.Velocity || !global.Velocity.Utilities) {
        window.console && console.log("Velocity UI Pack: Velocity must be loaded first. Aborting.");
        return;
    } else {
        var Velocity = global.Velocity,
            $ = Velocity.Utilities;
    }

    var velocityVersion = Velocity.version,
        requiredVersion = { major: 1, minor: 1, patch: 0 };

    function greaterSemver (primary, secondary) {
        var versionInts = [];

        if (!primary || !secondary) { return false; }

        $.each([ primary, secondary ], function(i, versionObject) {
            var versionIntsComponents = [];

            $.each(versionObject, function(component, value) {
                while (value.toString().length < 5) {
                    value = "0" + value;
                }
                versionIntsComponents.push(value);
            });

            versionInts.push(versionIntsComponents.join(""))
        });

        return (parseFloat(versionInts[0]) > parseFloat(versionInts[1]));
    }

    if (greaterSemver(requiredVersion, velocityVersion)){
        var abortError = "Velocity UI Pack: You need to update Velocity (jquery.velocity.js) to a newer version. Visit http://github.com/julianshapiro/velocity.";
        alert(abortError);
        throw new Error(abortError);
    }

    /************************
       Effect Registration
    ************************/

    /* Note: RegisterUI is a legacy name. */
    Velocity.RegisterEffect = Velocity.RegisterUI = function (effectName, properties) {
        /* Animate the expansion/contraction of the elements' parent's height for In/Out effects. */
        function animateParentHeight (elements, direction, totalDuration, stagger) {
            var totalHeightDelta = 0,
                parentNode;

            /* Sum the total height (including padding and margin) of all targeted elements. */
            $.each(elements.nodeType ? [ elements ] : elements, function(i, element) {
                if (stagger) {
                    /* Increase the totalDuration by the successive delay amounts produced by the stagger option. */
                    totalDuration += i * stagger;
                }

                parentNode = element.parentNode;

                $.each([ "height", "paddingTop", "paddingBottom", "marginTop", "marginBottom"], function(i, property) {
                    totalHeightDelta += parseFloat(Velocity.CSS.getPropertyValue(element, property));
                });
            });

            /* Animate the parent element's height adjustment (with a varying duration multiplier for aesthetic benefits). */
            Velocity.animate(
                parentNode,
                { height: (direction === "In" ? "+" : "-") + "=" + totalHeightDelta },
                { queue: false, easing: "ease-in-out", duration: totalDuration * (direction === "In" ? 0.6 : 1) }
            );
        }

        /* Register a custom redirect for each effect. */
        Velocity.Redirects[effectName] = function (element, redirectOptions, elementsIndex, elementsSize, elements, promiseData) {
            var finalElement = (elementsIndex === elementsSize - 1);

            if (typeof properties.defaultDuration === "function") {
                properties.defaultDuration = properties.defaultDuration.call(elements, elements);
            } else {
                properties.defaultDuration = parseFloat(properties.defaultDuration);
            }

            /* Iterate through each effect's call array. */
            for (var callIndex = 0; callIndex < properties.calls.length; callIndex++) {
                var call = properties.calls[callIndex],
                    propertyMap = call[0],
                    redirectDuration = (redirectOptions.duration || properties.defaultDuration || 1000),
                    durationPercentage = call[1],
                    callOptions = call[2] || {},
                    opts = {};

                /* Assign the whitelisted per-call options. */
                opts.duration = redirectDuration * (durationPercentage || 1);
                opts.queue = redirectOptions.queue || "";
                opts.easing = callOptions.easing || "ease";
                opts.delay = parseFloat(callOptions.delay) || 0;
                opts._cacheValues = callOptions._cacheValues || true;

                /* Special processing for the first effect call. */
                if (callIndex === 0) {
                    /* If a delay was passed into the redirect, combine it with the first call's delay. */
                    opts.delay += (parseFloat(redirectOptions.delay) || 0);

                    if (elementsIndex === 0) {
                        opts.begin = function() {
                            /* Only trigger a begin callback on the first effect call with the first element in the set. */
                            redirectOptions.begin && redirectOptions.begin.call(elements, elements);

                            var direction = effectName.match(/(In|Out)$/);

                            /* Make "in" transitioning elements invisible immediately so that there's no FOUC between now
                               and the first RAF tick. */
                            if ((direction && direction[0] === "In") && propertyMap.opacity !== undefined) {
                                $.each(elements.nodeType ? [ elements ] : elements, function(i, element) {
                                    Velocity.CSS.setPropertyValue(element, "opacity", 0);
                                });
                            }

                            /* Only trigger animateParentHeight() if we're using an In/Out transition. */
                            if (redirectOptions.animateParentHeight && direction) {
                                animateParentHeight(elements, direction[0], redirectDuration + opts.delay, redirectOptions.stagger);
                            }
                        }
                    }

                    /* If the user isn't overriding the display option, default to "auto" for "In"-suffixed transitions. */
                    if (redirectOptions.display !== null) {
                        if (redirectOptions.display !== undefined && redirectOptions.display !== "none") {
                            opts.display = redirectOptions.display;
                        } else if (/In$/.test(effectName)) {
                            /* Inline elements cannot be subjected to transforms, so we switch them to inline-block. */
                            var defaultDisplay = Velocity.CSS.Values.getDisplayType(element);
                            opts.display = (defaultDisplay === "inline") ? "inline-block" : defaultDisplay;
                        }
                    }

                    if (redirectOptions.visibility && redirectOptions.visibility !== "hidden") {
                        opts.visibility = redirectOptions.visibility;
                    }
                }

                /* Special processing for the last effect call. */
                if (callIndex === properties.calls.length - 1) {
                    /* Append promise resolving onto the user's redirect callback. */
                    function injectFinalCallbacks () {
                        if ((redirectOptions.display === undefined || redirectOptions.display === "none") && /Out$/.test(effectName)) {
                            $.each(elements.nodeType ? [ elements ] : elements, function(i, element) {
                                Velocity.CSS.setPropertyValue(element, "display", "none");
                            });
                        }

                        redirectOptions.complete && redirectOptions.complete.call(elements, elements);

                        if (promiseData) {
                            promiseData.resolver(elements || element);
                        }
                    }

                    opts.complete = function() {
                        if (properties.reset) {
                            for (var resetProperty in properties.reset) {
                                var resetValue = properties.reset[resetProperty];

                                /* Format each non-array value in the reset property map to [ value, value ] so that changes apply
                                   immediately and DOM querying is avoided (via forcefeeding). */
                                /* Note: Don't forcefeed hooks, otherwise their hook roots will be defaulted to their null values. */
                                if (Velocity.CSS.Hooks.registered[resetProperty] === undefined && (typeof resetValue === "string" || typeof resetValue === "number")) {
                                    properties.reset[resetProperty] = [ properties.reset[resetProperty], properties.reset[resetProperty] ];
                                }
                            }

                            /* So that the reset values are applied instantly upon the next rAF tick, use a zero duration and parallel queueing. */
                            var resetOptions = { duration: 0, queue: false };

                            /* Since the reset option uses up the complete callback, we trigger the user's complete callback at the end of ours. */
                            if (finalElement) {
                                resetOptions.complete = injectFinalCallbacks;
                            }

                            Velocity.animate(element, properties.reset, resetOptions);
                        /* Only trigger the user's complete callback on the last effect call with the last element in the set. */
                        } else if (finalElement) {
                            injectFinalCallbacks();
                        }
                    };

                    if (redirectOptions.visibility === "hidden") {
                        opts.visibility = redirectOptions.visibility;
                    }
                }

                Velocity.animate(element, propertyMap, opts);
            }
        };

        /* Return the Velocity object so that RegisterUI calls can be chained. */
        return Velocity;
    };

    /*********************
       Packaged Effects
    *********************/

    /* Externalize the packagedEffects data so that they can optionally be modified and re-registered. */
    /* Support: <=IE8: Callouts will have no effect, and transitions will simply fade in/out. IE9/Android 2.3: Most effects are fully supported, the rest fade in/out. All other browsers: full support. */
    Velocity.RegisterEffect.packagedEffects =
        {
            /* Animate.css */
            "callout.bounce": {
                defaultDuration: 550,
                calls: [
                    [ { translateY: -30 }, 0.25 ],
                    [ { translateY: 0 }, 0.125 ],
                    [ { translateY: -15 }, 0.125 ],
                    [ { translateY: 0 }, 0.25 ]
                ]
            },
            /* Animate.css */
            "callout.shake": {
                defaultDuration: 800,
                calls: [
                    [ { translateX: -11 }, 0.125 ],
                    [ { translateX: 11 }, 0.125 ],
                    [ { translateX: -11 }, 0.125 ],
                    [ { translateX: 11 }, 0.125 ],
                    [ { translateX: -11 }, 0.125 ],
                    [ { translateX: 11 }, 0.125 ],
                    [ { translateX: -11 }, 0.125 ],
                    [ { translateX: 0 }, 0.125 ]
                ]
            },
            /* Animate.css */
            "callout.flash": {
                defaultDuration: 1100,
                calls: [
                    [ { opacity: [ 0, "easeInOutQuad", 1 ] }, 0.25 ],
                    [ { opacity: [ 1, "easeInOutQuad" ] }, 0.25 ],
                    [ { opacity: [ 0, "easeInOutQuad" ] }, 0.25 ],
                    [ { opacity: [ 1, "easeInOutQuad" ] }, 0.25 ]
                ]
            },
            /* Animate.css */
            "callout.pulse": {
                defaultDuration: 825,
                calls: [
                    [ { scaleX: 1.1, scaleY: 1.1 }, 0.50, { easing: "easeInExpo" } ],
                    [ { scaleX: 1, scaleY: 1 }, 0.50 ]
                ]
            },
            /* Animate.css */
            "callout.swing": {
                defaultDuration: 950,
                calls: [
                    [ { rotateZ: 15 }, 0.20 ],
                    [ { rotateZ: -10 }, 0.20 ],
                    [ { rotateZ: 5 }, 0.20 ],
                    [ { rotateZ: -5 }, 0.20 ],
                    [ { rotateZ: 0 }, 0.20 ]
                ]
            },
            /* Animate.css */
            "callout.tada": {
                defaultDuration: 1000,
                calls: [
                    [ { scaleX: 0.9, scaleY: 0.9, rotateZ: -3 }, 0.10 ],
                    [ { scaleX: 1.1, scaleY: 1.1, rotateZ: 3 }, 0.10 ],
                    [ { scaleX: 1.1, scaleY: 1.1, rotateZ: -3 }, 0.10 ],
                    [ "reverse", 0.125 ],
                    [ "reverse", 0.125 ],
                    [ "reverse", 0.125 ],
                    [ "reverse", 0.125 ],
                    [ "reverse", 0.125 ],
                    [ { scaleX: 1, scaleY: 1, rotateZ: 0 }, 0.20 ]
                ]
            },
            "transition.fadeIn": {
                defaultDuration: 500,
                calls: [
                    [ { opacity: [ 1, 0 ] } ]
                ]
            },
            "transition.fadeOut": {
                defaultDuration: 500,
                calls: [
                    [ { opacity: [ 0, 1 ] } ]
                ]
            },
            /* Support: Loses rotation in IE9/Android 2.3 (fades only). */
            "transition.flipXIn": {
                defaultDuration: 700,
                calls: [
                    [ { opacity: [ 1, 0 ], transformPerspective: [ 800, 800 ], rotateY: [ 0, -55 ] } ]
                ],
                reset: { transformPerspective: 0 }
            },
            /* Support: Loses rotation in IE9/Android 2.3 (fades only). */
            "transition.flipXOut": {
                defaultDuration: 700,
                calls: [
                    [ { opacity: [ 0, 1 ], transformPerspective: [ 800, 800 ], rotateY: 55 } ]
                ],
                reset: { transformPerspective: 0, rotateY: 0 }
            },
            /* Support: Loses rotation in IE9/Android 2.3 (fades only). */
            "transition.flipYIn": {
                defaultDuration: 800,
                calls: [
                    [ { opacity: [ 1, 0 ], transformPerspective: [ 800, 800 ], rotateX: [ 0, -45 ] } ]
                ],
                reset: { transformPerspective: 0 }
            },
            /* Support: Loses rotation in IE9/Android 2.3 (fades only). */
            "transition.flipYOut": {
                defaultDuration: 800,
                calls: [
                    [ { opacity: [ 0, 1 ], transformPerspective: [ 800, 800 ], rotateX: 25 } ]
                ],
                reset: { transformPerspective: 0, rotateX: 0 }
            },
            /* Animate.css */
            /* Support: Loses rotation in IE9/Android 2.3 (fades only). */
            "transition.flipBounceXIn": {
                defaultDuration: 900,
                calls: [
                    [ { opacity: [ 0.725, 0 ], transformPerspective: [ 400, 400 ], rotateY: [ -10, 90 ] }, 0.50 ],
                    [ { opacity: 0.80, rotateY: 10 }, 0.25 ],
                    [ { opacity: 1, rotateY: 0 }, 0.25 ]
                ],
                reset: { transformPerspective: 0 }
            },
            /* Animate.css */
            /* Support: Loses rotation in IE9/Android 2.3 (fades only). */
            "transition.flipBounceXOut": {
                defaultDuration: 800,
                calls: [
                    [ { opacity: [ 0.9, 1 ], transformPerspective: [ 400, 400 ], rotateY: -10 }, 0.50 ],
                    [ { opacity: 0, rotateY: 90 }, 0.50 ]
                ],
                reset: { transformPerspective: 0, rotateY: 0 }
            },
            /* Animate.css */
            /* Support: Loses rotation in IE9/Android 2.3 (fades only). */
            "transition.flipBounceYIn": {
                defaultDuration: 850,
                calls: [
                    [ { opacity: [ 0.725, 0 ], transformPerspective: [ 400, 400 ], rotateX: [ -10, 90 ] }, 0.50 ],
                    [ { opacity: 0.80, rotateX: 10 }, 0.25 ],
                    [ { opacity: 1, rotateX: 0 }, 0.25 ]
                ],
                reset: { transformPerspective: 0 }
            },
            /* Animate.css */
            /* Support: Loses rotation in IE9/Android 2.3 (fades only). */
            "transition.flipBounceYOut": {
                defaultDuration: 800,
                calls: [
                    [ { opacity: [ 0.9, 1 ], transformPerspective: [ 400, 400 ], rotateX: -15 }, 0.50 ],
                    [ { opacity: 0, rotateX: 90 }, 0.50 ]
                ],
                reset: { transformPerspective: 0, rotateX: 0 }
            },
            /* Magic.css */
            "transition.swoopIn": {
                defaultDuration: 850,
                calls: [
                    [ { opacity: [ 1, 0 ], transformOriginX: [ "100%", "50%" ], transformOriginY: [ "100%", "100%" ], scaleX: [ 1, 0 ], scaleY: [ 1, 0 ], translateX: [ 0, -700 ], translateZ: 0 } ]
                ],
                reset: { transformOriginX: "50%", transformOriginY: "50%" }
            },
            /* Magic.css */
            "transition.swoopOut": {
                defaultDuration: 850,
                calls: [
                    [ { opacity: [ 0, 1 ], transformOriginX: [ "50%", "100%" ], transformOriginY: [ "100%", "100%" ], scaleX: 0, scaleY: 0, translateX: -700, translateZ: 0 } ]
                ],
                reset: { transformOriginX: "50%", transformOriginY: "50%", scaleX: 1, scaleY: 1, translateX: 0 }
            },
            /* Magic.css */
            /* Support: Loses rotation in IE9/Android 2.3. (Fades and scales only.) */
            "transition.whirlIn": {
                defaultDuration: 850,
                calls: [
                    [ { opacity: [ 1, 0 ], transformOriginX: [ "50%", "50%" ], transformOriginY: [ "50%", "50%" ], scaleX: [ 1, 0 ], scaleY: [ 1, 0 ], rotateY: [ 0, 160 ] }, 1, { easing: "easeInOutSine" } ]
                ]
            },
            /* Magic.css */
            /* Support: Loses rotation in IE9/Android 2.3. (Fades and scales only.) */
            "transition.whirlOut": {
                defaultDuration: 750,
                calls: [
                    [ { opacity: [ 0, "easeInOutQuint", 1 ], transformOriginX: [ "50%", "50%" ], transformOriginY: [ "50%", "50%" ], scaleX: 0, scaleY: 0, rotateY: 160 }, 1, { easing: "swing" } ]
                ],
                reset: { scaleX: 1, scaleY: 1, rotateY: 0 }
            },
            "transition.shrinkIn": {
                defaultDuration: 750,
                calls: [
                    [ { opacity: [ 1, 0 ], transformOriginX: [ "50%", "50%" ], transformOriginY: [ "50%", "50%" ], scaleX: [ 1, 1.5 ], scaleY: [ 1, 1.5 ], translateZ: 0 } ]
                ]
            },
            "transition.shrinkOut": {
                defaultDuration: 600,
                calls: [
                    [ { opacity: [ 0, 1 ], transformOriginX: [ "50%", "50%" ], transformOriginY: [ "50%", "50%" ], scaleX: 1.3, scaleY: 1.3, translateZ: 0 } ]
                ],
                reset: { scaleX: 1, scaleY: 1 }
            },
            "transition.expandIn": {
                defaultDuration: 700,
                calls: [
                    [ { opacity: [ 1, 0 ], transformOriginX: [ "50%", "50%" ], transformOriginY: [ "50%", "50%" ], scaleX: [ 1, 0.625 ], scaleY: [ 1, 0.625 ], translateZ: 0 } ]
                ]
            },
            "transition.expandOut": {
                defaultDuration: 700,
                calls: [
                    [ { opacity: [ 0, 1 ], transformOriginX: [ "50%", "50%" ], transformOriginY: [ "50%", "50%" ], scaleX: 0.5, scaleY: 0.5, translateZ: 0 } ]
                ],
                reset: { scaleX: 1, scaleY: 1 }
            },
            /* Animate.css */
            "transition.bounceIn": {
                defaultDuration: 800,
                calls: [
                    [ { opacity: [ 1, 0 ], scaleX: [ 1.05, 0.3 ], scaleY: [ 1.05, 0.3 ] }, 0.40 ],
                    [ { scaleX: 0.9, scaleY: 0.9, translateZ: 0 }, 0.20 ],
                    [ { scaleX: 1, scaleY: 1 }, 0.50 ]
                ]
            },
            /* Animate.css */
            "transition.bounceOut": {
                defaultDuration: 800,
                calls: [
                    [ { scaleX: 0.95, scaleY: 0.95 }, 0.35 ],
                    [ { scaleX: 1.1, scaleY: 1.1, translateZ: 0 }, 0.35 ],
                    [ { opacity: [ 0, 1 ], scaleX: 0.3, scaleY: 0.3 }, 0.30 ]
                ],
                reset: { scaleX: 1, scaleY: 1 }
            },
            /* Animate.css */
            "transition.bounceUpIn": {
                defaultDuration: 800,
                calls: [
                    [ { opacity: [ 1, 0 ], translateY: [ -30, 1000 ] }, 0.60, { easing: "easeOutCirc" } ],
                    [ { translateY: 10 }, 0.20 ],
                    [ { translateY: 0 }, 0.20 ]
                ]
            },
            /* Animate.css */
            "transition.bounceUpOut": {
                defaultDuration: 1000,
                calls: [
                    [ { translateY: 20 }, 0.20 ],
                    [ { opacity: [ 0, "easeInCirc", 1 ], translateY: -1000 }, 0.80 ]
                ],
                reset: { translateY: 0 }
            },
            /* Animate.css */
            "transition.bounceDownIn": {
                defaultDuration: 800,
                calls: [
                    [ { opacity: [ 1, 0 ], translateY: [ 30, -1000 ] }, 0.60, { easing: "easeOutCirc" } ],
                    [ { translateY: -10 }, 0.20 ],
                    [ { translateY: 0 }, 0.20 ]
                ]
            },
            /* Animate.css */
            "transition.bounceDownOut": {
                defaultDuration: 1000,
                calls: [
                    [ { translateY: -20 }, 0.20 ],
                    [ { opacity: [ 0, "easeInCirc", 1 ], translateY: 1000 }, 0.80 ]
                ],
                reset: { translateY: 0 }
            },
            /* Animate.css */
            "transition.bounceLeftIn": {
                defaultDuration: 750,
                calls: [
                    [ { opacity: [ 1, 0 ], translateX: [ 30, -1250 ] }, 0.60, { easing: "easeOutCirc" } ],
                    [ { translateX: -10 }, 0.20 ],
                    [ { translateX: 0 }, 0.20 ]
                ]
            },
            /* Animate.css */
            "transition.bounceLeftOut": {
                defaultDuration: 750,
                calls: [
                    [ { translateX: 30 }, 0.20 ],
                    [ { opacity: [ 0, "easeInCirc", 1 ], translateX: -1250 }, 0.80 ]
                ],
                reset: { translateX: 0 }
            },
            /* Animate.css */
            "transition.bounceRightIn": {
                defaultDuration: 750,
                calls: [
                    [ { opacity: [ 1, 0 ], translateX: [ -30, 1250 ] }, 0.60, { easing: "easeOutCirc" } ],
                    [ { translateX: 10 }, 0.20 ],
                    [ { translateX: 0 }, 0.20 ]
                ]
            },
            /* Animate.css */
            "transition.bounceRightOut": {
                defaultDuration: 750,
                calls: [
                    [ { translateX: -30 }, 0.20 ],
                    [ { opacity: [ 0, "easeInCirc", 1 ], translateX: 1250 }, 0.80 ]
                ],
                reset: { translateX: 0 }
            },
            "transition.slideUpIn": {
                defaultDuration: 900,
                calls: [
                    [ { opacity: [ 1, 0 ], translateY: [ 0, 20 ], translateZ: 0 } ]
                ]
            },
            "transition.slideUpOut": {
                defaultDuration: 900,
                calls: [
                    [ { opacity: [ 0, 1 ], translateY: -20, translateZ: 0 } ]
                ],
                reset: { translateY: 0 }
            },
            "transition.slideDownIn": {
                defaultDuration: 900,
                calls: [
                    [ { opacity: [ 1, 0 ], translateY: [ 0, -20 ], translateZ: 0 } ]
                ]
            },
            "transition.slideDownOut": {
                defaultDuration: 900,
                calls: [
                    [ { opacity: [ 0, 1 ], translateY: 20, translateZ: 0 } ]
                ],
                reset: { translateY: 0 }
            },
            "transition.slideLeftIn": {
                defaultDuration: 1000,
                calls: [
                    [ { opacity: [ 1, 0 ], translateX: [ 0, -20 ], translateZ: 0 } ]
                ]
            },
            "transition.slideLeftOut": {
                defaultDuration: 1050,
                calls: [
                    [ { opacity: [ 0, 1 ], translateX: -20, translateZ: 0 } ]
                ],
                reset: { translateX: 0 }
            },
            "transition.slideRightIn": {
                defaultDuration: 1000,
                calls: [
                    [ { opacity: [ 1, 0 ], translateX: [ 0, 20 ], translateZ: 0 } ]
                ]
            },
            "transition.slideRightOut": {
                defaultDuration: 1050,
                calls: [
                    [ { opacity: [ 0, 1 ], translateX: 20, translateZ: 0 } ]
                ],
                reset: { translateX: 0 }
            },
            "transition.slideUpBigIn": {
                defaultDuration: 850,
                calls: [
                    [ { opacity: [ 1, 0 ], translateY: [ 0, 75 ], translateZ: 0 } ]
                ]
            },
            "transition.slideUpBigOut": {
                defaultDuration: 800,
                calls: [
                    [ { opacity: [ 0, 1 ], translateY: -75, translateZ: 0 } ]
                ],
                reset: { translateY: 0 }
            },
            "transition.slideDownBigIn": {
                defaultDuration: 850,
                calls: [
                    [ { opacity: [ 1, 0 ], translateY: [ 0, -75 ], translateZ: 0 } ]
                ]
            },
            "transition.slideDownBigOut": {
                defaultDuration: 800,
                calls: [
                    [ { opacity: [ 0, 1 ], translateY: 75, translateZ: 0 } ]
                ],
                reset: { translateY: 0 }
            },
            "transition.slideLeftBigIn": {
                defaultDuration: 800,
                calls: [
                    [ { opacity: [ 1, 0 ], translateX: [ 0, -75 ], translateZ: 0 } ]
                ]
            },
            "transition.slideLeftBigOut": {
                defaultDuration: 750,
                calls: [
                    [ { opacity: [ 0, 1 ], translateX: -75, translateZ: 0 } ]
                ],
                reset: { translateX: 0 }
            },
            "transition.slideRightBigIn": {
                defaultDuration: 800,
                calls: [
                    [ { opacity: [ 1, 0 ], translateX: [ 0, 75 ], translateZ: 0 } ]
                ]
            },
            "transition.slideRightBigOut": {
                defaultDuration: 750,
                calls: [
                    [ { opacity: [ 0, 1 ], translateX: 75, translateZ: 0 } ]
                ],
                reset: { translateX: 0 }
            },
            /* Magic.css */
            "transition.perspectiveUpIn": {
                defaultDuration: 800,
                calls: [
                    [ { opacity: [ 1, 0 ], transformPerspective: [ 800, 800 ], transformOriginX: [ 0, 0 ], transformOriginY: [ "100%", "100%" ], rotateX: [ 0, -180 ] } ]
                ],
                reset: { transformPerspective: 0, transformOriginX: "50%", transformOriginY: "50%" }
            },
            /* Magic.css */
            /* Support: Loses rotation in IE9/Android 2.3 (fades only). */
            "transition.perspectiveUpOut": {
                defaultDuration: 850,
                calls: [
                    [ { opacity: [ 0, 1 ], transformPerspective: [ 800, 800 ], transformOriginX: [ 0, 0 ], transformOriginY: [ "100%", "100%" ], rotateX: -180 } ]
                ],
                reset: { transformPerspective: 0, transformOriginX: "50%", transformOriginY: "50%", rotateX: 0 }
            },
            /* Magic.css */
            /* Support: Loses rotation in IE9/Android 2.3 (fades only). */
            "transition.perspectiveDownIn": {
                defaultDuration: 800,
                calls: [
                    [ { opacity: [ 1, 0 ], transformPerspective: [ 800, 800 ], transformOriginX: [ 0, 0 ], transformOriginY: [ 0, 0 ], rotateX: [ 0, 180 ] } ]
                ],
                reset: { transformPerspective: 0, transformOriginX: "50%", transformOriginY: "50%" }
            },
            /* Magic.css */
            /* Support: Loses rotation in IE9/Android 2.3 (fades only). */
            "transition.perspectiveDownOut": {
                defaultDuration: 850,
                calls: [
                    [ { opacity: [ 0, 1 ], transformPerspective: [ 800, 800 ], transformOriginX: [ 0, 0 ], transformOriginY: [ 0, 0 ], rotateX: 180 } ]
                ],
                reset: { transformPerspective: 0, transformOriginX: "50%", transformOriginY: "50%", rotateX: 0 }
            },
            /* Magic.css */
            /* Support: Loses rotation in IE9/Android 2.3 (fades only). */
            "transition.perspectiveLeftIn": {
                defaultDuration: 950,
                calls: [
                    [ { opacity: [ 1, 0 ], transformPerspective: [ 2000, 2000 ], transformOriginX: [ 0, 0 ], transformOriginY: [ 0, 0 ], rotateY: [ 0, -180 ] } ]
                ],
                reset: { transformPerspective: 0, transformOriginX: "50%", transformOriginY: "50%" }
            },
            /* Magic.css */
            /* Support: Loses rotation in IE9/Android 2.3 (fades only). */
            "transition.perspectiveLeftOut": {
                defaultDuration: 950,
                calls: [
                    [ { opacity: [ 0, 1 ], transformPerspective: [ 2000, 2000 ], transformOriginX: [ 0, 0 ], transformOriginY: [ 0, 0 ], rotateY: -180 } ]
                ],
                reset: { transformPerspective: 0, transformOriginX: "50%", transformOriginY: "50%", rotateY: 0 }
            },
            /* Magic.css */
            /* Support: Loses rotation in IE9/Android 2.3 (fades only). */
            "transition.perspectiveRightIn": {
                defaultDuration: 950,
                calls: [
                    [ { opacity: [ 1, 0 ], transformPerspective: [ 2000, 2000 ], transformOriginX: [ "100%", "100%" ], transformOriginY: [ 0, 0 ], rotateY: [ 0, 180 ] } ]
                ],
                reset: { transformPerspective: 0, transformOriginX: "50%", transformOriginY: "50%" }
            },
            /* Magic.css */
            /* Support: Loses rotation in IE9/Android 2.3 (fades only). */
            "transition.perspectiveRightOut": {
                defaultDuration: 950,
                calls: [
                    [ { opacity: [ 0, 1 ], transformPerspective: [ 2000, 2000 ], transformOriginX: [ "100%", "100%" ], transformOriginY: [ 0, 0 ], rotateY: 180 } ]
                ],
                reset: { transformPerspective: 0, transformOriginX: "50%", transformOriginY: "50%", rotateY: 0 }
            }
        };

    /* Register the packaged effects. */
    for (var effectName in Velocity.RegisterEffect.packagedEffects) {
        Velocity.RegisterEffect(effectName, Velocity.RegisterEffect.packagedEffects[effectName]);
    }

    /*********************
       Sequence Running
    **********************/

    /* Note: Sequence calls must use Velocity's single-object arguments syntax. */
    Velocity.RunSequence = function (originalSequence) {
        var sequence = $.extend(true, [], originalSequence);

        if (sequence.length > 1) {
            $.each(sequence.reverse(), function(i, currentCall) {
                var nextCall = sequence[i + 1];

                if (nextCall) {
                    /* Parallel sequence calls (indicated via sequenceQueue:false) are triggered
                       in the previous call's begin callback. Otherwise, chained calls are normally triggered
                       in the previous call's complete callback. */
                    var currentCallOptions = currentCall.o || currentCall.options,
                        nextCallOptions = nextCall.o || nextCall.options;

                    var timing = (currentCallOptions && currentCallOptions.sequenceQueue === false) ? "begin" : "complete",
                        callbackOriginal = nextCallOptions && nextCallOptions[timing],
                        options = {};

                    options[timing] = function() {
                        var nextCallElements = nextCall.e || nextCall.elements;
                        var elements = nextCallElements.nodeType ? [ nextCallElements ] : nextCallElements;

                        callbackOriginal && callbackOriginal.call(elements, elements);
                        Velocity(currentCall);
                    }

                    if (nextCall.o) {
                        nextCall.o = $.extend({}, nextCallOptions, options);
                    } else {
                        nextCall.options = $.extend({}, nextCallOptions, options);
                    }
                }
            });

            sequence.reverse();
        }

        Velocity(sequence[0]);
    };
}((window.jQuery || window.Zepto || window), window, document);
}));
/* VelocityJS.org UI Pack (5.0.4). (C) 2014 Julian Shapiro. MIT @license: en.wikipedia.org/wiki/MIT_License. Portions copyright Daniel Eden, Christian Pucci. */
!function(t){"function"==typeof require&&"object"==typeof exports?module.exports=t():"function"==typeof define&&define.amd?define(["velocity"],t):t()}(function(){return function(t,a,e,r){function n(t,a){var e=[];return t&&a?($.each([t,a],function(t,a){var r=[];$.each(a,function(t,a){for(;a.toString().length<5;)a="0"+a;r.push(a)}),e.push(r.join(""))}),parseFloat(e[0])>parseFloat(e[1])):!1}if(!t.Velocity||!t.Velocity.Utilities)return void(a.console&&console.log("Velocity UI Pack: Velocity must be loaded first. Aborting."));var i=t.Velocity,$=i.Utilities,s=i.version,o={major:1,minor:1,patch:0};if(n(o,s)){var l="Velocity UI Pack: You need to update Velocity (jquery.velocity.js) to a newer version. Visit http://github.com/julianshapiro/velocity.";throw alert(l),new Error(l)}i.RegisterEffect=i.RegisterUI=function(t,a){function e(t,a,e,r){var n=0,s;$.each(t.nodeType?[t]:t,function(t,a){r&&(e+=t*r),s=a.parentNode,$.each(["height","paddingTop","paddingBottom","marginTop","marginBottom"],function(t,e){n+=parseFloat(i.CSS.getPropertyValue(a,e))})}),i.animate(s,{height:("In"===a?"+":"-")+"="+n},{queue:!1,easing:"ease-in-out",duration:e*("In"===a?.6:1)})}return i.Redirects[t]=function(n,s,o,l,c,u){function f(){s.display!==r&&"none"!==s.display||!/Out$/.test(t)||$.each(c.nodeType?[c]:c,function(t,a){i.CSS.setPropertyValue(a,"display","none")}),s.complete&&s.complete.call(c,c),u&&u.resolver(c||n)}var p=o===l-1;a.defaultDuration="function"==typeof a.defaultDuration?a.defaultDuration.call(c,c):parseFloat(a.defaultDuration);for(var d=0;d<a.calls.length;d++){var g=a.calls[d],y=g[0],m=s.duration||a.defaultDuration||1e3,X=g[1],Y=g[2]||{},O={};if(O.duration=m*(X||1),O.queue=s.queue||"",O.easing=Y.easing||"ease",O.delay=parseFloat(Y.delay)||0,O._cacheValues=Y._cacheValues||!0,0===d){if(O.delay+=parseFloat(s.delay)||0,0===o&&(O.begin=function(){s.begin&&s.begin.call(c,c);var a=t.match(/(In|Out)$/);a&&"In"===a[0]&&y.opacity!==r&&$.each(c.nodeType?[c]:c,function(t,a){i.CSS.setPropertyValue(a,"opacity",0)}),s.animateParentHeight&&a&&e(c,a[0],m+O.delay,s.stagger)}),null!==s.display)if(s.display!==r&&"none"!==s.display)O.display=s.display;else if(/In$/.test(t)){var v=i.CSS.Values.getDisplayType(n);O.display="inline"===v?"inline-block":v}s.visibility&&"hidden"!==s.visibility&&(O.visibility=s.visibility)}d===a.calls.length-1&&(O.complete=function(){if(a.reset){for(var t in a.reset){var e=a.reset[t];i.CSS.Hooks.registered[t]!==r||"string"!=typeof e&&"number"!=typeof e||(a.reset[t]=[a.reset[t],a.reset[t]])}var s={duration:0,queue:!1};p&&(s.complete=f),i.animate(n,a.reset,s)}else p&&f()},"hidden"===s.visibility&&(O.visibility=s.visibility)),i.animate(n,y,O)}},i},i.RegisterEffect.packagedEffects={"callout.bounce":{defaultDuration:550,calls:[[{translateY:-30},.25],[{translateY:0},.125],[{translateY:-15},.125],[{translateY:0},.25]]},"callout.shake":{defaultDuration:800,calls:[[{translateX:-11},.125],[{translateX:11},.125],[{translateX:-11},.125],[{translateX:11},.125],[{translateX:-11},.125],[{translateX:11},.125],[{translateX:-11},.125],[{translateX:0},.125]]},"callout.flash":{defaultDuration:1100,calls:[[{opacity:[0,"easeInOutQuad",1]},.25],[{opacity:[1,"easeInOutQuad"]},.25],[{opacity:[0,"easeInOutQuad"]},.25],[{opacity:[1,"easeInOutQuad"]},.25]]},"callout.pulse":{defaultDuration:825,calls:[[{scaleX:1.1,scaleY:1.1},.5,{easing:"easeInExpo"}],[{scaleX:1,scaleY:1},.5]]},"callout.swing":{defaultDuration:950,calls:[[{rotateZ:15},.2],[{rotateZ:-10},.2],[{rotateZ:5},.2],[{rotateZ:-5},.2],[{rotateZ:0},.2]]},"callout.tada":{defaultDuration:1e3,calls:[[{scaleX:.9,scaleY:.9,rotateZ:-3},.1],[{scaleX:1.1,scaleY:1.1,rotateZ:3},.1],[{scaleX:1.1,scaleY:1.1,rotateZ:-3},.1],["reverse",.125],["reverse",.125],["reverse",.125],["reverse",.125],["reverse",.125],[{scaleX:1,scaleY:1,rotateZ:0},.2]]},"transition.fadeIn":{defaultDuration:500,calls:[[{opacity:[1,0]}]]},"transition.fadeOut":{defaultDuration:500,calls:[[{opacity:[0,1]}]]},"transition.flipXIn":{defaultDuration:700,calls:[[{opacity:[1,0],transformPerspective:[800,800],rotateY:[0,-55]}]],reset:{transformPerspective:0}},"transition.flipXOut":{defaultDuration:700,calls:[[{opacity:[0,1],transformPerspective:[800,800],rotateY:55}]],reset:{transformPerspective:0,rotateY:0}},"transition.flipYIn":{defaultDuration:800,calls:[[{opacity:[1,0],transformPerspective:[800,800],rotateX:[0,-45]}]],reset:{transformPerspective:0}},"transition.flipYOut":{defaultDuration:800,calls:[[{opacity:[0,1],transformPerspective:[800,800],rotateX:25}]],reset:{transformPerspective:0,rotateX:0}},"transition.flipBounceXIn":{defaultDuration:900,calls:[[{opacity:[.725,0],transformPerspective:[400,400],rotateY:[-10,90]},.5],[{opacity:.8,rotateY:10},.25],[{opacity:1,rotateY:0},.25]],reset:{transformPerspective:0}},"transition.flipBounceXOut":{defaultDuration:800,calls:[[{opacity:[.9,1],transformPerspective:[400,400],rotateY:-10},.5],[{opacity:0,rotateY:90},.5]],reset:{transformPerspective:0,rotateY:0}},"transition.flipBounceYIn":{defaultDuration:850,calls:[[{opacity:[.725,0],transformPerspective:[400,400],rotateX:[-10,90]},.5],[{opacity:.8,rotateX:10},.25],[{opacity:1,rotateX:0},.25]],reset:{transformPerspective:0}},"transition.flipBounceYOut":{defaultDuration:800,calls:[[{opacity:[.9,1],transformPerspective:[400,400],rotateX:-15},.5],[{opacity:0,rotateX:90},.5]],reset:{transformPerspective:0,rotateX:0}},"transition.swoopIn":{defaultDuration:850,calls:[[{opacity:[1,0],transformOriginX:["100%","50%"],transformOriginY:["100%","100%"],scaleX:[1,0],scaleY:[1,0],translateX:[0,-700],translateZ:0}]],reset:{transformOriginX:"50%",transformOriginY:"50%"}},"transition.swoopOut":{defaultDuration:850,calls:[[{opacity:[0,1],transformOriginX:["50%","100%"],transformOriginY:["100%","100%"],scaleX:0,scaleY:0,translateX:-700,translateZ:0}]],reset:{transformOriginX:"50%",transformOriginY:"50%",scaleX:1,scaleY:1,translateX:0}},"transition.whirlIn":{defaultDuration:850,calls:[[{opacity:[1,0],transformOriginX:["50%","50%"],transformOriginY:["50%","50%"],scaleX:[1,0],scaleY:[1,0],rotateY:[0,160]},1,{easing:"easeInOutSine"}]]},"transition.whirlOut":{defaultDuration:750,calls:[[{opacity:[0,"easeInOutQuint",1],transformOriginX:["50%","50%"],transformOriginY:["50%","50%"],scaleX:0,scaleY:0,rotateY:160},1,{easing:"swing"}]],reset:{scaleX:1,scaleY:1,rotateY:0}},"transition.shrinkIn":{defaultDuration:750,calls:[[{opacity:[1,0],transformOriginX:["50%","50%"],transformOriginY:["50%","50%"],scaleX:[1,1.5],scaleY:[1,1.5],translateZ:0}]]},"transition.shrinkOut":{defaultDuration:600,calls:[[{opacity:[0,1],transformOriginX:["50%","50%"],transformOriginY:["50%","50%"],scaleX:1.3,scaleY:1.3,translateZ:0}]],reset:{scaleX:1,scaleY:1}},"transition.expandIn":{defaultDuration:700,calls:[[{opacity:[1,0],transformOriginX:["50%","50%"],transformOriginY:["50%","50%"],scaleX:[1,.625],scaleY:[1,.625],translateZ:0}]]},"transition.expandOut":{defaultDuration:700,calls:[[{opacity:[0,1],transformOriginX:["50%","50%"],transformOriginY:["50%","50%"],scaleX:.5,scaleY:.5,translateZ:0}]],reset:{scaleX:1,scaleY:1}},"transition.bounceIn":{defaultDuration:800,calls:[[{opacity:[1,0],scaleX:[1.05,.3],scaleY:[1.05,.3]},.4],[{scaleX:.9,scaleY:.9,translateZ:0},.2],[{scaleX:1,scaleY:1},.5]]},"transition.bounceOut":{defaultDuration:800,calls:[[{scaleX:.95,scaleY:.95},.35],[{scaleX:1.1,scaleY:1.1,translateZ:0},.35],[{opacity:[0,1],scaleX:.3,scaleY:.3},.3]],reset:{scaleX:1,scaleY:1}},"transition.bounceUpIn":{defaultDuration:800,calls:[[{opacity:[1,0],translateY:[-30,1e3]},.6,{easing:"easeOutCirc"}],[{translateY:10},.2],[{translateY:0},.2]]},"transition.bounceUpOut":{defaultDuration:1e3,calls:[[{translateY:20},.2],[{opacity:[0,"easeInCirc",1],translateY:-1e3},.8]],reset:{translateY:0}},"transition.bounceDownIn":{defaultDuration:800,calls:[[{opacity:[1,0],translateY:[30,-1e3]},.6,{easing:"easeOutCirc"}],[{translateY:-10},.2],[{translateY:0},.2]]},"transition.bounceDownOut":{defaultDuration:1e3,calls:[[{translateY:-20},.2],[{opacity:[0,"easeInCirc",1],translateY:1e3},.8]],reset:{translateY:0}},"transition.bounceLeftIn":{defaultDuration:750,calls:[[{opacity:[1,0],translateX:[30,-1250]},.6,{easing:"easeOutCirc"}],[{translateX:-10},.2],[{translateX:0},.2]]},"transition.bounceLeftOut":{defaultDuration:750,calls:[[{translateX:30},.2],[{opacity:[0,"easeInCirc",1],translateX:-1250},.8]],reset:{translateX:0}},"transition.bounceRightIn":{defaultDuration:750,calls:[[{opacity:[1,0],translateX:[-30,1250]},.6,{easing:"easeOutCirc"}],[{translateX:10},.2],[{translateX:0},.2]]},"transition.bounceRightOut":{defaultDuration:750,calls:[[{translateX:-30},.2],[{opacity:[0,"easeInCirc",1],translateX:1250},.8]],reset:{translateX:0}},"transition.slideUpIn":{defaultDuration:900,calls:[[{opacity:[1,0],translateY:[0,20],translateZ:0}]]},"transition.slideUpOut":{defaultDuration:900,calls:[[{opacity:[0,1],translateY:-20,translateZ:0}]],reset:{translateY:0}},"transition.slideDownIn":{defaultDuration:900,calls:[[{opacity:[1,0],translateY:[0,-20],translateZ:0}]]},"transition.slideDownOut":{defaultDuration:900,calls:[[{opacity:[0,1],translateY:20,translateZ:0}]],reset:{translateY:0}},"transition.slideLeftIn":{defaultDuration:1e3,calls:[[{opacity:[1,0],translateX:[0,-20],translateZ:0}]]},"transition.slideLeftOut":{defaultDuration:1050,calls:[[{opacity:[0,1],translateX:-20,translateZ:0}]],reset:{translateX:0}},"transition.slideRightIn":{defaultDuration:1e3,calls:[[{opacity:[1,0],translateX:[0,20],translateZ:0}]]},"transition.slideRightOut":{defaultDuration:1050,calls:[[{opacity:[0,1],translateX:20,translateZ:0}]],reset:{translateX:0}},"transition.slideUpBigIn":{defaultDuration:850,calls:[[{opacity:[1,0],translateY:[0,75],translateZ:0}]]},"transition.slideUpBigOut":{defaultDuration:800,calls:[[{opacity:[0,1],translateY:-75,translateZ:0}]],reset:{translateY:0}},"transition.slideDownBigIn":{defaultDuration:850,calls:[[{opacity:[1,0],translateY:[0,-75],translateZ:0}]]},"transition.slideDownBigOut":{defaultDuration:800,calls:[[{opacity:[0,1],translateY:75,translateZ:0}]],reset:{translateY:0}},"transition.slideLeftBigIn":{defaultDuration:800,calls:[[{opacity:[1,0],translateX:[0,-75],translateZ:0}]]},"transition.slideLeftBigOut":{defaultDuration:750,calls:[[{opacity:[0,1],translateX:-75,translateZ:0}]],reset:{translateX:0}},"transition.slideRightBigIn":{defaultDuration:800,calls:[[{opacity:[1,0],translateX:[0,75],translateZ:0}]]},"transition.slideRightBigOut":{defaultDuration:750,calls:[[{opacity:[0,1],translateX:75,translateZ:0}]],reset:{translateX:0}},"transition.perspectiveUpIn":{defaultDuration:800,calls:[[{opacity:[1,0],transformPerspective:[800,800],transformOriginX:[0,0],transformOriginY:["100%","100%"],rotateX:[0,-180]}]],reset:{transformPerspective:0,transformOriginX:"50%",transformOriginY:"50%"}},"transition.perspectiveUpOut":{defaultDuration:850,calls:[[{opacity:[0,1],transformPerspective:[800,800],transformOriginX:[0,0],transformOriginY:["100%","100%"],rotateX:-180}]],reset:{transformPerspective:0,transformOriginX:"50%",transformOriginY:"50%",rotateX:0}},"transition.perspectiveDownIn":{defaultDuration:800,calls:[[{opacity:[1,0],transformPerspective:[800,800],transformOriginX:[0,0],transformOriginY:[0,0],rotateX:[0,180]}]],reset:{transformPerspective:0,transformOriginX:"50%",transformOriginY:"50%"}},"transition.perspectiveDownOut":{defaultDuration:850,calls:[[{opacity:[0,1],transformPerspective:[800,800],transformOriginX:[0,0],transformOriginY:[0,0],rotateX:180}]],reset:{transformPerspective:0,transformOriginX:"50%",transformOriginY:"50%",rotateX:0}},"transition.perspectiveLeftIn":{defaultDuration:950,calls:[[{opacity:[1,0],transformPerspective:[2e3,2e3],transformOriginX:[0,0],transformOriginY:[0,0],rotateY:[0,-180]}]],reset:{transformPerspective:0,transformOriginX:"50%",transformOriginY:"50%"}},"transition.perspectiveLeftOut":{defaultDuration:950,calls:[[{opacity:[0,1],transformPerspective:[2e3,2e3],transformOriginX:[0,0],transformOriginY:[0,0],rotateY:-180}]],reset:{transformPerspective:0,transformOriginX:"50%",transformOriginY:"50%",rotateY:0}},"transition.perspectiveRightIn":{defaultDuration:950,calls:[[{opacity:[1,0],transformPerspective:[2e3,2e3],transformOriginX:["100%","100%"],transformOriginY:[0,0],rotateY:[0,180]}]],reset:{transformPerspective:0,transformOriginX:"50%",transformOriginY:"50%"}},"transition.perspectiveRightOut":{defaultDuration:950,calls:[[{opacity:[0,1],transformPerspective:[2e3,2e3],transformOriginX:["100%","100%"],transformOriginY:[0,0],rotateY:180}]],reset:{transformPerspective:0,transformOriginX:"50%",transformOriginY:"50%",rotateY:0}}};for(var c in i.RegisterEffect.packagedEffects)i.RegisterEffect(c,i.RegisterEffect.packagedEffects[c]);i.RunSequence=function(t){var a=$.extend(!0,[],t);a.length>1&&($.each(a.reverse(),function(t,e){var r=a[t+1];if(r){var n=e.o||e.options,s=r.o||r.options,o=n&&n.sequenceQueue===!1?"begin":"complete",l=s&&s[o],c={};c[o]=function(){var t=r.e||r.elements,a=t.nodeType?[t]:t;l&&l.call(a,a),i(e)},r.o?r.o=$.extend({},s,c):r.options=$.extend({},s,c)}}),a.reverse()),i(a[0])}}(window.jQuery||window.Zepto||window,window,document)});
/*!
 * Lazy Load - jQuery plugin for lazy loading images
 *
 * Copyright (c) 2007-2015 Mika Tuupola
 *
 * Licensed under the MIT license:
 *   http://www.opensource.org/licenses/mit-license.php
 *
 * Project home:
 *   http://www.appelsiini.net/projects/lazyload
 *
 * Version:  1.9.7
 *
 */

(function($, window, document, undefined) {
    var $window = $(window);

    $.fn.lazyload = function(options) {
        var elements = this;
        var $container;
        var settings = {
            threshold       : 0,
            failure_limit   : 0,
            event           : "scroll",
            effect          : "show",
            container       : window,
            data_attribute  : "original",
            skip_invisible  : false,
            appear          : null,
            load            : null,
            placeholder     : "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAANSURBVBhXYzh8+PB/AAffA0nNPuCLAAAAAElFTkSuQmCC"
        };

        function update() {
            var counter = 0;

            elements.each(function() {
                var $this = $(this);
                if (settings.skip_invisible && !$this.is(":visible")) {
                    return;
                }
                if ($.abovethetop(this, settings) ||
                    $.leftofbegin(this, settings)) {
                        /* Nothing. */
                } else if (!$.belowthefold(this, settings) &&
                    !$.rightoffold(this, settings)) {
                        $this.trigger("appear");
                        /* if we found an image we'll load, reset the counter */
                        counter = 0;
                } else {
                    if (++counter > settings.failure_limit) {
                        return false;
                    }
                }
            });

        }

        if(options) {
            /* Maintain BC for a couple of versions. */
            if (undefined !== options.failurelimit) {
                options.failure_limit = options.failurelimit;
                delete options.failurelimit;
            }
            if (undefined !== options.effectspeed) {
                options.effect_speed = options.effectspeed;
                delete options.effectspeed;
            }

            $.extend(settings, options);
        }

        /* Cache container as jQuery as object. */
        $container = (settings.container === undefined ||
                      settings.container === window) ? $window : $(settings.container);

        /* Fire one scroll event per scroll. Not one scroll event per image. */
        if (0 === settings.event.indexOf("scroll")) {
            $container.bind(settings.event, function() {
                return update();
            });
        }

        this.each(function() {
            var self = this;
            var $self = $(self);

            self.loaded = false;

            /* If no src attribute given use data:uri. */
            if ($self.attr("src") === undefined || $self.attr("src") === false) {
                if ($self.is("img")) {
                    $self.attr("src", settings.placeholder);
                }
            }

            /* When appear is triggered load original image. */
            $self.one("appear", function() {
                if (!this.loaded) {
                    if (settings.appear) {
                        var elements_left = elements.length;
                        settings.appear.call(self, elements_left, settings);
                    }
                    $("<img />")
                        .bind("load", function() {

                            var original = $self.attr("data-" + settings.data_attribute);
                            $self.hide();
                            if ($self.is("img")) {
                                $self.attr("src", original);
                            } else {
                                $self.css("background-image", "url('" + original + "')");
                            }
                            $self[settings.effect](settings.effect_speed);

                            self.loaded = true;

                            /* Remove image from array so it is not looped next time. */
                            var temp = $.grep(elements, function(element) {
                                return !element.loaded;
                            });
                            elements = $(temp);

                            if (settings.load) {
                                var elements_left = elements.length;
                                settings.load.call(self, elements_left, settings);
                            }
                        })
                        .attr("src", $self.attr("data-" + settings.data_attribute));
                }
            });

            /* When wanted event is triggered load original image */
            /* by triggering appear.                              */
            if (0 !== settings.event.indexOf("scroll")) {
                $self.bind(settings.event, function() {
                    if (!self.loaded) {
                        $self.trigger("appear");
                    }
                });
            }
        });

        /* Check if something appears when window is resized. */
        $window.bind("resize", function() {
            update();
        });

        /* With IOS5 force loading images when navigating with back button. */
        /* Non optimal workaround. */
        if ((/(?:iphone|ipod|ipad).*os 5/gi).test(navigator.appVersion)) {
            $window.bind("pageshow", function(event) {
                if (event.originalEvent && event.originalEvent.persisted) {
                    elements.each(function() {
                        $(this).trigger("appear");
                    });
                }
            });
        }

        /* Force initial check if images should appear. */
        $(document).ready(function() {
            update();
        });

        return this;
    };

    /* Convenience methods in jQuery namespace.           */
    /* Use as  $.belowthefold(element, {threshold : 100, container : window}) */

    $.belowthefold = function(element, settings) {
        var fold;

        if (settings.container === undefined || settings.container === window) {
            fold = (window.innerHeight ? window.innerHeight : $window.height()) + $window.scrollTop();
        } else {
            fold = $(settings.container).offset().top + $(settings.container).height();
        }

        return fold <= $(element).offset().top - settings.threshold;
    };

    $.rightoffold = function(element, settings) {
        var fold;

        if (settings.container === undefined || settings.container === window) {
            fold = $window.width() + $window.scrollLeft();
        } else {
            fold = $(settings.container).offset().left + $(settings.container).width();
        }

        return fold <= $(element).offset().left - settings.threshold;
    };

    $.abovethetop = function(element, settings) {
        var fold;

        if (settings.container === undefined || settings.container === window) {
            fold = $window.scrollTop();
        } else {
            fold = $(settings.container).offset().top;
        }

        return fold >= $(element).offset().top + settings.threshold  + $(element).height();
    };

    $.leftofbegin = function(element, settings) {
        var fold;

        if (settings.container === undefined || settings.container === window) {
            fold = $window.scrollLeft();
        } else {
            fold = $(settings.container).offset().left;
        }

        return fold >= $(element).offset().left + settings.threshold + $(element).width();
    };

    $.inviewport = function(element, settings) {
         return !$.rightoffold(element, settings) && !$.leftofbegin(element, settings) &&
                !$.belowthefold(element, settings) && !$.abovethetop(element, settings);
     };

    /* Custom selectors for your convenience.   */
    /* Use as $("img:below-the-fold").something() or */
    /* $("img").filter(":below-the-fold").something() which is faster */

    $.extend($.expr[":"], {
        "below-the-fold" : function(a) { return $.belowthefold(a, {threshold : 0}); },
        "above-the-top"  : function(a) { return !$.belowthefold(a, {threshold : 0}); },
        "right-of-screen": function(a) { return $.rightoffold(a, {threshold : 0}); },
        "left-of-screen" : function(a) { return !$.rightoffold(a, {threshold : 0}); },
        "in-viewport"    : function(a) { return $.inviewport(a, {threshold : 0}); },
        /* Maintain BC for couple of versions. */
        "above-the-fold" : function(a) { return !$.belowthefold(a, {threshold : 0}); },
        "right-of-fold"  : function(a) { return $.rightoffold(a, {threshold : 0}); },
        "left-of-fold"   : function(a) { return !$.rightoffold(a, {threshold : 0}); }
    });

})(jQuery, window, document);

/* http://james.padolsey.com/javascript/special-scroll-events-for-jquery/ */

(function(){
    
    var special = jQuery.event.special,
        uid1 = "D" + (+new Date()),
        uid2 = "D" + (+new Date() + 1);
        
    special.scrollstart = {
        setup: function() {
            
            var timer,
                handler =  function(evt) {
                    
                    var _self = this,
                        _args = arguments;
                    
                    if (timer) {
                        clearTimeout(timer);
                    } else {
                        evt.type = "scrollstart";
                        jQuery.event.dispatch.apply(_self, _args);
                    }
                    
                    timer = setTimeout( function(){
                        timer = null;
                    }, special.scrollstop.latency);
                    
                };
            
            jQuery(this).bind("scroll", handler).data(uid1, handler);
            
        },
        teardown: function(){
            jQuery(this).unbind( "scroll", jQuery(this).data(uid1) );
        }
    };
    
    special.scrollstop = {
        latency: 300,
        setup: function() {
            
            var timer,
                    handler = function(evt) {
                    
                    var _self = this,
                        _args = arguments;
                    
                    if (timer) {
                        clearTimeout(timer);
                    }
                    
                    timer = setTimeout( function(){
                        
                        timer = null;
                        evt.type = "scrollstop";
                        jQuery.event.dispatch.apply(_self, _args);
                        
                        
                    }, special.scrollstop.latency);
                    
                };
            
            jQuery(this).bind("scroll", handler).data(uid2, handler);
            
        },
        teardown: function() {
            jQuery(this).unbind( "scroll", jQuery(this).data(uid2) );
        }
    };
    
})();
$(document).ready(function () {
  var $headerInner = $('.header-inner');
  var $sidebar = $('#sidebar');
  var getSidebarTop = function(){
    return $headerInner.height() + CONFIG.sidebar.offset;
  };
  var setSidebarMarginTop = function(sidebarTop){
    return $sidebar.css({ 'margin-top': sidebarTop });
  };
  var mql = window.matchMedia('(min-width: 991px)');
  setSidebarMarginTop(getSidebarTop()).show();
  mql.addListener(function(e){
    if(e.matches){
      setSidebarMarginTop(getSidebarTop());
    }
  });
});

!function(e,t,i,n){"use strict";var o=i("html"),a=i(e),r=i(t),s=i.fancybox=function(){s.open.apply(this,arguments)},l=navigator.userAgent.match(/msie/i),c=null,d=void 0!==t.createTouch,p=function(e){return e&&e.hasOwnProperty&&e instanceof i},h=function(e){return e&&"string"===i.type(e)},f=function(e){return h(e)&&e.indexOf("%")>0},u=function(e){return e&&!(e.style.overflow&&"hidden"===e.style.overflow)&&(e.clientWidth&&e.scrollWidth>e.clientWidth||e.clientHeight&&e.scrollHeight>e.clientHeight)},g=function(e,t){var i=parseInt(e,10)||0;return t&&f(e)&&(i=s.getViewport()[t]/100*i),Math.ceil(i)},m=function(e,t){return g(e,t)+"px"};i.extend(s,{version:"2.1.5",defaults:{padding:15,margin:20,width:800,height:600,minWidth:100,minHeight:100,maxWidth:9999,maxHeight:9999,pixelRatio:1,autoSize:!0,autoHeight:!1,autoWidth:!1,autoResize:!0,autoCenter:!d,fitToView:!0,aspectRatio:!1,topRatio:.5,leftRatio:.5,scrolling:"auto",wrapCSS:"",arrows:!0,closeBtn:!0,closeClick:!1,nextClick:!1,mouseWheel:!0,autoPlay:!1,playSpeed:3e3,preload:3,modal:!1,loop:!0,ajax:{dataType:"html",headers:{"X-fancyBox":!0}},iframe:{scrolling:"auto",preload:!0},swf:{wmode:"transparent",allowfullscreen:"true",allowscriptaccess:"always"},keys:{next:{13:"left",34:"up",39:"left",40:"up"},prev:{8:"right",33:"down",37:"right",38:"down"},close:[27],play:[32],toggle:[70]},direction:{next:"left",prev:"right"},scrollOutside:!0,index:0,type:null,href:null,content:null,title:null,tpl:{wrap:'<div class="fancybox-wrap" tabIndex="-1"><div class="fancybox-skin"><div class="fancybox-outer"><div class="fancybox-inner"></div></div></div></div>',image:'<img class="fancybox-image" src="{href}" alt="" />',iframe:'<iframe id="fancybox-frame{rnd}" name="fancybox-frame{rnd}" class="fancybox-iframe" frameborder="0" vspace="0" hspace="0" webkitAllowFullScreen mozallowfullscreen allowFullScreen'+(l?' allowtransparency="true"':"")+"></iframe>",error:'<p class="fancybox-error">The requested content cannot be loaded.<br/>Please try again later.</p>',closeBtn:'<a title="Close" class="fancybox-item fancybox-close" href="javascript:;"></a>',next:'<a title="Next" class="fancybox-nav fancybox-next" href="javascript:;"><span></span></a>',prev:'<a title="Previous" class="fancybox-nav fancybox-prev" href="javascript:;"><span></span></a>'},openEffect:"fade",openSpeed:250,openEasing:"swing",openOpacity:!0,openMethod:"zoomIn",closeEffect:"fade",closeSpeed:250,closeEasing:"swing",closeOpacity:!0,closeMethod:"zoomOut",nextEffect:"elastic",nextSpeed:250,nextEasing:"swing",nextMethod:"changeIn",prevEffect:"elastic",prevSpeed:250,prevEasing:"swing",prevMethod:"changeOut",helpers:{overlay:!0,title:!0},onCancel:i.noop,beforeLoad:i.noop,afterLoad:i.noop,beforeShow:i.noop,afterShow:i.noop,beforeChange:i.noop,beforeClose:i.noop,afterClose:i.noop},group:{},opts:{},previous:null,coming:null,current:null,isActive:!1,isOpen:!1,isOpened:!1,wrap:null,skin:null,outer:null,inner:null,player:{timer:null,isActive:!1},ajaxLoad:null,imgPreload:null,transitions:{},helpers:{},open:function(e,t){if(e&&(i.isPlainObject(t)||(t={}),!1!==s.close(!0)))return i.isArray(e)||(e=p(e)?i(e).get():[e]),i.each(e,function(n,o){var a,r,l,c,d,f,u,g={};"object"===i.type(o)&&(o.nodeType&&(o=i(o)),p(o)?(g={href:o.data("fancybox-href")||o.attr("href"),title:o.data("fancybox-title")||o.attr("title"),isDom:!0,element:o},i.metadata&&i.extend(!0,g,o.metadata())):g=o),a=t.href||g.href||(h(o)?o:null),r=void 0!==t.title?t.title:g.title||"",l=t.content||g.content,c=l?"html":t.type||g.type,!c&&g.isDom&&((c=o.data("fancybox-type"))||(d=o.prop("class").match(/fancybox\.(\w+)/),c=d?d[1]:null)),h(a)&&(c||(s.isImage(a)?c="image":s.isSWF(a)?c="swf":"#"===a.charAt(0)?c="inline":h(o)&&(c="html",l=o)),"ajax"===c&&(f=a.split(/\s+/,2),a=f.shift(),u=f.shift())),l||("inline"===c?a?l=i(h(a)?a.replace(/.*(?=#[^\s]+$)/,""):a):g.isDom&&(l=o):"html"===c?l=a:c||a||!g.isDom||(c="inline",l=o)),i.extend(g,{href:a,type:c,content:l,title:r,selector:u}),e[n]=g}),s.opts=i.extend(!0,{},s.defaults,t),void 0!==t.keys&&(s.opts.keys=!!t.keys&&i.extend({},s.defaults.keys,t.keys)),s.group=e,s._start(s.opts.index)},cancel:function(){var e=s.coming;e&&!1!==s.trigger("onCancel")&&(s.hideLoading(),s.ajaxLoad&&s.ajaxLoad.abort(),s.ajaxLoad=null,s.imgPreload&&(s.imgPreload.onload=s.imgPreload.onerror=null),e.wrap&&e.wrap.stop(!0,!0).trigger("onReset").remove(),s.coming=null,s.current||s._afterZoomOut(e))},close:function(e){s.cancel(),!1!==s.trigger("beforeClose")&&(s.unbindEvents(),s.isActive&&(s.isOpen&&e!==!0?(s.isOpen=s.isOpened=!1,s.isClosing=!0,i(".fancybox-item, .fancybox-nav").remove(),s.wrap.stop(!0,!0).removeClass("fancybox-opened"),s.transitions[s.current.closeMethod]()):(i(".fancybox-wrap").stop(!0).trigger("onReset").remove(),s._afterZoomOut())))},play:function(e){var t=function(){clearTimeout(s.player.timer)},i=function(){t(),s.current&&s.player.isActive&&(s.player.timer=setTimeout(s.next,s.current.playSpeed))},n=function(){t(),r.unbind(".player"),s.player.isActive=!1,s.trigger("onPlayEnd")};e===!0||!s.player.isActive&&e!==!1?function(){s.current&&(s.current.loop||s.current.index<s.group.length-1)&&(s.player.isActive=!0,r.bind({"onCancel.player beforeClose.player":n,"onUpdate.player":i,"beforeLoad.player":t}),i(),s.trigger("onPlayStart"))}():n()},next:function(e){var t=s.current;t&&(h(e)||(e=t.direction.next),s.jumpto(t.index+1,e,"next"))},prev:function(e){var t=s.current;t&&(h(e)||(e=t.direction.prev),s.jumpto(t.index-1,e,"prev"))},jumpto:function(e,t,i){var n=s.current;n&&(e=g(e),s.direction=t||n.direction[e>=n.index?"next":"prev"],s.router=i||"jumpto",n.loop&&(e<0&&(e=n.group.length+e%n.group.length),e%=n.group.length),void 0!==n.group[e]&&(s.cancel(),s._start(e)))},reposition:function(e,t){var n,o=s.current,a=o?o.wrap:null;a&&(n=s._getPosition(t),e&&"scroll"===e.type?(delete n.position,a.stop(!0,!0).animate(n,200)):(a.css(n),o.pos=i.extend({},o.dim,n)))},update:function(e){var t=e&&e.type,i=!t||"orientationchange"===t;i&&(clearTimeout(c),c=null),s.isOpen&&!c&&(c=setTimeout(function(){var n=s.current;n&&!s.isClosing&&(s.wrap.removeClass("fancybox-tmp"),(i||"load"===t||"resize"===t&&n.autoResize)&&s._setDimension(),"scroll"===t&&n.canShrink||s.reposition(e),s.trigger("onUpdate"),c=null)},i&&!d?0:300))},toggle:function(e){s.isOpen&&(s.current.fitToView="boolean"===i.type(e)?e:!s.current.fitToView,d&&(s.wrap.removeAttr("style").addClass("fancybox-tmp"),s.trigger("onUpdate")),s.update())},hideLoading:function(){r.unbind(".loading"),i("#fancybox-loading").remove()},showLoading:function(){var e,t;s.hideLoading(),e=i('<div id="fancybox-loading"><div></div></div>').click(s.cancel).appendTo("body"),r.bind("keydown.loading",function(e){27===(e.which||e.keyCode)&&(e.preventDefault(),s.cancel())}),s.defaults.fixed||(t=s.getViewport(),e.css({position:"absolute",top:.5*t.h+t.y,left:.5*t.w+t.x}))},getViewport:function(){var t=s.current&&s.current.locked||!1,i={x:a.scrollLeft(),y:a.scrollTop()};return t?(i.w=t[0].clientWidth,i.h=t[0].clientHeight):(i.w=d&&e.innerWidth?e.innerWidth:a.width(),i.h=d&&e.innerHeight?e.innerHeight:a.height()),i},unbindEvents:function(){s.wrap&&p(s.wrap)&&s.wrap.unbind(".fb"),r.unbind(".fb"),a.unbind(".fb")},bindEvents:function(){var e,t=s.current;t&&(a.bind("orientationchange.fb"+(d?"":" resize.fb")+(t.autoCenter&&!t.locked?" scroll.fb":""),s.update),e=t.keys,e&&r.bind("keydown.fb",function(n){var o=n.which||n.keyCode,a=n.target||n.srcElement;if(27===o&&s.coming)return!1;n.ctrlKey||n.altKey||n.shiftKey||n.metaKey||a&&(a.type||i(a).is("[contenteditable]"))||i.each(e,function(e,a){return t.group.length>1&&void 0!==a[o]?(s[e](a[o]),n.preventDefault(),!1):i.inArray(o,a)>-1?(s[e](),n.preventDefault(),!1):void 0})}),i.fn.mousewheel&&t.mouseWheel&&s.wrap.bind("mousewheel.fb",function(e,n,o,a){for(var r=e.target||null,l=i(r),c=!1;l.length&&!(c||l.is(".fancybox-skin")||l.is(".fancybox-wrap"));)c=u(l[0]),l=i(l).parent();0===n||c||s.group.length>1&&!t.canShrink&&(a>0||o>0?s.prev(a>0?"down":"left"):(a<0||o<0)&&s.next(a<0?"up":"right"),e.preventDefault())}))},trigger:function(e,t){var n,o=t||s.coming||s.current;if(o){if(i.isFunction(o[e])&&(n=o[e].apply(o,Array.prototype.slice.call(arguments,1))),n===!1)return!1;o.helpers&&i.each(o.helpers,function(t,n){n&&s.helpers[t]&&i.isFunction(s.helpers[t][e])&&s.helpers[t][e](i.extend(!0,{},s.helpers[t].defaults,n),o)}),r.trigger(e)}},isImage:function(e){return h(e)&&e.match(/(^data:image\/.*,)|(\.(jp(e|g|eg)|gif|png|bmp|webp|svg)((\?|#).*)?$)/i)},isSWF:function(e){return h(e)&&e.match(/\.(swf)((\?|#).*)?$/i)},_start:function(e){var t,n,o,a,r,l={};if(e=g(e),!(t=s.group[e]||null))return!1;if(l=i.extend(!0,{},s.opts,t),a=l.margin,r=l.padding,"number"===i.type(a)&&(l.margin=[a,a,a,a]),"number"===i.type(r)&&(l.padding=[r,r,r,r]),l.modal&&i.extend(!0,l,{closeBtn:!1,closeClick:!1,nextClick:!1,arrows:!1,mouseWheel:!1,keys:null,helpers:{overlay:{closeClick:!1}}}),l.autoSize&&(l.autoWidth=l.autoHeight=!0),"auto"===l.width&&(l.autoWidth=!0),"auto"===l.height&&(l.autoHeight=!0),l.group=s.group,l.index=e,s.coming=l,!1===s.trigger("beforeLoad"))return void(s.coming=null);if(o=l.type,n=l.href,!o)return s.coming=null,!(!s.current||!s.router||"jumpto"===s.router)&&(s.current.index=e,s[s.router](s.direction));if(s.isActive=!0,"image"!==o&&"swf"!==o||(l.autoHeight=l.autoWidth=!1,l.scrolling="visible"),"image"===o&&(l.aspectRatio=!0),"iframe"===o&&d&&(l.scrolling="scroll"),l.wrap=i(l.tpl.wrap).addClass("fancybox-"+(d?"mobile":"desktop")+" fancybox-type-"+o+" fancybox-tmp "+l.wrapCSS).appendTo(l.parent||"body"),i.extend(l,{skin:i(".fancybox-skin",l.wrap),outer:i(".fancybox-outer",l.wrap),inner:i(".fancybox-inner",l.wrap)}),i.each(["Top","Right","Bottom","Left"],function(e,t){l.skin.css("padding"+t,m(l.padding[e]))}),s.trigger("onReady"),"inline"===o||"html"===o){if(!l.content||!l.content.length)return s._error("content")}else if(!n)return s._error("href");"image"===o?s._loadImage():"ajax"===o?s._loadAjax():"iframe"===o?s._loadIframe():s._afterLoad()},_error:function(e){i.extend(s.coming,{type:"html",autoWidth:!0,autoHeight:!0,minWidth:0,minHeight:0,scrolling:"no",hasError:e,content:s.coming.tpl.error}),s._afterLoad()},_loadImage:function(){var e=s.imgPreload=new Image;e.onload=function(){this.onload=this.onerror=null,s.coming.width=this.width/s.opts.pixelRatio,s.coming.height=this.height/s.opts.pixelRatio,s._afterLoad()},e.onerror=function(){this.onload=this.onerror=null,s._error("image")},e.src=s.coming.href,e.complete!==!0&&s.showLoading()},_loadAjax:function(){var e=s.coming;s.showLoading(),s.ajaxLoad=i.ajax(i.extend({},e.ajax,{url:e.href,error:function(e,t){s.coming&&"abort"!==t?s._error("ajax",e):s.hideLoading()},success:function(t,i){"success"===i&&(e.content=t,s._afterLoad())}}))},_loadIframe:function(){var e=s.coming,t=i(e.tpl.iframe.replace(/\{rnd\}/g,(new Date).getTime())).attr("scrolling",d?"auto":e.iframe.scrolling).attr("src",e.href);i(e.wrap).bind("onReset",function(){try{i(this).find("iframe").hide().attr("src","//about:blank").end().empty()}catch(e){}}),e.iframe.preload&&(s.showLoading(),t.one("load",function(){i(this).data("ready",1),d||i(this).bind("load.fb",s.update),i(this).parents(".fancybox-wrap").width("100%").removeClass("fancybox-tmp").show(),s._afterLoad()})),e.content=t.appendTo(e.inner),e.iframe.preload||s._afterLoad()},_preloadImages:function(){var e,t,i=s.group,n=s.current,o=i.length,a=n.preload?Math.min(n.preload,o-1):0;for(t=1;t<=a;t+=1)e=i[(n.index+t)%o],"image"===e.type&&e.href&&((new Image).src=e.href)},_afterLoad:function(){var e,t,n,o,a,r,l=s.coming,c=s.current,d="fancybox-placeholder";if(s.hideLoading(),l&&s.isActive!==!1){if(!1===s.trigger("afterLoad",l,c))return l.wrap.stop(!0).trigger("onReset").remove(),void(s.coming=null);switch(c&&(s.trigger("beforeChange",c),c.wrap.stop(!0).removeClass("fancybox-opened").find(".fancybox-item, .fancybox-nav").remove()),s.unbindEvents(),e=l,t=l.content,n=l.type,o=l.scrolling,i.extend(s,{wrap:e.wrap,skin:e.skin,outer:e.outer,inner:e.inner,current:e,previous:c}),a=e.href,n){case"inline":case"ajax":case"html":e.selector?t=i("<div>").html(t).find(e.selector):p(t)&&(t.data(d)||t.data(d,i('<div class="'+d+'"></div>').insertAfter(t).hide()),t=t.show().detach(),e.wrap.bind("onReset",function(){i(this).find(t).length&&t.hide().replaceAll(t.data(d)).data(d,!1)}));break;case"image":t=e.tpl.image.replace("{href}",a);break;case"swf":t='<object id="fancybox-swf" classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" width="100%" height="100%"><param name="movie" value="'+a+'"></param>',r="",i.each(e.swf,function(e,i){t+='<param name="'+e+'" value="'+i+'"></param>',r+=" "+e+'="'+i+'"'}),t+='<embed src="'+a+'" type="application/x-shockwave-flash" width="100%" height="100%"'+r+"></embed></object>"}p(t)&&t.parent().is(e.inner)||e.inner.append(t),s.trigger("beforeShow"),e.inner.css("overflow","yes"===o?"scroll":"no"===o?"hidden":o),s._setDimension(),s.reposition(),s.isOpen=!1,s.coming=null,s.bindEvents(),s.isOpened?c.prevMethod&&s.transitions[c.prevMethod]():i(".fancybox-wrap").not(e.wrap).stop(!0).trigger("onReset").remove(),s.transitions[s.isOpened?e.nextMethod:e.openMethod](),s._preloadImages()}},_setDimension:function(){var e,t,n,o,a,r,l,c,d,p,h,u,y,x,v,w=s.getViewport(),b=0,k=!1,C=!1,O=s.wrap,W=s.skin,_=s.inner,S=s.current,T=S.width,L=S.height,E=S.minWidth,R=S.minHeight,j=S.maxWidth,P=S.maxHeight,H=S.scrolling,M=S.scrollOutside?S.scrollbarWidth:0,A=S.margin,I=g(A[1]+A[3]),D=g(A[0]+A[2]);if(O.add(W).add(_).width("auto").height("auto").removeClass("fancybox-tmp"),e=g(W.outerWidth(!0)-W.width()),t=g(W.outerHeight(!0)-W.height()),n=I+e,o=D+t,a=f(T)?(w.w-n)*g(T)/100:T,r=f(L)?(w.h-o)*g(L)/100:L,"iframe"===S.type){if(x=S.content,S.autoHeight&&1===x.data("ready"))try{x[0].contentWindow.document.location&&(_.width(a).height(9999),v=x.contents().find("body"),M&&v.css("overflow-x","hidden"),r=v.outerHeight(!0))}catch(e){}}else(S.autoWidth||S.autoHeight)&&(_.addClass("fancybox-tmp"),S.autoWidth||_.width(a),S.autoHeight||_.height(r),S.autoWidth&&(a=_.width()),S.autoHeight&&(r=_.height()),_.removeClass("fancybox-tmp"));if(T=g(a),L=g(r),d=a/r,E=g(f(E)?g(E,"w")-n:E),j=g(f(j)?g(j,"w")-n:j),R=g(f(R)?g(R,"h")-o:R),P=g(f(P)?g(P,"h")-o:P),l=j,c=P,S.fitToView&&(j=Math.min(w.w-n,j),P=Math.min(w.h-o,P)),u=w.w-I,y=w.h-D,S.aspectRatio?(T>j&&(T=j,L=g(T/d)),L>P&&(L=P,T=g(L*d)),T<E&&(T=E,L=g(T/d)),L<R&&(L=R,T=g(L*d))):(T=Math.max(E,Math.min(T,j)),S.autoHeight&&"iframe"!==S.type&&(_.width(T),L=_.height()),L=Math.max(R,Math.min(L,P))),S.fitToView)if(_.width(T).height(L),O.width(T+e),p=O.width(),h=O.height(),S.aspectRatio)for(;(p>u||h>y)&&T>E&&L>R&&!(b++>19);)L=Math.max(R,Math.min(P,L-10)),T=g(L*d),T<E&&(T=E,L=g(T/d)),T>j&&(T=j,L=g(T/d)),_.width(T).height(L),O.width(T+e),p=O.width(),h=O.height();else T=Math.max(E,Math.min(T,T-(p-u))),L=Math.max(R,Math.min(L,L-(h-y)));M&&"auto"===H&&L<r&&T+e+M<u&&(T+=M),_.width(T).height(L),O.width(T+e),p=O.width(),h=O.height(),k=(p>u||h>y)&&T>E&&L>R,C=S.aspectRatio?T<l&&L<c&&T<a&&L<r:(T<l||L<c)&&(T<a||L<r),i.extend(S,{dim:{width:m(p),height:m(h)},origWidth:a,origHeight:r,canShrink:k,canExpand:C,wPadding:e,hPadding:t,wrapSpace:h-W.outerHeight(!0),skinSpace:W.height()-L}),!x&&S.autoHeight&&L>R&&L<P&&!C&&_.height("auto")},_getPosition:function(e){var t=s.current,i=s.getViewport(),n=t.margin,o=s.wrap.width()+n[1]+n[3],a=s.wrap.height()+n[0]+n[2],r={position:"absolute",top:n[0],left:n[3]};return t.autoCenter&&t.fixed&&!e&&a<=i.h&&o<=i.w?r.position="fixed":t.locked||(r.top+=i.y,r.left+=i.x),r.top=m(Math.max(r.top,r.top+(i.h-a)*t.topRatio)),r.left=m(Math.max(r.left,r.left+(i.w-o)*t.leftRatio)),r},_afterZoomIn:function(){var e=s.current;e&&(s.isOpen=s.isOpened=!0,s.wrap.css("overflow","visible").addClass("fancybox-opened"),s.update(),(e.closeClick||e.nextClick&&s.group.length>1)&&s.inner.css("cursor","pointer").bind("click.fb",function(t){i(t.target).is("a")||i(t.target).parent().is("a")||(t.preventDefault(),s[e.closeClick?"close":"next"]())}),e.closeBtn&&i(e.tpl.closeBtn).appendTo(s.skin).bind("click.fb",function(e){e.preventDefault(),s.close()}),e.arrows&&s.group.length>1&&((e.loop||e.index>0)&&i(e.tpl.prev).appendTo(s.outer).bind("click.fb",s.prev),(e.loop||e.index<s.group.length-1)&&i(e.tpl.next).appendTo(s.outer).bind("click.fb",s.next)),s.trigger("afterShow"),e.loop||e.index!==e.group.length-1?s.opts.autoPlay&&!s.player.isActive&&(s.opts.autoPlay=!1,s.play()):s.play(!1))},_afterZoomOut:function(e){e=e||s.current,i(".fancybox-wrap").trigger("onReset").remove(),i.extend(s,{group:{},opts:{},router:!1,current:null,isActive:!1,isOpened:!1,isOpen:!1,isClosing:!1,wrap:null,skin:null,outer:null,inner:null}),s.trigger("afterClose",e)}}),s.transitions={getOrigPosition:function(){var e=s.current,t=e.element,i=e.orig,n={},o=50,a=50,r=e.hPadding,l=e.wPadding,c=s.getViewport();return!i&&e.isDom&&t.is(":visible")&&(i=t.find("img:first"),i.length||(i=t)),p(i)?(n=i.offset(),i.is("img")&&(o=i.outerWidth(),a=i.outerHeight())):(n.top=c.y+(c.h-a)*e.topRatio,n.left=c.x+(c.w-o)*e.leftRatio),("fixed"===s.wrap.css("position")||e.locked)&&(n.top-=c.y,n.left-=c.x),n={top:m(n.top-r*e.topRatio),left:m(n.left-l*e.leftRatio),width:m(o+l),height:m(a+r)}},step:function(e,t){var i,n,o,a=t.prop,r=s.current,l=r.wrapSpace,c=r.skinSpace;"width"!==a&&"height"!==a||(i=t.end===t.start?1:(e-t.start)/(t.end-t.start),s.isClosing&&(i=1-i),n="width"===a?r.wPadding:r.hPadding,o=e-n,s.skin[a](g("width"===a?o:o-l*i)),s.inner[a](g("width"===a?o:o-l*i-c*i)))},zoomIn:function(){var e=s.current,t=e.pos,n=e.openEffect,o="elastic"===n,a=i.extend({opacity:1},t);delete a.position,o?(t=this.getOrigPosition(),e.openOpacity&&(t.opacity=.1)):"fade"===n&&(t.opacity=.1),s.wrap.css(t).animate(a,{duration:"none"===n?0:e.openSpeed,easing:e.openEasing,step:o?this.step:null,complete:s._afterZoomIn})},zoomOut:function(){var e=s.current,t=e.closeEffect,i="elastic"===t,n={opacity:.1};i&&(n=this.getOrigPosition(),e.closeOpacity&&(n.opacity=.1)),s.wrap.animate(n,{duration:"none"===t?0:e.closeSpeed,easing:e.closeEasing,step:i?this.step:null,complete:s._afterZoomOut})},changeIn:function(){var e,t=s.current,i=t.nextEffect,n=t.pos,o={opacity:1},a=s.direction;n.opacity=.1,"elastic"===i&&(e="down"===a||"up"===a?"top":"left","down"===a||"right"===a?(n[e]=m(g(n[e])-200),o[e]="+=200px"):(n[e]=m(g(n[e])+200),o[e]="-=200px")),"none"===i?s._afterZoomIn():s.wrap.css(n).animate(o,{duration:t.nextSpeed,easing:t.nextEasing,complete:s._afterZoomIn})},changeOut:function(){var e=s.previous,t=e.prevEffect,n={opacity:.1},o=s.direction;"elastic"===t&&(n["down"===o||"up"===o?"top":"left"]=("up"===o||"left"===o?"-":"+")+"=200px"),e.wrap.animate(n,{duration:"none"===t?0:e.prevSpeed,easing:e.prevEasing,complete:function(){i(this).trigger("onReset").remove()}})}},s.helpers.overlay={defaults:{closeClick:!0,speedOut:200,showEarly:!0,css:{},locked:!d,fixed:!0},overlay:null,fixed:!1,el:i("html"),create:function(e){e=i.extend({},this.defaults,e),this.overlay&&this.close(),this.overlay=i('<div class="fancybox-overlay"></div>').appendTo(s.coming?s.coming.parent:e.parent),this.fixed=!1,e.fixed&&s.defaults.fixed&&(this.overlay.addClass("fancybox-overlay-fixed"),this.fixed=!0)},open:function(e){var t=this;e=i.extend({},this.defaults,e),this.overlay?this.overlay.unbind(".overlay").width("auto").height("auto"):this.create(e),this.fixed||(a.bind("resize.overlay",i.proxy(this.update,this)),this.update()),e.closeClick&&this.overlay.bind("click.overlay",function(e){if(i(e.target).hasClass("fancybox-overlay"))return s.isActive?s.close():t.close(),!1}),this.overlay.css(e.css).show()},close:function(){var e,t;a.unbind("resize.overlay"),this.el.hasClass("fancybox-lock")&&(i(".fancybox-margin").removeClass("fancybox-margin"),e=a.scrollTop(),t=a.scrollLeft(),this.el.removeClass("fancybox-lock"),a.scrollTop(e).scrollLeft(t)),i(".fancybox-overlay").remove().hide(),i.extend(this,{overlay:null,fixed:!1})},update:function(){var e,i="100%";this.overlay.width(i).height("100%"),l?(e=Math.max(t.documentElement.offsetWidth,t.body.offsetWidth),r.width()>e&&(i=r.width())):r.width()>a.width()&&(i=r.width()),this.overlay.width(i).height(r.height())},onReady:function(e,t){var n=this.overlay;i(".fancybox-overlay").stop(!0,!0),n||this.create(e),e.locked&&this.fixed&&t.fixed&&(n||(this.margin=r.height()>a.height()&&i("html").css("margin-right").replace("px","")),t.locked=this.overlay.append(t.wrap),t.fixed=!1),e.showEarly===!0&&this.beforeShow.apply(this,arguments)},beforeShow:function(e,t){var n,o;t.locked&&(this.margin!==!1&&(i("*").filter(function(){return"fixed"===i(this).css("position")&&!i(this).hasClass("fancybox-overlay")&&!i(this).hasClass("fancybox-wrap")}).addClass("fancybox-margin"),this.el.addClass("fancybox-margin")),n=a.scrollTop(),o=a.scrollLeft(),this.el.addClass("fancybox-lock"),a.scrollTop(n).scrollLeft(o)),this.open(e)},onUpdate:function(){this.fixed||this.update()},afterClose:function(e){this.overlay&&!s.coming&&this.overlay.fadeOut(e.speedOut,i.proxy(this.close,this))}},s.helpers.title={defaults:{type:"float",position:"bottom"},beforeShow:function(e){var t,n,o=s.current,a=o.title,r=e.type;if(i.isFunction(a)&&(a=a.call(o.element,o)),h(a)&&""!==i.trim(a)){switch(t=i('<div class="fancybox-title fancybox-title-'+r+'-wrap">'+a+"</div>"),r){case"inside":n=s.skin;break;case"outside":n=s.wrap;break;case"over":n=s.inner;break;default:n=s.skin,t.appendTo("body"),l&&t.width(t.width()),t.wrapInner('<span class="child"></span>'),s.current.margin[2]+=Math.abs(g(t.css("margin-bottom")))}t["top"===e.position?"prependTo":"appendTo"](n)}}},i.fn.fancybox=function(e){var t,n=i(this),o=this.selector||"",a=function(a){var r,l,c=i(this).blur(),d=t;a.ctrlKey||a.altKey||a.shiftKey||a.metaKey||c.is(".fancybox-wrap")||(r=e.groupAttr||"data-fancybox-group",l=c.attr(r),l||(r="rel",l=c.get(0)[r]),l&&""!==l&&"nofollow"!==l&&(c=o.length?i(o):n,c=c.filter("["+r+'="'+l+'"]'),d=c.index(this)),e.index=d,s.open(c,e)!==!1&&a.preventDefault())};return e=e||{},t=e.index||0,o&&e.live!==!1?r.undelegate(o,"click.fb-start").delegate(o+":not('.fancybox-item, .fancybox-nav')","click.fb-start",a):n.unbind("click.fb-start").bind("click.fb-start",a),this.filter("[data-fancybox-start=1]").trigger("click"),this},r.ready(function(){var t,n;void 0===i.scrollbarWidth&&(i.scrollbarWidth=function(){var e=i('<div style="width:50px;height:50px;overflow:auto"><div/></div>').appendTo("body"),t=e.children(),n=t.innerWidth()-t.height(99).innerWidth();return e.remove(),n}),void 0===i.support.fixedPosition&&(i.support.fixedPosition=function(){var e=i('<div style="position:fixed;top:20px;"></div>').appendTo("body"),t=20===e[0].offsetTop||15===e[0].offsetTop;return e.remove(),t}()),i.extend(s.defaults,{scrollbarWidth:i.scrollbarWidth(),fixed:i.support.fixedPosition,parent:i("body")}),t=i(e).width(),o.addClass("fancybox-lock-test"),n=i(e).width(),o.removeClass("fancybox-lock-test"),i("<style type='text/css'>.fancybox-margin{margin-right:"+(n-t)+"px;}</style>").appendTo("head")})}(window,document,jQuery);
/*! fancyBox v2.1.5 fancyapps.com | fancyapps.com/fancybox/#license */
(function(r,G,f,v){var J=f("html"),n=f(r),p=f(G),b=f.fancybox=function(){b.open.apply(this,arguments)},I=navigator.userAgent.match(/msie/i),B=null,s=G.createTouch!==v,t=function(a){return a&&a.hasOwnProperty&&a instanceof f},q=function(a){return a&&"string"===f.type(a)},E=function(a){return q(a)&&0<a.indexOf("%")},l=function(a,d){var e=parseInt(a,10)||0;d&&E(a)&&(e*=b.getViewport()[d]/100);return Math.ceil(e)},w=function(a,b){return l(a,b)+"px"};f.extend(b,{version:"2.1.5",defaults:{padding:15,margin:20,
width:800,height:600,minWidth:100,minHeight:100,maxWidth:9999,maxHeight:9999,pixelRatio:1,autoSize:!0,autoHeight:!1,autoWidth:!1,autoResize:!0,autoCenter:!s,fitToView:!0,aspectRatio:!1,topRatio:0.5,leftRatio:0.5,scrolling:"auto",wrapCSS:"",arrows:!0,closeBtn:!0,closeClick:!1,nextClick:!1,mouseWheel:!0,autoPlay:!1,playSpeed:3E3,preload:3,modal:!1,loop:!0,ajax:{dataType:"html",headers:{"X-fancyBox":!0}},iframe:{scrolling:"auto",preload:!0},swf:{wmode:"transparent",allowfullscreen:"true",allowscriptaccess:"always"},
keys:{next:{13:"left",34:"up",39:"left",40:"up"},prev:{8:"right",33:"down",37:"right",38:"down"},close:[27],play:[32],toggle:[70]},direction:{next:"left",prev:"right"},scrollOutside:!0,index:0,type:null,href:null,content:null,title:null,tpl:{wrap:'<div class="fancybox-wrap" tabIndex="-1"><div class="fancybox-skin"><div class="fancybox-outer"><div class="fancybox-inner"></div></div></div></div>',image:'<img class="fancybox-image" src="{href}" alt="" />',iframe:'<iframe id="fancybox-frame{rnd}" name="fancybox-frame{rnd}" class="fancybox-iframe" frameborder="0" vspace="0" hspace="0" webkitAllowFullScreen mozallowfullscreen allowFullScreen'+
(I?' allowtransparency="true"':"")+"></iframe>",error:'<p class="fancybox-error">The requested content cannot be loaded.<br/>Please try again later.</p>',closeBtn:'<a title="Close" class="fancybox-item fancybox-close" href="javascript:;"></a>',next:'<a title="Next" class="fancybox-nav fancybox-next" href="javascript:;"><span></span></a>',prev:'<a title="Previous" class="fancybox-nav fancybox-prev" href="javascript:;"><span></span></a>'},openEffect:"fade",openSpeed:250,openEasing:"swing",openOpacity:!0,
openMethod:"zoomIn",closeEffect:"fade",closeSpeed:250,closeEasing:"swing",closeOpacity:!0,closeMethod:"zoomOut",nextEffect:"elastic",nextSpeed:250,nextEasing:"swing",nextMethod:"changeIn",prevEffect:"elastic",prevSpeed:250,prevEasing:"swing",prevMethod:"changeOut",helpers:{overlay:!0,title:!0},onCancel:f.noop,beforeLoad:f.noop,afterLoad:f.noop,beforeShow:f.noop,afterShow:f.noop,beforeChange:f.noop,beforeClose:f.noop,afterClose:f.noop},group:{},opts:{},previous:null,coming:null,current:null,isActive:!1,
isOpen:!1,isOpened:!1,wrap:null,skin:null,outer:null,inner:null,player:{timer:null,isActive:!1},ajaxLoad:null,imgPreload:null,transitions:{},helpers:{},open:function(a,d){if(a&&(f.isPlainObject(d)||(d={}),!1!==b.close(!0)))return f.isArray(a)||(a=t(a)?f(a).get():[a]),f.each(a,function(e,c){var k={},g,h,j,m,l;"object"===f.type(c)&&(c.nodeType&&(c=f(c)),t(c)?(k={href:c.data("fancybox-href")||c.attr("href"),title:c.data("fancybox-title")||c.attr("title"),isDom:!0,element:c},f.metadata&&f.extend(!0,k,
c.metadata())):k=c);g=d.href||k.href||(q(c)?c:null);h=d.title!==v?d.title:k.title||"";m=(j=d.content||k.content)?"html":d.type||k.type;!m&&k.isDom&&(m=c.data("fancybox-type"),m||(m=(m=c.prop("class").match(/fancybox\.(\w+)/))?m[1]:null));q(g)&&(m||(b.isImage(g)?m="image":b.isSWF(g)?m="swf":"#"===g.charAt(0)?m="inline":q(c)&&(m="html",j=c)),"ajax"===m&&(l=g.split(/\s+/,2),g=l.shift(),l=l.shift()));j||("inline"===m?g?j=f(q(g)?g.replace(/.*(?=#[^\s]+$)/,""):g):k.isDom&&(j=c):"html"===m?j=g:!m&&(!g&&
k.isDom)&&(m="inline",j=c));f.extend(k,{href:g,type:m,content:j,title:h,selector:l});a[e]=k}),b.opts=f.extend(!0,{},b.defaults,d),d.keys!==v&&(b.opts.keys=d.keys?f.extend({},b.defaults.keys,d.keys):!1),b.group=a,b._start(b.opts.index)},cancel:function(){var a=b.coming;a&&!1!==b.trigger("onCancel")&&(b.hideLoading(),b.ajaxLoad&&b.ajaxLoad.abort(),b.ajaxLoad=null,b.imgPreload&&(b.imgPreload.onload=b.imgPreload.onerror=null),a.wrap&&a.wrap.stop(!0,!0).trigger("onReset").remove(),b.coming=null,b.current||
b._afterZoomOut(a))},close:function(a){b.cancel();!1!==b.trigger("beforeClose")&&(b.unbindEvents(),b.isActive&&(!b.isOpen||!0===a?(f(".fancybox-wrap").stop(!0).trigger("onReset").remove(),b._afterZoomOut()):(b.isOpen=b.isOpened=!1,b.isClosing=!0,f(".fancybox-item, .fancybox-nav").remove(),b.wrap.stop(!0,!0).removeClass("fancybox-opened"),b.transitions[b.current.closeMethod]())))},play:function(a){var d=function(){clearTimeout(b.player.timer)},e=function(){d();b.current&&b.player.isActive&&(b.player.timer=
setTimeout(b.next,b.current.playSpeed))},c=function(){d();p.unbind(".player");b.player.isActive=!1;b.trigger("onPlayEnd")};if(!0===a||!b.player.isActive&&!1!==a){if(b.current&&(b.current.loop||b.current.index<b.group.length-1))b.player.isActive=!0,p.bind({"onCancel.player beforeClose.player":c,"onUpdate.player":e,"beforeLoad.player":d}),e(),b.trigger("onPlayStart")}else c()},next:function(a){var d=b.current;d&&(q(a)||(a=d.direction.next),b.jumpto(d.index+1,a,"next"))},prev:function(a){var d=b.current;
d&&(q(a)||(a=d.direction.prev),b.jumpto(d.index-1,a,"prev"))},jumpto:function(a,d,e){var c=b.current;c&&(a=l(a),b.direction=d||c.direction[a>=c.index?"next":"prev"],b.router=e||"jumpto",c.loop&&(0>a&&(a=c.group.length+a%c.group.length),a%=c.group.length),c.group[a]!==v&&(b.cancel(),b._start(a)))},reposition:function(a,d){var e=b.current,c=e?e.wrap:null,k;c&&(k=b._getPosition(d),a&&"scroll"===a.type?(delete k.position,c.stop(!0,!0).animate(k,200)):(c.css(k),e.pos=f.extend({},e.dim,k)))},update:function(a){var d=
a&&a.type,e=!d||"orientationchange"===d;e&&(clearTimeout(B),B=null);b.isOpen&&!B&&(B=setTimeout(function(){var c=b.current;c&&!b.isClosing&&(b.wrap.removeClass("fancybox-tmp"),(e||"load"===d||"resize"===d&&c.autoResize)&&b._setDimension(),"scroll"===d&&c.canShrink||b.reposition(a),b.trigger("onUpdate"),B=null)},e&&!s?0:300))},toggle:function(a){b.isOpen&&(b.current.fitToView="boolean"===f.type(a)?a:!b.current.fitToView,s&&(b.wrap.removeAttr("style").addClass("fancybox-tmp"),b.trigger("onUpdate")),
b.update())},hideLoading:function(){p.unbind(".loading");f("#fancybox-loading").remove()},showLoading:function(){var a,d;b.hideLoading();a=f('<div id="fancybox-loading"><div></div></div>').click(b.cancel).appendTo("body");p.bind("keydown.loading",function(a){if(27===(a.which||a.keyCode))a.preventDefault(),b.cancel()});b.defaults.fixed||(d=b.getViewport(),a.css({position:"absolute",top:0.5*d.h+d.y,left:0.5*d.w+d.x}))},getViewport:function(){var a=b.current&&b.current.locked||!1,d={x:n.scrollLeft(),
y:n.scrollTop()};a?(d.w=a[0].clientWidth,d.h=a[0].clientHeight):(d.w=s&&r.innerWidth?r.innerWidth:n.width(),d.h=s&&r.innerHeight?r.innerHeight:n.height());return d},unbindEvents:function(){b.wrap&&t(b.wrap)&&b.wrap.unbind(".fb");p.unbind(".fb");n.unbind(".fb")},bindEvents:function(){var a=b.current,d;a&&(n.bind("orientationchange.fb"+(s?"":" resize.fb")+(a.autoCenter&&!a.locked?" scroll.fb":""),b.update),(d=a.keys)&&p.bind("keydown.fb",function(e){var c=e.which||e.keyCode,k=e.target||e.srcElement;
if(27===c&&b.coming)return!1;!e.ctrlKey&&(!e.altKey&&!e.shiftKey&&!e.metaKey&&(!k||!k.type&&!f(k).is("[contenteditable]")))&&f.each(d,function(d,k){if(1<a.group.length&&k[c]!==v)return b[d](k[c]),e.preventDefault(),!1;if(-1<f.inArray(c,k))return b[d](),e.preventDefault(),!1})}),f.fn.mousewheel&&a.mouseWheel&&b.wrap.bind("mousewheel.fb",function(d,c,k,g){for(var h=f(d.target||null),j=!1;h.length&&!j&&!h.is(".fancybox-skin")&&!h.is(".fancybox-wrap");)j=h[0]&&!(h[0].style.overflow&&"hidden"===h[0].style.overflow)&&
(h[0].clientWidth&&h[0].scrollWidth>h[0].clientWidth||h[0].clientHeight&&h[0].scrollHeight>h[0].clientHeight),h=f(h).parent();if(0!==c&&!j&&1<b.group.length&&!a.canShrink){if(0<g||0<k)b.prev(0<g?"down":"left");else if(0>g||0>k)b.next(0>g?"up":"right");d.preventDefault()}}))},trigger:function(a,d){var e,c=d||b.coming||b.current;if(c){f.isFunction(c[a])&&(e=c[a].apply(c,Array.prototype.slice.call(arguments,1)));if(!1===e)return!1;c.helpers&&f.each(c.helpers,function(d,e){if(e&&b.helpers[d]&&f.isFunction(b.helpers[d][a]))b.helpers[d][a](f.extend(!0,
{},b.helpers[d].defaults,e),c)});p.trigger(a)}},isImage:function(a){return q(a)&&a.match(/(^data:image\/.*,)|(\.(jp(e|g|eg)|gif|png|bmp|webp|svg)((\?|#).*)?$)/i)},isSWF:function(a){return q(a)&&a.match(/\.(swf)((\?|#).*)?$/i)},_start:function(a){var d={},e,c;a=l(a);e=b.group[a]||null;if(!e)return!1;d=f.extend(!0,{},b.opts,e);e=d.margin;c=d.padding;"number"===f.type(e)&&(d.margin=[e,e,e,e]);"number"===f.type(c)&&(d.padding=[c,c,c,c]);d.modal&&f.extend(!0,d,{closeBtn:!1,closeClick:!1,nextClick:!1,arrows:!1,
mouseWheel:!1,keys:null,helpers:{overlay:{closeClick:!1}}});d.autoSize&&(d.autoWidth=d.autoHeight=!0);"auto"===d.width&&(d.autoWidth=!0);"auto"===d.height&&(d.autoHeight=!0);d.group=b.group;d.index=a;b.coming=d;if(!1===b.trigger("beforeLoad"))b.coming=null;else{c=d.type;e=d.href;if(!c)return b.coming=null,b.current&&b.router&&"jumpto"!==b.router?(b.current.index=a,b[b.router](b.direction)):!1;b.isActive=!0;if("image"===c||"swf"===c)d.autoHeight=d.autoWidth=!1,d.scrolling="visible";"image"===c&&(d.aspectRatio=
!0);"iframe"===c&&s&&(d.scrolling="scroll");d.wrap=f(d.tpl.wrap).addClass("fancybox-"+(s?"mobile":"desktop")+" fancybox-type-"+c+" fancybox-tmp "+d.wrapCSS).appendTo(d.parent||"body");f.extend(d,{skin:f(".fancybox-skin",d.wrap),outer:f(".fancybox-outer",d.wrap),inner:f(".fancybox-inner",d.wrap)});f.each(["Top","Right","Bottom","Left"],function(a,b){d.skin.css("padding"+b,w(d.padding[a]))});b.trigger("onReady");if("inline"===c||"html"===c){if(!d.content||!d.content.length)return b._error("content")}else if(!e)return b._error("href");
"image"===c?b._loadImage():"ajax"===c?b._loadAjax():"iframe"===c?b._loadIframe():b._afterLoad()}},_error:function(a){f.extend(b.coming,{type:"html",autoWidth:!0,autoHeight:!0,minWidth:0,minHeight:0,scrolling:"no",hasError:a,content:b.coming.tpl.error});b._afterLoad()},_loadImage:function(){var a=b.imgPreload=new Image;a.onload=function(){this.onload=this.onerror=null;b.coming.width=this.width/b.opts.pixelRatio;b.coming.height=this.height/b.opts.pixelRatio;b._afterLoad()};a.onerror=function(){this.onload=
this.onerror=null;b._error("image")};a.src=b.coming.href;!0!==a.complete&&b.showLoading()},_loadAjax:function(){var a=b.coming;b.showLoading();b.ajaxLoad=f.ajax(f.extend({},a.ajax,{url:a.href,error:function(a,e){b.coming&&"abort"!==e?b._error("ajax",a):b.hideLoading()},success:function(d,e){"success"===e&&(a.content=d,b._afterLoad())}}))},_loadIframe:function(){var a=b.coming,d=f(a.tpl.iframe.replace(/\{rnd\}/g,(new Date).getTime())).attr("scrolling",s?"auto":a.iframe.scrolling).attr("src",a.href);
f(a.wrap).bind("onReset",function(){try{f(this).find("iframe").hide().attr("src","//about:blank").end().empty()}catch(a){}});a.iframe.preload&&(b.showLoading(),d.one("load",function(){f(this).data("ready",1);s||f(this).bind("load.fb",b.update);f(this).parents(".fancybox-wrap").width("100%").removeClass("fancybox-tmp").show();b._afterLoad()}));a.content=d.appendTo(a.inner);a.iframe.preload||b._afterLoad()},_preloadImages:function(){var a=b.group,d=b.current,e=a.length,c=d.preload?Math.min(d.preload,
e-1):0,f,g;for(g=1;g<=c;g+=1)f=a[(d.index+g)%e],"image"===f.type&&f.href&&((new Image).src=f.href)},_afterLoad:function(){var a=b.coming,d=b.current,e,c,k,g,h;b.hideLoading();if(a&&!1!==b.isActive)if(!1===b.trigger("afterLoad",a,d))a.wrap.stop(!0).trigger("onReset").remove(),b.coming=null;else{d&&(b.trigger("beforeChange",d),d.wrap.stop(!0).removeClass("fancybox-opened").find(".fancybox-item, .fancybox-nav").remove());b.unbindEvents();e=a.content;c=a.type;k=a.scrolling;f.extend(b,{wrap:a.wrap,skin:a.skin,
outer:a.outer,inner:a.inner,current:a,previous:d});g=a.href;switch(c){case "inline":case "ajax":case "html":a.selector?e=f("<div>").html(e).find(a.selector):t(e)&&(e.data("fancybox-placeholder")||e.data("fancybox-placeholder",f('<div class="fancybox-placeholder"></div>').insertAfter(e).hide()),e=e.show().detach(),a.wrap.bind("onReset",function(){f(this).find(e).length&&e.hide().replaceAll(e.data("fancybox-placeholder")).data("fancybox-placeholder",!1)}));break;case "image":e=a.tpl.image.replace("{href}",
g);break;case "swf":e='<object id="fancybox-swf" classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" width="100%" height="100%"><param name="movie" value="'+g+'"></param>',h="",f.each(a.swf,function(a,b){e+='<param name="'+a+'" value="'+b+'"></param>';h+=" "+a+'="'+b+'"'}),e+='<embed src="'+g+'" type="application/x-shockwave-flash" width="100%" height="100%"'+h+"></embed></object>"}(!t(e)||!e.parent().is(a.inner))&&a.inner.append(e);b.trigger("beforeShow");a.inner.css("overflow","yes"===k?"scroll":
"no"===k?"hidden":k);b._setDimension();b.reposition();b.isOpen=!1;b.coming=null;b.bindEvents();if(b.isOpened){if(d.prevMethod)b.transitions[d.prevMethod]()}else f(".fancybox-wrap").not(a.wrap).stop(!0).trigger("onReset").remove();b.transitions[b.isOpened?a.nextMethod:a.openMethod]();b._preloadImages()}},_setDimension:function(){var a=b.getViewport(),d=0,e=!1,c=!1,e=b.wrap,k=b.skin,g=b.inner,h=b.current,c=h.width,j=h.height,m=h.minWidth,u=h.minHeight,n=h.maxWidth,p=h.maxHeight,s=h.scrolling,q=h.scrollOutside?
h.scrollbarWidth:0,x=h.margin,y=l(x[1]+x[3]),r=l(x[0]+x[2]),v,z,t,C,A,F,B,D,H;e.add(k).add(g).width("auto").height("auto").removeClass("fancybox-tmp");x=l(k.outerWidth(!0)-k.width());v=l(k.outerHeight(!0)-k.height());z=y+x;t=r+v;C=E(c)?(a.w-z)*l(c)/100:c;A=E(j)?(a.h-t)*l(j)/100:j;if("iframe"===h.type){if(H=h.content,h.autoHeight&&1===H.data("ready"))try{H[0].contentWindow.document.location&&(g.width(C).height(9999),F=H.contents().find("body"),q&&F.css("overflow-x","hidden"),A=F.outerHeight(!0))}catch(G){}}else if(h.autoWidth||
h.autoHeight)g.addClass("fancybox-tmp"),h.autoWidth||g.width(C),h.autoHeight||g.height(A),h.autoWidth&&(C=g.width()),h.autoHeight&&(A=g.height()),g.removeClass("fancybox-tmp");c=l(C);j=l(A);D=C/A;m=l(E(m)?l(m,"w")-z:m);n=l(E(n)?l(n,"w")-z:n);u=l(E(u)?l(u,"h")-t:u);p=l(E(p)?l(p,"h")-t:p);F=n;B=p;h.fitToView&&(n=Math.min(a.w-z,n),p=Math.min(a.h-t,p));z=a.w-y;r=a.h-r;h.aspectRatio?(c>n&&(c=n,j=l(c/D)),j>p&&(j=p,c=l(j*D)),c<m&&(c=m,j=l(c/D)),j<u&&(j=u,c=l(j*D))):(c=Math.max(m,Math.min(c,n)),h.autoHeight&&
"iframe"!==h.type&&(g.width(c),j=g.height()),j=Math.max(u,Math.min(j,p)));if(h.fitToView)if(g.width(c).height(j),e.width(c+x),a=e.width(),y=e.height(),h.aspectRatio)for(;(a>z||y>r)&&(c>m&&j>u)&&!(19<d++);)j=Math.max(u,Math.min(p,j-10)),c=l(j*D),c<m&&(c=m,j=l(c/D)),c>n&&(c=n,j=l(c/D)),g.width(c).height(j),e.width(c+x),a=e.width(),y=e.height();else c=Math.max(m,Math.min(c,c-(a-z))),j=Math.max(u,Math.min(j,j-(y-r)));q&&("auto"===s&&j<A&&c+x+q<z)&&(c+=q);g.width(c).height(j);e.width(c+x);a=e.width();
y=e.height();e=(a>z||y>r)&&c>m&&j>u;c=h.aspectRatio?c<F&&j<B&&c<C&&j<A:(c<F||j<B)&&(c<C||j<A);f.extend(h,{dim:{width:w(a),height:w(y)},origWidth:C,origHeight:A,canShrink:e,canExpand:c,wPadding:x,hPadding:v,wrapSpace:y-k.outerHeight(!0),skinSpace:k.height()-j});!H&&(h.autoHeight&&j>u&&j<p&&!c)&&g.height("auto")},_getPosition:function(a){var d=b.current,e=b.getViewport(),c=d.margin,f=b.wrap.width()+c[1]+c[3],g=b.wrap.height()+c[0]+c[2],c={position:"absolute",top:c[0],left:c[3]};d.autoCenter&&d.fixed&&
!a&&g<=e.h&&f<=e.w?c.position="fixed":d.locked||(c.top+=e.y,c.left+=e.x);c.top=w(Math.max(c.top,c.top+(e.h-g)*d.topRatio));c.left=w(Math.max(c.left,c.left+(e.w-f)*d.leftRatio));return c},_afterZoomIn:function(){var a=b.current;a&&(b.isOpen=b.isOpened=!0,b.wrap.css("overflow","visible").addClass("fancybox-opened"),b.update(),(a.closeClick||a.nextClick&&1<b.group.length)&&b.inner.css("cursor","pointer").bind("click.fb",function(d){!f(d.target).is("a")&&!f(d.target).parent().is("a")&&(d.preventDefault(),
b[a.closeClick?"close":"next"]())}),a.closeBtn&&f(a.tpl.closeBtn).appendTo(b.skin).bind("click.fb",function(a){a.preventDefault();b.close()}),a.arrows&&1<b.group.length&&((a.loop||0<a.index)&&f(a.tpl.prev).appendTo(b.outer).bind("click.fb",b.prev),(a.loop||a.index<b.group.length-1)&&f(a.tpl.next).appendTo(b.outer).bind("click.fb",b.next)),b.trigger("afterShow"),!a.loop&&a.index===a.group.length-1?b.play(!1):b.opts.autoPlay&&!b.player.isActive&&(b.opts.autoPlay=!1,b.play()))},_afterZoomOut:function(a){a=
a||b.current;f(".fancybox-wrap").trigger("onReset").remove();f.extend(b,{group:{},opts:{},router:!1,current:null,isActive:!1,isOpened:!1,isOpen:!1,isClosing:!1,wrap:null,skin:null,outer:null,inner:null});b.trigger("afterClose",a)}});b.transitions={getOrigPosition:function(){var a=b.current,d=a.element,e=a.orig,c={},f=50,g=50,h=a.hPadding,j=a.wPadding,m=b.getViewport();!e&&(a.isDom&&d.is(":visible"))&&(e=d.find("img:first"),e.length||(e=d));t(e)?(c=e.offset(),e.is("img")&&(f=e.outerWidth(),g=e.outerHeight())):
(c.top=m.y+(m.h-g)*a.topRatio,c.left=m.x+(m.w-f)*a.leftRatio);if("fixed"===b.wrap.css("position")||a.locked)c.top-=m.y,c.left-=m.x;return c={top:w(c.top-h*a.topRatio),left:w(c.left-j*a.leftRatio),width:w(f+j),height:w(g+h)}},step:function(a,d){var e,c,f=d.prop;c=b.current;var g=c.wrapSpace,h=c.skinSpace;if("width"===f||"height"===f)e=d.end===d.start?1:(a-d.start)/(d.end-d.start),b.isClosing&&(e=1-e),c="width"===f?c.wPadding:c.hPadding,c=a-c,b.skin[f](l("width"===f?c:c-g*e)),b.inner[f](l("width"===
f?c:c-g*e-h*e))},zoomIn:function(){var a=b.current,d=a.pos,e=a.openEffect,c="elastic"===e,k=f.extend({opacity:1},d);delete k.position;c?(d=this.getOrigPosition(),a.openOpacity&&(d.opacity=0.1)):"fade"===e&&(d.opacity=0.1);b.wrap.css(d).animate(k,{duration:"none"===e?0:a.openSpeed,easing:a.openEasing,step:c?this.step:null,complete:b._afterZoomIn})},zoomOut:function(){var a=b.current,d=a.closeEffect,e="elastic"===d,c={opacity:0.1};e&&(c=this.getOrigPosition(),a.closeOpacity&&(c.opacity=0.1));b.wrap.animate(c,
{duration:"none"===d?0:a.closeSpeed,easing:a.closeEasing,step:e?this.step:null,complete:b._afterZoomOut})},changeIn:function(){var a=b.current,d=a.nextEffect,e=a.pos,c={opacity:1},f=b.direction,g;e.opacity=0.1;"elastic"===d&&(g="down"===f||"up"===f?"top":"left","down"===f||"right"===f?(e[g]=w(l(e[g])-200),c[g]="+=200px"):(e[g]=w(l(e[g])+200),c[g]="-=200px"));"none"===d?b._afterZoomIn():b.wrap.css(e).animate(c,{duration:a.nextSpeed,easing:a.nextEasing,complete:b._afterZoomIn})},changeOut:function(){var a=
b.previous,d=a.prevEffect,e={opacity:0.1},c=b.direction;"elastic"===d&&(e["down"===c||"up"===c?"top":"left"]=("up"===c||"left"===c?"-":"+")+"=200px");a.wrap.animate(e,{duration:"none"===d?0:a.prevSpeed,easing:a.prevEasing,complete:function(){f(this).trigger("onReset").remove()}})}};b.helpers.overlay={defaults:{closeClick:!0,speedOut:200,showEarly:!0,css:{},locked:!s,fixed:!0},overlay:null,fixed:!1,el:f("html"),create:function(a){a=f.extend({},this.defaults,a);this.overlay&&this.close();this.overlay=
f('<div class="fancybox-overlay"></div>').appendTo(b.coming?b.coming.parent:a.parent);this.fixed=!1;a.fixed&&b.defaults.fixed&&(this.overlay.addClass("fancybox-overlay-fixed"),this.fixed=!0)},open:function(a){var d=this;a=f.extend({},this.defaults,a);this.overlay?this.overlay.unbind(".overlay").width("auto").height("auto"):this.create(a);this.fixed||(n.bind("resize.overlay",f.proxy(this.update,this)),this.update());a.closeClick&&this.overlay.bind("click.overlay",function(a){if(f(a.target).hasClass("fancybox-overlay"))return b.isActive?
b.close():d.close(),!1});this.overlay.css(a.css).show()},close:function(){var a,b;n.unbind("resize.overlay");this.el.hasClass("fancybox-lock")&&(f(".fancybox-margin").removeClass("fancybox-margin"),a=n.scrollTop(),b=n.scrollLeft(),this.el.removeClass("fancybox-lock"),n.scrollTop(a).scrollLeft(b));f(".fancybox-overlay").remove().hide();f.extend(this,{overlay:null,fixed:!1})},update:function(){var a="100%",b;this.overlay.width(a).height("100%");I?(b=Math.max(G.documentElement.offsetWidth,G.body.offsetWidth),
p.width()>b&&(a=p.width())):p.width()>n.width()&&(a=p.width());this.overlay.width(a).height(p.height())},onReady:function(a,b){var e=this.overlay;f(".fancybox-overlay").stop(!0,!0);e||this.create(a);a.locked&&(this.fixed&&b.fixed)&&(e||(this.margin=p.height()>n.height()?f("html").css("margin-right").replace("px",""):!1),b.locked=this.overlay.append(b.wrap),b.fixed=!1);!0===a.showEarly&&this.beforeShow.apply(this,arguments)},beforeShow:function(a,b){var e,c;b.locked&&(!1!==this.margin&&(f("*").filter(function(){return"fixed"===
f(this).css("position")&&!f(this).hasClass("fancybox-overlay")&&!f(this).hasClass("fancybox-wrap")}).addClass("fancybox-margin"),this.el.addClass("fancybox-margin")),e=n.scrollTop(),c=n.scrollLeft(),this.el.addClass("fancybox-lock"),n.scrollTop(e).scrollLeft(c));this.open(a)},onUpdate:function(){this.fixed||this.update()},afterClose:function(a){this.overlay&&!b.coming&&this.overlay.fadeOut(a.speedOut,f.proxy(this.close,this))}};b.helpers.title={defaults:{type:"float",position:"bottom"},beforeShow:function(a){var d=
b.current,e=d.title,c=a.type;f.isFunction(e)&&(e=e.call(d.element,d));if(q(e)&&""!==f.trim(e)){d=f('<div class="fancybox-title fancybox-title-'+c+'-wrap">'+e+"</div>");switch(c){case "inside":c=b.skin;break;case "outside":c=b.wrap;break;case "over":c=b.inner;break;default:c=b.skin,d.appendTo("body"),I&&d.width(d.width()),d.wrapInner('<span class="child"></span>'),b.current.margin[2]+=Math.abs(l(d.css("margin-bottom")))}d["top"===a.position?"prependTo":"appendTo"](c)}}};f.fn.fancybox=function(a){var d,
e=f(this),c=this.selector||"",k=function(g){var h=f(this).blur(),j=d,k,l;!g.ctrlKey&&(!g.altKey&&!g.shiftKey&&!g.metaKey)&&!h.is(".fancybox-wrap")&&(k=a.groupAttr||"data-fancybox-group",l=h.attr(k),l||(k="rel",l=h.get(0)[k]),l&&(""!==l&&"nofollow"!==l)&&(h=c.length?f(c):e,h=h.filter("["+k+'="'+l+'"]'),j=h.index(this)),a.index=j,!1!==b.open(h,a)&&g.preventDefault())};a=a||{};d=a.index||0;!c||!1===a.live?e.unbind("click.fb-start").bind("click.fb-start",k):p.undelegate(c,"click.fb-start").delegate(c+
":not('.fancybox-item, .fancybox-nav')","click.fb-start",k);this.filter("[data-fancybox-start=1]").trigger("click");return this};p.ready(function(){var a,d;f.scrollbarWidth===v&&(f.scrollbarWidth=function(){var a=f('<div style="width:50px;height:50px;overflow:auto"><div/></div>').appendTo("body"),b=a.children(),b=b.innerWidth()-b.height(99).innerWidth();a.remove();return b});if(f.support.fixedPosition===v){a=f.support;d=f('<div style="position:fixed;top:20px;"></div>').appendTo("body");var e=20===
d[0].offsetTop||15===d[0].offsetTop;d.remove();a.fixedPosition=e}f.extend(b.defaults,{scrollbarWidth:f.scrollbarWidth(),fixed:f.support.fixedPosition,parent:f("body")});a=f(r).width();J.addClass("fancybox-lock-test");d=f(r).width();J.removeClass("fancybox-lock-test");f("<style type='text/css'>.fancybox-margin{margin-right:"+(d-a)+"px;}</style>").appendTo("head")})})(window,document,jQuery);
;(function () {
	'use strict';

	/**
	 * @preserve FastClick: polyfill to remove click delays on browsers with touch UIs.
	 *
	 * @codingstandard ftlabs-jsv2
	 * @copyright The Financial Times Limited [All Rights Reserved]
	 * @license MIT License (see LICENSE.txt)
	 */

	/*jslint browser:true, node:true*/
	/*global define, Event, Node*/


	/**
	 * Instantiate fast-clicking listeners on the specified layer.
	 *
	 * @constructor
	 * @param {Element} layer The layer to listen on
	 * @param {Object} [options={}] The options to override the defaults
	 */
	function FastClick(layer, options) {
		var oldOnClick;

		options = options || {};

		/**
		 * Whether a click is currently being tracked.
		 *
		 * @type boolean
		 */
		this.trackingClick = false;


		/**
		 * Timestamp for when click tracking started.
		 *
		 * @type number
		 */
		this.trackingClickStart = 0;


		/**
		 * The element being tracked for a click.
		 *
		 * @type EventTarget
		 */
		this.targetElement = null;


		/**
		 * X-coordinate of touch start event.
		 *
		 * @type number
		 */
		this.touchStartX = 0;


		/**
		 * Y-coordinate of touch start event.
		 *
		 * @type number
		 */
		this.touchStartY = 0;


		/**
		 * ID of the last touch, retrieved from Touch.identifier.
		 *
		 * @type number
		 */
		this.lastTouchIdentifier = 0;


		/**
		 * Touchmove boundary, beyond which a click will be cancelled.
		 *
		 * @type number
		 */
		this.touchBoundary = options.touchBoundary || 10;


		/**
		 * The FastClick layer.
		 *
		 * @type Element
		 */
		this.layer = layer;

		/**
		 * The minimum time between tap(touchstart and touchend) events
		 *
		 * @type number
		 */
		this.tapDelay = options.tapDelay || 200;

		/**
		 * The maximum time for a tap
		 *
		 * @type number
		 */
		this.tapTimeout = options.tapTimeout || 700;

		if (FastClick.notNeeded(layer)) {
			return;
		}

		// Some old versions of Android don't have Function.prototype.bind
		function bind(method, context) {
			return function() { return method.apply(context, arguments); };
		}


		var methods = ['onMouse', 'onClick', 'onTouchStart', 'onTouchMove', 'onTouchEnd', 'onTouchCancel'];
		var context = this;
		for (var i = 0, l = methods.length; i < l; i++) {
			context[methods[i]] = bind(context[methods[i]], context);
		}

		// Set up event handlers as required
		if (deviceIsAndroid) {
			layer.addEventListener('mouseover', this.onMouse, true);
			layer.addEventListener('mousedown', this.onMouse, true);
			layer.addEventListener('mouseup', this.onMouse, true);
		}

		layer.addEventListener('click', this.onClick, true);
		layer.addEventListener('touchstart', this.onTouchStart, false);
		layer.addEventListener('touchmove', this.onTouchMove, false);
		layer.addEventListener('touchend', this.onTouchEnd, false);
		layer.addEventListener('touchcancel', this.onTouchCancel, false);

		// Hack is required for browsers that don't support Event#stopImmediatePropagation (e.g. Android 2)
		// which is how FastClick normally stops click events bubbling to callbacks registered on the FastClick
		// layer when they are cancelled.
		if (!Event.prototype.stopImmediatePropagation) {
			layer.removeEventListener = function(type, callback, capture) {
				var rmv = Node.prototype.removeEventListener;
				if (type === 'click') {
					rmv.call(layer, type, callback.hijacked || callback, capture);
				} else {
					rmv.call(layer, type, callback, capture);
				}
			};

			layer.addEventListener = function(type, callback, capture) {
				var adv = Node.prototype.addEventListener;
				if (type === 'click') {
					adv.call(layer, type, callback.hijacked || (callback.hijacked = function(event) {
						if (!event.propagationStopped) {
							callback(event);
						}
					}), capture);
				} else {
					adv.call(layer, type, callback, capture);
				}
			};
		}

		// If a handler is already declared in the element's onclick attribute, it will be fired before
		// FastClick's onClick handler. Fix this by pulling out the user-defined handler function and
		// adding it as listener.
		if (typeof layer.onclick === 'function') {

			// Android browser on at least 3.2 requires a new reference to the function in layer.onclick
			// - the old one won't work if passed to addEventListener directly.
			oldOnClick = layer.onclick;
			layer.addEventListener('click', function(event) {
				oldOnClick(event);
			}, false);
			layer.onclick = null;
		}
	}

	/**
	* Windows Phone 8.1 fakes user agent string to look like Android and iPhone.
	*
	* @type boolean
	*/
	var deviceIsWindowsPhone = navigator.userAgent.indexOf("Windows Phone") >= 0;

	/**
	 * Android requires exceptions.
	 *
	 * @type boolean
	 */
	var deviceIsAndroid = navigator.userAgent.indexOf('Android') > 0 && !deviceIsWindowsPhone;


	/**
	 * iOS requires exceptions.
	 *
	 * @type boolean
	 */
	var deviceIsIOS = /iP(ad|hone|od)/.test(navigator.userAgent) && !deviceIsWindowsPhone;


	/**
	 * iOS 4 requires an exception for select elements.
	 *
	 * @type boolean
	 */
	var deviceIsIOS4 = deviceIsIOS && (/OS 4_\d(_\d)?/).test(navigator.userAgent);


	/**
	 * iOS 6.0-7.* requires the target element to be manually derived
	 *
	 * @type boolean
	 */
	var deviceIsIOSWithBadTarget = deviceIsIOS && (/OS [6-7]_\d/).test(navigator.userAgent);

	/**
	 * BlackBerry requires exceptions.
	 *
	 * @type boolean
	 */
	var deviceIsBlackBerry10 = navigator.userAgent.indexOf('BB10') > 0;

	/**
	 * Determine whether a given element requires a native click.
	 *
	 * @param {EventTarget|Element} target Target DOM element
	 * @returns {boolean} Returns true if the element needs a native click
	 */
	FastClick.prototype.needsClick = function(target) {
		switch (target.nodeName.toLowerCase()) {

		// Don't send a synthetic click to disabled inputs (issue #62)
		case 'button':
		case 'select':
		case 'textarea':
			if (target.disabled) {
				return true;
			}

			break;
		case 'input':

			// File inputs need real clicks on iOS 6 due to a browser bug (issue #68)
			if ((deviceIsIOS && target.type === 'file') || target.disabled) {
				return true;
			}

			break;
		case 'label':
		case 'iframe': // iOS8 homescreen apps can prevent events bubbling into frames
		case 'video':
			return true;
		}

		return (/\bneedsclick\b/).test(target.className);
	};


	/**
	 * Determine whether a given element requires a call to focus to simulate click into element.
	 *
	 * @param {EventTarget|Element} target Target DOM element
	 * @returns {boolean} Returns true if the element requires a call to focus to simulate native click.
	 */
	FastClick.prototype.needsFocus = function(target) {
		switch (target.nodeName.toLowerCase()) {
		case 'textarea':
			return true;
		case 'select':
			return !deviceIsAndroid;
		case 'input':
			switch (target.type) {
			case 'button':
			case 'checkbox':
			case 'file':
			case 'image':
			case 'radio':
			case 'submit':
				return false;
			}

			// No point in attempting to focus disabled inputs
			return !target.disabled && !target.readOnly;
		default:
			return (/\bneedsfocus\b/).test(target.className);
		}
	};


	/**
	 * Send a click event to the specified element.
	 *
	 * @param {EventTarget|Element} targetElement
	 * @param {Event} event
	 */
	FastClick.prototype.sendClick = function(targetElement, event) {
		var clickEvent, touch;

		// On some Android devices activeElement needs to be blurred otherwise the synthetic click will have no effect (#24)
		if (document.activeElement && document.activeElement !== targetElement) {
			document.activeElement.blur();
		}

		touch = event.changedTouches[0];

		// Synthesise a click event, with an extra attribute so it can be tracked
		clickEvent = document.createEvent('MouseEvents');
		clickEvent.initMouseEvent(this.determineEventType(targetElement), true, true, window, 1, touch.screenX, touch.screenY, touch.clientX, touch.clientY, false, false, false, false, 0, null);
		clickEvent.forwardedTouchEvent = true;
		targetElement.dispatchEvent(clickEvent);
	};

	FastClick.prototype.determineEventType = function(targetElement) {

		//Issue #159: Android Chrome Select Box does not open with a synthetic click event
		if (deviceIsAndroid && targetElement.tagName.toLowerCase() === 'select') {
			return 'mousedown';
		}

		return 'click';
	};


	/**
	 * @param {EventTarget|Element} targetElement
	 */
	FastClick.prototype.focus = function(targetElement) {
		var length;

		// Issue #160: on iOS 7, some input elements (e.g. date datetime month) throw a vague TypeError on setSelectionRange. These elements don't have an integer value for the selectionStart and selectionEnd properties, but unfortunately that can't be used for detection because accessing the properties also throws a TypeError. Just check the type instead. Filed as Apple bug #15122724.
		if (deviceIsIOS && targetElement.setSelectionRange && targetElement.type.indexOf('date') !== 0 && targetElement.type !== 'time' && targetElement.type !== 'month') {
			length = targetElement.value.length;
			targetElement.setSelectionRange(length, length);
		} else {
			targetElement.focus();
		}
	};


	/**
	 * Check whether the given target element is a child of a scrollable layer and if so, set a flag on it.
	 *
	 * @param {EventTarget|Element} targetElement
	 */
	FastClick.prototype.updateScrollParent = function(targetElement) {
		var scrollParent, parentElement;

		scrollParent = targetElement.fastClickScrollParent;

		// Attempt to discover whether the target element is contained within a scrollable layer. Re-check if the
		// target element was moved to another parent.
		if (!scrollParent || !scrollParent.contains(targetElement)) {
			parentElement = targetElement;
			do {
				if (parentElement.scrollHeight > parentElement.offsetHeight) {
					scrollParent = parentElement;
					targetElement.fastClickScrollParent = parentElement;
					break;
				}

				parentElement = parentElement.parentElement;
			} while (parentElement);
		}

		// Always update the scroll top tracker if possible.
		if (scrollParent) {
			scrollParent.fastClickLastScrollTop = scrollParent.scrollTop;
		}
	};


	/**
	 * @param {EventTarget} targetElement
	 * @returns {Element|EventTarget}
	 */
	FastClick.prototype.getTargetElementFromEventTarget = function(eventTarget) {

		// On some older browsers (notably Safari on iOS 4.1 - see issue #56) the event target may be a text node.
		if (eventTarget.nodeType === Node.TEXT_NODE) {
			return eventTarget.parentNode;
		}

		return eventTarget;
	};


	/**
	 * On touch start, record the position and scroll offset.
	 *
	 * @param {Event} event
	 * @returns {boolean}
	 */
	FastClick.prototype.onTouchStart = function(event) {
		var targetElement, touch, selection;

		// Ignore multiple touches, otherwise pinch-to-zoom is prevented if both fingers are on the FastClick element (issue #111).
		if (event.targetTouches.length > 1) {
			return true;
		}

		targetElement = this.getTargetElementFromEventTarget(event.target);
		touch = event.targetTouches[0];

		if (deviceIsIOS) {

			// Only trusted events will deselect text on iOS (issue #49)
			selection = window.getSelection();
			if (selection.rangeCount && !selection.isCollapsed) {
				return true;
			}

			if (!deviceIsIOS4) {

				// Weird things happen on iOS when an alert or confirm dialog is opened from a click event callback (issue #23):
				// when the user next taps anywhere else on the page, new touchstart and touchend events are dispatched
				// with the same identifier as the touch event that previously triggered the click that triggered the alert.
				// Sadly, there is an issue on iOS 4 that causes some normal touch events to have the same identifier as an
				// immediately preceeding touch event (issue #52), so this fix is unavailable on that platform.
				// Issue 120: touch.identifier is 0 when Chrome dev tools 'Emulate touch events' is set with an iOS device UA string,
				// which causes all touch events to be ignored. As this block only applies to iOS, and iOS identifiers are always long,
				// random integers, it's safe to to continue if the identifier is 0 here.
				if (touch.identifier && touch.identifier === this.lastTouchIdentifier) {
					event.preventDefault();
					return false;
				}

				this.lastTouchIdentifier = touch.identifier;

				// If the target element is a child of a scrollable layer (using -webkit-overflow-scrolling: touch) and:
				// 1) the user does a fling scroll on the scrollable layer
				// 2) the user stops the fling scroll with another tap
				// then the event.target of the last 'touchend' event will be the element that was under the user's finger
				// when the fling scroll was started, causing FastClick to send a click event to that layer - unless a check
				// is made to ensure that a parent layer was not scrolled before sending a synthetic click (issue #42).
				this.updateScrollParent(targetElement);
			}
		}

		this.trackingClick = true;
		this.trackingClickStart = event.timeStamp;
		this.targetElement = targetElement;

		this.touchStartX = touch.pageX;
		this.touchStartY = touch.pageY;

		// Prevent phantom clicks on fast double-tap (issue #36)
		if ((event.timeStamp - this.lastClickTime) < this.tapDelay) {
			event.preventDefault();
		}

		return true;
	};


	/**
	 * Based on a touchmove event object, check whether the touch has moved past a boundary since it started.
	 *
	 * @param {Event} event
	 * @returns {boolean}
	 */
	FastClick.prototype.touchHasMoved = function(event) {
		var touch = event.changedTouches[0], boundary = this.touchBoundary;

		if (Math.abs(touch.pageX - this.touchStartX) > boundary || Math.abs(touch.pageY - this.touchStartY) > boundary) {
			return true;
		}

		return false;
	};


	/**
	 * Update the last position.
	 *
	 * @param {Event} event
	 * @returns {boolean}
	 */
	FastClick.prototype.onTouchMove = function(event) {
		if (!this.trackingClick) {
			return true;
		}

		// If the touch has moved, cancel the click tracking
		if (this.targetElement !== this.getTargetElementFromEventTarget(event.target) || this.touchHasMoved(event)) {
			this.trackingClick = false;
			this.targetElement = null;
		}

		return true;
	};


	/**
	 * Attempt to find the labelled control for the given label element.
	 *
	 * @param {EventTarget|HTMLLabelElement} labelElement
	 * @returns {Element|null}
	 */
	FastClick.prototype.findControl = function(labelElement) {

		// Fast path for newer browsers supporting the HTML5 control attribute
		if (labelElement.control !== undefined) {
			return labelElement.control;
		}

		// All browsers under test that support touch events also support the HTML5 htmlFor attribute
		if (labelElement.htmlFor) {
			return document.getElementById(labelElement.htmlFor);
		}

		// If no for attribute exists, attempt to retrieve the first labellable descendant element
		// the list of which is defined here: http://www.w3.org/TR/html5/forms.html#category-label
		return labelElement.querySelector('button, input:not([type=hidden]), keygen, meter, output, progress, select, textarea');
	};


	/**
	 * On touch end, determine whether to send a click event at once.
	 *
	 * @param {Event} event
	 * @returns {boolean}
	 */
	FastClick.prototype.onTouchEnd = function(event) {
		var forElement, trackingClickStart, targetTagName, scrollParent, touch, targetElement = this.targetElement;

		if (!this.trackingClick) {
			return true;
		}

		// Prevent phantom clicks on fast double-tap (issue #36)
		if ((event.timeStamp - this.lastClickTime) < this.tapDelay) {
			this.cancelNextClick = true;
			return true;
		}

		if ((event.timeStamp - this.trackingClickStart) > this.tapTimeout) {
			return true;
		}

		// Reset to prevent wrong click cancel on input (issue #156).
		this.cancelNextClick = false;

		this.lastClickTime = event.timeStamp;

		trackingClickStart = this.trackingClickStart;
		this.trackingClick = false;
		this.trackingClickStart = 0;

		// On some iOS devices, the targetElement supplied with the event is invalid if the layer
		// is performing a transition or scroll, and has to be re-detected manually. Note that
		// for this to function correctly, it must be called *after* the event target is checked!
		// See issue #57; also filed as rdar://13048589 .
		if (deviceIsIOSWithBadTarget) {
			touch = event.changedTouches[0];

			// In certain cases arguments of elementFromPoint can be negative, so prevent setting targetElement to null
			targetElement = document.elementFromPoint(touch.pageX - window.pageXOffset, touch.pageY - window.pageYOffset) || targetElement;
			targetElement.fastClickScrollParent = this.targetElement.fastClickScrollParent;
		}

		targetTagName = targetElement.tagName.toLowerCase();
		if (targetTagName === 'label') {
			forElement = this.findControl(targetElement);
			if (forElement) {
				this.focus(targetElement);
				if (deviceIsAndroid) {
					return false;
				}

				targetElement = forElement;
			}
		} else if (this.needsFocus(targetElement)) {

			// Case 1: If the touch started a while ago (best guess is 100ms based on tests for issue #36) then focus will be triggered anyway. Return early and unset the target element reference so that the subsequent click will be allowed through.
			// Case 2: Without this exception for input elements tapped when the document is contained in an iframe, then any inputted text won't be visible even though the value attribute is updated as the user types (issue #37).
			if ((event.timeStamp - trackingClickStart) > 100 || (deviceIsIOS && window.top !== window && targetTagName === 'input')) {
				this.targetElement = null;
				return false;
			}

			this.focus(targetElement);
			this.sendClick(targetElement, event);

			// Select elements need the event to go through on iOS 4, otherwise the selector menu won't open.
			// Also this breaks opening selects when VoiceOver is active on iOS6, iOS7 (and possibly others)
			if (!deviceIsIOS || targetTagName !== 'select') {
				this.targetElement = null;
				event.preventDefault();
			}

			return false;
		}

		if (deviceIsIOS && !deviceIsIOS4) {

			// Don't send a synthetic click event if the target element is contained within a parent layer that was scrolled
			// and this tap is being used to stop the scrolling (usually initiated by a fling - issue #42).
			scrollParent = targetElement.fastClickScrollParent;
			if (scrollParent && scrollParent.fastClickLastScrollTop !== scrollParent.scrollTop) {
				return true;
			}
		}

		// Prevent the actual click from going though - unless the target node is marked as requiring
		// real clicks or if it is in the whitelist in which case only non-programmatic clicks are permitted.
		if (!this.needsClick(targetElement)) {
			event.preventDefault();
			this.sendClick(targetElement, event);
		}

		return false;
	};


	/**
	 * On touch cancel, stop tracking the click.
	 *
	 * @returns {void}
	 */
	FastClick.prototype.onTouchCancel = function() {
		this.trackingClick = false;
		this.targetElement = null;
	};


	/**
	 * Determine mouse events which should be permitted.
	 *
	 * @param {Event} event
	 * @returns {boolean}
	 */
	FastClick.prototype.onMouse = function(event) {

		// If a target element was never set (because a touch event was never fired) allow the event
		if (!this.targetElement) {
			return true;
		}

		if (event.forwardedTouchEvent) {
			return true;
		}

		// Programmatically generated events targeting a specific element should be permitted
		if (!event.cancelable) {
			return true;
		}

		// Derive and check the target element to see whether the mouse event needs to be permitted;
		// unless explicitly enabled, prevent non-touch click events from triggering actions,
		// to prevent ghost/doubleclicks.
		if (!this.needsClick(this.targetElement) || this.cancelNextClick) {

			// Prevent any user-added listeners declared on FastClick element from being fired.
			if (event.stopImmediatePropagation) {
				event.stopImmediatePropagation();
			} else {

				// Part of the hack for browsers that don't support Event#stopImmediatePropagation (e.g. Android 2)
				event.propagationStopped = true;
			}

			// Cancel the event
			event.stopPropagation();
			event.preventDefault();

			return false;
		}

		// If the mouse event is permitted, return true for the action to go through.
		return true;
	};


	/**
	 * On actual clicks, determine whether this is a touch-generated click, a click action occurring
	 * naturally after a delay after a touch (which needs to be cancelled to avoid duplication), or
	 * an actual click which should be permitted.
	 *
	 * @param {Event} event
	 * @returns {boolean}
	 */
	FastClick.prototype.onClick = function(event) {
		var permitted;

		// It's possible for another FastClick-like library delivered with third-party code to fire a click event before FastClick does (issue #44). In that case, set the click-tracking flag back to false and return early. This will cause onTouchEnd to return early.
		if (this.trackingClick) {
			this.targetElement = null;
			this.trackingClick = false;
			return true;
		}

		// Very odd behaviour on iOS (issue #18): if a submit element is present inside a form and the user hits enter in the iOS simulator or clicks the Go button on the pop-up OS keyboard the a kind of 'fake' click event will be triggered with the submit-type input element as the target.
		if (event.target.type === 'submit' && event.detail === 0) {
			return true;
		}

		permitted = this.onMouse(event);

		// Only unset targetElement if the click is not permitted. This will ensure that the check for !targetElement in onMouse fails and the browser's click doesn't go through.
		if (!permitted) {
			this.targetElement = null;
		}

		// If clicks are permitted, return true for the action to go through.
		return permitted;
	};


	/**
	 * Remove all FastClick's event listeners.
	 *
	 * @returns {void}
	 */
	FastClick.prototype.destroy = function() {
		var layer = this.layer;

		if (deviceIsAndroid) {
			layer.removeEventListener('mouseover', this.onMouse, true);
			layer.removeEventListener('mousedown', this.onMouse, true);
			layer.removeEventListener('mouseup', this.onMouse, true);
		}

		layer.removeEventListener('click', this.onClick, true);
		layer.removeEventListener('touchstart', this.onTouchStart, false);
		layer.removeEventListener('touchmove', this.onTouchMove, false);
		layer.removeEventListener('touchend', this.onTouchEnd, false);
		layer.removeEventListener('touchcancel', this.onTouchCancel, false);
	};


	/**
	 * Check whether FastClick is needed.
	 *
	 * @param {Element} layer The layer to listen on
	 */
	FastClick.notNeeded = function(layer) {
		var metaViewport;
		var chromeVersion;
		var blackberryVersion;
		var firefoxVersion;

		// Devices that don't support touch don't need FastClick
		if (typeof window.ontouchstart === 'undefined') {
			return true;
		}

		// Chrome version - zero for other browsers
		chromeVersion = +(/Chrome\/([0-9]+)/.exec(navigator.userAgent) || [,0])[1];

		if (chromeVersion) {

			if (deviceIsAndroid) {
				metaViewport = document.querySelector('meta[name=viewport]');

				if (metaViewport) {
					// Chrome on Android with user-scalable="no" doesn't need FastClick (issue #89)
					if (metaViewport.content.indexOf('user-scalable=no') !== -1) {
						return true;
					}
					// Chrome 32 and above with width=device-width or less don't need FastClick
					if (chromeVersion > 31 && document.documentElement.scrollWidth <= window.outerWidth) {
						return true;
					}
				}

			// Chrome desktop doesn't need FastClick (issue #15)
			} else {
				return true;
			}
		}

		if (deviceIsBlackBerry10) {
			blackberryVersion = navigator.userAgent.match(/Version\/([0-9]*)\.([0-9]*)/);

			// BlackBerry 10.3+ does not require Fastclick library.
			// https://github.com/ftlabs/fastclick/issues/251
			if (blackberryVersion[1] >= 10 && blackberryVersion[2] >= 3) {
				metaViewport = document.querySelector('meta[name=viewport]');

				if (metaViewport) {
					// user-scalable=no eliminates click delay.
					if (metaViewport.content.indexOf('user-scalable=no') !== -1) {
						return true;
					}
					// width=device-width (or less than device-width) eliminates click delay.
					if (document.documentElement.scrollWidth <= window.outerWidth) {
						return true;
					}
				}
			}
		}

		// IE10 with -ms-touch-action: none or manipulation, which disables double-tap-to-zoom (issue #97)
		if (layer.style.msTouchAction === 'none' || layer.style.touchAction === 'manipulation') {
			return true;
		}

		// Firefox version - zero for other browsers
		firefoxVersion = +(/Firefox\/([0-9]+)/.exec(navigator.userAgent) || [,0])[1];

		if (firefoxVersion >= 27) {
			// Firefox 27+ does not have tap delay if the content is not zoomable - https://bugzilla.mozilla.org/show_bug.cgi?id=922896

			metaViewport = document.querySelector('meta[name=viewport]');
			if (metaViewport && (metaViewport.content.indexOf('user-scalable=no') !== -1 || document.documentElement.scrollWidth <= window.outerWidth)) {
				return true;
			}
		}

		// IE11: prefixed -ms-touch-action is no longer supported and it's recomended to use non-prefixed version
		// http://msdn.microsoft.com/en-us/library/windows/apps/Hh767313.aspx
		if (layer.style.touchAction === 'none' || layer.style.touchAction === 'manipulation') {
			return true;
		}

		return false;
	};


	/**
	 * Factory method for creating a FastClick object
	 *
	 * @param {Element} layer The layer to listen on
	 * @param {Object} [options={}] The options to override the defaults
	 */
	FastClick.attach = function(layer, options) {
		return new FastClick(layer, options);
	};


	if (typeof define === 'function' && typeof define.amd === 'object' && define.amd) {

		// AMD. Register as an anonymous module.
		define(function() {
			return FastClick;
		});
	} else if (typeof module !== 'undefined' && module.exports) {
		module.exports = FastClick.attach;
		module.exports.FastClick = FastClick;
	} else {
		window.FastClick = FastClick;
	}
}());

!function(){"use strict";function t(e,o){function i(t,e){return function(){return t.apply(e,arguments)}}var r;if(o=o||{},this.trackingClick=!1,this.trackingClickStart=0,this.targetElement=null,this.touchStartX=0,this.touchStartY=0,this.lastTouchIdentifier=0,this.touchBoundary=o.touchBoundary||10,this.layer=e,this.tapDelay=o.tapDelay||200,this.tapTimeout=o.tapTimeout||700,!t.notNeeded(e)){for(var a=["onMouse","onClick","onTouchStart","onTouchMove","onTouchEnd","onTouchCancel"],c=this,s=0,u=a.length;u>s;s++)c[a[s]]=i(c[a[s]],c);n&&(e.addEventListener("mouseover",this.onMouse,!0),e.addEventListener("mousedown",this.onMouse,!0),e.addEventListener("mouseup",this.onMouse,!0)),e.addEventListener("click",this.onClick,!0),e.addEventListener("touchstart",this.onTouchStart,!1),e.addEventListener("touchmove",this.onTouchMove,!1),e.addEventListener("touchend",this.onTouchEnd,!1),e.addEventListener("touchcancel",this.onTouchCancel,!1),Event.prototype.stopImmediatePropagation||(e.removeEventListener=function(t,n,o){var i=Node.prototype.removeEventListener;"click"===t?i.call(e,t,n.hijacked||n,o):i.call(e,t,n,o)},e.addEventListener=function(t,n,o){var i=Node.prototype.addEventListener;"click"===t?i.call(e,t,n.hijacked||(n.hijacked=function(t){t.propagationStopped||n(t)}),o):i.call(e,t,n,o)}),"function"==typeof e.onclick&&(r=e.onclick,e.addEventListener("click",function(t){r(t)},!1),e.onclick=null)}}var e=navigator.userAgent.indexOf("Windows Phone")>=0,n=navigator.userAgent.indexOf("Android")>0&&!e,o=/iP(ad|hone|od)/.test(navigator.userAgent)&&!e,i=o&&/OS 4_\d(_\d)?/.test(navigator.userAgent),r=o&&/OS [6-7]_\d/.test(navigator.userAgent),a=navigator.userAgent.indexOf("BB10")>0;t.prototype.needsClick=function(t){switch(t.nodeName.toLowerCase()){case"button":case"select":case"textarea":if(t.disabled)return!0;break;case"input":if(o&&"file"===t.type||t.disabled)return!0;break;case"label":case"iframe":case"video":return!0}return/\bneedsclick\b/.test(t.className)},t.prototype.needsFocus=function(t){switch(t.nodeName.toLowerCase()){case"textarea":return!0;case"select":return!n;case"input":switch(t.type){case"button":case"checkbox":case"file":case"image":case"radio":case"submit":return!1}return!t.disabled&&!t.readOnly;default:return/\bneedsfocus\b/.test(t.className)}},t.prototype.sendClick=function(t,e){var n,o;document.activeElement&&document.activeElement!==t&&document.activeElement.blur(),o=e.changedTouches[0],n=document.createEvent("MouseEvents"),n.initMouseEvent(this.determineEventType(t),!0,!0,window,1,o.screenX,o.screenY,o.clientX,o.clientY,!1,!1,!1,!1,0,null),n.forwardedTouchEvent=!0,t.dispatchEvent(n)},t.prototype.determineEventType=function(t){return n&&"select"===t.tagName.toLowerCase()?"mousedown":"click"},t.prototype.focus=function(t){var e;o&&t.setSelectionRange&&0!==t.type.indexOf("date")&&"time"!==t.type&&"month"!==t.type?(e=t.value.length,t.setSelectionRange(e,e)):t.focus()},t.prototype.updateScrollParent=function(t){var e,n;if(e=t.fastClickScrollParent,!e||!e.contains(t)){n=t;do{if(n.scrollHeight>n.offsetHeight){e=n,t.fastClickScrollParent=n;break}n=n.parentElement}while(n)}e&&(e.fastClickLastScrollTop=e.scrollTop)},t.prototype.getTargetElementFromEventTarget=function(t){return t.nodeType===Node.TEXT_NODE?t.parentNode:t},t.prototype.onTouchStart=function(t){var e,n,r;if(t.targetTouches.length>1)return!0;if(e=this.getTargetElementFromEventTarget(t.target),n=t.targetTouches[0],o){if(r=window.getSelection(),r.rangeCount&&!r.isCollapsed)return!0;if(!i){if(n.identifier&&n.identifier===this.lastTouchIdentifier)return t.preventDefault(),!1;this.lastTouchIdentifier=n.identifier,this.updateScrollParent(e)}}return this.trackingClick=!0,this.trackingClickStart=t.timeStamp,this.targetElement=e,this.touchStartX=n.pageX,this.touchStartY=n.pageY,t.timeStamp-this.lastClickTime<this.tapDelay&&t.preventDefault(),!0},t.prototype.touchHasMoved=function(t){var e=t.changedTouches[0],n=this.touchBoundary;return Math.abs(e.pageX-this.touchStartX)>n||Math.abs(e.pageY-this.touchStartY)>n?!0:!1},t.prototype.onTouchMove=function(t){return this.trackingClick?((this.targetElement!==this.getTargetElementFromEventTarget(t.target)||this.touchHasMoved(t))&&(this.trackingClick=!1,this.targetElement=null),!0):!0},t.prototype.findControl=function(t){return void 0!==t.control?t.control:t.htmlFor?document.getElementById(t.htmlFor):t.querySelector("button, input:not([type=hidden]), keygen, meter, output, progress, select, textarea")},t.prototype.onTouchEnd=function(t){var e,a,c,s,u,l=this.targetElement;if(!this.trackingClick)return!0;if(t.timeStamp-this.lastClickTime<this.tapDelay)return this.cancelNextClick=!0,!0;if(t.timeStamp-this.trackingClickStart>this.tapTimeout)return!0;if(this.cancelNextClick=!1,this.lastClickTime=t.timeStamp,a=this.trackingClickStart,this.trackingClick=!1,this.trackingClickStart=0,r&&(u=t.changedTouches[0],l=document.elementFromPoint(u.pageX-window.pageXOffset,u.pageY-window.pageYOffset)||l,l.fastClickScrollParent=this.targetElement.fastClickScrollParent),c=l.tagName.toLowerCase(),"label"===c){if(e=this.findControl(l)){if(this.focus(l),n)return!1;l=e}}else if(this.needsFocus(l))return t.timeStamp-a>100||o&&window.top!==window&&"input"===c?(this.targetElement=null,!1):(this.focus(l),this.sendClick(l,t),o&&"select"===c||(this.targetElement=null,t.preventDefault()),!1);return o&&!i&&(s=l.fastClickScrollParent,s&&s.fastClickLastScrollTop!==s.scrollTop)?!0:(this.needsClick(l)||(t.preventDefault(),this.sendClick(l,t)),!1)},t.prototype.onTouchCancel=function(){this.trackingClick=!1,this.targetElement=null},t.prototype.onMouse=function(t){return this.targetElement?t.forwardedTouchEvent?!0:t.cancelable&&(!this.needsClick(this.targetElement)||this.cancelNextClick)?(t.stopImmediatePropagation?t.stopImmediatePropagation():t.propagationStopped=!0,t.stopPropagation(),t.preventDefault(),!1):!0:!0},t.prototype.onClick=function(t){var e;return this.trackingClick?(this.targetElement=null,this.trackingClick=!1,!0):"submit"===t.target.type&&0===t.detail?!0:(e=this.onMouse(t),e||(this.targetElement=null),e)},t.prototype.destroy=function(){var t=this.layer;n&&(t.removeEventListener("mouseover",this.onMouse,!0),t.removeEventListener("mousedown",this.onMouse,!0),t.removeEventListener("mouseup",this.onMouse,!0)),t.removeEventListener("click",this.onClick,!0),t.removeEventListener("touchstart",this.onTouchStart,!1),t.removeEventListener("touchmove",this.onTouchMove,!1),t.removeEventListener("touchend",this.onTouchEnd,!1),t.removeEventListener("touchcancel",this.onTouchCancel,!1)},t.notNeeded=function(t){var e,o,i,r;if("undefined"==typeof window.ontouchstart)return!0;if(o=+(/Chrome\/([0-9]+)/.exec(navigator.userAgent)||[,0])[1]){if(!n)return!0;if(e=document.querySelector("meta[name=viewport]")){if(-1!==e.content.indexOf("user-scalable=no"))return!0;if(o>31&&document.documentElement.scrollWidth<=window.outerWidth)return!0}}if(a&&(i=navigator.userAgent.match(/Version\/([0-9]*)\.([0-9]*)/),i[1]>=10&&i[2]>=3&&(e=document.querySelector("meta[name=viewport]")))){if(-1!==e.content.indexOf("user-scalable=no"))return!0;if(document.documentElement.scrollWidth<=window.outerWidth)return!0}return"none"===t.style.msTouchAction||"manipulation"===t.style.touchAction?!0:(r=+(/Firefox\/([0-9]+)/.exec(navigator.userAgent)||[,0])[1],r>=27&&(e=document.querySelector("meta[name=viewport]"),e&&(-1!==e.content.indexOf("user-scalable=no")||document.documentElement.scrollWidth<=window.outerWidth))?!0:"none"===t.style.touchAction||"manipulation"===t.style.touchAction?!0:!1)},t.attach=function(e,n){return new t(e,n)},"function"==typeof define&&"object"==typeof define.amd&&define.amd?define(function(){return t}):"undefined"!=typeof module&&module.exports?(module.exports=t.attach,module.exports.FastClick=t):window.FastClick=t}();
/**
 * UAParser.js v0.7.9
 * Lightweight JavaScript-based User-Agent string parser
 * https://github.com/faisalman/ua-parser-js
 *
 * Copyright © 2012-2015 Faisal Salman <fyzlman@gmail.com>
 * Dual licensed under GPLv2 & MIT
 */
(function(window,undefined){"use strict";var LIBVERSION="0.7.9",EMPTY="",UNKNOWN="?",FUNC_TYPE="function",UNDEF_TYPE="undefined",OBJ_TYPE="object",STR_TYPE="string",MAJOR="major",MODEL="model",NAME="name",TYPE="type",VENDOR="vendor",VERSION="version",ARCHITECTURE="architecture",CONSOLE="console",MOBILE="mobile",TABLET="tablet",SMARTTV="smarttv",WEARABLE="wearable",EMBEDDED="embedded";var util={extend:function(regexes,extensions){for(var i in extensions){if("browser cpu device engine os".indexOf(i)!==-1&&extensions[i].length%2===0){regexes[i]=extensions[i].concat(regexes[i])}}return regexes},has:function(str1,str2){if(typeof str1==="string"){return str2.toLowerCase().indexOf(str1.toLowerCase())!==-1}else{return false}},lowerize:function(str){return str.toLowerCase()},major:function(version){return typeof version===STR_TYPE?version.split(".")[0]:undefined}};var mapper={rgx:function(){var result,i=0,j,k,p,q,matches,match,args=arguments;while(i<args.length&&!matches){var regex=args[i],props=args[i+1];if(typeof result===UNDEF_TYPE){result={};for(p in props){q=props[p];if(typeof q===OBJ_TYPE){result[q[0]]=undefined}else{result[q]=undefined}}}j=k=0;while(j<regex.length&&!matches){matches=regex[j++].exec(this.getUA());if(!!matches){for(p=0;p<props.length;p++){match=matches[++k];q=props[p];if(typeof q===OBJ_TYPE&&q.length>0){if(q.length==2){if(typeof q[1]==FUNC_TYPE){result[q[0]]=q[1].call(this,match)}else{result[q[0]]=q[1]}}else if(q.length==3){if(typeof q[1]===FUNC_TYPE&&!(q[1].exec&&q[1].test)){result[q[0]]=match?q[1].call(this,match,q[2]):undefined}else{result[q[0]]=match?match.replace(q[1],q[2]):undefined}}else if(q.length==4){result[q[0]]=match?q[3].call(this,match.replace(q[1],q[2])):undefined}}else{result[q]=match?match:undefined}}}}i+=2}return result},str:function(str,map){for(var i in map){if(typeof map[i]===OBJ_TYPE&&map[i].length>0){for(var j=0;j<map[i].length;j++){if(util.has(map[i][j],str)){return i===UNKNOWN?undefined:i}}}else if(util.has(map[i],str)){return i===UNKNOWN?undefined:i}}return str}};var maps={browser:{oldsafari:{version:{"1.0":"/8",1.2:"/1",1.3:"/3","2.0":"/412","2.0.2":"/416","2.0.3":"/417","2.0.4":"/419","?":"/"}}},device:{amazon:{model:{"Fire Phone":["SD","KF"]}},sprint:{model:{"Evo Shift 4G":"7373KT"},vendor:{HTC:"APA",Sprint:"Sprint"}}},os:{windows:{version:{ME:"4.90","NT 3.11":"NT3.51","NT 4.0":"NT4.0",2000:"NT 5.0",XP:["NT 5.1","NT 5.2"],Vista:"NT 6.0",7:"NT 6.1",8:"NT 6.2",8.1:"NT 6.3",10:["NT 6.4","NT 10.0"],RT:"ARM"}}}};var regexes={browser:[[/(opera\smini)\/([\w\.-]+)/i,/(opera\s[mobiletab]+).+version\/([\w\.-]+)/i,/(opera).+version\/([\w\.]+)/i,/(opera)[\/\s]+([\w\.]+)/i],[NAME,VERSION],[/\s(opr)\/([\w\.]+)/i],[[NAME,"Opera"],VERSION],[/(kindle)\/([\w\.]+)/i,/(lunascape|maxthon|netfront|jasmine|blazer)[\/\s]?([\w\.]+)*/i,/(avant\s|iemobile|slim|baidu)(?:browser)?[\/\s]?([\w\.]*)/i,/(?:ms|\()(ie)\s([\w\.]+)/i,/(rekonq)\/([\w\.]+)*/i,/(chromium|flock|rockmelt|midori|epiphany|silk|skyfire|ovibrowser|bolt|iron|vivaldi|iridium)\/([\w\.-]+)/i],[NAME,VERSION],[/(trident).+rv[:\s]([\w\.]+).+like\sgecko/i],[[NAME,"IE"],VERSION],[/(edge)\/((\d+)?[\w\.]+)/i],[NAME,VERSION],[/(yabrowser)\/([\w\.]+)/i],[[NAME,"Yandex"],VERSION],[/(comodo_dragon)\/([\w\.]+)/i],[[NAME,/_/g," "],VERSION],[/(chrome|omniweb|arora|[tizenoka]{5}\s?browser)\/v?([\w\.]+)/i,/(uc\s?browser|qqbrowser)[\/\s]?([\w\.]+)/i],[NAME,VERSION],[/(dolfin)\/([\w\.]+)/i],[[NAME,"Dolphin"],VERSION],[/((?:android.+)crmo|crios)\/([\w\.]+)/i],[[NAME,"Chrome"],VERSION],[/XiaoMi\/MiuiBrowser\/([\w\.]+)/i],[VERSION,[NAME,"MIUI Browser"]],[/android.+version\/([\w\.]+)\s+(?:mobile\s?safari|safari)/i],[VERSION,[NAME,"Android Browser"]],[/FBAV\/([\w\.]+);/i],[VERSION,[NAME,"Facebook"]],[/version\/([\w\.]+).+?mobile\/\w+\s(safari)/i],[VERSION,[NAME,"Mobile Safari"]],[/version\/([\w\.]+).+?(mobile\s?safari|safari)/i],[VERSION,NAME],[/webkit.+?(mobile\s?safari|safari)(\/[\w\.]+)/i],[NAME,[VERSION,mapper.str,maps.browser.oldsafari.version]],[/(konqueror)\/([\w\.]+)/i,/(webkit|khtml)\/([\w\.]+)/i],[NAME,VERSION],[/(navigator|netscape)\/([\w\.-]+)/i],[[NAME,"Netscape"],VERSION],[/fxios\/([\w\.-]+)/i],[VERSION,[NAME,"Firefox"]],[/(swiftfox)/i,/(icedragon|iceweasel|camino|chimera|fennec|maemo\sbrowser|minimo|conkeror)[\/\s]?([\w\.\+]+)/i,/(firefox|seamonkey|k-meleon|icecat|iceape|firebird|phoenix)\/([\w\.-]+)/i,/(mozilla)\/([\w\.]+).+rv\:.+gecko\/\d+/i,/(polaris|lynx|dillo|icab|doris|amaya|w3m|netsurf)[\/\s]?([\w\.]+)/i,/(links)\s\(([\w\.]+)/i,/(gobrowser)\/?([\w\.]+)*/i,/(ice\s?browser)\/v?([\w\._]+)/i,/(mosaic)[\/\s]([\w\.]+)/i],[NAME,VERSION]],cpu:[[/(?:(amd|x(?:(?:86|64)[_-])?|wow|win)64)[;\)]/i],[[ARCHITECTURE,"amd64"]],[/(ia32(?=;))/i],[[ARCHITECTURE,util.lowerize]],[/((?:i[346]|x)86)[;\)]/i],[[ARCHITECTURE,"ia32"]],[/windows\s(ce|mobile);\sppc;/i],[[ARCHITECTURE,"arm"]],[/((?:ppc|powerpc)(?:64)?)(?:\smac|;|\))/i],[[ARCHITECTURE,/ower/,"",util.lowerize]],[/(sun4\w)[;\)]/i],[[ARCHITECTURE,"sparc"]],[/((?:avr32|ia64(?=;))|68k(?=\))|arm(?:64|(?=v\d+;))|(?=atmel\s)avr|(?:irix|mips|sparc)(?:64)?(?=;)|pa-risc)/i],[[ARCHITECTURE,util.lowerize]]],device:[[/\((ipad|playbook);[\w\s\);-]+(rim|apple)/i],[MODEL,VENDOR,[TYPE,TABLET]],[/applecoremedia\/[\w\.]+ \((ipad)/],[MODEL,[VENDOR,"Apple"],[TYPE,TABLET]],[/(apple\s{0,1}tv)/i],[[MODEL,"Apple TV"],[VENDOR,"Apple"]],[/(archos)\s(gamepad2?)/i,/(hp).+(touchpad)/i,/(kindle)\/([\w\.]+)/i,/\s(nook)[\w\s]+build\/(\w+)/i,/(dell)\s(strea[kpr\s\d]*[\dko])/i],[VENDOR,MODEL,[TYPE,TABLET]],[/(kf[A-z]+)\sbuild\/[\w\.]+.*silk\//i],[MODEL,[VENDOR,"Amazon"],[TYPE,TABLET]],[/(sd|kf)[0349hijorstuw]+\sbuild\/[\w\.]+.*silk\//i],[[MODEL,mapper.str,maps.device.amazon.model],[VENDOR,"Amazon"],[TYPE,MOBILE]],[/\((ip[honed|\s\w*]+);.+(apple)/i],[MODEL,VENDOR,[TYPE,MOBILE]],[/\((ip[honed|\s\w*]+);/i],[MODEL,[VENDOR,"Apple"],[TYPE,MOBILE]],[/(blackberry)[\s-]?(\w+)/i,/(blackberry|benq|palm(?=\-)|sonyericsson|acer|asus|dell|huawei|meizu|motorola|polytron)[\s_-]?([\w-]+)*/i,/(hp)\s([\w\s]+\w)/i,/(asus)-?(\w+)/i],[VENDOR,MODEL,[TYPE,MOBILE]],[/\(bb10;\s(\w+)/i],[MODEL,[VENDOR,"BlackBerry"],[TYPE,MOBILE]],[/android.+(transfo[prime\s]{4,10}\s\w+|eeepc|slider\s\w+|nexus 7)/i],[MODEL,[VENDOR,"Asus"],[TYPE,TABLET]],[/(sony)\s(tablet\s[ps])\sbuild\//i,/(sony)?(?:sgp.+)\sbuild\//i],[[VENDOR,"Sony"],[MODEL,"Xperia Tablet"],[TYPE,TABLET]],[/(?:sony)?(?:(?:(?:c|d)\d{4})|(?:so[-l].+))\sbuild\//i],[[VENDOR,"Sony"],[MODEL,"Xperia Phone"],[TYPE,MOBILE]],[/\s(ouya)\s/i,/(nintendo)\s([wids3u]+)/i],[VENDOR,MODEL,[TYPE,CONSOLE]],[/android.+;\s(shield)\sbuild/i],[MODEL,[VENDOR,"Nvidia"],[TYPE,CONSOLE]],[/(playstation\s[3portablevi]+)/i],[MODEL,[VENDOR,"Sony"],[TYPE,CONSOLE]],[/(sprint\s(\w+))/i],[[VENDOR,mapper.str,maps.device.sprint.vendor],[MODEL,mapper.str,maps.device.sprint.model],[TYPE,MOBILE]],[/(lenovo)\s?(S(?:5000|6000)+(?:[-][\w+]))/i],[VENDOR,MODEL,[TYPE,TABLET]],[/(htc)[;_\s-]+([\w\s]+(?=\))|\w+)*/i,/(zte)-(\w+)*/i,/(alcatel|geeksphone|huawei|lenovo|nexian|panasonic|(?=;\s)sony)[_\s-]?([\w-]+)*/i],[VENDOR,[MODEL,/_/g," "],[TYPE,MOBILE]],[/(nexus\s9)/i],[MODEL,[VENDOR,"HTC"],[TYPE,TABLET]],[/[\s\(;](xbox(?:\sone)?)[\s\);]/i],[MODEL,[VENDOR,"Microsoft"],[TYPE,CONSOLE]],[/(kin\.[onetw]{3})/i],[[MODEL,/\./g," "],[VENDOR,"Microsoft"],[TYPE,MOBILE]],[/\s(milestone|droid(?:[2-4x]|\s(?:bionic|x2|pro|razr))?(:?\s4g)?)[\w\s]+build\//i,/mot[\s-]?(\w+)*/i,/(XT\d{3,4}) build\//i],[MODEL,[VENDOR,"Motorola"],[TYPE,MOBILE]],[/android.+\s(mz60\d|xoom[\s2]{0,2})\sbuild\//i],[MODEL,[VENDOR,"Motorola"],[TYPE,TABLET]],[/android.+((sch-i[89]0\d|shw-m380s|gt-p\d{4}|gt-n8000|sgh-t8[56]9|nexus 10))/i,/((SM-T\w+))/i],[[VENDOR,"Samsung"],MODEL,[TYPE,TABLET]],[/((s[cgp]h-\w+|gt-\w+|galaxy\snexus|sm-n900))/i,/(sam[sung]*)[\s-]*(\w+-?[\w-]*)*/i,/sec-((sgh\w+))/i],[[VENDOR,"Samsung"],MODEL,[TYPE,MOBILE]],[/(samsung);smarttv/i],[VENDOR,MODEL,[TYPE,SMARTTV]],[/\(dtv[\);].+(aquos)/i],[MODEL,[VENDOR,"Sharp"],[TYPE,SMARTTV]],[/sie-(\w+)*/i],[MODEL,[VENDOR,"Siemens"],[TYPE,MOBILE]],[/(maemo|nokia).*(n900|lumia\s\d+)/i,/(nokia)[\s_-]?([\w-]+)*/i],[[VENDOR,"Nokia"],MODEL,[TYPE,MOBILE]],[/android\s3\.[\s\w;-]{10}(a\d{3})/i],[MODEL,[VENDOR,"Acer"],[TYPE,TABLET]],[/android\s3\.[\s\w;-]{10}(lg?)-([06cv9]{3,4})/i],[[VENDOR,"LG"],MODEL,[TYPE,TABLET]],[/(lg) netcast\.tv/i],[VENDOR,MODEL,[TYPE,SMARTTV]],[/(nexus\s[45])/i,/lg[e;\s\/-]+(\w+)*/i],[MODEL,[VENDOR,"LG"],[TYPE,MOBILE]],[/android.+(ideatab[a-z0-9\-\s]+)/i],[MODEL,[VENDOR,"Lenovo"],[TYPE,TABLET]],[/linux;.+((jolla));/i],[VENDOR,MODEL,[TYPE,MOBILE]],[/((pebble))app\/[\d\.]+\s/i],[VENDOR,MODEL,[TYPE,WEARABLE]],[/android.+;\s(glass)\s\d/i],[MODEL,[VENDOR,"Google"],[TYPE,WEARABLE]],[/android.+(\w+)\s+build\/hm\1/i,/android.+(hm[\s\-_]*note?[\s_]*(?:\d\w)?)\s+build/i,/android.+(mi[\s\-_]*(?:one|one[\s_]plus)?[\s_]*(?:\d\w)?)\s+build/i],[[MODEL,/_/g," "],[VENDOR,"Xiaomi"],[TYPE,MOBILE]],[/(mobile|tablet);.+rv\:.+gecko\//i],[[TYPE,util.lowerize],VENDOR,MODEL]],engine:[[/windows.+\sedge\/([\w\.]+)/i],[VERSION,[NAME,"EdgeHTML"]],[/(presto)\/([\w\.]+)/i,/(webkit|trident|netfront|netsurf|amaya|lynx|w3m)\/([\w\.]+)/i,/(khtml|tasman|links)[\/\s]\(?([\w\.]+)/i,/(icab)[\/\s]([23]\.[\d\.]+)/i],[NAME,VERSION],[/rv\:([\w\.]+).*(gecko)/i],[VERSION,NAME]],os:[[/microsoft\s(windows)\s(vista|xp)/i],[NAME,VERSION],[/(windows)\snt\s6\.2;\s(arm)/i,/(windows\sphone(?:\sos)*|windows\smobile|windows)[\s\/]?([ntce\d\.\s]+\w)/i],[NAME,[VERSION,mapper.str,maps.os.windows.version]],[/(win(?=3|9|n)|win\s9x\s)([nt\d\.]+)/i],[[NAME,"Windows"],[VERSION,mapper.str,maps.os.windows.version]],[/\((bb)(10);/i],[[NAME,"BlackBerry"],VERSION],[/(blackberry)\w*\/?([\w\.]+)*/i,/(tizen)[\/\s]([\w\.]+)/i,/(android|webos|palm\sos|qnx|bada|rim\stablet\sos|meego|contiki)[\/\s-]?([\w\.]+)*/i,/linux;.+(sailfish);/i],[NAME,VERSION],[/(symbian\s?os|symbos|s60(?=;))[\/\s-]?([\w\.]+)*/i],[[NAME,"Symbian"],VERSION],[/\((series40);/i],[NAME],[/mozilla.+\(mobile;.+gecko.+firefox/i],[[NAME,"Firefox OS"],VERSION],[/(nintendo|playstation)\s([wids3portablevu]+)/i,/(mint)[\/\s\(]?(\w+)*/i,/(mageia|vectorlinux)[;\s]/i,/(joli|[kxln]?ubuntu|debian|[open]*suse|gentoo|arch|slackware|fedora|mandriva|centos|pclinuxos|redhat|zenwalk|linpus)[\/\s-]?([\w\.-]+)*/i,/(hurd|linux)\s?([\w\.]+)*/i,/(gnu)\s?([\w\.]+)*/i],[NAME,VERSION],[/(cros)\s[\w]+\s([\w\.]+\w)/i],[[NAME,"Chromium OS"],VERSION],[/(sunos)\s?([\w\.]+\d)*/i],[[NAME,"Solaris"],VERSION],[/\s([frentopc-]{0,4}bsd|dragonfly)\s?([\w\.]+)*/i],[NAME,VERSION],[/(ip[honead]+)(?:.*os\s*([\w]+)*\slike\smac|;\sopera)/i],[[NAME,"iOS"],[VERSION,/_/g,"."]],[/(mac\sos\sx)\s?([\w\s\.]+\w)*/i,/(macintosh|mac(?=_powerpc)\s)/i],[[NAME,"Mac OS"],[VERSION,/_/g,"."]],[/((?:open)?solaris)[\/\s-]?([\w\.]+)*/i,/(haiku)\s(\w+)/i,/(aix)\s((\d)(?=\.|\)|\s)[\w\.]*)*/i,/(plan\s9|minix|beos|os\/2|amigaos|morphos|risc\sos|openvms)/i,/(unix)\s?([\w\.]+)*/i],[NAME,VERSION]]};var UAParser=function(uastring,extensions){if(!(this instanceof UAParser)){return new UAParser(uastring,extensions).getResult()}var ua=uastring||(window&&window.navigator&&window.navigator.userAgent?window.navigator.userAgent:EMPTY);var rgxmap=extensions?util.extend(regexes,extensions):regexes;this.getBrowser=function(){var browser=mapper.rgx.apply(this,rgxmap.browser);browser.major=util.major(browser.version);return browser};this.getCPU=function(){return mapper.rgx.apply(this,rgxmap.cpu)};this.getDevice=function(){return mapper.rgx.apply(this,rgxmap.device)};this.getEngine=function(){return mapper.rgx.apply(this,rgxmap.engine)};this.getOS=function(){return mapper.rgx.apply(this,rgxmap.os)};this.getResult=function(){return{ua:this.getUA(),browser:this.getBrowser(),engine:this.getEngine(),os:this.getOS(),device:this.getDevice(),cpu:this.getCPU()}};this.getUA=function(){return ua};this.setUA=function(uastring){ua=uastring;return this};this.setUA(ua);return this};UAParser.VERSION=LIBVERSION;UAParser.BROWSER={NAME:NAME,MAJOR:MAJOR,VERSION:VERSION};UAParser.CPU={ARCHITECTURE:ARCHITECTURE};UAParser.DEVICE={MODEL:MODEL,VENDOR:VENDOR,TYPE:TYPE,CONSOLE:CONSOLE,MOBILE:MOBILE,SMARTTV:SMARTTV,TABLET:TABLET,WEARABLE:WEARABLE,EMBEDDED:EMBEDDED};UAParser.ENGINE={NAME:NAME,VERSION:VERSION};UAParser.OS={NAME:NAME,VERSION:VERSION};if(typeof exports!==UNDEF_TYPE){if(typeof module!==UNDEF_TYPE&&module.exports){exports=module.exports=UAParser}exports.UAParser=UAParser}else{if(typeof define===FUNC_TYPE&&define.amd){define(function(){return UAParser})}else{window.UAParser=UAParser}}var $=window.jQuery||window.Zepto;if(typeof $!==UNDEF_TYPE){var parser=new UAParser;$.ua=parser.getResult();$.ua.get=function(){return parser.getUA()};$.ua.set=function(uastring){parser.setUA(uastring);var result=parser.getResult();for(var prop in result){$.ua[prop]=result[prop]}}}})(typeof window==="object"?window:this);
/**
 * UAParser.js v0.7.9
 * Lightweight JavaScript-based User-Agent string parser
 * https://github.com/faisalman/ua-parser-js
 *
 * Copyright © 2012-2015 Faisal Salman <fyzlman@gmail.com>
 * Dual licensed under GPLv2 & MIT
 */
!function(i,e){"use strict";var s="0.7.9",o="",r="?",n="function",a="undefined",t="object",w="string",l="major",d="model",p="name",c="type",u="vendor",m="version",f="architecture",g="console",b="mobile",h="tablet",v="smarttv",x="wearable",k="embedded",y={extend:function(i,e){for(var s in e)-1!=="browser cpu device engine os".indexOf(s)&&e[s].length%2===0&&(i[s]=e[s].concat(i[s]));return i},has:function(i,e){return"string"==typeof i?-1!==e.toLowerCase().indexOf(i.toLowerCase()):!1},lowerize:function(i){return i.toLowerCase()},major:function(i){return typeof i===w?i.split(".")[0]:e}},A={rgx:function(){for(var i,s,o,r,w,l,d,p=0,c=arguments;p<c.length&&!l;){var u=c[p],m=c[p+1];if(typeof i===a){i={};for(r in m)w=m[r],typeof w===t?i[w[0]]=e:i[w]=e}for(s=o=0;s<u.length&&!l;)if(l=u[s++].exec(this.getUA()))for(r=0;r<m.length;r++)d=l[++o],w=m[r],typeof w===t&&w.length>0?2==w.length?i[w[0]]=typeof w[1]==n?w[1].call(this,d):w[1]:3==w.length?i[w[0]]=typeof w[1]!==n||w[1].exec&&w[1].test?d?d.replace(w[1],w[2]):e:d?w[1].call(this,d,w[2]):e:4==w.length&&(i[w[0]]=d?w[3].call(this,d.replace(w[1],w[2])):e):i[w]=d?d:e;p+=2}return i},str:function(i,s){for(var o in s)if(typeof s[o]===t&&s[o].length>0){for(var n=0;n<s[o].length;n++)if(y.has(s[o][n],i))return o===r?e:o}else if(y.has(s[o],i))return o===r?e:o;return i}},E={browser:{oldsafari:{version:{"1.0":"/8",1.2:"/1",1.3:"/3","2.0":"/412","2.0.2":"/416","2.0.3":"/417","2.0.4":"/419","?":"/"}}},device:{amazon:{model:{"Fire Phone":["SD","KF"]}},sprint:{model:{"Evo Shift 4G":"7373KT"},vendor:{HTC:"APA",Sprint:"Sprint"}}},os:{windows:{version:{ME:"4.90","NT 3.11":"NT3.51","NT 4.0":"NT4.0",2000:"NT 5.0",XP:["NT 5.1","NT 5.2"],Vista:"NT 6.0",7:"NT 6.1",8:"NT 6.2",8.1:"NT 6.3",10:["NT 6.4","NT 10.0"],RT:"ARM"}}}},S={browser:[[/(opera\smini)\/([\w\.-]+)/i,/(opera\s[mobiletab]+).+version\/([\w\.-]+)/i,/(opera).+version\/([\w\.]+)/i,/(opera)[\/\s]+([\w\.]+)/i],[p,m],[/\s(opr)\/([\w\.]+)/i],[[p,"Opera"],m],[/(kindle)\/([\w\.]+)/i,/(lunascape|maxthon|netfront|jasmine|blazer)[\/\s]?([\w\.]+)*/i,/(avant\s|iemobile|slim|baidu)(?:browser)?[\/\s]?([\w\.]*)/i,/(?:ms|\()(ie)\s([\w\.]+)/i,/(rekonq)\/([\w\.]+)*/i,/(chromium|flock|rockmelt|midori|epiphany|silk|skyfire|ovibrowser|bolt|iron|vivaldi|iridium)\/([\w\.-]+)/i],[p,m],[/(trident).+rv[:\s]([\w\.]+).+like\sgecko/i],[[p,"IE"],m],[/(edge)\/((\d+)?[\w\.]+)/i],[p,m],[/(yabrowser)\/([\w\.]+)/i],[[p,"Yandex"],m],[/(comodo_dragon)\/([\w\.]+)/i],[[p,/_/g," "],m],[/(chrome|omniweb|arora|[tizenoka]{5}\s?browser)\/v?([\w\.]+)/i,/(uc\s?browser|qqbrowser)[\/\s]?([\w\.]+)/i],[p,m],[/(dolfin)\/([\w\.]+)/i],[[p,"Dolphin"],m],[/((?:android.+)crmo|crios)\/([\w\.]+)/i],[[p,"Chrome"],m],[/XiaoMi\/MiuiBrowser\/([\w\.]+)/i],[m,[p,"MIUI Browser"]],[/android.+version\/([\w\.]+)\s+(?:mobile\s?safari|safari)/i],[m,[p,"Android Browser"]],[/FBAV\/([\w\.]+);/i],[m,[p,"Facebook"]],[/version\/([\w\.]+).+?mobile\/\w+\s(safari)/i],[m,[p,"Mobile Safari"]],[/version\/([\w\.]+).+?(mobile\s?safari|safari)/i],[m,p],[/webkit.+?(mobile\s?safari|safari)(\/[\w\.]+)/i],[p,[m,A.str,E.browser.oldsafari.version]],[/(konqueror)\/([\w\.]+)/i,/(webkit|khtml)\/([\w\.]+)/i],[p,m],[/(navigator|netscape)\/([\w\.-]+)/i],[[p,"Netscape"],m],[/fxios\/([\w\.-]+)/i],[m,[p,"Firefox"]],[/(swiftfox)/i,/(icedragon|iceweasel|camino|chimera|fennec|maemo\sbrowser|minimo|conkeror)[\/\s]?([\w\.\+]+)/i,/(firefox|seamonkey|k-meleon|icecat|iceape|firebird|phoenix)\/([\w\.-]+)/i,/(mozilla)\/([\w\.]+).+rv\:.+gecko\/\d+/i,/(polaris|lynx|dillo|icab|doris|amaya|w3m|netsurf)[\/\s]?([\w\.]+)/i,/(links)\s\(([\w\.]+)/i,/(gobrowser)\/?([\w\.]+)*/i,/(ice\s?browser)\/v?([\w\._]+)/i,/(mosaic)[\/\s]([\w\.]+)/i],[p,m]],cpu:[[/(?:(amd|x(?:(?:86|64)[_-])?|wow|win)64)[;\)]/i],[[f,"amd64"]],[/(ia32(?=;))/i],[[f,y.lowerize]],[/((?:i[346]|x)86)[;\)]/i],[[f,"ia32"]],[/windows\s(ce|mobile);\sppc;/i],[[f,"arm"]],[/((?:ppc|powerpc)(?:64)?)(?:\smac|;|\))/i],[[f,/ower/,"",y.lowerize]],[/(sun4\w)[;\)]/i],[[f,"sparc"]],[/((?:avr32|ia64(?=;))|68k(?=\))|arm(?:64|(?=v\d+;))|(?=atmel\s)avr|(?:irix|mips|sparc)(?:64)?(?=;)|pa-risc)/i],[[f,y.lowerize]]],device:[[/\((ipad|playbook);[\w\s\);-]+(rim|apple)/i],[d,u,[c,h]],[/applecoremedia\/[\w\.]+ \((ipad)/],[d,[u,"Apple"],[c,h]],[/(apple\s{0,1}tv)/i],[[d,"Apple TV"],[u,"Apple"]],[/(archos)\s(gamepad2?)/i,/(hp).+(touchpad)/i,/(kindle)\/([\w\.]+)/i,/\s(nook)[\w\s]+build\/(\w+)/i,/(dell)\s(strea[kpr\s\d]*[\dko])/i],[u,d,[c,h]],[/(kf[A-z]+)\sbuild\/[\w\.]+.*silk\//i],[d,[u,"Amazon"],[c,h]],[/(sd|kf)[0349hijorstuw]+\sbuild\/[\w\.]+.*silk\//i],[[d,A.str,E.device.amazon.model],[u,"Amazon"],[c,b]],[/\((ip[honed|\s\w*]+);.+(apple)/i],[d,u,[c,b]],[/\((ip[honed|\s\w*]+);/i],[d,[u,"Apple"],[c,b]],[/(blackberry)[\s-]?(\w+)/i,/(blackberry|benq|palm(?=\-)|sonyericsson|acer|asus|dell|huawei|meizu|motorola|polytron)[\s_-]?([\w-]+)*/i,/(hp)\s([\w\s]+\w)/i,/(asus)-?(\w+)/i],[u,d,[c,b]],[/\(bb10;\s(\w+)/i],[d,[u,"BlackBerry"],[c,b]],[/android.+(transfo[prime\s]{4,10}\s\w+|eeepc|slider\s\w+|nexus 7)/i],[d,[u,"Asus"],[c,h]],[/(sony)\s(tablet\s[ps])\sbuild\//i,/(sony)?(?:sgp.+)\sbuild\//i],[[u,"Sony"],[d,"Xperia Tablet"],[c,h]],[/(?:sony)?(?:(?:(?:c|d)\d{4})|(?:so[-l].+))\sbuild\//i],[[u,"Sony"],[d,"Xperia Phone"],[c,b]],[/\s(ouya)\s/i,/(nintendo)\s([wids3u]+)/i],[u,d,[c,g]],[/android.+;\s(shield)\sbuild/i],[d,[u,"Nvidia"],[c,g]],[/(playstation\s[3portablevi]+)/i],[d,[u,"Sony"],[c,g]],[/(sprint\s(\w+))/i],[[u,A.str,E.device.sprint.vendor],[d,A.str,E.device.sprint.model],[c,b]],[/(lenovo)\s?(S(?:5000|6000)+(?:[-][\w+]))/i],[u,d,[c,h]],[/(htc)[;_\s-]+([\w\s]+(?=\))|\w+)*/i,/(zte)-(\w+)*/i,/(alcatel|geeksphone|huawei|lenovo|nexian|panasonic|(?=;\s)sony)[_\s-]?([\w-]+)*/i],[u,[d,/_/g," "],[c,b]],[/(nexus\s9)/i],[d,[u,"HTC"],[c,h]],[/[\s\(;](xbox(?:\sone)?)[\s\);]/i],[d,[u,"Microsoft"],[c,g]],[/(kin\.[onetw]{3})/i],[[d,/\./g," "],[u,"Microsoft"],[c,b]],[/\s(milestone|droid(?:[2-4x]|\s(?:bionic|x2|pro|razr))?(:?\s4g)?)[\w\s]+build\//i,/mot[\s-]?(\w+)*/i,/(XT\d{3,4}) build\//i],[d,[u,"Motorola"],[c,b]],[/android.+\s(mz60\d|xoom[\s2]{0,2})\sbuild\//i],[d,[u,"Motorola"],[c,h]],[/android.+((sch-i[89]0\d|shw-m380s|gt-p\d{4}|gt-n8000|sgh-t8[56]9|nexus 10))/i,/((SM-T\w+))/i],[[u,"Samsung"],d,[c,h]],[/((s[cgp]h-\w+|gt-\w+|galaxy\snexus|sm-n900))/i,/(sam[sung]*)[\s-]*(\w+-?[\w-]*)*/i,/sec-((sgh\w+))/i],[[u,"Samsung"],d,[c,b]],[/(samsung);smarttv/i],[u,d,[c,v]],[/\(dtv[\);].+(aquos)/i],[d,[u,"Sharp"],[c,v]],[/sie-(\w+)*/i],[d,[u,"Siemens"],[c,b]],[/(maemo|nokia).*(n900|lumia\s\d+)/i,/(nokia)[\s_-]?([\w-]+)*/i],[[u,"Nokia"],d,[c,b]],[/android\s3\.[\s\w;-]{10}(a\d{3})/i],[d,[u,"Acer"],[c,h]],[/android\s3\.[\s\w;-]{10}(lg?)-([06cv9]{3,4})/i],[[u,"LG"],d,[c,h]],[/(lg) netcast\.tv/i],[u,d,[c,v]],[/(nexus\s[45])/i,/lg[e;\s\/-]+(\w+)*/i],[d,[u,"LG"],[c,b]],[/android.+(ideatab[a-z0-9\-\s]+)/i],[d,[u,"Lenovo"],[c,h]],[/linux;.+((jolla));/i],[u,d,[c,b]],[/((pebble))app\/[\d\.]+\s/i],[u,d,[c,x]],[/android.+;\s(glass)\s\d/i],[d,[u,"Google"],[c,x]],[/android.+(\w+)\s+build\/hm\1/i,/android.+(hm[\s\-_]*note?[\s_]*(?:\d\w)?)\s+build/i,/android.+(mi[\s\-_]*(?:one|one[\s_]plus)?[\s_]*(?:\d\w)?)\s+build/i],[[d,/_/g," "],[u,"Xiaomi"],[c,b]],[/(mobile|tablet);.+rv\:.+gecko\//i],[[c,y.lowerize],u,d]],engine:[[/windows.+\sedge\/([\w\.]+)/i],[m,[p,"EdgeHTML"]],[/(presto)\/([\w\.]+)/i,/(webkit|trident|netfront|netsurf|amaya|lynx|w3m)\/([\w\.]+)/i,/(khtml|tasman|links)[\/\s]\(?([\w\.]+)/i,/(icab)[\/\s]([23]\.[\d\.]+)/i],[p,m],[/rv\:([\w\.]+).*(gecko)/i],[m,p]],os:[[/microsoft\s(windows)\s(vista|xp)/i],[p,m],[/(windows)\snt\s6\.2;\s(arm)/i,/(windows\sphone(?:\sos)*|windows\smobile|windows)[\s\/]?([ntce\d\.\s]+\w)/i],[p,[m,A.str,E.os.windows.version]],[/(win(?=3|9|n)|win\s9x\s)([nt\d\.]+)/i],[[p,"Windows"],[m,A.str,E.os.windows.version]],[/\((bb)(10);/i],[[p,"BlackBerry"],m],[/(blackberry)\w*\/?([\w\.]+)*/i,/(tizen)[\/\s]([\w\.]+)/i,/(android|webos|palm\sos|qnx|bada|rim\stablet\sos|meego|contiki)[\/\s-]?([\w\.]+)*/i,/linux;.+(sailfish);/i],[p,m],[/(symbian\s?os|symbos|s60(?=;))[\/\s-]?([\w\.]+)*/i],[[p,"Symbian"],m],[/\((series40);/i],[p],[/mozilla.+\(mobile;.+gecko.+firefox/i],[[p,"Firefox OS"],m],[/(nintendo|playstation)\s([wids3portablevu]+)/i,/(mint)[\/\s\(]?(\w+)*/i,/(mageia|vectorlinux)[;\s]/i,/(joli|[kxln]?ubuntu|debian|[open]*suse|gentoo|arch|slackware|fedora|mandriva|centos|pclinuxos|redhat|zenwalk|linpus)[\/\s-]?([\w\.-]+)*/i,/(hurd|linux)\s?([\w\.]+)*/i,/(gnu)\s?([\w\.]+)*/i],[p,m],[/(cros)\s[\w]+\s([\w\.]+\w)/i],[[p,"Chromium OS"],m],[/(sunos)\s?([\w\.]+\d)*/i],[[p,"Solaris"],m],[/\s([frentopc-]{0,4}bsd|dragonfly)\s?([\w\.]+)*/i],[p,m],[/(ip[honead]+)(?:.*os\s*([\w]+)*\slike\smac|;\sopera)/i],[[p,"iOS"],[m,/_/g,"."]],[/(mac\sos\sx)\s?([\w\s\.]+\w)*/i,/(macintosh|mac(?=_powerpc)\s)/i],[[p,"Mac OS"],[m,/_/g,"."]],[/((?:open)?solaris)[\/\s-]?([\w\.]+)*/i,/(haiku)\s(\w+)/i,/(aix)\s((\d)(?=\.|\)|\s)[\w\.]*)*/i,/(plan\s9|minix|beos|os\/2|amigaos|morphos|risc\sos|openvms)/i,/(unix)\s?([\w\.]+)*/i],[p,m]]},T=function(e,s){if(!(this instanceof T))return new T(e,s).getResult();var r=e||(i&&i.navigator&&i.navigator.userAgent?i.navigator.userAgent:o),n=s?y.extend(S,s):S;return this.getBrowser=function(){var i=A.rgx.apply(this,n.browser);return i.major=y.major(i.version),i},this.getCPU=function(){return A.rgx.apply(this,n.cpu)},this.getDevice=function(){return A.rgx.apply(this,n.device)},this.getEngine=function(){return A.rgx.apply(this,n.engine)},this.getOS=function(){return A.rgx.apply(this,n.os)},this.getResult=function(){return{ua:this.getUA(),browser:this.getBrowser(),engine:this.getEngine(),os:this.getOS(),device:this.getDevice(),cpu:this.getCPU()}},this.getUA=function(){return r},this.setUA=function(i){return r=i,this},this.setUA(r),this};T.VERSION=s,T.BROWSER={NAME:p,MAJOR:l,VERSION:m},T.CPU={ARCHITECTURE:f},T.DEVICE={MODEL:d,VENDOR:u,TYPE:c,CONSOLE:g,MOBILE:b,SMARTTV:v,TABLET:h,WEARABLE:x,EMBEDDED:k},T.ENGINE={NAME:p,VERSION:m},T.OS={NAME:p,VERSION:m},typeof exports!==a?(typeof module!==a&&module.exports&&(exports=module.exports=T),exports.UAParser=T):typeof define===n&&define.amd?define(function(){return T}):i.UAParser=T;var N=i.jQuery||i.Zepto;if(typeof N!==a){var z=new T;N.ua=z.getResult(),N.ua.get=function(){return z.getUA()},N.ua.set=function(i){z.setUA(i);var e=z.getResult();for(var s in e)N.ua[s]=e[s]}}}("object"==typeof window?window:this);
 /*!
 * Buttons helper for fancyBox
 * version: 1.0.5 (Mon, 15 Oct 2012)
 * @requires fancyBox v2.0 or later
 *
 * Usage:
 *     $(".fancybox").fancybox({
 *         helpers : {
 *             buttons: {
 *                 position : 'top'
 *             }
 *         }
 *     });
 *
 */
(function ($) {
	//Shortcut for fancyBox object
	var F = $.fancybox;

	//Add helper object
	F.helpers.buttons = {
		defaults : {
			skipSingle : false, // disables if gallery contains single image
			position   : 'top', // 'top' or 'bottom'
			tpl        : '<div id="fancybox-buttons"><ul><li><a class="btnPrev" title="Previous" href="javascript:;"></a></li><li><a class="btnPlay" title="Start slideshow" href="javascript:;"></a></li><li><a class="btnNext" title="Next" href="javascript:;"></a></li><li><a class="btnToggle" title="Toggle size" href="javascript:;"></a></li><li><a class="btnClose" title="Close" href="javascript:;"></a></li></ul></div>'
		},

		list : null,
		buttons: null,

		beforeLoad: function (opts, obj) {
			//Remove self if gallery do not have at least two items

			if (opts.skipSingle && obj.group.length < 2) {
				obj.helpers.buttons = false;
				obj.closeBtn = true;

				return;
			}

			//Increase top margin to give space for buttons
			obj.margin[ opts.position === 'bottom' ? 2 : 0 ] += 30;
		},

		onPlayStart: function () {
			if (this.buttons) {
				this.buttons.play.attr('title', 'Pause slideshow').addClass('btnPlayOn');
			}
		},

		onPlayEnd: function () {
			if (this.buttons) {
				this.buttons.play.attr('title', 'Start slideshow').removeClass('btnPlayOn');
			}
		},

		afterShow: function (opts, obj) {
			var buttons = this.buttons;

			if (!buttons) {
				this.list = $(opts.tpl).addClass(opts.position).appendTo('body');

				buttons = {
					prev   : this.list.find('.btnPrev').click( F.prev ),
					next   : this.list.find('.btnNext').click( F.next ),
					play   : this.list.find('.btnPlay').click( F.play ),
					toggle : this.list.find('.btnToggle').click( F.toggle ),
					close  : this.list.find('.btnClose').click( F.close )
				}
			}

			//Prev
			if (obj.index > 0 || obj.loop) {
				buttons.prev.removeClass('btnDisabled');
			} else {
				buttons.prev.addClass('btnDisabled');
			}

			//Next / Play
			if (obj.loop || obj.index < obj.group.length - 1) {
				buttons.next.removeClass('btnDisabled');
				buttons.play.removeClass('btnDisabled');

			} else {
				buttons.next.addClass('btnDisabled');
				buttons.play.addClass('btnDisabled');
			}

			this.buttons = buttons;

			this.onUpdate(opts, obj);
		},

		onUpdate: function (opts, obj) {
			var toggle;

			if (!this.buttons) {
				return;
			}

			toggle = this.buttons.toggle.removeClass('btnDisabled btnToggleOn');

			//Size toggle button
			if (obj.canShrink) {
				toggle.addClass('btnToggleOn');

			} else if (!obj.canExpand) {
				toggle.addClass('btnDisabled');
			}
		},

		beforeClose: function () {
			if (this.list) {
				this.list.remove();
			}

			this.list    = null;
			this.buttons = null;
		}
	};

}(jQuery));

/*!
 * Media helper for fancyBox
 * version: 1.0.6 (Fri, 14 Jun 2013)
 * @requires fancyBox v2.0 or later
 *
 * Usage:
 *     $(".fancybox").fancybox({
 *         helpers : {
 *             media: true
 *         }
 *     });
 *
 * Set custom URL parameters:
 *     $(".fancybox").fancybox({
 *         helpers : {
 *             media: {
 *                 youtube : {
 *                     params : {
 *                         autoplay : 0
 *                     }
 *                 }
 *             }
 *         }
 *     });
 *
 * Or:
 *     $(".fancybox").fancybox({,
 *         helpers : {
 *             media: true
 *         },
 *         youtube : {
 *             autoplay: 0
 *         }
 *     });
 *
 *  Supports:
 *
 *      Youtube
 *          http://www.youtube.com/watch?v=opj24KnzrWo
 *          http://www.youtube.com/embed/opj24KnzrWo
 *          http://youtu.be/opj24KnzrWo
 *			http://www.youtube-nocookie.com/embed/opj24KnzrWo
 *      Vimeo
 *          http://vimeo.com/40648169
 *          http://vimeo.com/channels/staffpicks/38843628
 *          http://vimeo.com/groups/surrealism/videos/36516384
 *          http://player.vimeo.com/video/45074303
 *      Metacafe
 *          http://www.metacafe.com/watch/7635964/dr_seuss_the_lorax_movie_trailer/
 *          http://www.metacafe.com/watch/7635964/
 *      Dailymotion
 *          http://www.dailymotion.com/video/xoytqh_dr-seuss-the-lorax-premiere_people
 *      Twitvid
 *          http://twitvid.com/QY7MD
 *      Twitpic
 *          http://twitpic.com/7p93st
 *      Instagram
 *          http://instagr.am/p/IejkuUGxQn/
 *          http://instagram.com/p/IejkuUGxQn/
 *      Google maps
 *          http://maps.google.com/maps?q=Eiffel+Tower,+Avenue+Gustave+Eiffel,+Paris,+France&t=h&z=17
 *          http://maps.google.com/?ll=48.857995,2.294297&spn=0.007666,0.021136&t=m&z=16
 *          http://maps.google.com/?ll=48.859463,2.292626&spn=0.000965,0.002642&t=m&z=19&layer=c&cbll=48.859524,2.292532&panoid=YJ0lq28OOy3VT2IqIuVY0g&cbp=12,151.58,,0,-15.56
 */
(function ($) {
	"use strict";

	//Shortcut for fancyBox object
	var F = $.fancybox,
		format = function( url, rez, params ) {
			params = params || '';

			if ( $.type( params ) === "object" ) {
				params = $.param(params, true);
			}

			$.each(rez, function(key, value) {
				url = url.replace( '$' + key, value || '' );
			});

			if (params.length) {
				url += ( url.indexOf('?') > 0 ? '&' : '?' ) + params;
			}

			return url;
		};

	//Add helper object
	F.helpers.media = {
		defaults : {
			youtube : {
				matcher : /(youtube\.com|youtu\.be|youtube-nocookie\.com)\/(watch\?v=|v\/|u\/|embed\/?)?(videoseries\?list=(.*)|[\w-]{11}|\?listType=(.*)&list=(.*)).*/i,
				params  : {
					autoplay    : 1,
					autohide    : 1,
					fs          : 1,
					rel         : 0,
					hd          : 1,
					wmode       : 'opaque',
					enablejsapi : 1
				},
				type : 'iframe',
				url  : '//www.youtube.com/embed/$3'
			},
			vimeo : {
				matcher : /(?:vimeo(?:pro)?.com)\/(?:[^\d]+)?(\d+)(?:.*)/,
				params  : {
					autoplay      : 1,
					hd            : 1,
					show_title    : 1,
					show_byline   : 1,
					show_portrait : 0,
					fullscreen    : 1
				},
				type : 'iframe',
				url  : '//player.vimeo.com/video/$1'
			},
			metacafe : {
				matcher : /metacafe.com\/(?:watch|fplayer)\/([\w\-]{1,10})/,
				params  : {
					autoPlay : 'yes'
				},
				type : 'swf',
				url  : function( rez, params, obj ) {
					obj.swf.flashVars = 'playerVars=' + $.param( params, true );

					return '//www.metacafe.com/fplayer/' + rez[1] + '/.swf';
				}
			},
			dailymotion : {
				matcher : /dailymotion.com\/video\/(.*)\/?(.*)/,
				params  : {
					additionalInfos : 0,
					autoStart : 1
				},
				type : 'swf',
				url  : '//www.dailymotion.com/swf/video/$1'
			},
			twitvid : {
				matcher : /twitvid\.com\/([a-zA-Z0-9_\-\?\=]+)/i,
				params  : {
					autoplay : 0
				},
				type : 'iframe',
				url  : '//www.twitvid.com/embed.php?guid=$1'
			},
			twitpic : {
				matcher : /twitpic\.com\/(?!(?:place|photos|events)\/)([a-zA-Z0-9\?\=\-]+)/i,
				type : 'image',
				url  : '//twitpic.com/show/full/$1/'
			},
			instagram : {
				matcher : /(instagr\.am|instagram\.com)\/p\/([a-zA-Z0-9_\-]+)\/?/i,
				type : 'image',
				url  : '//$1/p/$2/media/?size=l'
			},
			google_maps : {
				matcher : /maps\.google\.([a-z]{2,3}(\.[a-z]{2})?)\/(\?ll=|maps\?)(.*)/i,
				type : 'iframe',
				url  : function( rez ) {
					return '//maps.google.' + rez[1] + '/' + rez[3] + '' + rez[4] + '&output=' + (rez[4].indexOf('layer=c') > 0 ? 'svembed' : 'embed');
				}
			}
		},

		beforeLoad : function(opts, obj) {
			var url   = obj.href || '',
				type  = false,
				what,
				item,
				rez,
				params;

			for (what in opts) {
				if (opts.hasOwnProperty(what)) {
					item = opts[ what ];
					rez  = url.match( item.matcher );

					if (rez) {
						type   = item.type;
						params = $.extend(true, {}, item.params, obj[ what ] || ($.isPlainObject(opts[ what ]) ? opts[ what ].params : null));

						url = $.type( item.url ) === "function" ? item.url.call( this, rez, params, obj ) : format( item.url, rez, params );

						break;
					}
				}
			}

			if (type) {
				obj.href = url;
				obj.type = type;

				obj.autoHeight = false;
			}
		}
	};

}(jQuery));
 /*!
 * Thumbnail helper for fancyBox
 * version: 1.0.7 (Mon, 01 Oct 2012)
 * @requires fancyBox v2.0 or later
 *
 * Usage:
 *     $(".fancybox").fancybox({
 *         helpers : {
 *             thumbs: {
 *                 width  : 50,
 *                 height : 50
 *             }
 *         }
 *     });
 *
 */
(function ($) {
	//Shortcut for fancyBox object
	var F = $.fancybox;

	//Add helper object
	F.helpers.thumbs = {
		defaults : {
			width    : 50,       // thumbnail width
			height   : 50,       // thumbnail height
			position : 'bottom', // 'top' or 'bottom'
			source   : function ( item ) {  // function to obtain the URL of the thumbnail image
				var href;

				if (item.element) {
					href = $(item.element).find('img').attr('src');
				}

				if (!href && item.type === 'image' && item.href) {
					href = item.href;
				}

				return href;
			}
		},

		wrap  : null,
		list  : null,
		width : 0,

		init: function (opts, obj) {
			var that = this,
				list,
				thumbWidth  = opts.width,
				thumbHeight = opts.height,
				thumbSource = opts.source;

			//Build list structure
			list = '';

			for (var n = 0; n < obj.group.length; n++) {
				list += '<li><a style="width:' + thumbWidth + 'px;height:' + thumbHeight + 'px;" href="javascript:jQuery.fancybox.jumpto(' + n + ');"></a></li>';
			}

			this.wrap = $('<div id="fancybox-thumbs"></div>').addClass(opts.position).appendTo('body');
			this.list = $('<ul>' + list + '</ul>').appendTo(this.wrap);

			//Load each thumbnail
			$.each(obj.group, function (i) {
				var href = thumbSource( obj.group[ i ] );

				if (!href) {
					return;
				}

				$("<img />").load(function () {
					var width  = this.width,
						height = this.height,
						widthRatio, heightRatio, parent;

					if (!that.list || !width || !height) {
						return;
					}

					//Calculate thumbnail width/height and center it
					widthRatio  = width / thumbWidth;
					heightRatio = height / thumbHeight;

					parent = that.list.children().eq(i).find('a');

					if (widthRatio >= 1 && heightRatio >= 1) {
						if (widthRatio > heightRatio) {
							width  = Math.floor(width / heightRatio);
							height = thumbHeight;

						} else {
							width  = thumbWidth;
							height = Math.floor(height / widthRatio);
						}
					}

					$(this).css({
						width  : width,
						height : height,
						top    : Math.floor(thumbHeight / 2 - height / 2),
						left   : Math.floor(thumbWidth / 2 - width / 2)
					});

					parent.width(thumbWidth).height(thumbHeight);

					$(this).hide().appendTo(parent).fadeIn(300);

				}).attr('src', href);
			});

			//Set initial width
			this.width = this.list.children().eq(0).outerWidth(true);

			this.list.width(this.width * (obj.group.length + 1)).css('left', Math.floor($(window).width() * 0.5 - (obj.index * this.width + this.width * 0.5)));
		},

		beforeLoad: function (opts, obj) {
			//Remove self if gallery do not have at least two items
			if (obj.group.length < 2) {
				obj.helpers.thumbs = false;

				return;
			}

			//Increase bottom margin to give space for thumbs
			obj.margin[ opts.position === 'top' ? 0 : 2 ] += ((opts.height) + 15);
		},

		afterShow: function (opts, obj) {
			//Check if exists and create or update list
			if (this.list) {
				this.onUpdate(opts, obj);

			} else {
				this.init(opts, obj);
			}

			//Set active element
			this.list.children().removeClass('active').eq(obj.index).addClass('active');
		},

		//Center list
		onUpdate: function (opts, obj) {
			if (this.list) {
				this.list.stop(true).animate({
					'left': Math.floor($(window).width() * 0.5 - (obj.index * this.width + this.width * 0.5))
				}, 150);
			}
		},

		beforeClose: function () {
			if (this.wrap) {
				this.wrap.remove();
			}

			this.wrap  = null;
			this.list  = null;
			this.width = 0;
		}
	}

}(jQuery));