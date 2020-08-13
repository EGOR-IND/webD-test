$(function () {
    
    $("#navbarToggle").blur(function (event) {
        var screenWidth = window.innerWidth;
        if (screenWidth < 768) {
          $("#navbarSupportedContent").collapse('hide');
        }
      });
});

(function (global) {
  
  var dc = {};

  var homeHtml = "snippets/home-snippet.html";
  var categoriesTitleHtml = "snippets/categories-title-snippet.html"
  var categoryHtml = "snippets/categories-snippet.html"
  var menuItemsTitleHtml = "snippets/menu-item-title.html";
  var menuItemsHtml = "snippets/menu-item.html";
  
  var allCategoriesUrl = "https://davids-restaurant.herokuapp.com/categories.json";
  var menuItemUrl = "https://davids-restaurant.herokuapp.com/menu_items.json?category=";

  var insertHtml = function (selector, html) {
    document.querySelector(selector).innerHTML = html; 
  };

  var showLoading = function (selector) {
    var html = "<div class='text-center'><img src='images/ajax-loader.gif'></div>"
    insertHtml(selector, html);
  };

  var insertProperty = function (string, propName, propValue) {
    var propToReplace = "{{"+propName+"}}";
    string = string.replace(new RegExp(propToReplace, "g"), propValue);
    return string;
  };

  document.addEventListener("DOMContentLoaded",
    function (event) {
      dc.loadHomePage();
    });

  dc.loadHomePage = function () {
    showActive("#home-item");
    removeActive("#menu-item")
    showLoading("#main-content");

    $ajaxUtils.sendGetRequest(homeHtml,
      function (res) {
        var specials = null;
        $ajaxUtils.sendGetRequest(allCategoriesUrl, 
          function (res1) {
            specials = chooseRandomCategory(res1);
            var short_name = specials.short_name;
            res = insertProperty(res, "randomCategory", short_name);
            insertHtml("#main-content", res);
          });
      }, false);    
  };

  dc.loadMenuCategories = function () {
    showActive("#menu-item");
    removeActive("#home-item")
    showLoading("#main-content");

    $ajaxUtils.sendGetRequest(allCategoriesUrl, retrieveAndShowCategoriesHtml);
  };

  dc.loadMenuItems = function (categoryShort) {
    showLoading("#main-content");

    $ajaxUtils.sendGetRequest((menuItemUrl+categoryShort), retrieveAndShowMenuItemsHtml);
  };

  function retrieveAndShowCategoriesHtml(categories) {
    
    $ajaxUtils.sendGetRequest(categoriesTitleHtml, 
      function (categoriesTitleHtml) {
        
        $ajaxUtils.sendGetRequest(categoryHtml, 
          function (categoryHtml) {
            var categoriesHtmlString = buildCategoryHtml(categories, categoriesTitleHtml, categoryHtml);
            insertHtml("#main-content", categoriesHtmlString);
          }, false);
      }, false);
  }

  function retrieveAndShowMenuItemsHtml(items) {
    
    $ajaxUtils.sendGetRequest(menuItemsTitleHtml, 
      function (menuItemsTitleHtml) {
        
        $ajaxUtils.sendGetRequest(menuItemsHtml, 
          function (menuItemsHtml) {
            var menuItmesHtmlString = buildMenuItmesHtml(items, menuItemsTitleHtml, menuItemsHtml);
            insertHtml("#main-content", menuItmesHtmlString);
          }, false);
      }, false);
  }

  function buildCategoryHtml(categories, categoriesTitleHtml, categoryHtml) {
    var finalCatHtml = categoriesTitleHtml;
    finalCatHtml += "<section id='menu-items' class='row'>";
    for (let i = 0; i < categories.length; i++) {
      var html = categoryHtml;
      var name = categories[i].name;
      var short_name = categories[i].short_name;

      html = insertProperty(html, "name", name);
      html = insertProperty(html, "short_name", short_name);
      finalCatHtml += html;
    }
    
    finalCatHtml += "</section>"
    return finalCatHtml;
  }

  function buildMenuItmesHtml(items, menuItemsTitleHtml, menuItemsHtml) {
    menuItemsTitleHtml = insertProperty(menuItemsTitleHtml, "name", items.category.name);

    var finalMenuItemHtml = menuItemsTitleHtml;
    finalMenuItemHtml +="<section id='menu-categories-items' class='row'>";

    var menuItems = items.menu_items;
    var catShortName = items.category.short_name;
    for (let i = 0; i < menuItems.length; i++) {
      var html = menuItemsHtml;

      html = insertProperty(html, "catShortName", catShortName);
      html = insertProperty(html, "short_name", menuItems[i].short_name);
      html = insertProperty(html, "name", menuItems[i].name);
      html = insertProperty(html, "price_large", "$"+menuItems[i].price_large);
      html = insertProperty(html, "description", menuItems[i].description);

      finalMenuItemHtml += html;
    }

    finalMenuItemHtml += "</section>";
    return finalMenuItemHtml
  }

  function showActive(selectedItem) {
    var classes = document.querySelector(selectedItem).className;
    if (classes.indexOf("active") == -1) {
      classes += " active";
      document.querySelector(selectedItem).className = classes;
    }
  }

  function removeActive(disabledItem) {
    var classes = document.querySelector(disabledItem).className;
    if (classes.indexOf("active") != -1) {
      classes = classes.replace(new RegExp("active", "g"), "");
      document.querySelector(disabledItem).className = classes;
    }
  }

  function chooseRandomCategory (categories) {
    // Choose a random index into the array (from 0 inclusively until array length (exclusively))
    var randomArrayIndex = Math.floor(Math.random() * categories.length);
  
    // return category object with that randomArrayIndex
    return categories[randomArrayIndex];
  }

  global.$dc = dc;
})(window);